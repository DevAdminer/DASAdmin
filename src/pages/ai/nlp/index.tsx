import React from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Button, Tag, Table, Tabs, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AINlpPage: React.FC = () => {
  const cols = [
    { title:'任务ID', dataIndex:'id', key:'id', render:(v:string)=><code>{v}</code> },
    { title:'类型', dataIndex:'type', key:'type', render:(v:string)=><Tag color={v==='摘要'?'blue':v==='分类'?'purple':v==='情感'?'gold':'default'}>{v}</Tag> },
    { title:'名称', dataIndex:'name', key:'name' },
    { title:'模型', dataIndex:'model', key:'model' },
    { title:'状态', dataIndex:'status', key:'status', render:(v:string)=><Tag color={v==='成功'?'green':v==='运行中'?'gold':'default'}>{v}</Tag> },
    { title:'处理量', dataIndex:'count', key:'count' },
    { title:'操作', key:'action', render:()=><a>详情</a> },
  ];
  const data = [
    {id:'NLP-001',type:'摘要',name:'新闻摘要生成',model:'gpt-4o-mini',status:'运行中',count:'45.6K'},
    {id:'NLP-002',type:'分类',name:'新闻分类(8类)',model:'gpt-4o-mini',status:'成功',count:'89.2K'},
    {id:'NLP-003',type:'情感',name:'文章情感分析',model:'gpt-4o-mini',status:'成功',count:'67.8K'},
    {id:'NLP-004',type:'翻译',name:'标题英译中',model:'qwen-max',status:'成功',count:'12.3K'},
  ];
  return (
    <PageContainer header={{ title:'NLP 任务', subTitle:'Summary / Classification / Translation / Sentiment' }}
      extra={[<Button key="add" type="primary" icon={<PlusOutlined />}>新建 NLP 任务</Button>]}>
      <Tabs items={[{key:'all',label:'全部'},{key:'summary',label:'摘要'},{key:'classification',label:'分类'},{key:'sentiment',label:'情感分析'},{key:'translation',label:'翻译'}]} />
      <Table rowKey="id" columns={cols} dataSource={data} pagination={false} size="middle" />
    </PageContainer>
  );
};
export default AINlpPage;
