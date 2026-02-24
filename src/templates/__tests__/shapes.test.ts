import { describe, it, expect } from 'vitest';
import { AWS_SHAPES, AWS_GROUP_STYLES, getShapeStyle, formatShapeReference } from '../shapes.js';

describe('AWS_SHAPES', () => {
  it('should contain all 23+ required services', () => {
    const requiredServices = [
      'ec2', 'rds', 's3', 'lambda', 'cloudfront', 'alb', 'nlb',
      'api_gateway', 'dynamodb', 'elasticache', 'sqs', 'sns',
      'ecs', 'eks', 'cloudwatch', 'iam', 'waf', 'route53',
      'nat_gateway', 'internet_gateway', 'cognito', 'secrets_manager',
      'cloudtrail', 'aurora',
    ];
    for (const svc of requiredServices) {
      expect(AWS_SHAPES[svc], `Missing service: ${svc}`).toBeDefined();
    }
  });

  it('should have required fields for each service', () => {
    for (const [key, shape] of Object.entries(AWS_SHAPES)) {
      expect(shape.id, `${key} missing id`).toBeDefined();
      expect(shape.label, `${key} missing label`).toBeDefined();
      expect(shape.resIcon, `${key} missing resIcon`).toBeDefined();
      expect(shape.fillColor, `${key} missing fillColor`).toBeDefined();
      expect(shape.category, `${key} missing category`).toBeDefined();
    }
  });

  it('should have resIcon starting with mxgraph.aws4.', () => {
    for (const [key, shape] of Object.entries(AWS_SHAPES)) {
      expect(shape.resIcon, `${key} resIcon should start with mxgraph.aws4.`).toMatch(/^mxgraph\.aws4\./);
    }
  });

  it('should have valid hex fill colors', () => {
    for (const [key, shape] of Object.entries(AWS_SHAPES)) {
      expect(shape.fillColor, `${key} fillColor should be hex`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('AWS_GROUP_STYLES', () => {
  it('should contain VPC, subnet, region, and AZ styles', () => {
    expect(AWS_GROUP_STYLES.vpc).toBeDefined();
    expect(AWS_GROUP_STYLES.publicSubnet).toBeDefined();
    expect(AWS_GROUP_STYLES.privateSubnet).toBeDefined();
    expect(AWS_GROUP_STYLES.isolatedSubnet).toBeDefined();
    expect(AWS_GROUP_STYLES.region).toBeDefined();
    expect(AWS_GROUP_STYLES.az).toBeDefined();
  });

  it('should have VPC style with group_vpc', () => {
    expect(AWS_GROUP_STYLES.vpc.style).toContain('group_vpc');
  });
});

describe('getShapeStyle', () => {
  it('should return valid style string for known service', () => {
    const style = getShapeStyle('ec2');
    expect(style).toContain('resIcon=mxgraph.aws4.ec2');
    expect(style).toContain('fillColor=#ED7515');
  });

  it('should return empty string for unknown service', () => {
    const style = getShapeStyle('nonexistent');
    expect(style).toBe('');
  });
});

describe('formatShapeReference', () => {
  it('should return a string listing all services', () => {
    const ref = formatShapeReference();
    expect(ref).toContain('EC2');
    expect(ref).toContain('RDS');
    expect(ref).toContain('Lambda');
    expect(ref).toContain('resIcon=');
  });
});
