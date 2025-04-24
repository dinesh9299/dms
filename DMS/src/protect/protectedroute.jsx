import { Navigate } from "react-router-dom";
import { useUser } from "../Components/UserContext";
import { Spin } from "antd";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    ); // or a fancy spinner

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
