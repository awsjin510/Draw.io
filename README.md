# AWS Cloud Architecture Diagram Generator

Generate AWS architecture diagrams from natural language descriptions. Outputs valid draw.io XML files (`.drawio`) using Claude API with streaming.

## Prerequisites

- Node.js >= 18
- Anthropic API key

## Setup

```bash
npm install
npm run build
```

Set your API key:

```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

## Usage

```bash
# Basic usage
npx aws-diagram "High-availability e-commerce platform with CDN, ALB, EC2 ASG, RDS Multi-AZ, ElastiCache"

# Specify output file
npx aws-diagram --output my-arch.drawio "Serverless API with Lambda, API Gateway, DynamoDB"

# Specify architecture type
npx aws-diagram --type microservices "Order service, inventory service, notification service using ECS + SQS"

# List AWS services needed
npx aws-diagram --list-services "My architecture description"
```

### Architecture Types

- `web-app` (default) - Traditional three-tier web application
- `serverless` - Serverless architecture with Lambda, API Gateway, DynamoDB
- `microservices` - Container-based microservices with ECS/EKS

## How It Works

1. **Prompt Construction**: Builds a detailed system prompt with AWS Well-Architected Framework guidelines, layout rules, shape references, and few-shot examples
2. **XML Generation**: Sends the prompt to Claude API with streaming for real-time progress
3. **Validation**: Validates the generated XML against 6 checks (syntax, VPC presence, entry point, unique IDs, edge integrity, width limit)
4. **Retry Loop**: If validation fails, sends the errors back to Claude for correction (up to 2 retries)
5. **File Output**: Writes the validated XML as a `.drawio` file

## Project Structure

```
src/
├── index.ts                 # CLI entry point
├── api/
│   └── claude.ts            # Claude API wrapper with streaming
├── templates/
│   ├── system-prompt.ts     # System prompt construction
│   ├── shapes.ts            # AWS shape ID registry (23+ services)
│   └── examples/            # Few-shot XML examples
│       ├── three-tier-web.xml
│       ├── serverless-api.xml
│       └── microservices.xml
├── validator/
│   └── xml-validator.ts     # XML validation (6 checks)
├── generator/
│   └── diagram.ts           # Orchestration with retry loop
└── utils/
    └── file-writer.ts       # .drawio file writer
```

## Supported AWS Services

| Category | Services |
|----------|----------|
| Compute | EC2, Lambda, ECS, EKS |
| Database | RDS, Aurora, DynamoDB, ElastiCache |
| Networking | CloudFront, ALB, NLB, API Gateway, Route 53, NAT Gateway, Internet Gateway |
| Security | WAF, IAM, Cognito, Secrets Manager |
| Storage | S3 |
| Integration | SQS, SNS |
| Management | CloudWatch, CloudTrail |

## Development

```bash
# Run in development mode
npm run dev -- "your architecture description"

# Run tests
npm test

# Build
npm run build
```

## Validation Checks

Generated XML must pass:
1. Valid XML syntax (parseable by xml2js)
2. Contains at least one VPC container
3. Contains at least one entry point (ALB, Internet Gateway, or API Gateway)
4. All mxCell IDs are unique
5. All edge source/target references point to existing cells
6. Diagram width does not exceed 3000px
