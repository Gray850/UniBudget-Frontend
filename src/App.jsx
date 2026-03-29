import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Slider, Button, Space, Statistic, Spin, InputNumber, Divider, Progress, ConfigProvider, theme, Switch, Tooltip } from 'antd';
import { InfoCircleOutlined, DollarCircleOutlined, BulbOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Title, Text } = Typography;

const getFeedbackMessage = (probability) => {
  if (probability <= 10) return { type: 'success', color: '#52c41a', text: ' Your financial outlook is solid! Your budget can comfortably handle unexpected expenses.' };
  if (probability <= 25) return { type: 'warning', color: '#faad14', text: ' Slight risk of a cash shortfall. Keep an eye on non-essential spending.' };
  if (probability <= 50) return { type: 'danger', color: '#ff4d4f', text: ' Warning: High risk! An unexpected bill could lead to an overdraft.' };
  return { type: 'critical', color: '#cf1322', text: ' Critical Alert: High probability of fund depletion! Consider taking on more part-time hours or cutting expenses.' };
};

// 🌟 找回来的智能建议引擎 (融合了兼职逻辑)
const getActionableAdvice = (food, social, prob, partTime) => {
  let advice = [];
  if (food > 40) advice.push(" High daily food budget detected. Consider meal prep to save £100+/month.");
  if (social > 3) advice.push(" High social frequency. Reducing 1 event per week can significantly stabilize cash flow.");
  if (partTime === 0 && prob > 25) advice.push(" Consider a part-time job. Even 5 hours/week makes a huge difference to your safety net.");
  if (prob > 50) advice.push(" Critical risk: You must reduce fixed costs or increase income immediately to avoid overdraft.");
  if (advice.length === 0) advice.push(" Excellent financial habits! You have a highly sustainable lifestyle.");
  return advice;
};

export default function App() {
  const [initialBalance, setInitialBalance] = useState(2000);
  const [rent, setRent] = useState(800);
  const [foodBudget, setFoodBudget] = useState(25);
  const [socialFreq, setSocialFreq] = useState(1);
  const [partTimeHours, setPartTimeHours] = useState(0); 
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ probDefault: 0, medianBalance: 0, worstCase: 0, chartData: { days: [], median: [], worst: [], best: [] } });

  const hourlyWage = 12; 
  const monthlyWages = partTimeHours * hourlyWage * 4; 
  const monthlyOut = rent + (foodBudget * 30) + (socialFreq * 4 * 20); 
  const netFlow = initialBalance + monthlyWages - monthlyOut; 

  useEffect(() => {
    const runSimulation = async () => {
      setLoading(true);
      try {
        const data = {
          initialBalance: initialBalance + monthlyWages, 
          daysToSimulate: 30,
          expenses: [
            { id: 'rent', name: 'Rent', type: 'fixed', amount: rent, frequency: 'monthly', dayOfCharge: 1 },
            { id: 'food', name: 'Food', type: 'variable', min: Math.max(0, foodBudget * 0.5), max: foodBudget * 1.5, frequency: 'daily' },
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
  }, [initialBalance, rent, foodBudget, socialFreq, partTimeHours]);

  const getLineOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Optimistic (Top 10%)', 'Median Forecast', 'Pessimistic (Bottom 10%)'], bottom: 0, textStyle: { color: isDarkMode ? 'rgba(255,255,255,0.85)' : '#333' } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: (results.chartData?.days || []).map(d => `D${d}`) },
    yAxis: { type: 'value', axisLabel: { formatter: '£{value}' } },
    series: [
      { name: 'Optimistic (Top 10%)', type: 'line', data: results.chartData?.best || [], itemStyle: { color: '#52c41a' }, lineStyle: { type: 'dashed', width: 2 }, symbol: 'none' },
      { name: 'Pessimistic (Bottom 10%)', type: 'line', data: results.chartData?.worst || [], itemStyle: { color: '#ff4d4f' }, lineStyle: { type: 'dashed', width: 2 }, symbol: 'none', areaStyle: { color: 'rgba(255,77,79,0.1)' } },
      { name: 'Median Forecast', type: 'line', data: results.chartData?.median || [], itemStyle: { color: '#1890ff' }, lineStyle: { width: 3 }, symbol: 'none', markLine: { data: [{ yAxis: 0, name: 'Bankrupt', lineStyle: { color: 'red' } }] } }
    ]
  });

  const getPieOption = () => ({
    tooltip: { trigger: 'item', formatter: '£{c} ({d}%)' },
    legend: { orient: 'horizontal', bottom: '0%', textStyle: { color: isDarkMode ? 'rgba(255,255,255,0.85)' : '#333' } },
    series: [{
      name: 'Expense', type: 'pie', radius: ['45%', '75%'], center: ['50%', '45%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: isDarkMode ? '#141414' : '#fff', borderWidth: 2 },
      label: { show: false },
      data: [ { value: rent, name: ' Rent' }, { value: foodBudget * 30, name: ' Food' }, { value: socialFreq * 4 * 20, name: ' Social' } ]
    }]
  });

  const feedback = getFeedbackMessage(results.probDefault);
  const healthScore = Math.max(0, 100 - Math.round(results.probDefault));

  return (
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh', padding: '20px', transition: 'all 0.3s', background: isDarkMode ? '#141414' : '#f0f2f5' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2} style={{ margin: 0, color: isDarkMode ? '#fff' : '#000' }}>UniBudget Lab: Decision Support System</Title>
          <Switch checkedChildren="🌙 Dark" unCheckedChildren="☀️ Light" checked={isDarkMode} onChange={setIsDarkMode} style={{ transform: 'scale(1.2)' }} />
        </div>

        <Row gutter={24}>
          <Col span={8}>
            <Card title="🎛️ Control Panel" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                
                <div><Text strong>Starting Balance (£):</Text><InputNumber min={0} value={initialBalance} onChange={setInitialBalance} style={{ width: '100%', marginTop: '4px' }} /></div>
                <div><Text strong>Monthly Rent (£):</Text><InputNumber min={0} value={rent} onChange={setRent} style={{ width: '100%', marginTop: '4px' }} /></div>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <div><Text strong>Daily Food Budget (£): {foodBudget}</Text><Slider min={5} max={100} value={foodBudget} onChange={setFoodBudget} /></div>
                <div><Text strong>Weekly Social Events: {socialFreq}</Text><Slider min={0} max={7} value={socialFreq} onChange={setSocialFreq} /></div>
                
                <div style={{ padding: '10px', background: isDarkMode ? '#172a1a' : '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                  <Text strong style={{ color: '#52c41a' }}><DollarCircleOutlined /> Part-time Job (hrs/week): {partTimeHours}h</Text>
                  <Slider min={0} max={20} value={partTimeHours} onChange={setPartTimeHours} />
                  <Text type="secondary" style={{ fontSize: '12px', color: '#52c41a' }}>* Est. £12/hr (Total: +£{monthlyWages}/mo)</Text>
                </div>
                
                <Card size="small" style={{ background: isDarkMode ? '#1f1f1f' : '#e6f7ff', border: isDarkMode ? '1px solid #434343' : '1px solid #91d5ff', marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '13px', fontWeight: 'bold' }}>📊 30-Day Net Outlook</Text>
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Starting Balance:</Text><Text>£{initialBalance}</Text></div>
                    {partTimeHours > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}><Text>+ Est. Wages:</Text><Text>+£{monthlyWages}</Text></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text>Est. Expenses:</Text><Text type="danger">-£{monthlyOut.toFixed(0)}</Text></div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>Net Cashflow:</Text>
                      <Text strong style={{ color: netFlow >= 0 ? '#52c41a' : '#ff4d4f', fontSize: '16px' }}>{netFlow >= 0 ? '+' : ''}£{netFlow.toFixed(0)}</Text>
                    </div>
                  </div>
                </Card>

                <Space direction="vertical" style={{ width: '100%', marginTop: '12px' }}>
                  <Button type="primary" danger block onClick={() => { setFoodBudget(60); setSocialFreq(5); setPartTimeHours(0); }}>
                    Scenario: High Consumption (Crisis)
                  </Button>
                  <Button style={{ borderColor: '#52c41a', color: '#52c41a' }} block onClick={() => { setFoodBudget(15); setSocialFreq(1); setPartTimeHours(10); }}>
                    Scenario: Frugal & Hustle (Safe)
                  </Button>
                </Space>

              </Space>
            </Card>
          </Col>

          <Col span={16}>
            <Spin spinning={loading} tip="Running 1,000 Monte Carlo simulations...">
              
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <Card style={{ height: '300px', textAlign: 'center', background: isDarkMode ? '#1f1f1f' : '#fafafa', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Title level={4} style={{ margin: 0, color: isDarkMode ? 'rgba(255,255,255,0.85)' : '#595959', marginBottom: '10px' }}>Financial Health Score</Title>
                    <Progress type="dashboard" percent={healthScore} strokeColor={healthScore >= 80 ? '#52c41a' : healthScore >= 50 ? '#faad14' : '#ff4d4f'} format={percent => `${percent}`} size={140} gapDegree={60} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="📊 Est. Monthly Breakdown" style={{ height: '300px' }} styles={{ body: { padding: '10px 0' } }}>
                    <ReactECharts option={getPieOption()} style={{ height: '220px', width: '100%' }} theme={isDarkMode ? 'dark' : 'light'} />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={8}><Card><Statistic title={<span>Prob. of Default <Tooltip title="The likelihood your balance drops below £0 within 30 days."><InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} /></Tooltip></span>} value={results.probDefault} suffix="%" valueStyle={{ color: results.probDefault > 20 ? '#cf1322' : '#3f8600' }} /></Card></Col>
                <Col span={8}><Card><Statistic title={<span>Median End Balance <Tooltip title="The most likely remaining balance after 30 days."><InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} /></Tooltip></span>} value={results.medianBalance} prefix="£" /></Card></Col>
                <Col span={8}><Card><Statistic title={<span>Worst Case <Tooltip title="An extreme pessimistic scenario (Bottom 10%)."><InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} /></Tooltip></span>} value={results.worstCase} prefix="£" /></Card></Col>
              </Row>

              {/* 状态警报框 */}
              <div style={{ padding: '16px', background: isDarkMode ? '#1f1f1f' : '#fff', borderRadius: '8px', borderLeft: `5px solid ${feedback.color}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
                <div style={{ color: feedback.color, fontSize: '15px', fontWeight: '500' }}>{feedback.text}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>* Results are probabilistic projections, not professional financial advice.</div>
              </div>

              {/* 🌟 找回的智能专家建议面板！ */}
              <Card size="small" title={<span><BulbOutlined style={{ color: '#faad14' }} /> Smart Actionable Insights</span>} style={{ marginBottom: '16px', background: isDarkMode ? '#141414' : '#fffbe6', borderColor: isDarkMode ? '#434343' : '#ffe58f' }}>
                <ul style={{ paddingLeft: '20px', margin: 0, color: isDarkMode ? '#aaa' : '#555', fontSize: '14px', lineHeight: '1.8' }}>
                  {getActionableAdvice(foodBudget, socialFreq, results.probDefault, partTimeHours).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </Card>

              <Card title="📈 30-Day Monte Carlo Projection">
                <ReactECharts option={getLineOption()} style={{ height: '350px' }} theme={isDarkMode ? 'dark' : 'light'} />
              </Card>

            </Spin>
          </Col>
        </Row>
      </Layout>
    </ConfigProvider>
  );
}