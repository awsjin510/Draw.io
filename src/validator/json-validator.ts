/**
 * Validates the architecture JSON produced by Claude.
 *
 * Checks structural integrity before passing to the XML builder,
 * so invalid JSON gets caught early and can be retried.
 */

import { ArchitectureDiagram } from '../types/architecture';
import { AWS_SHAPES } from '../templates/shapes';

export interface JsonValidationResult {
  valid: boolean;
  errors: string[];
  data?: ArchitectureDiagram;
}

/**
 * Extract JSON from Claude's response text.
 * Handles optional code fences and leading/trailing text.
 */
export function extractJson(raw: string): string {
  const trimmed = raw.trim();

  // Remove ```json ... ``` fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Find the first { and last } to extract JSON object
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

/**
 * Validate the architecture JSON structure and references.
 */
export function validateArchitectureJson(
  raw: string
): JsonValidationResult {
  const errors: string[] = [];

  // 1. Parse JSON
  let data: ArchitectureDiagram;
  const jsonStr = extractJson(raw);

  try {
    data = JSON.parse(jsonStr);
  } catch (err) {
    return {
      valid: false,
      errors: [`JSON 語法錯誤：${(err as Error).message}`],
    };
  }

  // 2. Check top-level fields
  if (!data.title || typeof data.title !== 'string') {
    errors.push('缺少 title 欄位');
  }
  if (!data.vpc) {
    errors.push('缺少 vpc 欄位');
  }
  if (!data.connections || !Array.isArray(data.connections)) {
    errors.push('缺少 connections 陣列');
  }

  if (!data.vpc) {
    return { valid: false, errors };
  }

  // 3. Check VPC
  if (!data.vpc.cidr) {
    errors.push('vpc 缺少 cidr');
  }
  if (!data.vpc.subnets || !Array.isArray(data.vpc.subnets) || data.vpc.subnets.length === 0) {
    errors.push('vpc 至少需要一個 subnet');
  }

  // 4. Collect all component IDs and check uniqueness
  const allIds = new Set<string>();
  const duplicates = new Set<string>();

  function checkId(id: string, context: string) {
    if (!id) {
      errors.push(`${context} 缺少 id`);
      return;
    }
    if (allIds.has(id)) {
      duplicates.add(id);
    }
    allIds.add(id);
  }

  // External components
  if (data.externalComponents) {
    for (const ext of data.externalComponents) {
      checkId(ext.id, `externalComponent "${ext.label || '?'}"`);
      if (!ext.service) {
        errors.push(`externalComponent "${ext.id}" 缺少 service`);
      } else if (typeof ext.service !== 'string') {
        errors.push(`externalComponent "${ext.id}" 的 service 必須是字串`);
      } else if (!AWS_SHAPES[ext.service]) {
        errors.push(
          `externalComponent "${ext.id}" 的 service "${ext.service}" 不存在於 AWS_SHAPES 中。可用值：${Object.keys(AWS_SHAPES).join(', ')}`
        );
      }
      if (ext.label != null && typeof ext.label !== 'string') {
        errors.push(`externalComponent "${ext.id}" 的 label 必須是字串`);
      }
      if (ext.specs != null && typeof ext.specs !== 'string') {
        errors.push(`externalComponent "${ext.id}" 的 specs 必須是字串`);
      }
    }
  }

  // Subnet components
  if (data.vpc.subnets) {
    const subnetIds = new Set<string>();
    for (const subnet of data.vpc.subnets) {
      checkId(subnet.id, `subnet "${subnet.name || '?'}"`);
      if (subnetIds.has(subnet.id)) {
        errors.push(`subnet id "${subnet.id}" 重複`);
      }
      subnetIds.add(subnet.id);

      if (!subnet.name) {
        errors.push(`subnet "${subnet.id}" 缺少 name`);
      } else if (typeof subnet.name !== 'string') {
        errors.push(`subnet "${subnet.id}" 的 name 必須是字串`);
      }
      if (subnet.cidr != null && typeof subnet.cidr !== 'string') {
        errors.push(`subnet "${subnet.id}" 的 cidr 必須是字串`);
      }
      if (!['public', 'private', 'isolated'].includes(subnet.type)) {
        errors.push(
          `subnet "${subnet.id}" 的 type "${subnet.type}" 無效，必須為 public/private/isolated`
        );
      }

      if (subnet.components) {
        for (const comp of subnet.components) {
          checkId(comp.id, `component "${comp.label || '?'}"`);
          if (!comp.service) {
            errors.push(`component "${comp.id}" 缺少 service`);
          } else if (typeof comp.service !== 'string') {
            errors.push(`component "${comp.id}" 的 service 必須是字串`);
          } else if (!AWS_SHAPES[comp.service]) {
            errors.push(
              `component "${comp.id}" 的 service "${comp.service}" 不存在於 AWS_SHAPES 中。可用值：${Object.keys(AWS_SHAPES).join(', ')}`
            );
          }
          if (comp.label != null && typeof comp.label !== 'string') {
            errors.push(`component "${comp.id}" 的 label 必須是字串`);
          }
          if (comp.specs != null && typeof comp.specs !== 'string') {
            errors.push(`component "${comp.id}" 的 specs 必須是字串`);
          }
        }
      }
    }
  }

  for (const dup of duplicates) {
    errors.push(`id "${dup}" 重複出現`);
  }

  // 5. Check connections reference valid IDs
  if (data.connections) {
    for (const conn of data.connections) {
      if (!conn.from) {
        errors.push('connection 缺少 from');
      } else if (!allIds.has(conn.from)) {
        errors.push(
          `connection 的 from="${conn.from}" 不存在。可用 id：${[...allIds].join(', ')}`
        );
      }
      if (!conn.to) {
        errors.push('connection 缺少 to');
      } else if (!allIds.has(conn.to)) {
        errors.push(
          `connection 的 to="${conn.to}" 不存在。可用 id：${[...allIds].join(', ')}`
        );
      }
      if (!conn.label) {
        errors.push(`connection ${conn.from} → ${conn.to} 缺少 label`);
      } else if (typeof conn.label !== 'string') {
        errors.push(`connection ${conn.from} → ${conn.to} 的 label 必須是字串`);
      }
    }
  }

  // 6. Check for entry point (ALB, NLB, or IGW)
  const allServices = new Set<string>();
  if (data.externalComponents) {
    data.externalComponents.forEach((c) => allServices.add(c.service));
  }
  if (data.vpc.subnets) {
    data.vpc.subnets.forEach((s) =>
      s.components?.forEach((c) => allServices.add(c.service))
    );
  }

  const hasEntry =
    allServices.has('alb') ||
    allServices.has('nlb') ||
    allServices.has('internet_gateway') ||
    allServices.has('api_gateway');

  if (!hasEntry) {
    errors.push(
      '架構缺少入口點（需包含 alb、nlb、internet_gateway 或 api_gateway）'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}
