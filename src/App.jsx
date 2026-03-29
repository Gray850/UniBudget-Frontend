import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Slider, Button, Space, Statistic, Spin, InputNumber, Divider, Progress, ConfigProvider, theme, Switch, Tooltip, Tag } from 'antd';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, WalletOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Title, Text } = Typography;

const getFeedbackMessage = (probability) => {
  if (probability <= 10) return { type: 'success', color: '#52c41a', text: '🎉 Your financial outlook is solid! Your budget can comfortably handle unexpected expenses.' };
  if (probability <= 25) return { type: 'warning', color: '#faad14', text: '👀 Slight risk of a cash shortfall. Keep an eye on non-essential spending.' };
  if (probability <= 50) return { type: 'danger', color: '#ff4d4f', text: '⚠️ Warning: High risk! An unexpected bill could lead to an overdraft.' };
  return { type: 'critical', color: '#cf1322', text: '🚨 Critical Alert: High probability of fund depletion! Immediate action needed.' };
};

export default function App() {
  const [initialBalance, setInitialBalance] = useState(1500);
  const [rent, setRent] = useState(550);
  const [foodBudget, setFoodBudget] = useState(20);
  const [socialFreq, setSocialFreq] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ probDefault: 0, medianBalance: 0, worstCase: 0, chartData: { days: [], median: [], worst: [], best: [] } });

  useEffect(() => {
    const runSimulation = async () => {
      setLoading(true);
      try {
        const data = {
          initialBalance, daysToSimulate: 30,
          expenses: [
            { id: 'rent', name: 'Rent', type: 'fixed', amount: rent, frequency: 'monthly', dayOfCharge: 1 },
            { id: 'food', name: 'Food', type: 'variable', min: foodBudget * 0.4, max: foodBudget * 1.8, frequency: 'daily' },
            { id: 'social', name: 'Social', type: 'sporadic', min: 0, max: 80, probabilityPerDay: socialFreq / 7 }
          ]
        };
        const response = await fetch('https://unibudget-uhmr.onrender.com/api/simulate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        const resultData = await response.json();
        if (resultData?.chart_data) {
          setResults({ probDefault: resultData.bankruptcy_probability, medianBalance: resultData.median_balance, worstCase: resultData.worst_case, chartData: resultData.chart_data });
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    const timer = setTimeout(runSimulation, 200);
    return () => clearTimeout(timer);
  }, [initialBalance, rent, foodBudget, socialFreq]);

  // 计算逻辑：用于资产概览面板
  const monthlyOut = rent + (foodBudget * 30) + (socialFreq * 4 * 20);
  const netFlow = initialBalance - monthlyOut;

  const getLineOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Optimistic', 'Median', 'Pessimistic'], bottom: 0, textStyle: { color: isDarkMode ? '#aaa' : '#333' } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: (results.chartData?.days || []).map(d => `D${d}`) },
    yAxis: { type: 'value', axisLabel: { formatter: '£{value}' } },
    series: [
      { name: 'Optimistic', type: 'line', data: results.chartData?.best || [], itemStyle: { color: '#52c41a' }, lineStyle: { type: 'dashed' }, symbol: 'none' },
      { name: 'Pessimistic', type: 'line', data: results.chartData?.worst || [], itemStyle: { color: '#ff4d4f' }, lineStyle: { type: 'dashed' }, symbol: 'none', areaStyle: { color: 'rgba(255,77,79,0.1)' } },
      { name: 'Median', type: 'line', data: results.chartData?.median || [], itemStyle: { color: '#1890ff' }, lineStyle: { width: 3 }, symbol: 'none', markLine: { data: [{ yAxis: 0, lineStyle: { color: 'red' } }] } }
    ]
  });

  const getPieOption = () => ({
    tooltip: { trigger: 'item', formatter: '£{c}' },
    legend: { orient: 'horizontal', bottom: '0%', textStyle: { color: isDarkMode ? '#aaa' : '#333' } },
    series: [{
      type: 'pie', radius: ['45%', '75%'], center: ['50%', '45%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: isDarkMode ? '#141414' : '#fff', borderWidth: 2 },
      label: { show: false },
      data: [ { value: rent, name: 'Rent' }, { value: foodBudget * 30, name: 'Food' }, { value: socialFreq * 4 * 20, name: 'Social' } ]
    }]
  });

  const feedback = getFeedbackMessage(results.probDefault);

  return (
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh', padding: '20px', background: isDarkMode ? '#141414' : '#f0f2f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2} style={{ margin: 0 }}>UniBudget: Decision Support System</Title>
          <Switch checkedChildren="🌙" unCheckedChildren="☀️" checked={isDarkMode} onChange={setIsDarkMode} />
        </div>

        <Row gutter={24}>
          <Col span={8}>
            <Card title="🎛️ Control Panel" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Statistic title="Starting Balance" value={initialBalance} prefix="£" />
                <div><Text strong>Monthly Rent (£)</Text><InputNumber min={0} value={rent} onChange={setRent} style={{ width: '100%' }} /></div>
                <div><Text strong>Daily Food (£): {foodBudget}</Text><Slider min={5} max={100} value={foodBudget} onChange={setFoodBudget} /></div>
                <div><Text strong>Weekly Social: {socialFreq}</Text><Slider min={0} max={7} value={socialFreq} onChange={setSocialFreq} /></div>
                <Divider />
                {/* 🌟 录屏亮点：实时资产概览面板 */}
                <Card size="small" style={{ background: isDarkMode ? '#000' : '#fafafa', border: '1px solid #d9d9d9' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>30-Day Budget Summary</Text>
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Est. Expenses:</Text><Text type="danger">-£{monthlyOut.toFixed(0)}</Text></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}><Text>Net Cashflow:</Text><Text style={{ color: netFlow > 0 ? '#52c41a' : '#ff4d4f' }}>{netFlow > 0 ? '+' : ''}£{netFlow.toFixed(0)}</Text></div>
                  </div>
                </Card>
                <Button type="primary" danger block onClick={() => { setFoodBudget(60); setSocialFreq(5); }}>Scenario: Stress Test</Button>
              </Space>
            </Card>
          </Col>

          <Col span={16}>
            <Spin spinning={loading}>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <Card style={{ height: '280px', textAlign: 'center' }}>
                    <Title level={4}>Health Score</Title>
                    <Progress type="dashboard" percent={Math.max(0, 100 - Math.round(results.probDefault))} strokeColor={results.probDefault > 20 ? '#ff4d4f' : '#52c41a'} size={140} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Monthly Breakdown" style={{ height: '280px' }}>
                    <ReactECharts option={getPieOption()} style={{ height: '200px' }} theme={isDarkMode ? 'dark' : 'light'} />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}><Card><Statistic title="Risk Prob." value={results.probDefault} suffix="%" /></Card></Col>
                <Col span={8}><Card><Statistic title="Median Balance" value={results.medianBalance} prefix="£" /></Card></Col>
                <Col span={8}><Card><Statistic title="Worst Case" value={results.worstCase} prefix="£" /></Card></Col>
              </Row>

              <div style={{ padding: '15px', background: isDarkMode ? '#1f1f1f' : '#fff', borderRadius: '8px', borderLeft: `5px solid ${feedback.color}`, marginBottom: '16px' }}>
                <Text strong style={{ color: feedback.color }}>{feedback.text}</Text>
              </div>

              <Card title="📈 Monte Carlo Forecasting (30 Days)">
                <ReactECharts option={getLineOption()} style={{ height: '350px' }} theme={isDarkMode ? 'dark' : 'light'} />
              </Card>
            </Spin>
          </Col>
        </Row>
      </Layout>
    </ConfigProvider>
  );
}