/**
 * Few-shot example: Serverless API architecture
 *
 * Demonstrates:
 * - API Gateway + Lambda + DynamoDB pattern
 * - S3 for static assets
 * - Correct points format for containers
 */
export const SERVERLESS_EXAMPLE = `<mxfile><diagram name="Serverless Architecture"><mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2800" pageHeight="1200" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>

    <!-- CloudFront -->
    <mxCell id="cf-sl" value="CloudFront" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.cloudfront" vertex="1" parent="1">
      <mxGeometry x="400" y="40" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- API Gateway -->
    <mxCell id="apigw" value="API Gateway&#xa;REST API" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.api_gateway" vertex="1" parent="1">
      <mxGeometry x="400" y="160" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- S3 Static -->
    <mxCell id="s3-static" value="S3&#xa;Static Assets" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#7AA116;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.s3" vertex="1" parent="1">
      <mxGeometry x="200" y="160" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- VPC -->
    <mxCell id="vpc-sl" value="VPC (10.0.0.0/16)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#8C4FFF;fillColor=#F4EBFF;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="100" y="300" width="1400" height="600" as="geometry"/>
    </mxCell>

    <!-- Private Subnet for Lambda -->
    <mxCell id="lambda-subnet" value="Private Subnet&#xa;(10.0.10.0/24)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#3F8624;fillColor=#E9F3E6;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;" vertex="1" parent="vpc-sl">
      <mxGeometry x="80" y="80" width="600" height="200" as="geometry"/>
    </mxCell>

    <!-- Lambda Functions -->
    <mxCell id="lambda-api" value="Lambda&#xa;API Handler" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.lambda" vertex="1" parent="lambda-subnet">
      <mxGeometry x="100" y="70" width="60" height="60" as="geometry"/>
    </mxCell>

    <mxCell id="lambda-auth" value="Lambda&#xa;Authorizer" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.lambda" vertex="1" parent="lambda-subnet">
      <mxGeometry x="400" y="70" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- DynamoDB -->
    <mxCell id="ddb" value="DynamoDB&#xa;On-Demand" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#2E73B8;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.dynamodb" vertex="1" parent="vpc-sl">
      <mxGeometry x="700" y="200" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- Edges -->
    <mxCell id="sl-e1" value="HTTPS:443" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="cf-sl" target="apigw" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="sl-e2" value="HTTPS:443" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="cf-sl" target="s3-static" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="sl-e3" value="Invoke" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="apigw" target="lambda-api" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="sl-e4" value="DynamoDB API" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="lambda-api" target="ddb" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel></diagram></mxfile>`;
