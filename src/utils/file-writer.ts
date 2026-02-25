import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

/**
 * Ensure the output directory exists.
 */
function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Write the generated draw.io XML to a .drawio file.
 * Returns the absolute path of the written file.
 */
export function writeDrawioFile(xml: string, filename: string): string {
  ensureOutputDir();

  // Ensure the filename ends with .drawio
  const baseName = filename.endsWith('.drawio') ? filename : `${filename}.drawio`;

  // Sanitize filename: remove path traversal characters
  const safeName = path.basename(baseName);
  if (!safeName || safeName === '.' || safeName === '..') {
    throw new Error(`Invalid output filename: ${filename}`);
  }

  const outputPath = path.join(OUTPUT_DIR, safeName);
  fs.writeFileSync(outputPath, xml, 'utf-8');
  return outputPath;
}

/**
 * Generate a timestamped filename for the output file.
 */
export function generateFilename(prefix = 'aws-diagram'): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  return `${prefix}-${timestamp}.drawio`;
}
