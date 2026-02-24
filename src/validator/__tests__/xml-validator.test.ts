import { describe, it, expect } from 'vitest';
import { validateDrawioXML } from '../xml-validator.js';

const validXml = `<mxfile host="app.diagrams.net">
  <diagram name="AWS Architecture" id="test">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2800" pageHeight="2000" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="vpc-1" value="VPC" style="shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#8C4FFF;fillColor=#F4EBFF;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="800" height="600" as="geometry"/>
        </mxCell>
        <mxCell id="igw-1" value="Internet Gateway" style="resIcon=mxgraph.aws4.internet_gateway" vertex="1" parent="1">
          <mxGeometry x="400" y="20" width="60" height="60" as="geometry"/>
        </mxCell>
        <mxCell id="conn-1" value="HTTPS" style="endArrow=classic;" edge="1" source="igw-1" target="vpc-1" parent="1">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

describe('validateDrawioXML', () => {
  it('should pass valid XML with VPC and IGW', async () => {
    const result = await validateDrawioXML(validXml);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail on invalid XML syntax', async () => {
    const result = await validateDrawioXML('<mxfile><unclosed');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('XML syntax error'))).toBe(true);
  });

  it('should fail when missing mxfile root element', async () => {
    const result = await validateDrawioXML('<root><child/></root>');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('mxfile'))).toBe(true);
  });

  it('should fail when missing diagram element', async () => {
    const result = await validateDrawioXML('<mxfile><notdiagram/></mxfile>');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('diagram'))).toBe(true);
  });

  it('should fail when missing VPC', async () => {
    const noVpcXml = validXml.replace('group_vpc', 'some_other_group');
    const result = await validateDrawioXML(noVpcXml);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('VPC'))).toBe(true);
  });

  it('should fail when missing ALB/IGW/API Gateway', async () => {
    const noEntryXml = validXml.replace('internet_gateway', 'some_other_service');
    const result = await validateDrawioXML(noEntryXml);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('entry point'))).toBe(true);
  });

  it('should detect duplicate IDs', async () => {
    const dupXml = validXml.replace('id="igw-1"', 'id="vpc-1"');
    const result = await validateDrawioXML(dupXml);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
  });

  it('should detect edges with non-existent source', async () => {
    const badEdgeXml = validXml.replace('source="igw-1"', 'source="nonexistent"');
    const result = await validateDrawioXML(badEdgeXml);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('non-existent source'))).toBe(true);
  });

  it('should detect edges with non-existent target', async () => {
    const badEdgeXml = validXml.replace('target="vpc-1"', 'target="nonexistent"');
    const result = await validateDrawioXML(badEdgeXml);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('non-existent target'))).toBe(true);
  });

  it('should detect elements exceeding 3000px width', async () => {
    const wideXml = validXml.replace('x="100" y="100" width="800"', 'x="2500" y="100" width="800"');
    const result = await validateDrawioXML(wideXml);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('3000px'))).toBe(true);
  });

  it('should pass when width is exactly at limit', async () => {
    const exactXml = validXml.replace('x="100" y="100" width="800"', 'x="2200" y="100" width="800"');
    const result = await validateDrawioXML(exactXml);
    expect(result.valid).toBe(true);
  });

  it('should report multiple errors simultaneously', async () => {
    const multiErrorXml = validXml
      .replace('group_vpc', 'some_group')
      .replace('internet_gateway', 'some_service');
    const result = await validateDrawioXML(multiErrorXml);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
