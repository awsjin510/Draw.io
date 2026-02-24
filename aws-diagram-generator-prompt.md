# AWS 雲端架構圖產生器 — Claude Code 需求說明

## 專案概述

開發一個 **AWS 雲端架構圖產生器**，使用者透過自然語言描述需求，系統自動產出符合 AWS 官方架構最佳實踐的 **draw.io XML 格式**檔案。

---

## 技術棧

- **後端**：Node.js (TypeScript) 或 Python
- **AI 引擎**：Claude API (`claude-sonnet-4-5` 或更新版本)
- **輸出格式**：draw.io XML (`.drawio`)
- **介面**：CLI 工具 或 簡單 Web UI (可選)

---

## 核心功能需求

### 1. 自然語言輸入
使用者輸入架構描述，例如：
```
建立一個高可用的電商平台，需要前端 CDN、
應用伺服器 Auto Scaling、RDS 主從架構、
ElastiCache 快取、S3 靜態資源，部署在 ap-northeast-1
```

### 2. AWS 架構設計原則（必須遵守）
系統在生成架構圖時，**必須依照以下 AWS Well-Architected Framework 六大支柱**：

#### 🏗 卓越運營 (Operational Excellence)
- 包含 CloudWatch 監控與告警
- 加入 CloudTrail 稽核日誌
- 使用 Systems Manager 進行參數管理

#### 🔒 安全性 (Security)
- 每個服務部署在正確的網路層（Public / Private / Isolated Subnet）
- 加入 WAF 保護公開端點
- IAM Role 標示於各服務旁
- Secrets Manager 管理憑證

#### 🔄 可靠性 (Reliability)
- 多 AZ 部署（至少 2 個可用區）
- 自動擴展機制（Auto Scaling Group）
- 跨 AZ 的負載均衡（ALB / NLB）
- 備份策略（RDS Multi-AZ、S3 Cross-Region Replication）

#### ⚡ 效能效率 (Performance Efficiency)
- CDN（CloudFront）用於靜態與動態加速
- ElastiCache 快取層
- 選用合適的資料庫類型（RDS / DynamoDB / Aurora）

#### 💰 成本優化 (Cost Optimization)
- Spot Instance 用於非關鍵工作負載
- S3 儲存生命週期策略
- 標示 Reserved Instance 建議

#### 🌱 永續性 (Sustainability)
- 資源適當調整大小（Right Sizing 備註）

---

### 3. draw.io XML 產出規格

#### AWS 官方圖示規範
使用 draw.io 內建的 AWS 官方 Shape Library，格式如下：

```xml
<!-- VPC 容器範例 -->
<mxCell id="vpc1" value="VPC (10.0.0.0/16)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#8C4FFF;fillColor=#F4EBFF;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=14;" vertex="1" parent="1">
  <mxGeometry x="80" y="80" width="800" height="600" as="geometry"/>
</mxCell>

<!-- EC2 Instance 範例 -->
<mxCell id="ec2-1" value="Web Server&#xa;t3.medium" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2" vertex="1" parent="subnet-public">
  <mxGeometry x="100" y="80" width="60" height="60" as="geometry"/>
</mxCell>

<!-- ALB 範例 -->
<mxCell id="alb-1" value="Application&#xa;Load Balancer" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.application_load_balancer" vertex="1" parent="1">
  <mxGeometry x="350" y="200" width="60" height="60" as="geometry"/>
</mxCell>
```

#### 佈局規則（Layout Rules）
```
Internet Gateway
      ↓
  CloudFront / WAF
      ↓
  Public Subnet (ALB, NAT Gateway, Bastion Host)
      ↓
  Private Subnet (EC2 ASG, ECS, Lambda)
      ↓
  Isolated Subnet (RDS, ElastiCache, OpenSearch)
```

- 從上到下：Internet → Public → Private → Data 層
- 從左到右：主要流量路徑
- VPC 使用圓角矩形容器包覆
- Subnet 使用不同底色區分（Public=淺藍、Private=淺綠、Isolated=淺橘）
- Region 使用虛線框標示
- AZ 使用灰色虛線框區分

#### 連線樣式
- **實線箭頭**：主要資料流
- **虛線箭頭**：管理流 / 非同步流
- **雙向箭頭**：雙向通訊（如 EC2 ↔ RDS）
- 連線需標示 **Port / Protocol**（例如：HTTPS:443、MySQL:3306）

---

### 4. 常用 AWS 服務的 draw.io Shape ID 對照表

| AWS 服務 | Shape Style 關鍵字 |
|---------|-----------------|
| EC2 | `resIcon=mxgraph.aws4.ec2` |
| RDS | `resIcon=mxgraph.aws4.rds` |
| S3 | `resIcon=mxgraph.aws4.s3` |
| Lambda | `resIcon=mxgraph.aws4.lambda` |
| CloudFront | `resIcon=mxgraph.aws4.cloudfront` |
| ALB | `resIcon=mxgraph.aws4.application_load_balancer` |
| NLB | `resIcon=mxgraph.aws4.network_load_balancer` |
| API Gateway | `resIcon=mxgraph.aws4.api_gateway` |
| DynamoDB | `resIcon=mxgraph.aws4.dynamodb` |
| ElastiCache | `resIcon=mxgraph.aws4.elasticache` |
| SQS | `resIcon=mxgraph.aws4.sqs` |
| SNS | `resIcon=mxgraph.aws4.sns` |
| ECS | `resIcon=mxgraph.aws4.ecs` |
| EKS | `resIcon=mxgraph.aws4.eks` |
| CloudWatch | `resIcon=mxgraph.aws4.cloudwatch` |
| IAM | `resIcon=mxgraph.aws4.role` |
| VPC | `grIcon=mxgraph.aws4.group_vpc` |
| Subnet | `grIcon=mxgraph.aws4.group_public_subnet` |
| WAF | `resIcon=mxgraph.aws4.waf` |
| Route 53 | `resIcon=mxgraph.aws4.route_53` |
| NAT Gateway | `resIcon=mxgraph.aws4.nat_gateway` |
| Internet Gateway | `resIcon=mxgraph.aws4.internet_gateway` |
| Cognito | `resIcon=mxgraph.aws4.cognito` |
| Secrets Manager | `resIcon=mxgraph.aws4.secrets_manager` |
| CloudTrail | `resIcon=mxgraph.aws4.cloudtrail` |
| Aurora | `resIcon=mxgraph.aws4.aurora` |

---

### 5. Claude API Prompt 設計

#### System Prompt（核心）
```
你是一位 AWS 資深解決方案架構師，專精於設計符合 AWS Well-Architected Framework 的雲端架構。

你的任務是將使用者的需求轉換為 draw.io XML 格式的 AWS 架構圖。

遵守以下規則：
1. 輸出必須是完整合法的 draw.io XML，可直接開啟使用
2. 使用 mxgraph.aws4.* 官方圖示
3. 架構必須包含：VPC、至少 2 個 AZ、適當的 Subnet 分層
4. 每個元件需標示：服務名稱、Instance Type 或規格（如已知）
5. 必須包含安全邊界（Security Group 標示）
6. 佈局從上到下：Internet → Load Balancer → Application → Database
7. 輸出格式：只回傳 XML，不包含任何說明文字

XML 根結構：
<mxfile><diagram name="AWS Architecture"><mxGraphModel>
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <!-- 所有元件 -->
  </root>
</mxGraphModel></diagram></mxfile>
```

---

### 6. 程式架構

```
aws-diagram-generator/
├── src/
│   ├── index.ts              # 主入口 (CLI)
│   ├── api/
│   │   └── claude.ts         # Claude API 呼叫封裝
│   ├── templates/
│   │   ├── system-prompt.ts  # System Prompt 管理
│   │   ├── shapes.ts         # AWS Shape ID 對照表
│   │   └── examples/         # Few-shot 範例 XML
│   ├── validator/
│   │   └── xml-validator.ts  # 驗證輸出 XML 是否合法
│   ├── generator/
│   │   └── diagram.ts        # 主要生成邏輯
│   └── utils/
│       └── file-writer.ts    # 寫出 .drawio 檔案
├── output/                   # 產出的 .drawio 檔案
├── package.json
└── README.md
```

---

### 7. CLI 使用範例

```bash
# 基本使用
npx aws-diagram "高可用電商平台，需要 CDN、ALB、EC2 ASG、RDS Multi-AZ、ElastiCache"

# 指定輸出檔名
npx aws-diagram --output my-arch.drawio "Serverless API with Lambda, API Gateway, DynamoDB"

# 指定架構類型（預設：web-app）
npx aws-diagram --type microservices "訂單服務、庫存服務、通知服務，使用 ECS + SQS"

# 顯示使用的 AWS 服務清單
npx aws-diagram --list-services "我的需求描述"
```

---

### 8. 品質驗證清單

產出的 XML 必須通過以下檢查：
- [ ] XML 語法合法（可用 xml2js 解析）
- [ ] 包含至少一個 VPC 容器
- [ ] 包含至少一個 ALB 或 Internet Gateway
- [ ] 所有 mxCell 的 id 唯一不重複
- [ ] 連線（edge）的 source/target 對應到實際存在的元件
- [ ] 圖表寬度不超過 3000px（避免 draw.io 顯示異常）

---

### 9. 延伸功能（Phase 2）

- **架構模板庫**：內建 10+ 常見架構模板（三層式、Serverless、Microservices、Data Pipeline）
- **成本估算**：根據架構元件呼叫 AWS Pricing API 估算月費
- **安全掃描**：自動標示不符合安全最佳實踐的配置（如 DB 放在 Public Subnet）
- **Terraform 輸出**：同步產出對應的 Terraform HCL 骨架
- **Web UI**：React 介面，左側輸入、右側即時預覽（嵌入 draw.io viewer）

---

## 給 Claude Code 的補充說明

> 請依照上述規格開發此工具。開發時請注意：
> 1. Claude API 呼叫需使用 streaming，讓使用者看到生成進度
> 2. 若第一次產出的 XML 驗證失敗，自動 retry 並在 prompt 中加入錯誤訊息請 Claude 修正
> 3. Few-shot 範例非常重要，請在 `templates/examples/` 中準備至少 3 個完整的參考 XML
> 4. draw.io XML 中的 `mxGeometry` 座標需要精心計算，避免元件重疊
> 5. 優先確保輸出 XML 在 draw.io 桌面版和 diagrams.net 網頁版都能正確開啟

