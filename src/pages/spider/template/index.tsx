import React, { useState, useEffect, useMemo } from "react";
import { PageContainer } from "@ant-design/pro-components";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Space,
  Input,
  Select,
  App,
  Typography,
  Empty,
  Spin,
  Tooltip,
  Popconfirm,
  Modal,
  Form,
  Radio,
} from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  CodeOutlined,
  SaveOutlined,
  FieldBinaryOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { history } from "@umijs/max";
import {
  listSpiderTemplates,
  SpiderTemplateResponse,
  TemplateStatus,
} from "./service";
import type { FieldMapping } from "./service";

const { Text, Title } = Typography;
const { TextArea } = Input;

// 来源类型配置
const sourceTypeMap: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  html: { label: "HTML", color: "blue", icon: "🌐" },
  rss: { label: "RSS", color: "orange", icon: "📡" },
  json_api: { label: "JSON API", color: "purple", icon: "🔌" },
  playwright: { label: "Playwright", color: "cyan", icon: "🎭" },
};

// 内置模板数据
const BUILTIN_TEMPLATES = [
  {
    id: "builtin-news",
    name: "通用新闻采集",
    code: "news_general",
    sourceType: "html",
    description:
      "适用于通用新闻网站、博客平台，支持CSS选择器提取标题、正文、发布时间、作者、图片等字段。",
    version: "v1.2",
    icon: "📰",
    category: "news",
    codeSnippet: `class NewsSpider(BaseSpider):
    display_name = "通用新闻采集"
    source_type = "html"
    version = "1.2.0"
    
    async def crawl(self):
        resp = await self.fetch(self.config['url'])
        for item in self.parse_items(resp.text):
            yield CrawlItem(**item)`,
    fieldMapping: [
      {
        source_field: "article_title",
        target_field: "title",
        field_type: "string",
        transformer: "h1.article-title",
      },
      {
        source_field: "content_body",
        target_field: "content",
        field_type: "text",
        transformer: "div.article-content",
      },
      {
        source_field: "publish_date",
        target_field: "publishTime",
        field_type: "datetime",
        transformer: "span.date",
      },
      {
        source_field: "author_name",
        target_field: "author",
        field_type: "string",
        transformer: "span.author",
      },
      {
        source_field: "image_url",
        target_field: "image",
        field_type: "string",
        transformer: "img.featured | src",
      },
    ],
    configSchema: [
      {
        name: "url",
        label: "目标URL",
        type: "string",
        required: true,
        placeholder: "https://example.com/news",
      },
      {
        name: "encoding",
        label: "页面编码",
        type: "select",
        default: "utf-8",
        options: ["utf-8", "gbk", "gb2312"],
      },
      { name: "maxPages", label: "最大页数", type: "number", default: 1 },
      {
        name: "delaySeconds",
        label: "请求间隔(秒)",
        type: "number",
        default: 1,
      },
    ],
  },
  {
    id: "builtin-social",
    name: "社交媒体采集",
    code: "social_media",
    sourceType: "playwright",
    description:
      "适用于微博、知乎等社交媒体平台，支持Playwright模拟浏览器交互、自动滚动、登录态维持。",
    version: "v1.0",
    icon: "💬",
    category: "social",
    codeSnippet: `class SocialSpider(BaseSpider):
    display_name = "社交媒体采集"
    source_type = "playwright"
    version = "1.0.0"
    
    async def crawl(self):
        page = await self.get_page()
        await page.goto(self.config['url'])
        for _ in range(self.config['scrollCount']):
            await page.evaluate("window.scrollTo(0,document.body.scrollHeight)")
            await asyncio.sleep(1)
        items = await self.extract_items(page)
        for item in items:
            yield CrawlItem(**item)`,
    fieldMapping: [
      {
        source_field: "post_text",
        target_field: "content",
        field_type: "text",
        transformer: "div.post-text",
      },
      {
        source_field: "author_info",
        target_field: "author",
        field_type: "string",
        transformer: "a.author-name",
      },
      {
        source_field: "post_time",
        target_field: "publishTime",
        field_type: "datetime",
        transformer: "time.post-time",
      },
    ],
    configSchema: [
      { name: "url", label: "目标URL", type: "string", required: true },
      { name: "scrollCount", label: "滚动次数", type: "number", default: 5 },
      { name: "needLogin", label: "需要登录", type: "boolean", default: false },
    ],
  },
  {
    id: "builtin-api",
    name: "API接口采集",
    code: "api_data",
    sourceType: "json_api",
    description:
      "适用于REST API数据采集，支持GET/POST请求、JSON/XML响应解析、自定义Header和字段映射。",
    version: "v1.0",
    icon: "🔌",
    category: "api",
    codeSnippet: `class ApiSpider(BaseSpider):
    display_name = "API接口采集"
    source_type = "json_api"
    version = "1.0.0"
    
    async def crawl(self):
        method = self.config.get('method', 'GET')
        resp = await self.fetch(self.config['url'], method=method)
        data = self.get_json_path(resp.json(), self.config['dataPath'])
        for item in data[:self.config.get('limit', 100)]:
            yield CrawlItem(**item)`,
    fieldMapping: [
      {
        source_field: "data.title",
        target_field: "title",
        field_type: "string",
        transformer: "title",
      },
      {
        source_field: "data.content",
        target_field: "content",
        field_type: "text",
        transformer: "content",
      },
      {
        source_field: "data.updatedAt",
        target_field: "publishTime",
        field_type: "datetime",
        transformer: "updatedAt",
      },
      {
        source_field: "data.id",
        target_field: "sourceId",
        field_type: "string",
        transformer: "id",
      },
      {
        source_field: "data.url",
        target_field: "sourceUrl",
        field_type: "string",
        transformer: "url",
      },
    ],
    configSchema: [
      { name: "url", label: "API地址", type: "string", required: true },
      {
        name: "method",
        label: "请求方法",
        type: "select",
        default: "GET",
        options: ["GET", "POST"],
      },
      {
        name: "dataPath",
        label: "数据路径",
        type: "string",
        default: "data.list",
      },
      { name: "limit", label: "最大条数", type: "number", default: 100 },
    ],
  },
];

// 提取器类型映射
const extractorTypes: Record<string, string> = {
  css: "CSS选择器",
  xpath: "XPath",
  jsonpath: "JSONPath",
  regex: "正则",
  css_attr: "CSS属性",
};

const SpiderTemplatePage: React.FC = () => {
  const { message } = App.useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(
    BUILTIN_TEMPLATES[0]
  );
  const [templates, setTemplates] = useState<SpiderTemplateResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(
    BUILTIN_TEMPLATES[0].fieldMapping as FieldMapping[]
  );
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSpiderName, setNewSpiderName] = useState("");
  const [newSpiderCode, setNewSpiderCode] = useState("");
  const [newSpiderSourceType, setNewSpiderSourceType] = useState("html");
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [newTemplateForm] = Form.useForm();

  // 加载自定义模板列表
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await listSpiderTemplates({ page: 1, pageSize: 100 });
      setTemplates(res.items || []);
    } catch {
      /* 后端未就绪时忽略 */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // 选择模板时更新字段映射和代码
  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    setFieldMappings([...((tpl.fieldMapping as any[]) || [])]);
    const defaults: Record<string, any> = {};
    (tpl.configSchema || []).forEach((c: any) => {
      if (c.default !== undefined) defaults[c.name] = c.default;
    });
    setConfigValues(defaults);
  };

  // 字段映射操作
  const addFieldMapping = () => {
    setFieldMappings([
      ...fieldMappings,
      {
        source_field: "",
        target_field: "",
        field_type: "string" as const,
        transformer: "",
      },
    ]);
  };
  const updateFieldMapping = (index: number, key: string, value: string) => {
    const updated = [...fieldMappings];
    (updated[index] as any)[key] = value;
    setFieldMappings(updated);
  };
  const removeFieldMapping = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  // 创建爬虫
  const handleCreateSpider = async () => {
    if (!newSpiderName.trim()) {
      message.error("请输入爬虫名称");
      return;
    }
    if (!newSpiderCode.trim()) {
      message.error("请输入爬虫编码");
      return;
    }
    message.success(`爬虫 "${newSpiderName}" 创建成功`);
    setCreateModalOpen(false);
    history.push("/spider/list");
  };

  const selectedSourceInfo = sourceTypeMap[selectedTemplate.sourceType] || {
    label: selectedTemplate.sourceType,
    color: "default",
    icon: "📄",
  };
  const isBuiltin = selectedTemplate.id?.startsWith("builtin-");

  return (
    <PageContainer
      header={{
        title: "爬虫模板",
        subTitle: "选择模板 → 编辑代码 → 配置字段映射 → 创建爬虫",
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
          key="new"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setNewTemplateOpen(true)}
        >
          新建模板
        </Button>,
      ]}
    >
      <Row gutter={16} style={{ height: "calc(100vh - 200px)" }}>
        {/* ===== 左侧：模板列表 ===== */}
        <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
          <Card size="small" title="内置模板" style={{ marginBottom: 12 }}>
            {BUILTIN_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  marginBottom: 8,
                  borderRadius: 8,
                  border: "2px solid",
                  borderColor:
                    selectedTemplate?.id === tpl.id ? "#1677ff" : "#f0f0f0",
                  background:
                    selectedTemplate?.id === tpl.id ? "#e6f4ff" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{tpl.icon}</span>
                  <div>
                    <Text strong>{tpl.name}</Text>
                    <div style={{ marginTop: 2 }}>
                      <Tag color={sourceTypeMap[tpl.sourceType]?.color}>
                        {sourceTypeMap[tpl.sourceType]?.label || tpl.sourceType}
                      </Tag>
                      <Tag color="green">{tpl.version}</Tag>
                    </div>
                  </div>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {tpl.description.slice(0, 60)}...
                </Text>
              </div>
            ))}
          </Card>

          <Card size="small" title={`我的模板 (${templates.length})`}>
            <Spin spinning={loading}>
              {templates.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无自定义模板"
                  style={{ padding: "20px 0" }}
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setNewTemplateOpen(true)}
                  >
                    新建模板
                  </Button>
                </Empty>
              ) : (
                templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() =>
                      handleSelectTemplate({
                        ...tpl,
                        code: tpl.id,
                        sourceType: tpl.spider_type,
                        icon: tpl.icon || "📄",
                        version: `v${tpl.version}`,
                        configSchema: [],
                        codeSnippet: tpl.code_template || "",
                        fieldMapping: tpl.field_mapping || [],
                      })
                    }
                    style={{
                      cursor: "pointer",
                      padding: "10px 12px",
                      marginBottom: 6,
                      borderRadius: 6,
                      border: "1px solid #f0f0f0",
                      background:
                        selectedTemplate?.id === tpl.id ? "#e6f4ff" : "#fafafa",
                    }}
                  >
                    <Text strong>{tpl.name}</Text>
                    <div>
                      <Tag color={sourceTypeMap[tpl.spider_type]?.color}>
                        {tpl.spider_type}
                      </Tag>{" "}
                      <Tag>{tpl.status}</Tag>
                    </div>
                  </div>
                ))
              )}
            </Spin>
          </Card>
        </Col>

        {/* ===== 中间：代码编辑器 ===== */}
        <Col span={11} style={{ height: "100%" }}>
          <Card
            size="small"
            title={
              <Space>
                <CodeOutlined /> 代码编辑器
              </Space>
            }
            extra={
              <Space>
                <Select value="python" style={{ width: 100 }} disabled>
                  <Select.Option value="python">Python</Select.Option>
                </Select>
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  disabled={!isBuiltin}
                >
                  保存
                </Button>
                <Tooltip title="一键创建爬虫">
                  <Button
                    size="small"
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                  >
                    创建爬虫
                  </Button>
                </Tooltip>
              </Space>
            }
            style={{ height: "100%" }}
            styles={{
              body: {
                padding: 0,
                height: "calc(100% - 57px)",
                overflow: "hidden",
              },
            }}
          >
            <div
              style={{
                background: "#1e1e1e",
                color: "#d4d4d4",
                fontFamily: "'SF Mono','Fira Code',Consolas,monospace",
                fontSize: 12,
                lineHeight: 1.8,
                padding: "16px 20px",
                height: "100%",
                overflowY: "auto",
                whiteSpace: "pre",
              }}
            >
              <div style={{ color: "#858585", marginBottom: 8 }}>
                {/* filename */}
                {selectedTemplate.code}.py
              </div>
              {selectedTemplate.codeSnippet
                .split("\n")
                .map((line: string, i: number) => {
                  // 简单语法高亮
                  let highlighted = line
                    .replace(
                      /\b(class|def|async|await|for|in|if|else|return|yield|from|import|True|False|None)\b/g,
                      "\x1bkw$1\x1b/"
                    )
                    .replace(/("[^"]*"|'[^']*')/g, "\x1bstr$1\x1b/")
                    .replace(/#.*$/, "\x1bcom$&\x1b/")
                    .replace(/\b(\d+)\b/g, "\x1bnum$1\x1b/")
                    .replace(/\b([A-Z][a-zA-Z]+)\b/g, "\x1bfn$1\x1b/");
                  // Replace tags with spans
                  highlighted = highlighted
                    .replace(/\x1bkw/g, '<span style="color:#c586c0">')
                    .replace(/\x1bstr/g, '<span style="color:#ce9178">')
                    .replace(/\x1bcom/g, '<span style="color:#6a9955">')
                    .replace(/\x1bnum/g, '<span style="color:#b5cea8">')
                    .replace(/\x1bfn/g, '<span style="color:#dcdcaa">')
                    .replace(/\x1b\//g, "</span>");
                  return (
                    <div key={i}>
                      <span style={{ color: "#858585", marginRight: 12 }}>
                        {(i + 1).toString().padStart(2, " ")}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                    </div>
                  );
                })}
            </div>
          </Card>
        </Col>

        {/* ===== 右侧：字段映射 + 配置 ===== */}
        <Col span={7} style={{ height: "100%", overflowY: "auto" }}>
          {/* 字段映射 */}
          <Card
            size="small"
            title={
              <Space>
                <FieldBinaryOutlined /> 字段映射
              </Space>
            }
            extra={
              <Button
                size="small"
                type="link"
                onClick={addFieldMapping}
                icon={<PlusOutlined />}
              >
                添加
              </Button>
            }
            style={{ marginBottom: 12 }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#fafafa",
                      borderBottom: "2px solid #f0f0f0",
                    }}
                  >
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>
                      源字段
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>
                      目标
                    </th>
                    <th
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        width: 50,
                      }}
                    >
                      类型
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "left" }}>
                      规则
                    </th>
                    <th style={{ padding: "6px 8px", width: 30 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {fieldMappings.map((fm, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          size="small"

                          value={fm.source_field}
                          onChange={(e) =>
                            updateFieldMapping(
                              idx,
                              "source_field",
                              e.target.value
                            )
                          }
                          placeholder="源字段"
                          style={{ padding: 0, background: "transparent" }}
                        />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          size="small"

                          value={fm.target_field}
                          onChange={(e) =>
                            updateFieldMapping(
                              idx,
                              "target_field",
                              e.target.value
                            )
                          }
                          placeholder="目标"
                          style={{ padding: 0, background: "transparent" }}
                        />
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Select
                          size="small"

                          value={fm.field_type || "string"}
                          style={{ width: 60 }}
                          onChange={(v) =>
                            updateFieldMapping(idx, "field_type", v)
                          }
                        >
                          <Select.Option value="string">string</Select.Option>
                          <Select.Option value="text">text</Select.Option>
                          <Select.Option value="datetime">date</Select.Option>
                          <Select.Option value="number">num</Select.Option>
                        </Select>
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <Input
                          size="small"

                          value={fm.transformer || ""}
                          onChange={(e) =>
                            updateFieldMapping(
                              idx,
                              "transformer",
                              e.target.value
                            )
                          }
                          placeholder="提取规则"
                          style={{
                            padding: 0,
                            fontFamily: "monospace",
                            background: "transparent",
                          }}
                        />
                      </td>
                      <td style={{ padding: "4px 6px", textAlign: "center" }}>
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeFieldMapping(idx)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 配置参数 */}
          <Card size="small" title="配置参数">
            {(selectedTemplate.configSchema || []).map((cfg: any) => (
              <div key={cfg.name} style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 4, fontSize: 13 }}>
                  {cfg.required && <Text type="danger">* </Text>}
                  {cfg.label}
                </div>
                {cfg.type === "select" ? (
                  <Select
                    size="small"
                    style={{ width: "100%" }}
                    value={configValues[cfg.name] ?? cfg.default}
                    onChange={(v) =>
                      setConfigValues({ ...configValues, [cfg.name]: v })
                    }
                  >
                    {(cfg.options || []).map((o: string) => (
                      <Select.Option key={o} value={o}>
                        {o}
                      </Select.Option>
                    ))}
                  </Select>
                ) : cfg.type === "number" ? (
                  <Input
                    size="small"
                    type="number"
                    value={configValues[cfg.name] ?? cfg.default}
                    onChange={(e) =>
                      setConfigValues({
                        ...configValues,
                        [cfg.name]: Number(e.target.value),
                      })
                    }
                  />
                ) : cfg.type === "boolean" ? (
                  <Radio.Group
                    value={configValues[cfg.name] ?? cfg.default}
                    onChange={(e) =>
                      setConfigValues({
                        ...configValues,
                        [cfg.name]: e.target.value,
                      })
                    }
                  >
                    <Radio value={true}>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                ) : (
                  <Input
                    size="small"
                    placeholder={cfg.placeholder}
                    value={configValues[cfg.name] ?? cfg.default ?? ""}
                    onChange={(e) =>
                      setConfigValues({
                        ...configValues,
                        [cfg.name]: e.target.value,
                      })
                    }
                  />
                )}
              </div>
            ))}
            {(!selectedTemplate.configSchema ||
              selectedTemplate.configSchema.length === 0) && (
              <Text type="secondary">此模板无可配置参数</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* 创建爬虫弹窗 */}
      <Modal
        title={`从模板创建爬虫 — ${selectedTemplate?.name}`}
        open={createModalOpen}
        onOk={handleCreateSpider}
        onCancel={() => setCreateModalOpen(false)}
        okText="创建"
        cancelText="取消"
        width={520}
      >
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#f6ffed",
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          基于模板{" "}
          <Tag color={selectedSourceInfo.color}>{selectedSourceInfo.label}</Tag>{" "}
          创建新爬虫，将自动继承模板的代码和字段映射配置。
        </div>
        <Form layout="vertical">
          <Form.Item label="爬虫名称" required>
            <Input
              placeholder="如：新浪财经新闻采集"
              value={newSpiderName}
              onChange={(e) => {
                setNewSpiderName(e.target.value);
                if (!newSpiderCode)
                  setNewSpiderCode(
                    e.target.value
                      .replace(/[\u4e00-\u9fa5]/g, "")
                      .toLowerCase()
                      .replace(/\s+/g, "_")
                      .slice(0, 40) || "spider_" + Date.now()
                  );
              }}
            />
          </Form.Item>
          <Form.Item label="爬虫编码" required extra="唯一标识，创建后不可修改">
            <Input
              placeholder="小写字母、数字、下划线"
              value={newSpiderCode}
              onChange={(e) => setNewSpiderCode(e.target.value)}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item label="来源类型">
            <Select
              value={newSpiderSourceType}
              onChange={setNewSpiderSourceType}
              style={{ width: "100%" }}
            >
              {Object.entries(sourceTypeMap).map(([k, v]) => (
                <Select.Option key={k} value={k}>
                  <Tag color={v.color}>{v.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建模板弹窗 */}
      <Modal
        title="新建爬虫模板"
        open={newTemplateOpen}
        onCancel={() => { setNewTemplateOpen(false); newTemplateForm.resetFields(); }}
        onOk={async () => {
          const values = await newTemplateForm.validateFields();
          message.success(`模板 "${values.name}" 创建成功`);
          setNewTemplateOpen(false);
          newTemplateForm.resetFields();
        }}
        okText="创建"
        cancelText="取消"
        width={520}
      >
        <Form form={newTemplateForm} layout="vertical">
          <Form.Item label="模板名称" name="name" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="如：财经数据采集模板" />
          </Form.Item>
          <Form.Item label="编码" name="code" rules={[{ required: true, message: '请输入编码' }]}>
            <Input placeholder="小写字母+下划线" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item label="来源类型" name="sourceType" rules={[{ required: true }]} initialValue="html">
            <Select>
              <Select.Option value="html">HTML (🌐)</Select.Option>
              <Select.Option value="rss">RSS (📡)</Select.Option>
              <Select.Option value="json_api">JSON API (🔌)</Select.Option>
              <Select.Option value="playwright">Playwright (🎭)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Select placeholder="可选">
              <Select.Option value="news">新闻</Select.Option>
              <Select.Option value="social">社交媒体</Select.Option>
              <Select.Option value="ecommerce">电商</Select.Option>
              <Select.Option value="api">API</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="描述模板的用途和适用场景" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SpiderTemplatePage;
