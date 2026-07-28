import React from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Tag, Empty, Typography } from "antd";
import { ToolOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const AIMcpPage: React.FC = () => (
  <PageContainer header={{ title:'MCP 配置', subTitle:'Model Context Protocol Server 管理 / 工具注册', tags:[<Tag color="purple">Future</Tag>] }}>
    <Card bordered={false}>
      <Empty image={<ToolOutlined style={{fontSize:64,color:'#bfbfbf'}} />} description="MCP (Model Context Protocol) 配置模块正在规划中">
        <div style={{textAlign:'left',maxWidth:500,margin:'0 auto',color:'#8c8c8c'}}>
          <Text>计划功能：</Text>
          <ul style={{marginTop:8,lineHeight:2}}>
            <li>MCP Server 注册与连接管理</li>
            <li>工具（Tools）注册与发现</li>
            <li>资源（Resources）管理</li>
            <li>Prompt 模板共享</li>
            <li>权限与安全策略配置</li>
          </ul>
        </div>
      </Empty>
    </Card>
  </PageContainer>
);
export default AIMcpPage;
