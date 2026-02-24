import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDrawioXML } from '../../../validator/xml-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const examplesDir = path.join(__dirname, '..');

const exampleFiles = ['three-tier-web.xml', 'serverless-api.xml', 'microservices.xml'];

describe('Few-shot examples', () => {
  for (const file of exampleFiles) {
    describe(file, () => {
      let xml: string;

      it('should exist and be readable', () => {
        const filePath = path.join(examplesDir, file);
        xml = fs.readFileSync(filePath, 'utf-8');
        expect(xml.length).toBeGreaterThan(0);
      });

      it('should pass XML validation', async () => {
        const filePath = path.join(examplesDir, file);
        xml = fs.readFileSync(filePath, 'utf-8');
        const result = await validateDrawioXML(xml);
        expect(result.valid, `Validation errors: ${result.errors.join('; ')}`).toBe(true);
      });

      it('should contain VPC', () => {
        const filePath = path.join(examplesDir, file);
        xml = fs.readFileSync(filePath, 'utf-8');
        expect(xml).toContain('group_vpc');
      });

      it('should contain entry point (ALB, IGW, or API Gateway)', () => {
        const filePath = path.join(examplesDir, file);
        xml = fs.readFileSync(filePath, 'utf-8');
        const hasEntryPoint = xml.includes('application_load_balancer')
          || xml.includes('internet_gateway')
          || xml.includes('api_gateway');
        expect(hasEntryPoint).toBe(true);
      });

      it('should contain at least 2 AZs', () => {
        const filePath = path.join(examplesDir, file);
        xml = fs.readFileSync(filePath, 'utf-8');
        const azMatches = xml.match(/Availability Zone/g);
        expect(azMatches?.length).toBeGreaterThanOrEqual(2);
      });
    });
  }

  it('three-tier-web should contain EC2 and RDS', () => {
    const xml = fs.readFileSync(path.join(examplesDir, 'three-tier-web.xml'), 'utf-8');
    expect(xml).toContain('mxgraph.aws4.ec2');
    expect(xml).toContain('mxgraph.aws4.rds');
  });

  it('serverless-api should contain Lambda and DynamoDB', () => {
    const xml = fs.readFileSync(path.join(examplesDir, 'serverless-api.xml'), 'utf-8');
    expect(xml).toContain('mxgraph.aws4.lambda');
    expect(xml).toContain('mxgraph.aws4.dynamodb');
  });

  it('microservices should contain ECS and SQS', () => {
    const xml = fs.readFileSync(path.join(examplesDir, 'microservices.xml'), 'utf-8');
    expect(xml).toContain('mxgraph.aws4.ecs');
    expect(xml).toContain('mxgraph.aws4.sqs');
  });
});
