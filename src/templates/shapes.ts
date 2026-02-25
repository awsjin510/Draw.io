/**
 * Standard 16-point connection array for container shapes in draw.io.
 * Coordinates are normalized [0,1] relative to the shape bounds.
 * Arranged clockwise: top-left → top → top-right → right → bottom-right → bottom → bottom-left → left
 *
 * IMPORTANT: All x,y values MUST be between 0 and 1 (inclusive).
 * Out-of-range values cause draw.io to fail loading the diagram.
 */
export const STANDARD_CONTAINER_POINTS =
  '[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]]';

/**
 * AWS service shape styles for draw.io mxgraph.aws4 library.
 * These correspond to the official AWS icon shapes.
 */
export const AWS_SHAPES: Record<string, string> = {
  // Compute
  ec2: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2',
  lambda:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.lambda',
  ecs: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ecs',
  eks: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.eks',

  // Storage
  s3: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#7AA116;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.s3',

  // Database
  rds: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#2E73B8;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.rds',
  dynamodb:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#2E73B8;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.dynamodb',
  elasticache:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#2E73B8;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.elasticache',
  aurora:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#2E73B8;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.aurora',

  // Networking
  cloudfront:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.cloudfront',
  alb: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.application_load_balancer',
  nlb: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.network_load_balancer',
  nat_gateway:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.nat_gateway',
  internet_gateway:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.internet_gateway',
  route53:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.route_53',
  api_gateway:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.api_gateway',
  waf: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#DD344C;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.waf',

  // Messaging
  sqs: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#E7157B;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.sqs',
  sns: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#E7157B;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.sns',

  // Security
  iam: 'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#DD344C;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.role',
  secrets_manager:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#DD344C;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.secrets_manager',
  cognito:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#DD344C;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.cognito',

  // Monitoring
  cloudwatch:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#E7157B;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.cloudwatch',
  cloudtrail:
    'outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#E7157B;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.cloudtrail',

  // Container groups
  vpc: `points=${STANDARD_CONTAINER_POINTS};shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#8C4FFF;fillColor=#F4EBFF;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=14;`,
  public_subnet: `points=${STANDARD_CONTAINER_POINTS};shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_public_subnet;strokeColor=#147EBA;fillColor=#E6F2F8;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;`,
  private_subnet: `points=${STANDARD_CONTAINER_POINTS};shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#3F8624;fillColor=#E9F3E6;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;`,
  isolated_subnet: `points=${STANDARD_CONTAINER_POINTS};shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#CD853F;fillColor=#FFF3E0;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;`,
};
