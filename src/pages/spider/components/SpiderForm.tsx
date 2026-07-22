import React from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Tabs,
  Space,
  Row,
  Col,
  Modal,
  Button,
} from "antd";
import FieldMapping from "./FieldMapping";
import ExtractRuleForm from "./ExtractRuleForm";

const { TextArea } = Input;

/** 爬虫类型枚举 */
const enum SpiderType {
  REQUESTS = "requests",
  PLAYWRIGHT = "playwright",
  SCRAPY = "scrapy",
  API = "api",
  CUSTOM = "custom",
}

const SpiderForm: React.FC = () => {
  return (
    <Modal
      title={`新建爬虫`}
      open={open}
      onCancel={() => {
        mutation.reset();
        onClose();
      }}
      width={900}
      footer={[
        <Button
          key="close"
          onClick={() => {
            mutation.reset();
            onClose();
          }}
        >
          关闭
        </Button>,
        <Button
          key="test"
          type="primary"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          执行测试
        </Button>,
      ]}
    >
      <Tabs
        defaultActiveKey="basic"
        items={[
          {
            key: "basic",
            label: "基本信息",
            children: (
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="爬虫名称"
                    rules={[{ required: true, message: "请输入爬虫名称" }]}
                  >
                    <Input placeholder="如：通用新闻爬虫" />
                  </Form.Item>
                  <Form.Item
                    name="spider_type"
                    label="爬虫类型"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="选择爬虫类型"
                      options={[
                        { label: "Requests", value: SpiderType.REQUESTS },
                        { label: "Playwright", value: SpiderType.PLAYWRIGHT },
                        { label: "Scrapy", value: SpiderType.SCRAPY },
                        { label: "API", value: SpiderType.API },
                        { label: "自定义", value: SpiderType.CUSTOM },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name="version" label="版本号">
                    <Input placeholder="如：1.0.0" />
                  </Form.Item>
                  <Form.Item name="target_url" label="目标 URL">
                    <Input placeholder="https://example.com" />
                  </Form.Item>
                  <Form.Item name="allowed_domains" label="允许域名">
                    <Select
                      mode="tags"
                      placeholder="输入域名后回车"
                      tokenSeparators={[",", " "]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="description" label="描述">
                    <TextArea rows={4} placeholder="爬虫功能描述" />
                  </Form.Item>
                  <Form.Item name="schedule_interval" label="调度间隔">
                    <Select
                      placeholder="选择调度频率"
                      allowClear
                      options={[
                        { label: "每 15 分钟", value: "*/15 * * * *" },
                        { label: "每 30 分钟", value: "*/30 * * * *" },
                        { label: "每小时", value: "0 * * * *" },
                        { label: "每 2 小时", value: "0 */2 * * *" },
                        { label: "每 6 小时", value: "0 */6 * * *" },
                        { label: "每天", value: "0 0 * * *" },
                        { label: "自定义", value: "custom" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    name="auto_sync"
                    label="自动同步"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
          {
            key: "extract",
            label: "提取规则",
            children: (
              <>
                <Form.Item name="extract_rules" label="字段提取规则">
                  <ExtractRuleForm />
                </Form.Item>
                <Form.Item name="pagination_rule" label="分页规则">
                  <Select
                    placeholder="选择分页方式"
                    options={[
                      { label: "URL 参数分页", value: "url" },
                      { label: "点击加载更多", value: "click" },
                      { label: "滚动加载", value: "scroll" },
                      { label: "按钮翻页", value: "button" },
                      { label: "无分页", value: "none" },
                    ]}
                  />
                </Form.Item>
              </>
            ),
          },
          {
            key: "advanced",
            label: "高级配置",
            children: (
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item name="max_concurrency" label="最大并发">
                    <InputNumber min={1} max={50} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="request_delay" label="请求延迟 (ms)">
                    <InputNumber
                      min={0}
                      max={10000}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="retry_times" label="重试次数">
                    <InputNumber min={0} max={10} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="retry_delay" label="重试延迟 (ms)">
                    <InputNumber
                      min={0}
                      max={30000}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="proxy_pool_id" label="代理池">
                    <Select
                      placeholder="选择代理池"
                      allowClear
                      options={[{ label: "默认代理池", value: "default" }]}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="cookie_pool_id" label="Cookie 池">
                    <Select
                      placeholder="选择 Cookie 池"
                      allowClear
                      options={[{ label: "默认 Cookie 池", value: "default" }]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
          {
            key: "field_mapping",
            label: "字段映射",
            children: (
              <Form.Item name="field_mapping">
                <FieldMapping />
              </Form.Item>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default SpiderForm;
