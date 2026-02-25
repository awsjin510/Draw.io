import { parseStringPromise } from 'xml2js';
import { STANDARD_CONTAINER_POINTS } from '../templates/shapes';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  fixedXml?: string;
}

/**
 * Parses a draw.io style string (semicolon-separated key=value pairs)
 * into a Map<string, string>.
 *
 * Example: "shape=foo;fillColor=#fff;points=[[0,0],[1,0]]"
 * → { shape: "foo", fillColor: "#fff", points: "[[0,0],[1,0]]" }
 *
 * Note: the points value can contain commas inside brackets, but NOT semicolons,
 * so splitting by ';' is safe.
 */
function parseStyle(style: string): Map<string, string> {
  const props = new Map<string, string>();
  for (const part of style.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      props.set(trimmed, '');
    } else {
      props.set(trimmed.slice(0, eqIdx), trimmed.slice(eqIdx + 1));
    }
  }
  return props;
}

function serializeStyle(props: Map<string, string>): string {
  const parts: string[] = [];
  for (const [k, v] of props) {
    parts.push(v === '' ? k : `${k}=${v}`);
  }
  return parts.join(';');
}

/**
 * Fix the points attribute in a draw.io style string.
 *
 * Root cause of "point generation error":
 * When Claude generates points=[[x,y],...], coordinates may be:
 *   - Outside [0,1] range (e.g., -0.1, 1.5)
 *   - NaN or non-numeric
 *   - Malformed JSON arrays
 *   - Missing entirely for container shapes
 *
 * This function clamps all coordinates to [0,1], removes NaN entries,
 * and falls back to the standard 16-point array if the result is empty.
 */
export function fixPointsInStyle(style: string): string {
  const props = parseStyle(style);

  if (!props.has('points')) {
    return style; // no points attribute to fix
  }

  const pointsStr = props.get('points')!;
  let fixed: string;

  try {
    const parsed = JSON.parse(pointsStr);

    if (!Array.isArray(parsed)) {
      fixed = STANDARD_CONTAINER_POINTS;
    } else {
      const validPoints = parsed
        .filter(
          (p): p is [number, number] =>
            Array.isArray(p) &&
            p.length === 2 &&
            typeof p[0] === 'number' &&
            typeof p[1] === 'number' &&
            !isNaN(p[0]) &&
            !isNaN(p[1])
        )
        .map(([x, y]): [number, number] => [
          Math.max(0, Math.min(1, x)),
          Math.max(0, Math.min(1, y)),
        ]);

      fixed =
        validPoints.length > 0
          ? JSON.stringify(validPoints)
          : STANDARD_CONTAINER_POINTS;
    }
  } catch {
    // JSON parse failed — use standard container points as fallback
    fixed = STANDARD_CONTAINER_POINTS;
  }

  props.set('points', fixed);
  return serializeStyle(props);
}

/**
 * Strip XML code fences that Claude sometimes wraps around the output.
 * Handles: ```xml ... ``` and ``` ... ```
 */
export function extractXml(raw: string): string {
  const trimmed = raw.trim();

  // Remove leading ```xml or ``` fence
  const fenceStart = trimmed.match(/^```(?:xml)?\s*/);
  if (fenceStart) {
    const afterFence = trimmed.slice(fenceStart[0].length);
    const fenceEnd = afterFence.lastIndexOf('```');
    return fenceEnd !== -1
      ? afterFence.slice(0, fenceEnd).trim()
      : afterFence.trim();
  }

  // Find the actual XML start
  const xmlStart = trimmed.indexOf('<mxfile');
  if (xmlStart > 0) {
    return trimmed.slice(xmlStart);
  }

  return trimmed;
}

/**
 * Apply all automatic fixes to the generated XML:
 * 1. Extract XML from code fences
 * 2. Fix points coordinates in all mxCell style attributes
 */
export function autoFixXml(rawXml: string): string {
  let xml = extractXml(rawXml);

  // Fix points in all style="..." attributes
  // The style attribute is always quoted, and points=[[...]] has no quotes inside
  xml = xml.replace(/style="([^"]*)"/g, (match, styleContent: string) => {
    const fixed = fixPointsInStyle(styleContent);
    return `style="${fixed}"`;
  });

  return xml;
}

/**
 * Collect all mxCell ids from the parsed XML tree.
 */
function collectIds(cells: unknown[]): Set<string> {
  const ids = new Set<string>();
  for (const cell of cells) {
    const c = cell as Record<string, unknown>;
    const attrs = c['$'] as Record<string, string> | undefined;
    if (attrs?.id) {
      ids.add(attrs.id);
    }
  }
  return ids;
}

/**
 * Validate the draw.io XML against the quality checklist:
 * - Parseable XML
 * - Contains at least one VPC container
 * - Contains at least one ALB or Internet Gateway
 * - All mxCell ids are unique
 * - Edge source/target IDs exist
 * - Diagram width ≤ 2800px
 */
export async function validateXml(xml: string): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. Parse XML
  let parsed: Record<string, unknown>;
  try {
    parsed = await parseStringPromise(xml, { explicitArray: true });
  } catch (err) {
    return {
      valid: false,
      errors: [`XML 語法錯誤：${(err as Error).message}`],
    };
  }

  // Navigate to root cells
  const mxfile = parsed['mxfile'] as Record<string, unknown> | undefined;
  if (!mxfile) {
    return { valid: false, errors: ['缺少 <mxfile> 根元素'] };
  }

  const diagram = (mxfile['diagram'] as Record<string, unknown>[])?.[0];
  if (!diagram) {
    return { valid: false, errors: ['缺少 <diagram> 元素'] };
  }

  const graphModel = (diagram['mxGraphModel'] as Record<string, unknown>[])?.[0];
  if (!graphModel) {
    return { valid: false, errors: ['缺少 <mxGraphModel> 元素'] };
  }

  const root = (graphModel['root'] as Record<string, unknown>[])?.[0];
  if (!root) {
    return { valid: false, errors: ['缺少 <root> 元素'] };
  }

  const cells = ((root['mxCell'] as unknown[]) ?? []) as Record<
    string,
    unknown
  >[];

  // 2. Check unique IDs
  const idCount = new Map<string, number>();
  for (const cell of cells) {
    const attrs = cell['$'] as Record<string, string> | undefined;
    if (attrs?.id) {
      idCount.set(attrs.id, (idCount.get(attrs.id) ?? 0) + 1);
    }
  }
  for (const [id, count] of idCount) {
    if (count > 1) {
      errors.push(`重複的 mxCell id：${id} (出現 ${count} 次)`);
    }
  }

  const allIds = new Set(idCount.keys());

  // 3. Check for VPC
  const hasVpc = cells.some((cell) => {
    const style = (cell['$'] as Record<string, string>)?.style ?? '';
    return style.includes('group_vpc') || style.includes('grIcon=mxgraph.aws4.group_vpc');
  });
  if (!hasVpc) {
    errors.push('架構圖缺少 VPC 容器（需包含 grIcon=mxgraph.aws4.group_vpc）');
  }

  // 4. Check for ALB or Internet Gateway
  const hasEntry = cells.some((cell) => {
    const style = (cell['$'] as Record<string, string>)?.style ?? '';
    return (
      style.includes('application_load_balancer') ||
      style.includes('internet_gateway') ||
      style.includes('network_load_balancer')
    );
  });
  if (!hasEntry) {
    errors.push(
      '架構圖缺少入口點（需包含 ALB、NLB 或 Internet Gateway）'
    );
  }

  // 5. Check edge source/target validity
  for (const cell of cells) {
    const attrs = cell['$'] as Record<string, string> | undefined;
    if (!attrs?.edge) continue;

    if (attrs.source && !allIds.has(attrs.source)) {
      errors.push(
        `Edge id="${attrs.id}" 的 source="${attrs.source}" 不存在`
      );
    }
    if (attrs.target && !allIds.has(attrs.target)) {
      errors.push(
        `Edge id="${attrs.id}" 的 target="${attrs.target}" 不存在`
      );
    }
  }

  // 6. Check diagram width
  const graphAttrs = (graphModel['$'] as Record<string, string>) ?? {};
  const pageWidth = parseInt(graphAttrs['pageWidth'] ?? '0', 10);
  if (pageWidth > 3000) {
    errors.push(`圖表寬度 ${pageWidth}px 超過建議的 3000px 上限`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
