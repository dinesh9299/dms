import React, { useState } from "react";
import { Form, Input, Modal, message } from "antd";
import API from "../api";

const ModalCreateFolder = ({ parentId, onClose, success }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const warning = () => {
    messageApi.open({
      type: "warning",
      content: "Please enter a folder name",
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      warning();
      return;
    }

    setLoading(true);
    try {
      await API.post("/files/folder", { name, parentId });
      message.success("Folder created successfully");
      onClose();
      success();
    } catch (error) {
      alert("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
      <Form layout="vertical">
        <Form.Item label="Folder Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name"
          />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ModalCreateFolder;
