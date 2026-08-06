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
  Divider,
} from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  CodeOutlined,
  SaveOutlined,
  FieldBinaryOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { history } from "@umijs/max";
import {
  listSpiderTemplates,
  getSpiderTemplate,
  createSpiderTemplate,
  saveFieldMapping,
  saveConfigSchema,
  createSpiderFromTemplate,
  deleteSpiderTemplate,
} from "./service";
import type {
  SpiderTemplateItem,
  SpiderTemplateResponse,
  FieldMapping,
  ConfigSchemaItem,
} from "./service";

const { Text } = Typography;
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

// 前端兜底的内置模板（后端不可用时展示，字段与 API camelCase 对齐）
const FALLBACK_BUILTIN: SpiderTemplateItem[] = [
  {
    uid: "builtin-news",
    code: "news_general",
    name: "通用新闻采集",
    description:
      "适用于通用新闻网站、博客平台，支持CSS选择器提取标题、正文、发布时间、作者、图片等字段。",
    category: "news",
    sourceType: "html",
    icon: "📰",
    isBuiltin: 1,
    usageCount: 3200,
    status: 1,
    version: "1.2.0",
    spiderCount: 0,
    codeTemplate: `class NewsSpider(BaseSpider):
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
    ],
    createdAt: "",
    updatedAt: "",
  },
  {
    uid: "builtin-social",
    code: "social_media",
    name: "社交媒体采集",
    description: "适用于微博、知乎等社交媒体，支持 Playwright 浏览器渲染。",
    category: "social",
    sourceType: "playwright",
    icon: "💬",
    isBuiltin: 1,
    usageCount: 1800,
    status: 1,
    version: "1.0.0",
    spiderCount: 0,
    codeTemplate: `class SocialSpider(BaseSpider):
    display_name = "社交媒体采集"
    source_type = "playwright"

    async def crawl(self):
        page = await self.open(self.config['url'])
        for post in await self.extract(page, "div.post-text"):
            yield CrawlItem(title=post.text, source="social")`,
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
    createdAt: "",
    updatedAt: "",
  },
];

const SpiderTemplatePage: React.FC = () => {
  const { message } = App.useApp();
  const [selected, setSelected] = useState<SpiderTemplateItem | null>(null);
  const [builtinTemplates, setBuiltinTemplates] = useState<
    SpiderTemplateItem[]
  >([]);
  const [myTemplates, setMyTemplates] = useState<SpiderTemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [configSchema, setConfigSchema] = useState<ConfigSchemaItem[]>([]);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [schemaEditMode, setSchemaEditMode] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSpiderName, setNewSpiderName] = useState("");
  const [newSpiderCode, setNewSpiderCode] = useState("");
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [newTemplateForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // ===== 数据加载 =====
  const loadTemplates = async (
    scope: "builtin" | "mine",
    setter: (l: SpiderTemplateItem[]) => void
  ) => {
    try {
      const res = await listSpiderTemplates({ page: 1, pageSize: 100, scope });
      setter(res.data.list || []);
    } catch {
      if (scope === "builtin") setter(FALLBACK_BUILTIN); // 后端不可用时兜底
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      loadTemplates("builtin", setBuiltinTemplates),
      loadTemplates("mine", setMyTemplates),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ===== 选择模板 =====
  const handleSelectTemplate = async (tpl: SpiderTemplateItem) => {
    console.log("select template", tpl);
    setSelected(tpl);
    setFieldMappings([...(tpl.fieldMapping || [])]);
    setConfigSchema([...(tpl.configSchema || [])]);
    setSchemaEditMode(false);
    const defaults: Record<string, any> = {};
    (tpl.configSchema || []).forEach((c) => {
      if (c.default !== undefined) defaults[c.name] = c.default;
    });
    setConfigValues(defaults);

    // 拉取完整详情（含字段映射/配置参数/代码模板）
    if (tpl.uid && !tpl.uid.startsWith("builtin-")) {
      try {
        const detail = await getSpiderTemplate(tpl.uid);
        console.log("template detail", detail);
        if (detail && detail.data) {
          setSelected(detail.data);
          setFieldMappings([...(detail.data.fieldMapping || [])]);
          setConfigSchema([...(detail.data.configSchema || [])]);
          const d2: Record<string, any> = {};
          (detail.data.configSchema || []).forEach((c) => {
            if (c.default !== undefined) d2[c.name] = c.default;
          });
          setConfigValues(d2);
        }
      } catch {
        /* 忽略 */
      }
    }
  };

  // ===== 字段映射 =====
  const addFieldMapping = () =>
    setFieldMappings([
      ...fieldMappings,
      {
        source_field: "",
        target_field: "",
        field_type: "string",
        transformer: "",
      },
    ]);
  const updateFieldMapping = (index: number, key: string, value: any) => {
    const updated = [...fieldMappings];
    (updated[index] as any)[key] = value;
    setFieldMappings(updated);
  };
  const removeFieldMapping = (index: number) =>
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));

  const handleSaveFieldMapping = async () => {
    if (!selected?.uid) return;
    setSaving(true);
    try {
      await saveFieldMapping(selected.uid, fieldMappings);
      message.success("字段映射已保存");
      await fetchAll();
    } catch (e: any) {
      message.error(e?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // ===== 配置参数 Schema 编辑 =====
  const addConfigItem = () =>
    setConfigSchema([...configSchema, { name: "", label: "", type: "string" }]);
  const updateConfigItem = (index: number, key: string, value: any) => {
    const updated = [...configSchema];
    (updated[index] as any)[key] = value;
    setConfigSchema(updated);
  };
  const removeConfigItem = (index: number) =>
    setConfigSchema(configSchema.filter((_, i) => i !== index));

  const handleSaveConfigSchema = async () => {
    if (!selected?.uid) return;
    setSaving(true);
    try {
      await saveConfigSchema(selected.uid, configSchema);
      message.success("配置参数已保存");
      setSchemaEditMode(false);
      await fetchAll();
    } catch (e: any) {
      message.error(e?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // ===== 从模板创建爬虫 =====
  const handleCreateSpider = async () => {
    if (!newSpiderName.trim()) {
      message.error("请输入爬虫名称");
      return;
    }
    if (!newSpiderCode.trim()) {
      message.error("请输入爬虫编码");
      return;
    }
    if (!selected?.uid) return;
    setSaving(true);
    try {
      await createSpiderFromTemplate({
        templateUid: selected.uid,
        name: newSpiderName,
        code: newSpiderCode,
        // config: configValues,
        // fieldMapping: fieldMappings,
      });
      message.success(`爬虫 "${newSpiderName}" 创建成功`);
      setCreateModalOpen(false);
      history.push("/spider/list");
    } catch (e: any) {
      message.error(e?.message || "创建失败");
    } finally {
      setSaving(false);
    }
  };

  // ===== 新建模板 =====
  const handleCreateTemplate = async () => {
    const values = await newTemplateForm.validateFields();
    setSaving(true);
    try {
      await createSpiderTemplate(values);
      message.success(`模板 "${values.name}" 创建成功`);
      setNewTemplateOpen(false);
      newTemplateForm.resetFields();
      await fetchAll();
      // 自动选中新建的模板（按 code 匹配）
      const listRes = await listSpiderTemplates({
        page: 1,
        pageSize: 100,
        scope: "mine",
      });
      const created = (listRes?.data?.list || []).find(
        (t) => t.code === values.code
      );
      if (created) handleSelectTemplate(created);
    } catch (e: any) {
      message.error(e?.message || "创建失败");
    } finally {
      setSaving(false);
    }
  };

  // ===== 删除模板 =====
  const handleDeleteTemplate = async (tpl: SpiderTemplateItem) => {
    try {
      await deleteSpiderTemplate(tpl.uid);
      message.success("模板已删除");
      await fetchAll();
      if (selected?.uid === tpl.uid) setSelected(null);
    } catch (e: any) {
      message.error(e?.message || "删除失败");
    }
  };

  const renderTemplateCard = (tpl: SpiderTemplateItem, key: string) => {
    const src = sourceTypeMap[tpl.sourceType] || {
      label: tpl.sourceType,
      color: "default",
      icon: "📄",
    };
    const active = selected?.uid === tpl.uid;
    return (
      <div
        key={key}
        onClick={() => handleSelectTemplate(tpl)}
        style={{
          cursor: "pointer",
          padding: "12px 16px",
          marginBottom: 8,
          borderRadius: 8,
          border: "2px solid",
          borderColor: active ? "#1677ff" : "#f0f0f0",
          background: active ? "#e6f4ff" : "#fff",
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
          {/* <span style={{ fontSize: 24 }}>{tpl.icon || "📄"}</span> */}
          <div>
            <Text strong>{tpl.name}</Text>
            <div style={{ marginTop: 2 }}>
              <Tag color={src.color}>{src.label}</Tag>
              {tpl.version && <Tag color="green">v{tpl.version}</Tag>}
              {tpl.isBuiltin === 1 && <Tag color="purple">内置</Tag>}
            </div>
          </div>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {(tpl.description || "暂无描述").slice(0, 60)}
        </Text>
        <div style={{ marginTop: 4, fontSize: 11, color: "#8c8c8c" }}>
          📥 {tpl.usageCount || 0} 次使用
          {tpl.isBuiltin !== 1 && (
            <span
              style={{ float: "right" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Popconfirm
                title="确认删除该模板？"
                onConfirm={() => handleDeleteTemplate(tpl)}
              >
                <a style={{ color: "#ff4d4f" }}>删除</a>
              </Popconfirm>
            </span>
          )}
        </div>
      </div>
    );
  };

  const selectedSourceInfo = selected
    ? sourceTypeMap[selected.sourceType] || {
        label: selected.sourceType,
        color: "default",
        icon: "📄",
      }
    : { label: "-", color: "default", icon: "📄" };
  const isBuiltin =
    selected?.isBuiltin === 1 || selected?.uid?.startsWith("builtin-");
  const canEdit = !!selected?.uid && !selected?.uid.startsWith("builtin-");

  return (
    <PageContainer
      header={{
        title: "爬虫模板",
        subTitle: "选择模板 → 编辑字段映射 / 配置参数 → 创建爬虫",
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
      <Spin spinning={loading}>
        <Row gutter={16} style={{ minHeight: "calc(100vh - 220px)" }}>
          {/* ===== 左侧：模板列表 ===== */}
          <Col span={6}>
            <Card
              size="small"
              title={`内置模板 (${builtinTemplates.length})`}
              style={{ marginBottom: 12 }}
            >
              {builtinTemplates.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无内置模板"
                />
              ) : (
                builtinTemplates.map((tpl) =>
                  renderTemplateCard(tpl, `b-${tpl.uid}`)
                )
              )}
            </Card>
            <Card
              size="small"
              title={`我的模板 (${myTemplates.length})`}
              extra={
                <Button
                  type="link"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setNewTemplateOpen(true)}
                >
                  新建
                </Button>
              }
            >
              {myTemplates.length === 0 ? (
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
                myTemplates.map((tpl) =>
                  renderTemplateCard(tpl, `m-${tpl.uid}`)
                )
              )}
            </Card>
          </Col>

          {/* ===== 中间：代码模板 ===== */}
          <Col span={11}>
            <Card
              size="small"
              title={
                <Space>
                  <CodeOutlined /> 代码模板
                </Space>
              }
              extra={
                <Space>
                  <Tag color={selectedSourceInfo.color}>
                    {selectedSourceInfo.label}
                  </Tag>
                  {selected?.version && <Tag>v{selected.version}</Tag>}
                  {!selected && <Text type="secondary">未选择模板</Text>}
                  <Tooltip title="一键创建爬虫">
                    <Button
                      size="small"
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      disabled={!selected}
                      onClick={() => setCreateModalOpen(true)}
                    >
                      创建爬虫
                    </Button>
                  </Tooltip>
                </Space>
              }
              style={{ height: "100%", marginBottom: 12 }}
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
                {!selected ? (
                  <div style={{ color: "#6a9955" }}>
                    # 从左侧选择一个模板查看代码
                  </div>
                ) : (
                  <>
                    <div style={{ color: "#858585", marginBottom: 8 }}>
                      {selected.code}.py
                    </div>
                    {(selected.codeTemplate || "# 该模板暂无代码模板")
                      .split("\n")
                      .map((line: string, i: number) => {
                        let h = line
                          .replace(
                            /\b(class|def|async|await|for|in|if|else|return|yield|from|import|True|False|None)\b/g,
                            "\x1bkw$1\x1b/"
                          )
                          .replace(/("[^"]*"|'[^']*')/g, "\x1bstr$1\x1b/")
                          .replace(/#.*$/, "\x1bcom$&\x1b/")
                          .replace(/\b(\d+)\b/g, "\x1bnum$1\x1b/")
                          .replace(/\b([A-Z][a-zA-Z]+)\b/g, "\x1bfn$1\x1b/");
                        h = h
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
                            <span dangerouslySetInnerHTML={{ __html: h }} />
                          </div>
                        );
                      })}
                  </>
                )}
              </div>
            </Card>
          </Col>

          {/* ===== 右侧：字段映射 + 配置 ===== */}
          <Col span={7}>
            {/* 字段映射 */}
            <Card
              size="small"
              title={
                <Space>
                  <FieldBinaryOutlined /> 字段映射
                </Space>
              }
              extra={
                <Space size={4}>
                  <Button
                    size="small"
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={addFieldMapping}
                    disabled={!selected}
                  >
                    添加
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSaveFieldMapping}
                    disabled={!canEdit}
                  >
                    保存
                  </Button>
                </Space>
              }
              style={{ marginBottom: 12 }}
            >
              {!selected ? (
                <Text type="secondary">请先选择模板</Text>
              ) : (
                <>
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
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
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
                                style={{
                                  padding: 0,
                                  background: "transparent",
                                }}
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
                                style={{
                                  padding: 0,
                                  background: "transparent",
                                }}
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
                                <Select.Option value="string">
                                  string
                                </Select.Option>
                                <Select.Option value="text">text</Select.Option>
                                <Select.Option value="datetime">
                                  date
                                </Select.Option>
                                <Select.Option value="number">
                                  num
                                </Select.Option>
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
                            <td
                              style={{
                                padding: "4px 6px",
                                textAlign: "center",
                              }}
                            >
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
                  {fieldMappings.length === 0 && (
                    <Text type="secondary">暂无字段映射，点击"添加"新建</Text>
                  )}
                </>
              )}
            </Card>

            {/* 配置参数 */}
            <Card
              size="small"
              title={
                <Space>
                  <SettingOutlined /> 配置参数
                </Space>
              }
              extra={
                !canEdit ? null : schemaEditMode ? (
                  <Space size={4}>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => setSchemaEditMode(false)}
                    >
                      取消
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={saving}
                      onClick={handleSaveConfigSchema}
                    >
                      保存
                    </Button>
                  </Space>
                ) : (
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setSchemaEditMode(true)}
                  >
                    编辑 Schema
                  </Button>
                )
              }
            >
              {!selected ? (
                <Text type="secondary">请先选择模板</Text>
              ) : schemaEditMode ? (
                <>
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
                            参数名
                          </th>
                          <th style={{ padding: "6px 8px", textAlign: "left" }}>
                            标签
                          </th>
                          <th
                            style={{
                              padding: "6px 8px",
                              textAlign: "left",
                              width: 70,
                            }}
                          >
                            类型
                          </th>
                          <th style={{ padding: "6px 8px", width: 30 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {configSchema.map((c, idx) => (
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <td style={{ padding: "4px 6px" }}>
                              <Input
                                size="small"
                                value={c.name}
                                onChange={(e) =>
                                  updateConfigItem(idx, "name", e.target.value)
                                }
                                placeholder="name"
                                style={{ padding: 0, fontFamily: "monospace" }}
                              />
                            </td>
                            <td style={{ padding: "4px 6px" }}>
                              <Input
                                size="small"
                                value={c.label}
                                onChange={(e) =>
                                  updateConfigItem(idx, "label", e.target.value)
                                }
                                placeholder="显示名称"
                                style={{ padding: 0 }}
                              />
                            </td>
                            <td style={{ padding: "4px 6px" }}>
                              <Select
                                size="small"
                                value={c.type}
                                style={{ width: 70 }}
                                onChange={(v) =>
                                  updateConfigItem(idx, "type", v)
                                }
                              >
                                <Select.Option value="string">
                                  string
                                </Select.Option>
                                <Select.Option value="number">
                                  number
                                </Select.Option>
                                <Select.Option value="boolean">
                                  boolean
                                </Select.Option>
                                <Select.Option value="select">
                                  select
                                </Select.Option>
                              </Select>
                            </td>
                            <td
                              style={{
                                padding: "4px 6px",
                                textAlign: "center",
                              }}
                            >
                              <Button
                                type="link"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeConfigItem(idx)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button
                    size="small"
                    type="dashed"
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8, width: "100%" }}
                    onClick={addConfigItem}
                  >
                    添加参数
                  </Button>
                </>
              ) : (
                <>
                  {configSchema.map((cfg) => (
                    <div key={cfg.name} style={{ marginBottom: 12 }}>
                      <div style={{ marginBottom: 4, fontSize: 13 }}>
                        {cfg.required && <Text type="danger">* </Text>}
                        {cfg.label || cfg.name}
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
                          {(cfg.options || []).map((o) => (
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
                  {configSchema.length === 0 && (
                    <Text type="secondary">此模板无可配置参数</Text>
                  )}
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 从模板创建爬虫弹窗 */}
      <Modal
        title={`从模板创建爬虫 — ${selected?.name || ""}`}
        open={createModalOpen}
        onOk={handleCreateSpider}
        onCancel={() => setCreateModalOpen(false)}
        okText="创建"
        cancelText="取消"
        width={520}
        confirmLoading={saving}
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
          创建新爬虫，将自动继承模板的代码、字段映射和配置参数。
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
        </Form>
      </Modal>

      {/* 新建模板弹窗 */}
      <Modal
        title="新建爬虫模板"
        open={newTemplateOpen}
        onCancel={() => {
          setNewTemplateOpen(false);
          newTemplateForm.resetFields();
        }}
        onOk={handleCreateTemplate}
        okText="创建"
        cancelText="取消"
        width={520}
        confirmLoading={saving}
      >
        <Form form={newTemplateForm} layout="vertical">
          <Form.Item
            label="模板名称"
            name="name"
            rules={[{ required: true, message: "请输入模板名称" }]}
          >
            <Input placeholder="如：财经数据采集模板" />
          </Form.Item>
          <Form.Item
            label="编码"
            name="code"
            rules={[{ required: true, message: "请输入编码" }]}
          >
            <Input
              placeholder="小写字母+下划线"
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item
            label="来源类型"
            name="sourceType"
            rules={[{ required: true }]}
            initialValue="html"
          >
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
