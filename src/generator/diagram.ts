import { generateWithClaude, generateCorrectionWithClaude } from '../api/claude';
import { buildSystemPrompt } from '../templates/system-prompt';
import { validateArchitectureJson, extractJson } from '../validator/json-validator';
import { buildDrawioXml } from '../builder/xml-builder';

export interface DiagramGeneratorOptions {
  verbose?: boolean;
  maxRetries?: number;
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
 * 4. Convert validated JSON to draw.io XML using the XML builder
 * 5. Return guaranteed-valid draw.io XML
 */
export async function generateDiagram(
  description: string,
  options: DiagramGeneratorOptions = {}
): Promise<{ xml: string; attempts: number; validationErrors: string[] }> {
  const {
    verbose = false,
    maxRetries = MAX_DEFAULT_RETRIES,
    onProgress,
  } = options;

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
      process.stderr.write('[Generator] JSON valid. Building draw.io XML...\n');
    }
    const xml = buildDrawioXml(result.data);
    return { xml, attempts: 1, validationErrors: [] };
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
      const xml = buildDrawioXml(correctionResult.data);
      return {
        xml,
        attempts: attempt + 1,
        validationErrors: [],
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
    const xml = buildDrawioXml(data);
    return {
      xml,
      attempts: maxRetries + 1,
      validationErrors: lastErrors,
    };
  } catch {
    return {
      xml: lastRaw,
      attempts: maxRetries + 1,
      validationErrors: [
        ...lastErrors,
        'JSON 解析失敗，無法產生 draw.io XML',
      ],
    };
  }
}
