import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { writeDrawioFile } from '../file-writer.js';

const testOutputDir = '/tmp/aws-diagram-test-output';
const testXml = '<mxfile><diagram><mxGraphModel><root></root></mxGraphModel></diagram></mxfile>';

afterEach(() => {
  // Clean up test files
  if (fs.existsSync(testOutputDir)) {
    fs.rmSync(testOutputDir, { recursive: true, force: true });
  }
});

describe('writeDrawioFile', () => {
  it('should write file to specified path', async () => {
    const outputPath = path.join(testOutputDir, 'test.drawio');
    const result = await writeDrawioFile(testXml, outputPath);
    expect(fs.existsSync(result)).toBe(true);
    const content = fs.readFileSync(result, 'utf-8');
    expect(content).toBe(testXml);
  });

  it('should create parent directory if it does not exist', async () => {
    const outputPath = path.join(testOutputDir, 'nested', 'dir', 'test.drawio');
    const result = await writeDrawioFile(testXml, outputPath);
    expect(fs.existsSync(result)).toBe(true);
  });

  it('should return absolute path', async () => {
    const outputPath = path.join(testOutputDir, 'test.drawio');
    const result = await writeDrawioFile(testXml, outputPath);
    expect(path.isAbsolute(result)).toBe(true);
  });
});
