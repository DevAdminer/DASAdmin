import React, { useState } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Input, Button, Space, Typography, List, Select, Tag, Avatar } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

interface Message { role: 'user' | 'assistant'; content: string; time: string; }

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role:'assistant', content:'你好！我是 DataScope AI 助手。你可以向我提问，我会基于知识库中的内容进行回答。', time:'16:30' },
  ]);
  const [input, setInput] = useState('');
  const [sessions] = useState([{id:1,title:'数据分析讨论',time:'今天 16:30',active:true},{id:2,title:'新闻摘要测试',time:'昨天 14:20'},{id:3,title:'标签提取调试',time:'2天前'}]);

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role:'user', content:input, time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}) }]);
    setInput('');
    setTimeout(() => setMessages(prev => [...prev, { role:'assistant', content:'好的，我来帮你分析。根据当前的知识库数据...', time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}) }]), 500);
  };

  return (
    <PageContainer header={{ title:'AI 对话', subTitle:'多轮对话 / 流式输出 / 上下文管理' }}>
      <div style={{ display:'flex', gap:16, height:'calc(100vh - 200px)' }}>
        <Card title="对话列表" size="small" style={{ width:240, overflowY:'auto' }} extra={<Button type="link" size="small">新建</Button>}>
          {sessions.map(s => (
            <div key={s.id} style={{padding:'10px 12px',marginBottom:4,borderRadius:6,cursor:'pointer',background:s.active?'#e6f4ff':'#fafafa'}}>
              <Text strong style={{fontSize:13}}>{s.title}</Text>
              <div style={{fontSize:11,color:'#8c8c8c'}}>{s.time}</div>
            </div>
          ))}
        </Card>
        <Card style={{flex:1,display:'flex',flexDirection:'column'}} bodyStyle={{flex:1,display:'flex',flexDirection:'column',padding:0}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #f0f0f0',display:'flex',gap:8,alignItems:'center'}}>
            <span>模型:</span><Select size="small" defaultValue="gpt-4o-mini" style={{width:150}}><Select.Option value="gpt-4o-mini">GPT-4o-mini</Select.Option><Select.Option value="claude-3-haiku">Claude 3 Haiku</Select.Option></Select>
            <span>知识库:</span><Select size="small" defaultValue="news" style={{width:120}}><Select.Option value="news">新闻知识库</Select.Option></Select>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:16}}>
            {messages.map((m,i) => (
              <div key={i} style={{display:'flex',gap:10,marginBottom:16,justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                {m.role==='assistant' && <Avatar icon={<RobotOutlined />} style={{background:'linear-gradient(135deg,#722ed1,#eb2f96)',flexShrink:0}} />}
                <div style={{maxWidth:'70%',padding:'10px 14px',borderRadius:8,background:m.role==='user'?'#e6f4ff':'#f5f0ff',fontSize:13}}>
                  <div>{m.content}</div>
                  <div style={{fontSize:10,color:'#8c8c8c',marginTop:4,textAlign:'right'}}>{m.time}</div>
                </div>
                {m.role==='user' && <Avatar icon={<UserOutlined />} style={{background:'#1677ff',flexShrink:0}} />}
              </div>
            ))}
          </div>
          <div style={{padding:'12px 16px',borderTop:'1px solid #f0f0f0',display:'flex',gap:8}}>
            <Input.TextArea value={input} onChange={e=>setInput(e.target.value)} onPressEnter={(e)=>{e.preventDefault();send();}} placeholder="输入消息..." autoSize={{minRows:1,maxRows:3}} style={{flex:1}} />
            <Button type="primary" icon={<SendOutlined />} onClick={send}>发送</Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
export default AIChatPage;
