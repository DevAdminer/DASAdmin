import React, { useState } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Button, Space, Tag, Typography, Empty, Row, Col, Drawer, Form, Input, Select, Switch } from "antd";
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { history } from "@umijs/max";

const { Text } = Typography;

// 节点类型
interface PipelineNode {
  id: string; name: string; nodeType: string; category: string; icon: string;
  x: number; y: number;
}
const NODE_TYPES = [
  { code: "spider_input", name: "Spider Input", category: "input", icon: "📥", color: "#13c2c2" },
  { code: "cleaner", name: "Cleaner 清洗", category: "processor", icon: "🧹", color: "#fa8c16" },
  { code: "dedup", name: "Deduplicate 去重", category: "processor", icon: "🔄", color: "#fa8c16" },
  { code: "transformer", name: "Transformer 转换", category: "processor", icon: "⚙", color: "#fa8c16" },
  { code: "filter", name: "Filter 过滤", category: "processor", icon: "🔍", color: "#fa8c16" },
  { code: "ai_summary", name: "AI Summary", category: "ai", icon: "🤖", color: "#722ed1" },
  { code: "ai_embedding", name: "AI Embedding", category: "ai", icon: "🧬", color: "#722ed1" },
  { code: "ai_classify", name: "AI Classification", category: "ai", icon: "🏷", color: "#722ed1" },
  { code: "storage", name: "Storage 存储", category: "output", icon: "💾", color: "#52c41a" },
  { code: "webhook", name: "Webhook 通知", category: "output", icon: "📤", color: "#1677ff" },
  { code: "export", name: "Export 导出", category: "output", icon: "📦", color: "#1677ff" },
];

const catColors: Record<string, string> = { input: "#13c2c2", processor: "#fa8c16", ai: "#722ed1", output: "#52c41a" };
const catLabels: Record<string, string> = { input: "输入", processor: "处理", ai: "AI", output: "输出" };

const PipelineDesignerPage: React.FC = () => {
  const [nodes, setNodes] = useState<PipelineNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addNode = (type: typeof NODE_TYPES[0]) => {
    const newNode: PipelineNode = {
      id: `node_${Date.now()}`,
      name: type.name,
      nodeType: type.code,
      category: type.category,
      icon: type.icon,
      x: Math.random() * 400 + 20,
      y: Math.random() * 200 + 20,
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode?.id === id) { setSelectedNode(null); setDrawerOpen(false); }
  };

  return (
    <PageContainer
      header={{ title: "Pipeline Designer 流水线设计器", breadcrumb: {} }}
      extra={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => history.push("/pipeline/list")}>返回列表</Button>,
        <Button key="save" icon={<SaveOutlined />}>保存</Button>,
        <Button key="test" type="primary" icon={<PlayCircleOutlined />} disabled={nodes.length === 0}>测试运行</Button>,
      ]}
    >
      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 200px)" }}>
        {/* 左侧节点面板 */}
        <Card title="节点库" size="small" style={{ width: 220, flexShrink: 0, overflowY: "auto" }}>
          {["input", "processor", "ai", "output"].map(cat => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>{catLabels[cat]}</Text>
              {NODE_TYPES.filter(n => n.category === cat).map(n => (
                <div
                  key={n.code}
                  onClick={() => addNode(n)}
                  style={{
                    margin: "4px 0", padding: "8px 12px", border: `1px solid ${catColors[cat]}20`,
                    borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    background: `${catColors[cat]}08`, transition: "all 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${catColors[cat]}15`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${catColors[cat]}08`)}
                >
                  <span>{n.icon}</span>
                  <Text style={{ fontSize: 12 }}>{n.name}</Text>
                </div>
              ))}
            </div>
          ))}
        </Card>

        {/* 中间画布 */}
        <Card
          size="small"
          style={{ flex: 1, overflow: "auto" }}
          bodyStyle={{ height: "100%", position: "relative" }}
        >
          {nodes.length === 0 ? (
            <Empty description="从左侧拖入节点开始设计流水线" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => addNode(NODE_TYPES[0])}>添加第一个节点</Button>
            </Empty>
          ) : (
            <div style={{ minHeight: "100%", position: "relative", padding: 20 }}>
              {/* 连接线（简化版：顺序连线） */}
              <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                {nodes.slice(0, -1).map((_, i) => (
                  <line
                    key={i}
                    x1={nodes[i].x + 80} y1={nodes[i].y + 25}
                    x2={nodes[i + 1].x + 80} y2={nodes[i + 1].y + 25}
                    stroke="#d9d9d9" strokeWidth={2}
                    markerEnd="url(#arrow)"
                  />
                ))}
                <defs>
                  <marker id="arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#d9d9d9" />
                  </marker>
                </defs>
              </svg>
              {nodes.map((node, i) => (
                <div
                  key={node.id}
                  onClick={() => { setSelectedNode(node); setDrawerOpen(true); }}
                  style={{
                    position: "absolute", left: node.x, top: node.y,
                    width: 160, background: "#fff", border: `2px solid ${selectedNode?.id === node.id ? "#1677ff" : catColors[node.category]}60`,
                    borderRadius: 8, padding: "12px 16px", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{node.icon}</span>
                    <Text strong style={{ fontSize: 13 }}>{node.name}</Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Tag color={catColors[node.category]} style={{ fontSize: 10 }}>Step {i + 1}</Tag>
                    <Text type="secondary" style={{ fontSize: 10 }}>{catLabels[node.category]}</Text>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 右侧属性面板 */}
      <Drawer
        title={selectedNode ? `节点配置 - ${selectedNode.name}` : "节点配置"}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedNode(null); }}
        width={360}
        extra={selectedNode && <Button size="small" danger onClick={() => removeNode(selectedNode.id)}>删除节点</Button>}
      >
        {selectedNode ? (
          <Form layout="vertical">
            <Form.Item label="节点名称"><Input defaultValue={selectedNode.name} /></Form.Item>
            <Form.Item label="节点类型"><Tag color={catColors[selectedNode.category]}>{selectedNode.nodeType}</Tag></Form.Item>
            <Form.Item label="启用"><Switch defaultChecked /></Form.Item>
            <Form.Item label="参数配置">
              <Input.TextArea rows={4} defaultValue="{}" />
            </Form.Item>
          </Form>
        ) : (
          <Empty description="点击画布中的节点进行配置" />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default PipelineDesignerPage;
