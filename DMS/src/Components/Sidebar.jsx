import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  VideoCameraOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, Grid, Drawer } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "./UserContext";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const SidebarWithHoverExpand = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md; // Determines if the screen is mobile or not

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (user?.user?.role !== "admin") {
      navigate("/login"); // Redirect if not an admin
    }
  }, [user, navigate]);

  const menuItems = [
    {
      key: "/admin-dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/Files",
      icon: <VideoCameraOutlined />,
      label: "Files",
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Users",
    },
  ];

  const bottomMenuItems = [
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined rotate={180} />,
      label: "Logout",
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      localStorage.removeItem("userDetails");
      logout();
      navigate("/login");
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh", // Full height
            backgroundColor: "white",
            zIndex: 999,
            transition: "width 0.3s",
            width: collapsed ? 80 : 200,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex justify-center items-center p-3">Logo</div>
          <hr />
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ flex: 1 }} // Allow Menu to take up available space
          />
          {/* Bottom Menu for Profile/Logout */}
          <div className="absolute bottom-0 w-full">
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[location.pathname]}
              onClick={handleMenuClick}
              items={bottomMenuItems}
              style={{ width: "100%" }} // Ensures it takes full width
            />
          </div>
        </Sider>
      )}

      {/* Drawer for Mobile */}
      {/* Drawer for Mobile */}
      {isMobile && (
        <Drawer
          title="Menu"
          placement="left"
          closable
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={(e) => {
              handleMenuClick(e);
              setDrawerVisible(false); // close drawer on click
            }}
            items={menuItems}
          />
          <div className="absolute bottom-0 w-full">
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[location.pathname]}
              onClick={(e) => {
                handleMenuClick(e);
                setDrawerVisible(false);
              }}
              items={bottomMenuItems}
              style={{ marginTop: "auto" }}
            />
          </div>
        </Drawer>
      )}

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: !isMobile ? (collapsed ? 80 : 200) : 0,
          transition: "margin-left 0.3s",
        }}
      >
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: "fixed",
            width: "100%",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={
              isMobile ? (
                <MenuOutlined />
              ) : collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={() => {
              if (isMobile) setDrawerVisible(true); // open drawer on mobile
              else setCollapsed(!collapsed); // toggle sidebar on desktop
            }}
            style={{ fontSize: 16, width: 64, height: 64, marginLeft: "10px" }}
          />
        </Header>
        <Content
          style={{
            margin: "80px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SidebarWithHoverExpand;
