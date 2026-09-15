import Router from '@koa/router';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { success, fail } from '../utils/response.js';
import { mockCourses } from './courses.js';

// 直接使用模拟数据
export const mockStudents = [
  { id: 1, name: '张三', student_no: '2024001', class_name: '前端2401班', phone: '13800138001', email: 'zhangsan@example.com', status: 'active', course_ids: '[1, 2]', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, name: '李四', student_no: '2024002', class_name: '前端2401班', phone: '13800138002', email: 'lisi@example.com', status: 'active', course_ids: '[1]', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, name: '王五', student_no: '2024003', class_name: '杭州2402班', phone: '13800138003', email: 'wangwu@example.com', status: 'inactive', course_ids: '[2, 3]', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 4, name: '赵六', student_no: '2024004', class_name: '后端2401班', phone: '13800138004', email: 'zhaoliu@example.com', status: 'active', course_ids: '[2, 4]', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 5, name: '钱七', student_no: '2024005', class_name: '前端2401班', phone: '13800138005', email: 'qianqi@example.com', status: 'active', course_ids: '[1, 5]', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const router = new Router();

router.get('/', authenticateToken, async (ctx) => {
  const { keyword = '', className = '', status = '', courseId = '', page = 1, pageSize = 10 } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  // 过滤数据
  let filteredStudents = mockStudents;
  
  if (keyword) {
    filteredStudents = filteredStudents.filter(student => 
      student.name.includes(keyword) || student.student_no.includes(keyword)
    );
  }
  
  if (className) {
    filteredStudents = filteredStudents.filter(student => student.class_name === className);
  }
  
  if (status) {
    filteredStudents = filteredStudents.filter(student => student.status === status);
  }
  
  if (courseId) {
    filteredStudents = filteredStudents.filter(student => {
      const ids = JSON.parse(student.course_ids || '[]');
      return ids.includes(Number(courseId));
    });
  }

  // 排序数据
  filteredStudents.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const total = filteredStudents.length;
  const list = filteredStudents.slice(offset, offset + Number(pageSize)).map(s => ({
    ...s,
    course_ids: JSON.parse(s.course_ids || '[]'),
  }));

  success(ctx, { list, total, page: Number(page), pageSize: Number(pageSize) });
});

router.get('/classes', authenticateToken, async (ctx) => {
  const classes = [...new Set(mockStudents.map(student => student.class_name))]
    .filter(className => className !== '')
    .sort();
  success(ctx, classes);
});

router.get('/:id', authenticateToken, async (ctx) => {
  const student = mockStudents.find(s => s.id === Number(ctx.params.id));
  if (!student) {
    return fail(ctx, 404, '学生不存在');
  }
  const courseIds = JSON.parse(student.course_ids || '[]');
  
  // 从模拟课程数据中获取已选课程
  const enrolledCourses = mockCourses.filter(c => courseIds.includes(c.id))
    .map(c => ({ id: c.id, name: c.name }));

  success(ctx, { ...student, course_ids: courseIds, enrolledCourses });
});

// 实现创建学生接口 POST /
router.post('/', authenticateToken, async (ctx) => {
  const { name, studentId, className, phone, email, status, courses } = ctx.request.body;

  if (!name || !studentId || !className) {
    return fail(ctx, 400, '姓名、学号、班级不能为空');
  }

  // 检查学号唯一性
  const existing = mockStudents.find(s => s.student_no === studentId);
  if (existing) {
    return fail(ctx, 400, '学号已存在');
  }

  // 获取课程ID
  const courseIds = mockCourses
    .filter(course => courses.includes(course.name))
    .map(course => course.id);

  const newStudent = {
    id: mockStudents.length > 0 ? Math.max(...mockStudents.map(s => s.id)) + 1 : 1,
    name: name || '',
    student_no: studentId || '',
    class_name: className || '',
    phone: phone || '',
    email: email || '',
    status: status || 'active',
    course_ids: JSON.stringify(courseIds),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockStudents.push(newStudent);
  
  // 更新课程选课计数
  updateCourseCounts();
  
  ctx.status = 201;
  success(ctx, { ...newStudent, course_ids: courseIds });
});

// 实现更新学生接口 PUT /:id
router.put('/:id', authenticateToken, async (ctx) => {
  const studentIndex = mockStudents.findIndex(s => s.id === Number(ctx.params.id));
  if (studentIndex === -1) {
    return fail(ctx, 404, '学生不存在');
  }

  const { name, studentId, className, phone, email, status, courses } = ctx.request.body;

  if (!name || !studentId || !className) {
    return fail(ctx, 400, '姓名、学号、班级不能为空');
  }

  // 检查学号唯一性（排除当前学生）
  const duplicate = mockStudents.find(s => s.student_no === studentId && s.id !== Number(ctx.params.id));
  if (duplicate) {
    return fail(ctx, 400, '学号已存在');
  }

  // 获取课程ID
  const courseIds = mockCourses
    .filter(course => courses.includes(course.name))
    .map(course => course.id);

  mockStudents[studentIndex] = {
    ...mockStudents[studentIndex],
    name: name ?? mockStudents[studentIndex].name,
    student_no: studentId ?? mockStudents[studentIndex].student_no,
    class_name: className ?? mockStudents[studentIndex].class_name,
    phone: phone ?? mockStudents[studentIndex].phone,
    email: email ?? mockStudents[studentIndex].email,
    status: status ?? mockStudents[studentIndex].status,
    course_ids: JSON.stringify(courseIds),
    updated_at: new Date().toISOString()
  };
  
  // 更新课程选课计数
  updateCourseCounts();
  
  success(ctx, { ...mockStudents[studentIndex], course_ids: courseIds });
});

// 实现删除学生接口 DELETE /:id
router.delete('/:id', authenticateToken, async (ctx) => {
  const studentIndex = mockStudents.findIndex(s => s.id === Number(ctx.params.id));
  if (studentIndex === -1) {
    return fail(ctx, 404, '学生不存在');
  }

  mockStudents.splice(studentIndex, 1);
  
  // 更新课程选课计数
  updateCourseCounts();
  
  success(ctx, null, '删除成功');
});

function updateCourseCounts() {
  // 遍历模拟课程数据，更新选课计数
  for (const course of mockCourses) {
    const count = mockStudents.filter(s => {
      const ids = JSON.parse(s.course_ids || '[]');
      return ids.includes(course.id);
    }).length;
    course.student_count = count;
  }
}

export default router;
