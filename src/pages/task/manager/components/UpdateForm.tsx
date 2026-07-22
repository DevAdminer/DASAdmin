import {
  ModalForm,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";
import React, { useState } from "react";
import { taskOptions, taskUpdate } from "../service";
import type { TaskItem, TaskUpdateParams } from "../data";

interface UpdateFormProps {
  values: TaskItem;
  onOk?: () => void;
}

/** JSON 对象转格式化字符串 */
function jsonToText(val?: Record<string, any> | null): string {
  if (!val) return "";
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return "";
  }
}

function tryParseJSON(str?: string): Record<string, any> | undefined {
  if (!str || !str.trim()) return undefined;
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

const UpdateForm: React.FC<UpdateFormProps> = ({ values, onOk }) => {
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const { mutateAsync: run, isPending: loading } = useMutation({
    mutationFn: taskUpdate,
    onSuccess: () => {
      messageApi.success("更新成功");
      queryClient.invalidateQueries({ queryKey: ["task"] });
      onOk?.();
    },
  });

  const onFinish = async (formValues: any) => {
    const params: TaskUpdateParams = {
      id: values.id,
      taskName: formValues.taskName,
      description: formValues.description,
      spiderCode: formValues.spiderCode,
      spiderConfig: tryParseJSON(formValues.spiderConfigText),
      pipelineConfig: tryParseJSON(formValues.pipelineConfigText),
      runType: formValues.runType,
      cronExpr: formValues.cronExpr,
      intervalSeconds: formValues.intervalSeconds,
      tags: formValues.tags,
    };

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

  // 启用状态不允许修改爬虫
  const spiderDisabled = values.status === 1;

  return (
    <>
      {contextHolder}
      <Button type="link" onClick={() => setOpen(true)}>
        编辑
      </Button>
      {open && (
        <ModalForm
          title="编辑任务"
          width={640}
          open={open}
          onOpenChange={setOpen}
          onFinish={onFinish}
          modalProps={{ okButtonProps: { loading }, destroyOnHidden: true }}
          initialValues={{
            taskName: values.taskName,
            description: values.description,
            spiderCode: values.spiderCode,
            spiderConfigText: jsonToText(values.spiderConfig),
            pipelineConfigText: jsonToText(values.pipelineConfig),
            runType: values.runType,
            cronExpr: values.cronExpr,
            intervalSeconds: values.intervalSeconds,
            tags: values.tags,
          }}
        >
          <ProFormText
            name="taskName"
            label="任务名称"
            width="lg"
            rules={[{ required: true, message: "请输入任务名称" }]}
          />
          <ProFormTextArea
            name="description"
            label="任务描述"
            width="lg"
            fieldProps={{ autoSize: { minRows: 2, maxRows: 4 } }}
          />
          <ProFormSelect
            name="spiderCode"
            label="选择爬虫"
            width="lg"
            disabled={spiderDisabled}
            placeholder={spiderDisabled ? "启用状态不可修改爬虫" : "请选择"}
            request={async () => {
              const res = await taskOptions();
              return res.data.spiders.map((s) => ({
                label: `${s.name} (${s.code})`,
                value: s.code,
              }));
            }}
          />
          <ProFormTextArea
            name="spiderConfigText"
            label="爬虫配置参数（JSON）"
            width="lg"
            fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}
          />
          <ProFormTextArea
            name="pipelineConfigText"
            label="数据处理流水线配置（JSON）"
            width="lg"
            fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}
          />
          <ProFormRadio.Group
            name="runType"
            label="调度类型"
            options={[
              { value: 0, label: "定时调度" },
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
                    rules={[{ required: true, message: "请输入间隔秒数" }]}
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>
          <ProFormText
            name="tags"
            label="标签"
            width="lg"
            placeholder="多个标签用逗号分隔"
          />
        </ModalForm>
      )}
    </>
  );
};

export default UpdateForm;
