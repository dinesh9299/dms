import React from "react";
import { FileOutlined, FolderOpenOutlined } from "@ant-design/icons";

const FileItem = ({ file, onClick }) => {
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.name);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer border rounded p-4 flex flex-col items-center text-center hover:shadow-lg transition"
    >
      {file.type === "folder" ? (
        <FolderOpenOutlined style={{ fontSize: "28px" }} />
      ) : isImage ? (
        <img
          src={file.path}
          alt={file.name}
          className="w-20 h-20 object-cover"
        />
      ) : (
        <FileOutlined style={{ fontSize: "28px" }} />
      )}
      <p className="mt-2 text-sm truncate w-full">{file.name}</p>
    </div>
  );
};

export default FileItem;
