// 内存数据库模拟层，避免 SQLite 编译问题

// 模拟数据
const mockData = {
  users: [
    {
      id: 1,
      username: 'admin',
      password: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // admin123
      name: '管理员',
      role: 'admin',
      avatar: '',
      created_at: new Date().toISOString()
    }
  ],
  courses: [
    {
      id: 1,
      name: 'React 基础',
      description: 'React 入门课程',
      instructor: '张老师',
      category: '前端开发',
      lesson_count: 12,
      student_count: 35,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Node.js 实战',
      description: 'Node.js 后端开发',
      instructor: '李老师',
      category: '后端开发',
      lesson_count: 15,
      student_count: 28,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: '数据库原理',
      description: '数据库基础知识',
      instructor: '王老师',
      category: '数据库',
      lesson_count: 10,
      student_count: 22,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Vue 3 入门',
      description: 'Vue 3 基础课程',
      instructor: '张老师',
      category: '前端开发',
      lesson_count: 10,
      student_count: 30,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Python 编程',
      description: 'Python 基础到进阶',
      instructor: '刘老师',
      category: '编程语言',
      lesson_count: 18,
      student_count: 45,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  students: [
    {
      id: 1,
      name: '张三',
      student_no: '2024001',
      class_name: '前端2401班',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      status: 'active',
      course_ids: '[1, 2]',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: '李四',
      student_no: '2024002',
      class_name: '前端2401班',
      phone: '13800138002',
      email: 'lisi@example.com',
      status: 'active',
      course_ids: '[1]',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: '王五',
      student_no: '2024003',
      class_name: '杭州2402班',
      phone: '13800138003',
      email: 'wangwu@example.com',
      status: 'inactive',
      course_ids: '[2, 3]',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: '赵六',
      student_no: '2024004',
      class_name: '后端2401班',
      phone: '13800138004',
      email: 'zhaoliu@example.com',
      status: 'active',
      course_ids: '[2, 4]',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: '钱七',
      student_no: '2024005',
      class_name: '前端2401班',
      phone: '13800138005',
      email: 'qianqi@example.com',
      status: 'active',
      course_ids: '[1, 5]',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// 模拟数据库操作
const db = {
  exec: () => {
    // 模拟执行 SQL 语句，实际上我们已经在 mockData 中定义了数据
    console.log('Database initialized');
  },
  prepare: (sql) => {
    return {
      get: (...params) => {
        // 简单的 SQL 解析和模拟
        if (sql.includes('SELECT COUNT(*) as count FROM users')) {
          return { count: mockData.users.length };
        }
        if (sql.includes('SELECT * FROM users WHERE username = ?')) {
          const username = params[0];
          return mockData.users.find(user => user.username === username);
        }
        if (sql.includes('SELECT * FROM courses WHERE id = ?')) {
          const id = parseInt(params[0]);
          return mockData.courses.find(course => course.id === id);
        }
        if (sql.includes('SELECT * FROM students WHERE id = ?')) {
          const id = parseInt(params[0]);
          return mockData.students.find(student => student.id === id);
        }
        if (sql.includes('SELECT * FROM students WHERE student_no = ?')) {
          const studentNo = params[0];
          return mockData.students.find(student => student.student_no === studentNo);
        }
        if (sql.includes('SELECT * FROM students WHERE student_no = ? AND id != ?')) {
          const studentNo = params[0];
          const id = parseInt(params[1]);
          return mockData.students.find(student => student.student_no === studentNo && student.id !== id);
        }
        return null;
      },
      all: (...params) => {
        // 简单的 SQL 解析和模拟
        if (sql.includes('SELECT * FROM courses')) {
          return mockData.courses;
        }
        if (sql.includes('SELECT * FROM students')) {
          return mockData.students;
        }
        if (sql.includes('SELECT DISTINCT category FROM courses')) {
          const categories = [...new Set(mockData.courses.map(course => course.category))];
          return categories.map(category => ({ category }));
        }
        if (sql.includes('SELECT DISTINCT class_name FROM students')) {
          const classes = [...new Set(mockData.students.map(student => student.class_name))];
          return classes.map(class_name => ({ class_name }));
        }
        return [];
      },
      run: (...params) => {
        // 简单的 SQL 解析和模拟
        if (sql.includes('INSERT INTO courses')) {
          const newCourse = {
            id: mockData.courses.length + 1,
            name: params[0],
            description: params[1],
            instructor: params[2],
            category: params[3],
            status: params[4],
            lesson_count: params[5],
            student_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          mockData.courses.push(newCourse);
          return { lastInsertRowid: newCourse.id };
        }
        if (sql.includes('INSERT INTO students')) {
          const newStudent = {
            id: mockData.students.length + 1,
            name: params[0],
            student_no: params[1],
            class_name: params[2],
            phone: params[3],
            email: params[4],
            status: params[5],
            course_ids: params[6],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          mockData.students.push(newStudent);
          return { lastInsertRowid: newStudent.id };
        }
        if (sql.includes('UPDATE courses SET')) {
          const id = parseInt(params[params.length - 1]);
          const course = mockData.courses.find(c => c.id === id);
          if (course) {
            course.name = params[0] || course.name;
            course.description = params[1] || course.description;
            course.instructor = params[2] || course.instructor;
            course.category = params[3] || course.category;
            course.status = params[4] || course.status;
            course.lesson_count = params[5] || course.lesson_count;
            course.updated_at = new Date().toISOString();
          }
        }
        if (sql.includes('UPDATE students SET')) {
          const id = parseInt(params[params.length - 1]);
          const student = mockData.students.find(s => s.id === id);
          if (student) {
            student.name = params[0] || student.name;
            student.student_no = params[1] || student.student_no;
            student.class_name = params[2] || student.class_name;
            student.phone = params[3] || student.phone;
            student.email = params[4] || student.email;
            student.status = params[5] || student.status;
            student.course_ids = params[6] || student.course_ids;
            student.updated_at = new Date().toISOString();
          }
        }
        if (sql.includes('DELETE FROM courses WHERE id = ?')) {
          const id = parseInt(params[0]);
          mockData.courses = mockData.courses.filter(course => course.id !== id);
        }
        if (sql.includes('DELETE FROM students WHERE id = ?')) {
          const id = parseInt(params[0]);
          mockData.students = mockData.students.filter(student => student.id !== id);
        }
        return { lastInsertRowid: null };
      }
    };
  },
  pragma: () => {}
};

export default db;
