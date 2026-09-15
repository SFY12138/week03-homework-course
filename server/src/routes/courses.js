import Router from '@koa/router';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { success, fail } from '../utils/response.js';

// 直接使用模拟数据
export const mockCourses = [
  { id: 1, name: 'React 基础', description: 'React 入门课程', instructor: '张老师', category: '前端开发', lesson_count: 12, student_count: 35, status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, name: 'Node.js 实战', description: 'Node.js 后端开发', instructor: '李老师', category: '后端开发', lesson_count: 15, student_count: 28, status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, name: '数据库原理', description: '数据库基础知识', instructor: '王老师', category: '数据库', lesson_count: 10, student_count: 22, status: 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 4, name: 'Vue 3 入门', description: 'Vue 3 基础课程', instructor: '张老师', category: '前端开发', lesson_count: 10, student_count: 30, status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 5, name: 'Python 编程', description: 'Python 基础到进阶', instructor: '刘老师', category: '编程语言', lesson_count: 18, student_count: 45, status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const router = new Router();

router.get('/', authenticateToken, async (ctx) => {
  const { keyword = '', status = '', category = '', page = 1, pageSize = 10, sortField = '', sortOrder = '' } = ctx.query;
  
  // 过滤数据
  let filteredCourses = mockCourses;
  
  if (keyword) {
    filteredCourses = filteredCourses.filter(course => 
      course.name.includes(keyword) || course.instructor.includes(keyword)
    );
  }
  
  if (status) {
    filteredCourses = filteredCourses.filter(course => course.status === status);
  }
  
  if (category) {
    filteredCourses = filteredCourses.filter(course => course.category === category);
  }
  
  // 排序数据
  if (sortField && ['ascend', 'descend'].includes(sortOrder)) {
    filteredCourses.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // 处理日期类型
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'ascend') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }
  
  // 分页数据
  const total = filteredCourses.length;
  const offset = (Number(page) - 1) * Number(pageSize);
  const list = filteredCourses.slice(offset, offset + Number(pageSize));

  success(ctx, { list, total, page: Number(page), pageSize: Number(pageSize) });
});

router.get('/categories', authenticateToken, async (ctx) => {
  const categories = [...new Set(mockCourses.map(course => course.category))]
    .filter(category => category !== '')
    .sort();
  success(ctx, categories);
});

router.get('/:id', authenticateToken, async (ctx) => {
  const course = mockCourses.find(c => c.id === Number(ctx.params.id));
  if (!course) {
    return fail(ctx, 404, '课程不存在');
  }
  success(ctx, course);
});

router.post('/', authenticateToken, async (ctx) => {
  const { name, description, instructor, category, status, lesson_count } = ctx.request.body;

  if (!name) {
    return fail(ctx, 400, '课程名称不能为空');
  }

  const newCourse = {
    id: mockCourses.length > 0 ? Math.max(...mockCourses.map(c => c.id)) + 1 : 1,
    name: name || '',
    description: description || '',
    instructor: instructor || '',
    category: category || '',
    status: status || 'draft',
    lesson_count: lesson_count || 0,
    student_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockCourses.push(newCourse);
  ctx.status = 201;
  success(ctx, newCourse);
});

router.put('/:id', authenticateToken, async (ctx) => {
  const courseIndex = mockCourses.findIndex(c => c.id === Number(ctx.params.id));
  if (courseIndex === -1) {
    return fail(ctx, 404, '课程不存在');
  }

  const { name, description, instructor, category, status, lesson_count } = ctx.request.body;

  mockCourses[courseIndex] = {
    ...mockCourses[courseIndex],
    name: name ?? mockCourses[courseIndex].name,
    description: description ?? mockCourses[courseIndex].description,
    instructor: instructor ?? mockCourses[courseIndex].instructor,
    category: category ?? mockCourses[courseIndex].category,
    status: status ?? mockCourses[courseIndex].status,
    lesson_count: lesson_count ?? mockCourses[courseIndex].lesson_count,
    updated_at: new Date().toISOString()
  };

  success(ctx, mockCourses[courseIndex]);
});

router.delete('/:id', authenticateToken, async (ctx) => {
  const courseIndex = mockCourses.findIndex(c => c.id === Number(ctx.params.id));
  if (courseIndex === -1) {
    return fail(ctx, 404, '课程不存在');
  }

  mockCourses.splice(courseIndex, 1);
  success(ctx, null, '删除成功');
});

router.patch('/:id/status', authenticateToken, async (ctx) => {
  const courseIndex = mockCourses.findIndex(c => c.id === Number(ctx.params.id));
  if (courseIndex === -1) {
    return fail(ctx, 404, '课程不存在');
  }

  const newStatus = mockCourses[courseIndex].status === 'published' ? 'draft' : 'published';
  mockCourses[courseIndex] = {
    ...mockCourses[courseIndex],
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  success(ctx, mockCourses[courseIndex]);
});

export default router;
