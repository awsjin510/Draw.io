/**
 * Few-shot example: 3-tier web application architecture (JSON format)
 */
export const WEB_APP_EXAMPLE = `{
  "title": "3-Tier Web Application",
  "vpc": {
    "cidr": "10.0.0.0/16",
    "subnets": [
      {
        "id": "pub-a",
        "name": "Public Subnet A",
        "type": "public",
        "az": "ap-northeast-1a",
        "cidr": "10.0.1.0/24",
        "components": [
          { "id": "alb", "service": "alb", "label": "ALB", "specs": "Application Load Balancer" }
        ]
      },
      {
        "id": "priv-a",
        "name": "Private Subnet A",
        "type": "private",
        "az": "ap-northeast-1a",
        "cidr": "10.0.11.0/24",
        "components": [
          { "id": "ec2-a", "service": "ec2", "label": "Web Server", "specs": "t3.medium" }
        ]
      },
      {
        "id": "priv-b",
        "name": "Private Subnet B",
        "type": "private",
        "az": "ap-northeast-1c",
        "cidr": "10.0.12.0/24",
        "components": [
          { "id": "ec2-b", "service": "ec2", "label": "Web Server", "specs": "t3.medium" }
        ]
      },
      {
        "id": "iso-a",
        "name": "Isolated Subnet A",
        "type": "isolated",
        "az": "ap-northeast-1a",
        "cidr": "10.0.21.0/24",
        "components": [
          { "id": "rds-primary", "service": "rds", "label": "RDS Primary", "specs": "MySQL 8.0 Multi-AZ" }
        ]
      }
    ]
  },
  "externalComponents": [
    { "id": "igw", "service": "internet_gateway", "label": "Internet Gateway" },
    { "id": "cf", "service": "cloudfront", "label": "CloudFront CDN" }
  ],
  "connections": [
    { "from": "igw", "to": "cf", "label": "HTTPS:443" },
    { "from": "cf", "to": "alb", "label": "HTTPS:443" },
    { "from": "alb", "to": "ec2-a", "label": "HTTP:8080" },
    { "from": "alb", "to": "ec2-b", "label": "HTTP:8080" },
    { "from": "ec2-a", "to": "rds-primary", "label": "MySQL:3306" },
    { "from": "ec2-b", "to": "rds-primary", "label": "MySQL:3306" }
  ]
}`;
