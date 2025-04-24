import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import SidebarWithTopNav from "./Components/Sidebar";

import Admindashboard from "./Components/Admindashboard";

import Filesfolder from "./Components/Filesfolder";
import FileManager from "./Components/FileManager";
import FileDetail from "./Components/FileDetail";
import Profile from "./Components/Profile";
import Users from "./pages/Users";
import Home from "./Userdashboard/Home";
import Userfilemanager from "./Userdashboard/Files";
import ProtectedRoute from "./protect/protectedroute";
import Userdashboard from "./Userdashboard/Userdashboard";
import Uprofile from "./Userdashboard/Userprofile";
import UserfileDetails from "./Userdashboard/File-details";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          >
            <Route path="" element={<Userdashboard />} />
            <Route path="/user-files" element={<Userfilemanager />} />
            <Route path="user-profile" element={<Uprofile />}></Route>
            <Route path="/details/:id" element={<UserfileDetails />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <SidebarWithTopNav />
              </ProtectedRoute>
            }
          >
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <Admindashboard />
                </ProtectedRoute>
              }
            />

            <Route path="files" element={<FileManager />}></Route>
            <Route path="file-detail/:id" element={<FileDetail />} />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="login" element={<Login />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
