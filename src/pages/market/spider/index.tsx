import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Space, Button, Card, Row, Col, Typography, Rate } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import React, { useState } from 'react';

const { Text, Title } = Typography;

// ===== 爬虫插件市场 =====
const SpiderMarketPage: React.FC = () => {
  const [tab, setTab] = useState('spider');
  return (
    <PageContainer header={{ title: '插件市场', subTitle: '浏览和安装社区共享的爬虫、AI 和 Pipeline 插件' }}
      tabList={[{tab:'爬虫插件',key:'spider'},{tab:'AI 插件',key:'ai'},{tab:'Pipeline 插件',key:'pipeline'},{tab:'模板库',key:'templates'},{tab:'已安装',key:'installed'}]}
      onTabChange={k => setTab(k)}>
      {tab === 'spider' && <MarketGrid type="spider" />}
      {tab === 'ai' && <MarketGrid type="ai" />}
      {tab === 'pipeline' && <MarketGrid type="pipeline" />}
      {tab === 'templates' && <MarketGrid type="templates" />}
      {tab === 'installed' && <InstalledTab />}
    </PageContainer>
  );
};

const MARKET_DATA: Record<string, any[]> = {
  spider: [
    { id: 1, name: 'GitHub Trending', description: '采集 GitHub Trending 项目列表', author: 'community', rating: 4.5, downloads: 1200, version: 'v1.2', icon: '📊' },
    { id: 2, name: '豆瓣电影 Top250', description: '采集豆瓣电影 Top250 列表和详情', author: 'official', rating: 4.8, downloads: 3200, version: 'v2.0', icon: '🎬' },
    { id: 3, name: '天气预报采集', description: '采集各大天气预报网站数据', author: 'community', rating: 3.9, downloads: 890, version: 'v1.0', icon: '🌤' },
  ],
  ai: [
    { id: 1, name: '多语言翻译', description: '支持 50+ 语言互译的 AI 插件', author: 'official', rating: 4.6, downloads: 2100, version: 'v1.5', icon: '🌍' },
    { id: 2, name: '情感分析增强', description: '基于 BERT 的情感分析插件', author: 'community', rating: 4.2, downloads: 1500, version: 'v2.1', icon: '😊' },
  ],
  pipeline: [
    { id: 1, name: '数据脱敏', description: '自动识别和脱敏敏感信息（手机号/身份证/邮箱）', author: 'official', rating: 4.7, downloads: 1800, version: 'v1.3', icon: '🔒' },
    { id: 2, name: '图片压缩', description: '批量压缩和优化图片资源', author: 'community', rating: 4.1, downloads: 920, version: 'v1.0', icon: '🖼' },
  ],
  templates: [
    { id: 1, name: '新闻聚合项目模板', description: '预配置的新闻聚合项目，含 3 个爬虫 + 1 个 Pipeline', author: 'official', rating: 4.9, downloads: 5600, icon: '📰' },
    { id: 2, name: '社交媒体监控模板', description: '微博/知乎/小红书 多源采集模板', author: 'community', rating: 4.3, downloads: 2800, icon: '💬' },
  ],
};

const MarketGrid: React.FC<{ type: string }> = ({ type }) => {
  const items = MARKET_DATA[type] || [];
  if (items.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: '#8c8c8c' }}>暂无插件</div>;
  return (
    <Row gutter={[16, 16]}>
      {items.map(item => (
        <Col span={8} key={item.id}>
          <Card hoverable actions={[<Button type="primary" size="small" key="install">安装</Button>, <a key="detail">详情</a>]}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 32 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <Text strong>{item.name}</Text>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{item.description}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size={4}><Rate disabled value={item.rating} style={{ fontSize: 12 }} /><Text style={{ fontSize: 12 }}>{item.rating}</Text></Space>
              <Space><Tag color="purple">{item.author}</Tag><Tag>{item.version}</Tag></Space>
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>📥 {item.downloads.toLocaleString()} 次下载</div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

const InstalledTab: React.FC = () => (
  <ProTable rowKey="id" search={false}
    columns={[{title:'插件名称',dataIndex:'name',key:'name'},{title:'类型',dataIndex:'type',key:'type',width:100,render:(v)=><Tag>{v}</Tag>},{title:'版本',dataIndex:'version',key:'version',width:80},{title:'状态',dataIndex:'status',key:'status',width:80,render:()=><Tag color="green">已安装</Tag>},{title:'操作',key:'action',width:120,render:()=><Space><a>更新</a><a>卸载</a></Space>}]}
    dataSource={[{id:1,name:'通用新闻采集',type:'爬虫',version:'v1.2'},{id:2,name:'数据脱敏',type:'Pipeline',version:'v1.3'}]} pagination={false} />
);

export default SpiderMarketPage;
