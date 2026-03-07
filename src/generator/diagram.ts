import { generateWithClaude, generateCorrectionWithClaude } from '../api/claude';
import { buildSystemPrompt } from '../templates/system-prompt';
import { validateArchitectureJson, extractJson } from '../validator/json-validator';
import { buildDrawioXml, buildErrorDiagram, BuildXmlOptions } from '../builder/xml-builder';
import { buildPlantUml } from '../builder/plantuml-builder';
import { validateXml } from '../validator/xml-validator';
import { ArchitectureDiagram } from '../types/architecture';

export type OutputFormat = 'drawio' | 'plantuml';

export interface DiagramGeneratorOptions {
  verbose?: boolean;
  maxRetries?: number;
  /** Use compressed format for drawio (default: true). */
  compressed?: boolean;
  /** Output format: 'drawio' or 'plantuml' (default: 'plantuml') */
  outputFormat?: OutputFormat;
  onProgress?: (text: string) => void;
}

export interface GenerationResult {
  xml: string;
  outputPath: string;
  attempts: number;
  validationErrors: string[];
}

const MAX_DEFAULT_RETRIES = 2;

/**
 * Build diagram output from architecture data.
 * For drawio: builds XML and validates. For plantuml: builds text (no validation needed).
 */
async function buildDiagramOutput(
  data: ArchitectureDiagram,
  verbose: boolean,
  outputFormat: OutputFormat,
  xmlOptions?: BuildXmlOptions
): Promise<{ output: string; warnings: string[] }> {
  if (outputFormat === 'plantuml') {
    const output = buildPlantUml(data);
    if (verbose) {
      process.stderr.write('[Generator] PlantUML output generated.\n');
    }
    return { output, warnings: [] };
  }

  // drawio format
  const xml = buildDrawioXml(data, xmlOptions);
  const warnings: string[] = [];

  const validation = await validateXml(xml);
  if (!validation.valid) {
    if (verbose) {
      process.stderr.write('[Generator] XML validation warnings:\n');
      for (const err of validation.errors) {
        process.stderr.write(`  - ${err}\n`);
      }
    }
    warnings.push(...validation.errors);
  } else if (verbose) {
    process.stderr.write('[Generator] XML validation passed.\n');
  }

  return { output: xml, warnings };
}

/**
 * Build the user prompt for diagram generation.
 */
export function buildUserPrompt(
  description: string,
  archType?: string
): string {
  const typeHint = archType
    ? `架構類型：${archType}\n\n`
    : '';

  return `${typeHint}請為以下需求產生架構 JSON：

${description}

要求：
- 依照 AWS Well-Architected Framework 六大支柱設計
- 多 AZ 部署（至少 2 個可用區）
- 正確的網路分層（Public / Private / Isolated Subnet）
- 只輸出 JSON，不含任何說明文字`;
}

/**
 * Generate an AWS architecture diagram from a natural language description.
 *
 * Flow:
 * 1. Call Claude API to get architecture JSON
 * 2. Validate the JSON structure and references
 * 3. If validation fails, send correction prompt and retry
 * 4. Convert validated JSON to diagram output (PlantUML or draw.io XML)
 * 5. Return diagram content
 */
export async function generateDiagram(
  description: string,
  options: DiagramGeneratorOptions = {}
): Promise<{ output: string; attempts: number; validationErrors: string[] }> {
  const {
    verbose = false,
    maxRetries = MAX_DEFAULT_RETRIES,
    compressed = true,
    outputFormat = 'plantuml',
    onProgress,
  } = options;

  const xmlOptions: BuildXmlOptions = { compressed };

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(description);

  let lastRaw = '';
  let lastErrors: string[] = [];

  // Initial generation
  if (verbose) {
    process.stderr.write('[Generator] Calling Claude API for architecture JSON...\n');
  }

  lastRaw = await generateWithClaude(systemPrompt, userPrompt, {
    verbose,
    onProgress,
  });

  if (verbose) {
    process.stderr.write('[Generator] Validating JSON structure...\n');
  }

  const result = validateArchitectureJson(lastRaw);

  if (result.valid && result.data) {
    if (verbose) {
      process.stderr.write(`[Generator] JSON valid. Building ${outputFormat} output...\n`);
    }
    const { output, warnings } = await buildDiagramOutput(result.data, verbose, outputFormat, xmlOptions);
    return { output, attempts: 1, validationErrors: warnings };
  }

  lastErrors = result.errors;

  if (verbose) {
    process.stderr.write(
      `[Generator] Validation failed with ${lastErrors.length} error(s):\n`
    );
    for (const err of lastErrors) {
      process.stderr.write(`  - ${err}\n`);
    }
  }

  // Retry loop with correction prompts
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (verbose) {
      process.stderr.write(
        `[Generator] Retry ${attempt}/${maxRetries} — sending correction prompt...\n`
      );
    }

    const errorSummary = lastErrors.join('\n- ');
    const correctedRaw = await generateCorrectionWithClaude(
      systemPrompt,
      userPrompt,
      lastRaw,
      `- ${errorSummary}`,
      { verbose, onProgress }
    );

    lastRaw = correctedRaw;
    const correctionResult = validateArchitectureJson(lastRaw);

    if (correctionResult.valid && correctionResult.data) {
      if (verbose) {
        process.stderr.write(
          `[Generator] Correction succeeded on attempt ${attempt + 1}. Building draw.io XML...\n`
        );
      }
      const { output, warnings } = await buildDiagramOutput(correctionResult.data, verbose, outputFormat, xmlOptions);
      return {
        output,
        attempts: attempt + 1,
        validationErrors: warnings,
      };
    }

    lastErrors = correctionResult.errors;

    if (verbose) {
      process.stderr.write(
        `[Generator] Correction attempt ${attempt} still has ${lastErrors.length} error(s).\n`
      );
    }
  }

  // Best effort: try to parse and build even with errors
  if (verbose) {
    process.stderr.write(
      '[Generator] Max retries reached. Attempting best-effort build...\n'
    );
  }

  try {
    const jsonStr = extractJson(lastRaw);
    const data = JSON.parse(jsonStr);
    const { output, warnings } = await buildDiagramOutput(data, verbose, outputFormat, xmlOptions);
    return {
      output,
      attempts: maxRetries + 1,
      validationErrors: [...lastErrors, ...warnings],
    };
  } catch (err) {
    if (verbose) {
      process.stderr.write(`[Generator] Best-effort build failed: ${(err as Error).message}\n`);
    }
    // Fallback error output
    if (outputFormat === 'plantuml') {
      return {
        output: `@startuml Error\nnote "JSON 解析失敗，無法產生架構圖。請重試。" as N1\n@enduml`,
        attempts: maxRetries + 1,
        validationErrors: [...lastErrors, 'JSON 解析失敗'],
      };
    }
    const errorXml = buildErrorDiagram('JSON 解析失敗，無法產生架構圖。請重試。', xmlOptions);
    return {
      output: errorXml,
      attempts: maxRetries + 1,
      validationErrors: [...lastErrors, 'JSON 解析失敗，無法產生 draw.io XML'],
    };
  }
}
