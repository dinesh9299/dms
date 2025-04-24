// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CustomProvider } from "rsuite";
import "rsuite/dist/rsuite.min.css"; // RSuite CSS
import { Toaster } from "react-hot-toast";
import "./index.css"; // ⬅️ This is required
import { UserProvider } from "./Components/UserContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CustomProvider theme="light">
      <UserProvider>
        <App />
      </UserProvider>
      <Toaster position="top-center" />
    </CustomProvider>
  </React.StrictMode>
);
