import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import SidebarWithTopNav from "./Components/Sidebar";

import Admindashboard from "./Components/Admindashboard";

import Filesfolder from "./Components/Filesfolder";
import FileManager from "./Components/FileManager";
import FileDetail from "./Components/FileDetail";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<SidebarWithTopNav />}>
            <Route path="/admin-dashboard" element={<Admindashboard />} />
            <Route path="files" element={<FileManager />}></Route>
            <Route path="/file-detail/:id" element={<FileDetail />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
