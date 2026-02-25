/**
 * Few-shot example: Microservices architecture using ECS + SQS
 *
 * Demonstrates:
 * - ECS services communicating via SQS
 * - Correct points format for all container shapes
 * - Service-to-service messaging pattern
 */
export const MICROSERVICES_EXAMPLE = `<mxfile><diagram name="Microservices Architecture"><mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2800" pageHeight="1400" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>

    <!-- Internet Gateway -->
    <mxCell id="ms-igw" value="Internet Gateway" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.internet_gateway" vertex="1" parent="1">
      <mxGeometry x="1300" y="40" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- VPC: points attribute with all coords in [0,1] -->
    <mxCell id="ms-vpc" value="VPC (10.0.0.0/16)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#8C4FFF;fillColor=#F4EBFF;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="100" y="160" width="2500" height="1100" as="geometry"/>
    </mxCell>

    <!-- Public Subnet: ALB -->
    <mxCell id="ms-pub" value="Public Subnet (10.0.1.0/24)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_public_subnet;strokeColor=#147EBA;fillColor=#E6F2F8;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;" vertex="1" parent="ms-vpc">
      <mxGeometry x="80" y="80" width="2340" height="180" as="geometry"/>
    </mxCell>

    <mxCell id="ms-alb" value="ALB" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.application_load_balancer" vertex="1" parent="ms-pub">
      <mxGeometry x="1100" y="60" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- Private Subnet for ECS Services -->
    <mxCell id="ms-priv" value="Private Subnet (10.0.10.0/24)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#3F8624;fillColor=#E9F3E6;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;" vertex="1" parent="ms-vpc">
      <mxGeometry x="80" y="340" width="2340" height="280" as="geometry"/>
    </mxCell>

    <!-- ECS Services -->
    <mxCell id="ecs-order" value="ECS: Order Service" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ecs" vertex="1" parent="ms-priv">
      <mxGeometry x="300" y="110" width="60" height="60" as="geometry"/>
    </mxCell>

    <mxCell id="ecs-inventory" value="ECS: Inventory Service" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ecs" vertex="1" parent="ms-priv">
      <mxGeometry x="1100" y="110" width="60" height="60" as="geometry"/>
    </mxCell>

    <mxCell id="ecs-notify" value="ECS: Notification Service" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ecs" vertex="1" parent="ms-priv">
      <mxGeometry x="1900" y="110" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- SQS Queue -->
    <mxCell id="sqs-order" value="SQS&#xa;Order Queue" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#E7157B;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.sqs" vertex="1" parent="ms-vpc">
      <mxGeometry x="700" y="700" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- Isolated Subnet for DB -->
    <mxCell id="ms-iso" value="Isolated Subnet (10.0.20.0/24)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#CD853F;fillColor=#FFF3E0;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;" vertex="1" parent="ms-vpc">
      <mxGeometry x="80" y="820" width="2340" height="200" as="geometry"/>
    </mxCell>

    <mxCell id="ms-rds" value="RDS Aurora&#xa;(Multi-AZ)" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#2E73B8;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.aurora" vertex="1" parent="ms-iso">
      <mxGeometry x="1100" y="70" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- Edges -->
    <mxCell id="ms-e1" value="HTTPS:443" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="ms-igw" target="ms-alb" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="ms-e2" value="HTTP:8080" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="ms-alb" target="ecs-order" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="ms-e3" value="Publish" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" source="ecs-order" target="sqs-order" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="ms-e4" value="Subscribe" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" source="sqs-order" target="ecs-inventory" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="ms-e5" value="Subscribe" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" source="sqs-order" target="ecs-notify" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="ms-e6" value="Aurora:5432" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="ecs-order" target="ms-rds" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel></diagram></mxfile>`;
