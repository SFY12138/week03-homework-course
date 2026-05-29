import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Input, Select, Modal, Form, message, Popconfirm, Checkbox, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Course {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  student_no: string;
  class_name: string;
  phone: string;
  email: string;
  course_ids: number[];
  status: 'active' | 'inactive';
}

const { Option } = Select;

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchText, setSearchText] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form] = Form.useForm();

  // 防抖搜索
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchText(value);
        }, 300);
      };
    })(),
    []
  );

  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students?keyword=${searchText}&className=${classFilter === 'all' ? '' : classFilter}&status=${statusFilter === 'all' ? '' : statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('获取学生失败');
      }
      const data = await response.json();
      setStudents(data.list);
    } catch (error) {
      message.error('获取学生失败');
      console.error('获取学生错误:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, classFilter, statusFilter]);

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('获取课程失败');
      }
      const data = await response.json();
      setCourses(data.list || []);
    } catch (error) {
      message.error('获取课程失败');
      console.error('获取课程错误:', error);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [fetchStudents, fetchCourses]);

  const handleAddStudent = useCallback(() => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleEditStudent = useCallback((student: Student) => {
    setEditingStudent(student);
    // 获取已选课程的名称
    const selectedCourses = courses
      .filter(course => student.course_ids.includes(course.id))
      .map(course => course.name);
    
    form.setFieldsValue({
      name: student.name,
      studentId: student.student_no,
      className: student.class_name,
      phone: student.phone,
      email: student.email,
      status: student.status,
      courses: selectedCourses
    });
    setModalVisible(true);
  }, [form, courses]);

  const handleSaveStudent = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      
      const method = editingStudent ? 'PUT' : 'POST';
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('保存学生失败');
      }

      message.success(editingStudent ? '编辑成功' : '新增成功');
      setModalVisible(false);
      fetchStudents();
    } catch (error) {
      message.error('保存学生失败');
      console.error('保存学生错误:', error);
    }
  }, [form, editingStudent, fetchStudents]);

  const handleDeleteStudent = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('删除学生失败');
      }

      message.success('删除成功');
      fetchStudents();
    } catch (error) {
      message.error('删除学生失败');
      console.error('删除学生错误:', error);
    }
  }, [fetchStudents]);

  // 使用 useMemo 缓存 columns
  const columns = useMemo(() => [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'student_no',
      key: 'student_no',
    },
    {
      title: '班级',
      dataIndex: 'class_name',
      key: 'class_name',
      render: (className: string) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{className}</span>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: any, record: Student) => (
        <div>
          <div>{record.phone}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: '已选课程',
      key: 'courses',
      render: (_: any, record: Student) => (
        <div>
          {courses
            .filter(course => record.course_ids.includes(course.id))
            .map((course, index) => (
              <div key={index} style={{ fontSize: '12px' }}>{course.name}</div>
            ))}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{
          color: status === 'active' ? '#52c41a' : '#faad14',
          fontWeight: 'bold'
        }}>
          {status === 'active' ? '活跃' : '非活跃'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <div>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditStudent(record)}
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个学生吗？"
            onConfirm={() => handleDeleteStudent(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ], [courses, handleEditStudent, handleDeleteStudent]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ textAlign: 'left', margin: 0 }}>学生管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStudent}>
          新增学生
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索姓名/学号"
          onChange={(e) => debouncedSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="全部班级"
          value={classFilter}
          onChange={setClassFilter}
          style={{ width: 150 }}
        >
          <Option value="all">全部班级</Option>
          <Option value="前端2401班">前端2401班</Option>
          <Option value="杭州2402班">杭州2402班</Option>
        </Select>
        <Select
          placeholder="全部状态"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="all">全部状态</Option>
          <Option value="active">活跃</Option>
          <Option value="inactive">非活跃</Option>
        </Select>
        <Button onClick={fetchStudents}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />

      <Modal
        title={editingStudent ? '编辑学生' : '新增学生'}
        open={modalVisible}
        onOk={handleSaveStudent}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="studentId"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" />
          </Form.Item>

          <Form.Item
            name="className"
            label="班级"
            rules={[{ required: true, message: '请选择班级' }]}
          >
            <Select>
              <Option value="前端2401班">前端2401班</Option>
              <Option value="杭州2402班">杭州2402班</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="courses"
            label="课程"
            rules={[{ required: true, message: '请选择课程' }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {courses.map(course => (
                  <Checkbox key={course.id} value={course.name}>
                    {course.name}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;