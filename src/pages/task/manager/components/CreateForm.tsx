import { PlusOutlined } from "@ant-design/icons";
import {
  type ActionType,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from "@ant-design/pro-components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Drawer, message, Modal } from "antd";
import React, { useState } from "react";
import { taskCreate, taskOptions } from "../service";
import type { TaskCreateParams } from "../data";

interface CreateFormProps {
  reload?: ActionType["reload"];
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
    mutationFn: taskCreate,
    onSuccess: () => {
      messageApi.success("任务创建成功");
      queryClient.invalidateQueries({ queryKey: ["task"] });
      reload?.();
    },
  });

  const onFinish = async (values: any) => {
    // 解析 JSON 配置字段
    const params: TaskCreateParams = {
      name: values.name,
      code: values.code,
      description: values.description,
      spiderCode: values.spiderCode,
      spiderConfig: tryParseJSON(values.spiderConfig),
      pipelineConfig: tryParseJSON(values.pipelineConfig),
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
        新建任务
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
            label="任务名称"
            width="lg"
            placeholder="请输入任务名称"
            rules={[{ required: true, message: "请输入任务名称" }]}
          />
          <ProFormText
            name="code"
            label="任务编码"
            width="lg"
            placeholder="唯一标识，如：news_spider_daily"
            rules={[
              { required: true, message: "请输入任务编码" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "仅支持字母、数字和下划线",
              },
            ]}
          />
          <ProFormTextArea
            name="description"
            label="任务描述"
            width="lg"
            placeholder="描述任务用途"
            fieldProps={{ autoSize: { minRows: 2, maxRows: 4 } }}
          />
          <ProFormText
            name="tags"
            label="标签"
            width="lg"
            placeholder="多个标签用逗号分隔"
          />
        </StepsForm.StepForm>

        {/* Step 2: 爬虫配置 */}
        <StepsForm.StepForm name="spider" title="爬虫配置">
          <ProFormSelect
            name="spiderCode"
            label="选择爬虫"
            width="lg"
            placeholder="请选择爬虫插件"
            rules={[{ required: true, message: "请选择爬虫" }]}
            request={async () => {
              const res = await taskOptions();
              return res.data.spiders.map((s) => ({
                label: `${s.name} (${s.code})`,
                value: s.code,
              }));
            }}
          />
          <ProFormTextArea
            name="spiderConfig"
            label="爬虫配置参数（JSON）"
            width="lg"
            placeholder='{"keyword": "AI", "limit": 10}'
            fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}
          />
          <ProFormTextArea
            name="pipelineConfig"
            label="数据处理流水线配置（JSON）"
            width="lg"
            placeholder='{"pipeline": ["clean", "deduplicate"]}'
            fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}
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
