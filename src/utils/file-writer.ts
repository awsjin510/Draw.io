import fs from 'node:fs';
import path from 'node:path';

export async function writeDrawioFile(xml: string, outputPath: string): Promise<string> {
  const absolutePath = path.resolve(outputPath);
  const dir = path.dirname(absolutePath);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(absolutePath, xml, 'utf-8');

  return absolutePath;
}
