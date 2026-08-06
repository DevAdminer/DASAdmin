import React from "react";
import { Form, Input, Select, Modal, Button } from "antd";
import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { spiderCreate } from "../service";
import type { SpiderCreateParams } from "../data.d";

const { TextArea } = Input;

interface SpiderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reload: () => void;
}

/** 新建爬虫表单 */
const SpiderForm: React.FC<SpiderFormProps> = ({ open, onClose, reload }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { mutateAsync: run, isPending: loading } = useMutation({
    mutationFn: (data: SpiderCreateParams) => spiderCreate(data),
    onSuccess: () => {
      message.success("爬虫创建成功");
      onClose();
      form.resetFields();
      reload();
    },
    onError: (e: any) => {
      message.error(e?.message || "创建失败");
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    await run(values);
  };

  return (
    <Modal
      title="新建爬虫"
      open={open}
      onCancel={() => {
        onClose();
        form.resetFields();
      }}
      onOk={handleOk}
      okText="创建"
      cancelText="取消"
      confirmLoading={loading}
      width={560}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
        <Form.Item
          label="爬虫名称"
          name="name"
          rules={[{ required: true, message: "请输入爬虫名称" }]}
        >
          <Input placeholder="如：新浪财经新闻采集" />
        </Form.Item>
        <Form.Item
          label="爬虫编码"
          name="code"
          rules={[{ required: true, message: "请输入爬虫编码" }]}
          extra="唯一标识，创建后不可修改"
        >
          <Input placeholder="小写字母、数字、下划线" style={{ fontFamily: "monospace" }} />
        </Form.Item>
        <Form.Item label="来源类型" name="sourceType" initialValue="html">
          <Select>
            <Select.Option value="html">HTML (🌐)</Select.Option>
            <Select.Option value="rss">RSS (📡)</Select.Option>
            <Select.Option value="json_api">JSON API (🔌)</Select.Option>
            <Select.Option value="playwright">Playwright (🎭)</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="描述" name="description">
          <TextArea rows={3} placeholder="爬虫用途说明（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SpiderForm;
