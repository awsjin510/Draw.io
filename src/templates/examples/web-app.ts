/**
 * Few-shot example: 3-tier web application architecture
 *
 * Demonstrates:
 * - Correct points=[[...]] format for VPC and Subnet containers
 * - Correct parent hierarchy (VPC > Subnet > Service)
 * - Correct edge connections with protocol labels
 * - Multi-AZ deployment pattern
 */
export const WEB_APP_EXAMPLE = `<mxfile><diagram name="AWS Architecture"><mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2800" pageHeight="1600" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>

    <!-- Internet Gateway -->
    <mxCell id="igw" value="Internet Gateway" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.internet_gateway" vertex="1" parent="1">
      <mxGeometry x="1300" y="40" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- CloudFront -->
    <mxCell id="cf" value="CloudFront CDN" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.cloudfront" vertex="1" parent="1">
      <mxGeometry x="1300" y="140" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- VPC Container: points MUST use [0,1] range only -->
    <mxCell id="vpc" value="VPC (10.0.0.0/16)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#8C4FFF;fillColor=#F4EBFF;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="100" y="240" width="2600" height="1200" as="geometry"/>
    </mxCell>

    <!-- Public Subnet AZ-A -->
    <mxCell id="pub-a" value="Public Subnet A&#xa;(10.0.1.0/24)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_public_subnet;strokeColor=#147EBA;fillColor=#E6F2F8;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;" vertex="1" parent="vpc">
      <mxGeometry x="80" y="80" width="500" height="220" as="geometry"/>
    </mxCell>

    <!-- ALB in Public Subnet -->
    <mxCell id="alb" value="ALB&#xa;Application Load Balancer" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#8C4FFF;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.application_load_balancer" vertex="1" parent="pub-a">
      <mxGeometry x="220" y="80" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- Private Subnet AZ-A -->
    <mxCell id="priv-a" value="Private Subnet A&#xa;(10.0.11.0/24)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#3F8624;fillColor=#E9F3E6;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;" vertex="1" parent="vpc">
      <mxGeometry x="80" y="380" width="500" height="220" as="geometry"/>
    </mxCell>

    <!-- EC2 in Private Subnet -->
    <mxCell id="ec2-a" value="Web Server&#xa;t3.medium" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#ED7515;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2" vertex="1" parent="priv-a">
      <mxGeometry x="220" y="80" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- Isolated Subnet AZ-A -->
    <mxCell id="iso-a" value="Isolated Subnet A&#xa;(10.0.21.0/24)" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_private_subnet;strokeColor=#CD853F;fillColor=#FFF3E0;verticalLabelPosition=top;verticalAlign=bottom;align=center;spacingTop=25;fontStyle=0;fontSize=11;" vertex="1" parent="vpc">
      <mxGeometry x="80" y="680" width="500" height="220" as="geometry"/>
    </mxCell>

    <!-- RDS Primary -->
    <mxCell id="rds-primary" value="RDS Primary&#xa;MySQL 8.0 (Multi-AZ)" style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;fillColor=#2E73B8;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.rds" vertex="1" parent="iso-a">
      <mxGeometry x="220" y="80" width="60" height="60" as="geometry"/>
    </mxCell>

    <!-- Connections -->
    <mxCell id="e1" value="HTTPS:443" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" source="igw" target="cf" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="e2" value="HTTPS:443" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="cf" target="alb" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="e3" value="HTTP:8080" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="alb" target="ec2-a" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="e4" value="MySQL:3306" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="ec2-a" target="rds-primary" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel></diagram></mxfile>`;
