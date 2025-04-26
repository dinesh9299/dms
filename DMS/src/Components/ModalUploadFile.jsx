import React, { useState } from "react";
import { Button, Input, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import API from "../api";

const { Dragger } = Upload;

const ModalUploadFile = ({ parentId, onClose, success, parentpath }) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [ext, setExt] = useState("");
  const [size, setSize] = useState("");
  const [loader, setLoader] = useState(false);

  const handleUpload = async () => {
    setLoader(true);
    if (!file) {
      message.warning("Please select a file first.");
      setLoader(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name || file.name);
    formData.append("file", file);
    formData.append("parentId", parentId || "");
    formData.append("filetype", ext);
    formData.append("size", size);
    formData.append("createdtime", new Date().toISOString());
    formData.append("parentpath", parentpath);

    try {
      const respnse = await API.post("/files/upload", formData);

      if (respnse.data.success) {
        onClose();
      } else {
        alert("file already exist");
      }
      message.success("✅ File uploaded successfully");
      success();

      setLoader(false);
    } catch (error) {
      message.error("❌ Upload failed");
    }
  };

  const props = {
    name: "file",
    multiple: false,
    beforeUpload: (file) => {
      setFile(file);
      const extension = file.name.split(".").pop();

      const nameWithoutExtension = file.name.substring(
        0,
        file.name.lastIndexOf(".")
      );

      setExt(extension);
      setSize(file.size);
      setName(nameWithoutExtension);
      return false; // prevent auto upload
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Upload File</h3>
      <div className=" flex flex-col gap-5 mt-4">
        <Dragger {...props} className="mb-4" maxCount={1}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Only one file can be uploaded at a time
          </p>
        </Dragger>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="File name"
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={!file || loader}
          >
            upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalUploadFile;
