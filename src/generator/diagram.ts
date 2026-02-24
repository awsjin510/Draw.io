import { generateDiagramXML, type StreamCallbacks } from '../api/claude.js';
import { validateDrawioXML } from '../validator/xml-validator.js';

export interface GenerateOptions {
  description: string;
  type?: string;
  callbacks?: StreamCallbacks;
}

const MAX_RETRIES = 2;

export async function generateDiagram(options: GenerateOptions): Promise<{
  xml: string;
  valid: boolean;
  errors: string[];
  attempts: number;
}> {
  const { description, type, callbacks } = options;

  const typeHint = type && type !== 'web-app'
    ? `\n\nArchitecture type: ${type}`
    : '';

  const userPrompt = description + typeHint;

  let xml = await generateDiagramXML(userPrompt, callbacks);
  let validation = await validateDrawioXML(xml);
  let attempts = 1;

  while (!validation.valid && attempts <= MAX_RETRIES) {
    const retryContext = `The previously generated XML has the following validation errors:\n\n${validation.errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nPlease fix these errors and regenerate the complete draw.io XML. Remember:\n- Output ONLY valid XML, no explanatory text\n- Ensure all mxCell IDs are unique\n- Ensure all edge source/target reference existing cell IDs\n- Include VPC, ALB or Internet Gateway\n- Keep diagram width under 3000px\n\nOriginal request: ${description}`;

    xml = await generateDiagramXML(userPrompt, callbacks, retryContext);
    validation = await validateDrawioXML(xml);
    attempts++;
  }

  return {
    xml,
    valid: validation.valid,
    errors: validation.errors,
    attempts,
  };
}
