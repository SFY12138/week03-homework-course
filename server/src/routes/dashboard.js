import Router from '@koa/router';
import { authenticateToken } from '../middleware/auth.js';
import { success } from '../utils/response.js';
import { mockCourses } from './courses.js';
import { mockStudents } from './students.js';

const router = new Router();

router.get('/', authenticateToken, async (ctx) => {
  const courses = mockCourses;
  const students = mockStudents;
  
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(course => course.status === 'published').length;
  const totalStudents = students.length;
  const activeStudents = students.filter(student => student.status === 'active').length;
  
  const publishRate = Math.round((publishedCourses / totalCourses) * 100);
  const activeRate = Math.round((activeStudents / totalStudents) * 100);
  
  // 课程选课人数TOP8
  const courseTop8 = courses
    .filter(course => course.status === 'published')
    .sort((a, b) => b.student_count - a.student_count)
    .slice(0, 8)
    .map(course => ({
      name: course.name,
      count: course.student_count
    }));
  
  // 近7天学习活跃度
  const activityData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 模拟学习数据
    activityData.push({
      date: dateStr,
      users: Math.floor(Math.random() * 20) + 5,
      duration: Math.floor(Math.random() * 1000) + 200
    });
  }
  
  // 学生状态分布
  const studentStatus = [
    { name: '活跃', value: activeStudents },
    { name: '非活跃', value: totalStudents - activeStudents }
  ];
  
  // 课程分类分布
  const categoryMap = {};
  courses.forEach(course => {
    if (course.category) {
      categoryMap[course.category] = (categoryMap[course.category] || 0) + 1;
    }
  });
  const courseCategories = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  success(ctx, {
    totalCourses,
    publishedCourses,
    totalStudents,
    activeStudents,
    publishRate,
    activeRate,
    courseTop8,
    activityData,
    studentStatus,
    courseCategories
  });
});

export default router;
