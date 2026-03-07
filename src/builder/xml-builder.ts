/**
 * Programmatic draw.io XML builder.
 *
 * Converts an ArchitectureDiagram JSON object into guaranteed-valid
 * draw.io XML. This eliminates all XML formatting risks from Claude's
 * generation — Claude only needs to produce correct JSON.
 */

import {
  ArchitectureDiagram,
  SubnetConfig,
  ComponentConfig,
  ExternalComponent,
  Connection,
} from '../types/architecture';
import { AWS_SHAPES, STANDARD_CONTAINER_POINTS } from '../templates/shapes';
import pako from 'pako';

// ── Layout constants ─────────────────────────────────────────────

const PAGE_WIDTH = 2800;
const PAGE_HEIGHT = 2000;

const VPC_X = 100;
const VPC_Y = 240;
const VPC_PADDING = 80;

const SUBNET_HEIGHT = 220;
const SUBNET_GAP = 40;
const SUBNET_MIN_WIDTH = 500;

const COMPONENT_WIDTH = 60;
const COMPONENT_HEIGHT = 60;
const COMPONENT_GAP = 160;
const COMPONENT_TOP_MARGIN = 80;

const EXTERNAL_Y_START = 40;
const EXTERNAL_GAP = 120;

// ── Helpers ──────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\t/g, '&#x9;')
    .replace(/\n/g, '&#xa;')
    .replace(/\r/g, '&#xd;')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
}

function escapeAttr(str: string): string {
  return escapeXml(str);
}

/**
 * Build a multi-line label for draw.io.
 * Escapes each part individually and joins with &#xa; (newline character reference).
 * This is safe in XML attributes and works in both plain and html=1 modes.
 */
function buildLabel(...parts: (string | undefined)[]): string {
  return parts
    .filter((p): p is string => !!p)
    .map((p) => escapeXml(p))
    .join('&#xa;');
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Subnet style helpers ─────────────────────────────────────────

interface SubnetStyle {
  grIcon: string;
  strokeColor: string;
  fillColor: string;
}

function getSubnetStyle(type: 'public' | 'private' | 'isolated'): SubnetStyle {
  switch (type) {
    case 'public':
      return {
        grIcon: 'mxgraph.aws4.group_public_subnet',
        strokeColor: '#147EBA',
        fillColor: '#E6F2F8',
      };
    case 'private':
      return {
        grIcon: 'mxgraph.aws4.group_private_subnet',
        strokeColor: '#3F8624',
        fillColor: '#E9F3E6',
      };
    case 'isolated':
      return {
        grIcon: 'mxgraph.aws4.group_private_subnet',
        strokeColor: '#CD853F',
        fillColor: '#FFF3E0',
      };
  }
}

// ── Layout calculation ───────────────────────────────────────────

interface LayoutResult {
  vpcWidth: number;
  vpcHeight: number;
  subnetLayouts: SubnetLayout[];
  externalLayouts: ExternalLayout[];
}

interface SubnetLayout {
  subnet: SubnetConfig;
  x: number;
  y: number;
  width: number;
  height: number;
  componentPositions: Map<string, { x: number; y: number }>;
}

interface ExternalLayout {
  component: ExternalComponent;
  x: number;
  y: number;
}

function calculateLayout(arch: ArchitectureDiagram): LayoutResult {
  const subnets = arch.vpc.subnets;

  // Group subnets by type for top-to-bottom ordering
  const subnetOrder: Array<'public' | 'private' | 'isolated'> = [
    'public',
    'private',
    'isolated',
  ];
  const sortedSubnets = [...subnets].sort(
    (a, b) => subnetOrder.indexOf(a.type) - subnetOrder.indexOf(b.type)
  );

  // Calculate subnet widths based on component count
  const maxComponents = Math.max(
    ...sortedSubnets.map((s) => s.components.length),
    1
  );
  const subnetWidth = Math.max(
    SUBNET_MIN_WIDTH,
    maxComponents * (COMPONENT_WIDTH + COMPONENT_GAP) + COMPONENT_GAP
  );

  // Calculate subnet layouts
  const subnetLayouts: SubnetLayout[] = [];
  let currentY = VPC_PADDING;

  for (const subnet of sortedSubnets) {
    const componentPositions = new Map<string, { x: number; y: number }>();
    const componentCount = subnet.components.length;

    // Center components within subnet
    const totalComponentsWidth =
      componentCount * COMPONENT_WIDTH +
      (componentCount - 1) * COMPONENT_GAP;
    let startX = Math.max(
      COMPONENT_GAP,
      (subnetWidth - totalComponentsWidth) / 2
    );

    for (let i = 0; i < componentCount; i++) {
      const comp = subnet.components[i];
      componentPositions.set(comp.id, {
        x: startX + i * (COMPONENT_WIDTH + COMPONENT_GAP),
        y: COMPONENT_TOP_MARGIN,
      });
    }

    subnetLayouts.push({
      subnet,
      x: VPC_PADDING,
      y: currentY,
      width: subnetWidth,
      height: SUBNET_HEIGHT,
      componentPositions,
    });

    currentY += SUBNET_HEIGHT + SUBNET_GAP;
  }

  const vpcWidth = subnetWidth + VPC_PADDING * 2;
  const vpcHeight = currentY - SUBNET_GAP + VPC_PADDING;

  // Calculate external component positions (above VPC)
  const externals = arch.externalComponents ?? [];
  const externalLayouts: ExternalLayout[] = [];
  const externalTotalWidth =
    externals.length * COMPONENT_WIDTH +
    (externals.length - 1) * EXTERNAL_GAP;
  const externalStartX =
    VPC_X + (vpcWidth - externalTotalWidth) / 2;

  for (let i = 0; i < externals.length; i++) {
    externalLayouts.push({
      component: externals[i],
      x: externalStartX + i * (COMPONENT_WIDTH + EXTERNAL_GAP),
      y: EXTERNAL_Y_START + i * EXTERNAL_GAP,
    });
  }

  return { vpcWidth, vpcHeight, subnetLayouts, externalLayouts };
}

// ── XML Cell builders ────────────────────────────────────────────

function buildCell(attrs: Record<string, string>, geometry?: string): string {
  // The 'value' attribute is pre-escaped via buildLabel(), so pass it through as-is.
  // All other attribute values get escaped normally.
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => {
      const escaped = k === 'value' ? v : escapeAttr(v);
      return `${k}="${escaped}"`;
    })
    .join(' ');

  if (geometry) {
    return `    <mxCell ${attrStr}>\n      ${geometry}\n    </mxCell>`;
  }
  return `    <mxCell ${attrStr}/>`;
}

function buildGeometry(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  return `<mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>`;
}

function buildRelativeGeometry(): string {
  return `<mxGeometry relative="1" as="geometry"/>`;
}

// ── Main builder ─────────────────────────────────────────────────

export function buildDrawioXml(arch: ArchitectureDiagram): string {
  const layout = calculateLayout(arch);
  const cells: string[] = [];

  // Root cells (required by draw.io)
  cells.push(buildCell({ id: '0' }));
  cells.push(buildCell({ id: '1', parent: '0' }));

  // External components (above VPC: CloudFront, IGW, API Gateway, etc.)
  for (const ext of layout.externalLayouts) {
    const shapeStyle = AWS_SHAPES[ext.component.service];
    if (!shapeStyle) continue;

    const label = buildLabel(ext.component.label, ext.component.specs);

    cells.push(
      buildCell(
        {
          id: ext.component.id,
          value: label,
          style: shapeStyle,
          vertex: '1',
          parent: '1',
        },
        buildGeometry(ext.x, ext.y, COMPONENT_WIDTH, COMPONENT_HEIGHT)
      )
    );
  }

  // VPC container
  const vpcId = 'vpc';
  const vpcStyle = [
    `points=${STANDARD_CONTAINER_POINTS}`,
    'shape=mxgraph.aws4.group',
    'grIcon=mxgraph.aws4.group_vpc',
    'strokeColor=#8C4FFF',
    'fillColor=#F4EBFF',
    'verticalLabelPosition=top',
    'verticalAlign=bottom',
    'align=center',
    'spacingTop=25',
    'fontStyle=1',
    'fontSize=14',
    'html=1',
  ].join(';');

  cells.push(
    buildCell(
      {
        id: vpcId,
        value: buildLabel(`VPC (${arch.vpc.cidr})`),
        style: vpcStyle,
        vertex: '1',
        parent: '1',
      },
      buildGeometry(VPC_X, VPC_Y, layout.vpcWidth, layout.vpcHeight)
    )
  );

  // Subnets and their components
  for (const sl of layout.subnetLayouts) {
    const subStyle = getSubnetStyle(sl.subnet.type);
    const subnetStyleStr = [
      `points=${STANDARD_CONTAINER_POINTS}`,
      'shape=mxgraph.aws4.group',
      `grIcon=${subStyle.grIcon}`,
      `strokeColor=${subStyle.strokeColor}`,
      `fillColor=${subStyle.fillColor}`,
      'verticalLabelPosition=top',
      'verticalAlign=bottom',
      'align=center',
      'spacingTop=25',
      'fontStyle=0',
      'fontSize=11',
      'html=1',
    ].join(';');

    const subnetLabel = buildLabel(sl.subnet.name, sl.subnet.cidr ? `(${sl.subnet.cidr})` : undefined);

    cells.push(
      buildCell(
        {
          id: sl.subnet.id,
          value: subnetLabel,
          style: subnetStyleStr,
          vertex: '1',
          parent: vpcId,
        },
        buildGeometry(sl.x, sl.y, sl.width, sl.height)
      )
    );

    // Components inside this subnet
    for (const comp of sl.subnet.components) {
      const shapeStyle = AWS_SHAPES[comp.service];
      if (!shapeStyle) continue;

      const pos = sl.componentPositions.get(comp.id);
      if (!pos) continue;

      const compLabel = buildLabel(comp.label, comp.specs);

      cells.push(
        buildCell(
          {
            id: comp.id,
            value: compLabel,
            style: shapeStyle,
            vertex: '1',
            parent: sl.subnet.id,
          },
          buildGeometry(pos.x, pos.y, COMPONENT_WIDTH, COMPONENT_HEIGHT)
        )
      );
    }
  }

  // Edges (connections)
  for (let i = 0; i < arch.connections.length; i++) {
    const conn = arch.connections[i];
    const edgeStyle = conn.dashed
      ? 'edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;'
      : 'edgeStyle=orthogonalEdgeStyle;html=1;';

    cells.push(
      buildCell(
        {
          id: `edge-${i}`,
          value: escapeXml(conn.label),
          style: edgeStyle,
          edge: '1',
          source: conn.from,
          target: conn.to,
          parent: '1',
        },
        buildRelativeGeometry()
      )
    );
  }

  // Assemble the inner mxGraphModel XML
  const now = new Date().toISOString();
  const diagramId = generateId();
  const pageHeight = Math.max(PAGE_HEIGHT, layout.vpcHeight + VPC_Y + 200);

  const graphModelXml = `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${PAGE_WIDTH}" pageHeight="${pageHeight}" math="0" shadow="0"><root>${cells.join('')}</root></mxGraphModel>`;

  // Compress to draw.io native format: URL-encode → deflate → base64
  // This avoids all XML attribute escaping issues in the inner content
  const encoded = encodeURIComponent(graphModelXml);
  const compressed = pako.deflateRaw(new TextEncoder().encode(encoded));
  const base64 = Buffer.from(compressed).toString('base64');

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${now}" agent="AWS Diagram Generator" version="24.7.7" type="device">
  <diagram id="${diagramId}" name="${escapeAttr(arch.title)}">${base64}</diagram>
</mxfile>`;
}
