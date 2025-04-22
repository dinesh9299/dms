import React, { useState } from "react";
import API from "../api";

const ModalUploadFile = ({ parentId, onClose }) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", file);
    formData.append("parentId", parentId || "");

    await API.post("/files/upload", formData);
    onClose();
  };

  return (
    <div className="modal">
      <h3>Upload File</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="File name"
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default ModalUploadFile;
