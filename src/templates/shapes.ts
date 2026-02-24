export interface AwsShape {
  id: string;
  label: string;
  resIcon: string;
  fillColor: string;
  category: 'compute' | 'database' | 'networking' | 'security' | 'storage' | 'integration' | 'management';
}

export const AWS_SHAPES: Record<string, AwsShape> = {
  ec2: {
    id: 'ec2',
    label: 'EC2',
    resIcon: 'mxgraph.aws4.ec2',
    fillColor: '#ED7515',
    category: 'compute',
  },
  rds: {
    id: 'rds',
    label: 'RDS',
    resIcon: 'mxgraph.aws4.rds',
    fillColor: '#C925D1',
    category: 'database',
  },
  s3: {
    id: 's3',
    label: 'S3',
    resIcon: 'mxgraph.aws4.s3',
    fillColor: '#3F8624',
    category: 'storage',
  },
  lambda: {
    id: 'lambda',
    label: 'Lambda',
    resIcon: 'mxgraph.aws4.lambda',
    fillColor: '#ED7515',
    category: 'compute',
  },
  cloudfront: {
    id: 'cloudfront',
    label: 'CloudFront',
    resIcon: 'mxgraph.aws4.cloudfront',
    fillColor: '#8C4FFF',
    category: 'networking',
  },
  alb: {
    id: 'alb',
    label: 'Application Load Balancer',
    resIcon: 'mxgraph.aws4.application_load_balancer',
    fillColor: '#8C4FFF',
    category: 'networking',
  },
  nlb: {
    id: 'nlb',
    label: 'Network Load Balancer',
    resIcon: 'mxgraph.aws4.network_load_balancer',
    fillColor: '#8C4FFF',
    category: 'networking',
  },
  api_gateway: {
    id: 'api_gateway',
    label: 'API Gateway',
    resIcon: 'mxgraph.aws4.api_gateway',
    fillColor: '#E7157B',
    category: 'networking',
  },
  dynamodb: {
    id: 'dynamodb',
    label: 'DynamoDB',
    resIcon: 'mxgraph.aws4.dynamodb',
    fillColor: '#C925D1',
    category: 'database',
  },
  elasticache: {
    id: 'elasticache',
    label: 'ElastiCache',
    resIcon: 'mxgraph.aws4.elasticache',
    fillColor: '#C925D1',
    category: 'database',
  },
  sqs: {
    id: 'sqs',
    label: 'SQS',
    resIcon: 'mxgraph.aws4.sqs',
    fillColor: '#E7157B',
    category: 'integration',
  },
  sns: {
    id: 'sns',
    label: 'SNS',
    resIcon: 'mxgraph.aws4.sns',
    fillColor: '#E7157B',
    category: 'integration',
  },
  ecs: {
    id: 'ecs',
    label: 'ECS',
    resIcon: 'mxgraph.aws4.ecs',
    fillColor: '#ED7515',
    category: 'compute',
  },
  eks: {
    id: 'eks',
    label: 'EKS',
    resIcon: 'mxgraph.aws4.eks',
    fillColor: '#ED7515',
    category: 'compute',
  },
  cloudwatch: {
    id: 'cloudwatch',
    label: 'CloudWatch',
    resIcon: 'mxgraph.aws4.cloudwatch',
    fillColor: '#E7157B',
    category: 'management',
  },
  iam: {
    id: 'iam',
    label: 'IAM Role',
    resIcon: 'mxgraph.aws4.role',
    fillColor: '#DD344C',
    category: 'security',
  },
  waf: {
    id: 'waf',
    label: 'WAF',
    resIcon: 'mxgraph.aws4.waf',
    fillColor: '#DD344C',
    category: 'security',
  },
  route53: {
    id: 'route53',
    label: 'Route 53',
    resIcon: 'mxgraph.aws4.route_53',
    fillColor: '#8C4FFF',
    category: 'networking',
  },
  nat_gateway: {
    id: 'nat_gateway',
    label: 'NAT Gateway',
    resIcon: 'mxgraph.aws4.nat_gateway',
    fillColor: '#8C4FFF',
    category: 'networking',
  },
  internet_gateway: {
    id: 'internet_gateway',
    label: 'Internet Gateway',
    resIcon: 'mxgraph.aws4.internet_gateway',
    fillColor: '#8C4FFF',
    category: 'networking',
  },
  cognito: {
    id: 'cognito',
    label: 'Cognito',
    resIcon: 'mxgraph.aws4.cognito',
    fillColor: '#DD344C',
    category: 'security',
  },
  secrets_manager: {
    id: 'secrets_manager',
    label: 'Secrets Manager',
    resIcon: 'mxgraph.aws4.secrets_manager',
    fillColor: '#DD344C',
    category: 'security',
  },
  cloudtrail: {
    id: 'cloudtrail',
    label: 'CloudTrail',
    resIcon: 'mxgraph.aws4.cloudtrail',
    fillColor: '#E7157B',
    category: 'management',
  },
  aurora: {
    id: 'aurora',
    label: 'Aurora',
    resIcon: 'mxgraph.aws4.aurora',
    fillColor: '#C925D1',
    category: 'database',
  },
};

export const AWS_GROUP_STYLES = {
  vpc: {
    style: 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#8C4FFF;fillColor=#F4EBFF;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=14;',
  },
  publicSubnet: {
    style: 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_public_subnet;strokeColor=#7AA116;fillColor=#E6F2D8;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=12;',
  },
  privateSubnet: {
    style: 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#147EBA;fillColor=#E6F5FC;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=12;',
  },
  isolatedSubnet: {
    style: 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#E07000;fillColor=#FFF2E6;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=12;',
  },
  region: {
    style: 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_region;strokeColor=#00A4A6;fillColor=none;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=14;dashed=1;',
  },
  az: {
    style: 'fillColor=#EFF0F3;strokeColor=#545B64;dashed=1;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=12;',
  },
};

export function getShapeStyle(shapeId: string): string {
  const shape = AWS_SHAPES[shapeId];
  if (!shape) return '';
  return `outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=${shape.fillColor};labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=${shape.resIcon}`;
}

export function formatShapeReference(): string {
  return Object.values(AWS_SHAPES)
    .map(s => `- ${s.label}: resIcon=${s.resIcon} (fillColor=${s.fillColor})`)
    .join('\n');
}
