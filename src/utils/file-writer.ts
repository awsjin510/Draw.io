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
 * Write diagram content to a file.
 * Returns the absolute path of the written file.
 */
export function writeDiagramFile(content: string, filename: string, extension: string = '.drawio'): string {
  ensureOutputDir();

  // Ensure the filename ends with the correct extension
  const baseName = filename.endsWith(extension) ? filename : `${filename}${extension}`;

  // Sanitize filename: remove path traversal characters
  const safeName = path.basename(baseName);
  if (!safeName || safeName === '.' || safeName === '..') {
    throw new Error(`Invalid output filename: ${filename}`);
  }

  const outputPath = path.join(OUTPUT_DIR, safeName);
  fs.writeFileSync(outputPath, content, 'utf-8');
  return outputPath;
}

/** @deprecated Use writeDiagramFile instead */
export function writeDrawioFile(xml: string, filename: string): string {
  return writeDiagramFile(xml, filename, '.drawio');
}

/**
 * Generate a timestamped filename for the output file (without extension).
 */
export function generateFilename(prefix = 'aws-diagram'): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  return `${prefix}-${timestamp}`;
}
