import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import RegisterUser from "./Adduser"; // Make sure this path is correct
import axios from "axios";

const { Title, Text } = Typography;

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const showModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/getusers");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/deleteuser/${userId}`);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      message.error("Failed to delete user");
      console.error(err);
    }
  };

  // const handleEdit = (user) => {
  //   setEditingUser(user);
  //   setIsModalOpen(true);
  // };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Users</Title>

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<UserAddOutlined />} onClick={showModal}>
          Add User
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {users.map((user, index) => (
          <Col key={index} xs={24} sm={12} md={10} lg={6}>
            <Card bordered hoverable>
              <Text strong>Name:</Text> <div>{user.name}</div>
              <Text strong>Email:</Text> <div>{user.email}</div>
              <Text strong>Role:</Text> <div>{user.role}</div>
              <Space style={{ marginTop: 10 }}>
                {/* <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </Button> */}
                <Popconfirm
                  title="Are you sure you want to delete this user?"
                  onConfirm={() => handleDelete(user._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} danger size="small">
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        title={editingUser ? "Edit User" : "Register New User"}
      >
        <RegisterUser
          onClose={() => {
            handleCancel();
            fetchUsers();
          }}
          update={fetchUsers}
          initialData={editingUser}
        />
      </Modal>
    </div>
  );
};

export default Users;
