import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Input, Select, Modal, Form, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface Course {
  id: number;
  name: string;
  description: string;
  instructor: string;
  category: string;
  lesson_count: number;
  student_count: number;
  status: 'published' | 'draft';
}

const { Option } = Select;

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses?keyword=${searchText}&status=${statusFilter === 'all' ? '' : statusFilter}&category=${categoryFilter === 'all' ? '' : categoryFilter}&sortField=${sortField}&sortOrder=${sortOrder}&page=${currentPage}&pageSize=${pageSize}`, {
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
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter, categoryFilter, sortField, sortOrder, currentPage, pageSize]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourse = useCallback(() => {
    setEditingCourse(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleEditCourse = useCallback((course: Course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      name: course.name,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      lesson_count: course.lesson_count,
      status: course.status
    });
    setModalVisible(true);
  }, [form]);

  const handleSaveCourse = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      
      const method = editingCourse ? 'PUT' : 'POST';
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('保存课程失败');
      }

      message.success(editingCourse ? '编辑成功' : '新增成功');
      setModalVisible(false);
      fetchCourses();
    } catch (error) {
      message.error('保存课程失败');
      console.error('保存课程错误:', error);
    }
  }, [form, editingCourse, fetchCourses]);

  const handleDeleteCourse = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('删除课程失败');
      }

      message.success('删除成功');
      fetchCourses();
    } catch (error) {
      message.error('删除课程失败');
      console.error('删除课程错误:', error);
    }
  }, [fetchCourses]);

  const handleToggleStatus = useCallback(async (course: Course) => {
    try {
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${course.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('更新状态失败');
      }

      message.success('状态更新成功');
      fetchCourses();
    } catch (error) {
      message.error('更新状态失败');
      console.error('更新状态错误:', error);
    }
  }, [fetchCourses]);

  const handleTableChange = useCallback((pagination: any, _filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSortField(sorter.field || '');
    setSortOrder(sorter.order || null);
  }, []);

  // 使用 useMemo 缓存 columns
  const columns = useMemo(() => [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Course) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '讲师',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '课时',
      dataIndex: 'lesson_count',
      key: 'lesson_count',
    },
    {
      title: '选课人数',
      dataIndex: 'student_count',
      key: 'student_count',
      sorter: true,
      sortOrder: sortField === 'student_count' ? sortOrder : null,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'default'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Course) => (
        <div>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditCourse(record)}
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          <Button
            type="text"
            onClick={() => handleToggleStatus(record)}
            style={{
              color: record.status === 'published' ? '#faad14' : '#52c41a',
              marginRight: 8
            }}
          >
            {record.status === 'published' ? '下架' : '发布'}
          </Button>
          <Popconfirm
            title="确定要删除这个课程吗？"
            onConfirm={() => handleDeleteCourse(record.id)}
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
  ], [handleEditCourse, handleToggleStatus, handleDeleteCourse, sortField, sortOrder]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ textAlign: 'left', margin: 0 }}>课程管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCourse}>
          新增课程
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索课程名/讲师"
          onChange={(e) => debouncedSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="全部状态"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="all">全部状态</Option>
          <Option value="published">已发布</Option>
          <Option value="draft">草稿</Option>
        </Select>
        <Select
          placeholder="全部分类"
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 150 }}
        >
          <Option value="all">全部分类</Option>
          <Option value="前端开发">前端开发</Option>
          <Option value="后端开发">后端开发</Option>
          <Option value="运维">运维</Option>
          <Option value="数据库">数据库</Option>
        </Select>
        <Button onClick={fetchCourses}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          total: courses.length,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingCourse ? '编辑课程' : '新增课程'}
        open={modalVisible}
        onOk={handleSaveCourse}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名称' }]}
          >
            <Input placeholder="请输入课程名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="课程描述"
            rules={[{ required: true, message: '请输入课程描述' }]}
          >
            <Input.TextArea placeholder="请输入课程描述" rows={4} />
          </Form.Item>

          <Form.Item
            name="instructor"
            label="讲师"
            rules={[{ required: true, message: '请输入讲师' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择">
              <Option value="前端开发">前端开发</Option>
              <Option value="后端开发">后端开发</Option>
              <Option value="运维">运维</Option>
              <Option value="数据库">数据库</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="lesson_count"
            label="课时数"
            rules={[{ required: true, message: '请输入课时数' }]}
          >
            <Input type="number" placeholder="0" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;