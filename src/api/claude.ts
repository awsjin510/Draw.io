import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GenerateOptions {
  verbose?: boolean;
  onProgress?: (char: string) => void;
}

/**
 * Call Claude API with streaming to generate draw.io XML.
 * Uses adaptive thinking to produce better-structured architecture diagrams.
 * Only collects text blocks (not thinking blocks) as the XML output.
 */
export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const { verbose = false, onProgress } = options;

  if (verbose) {
    process.stderr.write('[Claude] Starting XML generation...\n');
  }

  let xmlOutput = '';
  let isInTextBlock = false;

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32000,
    thinking: { type: 'enabled', budget_tokens: 10000 },
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  for await (const event of stream) {
    switch (event.type) {
      case 'content_block_start':
        isInTextBlock = event.content_block.type === 'text';
        if (verbose && event.content_block.type === 'thinking') {
          process.stderr.write('[Claude] Thinking about architecture...\n');
        }
        break;

      case 'content_block_delta':
        if (isInTextBlock && event.delta.type === 'text_delta') {
          xmlOutput += event.delta.text;
          if (onProgress) {
            onProgress(event.delta.text);
          } else if (verbose) {
            process.stderr.write('.');
          }
        }
        break;

      case 'content_block_stop':
        isInTextBlock = false;
        break;
    }
  }

  if (verbose) {
    process.stderr.write('\n[Claude] Generation complete.\n');
  }

  return xmlOutput;
}

/**
 * Call Claude API with a correction prompt when initial XML fails validation.
 * Includes the original output and the validation error for Claude to fix.
 */
export async function generateCorrectionWithClaude(
  systemPrompt: string,
  originalPrompt: string,
  invalidXml: string,
  errorMessage: string,
  options: GenerateOptions = {}
): Promise<string> {
  const correctionPrompt = `你之前產生的 draw.io XML 有以下問題，請修正後重新輸出完整 XML：

問題：${errorMessage}

你之前的輸出（有問題的版本）：
${invalidXml}

原始需求：
${originalPrompt}

請直接輸出修正後的完整 XML，不要包含任何說明文字。`;

  return generateWithClaude(systemPrompt, correctionPrompt, options);
}
