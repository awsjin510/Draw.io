import { describe, it, expect } from 'vitest';
import { getSystemPrompt, getListServicesPrompt } from '../system-prompt.js';

describe('getSystemPrompt', () => {
  it('should contain AWS Well-Architected Framework sections', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain('Well-Architected');
    expect(prompt).toContain('Security');
    expect(prompt).toContain('Reliability');
    expect(prompt).toContain('Cost Optimization');
  });

  it('should contain layout rules', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain('Layout Rules');
    expect(prompt).toContain('Internet');
    expect(prompt).toContain('Public Subnet');
    expect(prompt).toContain('Private Subnet');
  });

  it('should contain mxgraph.aws4 references', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain('mxgraph.aws4');
  });

  it('should contain XML root structure', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain('mxfile');
    expect(prompt).toContain('mxGraphModel');
    expect(prompt).toContain('mxCell');
  });

  it('should contain connection styles', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain('Connection Styles');
    expect(prompt).toContain('endArrow=classic');
    expect(prompt).toContain('dashed');
  });

  it('should contain shape references from shapes.ts', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain('resIcon=mxgraph.aws4.ec2');
    expect(prompt).toContain('resIcon=mxgraph.aws4.rds');
  });

  it('should contain group styles', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toContain('group_vpc');
    expect(prompt).toContain('group_public_subnet');
    expect(prompt).toContain('group_private_subnet');
  });
});

describe('getListServicesPrompt', () => {
  it('should instruct JSON array output', () => {
    const prompt = getListServicesPrompt();
    expect(prompt).toContain('JSON array');
    expect(prompt).toContain('service');
    expect(prompt).toContain('reason');
  });
});
