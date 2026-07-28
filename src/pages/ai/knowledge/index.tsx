import React from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography, Row, Col, Tag, Button, Space } from "antd";
import { NodeIndexOutlined, PlusOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const AIKnowledgePage: React.FC = () => (
  <PageContainer header={{ title:'知识处理', subTitle:'知识图谱构建、实体链接、事实校验' }}>
    <Row gutter={16}>
      <Col span={16}>
        <Card title="知识图谱">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, position:'relative', background:'#fafafa', borderRadius:8 }}>
            <div style={{ position:'relative', width:500, height:300 }}>
              {[
                {x:250,y:40,label:'OpenAI',color:'blue'},
                {x:120,y:160,label:'GPT-5',color:'purple'},
                {x:380,y:160,label:'Sam Altman',color:'gold'},
                {x:250,y:280,label:'AI 行业',color:'cyan'},
              ].map((node,i) => (
                <div key={i} style={{position:'absolute',left:node.x-50,top:node.y-20,width:100,padding:'8px 0',
                  background:'#fff',border:`2px solid ${node.color==='blue'?'#1677ff':node.color==='purple'?'#722ed1':node.color==='gold'?'#fa8c16':'#13c2c2'}`,
                  borderRadius:20,textAlign:'center',fontSize:12,fontWeight:600,zIndex:2}}>
                  {node.label}
                </div>
              ))}
              <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:1}}>
                <line x1={250} y1={60} x2={170} y2={150} stroke="#d9d9d9" strokeWidth={2} markerEnd="url(#ag)" />
                <line x1={250} y1={60} x2={330} y2={150} stroke="#d9d9d9" strokeWidth={2} markerEnd="url(#ag)" />
                <line x1={170} y1={180} x2={220} y2={270} stroke="#d9d9d9" strokeWidth={2} markerEnd="url(#ag)" />
                <line x1={330} y1={180} x2={280} y2={270} stroke="#d9d9d9" strokeWidth={2} markerEnd="url(#ag)" />
                <defs><marker id="ag" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#d9d9d9" /></marker></defs>
              </svg>
            </div>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card title="实体关系" size="small" style={{marginBottom:12}}>
          {[{s:'OpenAI',r:'发布',o:'GPT-5'},{s:'OpenAI',r:'CEO',o:'Sam Altman'},{s:'OpenAI',r:'属于',o:'AI 行业'},{s:'GPT-5',r:'属于',o:'AI 行业'}].map((r,i) => (
            <div key={i} style={{padding:'4px 0',borderBottom:'1px solid #f0f0f0'}}>
              <Tag color="blue">{r.s}</Tag> → <Text type="secondary">{r.r}</Text> → <Tag color="purple">{r.o}</Tag>
            </div>
          ))}
        </Card>
        <Card title="事实校验" size="small">
          {[{fact:'OpenAI 发布 GPT-5',result:'已确认',color:'green'},{fact:'Sam Altman 是 OpenAI CEO',result:'已确认',color:'green'},{fact:'GPT-5 发布于 2023',result:'待验证',color:'gold'}].map((f,i) => (
            <div key={i} style={{padding:'4px 0',display:'flex',justifyContent:'space-between'}}>
              <Text>{f.fact}</Text><Tag color={f.color}>{f.result}</Tag>
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  </PageContainer>
);
export default AIKnowledgePage;
