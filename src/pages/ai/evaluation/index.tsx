import React from "react";
import { PageContainer, StatisticCard } from "@ant-design/pro-components";
import { Row, Col, Button, Tag, Table, Typography, Progress } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

const AIEvaluationPage: React.FC = () => {
  const cols = [
    { title:'评估名称', dataIndex:'name', key:'name' },
    { title:'模型', dataIndex:'model', key:'model' },
    { title:'数据集', dataIndex:'dataset', key:'dataset' },
    { title:'准确率', dataIndex:'precision', key:'precision' },
    { title:'召回率', dataIndex:'recall', key:'recall' },
    { title:'F1', dataIndex:'f1', key:'f1', render:(v:number)=><Text strong style={{color:v>=90?'#52c41a':'#fa8c16'}}>{v}%</Text> },
    { title:'样本量', dataIndex:'samples', key:'samples' },
    { title:'状态', dataIndex:'status', key:'status', render:(v:string)=><Tag color={v==='完成'?'green':'gold'}>{v}</Tag> },
    { title:'操作', key:'action', render:()=><a>详情</a> },
  ];
  return (
    <PageContainer header={{ title:'AI 评估', subTitle:'准确率 / 召回率 / F1 / 人工标注对比' }}
      extra={[<Button key="add" type="primary" icon={<PlusOutlined />}>新建评估任务</Button>]}>
      <Row gutter={16} style={{marginBottom:16}}>
        <Col span={6}><StatisticCard statistic={{title:'平均准确率', value:'94.2%', valueStyle:{color:'#52c41a'}}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'平均召回率', value:'91.8%', valueStyle:{color:'#1677ff'}}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'平均 F1', value:'93.0%', valueStyle:{color:'#722ed1'}}} /></Col>
        <Col span={6}><StatisticCard statistic={{title:'总评估数', value:12}} /></Col>
      </Row>
      <Table rowKey="name" columns={cols} dataSource={[
        {name:'新闻分类评估',model:'gpt-4o-mini',dataset:'news_10k',precision:'95.3%',recall:'93.1%',f1:94.2,samples:'10,000',status:'完成'},
        {name:'实体抽取评估',model:'gpt-4o',dataset:'ner_5k',precision:'97.8%',recall:'95.2%',f1:96.5,samples:'5,000',status:'完成'},
        {name:'情感分析评估',model:'claude-3-haiku',dataset:'sentiment_8k',precision:'89.5%',recall:'87.1%',f1:88.3,samples:'8,000',status:'运行中'},
      ]} pagination={false} size="middle" />
    </PageContainer>
  );
};
export default AIEvaluationPage;
