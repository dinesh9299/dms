import React, { useState, useEffect, useRef } from 'react';
import { Sidenav, Nav, Button } from 'rsuite';
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';

import MenuIcon from '@rsuite/icons/Menu';
import { AddOutline } from '@rsuite/icons';
// import trinaiiamge from '../assets/Images/trinai-02.png';

import 'rsuite/dist/rsuite.min.css';
import { useNavigate, Outlet } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';

const SidebarWithTopNav = () => {
  const [expanded, setExpanded] = useState(true);
  const [activeKey, setActiveKey] = useState('1');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Toggle functions
  const handleSidebarToggle = () => setExpanded(prev => !prev);
  const handleCloseSidebar = () => setExpanded(false);
  const handleOpenSidebar = () => setExpanded(true);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setExpanded(!mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {/* Top Navbar */}
      <div
        style={{
          height: 60,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: expanded && !isMobile ? 250 : 70,
          paddingRight: 20,
          transition: 'padding-left 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999
        }}
      >
        <Button
          appearance="primary"
          size="sm"
          style={{
            marginRight: 15,
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onClick={handleSidebarToggle}
        >
          <MenuIcon />
        </Button>
        {/* <img src={trinaiiamge} alt="Logo" className=" ml-72 w-32 sm:w-40 md:w-48 lg:w-56   xl:w-64 mx-auto" /> */}

      </div>

      {/* Sidebar */}
      {expanded && (
        <Sidenav
          expanded={expanded}
          appearance="subtle"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: 240,
            paddingTop: 60,
            background: '#fff',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
            zIndex: 998,
            transition: 'width 0.3s ease'
          }}
        >
          <Sidenav.Body>
            <Nav activeKey={activeKey} onSelect={setActiveKey}>
              <Nav.Item
                eventKey="1"
                icon={<DashboardIcon />}
                onClick={() => navigate('/admin-dashboard')}
              >
                Dashboard
              </Nav.Item>

              <Nav.Item
                eventKey="1"
                icon={<DashboardIcon />}
                onClick={() => navigate('/Files')}
              >
                Files
              </Nav.Item>




              {/* <Nav.Item
                eventKey="2"
                icon={<GroupIcon />}
                onClick={() => navigate('/user-group')}
              >
                Catageory
              </Nav.Item> */}

              {/* <Nav.Menu eventKey="3" title="Addmaterials" icon={<MagicIcon />}>
                <Nav.Item eventKey="3-1">Geo</Nav.Item>
                <Nav.Item eventKey="3-2">Devices</Nav.Item>
                <Nav.Item eventKey="3-3">Loyalty</Nav.Item>
                <Nav.Item eventKey="3-4">Visit Depth</Nav.Item>
              </Nav.Menu> */}

{/* <Nav.Item
                eventKey="4"
                icon={<AddOutline/>}
                onClick={() => navigate('/addproducts')}
              >
                Add Products
              </Nav.Item> */}


            </Nav>
          </Sidenav.Body>
        </Sidenav>
      )}

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: expanded && !isMobile ? 240 : 0,
          marginTop: 60,
          padding: 20,
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarWithTopNav;
