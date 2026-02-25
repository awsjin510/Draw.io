import { generateWithClaude, generateCorrectionWithClaude } from '../api/claude';
import { buildSystemPrompt } from '../templates/system-prompt';
import { autoFixXml, validateXml } from '../validator/xml-validator';

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
 * Can optionally specify an architecture type for additional context.
 */
export function buildUserPrompt(
  description: string,
  archType?: string
): string {
  const typeHint = archType
    ? `架構類型：${archType}\n\n`
    : '';

  return `${typeHint}請為以下需求產生 draw.io XML 架構圖：

${description}

要求：
- 依照 AWS Well-Architected Framework 六大支柱設計
- 多 AZ 部署（至少 2 個可用區）
- 正確的網路分層（Public / Private / Isolated Subnet）
- 只輸出 XML，不含任何說明文字`;
}

/**
 * Generate an AWS architecture diagram from a natural language description.
 *
 * Flow:
 * 1. Call Claude API with streaming to get raw XML
 * 2. Auto-fix the XML (extract from fences, fix points coordinates)
 * 3. Validate the fixed XML
 * 4. If validation fails, send correction prompt and retry
 * 5. Return the best valid XML
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

  let lastXml = '';
  let lastErrors: string[] = [];

  // Initial generation
  if (verbose) {
    process.stderr.write('[Generator] Calling Claude API...\n');
  }

  const rawXml = await generateWithClaude(systemPrompt, userPrompt, {
    verbose,
    onProgress,
  });

  // Auto-fix: strip code fences and fix invalid point coordinates
  lastXml = autoFixXml(rawXml);

  if (verbose) {
    process.stderr.write('[Generator] Running XML validation...\n');
  }

  const result = await validateXml(lastXml);

  if (result.valid) {
    return { xml: lastXml, attempts: 1, validationErrors: [] };
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
      lastXml,
      `- ${errorSummary}`,
      { verbose, onProgress }
    );

    lastXml = autoFixXml(correctedRaw);

    const correctionResult = await validateXml(lastXml);

    if (correctionResult.valid) {
      if (verbose) {
        process.stderr.write(
          `[Generator] Correction succeeded on attempt ${attempt + 1}.\n`
        );
      }
      return {
        xml: lastXml,
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

  // Return best effort XML even if not fully valid
  if (verbose) {
    process.stderr.write(
      '[Generator] Returning best-effort XML with remaining validation issues.\n'
    );
  }

  return {
    xml: lastXml,
    attempts: maxRetries + 1,
    validationErrors: lastErrors,
  };
}
