import React, { useState, useEffect } from 'react';
// 🌟 引入了所需的 Ant Design 组件和图标
import { Layout, Typography, Row, Col, Card, Slider, Button, Space, Statistic, Spin, InputNumber, Divider, Progress, ConfigProvider, theme, Switch, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
// 🌟 引入 ECharts 用于图表渲染
import ReactECharts from 'echarts-for-react';

const { Title, Text } = Typography;

// 反馈文案逻辑
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
  const [socialFreq, setSocialFreq] = useState(1); // 默认一周一次社交
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    probDefault: 0, medianBalance: 0, worstCase: 0,
    chartData: { days: [], median: [], worst: [], best: [] }
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  // 核心模拟副作用
  useEffect(() => {
    const runSimulation = async () => {
      setLoading(true);
      try {
        // 🌟 核心修改 1：让吃饭的开销变得极度不可控！(上下浮动 40% 到 180%)
        // 🌟 核心修改 2：社交可能不花钱(蹭饭)，也可能去高档酒吧花大钱！(0 到 200 镑)
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

    // 🌟 200ms 极致防抖
    const timer = setTimeout(runSimulation, 200);
    return () => clearTimeout(timer);
  }, [initialBalance, rent, foodBudget, socialFreq]);

  // 折线图配置
  const getLineOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { 
      data: ['Optimistic (Top 10%)', 'Median Forecast', 'Pessimistic (Bottom 10%)'], 
      bottom: 0,
      textStyle: { color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#333' } 
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

  // 🌟 新增：饼图（环形图）配置函数
  // 🌟 修复后的饼图配置
  const getPieOption = () => {
    const monthlyFood = foodBudget * 30;
    const monthlySocial = socialFreq * 4 * 40; 
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '£{c} ({d}%)'
      },
      legend: {
        orient: 'horizontal', // 🌟 改成横向排列
        bottom: '0%',         // 🌟 放在最底部，不和图表抢左右空间
        textStyle: { color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#333' }
      },
      series: [
        {
          name: 'Expense Breakdown',
          type: 'pie',
          radius: ['45%', '75%'],   // 🌟 调整环形的粗细，更好看
          center: ['50%', '45%'],   // 🌟 把圆环稍微向上挪一点，给底部的文字留出空间
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: isDarkMode ? '#141414' : '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#333' }
          },
          labelLine: { show: false },
          data: [
            { value: rent, name: '🏠 Rent' },
            { value: monthlyFood, name: '🍔 Food' },
            { value: monthlySocial, name: '🎉 Social' }
          ]
        }
      ]
    };
  };

  const feedback = getFeedbackMessage(results.probDefault);
  const healthScore = Math.max(0, 100 - Math.round(results.probDefault));
  const scoreColor = healthScore >= 80 ? '#52c41a' : healthScore >= 50 ? '#faad14' : '#ff4d4f';

  return (
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh', padding: '20px', transition: 'all 0.3s', background: isDarkMode ? '#141414' : '#f0f2f5' }}>
        
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
          {/* 左侧输入区 */}
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

          {/* 右侧可视化区 */}
          <Col span={16}>
            <Spin spinning={loading} tip="Calculating 1,000 possibilities...">
              
              {/* 🌟 新增：支出结构饼图卡片 (放在健康分和数据卡片之间) */}
              <Row gutter={16}>
                <Col span={12}>
                   <Card style={{ marginBottom: '16px', textAlign: 'center', background: isDarkMode ? '#1f1f1f' : '#fafafa', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                      <div>
                        <Title level={4} style={{ margin: 0, color: isDarkMode ? 'rgba(255,255,255,0.85)' : '#595959' }}>Financial Health</Title>
                        <Text type="secondary">Score /100</Text>
                      </div>
                      <Progress 
                        type="dashboard" 
                        percent={healthScore} 
                        strokeColor={scoreColor}
                        format={percent => `${percent}`}
                        size={120}
                        gapDegree={60}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="📊 Est. Monthly Breakdown" style={{ marginBottom: '16px', height: '300px' }} bodyStyle={{ padding: '10px' }}>
                    <ReactECharts option={getPieOption()} style={{ height: '100%' }} theme={isDarkMode ? 'dark' : 'light'} />
                  </Card>
                </Col>
              </Row>

              {/* 三个带有 Tooltips 金融科普的小卡片 */}
             {/* 🌟 修复后的排版：健康分表盘和支出结构饼图 */}
              <Row gutter={16}>
                <Col span={12}>
                   <Card style={{ marginBottom: '16px', textAlign: 'center', background: isDarkMode ? '#1f1f1f' : '#fafafa', height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                      <div>
                        <Title level={4} style={{ margin: 0, color: isDarkMode ? 'rgba(255,255,255,0.85)' : '#595959' }}>Financial Health Score</Title>
                        <Text type="secondary">Based on stochastic risk analysis</Text>
                      </div>
                      <Progress 
                        type="dashboard" 
                        percent={healthScore} 
                        strokeColor={scoreColor}
                        format={percent => `${percent}`}
                        size={140}
                        gapDegree={60}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  {/* 🌟 给卡片内部去掉多余的 padding，并且给 ECharts 写死 240px 的高度防止压扁 */}
                  <Card title="📊 Est. Monthly Breakdown" style={{ marginBottom: '16px', height: '320px' }} styles={{ body: { padding: '10px 0' } }}>
                    <ReactECharts option={getPieOption()} style={{ height: '240px', width: '100%' }} theme={isDarkMode ? 'dark' : 'light'} />
                  </Card>
                </Col>
              </Row>

              {/* 反馈信息框 */}
              <div style={{
                marginTop: '16px', padding: '16px', backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                borderRadius: '8px', borderLeft: `5px solid ${feedback.color}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{ color: feedback.color, fontSize: '15px', fontWeight: '500' }}>{feedback.text}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>* Results are probabilistic projections, not professional financial advice.</div>
              </div>

              {/* 30天预测折线图 */}
              <Card title="📈 30-Day Monte Carlo Projection" style={{ marginTop: '16px' }}>
                <ReactECharts option={getLineOption()} style={{ height: '350px' }} theme={isDarkMode ? 'dark' : 'light'} />
              </Card>
            </Spin>
          </Col>
        </Row>
      </Layout>
    </ConfigProvider>
  );
}