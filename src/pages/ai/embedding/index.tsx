import React from "react";
import { PageContainer, StatisticCard } from "@ant-design/pro-components";
import { Row, Col, Button, Tag, Table, Progress } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const AIEmbeddingPage: React.FC = () => {
  const cols = [
    { title:'任务ID', dataIndex:'id', key:'id', render:(v:string)=><code>{v}</code> },
    { title:'数据源', dataIndex:'source', key:'source' },
    { title:'模型', dataIndex:'model', key:'model' },
    { title:'维度', dataIndex:'dim', key:'dim' },
    { title:'状态', dataIndex:'status', key:'status', render:(v:string)=><Tag color={v==='运行中'?'blue':v==='成功'?'green':'default'}>{v}</Tag> },
    { title:'处理量', dataIndex:'count', key:'count' },
    { title:'进度', dataIndex:'progress', key:'progress', render:(v:number)=><Progress percent={v} size="small" style={{width:80}} /> },
    { title:'耗时', dataIndex:'duration', key:'duration' },
    { title:'操作', key:'action', render:()=><a>查看</a> },
  ];
  return (
    <PageContainer header={{ title:'向量化', subTitle:'Embedding 任务 / 批量处理 / 维度管理' }}
      extra={[<Button key="add" type="primary" icon={<PlusOutlined />}>新建 Embedding 任务</Button>]}>
      <Row gutter={16} style={{marginBottom:16}}>
        <Col span={6}><StatisticCard statistic={{title:'总 Embedding', value:'456,892', valueStyle:{color:'#722ed1'}}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'今日新增', value:'12,534'}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'队列中', value:56, valueStyle:{color:'#fa8c16'}}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'平均延迟', value:'120ms', valueStyle:{color:'#52c41a'}}} /></Col>
      </Row>
      <Table rowKey="id" columns={cols} dataSource={[
        {id:'EMB-001',source:'articles表',model:'text-embedding-3-small',dim:1536,status:'运行中',count:'45.6K',progress:78,duration:'2h 15m'},
        {id:'EMB-002',source:'documents表',model:'text-embedding-3-large',dim:3072,status:'成功',count:'12.3K',progress:100,duration:'45m'},
        {id:'EMB-003',source:'datasets:news',model:'bge-large-zh',dim:1024,status:'成功',count:'89.2K',progress:100,duration:'3h 20m'},
        {id:'EMB-004',source:'新增文章',model:'text-embedding-3-small',dim:1536,status:'等待中',count:'1.2K',progress:0,duration:'-'},
      ]} pagination={false} size="middle" />
    </PageContainer>
  );
};
export default AIEmbeddingPage;
