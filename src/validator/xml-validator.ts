import { parseStringPromise } from 'xml2js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function validateDrawioXML(xml: string): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. Parse XML
  let parsed: any;
  try {
    parsed = await parseStringPromise(xml, { explicitArray: true });
  } catch (e: any) {
    return { valid: false, errors: [`XML syntax error: ${e.message}`] };
  }

  // 2. Check root structure: mxfile > diagram > mxGraphModel > root
  if (!parsed.mxfile) {
    errors.push('Missing root <mxfile> element');
    return { valid: false, errors };
  }

  const diagrams = parsed.mxfile.diagram;
  if (!diagrams || diagrams.length === 0) {
    errors.push('Missing <diagram> element inside <mxfile>');
    return { valid: false, errors };
  }

  const graphModel = diagrams[0].mxGraphModel;
  if (!graphModel || graphModel.length === 0) {
    errors.push('Missing <mxGraphModel> element inside <diagram>');
    return { valid: false, errors };
  }

  const root = graphModel[0].root;
  if (!root || root.length === 0) {
    errors.push('Missing <root> element inside <mxGraphModel>');
    return { valid: false, errors };
  }

  const cells = root[0].mxCell || [];

  // 3. Collect all cell IDs
  const cellIds = new Set<string>();
  const duplicateIds: string[] = [];

  for (const cell of cells) {
    const id = cell.$.id;
    if (cellIds.has(id)) {
      duplicateIds.push(id);
    }
    cellIds.add(id);
  }

  if (duplicateIds.length > 0) {
    errors.push(`Duplicate mxCell IDs found: ${duplicateIds.join(', ')}`);
  }

  // 4. Check for VPC container
  const hasVpc = cells.some((cell: any) => {
    const style = cell.$.style || '';
    return style.includes('group_vpc');
  });

  if (!hasVpc) {
    errors.push('Missing VPC container (no mxCell with group_vpc style found)');
  }

  // 5. Check for ALB, Internet Gateway, or API Gateway (entry points)
  const hasEntryPoint = cells.some((cell: any) => {
    const style = cell.$.style || '';
    return style.includes('application_load_balancer')
      || style.includes('internet_gateway')
      || style.includes('api_gateway');
  });

  if (!hasEntryPoint) {
    errors.push('Missing entry point (no ALB, Internet Gateway, or API Gateway found)');
  }

  // 6. Validate edge connections
  for (const cell of cells) {
    const attrs = cell.$;
    if (attrs.edge === '1') {
      const source = attrs.source;
      const target = attrs.target;

      if (source && !cellIds.has(source)) {
        errors.push(`Edge "${attrs.id}" references non-existent source: "${source}"`);
      }
      if (target && !cellIds.has(target)) {
        errors.push(`Edge "${attrs.id}" references non-existent target: "${target}"`);
      }
    }
  }

  // 7. Check diagram width (max 3000px)
  for (const cell of cells) {
    const geometry = cell.mxGeometry;
    if (geometry && geometry.length > 0) {
      const geo = geometry[0].$;
      if (geo) {
        const x = parseFloat(geo.x || '0');
        const width = parseFloat(geo.width || '0');
        if (x + width > 3000) {
          errors.push(`Element "${cell.$.id}" extends beyond 3000px width (x=${x}, width=${width}, total=${x + width})`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
