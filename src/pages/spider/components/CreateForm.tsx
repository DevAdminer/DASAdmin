import { PlusOutlined } from "@ant-design/icons";
import {
  type ActionType,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from "@ant-design/pro-components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Drawer, message, Modal } from "antd";
import React, { useState } from "react";
import { spiderCreate } from "../service";
import type { SpiderCreateParams } from "../data.d";
interface CreateFormProps {
  reload?: ActionType["reload"];
}

const enum SpiderType {
  REQUESTS = "requests",
  PLAYWRIGHT = "playwright",
  SCRAPY = "scrapy",
  API = "api",
  CUSTOM = "custom",
}

/** 尝试解析 JSON，失败返回原始字符串 */
function tryParseJSON(str?: string): Record<string, any> | undefined {
  if (!str || !str.trim()) return undefined;
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}
const CreateForm: React.FC<CreateFormProps> = ({ reload }) => {
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const { mutateAsync: run, isPending: loading } = useMutation({
    mutationFn: spiderCreate,
    onSuccess: () => {
      messageApi.success("任务爬虫成功");
      queryClient.invalidateQueries({ queryKey: ["task"] });
      reload?.();
    },
  });

  const onFinish = async (values: any) => {
    // 解析 JSON 配置字段
    const params: SpiderCreateParams = {
      taskName: values.taskName,
      taskCode: values.taskCode,
      description: values.description,
      spiderCode: values.spiderCode,
      spiderConfig: tryParseJSON(values.spiderConfigText),
      pipelineConfig: tryParseJSON(values.pipelineConfigText),
      status: values.status ?? 0,
      runType: values.runType ?? 2,
      cronExpr: values.cronExpr,
      intervalSeconds: values.intervalSeconds,
      tags: values.tags,
    };

    // 调度校验
    if (params.runType === 0 && !params.cronExpr) {
      messageApi.error("定时任务必须填写 Cron 表达式");
      return false;
    }
    if (params.runType === 1 && !params.intervalSeconds) {
      messageApi.error("间隔任务必须填写间隔秒数");
      return false;
    }

    try {
      await run(params);
      setOpen(false);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
      >
        新建爬虫
      </Button>
      <StepsForm
        onFinish={onFinish}
        formProps={{
          validateMessages: { required: "此项为必填项" },
        }}
        stepsFormRender={(dom, submitter) => (
          <Modal
            title="新建采集任务"
            width={720}
            open={open}
            onCancel={() => setOpen(false)}
            footer={submitter}
            destroyOnHidden
          >
            {dom}
          </Modal>
        )}
      >
        {/* Step 1: 基本信息 */}
        <StepsForm.StepForm
          name="basic"
          title="基本信息"
          initialValues={{ status: 0, runType: 2 }}
        >
          <ProFormText
            name="name"
            label="爬虫名称"
            width="lg"
            placeholder="请输入爬虫名称"
            rules={[{ required: true, message: "如：通用新闻爬虫" }]}
          />
          <ProFormSelect
            name="type"
            label="爬虫类型"
            width="lg"
            placeholder="选择爬虫类型"
            rules={[{ required: true, message: "请选择爬虫代码" }]}
            options={[
              { label: "Requests", value: SpiderType.REQUESTS },
              { label: "Playwright", value: SpiderType.PLAYWRIGHT },
              { label: "Scrapy", value: SpiderType.SCRAPY },
              { label: "API", value: SpiderType.API },
              { label: "自定义", value: SpiderType.CUSTOM },
            ]}
          />
          <ProFormText
            name="version"
            label="版本号"
            width="lg"
            placeholder="请输入版本号"
            rules={[{ required: true, message: "如：1.0.0" }]}
          />
          <ProFormText
            name="url"
            label="目标URL"
            width="lg"
            placeholder="请输入目标URL"
            rules={[{ required: true, message: "https://example.com" }]}
          />
        </StepsForm.StepForm>

        {/* Step 3: 调度设置 */}
        <StepsForm.StepForm name="schedule" title="调度设置">
          <ProFormRadio.Group
            name="runType"
            label="调度类型"
            rules={[{ required: true, message: "请选择调度类型" }]}
            options={[
              { value: 0, label: "定时调度（Cron）" },
              { value: 1, label: "间隔执行" },
              { value: 2, label: "手动触发" },
            ]}
          />
          <ProFormDependency name={["runType"]}>
            {({ runType }) => {
              if (runType === 0) {
                return (
                  <ProFormText
                    name="cronExpr"
                    label="Cron 表达式"
                    width="lg"
                    placeholder="如：0 2 * * *（每天凌晨2点）"
                    rules={[{ required: true, message: "请输入 Cron 表达式" }]}
                  />
                );
              }
              if (runType === 1) {
                return (
                  <ProFormDigit
                    name="intervalSeconds"
                    label="间隔秒数"
                    width="lg"
                    min={1}
                    max={86400}
                    placeholder="如：3600（每小时）"
                    rules={[{ required: true, message: "请输入间隔秒数" }]}
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>
          <ProFormRadio.Group
            name="status"
            label="初始状态"
            rules={[{ required: true, message: "请选择初始状态" }]}
            options={[
              { value: 0, label: "草稿" },
              { value: 1, label: "启用" },
              { value: 2, label: "暂停" },
            ]}
          />
          <ProFormSwitch
            name="auto"
            label="自动同步"
            rules={[{ required: true, message: "请选择是否自动同步" }]}
            initialValue={false}
          />
        </StepsForm.StepForm>

        <StepsForm.StepForm name="description" title="描述信息">
          <ProFormTextArea
            name="description"
            label="描述"
            width="lg"
            placeholder="爬虫功能描述"
          />
        </StepsForm.StepForm>

        {/* Step 4: 确认信息 */}
        <StepsForm.StepForm name="confirm" title="确认提交">
          <div style={{ marginBottom: 16 }}>
            <h3>请确认任务信息无误后提交</h3>
            <p style={{ color: "rgba(0,0,0,0.45)" }}>
              提交后任务将创建成功，可在任务列表中查看和管理。
            </p>
          </div>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};

export default CreateForm;
