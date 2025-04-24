import React, { useEffect } from "react";
import { Card, Typography, Divider, Row, Col, App } from "antd";
import { useUser } from "../Components/UserContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Uprofile = () => {
  const { message, notification, modal } = App.useApp();

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.token) {
      navigate("/login"); // Redirect if no token (i.e., not logged in)
    }
  }, [user, navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3} style={{ textAlign: "center" }}>
        Profile Information
      </Title>

      <button
        onClick={() => {
          message.success("Good!");
        }}
      >
        Success
      </button>

      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={18} md={12} lg={8}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
            bodyStyle={{ padding: "20px" }}
          >
            <div>
              <Text strong>Name:</Text>
              <div style={{ fontSize: "16px", marginBottom: "10px" }}>
                {user?.user?.name || "N/A"}
              </div>
              <Divider />
              <Text strong>Email:</Text>
              <div style={{ fontSize: "16px", marginBottom: "10px" }}>
                {user?.user?.email || "N/A"}
              </div>
              <Divider />
              <Text strong>Role:</Text>
              <div style={{ fontSize: "16px", marginBottom: "10px" }}>
                {user?.user?.role || "N/A"}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Uprofile;
