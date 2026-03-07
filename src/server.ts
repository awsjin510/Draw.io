import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { generateDiagram } from './generator/diagram';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const presets = [
  {
    id: 'web-app',
    name: '三層式 Web 應用',
    description: '高可用三層式 Web 應用，包含 CloudFront CDN、ALB 負載平衡、EC2 Web 伺服器（雙 AZ）、RDS MySQL 資料庫（Multi-AZ）',
    icon: '🌐',
  },
  {
    id: 'serverless',
    name: 'Serverless API',
    description: '無伺服器 REST API，使用 API Gateway、Lambda 函式處理請求與授權、DynamoDB 儲存資料、S3 存放靜態資源、CloudFront 加速',
    icon: '⚡',
  },
  {
    id: 'microservices',
    name: '微服務架構 (ECS)',
    description: '微服務架構，使用 ALB、ECS 容器運行訂單/庫存/通知三個服務、SQS 訊息佇列做非同步通訊、Aurora PostgreSQL 資料庫',
    icon: '🔧',
  },
];

app.get('/api/presets', (_req, res) => {
  res.json(presets);
});

app.post('/api/generate', async (req, res) => {
  const { description, type } = req.body;

  if (!description || typeof description !== 'string') {
    res.status(400).json({ error: '請提供架構描述 (description)' });
    return;
  }

  // Set 120 second timeout for Claude API calls
  req.setTimeout(120000);
  res.setTimeout(120000);

  try {
    const fullDescription = type ? `架構類型：${type}\n\n${description}` : description;

    const result = await generateDiagram(fullDescription, {
      outputFormat: 'plantuml',
      maxRetries: 2,
    });

    res.json({
      output: result.output,
      attempts: result.attempts,
      validationErrors: result.validationErrors,
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    res.status(500).json({
      error: error.message || '生成架構圖時發生錯誤',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AWS Diagram Generator Web UI running at http://localhost:${PORT}`);
});
