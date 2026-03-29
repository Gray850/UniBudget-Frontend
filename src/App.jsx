import React, { useState, useEffect } from 'react';
// 🌟 引入了 ConfigProvider, theme 和 Switch 用于暗黑模式
import { Layout, Typography, Row, Col, Card, Slider, Button, Space, Statistic, Spin, InputNumber, Divider, Progress, Table, ConfigProvider, theme, Switch } from 'antd';
import ReactECharts from 'echarts-for-react';

const { Title, Text } = Typography;

// 🌟 第一步：把判断函数放在组件的最外面
const getFeedbackMessage = (probability) => {
  if (probability <= 10) {
    return {
      type: 'success', color: '#52c41a',
      text: '🎉 Your financial outlook is solid! Your current budget can comfortably handle most unexpected expenses. Keep up the good work.'
    };
  } else if (probability > 10 && probability <= 25) {
    return {
      type: 'warning', color: '#faad14',
      text: '👀 There is a slight risk of a cash shortfall. Keep an eye on non-essential spending and try to build a small emergency buffer.'
    };
  } else if (probability > 25 && probability <= 50) {
    return {
      type: 'danger', color: '#ff4d4f',
      text: '⚠️ Warning: Your spending pattern carries a high risk! An unexpected bill could lead to an overdraft. We strongly recommend reviewing your budget.'
    };
  } else {
    return {
      type: 'critical', color: '#cf1322',
      text: '🚨 Critical Alert: High probability of fund depletion! Immediate action is needed: look for ways to boost your income or significantly reduce fixed costs.'
    };
  }
};

export default function App() {
  const [initialBalance, setInitialBalance] = useState(1500);
  const [rent, setRent] = useState(550);
  const [foodBudget, setFoodBudget] = useState(20);
  const [socialFreq, setSocialFreq] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    probDefault: 0, medianBalance: 0, worstCase: 0,
    chartData: { days: [], median: [], worst: [], best: [] }
  });

  // 🌟 新增：控制暗黑模式的状态开关
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 模拟的历史账单数据
  const mockTransactions = [
    { id: 1, date: '2026-03-20', name: 'Tesco Supermarket', category: 'Food', amount: 45.20 },
    { id: 2, date: '2026-03-21', name: 'Monthly Rent', category: 'Housing', amount: 550.00 },
    { id: 3, date: '2026-03-22', name: 'University Guild', category: 'Social', amount: 15.00 },
    { id: 4, date: '2026-03-23', name: 'Bus Pass', category: 'Transport', amount: 20.00 },
  ];

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Description', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (text) => `£${text}` },
  ];

  useEffect(() => {
    const runSimulation = async () => {
      setLoading(true);
      try {
        const data = {
          initialBalance: initialBalance, 
          daysToSimulate: 30,
          expenses: [
            { id: 'rent', name: 'Rent', type: 'fixed', amount: rent, frequency: 'monthly', dayOfCharge: 1 },
            { id: 'food', name: 'Food', type: 'variable', min: Math.max(0, foodBudget * 0.4), max: foodBudget * 1.8, frequency: 'daily' },
            { id: 'social', name: 'Social', type: 'sporadic', min: 0, max: 200, probabilityPerDay: socialFreq / 7 }
          ]
        };

        const response = await fetch('https://unibudget-uhmr.onrender.com/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resultData = await response.json();
        
        if (resultData && resultData.chart_data) {
          setResults({
            probDefault: resultData.bankruptcy_probability,
            medianBalance: resultData.median_balance,
            worstCase: resultData.worst_case,
            chartData: resultData.chart_data
          });
        }
      } catch (e) {
        console.error("连接或者解析失败了:", e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(runSimulation, 500);
    return () => clearTimeout(timer);
  }, [initialBalance, rent, foodBudget, socialFreq]);

  const getOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { 
      data: ['Optimistic (Top 10%)', 'Median Forecast', 'Pessimistic (Bottom 10%)'], 
      bottom: 0,
      textStyle: { color: isDarkMode ? '#rgba(255, 255, 255, 0.85)' : '#333' } // 🌟 图例颜色适配暗黑模式
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      data: (results.chartData?.days || []).map(d => `Day ${d}`) 
    },
    yAxis: { 
      type: 'value', 
      axisLabel: { formatter: '£{value}' } 
    },
    series: [
      {
        name: 'Optimistic (Top 10%)', type: 'line', data: results.chartData?.best || [],
        itemStyle: { color: '#52c41a' }, lineStyle: { type: 'dashed', width: 2 }, symbol: 'none'
      },
      {
        name: 'Pessimistic (Bottom 10%)', type: 'line', data: results.chartData?.worst || [],
        itemStyle: { color: '#ff4d4f' }, lineStyle: { type: 'dashed', width: 2 }, symbol: 'none',
        areaStyle: { color: 'rgba(255, 77, 79, 0.1)' } 
      },
      {
        name: 'Median Forecast', type: 'line', data: results.chartData?.median || [],
        itemStyle: { color: '#1890ff' }, lineStyle: { width: 3 }, symbol: 'none',
        markLine: { data: [{ yAxis: 0, name: 'Bankrupt', lineStyle: { color: 'red', type: 'solid' } }] }
      }
    ]
  });

  const feedback = getFeedbackMessage(results.probDefault);
  const healthScore = Math.max(0, 100 - Math.round(results.probDefault));
  const scoreColor = healthScore >= 80 ? '#52c41a' : healthScore >= 50 ? '#faad14' : '#ff4d4f';

  return (
    // 🌟 核心：ConfigProvider 自动接管全局的暗色/亮色主题
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh', padding: '20px', transition: 'all 0.3s', background: isDarkMode ? '#141414' : '#f0f2f5' }}>
        
        {/* 🌟 顶部加入 Switch 开关，布局改为 flex 以便左右对齐 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
            UniBudget Lab: Student Budget Decision Support System
          </Title>
          <Switch 
            checkedChildren="🌙 Dark" 
            unCheckedChildren="☀️ Light" 
            checked={isDarkMode} 
            onChange={setIsDarkMode} 
            style={{ transform: 'scale(1.2)' }}
          />
        </div>

        <Row gutter={24}>
          <Col span={8}>
            <Card title="🎛️ Financial & Lifestyle Inputs" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text strong>Current Balance (£): </Text>
                  <InputNumber min={0} value={initialBalance} onChange={setInitialBalance} style={{ width: '100%' }} />
                </div>
                <div>
                  <Text strong>Monthly Rent (£): </Text>
                  <InputNumber min={0} value={rent} onChange={setRent} style={{ width: '100%' }} />
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong>Daily Food Budget (£): {foodBudget}</Text>
                  <Slider min={5} max={100} value={foodBudget} onChange={setFoodBudget} />
                </div>
                <div>
                  <Text strong>Weekly Social Events: {socialFreq}</Text>
                  <Slider min={0} max={7} value={socialFreq} onChange={setSocialFreq} />
                </div>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" danger block onClick={() => { setFoodBudget(60); setSocialFreq(5); }}>
                    Scenario: High Consumption
                  </Button>
                  <Button block onClick={() => { setFoodBudget(15); setSocialFreq(1); }}>
                    Scenario: Frugal Lifestyle
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col span={16}>
            <Spin spinning={loading} tip="Calculating 1,000 possibilities...">
              {/* 🌟 动态适配暗色模式的卡片背景 */}
              <Card style={{ marginBottom: '16px', textAlign: 'center', background: isDarkMode ? '#1f1f1f' : '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: isDarkMode ? '#rgba(255,255,255,0.85)' : '#595959' }}>Financial Health Score</Title>
                    <Text type="secondary">Based on stochastic risk analysis</Text>
                  </div>
                  <Progress 
                    type="dashboard" 
                    percent={healthScore} 
                    strokeColor={scoreColor}
                    format={percent => `${percent} pts`}
                    size={120}
                  />
                </div>
              </Card>

              <Row gutter={16}>
                <Col span={8}><Card><Statistic title="Prob. of Default" value={results.probDefault} suffix="%" valueStyle={{ color: results.probDefault > 20 ? '#cf1322' : '#3f8600' }} /></Card></Col>
                <Col span={8}><Card><Statistic title="Median End Balance" value={results.medianBalance} prefix="£" /></Card></Col>
                <Col span={8}><Card><Statistic title="Worst Case" value={results.worstCase} prefix="£" /></Card></Col>
              </Row>

              {/* 🌟 动态适配暗色模式的反馈框背景 */}
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                borderRadius: '8px',
                borderLeft: `5px solid ${feedback.color}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{ color: feedback.color, fontSize: '15px', fontWeight: '500' }}>
                  {feedback.text}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                  * Results are probabilistic projections, not professional financial advice.
                </div>
              </div>

              {/* 🌟 ECharts 深度绑定暗色主题 */}
              <Card title="📊 30-Day Cash Flow Projection" style={{ marginTop: '16px' }}>
                <ReactECharts option={getOption()} style={{ height: '350px' }} theme={isDarkMode ? 'dark' : 'light'} />
              </Card>

              {/* 🌟 把你漏掉的 Table 补上了 */}
              <Card title="🧾 Recent Transactions (Billing Grid)" style={{ marginTop: '16px' }}>
                <Table 
                  dataSource={mockTransactions} 
                  columns={columns} 
                  pagination={{ pageSize: 3 }} 
                  size="small"
                  rowKey="id"
                />
              </Card>

            </Spin>
          </Col>
        </Row>
      </Layout>
    </ConfigProvider>
  );
}