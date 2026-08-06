import React, { useState, useEffect, useRef } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Button, Space, Tag, Typography, Empty, Drawer, Form, Input, Switch, App } from "antd";
import { ArrowLeftOutlined, SaveOutlined, PlayCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { history, useSearchParams } from "@umijs/max";
import { pipelineDetail, savePipelineGraph } from "../service";

const { Text } = Typography;

interface CanvasNode {
  uid?: string;
  id: string;
  name: string;
  nodeType: string;
  category: string;
  icon: string;
  x: number;
  y: number;
}

// 内置节点类型（nodeTypes 接口未 seed 时兜底）
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
  const [searchParams] = useSearchParams();
  const pipelineUid = searchParams.get("uid");
  const { message } = App.useApp();

  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [nodeEnabled, setNodeEnabled] = useState(true);
  const [nodeConfig, setNodeConfig] = useState("{}");

  // 拖拽状态：moved=true 表示发生了拖拽（用于区分点击/拖动）
  const dragState = useRef<{ moved: boolean }>({ moved: false });

  /** 节点拖拽（mousedown → 全局 mousemove/mouseup） */
  const startDrag = (e: React.MouseEvent, node: CanvasNode) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    dragState.current.moved = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = node.x;
    const origY = node.y;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragState.current.moved = true;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === node.id
            ? { ...n, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) }
            : n
        )
      );
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // 打开时加载已有画布
  useEffect(() => {
    if (!pipelineUid) return;
    pipelineDetail(pipelineUid)
      .then((res) => {
        const detail = res.data;
        const loaded: CanvasNode[] = (detail.nodes || []).map((n: any, i: number) => {
          const type =
            NODE_TYPES.find((t) => t.code === n.nodeTypeCode) ||
            NODE_TYPES[Math.min(i, NODE_TYPES.length - 1)];
          return {
            uid: n.uid,
            id: n.uid || `node_${Date.now()}_${i}`,
            name: n.name || type.name,
            nodeType: n.nodeTypeCode || type.code,
            category: type.category,
            icon: type.icon,
            x: n.x ?? n.positionX ?? i * 60,
            y: n.y ?? n.positionY ?? i * 40,
          };
        });
        setNodes(loaded);
      })
      .catch(() => message.error("加载流水线失败"));
  }, [pipelineUid]);

  // 画布容器宽度（用于自适应居中布局）
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(900);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const measure = () => setCanvasWidth(el.clientWidth || 900);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 蛇形自动布局参数
  const NODE_W = 160;      // 节点宽
  const NODE_GAP_X = 60;   // 行内最小水平间距
  const NODE_H = 60;       // 节点高
  const NODE_GAP_Y = 70;   // 行间距（加大，避免上下行节点紧贴）
  const CANVAS_PAD = 20;   // 画布内边距

  /**
   * 蛇形坐标：行内 space-between 均匀分布 + 整行居中；
   * 第 1 行��→右，第 2 行右→左，第 3 行左→右…
   */
  const getAutoPos = (index: number) => {
    const inner = Math.max(1, canvasWidth - CANVAS_PAD * 2);
    // 每行节点数：按画布宽度自适应
    const perRow = Math.max(1, Math.floor((inner + NODE_GAP_X) / (NODE_W + NODE_GAP_X)));
    const row = Math.floor(index / perRow);
    const col = index % perRow;

    // space-between 均匀分布：首节点贴左、尾节点贴右、中间均分；单节点时居中
    let x: number;
    if (perRow === 1 || inner <= NODE_W) {
      x = CANVAS_PAD + (inner - NODE_W) / 2;
    } else {
      const step = (inner - NODE_W) / (perRow - 1);
      x = CANVAS_PAD + col * step;
    }
    // 蛇形：奇数行从右往左
    if (row % 2 === 1) {
      x = CANVAS_PAD + inner - (x - CANVAS_PAD) - NODE_W;
    }
    const y = CANVAS_PAD + row * (NODE_H + NODE_GAP_Y);
    return { x, y };
  };

  const addNode = (type: typeof NODE_TYPES[0]) => {
    const pos = getAutoPos(nodes.length);
    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      name: type.name,
      nodeType: type.code,
      category: type.category,
      icon: type.icon,
      x: pos.x,
      y: pos.y,
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
      setDrawerOpen(false);
    }
  };

  const handleSelectNode = (node: CanvasNode) => {
    setSelectedNode(node);
    setNodeName(node.name);
    setNodeEnabled(true);
    setNodeConfig("{}");
    setDrawerOpen(true);
  };

  const updateNodeName = () => {
    if (!selectedNode) return;
    setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, name: nodeName } : n)));
    setSelectedNode({ ...selectedNode, name: nodeName });
    message.success("节点名称已更新");
  };

  const handleSave = async () => {
    if (!pipelineUid) {
      message.error("缺少流水线标识");
      return;
    }
    setSaving(true);
    try {
      const payloadNodes = nodes.map((n) => ({
        uid: n.uid,
        nodeTypeCode: n.nodeType,
        name: n.name,
        config: { enabled: true },
        x: n.x,
        y: n.y,
      }));
      // 简化连接：按画布顺序首尾相连
      const payloadConnections = nodes.slice(0, -1).map((n, i) => ({
        source: n.uid || n.id,
        target: nodes[i + 1].uid || nodes[i + 1].id,
      }));
      const res = await savePipelineGraph(pipelineUid, payloadNodes, payloadConnections);
      message.success(`已保存 ${res.data.nodeCount} 个节点、${res.data.connectionCount} 条连接`);
    } catch (e: any) {
      message.error(e?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = () => {
    message.info("流水线测试运行：需绑定任务后通过任务触发执行");
  };

  return (
    <PageContainer
      header={{ title: `Pipeline Designer ${pipelineUid ? "" : "（新画布）"}`, breadcrumb: {} }}
      extra={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => history.push("/pipeline/list")}>
          返回列表
        </Button>,
        <Button key="save" icon={<SaveOutlined />} loading={saving} onClick={handleSave} disabled={!pipelineUid}>
          保存
        </Button>,
        <Button key="test" type="primary" icon={<PlayCircleOutlined />} disabled={nodes.length === 0} onClick={handleTest}>
          测试运行
        </Button>,
      ]}
    >
      <div style={{ display: "flex", gap: 16, height: "calc(100vh - 200px)" }}>
        {/* 左侧节点面板 */}
        <Card title="节点库" size="small" style={{ width: 220, flexShrink: 0, overflowY: "auto" }}>
          {["input", "processor", "ai", "output"].map((cat) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>
                {catLabels[cat]}
              </Text>
              {NODE_TYPES.filter((n) => n.category === cat).map((n) => (
                <div
                  key={n.code}
                  onClick={() => addNode(n)}
                  style={{
                    margin: "4px 0", padding: "8px 12px", border: `1px solid ${catColors[cat]}20`,
                    borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    background: `${catColors[cat]}08`, transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${catColors[cat]}15`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = `${catColors[cat]}08`)}
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
          ref={canvasRef}
          size="small"
          style={{ flex: 1, overflow: "auto" }}
          styles={{ body: { height: "100%", position: "relative", padding: 0 } }}
        >
          {nodes.length === 0 ? (
            <Empty
              description="从左侧拖入节点开始设计流水线"
              style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={() => addNode(NODE_TYPES[0])}>
                添加第一个节点
              </Button>
            </Empty>
          ) : (
            <div style={{ minHeight: "100%", position: "relative", padding: 20 }}>
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
                  onMouseDown={(e) => startDrag(e, node)}
                  onClick={() => {
                    // 拖拽过则不触发选中（区分点击/拖动）
                    if (!dragState.current.moved) handleSelectNode(node);
                  }}
                  style={{
                    position: "absolute", left: node.x, top: node.y,
                    width: 160, background: "#fff",
                    border: `2px solid ${selectedNode?.id === node.id ? "#1677ff" : catColors[node.category]}60`,
                    borderRadius: 8, padding: "12px 16px", cursor: "grab",
                    boxShadow: "0 1px 4px rgba(0,0,0,.08)", transition: "box-shadow 0.2s",
                    userSelect: "none", WebkitUserSelect: "none",
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

      {/* 节点属性面板 */}
      <Drawer
        title={selectedNode ? `节点配置 - ${selectedNode.name}` : "节点配置"}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedNode(null);
        }}
        width={360}
        extra={selectedNode && (
          <Space>
            <Button size="small" type="primary" onClick={updateNodeName}>应用</Button>
            <Button size="small" danger onClick={() => removeNode(selectedNode.id)}>删除节点</Button>
          </Space>
        )}
      >
        {selectedNode ? (
          <Form layout="vertical">
            <Form.Item label="节点名称">
              <Input value={nodeName} onChange={(e) => setNodeName(e.target.value)} />
            </Form.Item>
            <Form.Item label="节点类型">
              <Tag color={catColors[selectedNode.category]}>{selectedNode.nodeType}</Tag>
            </Form.Item>
            <Form.Item label="启用">
              <Switch checked={nodeEnabled} onChange={setNodeEnabled} />
            </Form.Item>
            <Form.Item label="参数配置">
              <Input.TextArea rows={4} value={nodeConfig} onChange={(e) => setNodeConfig(e.target.value)} />
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
