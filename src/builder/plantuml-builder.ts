/**
 * PlantUML builder for AWS architecture diagrams.
 *
 * Converts an ArchitectureDiagram JSON object into PlantUML text
 * using the AWS Icons library (awslib). Pure text output — no XML issues.
 */

import { ArchitectureDiagram } from '../types/architecture';

// ── PlantUML AWS service mapping ─────────────────────────────

interface PlantUmlService {
  include: string; // e.g. 'Compute/EC2'
  macro: string;   // e.g. 'EC2'
}

const PLANTUML_SERVICES: Record<string, PlantUmlService> = {
  // Compute
  ec2:              { include: 'Compute/EC2',                                    macro: 'EC2' },
  lambda:           { include: 'Compute/Lambda',                                 macro: 'Lambda' },
  ecs:              { include: 'Containers/ElasticContainerService',              macro: 'ElasticContainerService' },
  eks:              { include: 'Containers/ElasticKubernetesService',             macro: 'ElasticKubernetesService' },

  // Storage
  s3:               { include: 'Storage/SimpleStorageService',                    macro: 'SimpleStorageService' },

  // Database
  rds:              { include: 'Database/RDS',                                    macro: 'RDS' },
  dynamodb:         { include: 'Database/DynamoDB',                               macro: 'DynamoDB' },
  elasticache:      { include: 'Database/ElastiCache',                            macro: 'ElastiCache' },
  aurora:           { include: 'Database/Aurora',                                 macro: 'Aurora' },

  // Networking
  cloudfront:       { include: 'NetworkingContentDelivery/CloudFront',            macro: 'CloudFront' },
  alb:              { include: 'NetworkingContentDelivery/ElasticLoadBalancing',   macro: 'ElasticLoadBalancing' },
  nlb:              { include: 'NetworkingContentDelivery/ElasticLoadBalancing',   macro: 'ElasticLoadBalancing' },
  nat_gateway:      { include: 'NetworkingContentDelivery/NATGateway',            macro: 'NATGateway' },
  internet_gateway: { include: 'NetworkingContentDelivery/InternetGateway',       macro: 'InternetGateway' },
  route53:          { include: 'NetworkingContentDelivery/Route53',               macro: 'Route53' },
  api_gateway:      { include: 'NetworkingContentDelivery/APIGateway',            macro: 'APIGateway' },

  // Security
  waf:              { include: 'SecurityIdentityCompliance/WAF',                  macro: 'WAF' },
  iam:              { include: 'SecurityIdentityCompliance/IdentityAndAccessManagement', macro: 'IdentityAndAccessManagement' },
  secrets_manager:  { include: 'SecurityIdentityCompliance/SecretsManager',       macro: 'SecretsManager' },
  cognito:          { include: 'SecurityIdentityCompliance/Cognito',              macro: 'Cognito' },

  // Messaging
  sqs:              { include: 'ApplicationIntegration/SimpleQueueService',       macro: 'SimpleQueueService' },
  sns:              { include: 'ApplicationIntegration/SimpleNotificationService', macro: 'SimpleNotificationService' },

  // Monitoring
  cloudwatch:       { include: 'ManagementGovernance/CloudWatch',                macro: 'CloudWatch' },
  cloudtrail:       { include: 'ManagementGovernance/CloudTrail',                macro: 'CloudTrail' },
};

// ── Subnet colors ────────────────────────────────────────────

const SUBNET_COLORS: Record<string, string> = {
  public:   '#E6F2F8',
  private:  '#E9F3E6',
  isolated: '#FFF3E0',
};

// ── Helpers ──────────────────────────────────────────────────

/** Sanitize an ID for PlantUML (only alphanumerics and underscores) */
function sanitizeId(id: string): string {
  return String(id).replace(/[^a-zA-Z0-9_]/g, '_');
}

/** Escape a string for PlantUML labels (double quotes) */
function escapeLabel(str: string): string {
  return String(str ?? '').replace(/"/g, "'");
}

/** Build a label with optional specs on a new line */
function buildLabel(label: string, specs?: string): string {
  const parts = [escapeLabel(label)];
  if (specs) {
    parts.push(escapeLabel(specs));
  }
  return parts.join('\\n');
}

// ── Main builder ─────────────────────────────────────────────

export function buildPlantUml(arch: ArchitectureDiagram): string {
  const lines: string[] = [];
  const usedIncludes = new Set<string>();

  // Collect all services used
  const allComponents = [
    ...(arch.externalComponents ?? []),
    ...arch.vpc.subnets.flatMap((s) => s.components),
  ];

  for (const comp of allComponents) {
    const svc = PLANTUML_SERVICES[comp.service];
    if (svc) {
      usedIncludes.add(svc.include);
    }
  }

  // Header
  lines.push(`@startuml ${escapeLabel(arch.title)}`);
  lines.push('');
  lines.push("!include <awslib/AWSCommon>");
  lines.push("!include <awslib/AWSSimplified.puml>");
  lines.push('');

  // Include only the services actually used
  for (const inc of [...usedIncludes].sort()) {
    lines.push(`!include <awslib/${inc}>`);
  }
  lines.push('');

  // Skinparam
  lines.push('skinparam linetype ortho');
  lines.push('skinparam rectangle {');
  lines.push('  BackgroundColor<<AWSCloud>> #F4EBFF');
  lines.push('  BorderColor<<AWSCloud>> #8C4FFF');
  lines.push('}');
  lines.push('');

  // External components (outside VPC)
  for (const ext of arch.externalComponents ?? []) {
    const svc = PLANTUML_SERVICES[ext.service];
    const id = sanitizeId(ext.id);
    const label = buildLabel(ext.label, ext.specs);
    if (svc) {
      lines.push(`${svc.macro}(${id}, "${label}", "")`);
    } else {
      lines.push(`rectangle "${label}" as ${id}`);
    }
  }

  if ((arch.externalComponents ?? []).length > 0) {
    lines.push('');
  }

  // VPC container
  lines.push(`rectangle "VPC (${escapeLabel(arch.vpc.cidr)})" as vpc <<AWSCloud>> {`);

  // Subnets
  for (const subnet of arch.vpc.subnets) {
    const subId = sanitizeId(subnet.id);
    const subColor = SUBNET_COLORS[subnet.type] ?? '#FFFFFF';
    const subLabel = subnet.cidr
      ? `${escapeLabel(subnet.name)}\\n(${escapeLabel(subnet.cidr)})`
      : escapeLabel(subnet.name);

    lines.push(`  rectangle "${subLabel}" as ${subId} ${subColor} {`);

    // Components inside subnet
    for (const comp of subnet.components) {
      const svc = PLANTUML_SERVICES[comp.service];
      const compId = sanitizeId(comp.id);
      const compLabel = buildLabel(comp.label, comp.specs);
      if (svc) {
        lines.push(`    ${svc.macro}(${compId}, "${compLabel}", "")`);
      } else {
        lines.push(`    rectangle "${compLabel}" as ${compId}`);
      }
    }

    lines.push('  }');
  }

  lines.push('}');
  lines.push('');

  // Connections
  for (const conn of arch.connections) {
    const from = sanitizeId(conn.from);
    const to = sanitizeId(conn.to);
    const arrow = conn.dashed ? '..>' : '-->';
    const label = conn.label ? ` : ${escapeLabel(conn.label)}` : '';
    lines.push(`${from} ${arrow} ${to}${label}`);
  }

  lines.push('');
  lines.push('@enduml');

  return lines.join('\n');
}
