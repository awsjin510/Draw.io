/**
 * Few-shot example: Serverless API architecture (JSON format)
 */
export const SERVERLESS_EXAMPLE = `{
  "title": "Serverless API Architecture",
  "vpc": {
    "cidr": "10.0.0.0/16",
    "subnets": [
      {
        "id": "lambda-subnet",
        "name": "Private Subnet",
        "type": "private",
        "az": "ap-northeast-1a",
        "cidr": "10.0.10.0/24",
        "components": [
          { "id": "lambda-api", "service": "lambda", "label": "Lambda", "specs": "API Handler" },
          { "id": "lambda-auth", "service": "lambda", "label": "Lambda", "specs": "Authorizer" }
        ]
      },
      {
        "id": "db-subnet",
        "name": "Isolated Subnet",
        "type": "isolated",
        "az": "ap-northeast-1a",
        "cidr": "10.0.20.0/24",
        "components": [
          { "id": "ddb", "service": "dynamodb", "label": "DynamoDB", "specs": "On-Demand" }
        ]
      }
    ]
  },
  "externalComponents": [
    { "id": "cf-sl", "service": "cloudfront", "label": "CloudFront" },
    { "id": "apigw", "service": "api_gateway", "label": "API Gateway", "specs": "REST API" },
    { "id": "s3-static", "service": "s3", "label": "S3", "specs": "Static Assets" }
  ],
  "connections": [
    { "from": "cf-sl", "to": "apigw", "label": "HTTPS:443" },
    { "from": "cf-sl", "to": "s3-static", "label": "HTTPS:443" },
    { "from": "apigw", "to": "lambda-api", "label": "Invoke" },
    { "from": "apigw", "to": "lambda-auth", "label": "Authorize" },
    { "from": "lambda-api", "to": "ddb", "label": "DynamoDB API" }
  ]
}`;
