import React, { useState, useEffect } from "react";
import { Button, Space, Modal, message, Breadcrumb } from "antd";
import API from "../api";
import FileItem from "./FileItem";
import ModalCreateFolder from "./ModalCreateFolder";
import ModalUploadFile from "./ModalUploadFile";

const FileManager = ({ parentId = null }) => {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(parentId);
  const [folderStack, setFolderStack] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchFiles = async () => {
    try {
      const { data } = await API.get("/files", {
        params: { parentId: currentFolder },
      });
      setFiles(data);
    } catch (err) {
      message.error("❌ Failed to fetch files");
    }
  };

  const fetchFolderName = async (folderId) => {
    if (!folderId) return { _id: null, name: "Root" };
    try {
      const { data } = await API.get("/files/detail", {
        params: { id: folderId },
      });
      return data;
    } catch {
      return { _id: folderId, name: "Unknown" };
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  const openFolder = async (folderId) => {
    const folderData = await fetchFolderName(folderId);
    setFolderStack((prev) => [...prev, folderData]);
    setCurrentFolder(folderId);
  };

  const goToBreadcrumb = (index) => {
    const selected = folderStack[index];
    setCurrentFolder(selected._id);
    setFolderStack(folderStack.slice(0, index + 1));
  };

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      openFolder(file._id);
    } else {
      window.open(file.path, "_blank");
    }
  };

  const breadcrumbItems = [
    {
      title: (
        <span
          className="cursor-pointer"
          onClick={() => {
            setCurrentFolder(null);
            setFolderStack([]);
          }}
        >
          Root
        </span>
      ),
    },
    ...folderStack.map((folder, idx) => ({
      title: (
        <span className="cursor-pointer" onClick={() => goToBreadcrumb(idx)}>
          {folder.name}
        </span>
      ),
    })),
  ];

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-5xl mx-auto">
      <Breadcrumb className="mb-4 text-sm" items={breadcrumbItems} />

      <div className="flex justify-between mb-4">
        <Space>
          <Button type="primary" onClick={() => setShowFolderModal(true)}>
            Create Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>Upload File</Button>
          {folderStack.length > 0 && (
            <Button onClick={() => goToBreadcrumb(folderStack.length - 1)}>
              ⬅️ Back
            </Button>
          )}
        </Space>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <FileItem
            key={file._id}
            file={file}
            onClick={() => handleFileClick(file)}
          />
        ))}
      </div>

      <Modal
        open={showFolderModal}
        onCancel={() => setShowFolderModal(false)}
        footer={null}
        destroyOnClose
      >
        <ModalCreateFolder
          parentId={currentFolder}
          onClose={() => {
            setShowFolderModal(false);
            fetchFiles();
          }}
        />
      </Modal>

      <Modal
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        footer={null}
        destroyOnClose
      >
        <ModalUploadFile
          parentId={currentFolder}
          onClose={() => {
            setShowUploadModal(false);
            fetchFiles();
          }}
        />
      </Modal>
    </div>
  );
};

export default FileManager;
