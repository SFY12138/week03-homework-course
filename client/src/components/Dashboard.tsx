import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Spin, message } from 'antd';
import * as echarts from 'echarts';

interface DashboardData {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  activeStudents: number;
  publishRate: number;
  activeRate: number;
  courseTop8: Array<{ name: string; count: number }>;
  activityData: Array<{ date: string; users: number; duration: number }>;
  studentStatus: Array<{ name: string; value: number }>;
  courseCategories: Array<{ name: string; value: number }>;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  
  // 使用 useRef 存储 ECharts 实例
  const courseChartRef = useRef<echarts.ECharts | null>(null);
  const activityChartRef = useRef<echarts.ECharts | null>(null);
  const studentChartRef = useRef<echarts.ECharts | null>(null);
  const categoryChartRef = useRef<echarts.ECharts | null>(null);
  
  // 使用 useRef 存储 DOM 元素
  const courseChartDomRef = useRef<HTMLDivElement | null>(null);
  const activityChartDomRef = useRef<HTMLDivElement | null>(null);
  const studentChartDomRef = useRef<HTMLDivElement | null>(null);
  const categoryChartDomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (data) {
      initCharts();
    }
    
    // 清理函数，在组件卸载时执行
    return () => {
      // 销毁 ECharts 实例
      courseChartRef.current?.dispose();
      activityChartRef.current?.dispose();
      studentChartRef.current?.dispose();
      categoryChartRef.current?.dispose();
      
      // 移除窗口大小变化监听器
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  // 处理窗口大小变化
  const handleResize = () => {
    courseChartRef.current?.resize();
    activityChartRef.current?.resize();
    studentChartRef.current?.resize();
    categoryChartRef.current?.resize();
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('获取数据失败');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      message.error('获取数据失败');
      console.error('获取数据错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const initCharts = () => {
    if (!data) return;

    // 课程选课人数TOP8
    if (courseChartDomRef.current) {
      courseChartRef.current = echarts.init(courseChartDomRef.current);
      courseChartRef.current.setOption({
        title: {
          text: '课程选课人数TOP8',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: data.courseTop8.map(item => item.name),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: data.courseTop8.map(item => item.count),
          type: 'bar',
          itemStyle: {
            color: '#1890ff'
          }
        }]
      });
    }

    // 近7天学习活跃度
    if (activityChartDomRef.current) {
      activityChartRef.current = echarts.init(activityChartDomRef.current);
      activityChartRef.current.setOption({
        title: {
          text: '近7天学习活跃度',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['学习人数', '学习时长'],
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: data.activityData.map(item => item.date)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '学习人数',
            type: 'line',
            data: data.activityData.map(item => item.users),
            itemStyle: {
              color: '#1890ff'
            }
          },
          {
            name: '学习时长',
            type: 'line',
            data: data.activityData.map(item => item.duration),
            itemStyle: {
              color: '#52c41a'
            }
          }
        ]
      });
    }

    // 学生状态分布
    if (studentChartDomRef.current) {
      studentChartRef.current = echarts.init(studentChartDomRef.current);
      studentChartRef.current.setOption({
        title: {
          text: '学生状态分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          type: 'pie',
          radius: '50%',
          data: data.studentStatus,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      });
    }

    // 课程分类分布
    if (categoryChartDomRef.current) {
      categoryChartRef.current = echarts.init(categoryChartDomRef.current);
      categoryChartRef.current.setOption({
        title: {
          text: '课程分类分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          type: 'pie',
          radius: '50%',
          data: data.courseCategories,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      });
    }

    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
  };

  if (loading) {
    return <Spin size="large" style={{ margin: '200px auto' }} />;
  }

  if (!data) {
    return <div>获取数据失败</div>;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'left', marginBottom: 24 }}>工作台</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>课程总数</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>{data.totalCourses}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>/已发布 {data.publishedCourses}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>学生总数</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>{data.totalStudents}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>/活跃 {data.activeStudents}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>课程发布率</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>{data.publishRate}%</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>学生活跃率</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f5222d' }}>{data.activeRate}%</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card style={{ height: 300 }}>
            <div ref={courseChartDomRef} style={{ width: '100%', height: '100%' }}></div>
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ height: 300 }}>
            <div ref={activityChartDomRef} style={{ width: '100%', height: '100%' }}></div>
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ height: 300, marginTop: 16 }}>
            <div ref={studentChartDomRef} style={{ width: '100%', height: '100%' }}></div>
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ height: 300, marginTop: 16 }}>
            <div ref={categoryChartDomRef} style={{ width: '100%', height: '100%' }}></div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;