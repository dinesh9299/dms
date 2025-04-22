import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Form, Button, Schema, Panel, Message } from "rsuite";
import "react-toastify/dist/ReactToastify.css";
import "rsuite/dist/rsuite.min.css";

const { StringType } = Schema.Types;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { role } = useParams(); // 'admin' or 'user'

  // RSuite Schema Model for Validation
  const model = Schema.Model({
    email: StringType()
      .isEmail("Please enter a valid email address.")
      .isRequired("Email is required."),
    password: StringType()
      .isRequired("Password is required.")
      .minLength(6, "Password must be at least 6 characters.")
      .maxLength(20, "Password must not exceed 20 characters."),
  });

  const handleLogin = async () => {
    const loginURL = "http://localhost:5000/api/login";

    setLoading(true);
    try {
      const res = await axios.post(loginURL, formData);

      toast.success(`${role} login successful! Redirecting...`, {
        position: "top-right",
        autoClose: 2000,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      setTimeout(() => {
        if (res.data.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl">
        {/* Image Section */}
        {/* <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={trinaiiamge}
            alt="Login"
            className="w-full max-w-xs md:max-w-sm lg:max-w-md object-contain"
          />
        </div> */}

        {/* Form Section */}
        <div className="w-full md:w-1/2">
          <Panel
            header={
              <span className="text-center font-semibold text-lg block">
                {role === "admin" ? "Admin" : "User"} Login
              </span>
            }
            bordered
            className="bg-white rounded-lg shadow-md p-4 w-full"
          >
            <Form
              fluid
              model={model}
              formValue={formData}
              onChange={setFormData}
              onCheck={setFormError}
              onSubmit={handleLogin}
              checkTrigger="blur"
            >
              <Form.Group controlId="email">
                <Form.ControlLabel>Email</Form.ControlLabel>
                <Form.Control name="email" type="email" />
                {formError.email && (
                  <Message
                    showIcon
                    type="error"
                    description={formError.email}
                  />
                )}
              </Form.Group>

              <Form.Group controlId="password">
                <Form.ControlLabel>Password</Form.ControlLabel>
                <Form.Control name="password" type="password" />
                {formError.password && (
                  <Message
                    showIcon
                    type="error"
                    description={formError.password}
                  />
                )}
              </Form.Group>

              <Form.Group>
                <Button
                  appearance="primary"
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  Login
                </Button>
              </Form.Group>
            </Form>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Login;
