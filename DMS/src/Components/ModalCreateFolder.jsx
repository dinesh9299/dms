import React, { useState } from "react";
import API from "../api";

const ModalCreateFolder = ({ parentId, onClose }) => {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    await API.post("/files/folder", { name, parentId });
    onClose();
  };

  return (
    <div className="modal">
      <h3>Create Folder</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Folder name"
      />
      <button onClick={handleCreate}>Create</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default ModalCreateFolder;
