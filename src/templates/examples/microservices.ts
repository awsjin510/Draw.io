/**
 * Few-shot example: Microservices architecture using ECS + SQS (JSON format)
 */
export const MICROSERVICES_EXAMPLE = `{
  "title": "Microservices Architecture",
  "vpc": {
    "cidr": "10.0.0.0/16",
    "subnets": [
      {
        "id": "ms-pub",
        "name": "Public Subnet",
        "type": "public",
        "az": "ap-northeast-1a",
        "cidr": "10.0.1.0/24",
        "components": [
          { "id": "ms-alb", "service": "alb", "label": "ALB" }
        ]
      },
      {
        "id": "ms-priv",
        "name": "Private Subnet",
        "type": "private",
        "az": "ap-northeast-1a",
        "cidr": "10.0.10.0/24",
        "components": [
          { "id": "ecs-order", "service": "ecs", "label": "ECS", "specs": "Order Service" },
          { "id": "ecs-inventory", "service": "ecs", "label": "ECS", "specs": "Inventory Service" },
          { "id": "ecs-notify", "service": "ecs", "label": "ECS", "specs": "Notification Service" },
          { "id": "sqs-order", "service": "sqs", "label": "SQS", "specs": "Order Queue" }
        ]
      },
      {
        "id": "ms-iso",
        "name": "Isolated Subnet",
        "type": "isolated",
        "az": "ap-northeast-1a",
        "cidr": "10.0.20.0/24",
        "components": [
          { "id": "ms-rds", "service": "aurora", "label": "RDS Aurora", "specs": "Multi-AZ" }
        ]
      }
    ]
  },
  "externalComponents": [
    { "id": "ms-igw", "service": "internet_gateway", "label": "Internet Gateway" }
  ],
  "connections": [
    { "from": "ms-igw", "to": "ms-alb", "label": "HTTPS:443" },
    { "from": "ms-alb", "to": "ecs-order", "label": "HTTP:8080" },
    { "from": "ecs-order", "to": "sqs-order", "label": "Publish", "dashed": true },
    { "from": "sqs-order", "to": "ecs-inventory", "label": "Subscribe", "dashed": true },
    { "from": "sqs-order", "to": "ecs-notify", "label": "Subscribe", "dashed": true },
    { "from": "ecs-order", "to": "ms-rds", "label": "Aurora:5432" }
  ]
}`;
