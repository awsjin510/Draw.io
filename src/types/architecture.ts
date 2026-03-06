/**
 * Type definitions for the architecture JSON schema.
 *
 * Claude outputs this JSON structure describing the AWS architecture.
 * The XML Builder then converts it to guaranteed-valid draw.io XML.
 */

export interface ArchitectureDiagram {
  title: string;
  vpc: VpcConfig;
  externalComponents?: ExternalComponent[];
  connections: Connection[];
}

export interface VpcConfig {
  cidr: string;
  subnets: SubnetConfig[];
}

export interface SubnetConfig {
  id: string;
  name: string;
  type: 'public' | 'private' | 'isolated';
  az: string;
  cidr: string;
  components: ComponentConfig[];
}

export interface ComponentConfig {
  id: string;
  service: string;
  label: string;
  specs?: string;
}

export interface ExternalComponent {
  id: string;
  service: string;
  label: string;
  specs?: string;
}

export interface Connection {
  from: string;
  to: string;
  label: string;
  dashed?: boolean;
}
