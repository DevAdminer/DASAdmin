import React, { useState, useRef, useEffect, useCallback } from "react";
import { PageContainer } from "@ant-design/pro-components";
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Input,
  Switch,
  Tag,
  Typography,
  App,
  Table,
} from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { history } from "@umijs/max";

const { TextArea } = Input;
const { Text } = Typography;

const MOCK_LOGS: string[] = [
  "# Spider 启动...",
  "[INFO] Loading spider: general_news v2.1.3",
  "[INFO] Target: https://36kr.com/newsflashes",
  "[INFO] Max pages: 3 | Concurrency: 5 | Delay: 500ms",
  "[INFO] Using proxy pool: enabled",
  "[INFO] Using cookie pool: enabled",
  "[INFO] Fetching page 1...",
  "[INFO] 200 OK - 25 items found",
  "[INFO] Parsing items...",
  "[DEBUG] Item 1: {title: 'OpenAI GPT-5...', url: 'https://36kr.com/p/...'}",
  "[DEBUG] Item 2: {title: '字节跳动 Q2...', url: 'https://36kr.com/p/...'}",
  "[DEBUG] Item 3: {title: 'Rust 1.78...', url: 'https://36kr.com/p/...'}",
  "[INFO] Pipeline [clean]: 25 items",
  "[INFO] Pipeline [dedup]: 2 removed",
  "[INFO] Pipeline [ai_tag]: 23 tagged",
  "[INFO] Fetching page 2...",
  "# 实时输出中...",
];

const RESULT_COLS = [
  { title: "#", dataIndex: "key", width: 50 },
  { title: "标题", dataIndex: "title", ellipsis: true },
  { title: "URL", dataIndex: "url", width: 120 },
  { title: "摘要", dataIndex: "summary", width: 180, ellipsis: true },
  { title: "发布时间", dataIndex: "publishTime", width: 80 },
];

const MOCK_RESULTS = [
  {
    key: 1,
    title: "OpenAI 发布 GPT-5",
    url: "/p/12856",
    summary: "多模态能力大幅提升...",
    publishTime: "14:08",
  },
  {
    key: 2,
    title: "字节跳动 Q2 营收",
    url: "/p/12855",
    summary: "同比增长30%...",
    publishTime: "14:05",
  },
  {
    key: 3,
    title: "Rust 1.78 发布",
    url: "/p/12854",
    summary: "新增lazy_type_id...",
    publishTime: "13:50",
  },
  {
    key: 4,
    title: "Meta 开源 Llama 4",
    url: "/p/12852",
    summary: "70B参数开源...",
    publishTime: "13:30",
  },
  {
    key: 5,
    title: "特斯拉 Q2 超预期",
    url: "/p/12851",
    summary: "交付量创新高...",
    publishTime: "12:00",
  },
];

function logColor(line: string): string {
  if (!line) return "#d4d4d4";
  if (line.startsWith("#")) return "#6a9955";
  if (line.startsWith("[DEBUG]")) return "#6a9955";
  if (
    line.includes("200 OK") ||
    line.includes("items found") ||
    line.includes("tagged")
  )
    return "#b5cea8";
  if (line.startsWith("[INFO]")) return "#d4d4d4";
  if (line.startsWith("[WARN]")) return "#faad14";
  if (line.startsWith("[ERROR]")) return "#ff4d4f";
  return "#d4d4d4";
}

const SpiderDebugPage: React.FC = () => {
  const { message } = App.useApp();
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const [spider, setSpider] = useState("通用新闻Spider v2.1.3");
  const [targetUrl, setTargetUrl] = useState("https://36kr.com/newsflashes");
  const [maxPages, setMaxPages] = useState(3);
  const [concurrency, setConcurrency] = useState(5);
  const [delayMs, setDelayMs] = useState(500);
  const [useProxy, setUseProxy] = useState(true);
  const [useCookie, setUseCookie] = useState(true);

  const pausedRef = useRef(false);
  const timerIdRef = useRef<number | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current !== null) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, []);

  const startDebug = useCallback(() => {
    // Clear any existing timer
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    setRunning(true);
    setPaused(false);
    pausedRef.current = false;
    setLogs([]);
    setResults([]);

    let i = 0;
    timerIdRef.current = window.setInterval(() => {
      if (pausedRef.current) return;
      if (i >= MOCK_LOGS.length) {
        if (timerIdRef.current !== null) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = null;
        }
        setRunning(false);
        setResults(MOCK_RESULTS);
        message.success("调试完成：5 条数据，耗时 2.3s");
        return;
      }
      // Only add if we have a valid string
      const logLine = MOCK_LOGS[i];
      if (logLine) {
        setLogs((prev) => [...prev, logLine]);
      }
      // Scroll to bottom
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
      i++;
    }, 200);
  }, [message]);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const resetDebug = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    setRunning(false);
    setPaused(false);
    setLogs([]);
    setResults([]);
  }, []);

  return (
    <PageContainer
      header={{
        title: "爬虫调试",
        subTitle: "在线调试 / 试运行 / 实时输出",
        breadcrumb: {},
      }}
      extra={[
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push("/spider/list")}
        >
          返回列表
        </Button>,
        <Button
          key="run"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={startDebug}
          disabled={running}
        >
          运行
        </Button>,
        <Button key="pause" onClick={togglePause} disabled={!running}>
          暂停
        </Button>,
        <Button key="reset" icon={<ReloadOutlined />} onClick={resetDebug}>
          重置
        </Button>,
      ]}
    >
      <Row gutter={16}>
        <Col span={12} style={{ display: "flex" }}>
          <Card title="调试参数" style={{ flex: 1, width: "100%" }}>
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                }}
              >
                Spider
              </Text>
              <Select
                value={spider}
                onChange={setSpider}
                style={{ width: "calc(100% - 95px)" }}
              >
                <Select.Option value="通用新闻Spider v2.1.3">
                  通用新闻Spider v2.1.3
                </Select.Option>
                <Select.Option value="微博Spider v1.8.0">
                  微博Spider v1.8.0
                </Select.Option>
              </Select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                  verticalAlign: "top",
                  paddingTop: 4,
                }}
              >
                目标 URL
              </Text>
              <TextArea
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                rows={2}
                style={{ width: "calc(100% - 95px)", display: "inline-block" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                }}
              >
                最大页数
              </Text>
              <Input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                style={{ width: 100 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                }}
              >
                并发数
              </Text>
              <Input
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                style={{ width: 100 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                }}
              >
                延迟(ms)
              </Text>
              <Input
                type="number"
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                style={{ width: 100 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                }}
              >
                使用代理
              </Text>
              <Switch checked={useProxy} onChange={setUseProxy} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                }}
              >
                使用 Cookie
              </Text>
              <Switch checked={useCookie} onChange={setUseCookie} />
            </div>
            <div>
              <Text
                style={{
                  display: "inline-block",
                  width: 80,
                  textAlign: "right",
                  marginRight: 12,
                }}
              >
                断点调试
              </Text>
              <Switch />
            </div>
          </Card>
        </Col>
        <Col span={12} style={{ display: "flex" }}>
          <Card
            title="实时输出"
            extra={
              running ? (
                <Tag color="green">运行中</Tag>
              ) : paused ? (
                <Tag color="gold">已暂停</Tag>
              ) : (
                <Tag>空闲</Tag>
              )
            }
            style={{ flex: 1, width: "100%" }}
          >
            <div
              ref={logRef}
              style={{
                background: "#1e1e1e",
                color: "#d4d4d4",
                minHeight: 360,
                maxHeight: 360,
                padding: "14px 16px",
                borderRadius: 8,
                fontSize: 12,
                lineHeight: 1.9,
                overflowY: "auto",
                fontFamily: "SF Mono, Consolas, monospace",
              }}
            >
              {logs.length === 0 && !running && (
                <div style={{ color: "#6a9955" }}>
                  # 点击「运行」开始调试...
                </div>
              )}
              {logs.filter(Boolean).map((line, i) => (
                <div key={i} style={{ color: logColor(line) }}>
                  {line}
                </div>
              ))}
              {running && !paused && (
                <div style={{ color: "#6a9955" }}># 实时输出中...</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 采集结果预览 */}
      {results.length > 0 && (
        <Card title="采集结果预览" style={{ marginTop: 16 }}>
          <Table
            rowKey="key"
            columns={RESULT_COLS}
            dataSource={results}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default SpiderDebugPage;
