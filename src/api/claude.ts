import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt, getListServicesPrompt } from '../templates/system-prompt.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL = 'claude-sonnet-4-5-20250514';
const MAX_TOKENS = 16000;

function loadExamples(): string {
  const examplesDir = path.join(__dirname, '..', 'templates', 'examples');

  // In compiled output, examples are not copied. Try source dir first, then fallback.
  const dirs = [
    examplesDir,
    path.join(__dirname, '..', '..', 'src', 'templates', 'examples'),
  ];

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml'));
      if (files.length === 0) continue;

      const examples = files.map(file => {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const name = path.basename(file, '.xml').replace(/-/g, ' ');
        return `### Example: ${name}\n\`\`\`xml\n${content}\n\`\`\``;
      });

      return '\n\n## Few-Shot Examples\n\nHere are reference examples of valid draw.io AWS architecture diagrams:\n\n' + examples.join('\n\n');
    }
  }

  return '';
}

function extractXml(response: string): string {
  // If the response is wrapped in markdown code blocks, extract just the XML
  const xmlBlockMatch = response.match(/```xml\s*\n([\s\S]*?)\n```/);
  if (xmlBlockMatch) {
    return xmlBlockMatch[1].trim();
  }

  // If wrapped in generic code blocks
  const codeBlockMatch = response.match(/```\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find XML directly
  const mxfileMatch = response.match(/<mxfile[\s\S]*<\/mxfile>/);
  if (mxfileMatch) {
    return mxfileMatch[0].trim();
  }

  // Return as-is
  return response.trim();
}

export interface StreamCallbacks {
  onStart?: () => void;
  onProgress?: (charCount: number) => void;
  onComplete?: () => void;
}

export async function generateDiagramXML(
  userPrompt: string,
  callbacks?: StreamCallbacks,
  retryContext?: string,
): Promise<string> {
  const client = new Anthropic();
  const systemPrompt = getSystemPrompt() + loadExamples();

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userPrompt },
  ];

  if (retryContext) {
    messages.push(
      { role: 'assistant', content: 'I will generate the corrected draw.io XML.' },
      { role: 'user', content: retryContext },
    );
  }

  callbacks?.onStart?.();

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  let fullResponse = '';

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullResponse += event.delta.text;
      callbacks?.onProgress?.(fullResponse.length);
    }
  }

  callbacks?.onComplete?.();

  return extractXml(fullResponse);
}

export async function listServices(userPrompt: string): Promise<string> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: getListServicesPrompt(),
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock ? textBlock.text : '[]';
}
