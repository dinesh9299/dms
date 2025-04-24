import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Modal,
  message,
  Breadcrumb,
  Dropdown,
  Drawer,
} from "antd";
import {
  EditOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";

import ModalCreateFolder from "../Components/ModalCreateFolder";
import ModalUploadFile from "../Components/ModalUploadFile";

import folderIcon from "../images/folder1.png";
import fileIcon from "../images/image.png";
import pdfIcon from "../images/pdf.png";
import docicon from "../images/doc.png";
import excelicon from "../images/logo (1).png";
import unknownfile from "../images/unknown.png";

import { Input, InputGroup } from "rsuite";
import SearchIcon from "@rsuite/icons/Search";

const CustomInputGroup = ({ placeholder, onChange }) => (
  <InputGroup style={{ marginBottom: 10 }}>
    <Input placeholder={placeholder} onChange={(value) => onChange(value)} />
    <InputGroup.Addon>
      <SearchIcon />
    </InputGroup.Addon>
  </InputGroup>
);

const Userfilemanager = () => {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderStack, setFolderStack] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [searchParams] = useSearchParams();
  const folderIdFromUrl = searchParams.get("folderId");

  const navigate = useNavigate();

  const fetchFolderName = async (folderId) => {
    if (!folderId) return { _id: null, name: "Root", parentId: null };
    try {
      const { data } = await API.get("/files/detail", {
        params: { id: folderId },
      });

      return {
        ...data,
        parentId: data.parent, // 🔁 map it here
      };
    } catch {
      return { _id: folderId, name: "Unknown", parentId: null };
    }
  };

  const buildBreadcrumbStack = async (folderId) => {
    const stack = [];
    let currentId = folderId;
    while (currentId) {
      const folder = await fetchFolderName(currentId);
      stack.unshift(folder);
      console.log("Folder", folder);
      currentId = folder.parentId;
    }
    return stack;
  };

  const fetchFiles = async (folderId) => {
    try {
      const { data } = await API.get("/files", {
        params: { parentId: folderId },
      });
      setFiles(data);
    } catch {
      message.error("❌ Failed to fetch files");
    }
  };

  useEffect(() => {
    const init = async () => {
      const folderId = folderIdFromUrl || null;
      setCurrentFolder(folderId);
      fetchFiles(folderId);
      const breadcrumb = await buildBreadcrumbStack(folderId);
      setFolderStack(breadcrumb);
    };
    init();
  }, [folderIdFromUrl]);

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      navigate(`/user-files?folderId=${file._id}`);
    } else {
      navigate(`/details/${file._id}`, {
        state: { fromFolder: currentFolder },
      });
    }
  };

  const handleRename = async () => {
    try {
      await API.post("/files/rename", { id: renameTarget._id, newName });
      message.success("Renamed successfully");
      setRenameModalVisible(false);
      fetchFiles(currentFolder);
    } catch {
      message.error("Rename failed");
    }
  };

  const handleDownload = (file) => {
    const filename = `${file.name}.${file.filetype}`;
    const original = file.path.replace("http://127.0.0.1:5000/uploads/", "");
    const downloadUrl = `http://localhost:5000/api/files/download/${original}/${filename}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (file) => {
    const msg = `Check this out: ${file.name}\n${file.path}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleBulkDelete = async () => {
    try {
      await API.post("/files/delete-multiple", { ids: selectedFiles });
      message.success("Files deleted successfully");
      setSelectedFiles([]);
      fetchFiles(currentFolder);
    } catch {
      message.error("Failed to delete selected files");
    }
  };

  const goToBreadcrumb = (index) => {
    const target = folderStack[index];
    navigate(`/user-files?folderId=${target._id || ""}`);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbItems = [
    {
      title: (
        <span
          className="cursor-pointer"
          onClick={() => navigate("/user-files")}
        >
          Filemanager
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
      <div className="my-4 lg:flex gap-5 justify-between">
        <div className="font-semibold text-xl">Manage Files</div>
        {/* <Space>
          <Button type="primary" onClick={() => setShowFolderModal(true)}>
            Create Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>Upload File</Button>
          {folderStack.length > 0 && (
            <Button onClick={() => navigate(-1)}>⬅️ Back</Button>
          )}
        </Space> */}
      </div>

      <div className="lg:flex justify-between items-center mb-4">
        <div className="lg:w-1/3">
          <CustomInputGroup
            placeholder="Search files"
            onChange={(value) => setSearchQuery(value)}
          />
        </div>
        {selectedFiles.length > 0 && (
          <Button danger onClick={handleBulkDelete}>
            🗑️ Delete Selected ({selectedFiles.length})
          </Button>
        )}
      </div>

      <Breadcrumb
        className="mb-4 font-semibold text-sm"
        items={breadcrumbItems}
      />

      <div className="grid grid-cols-2 mt-5 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file._id}
            className={`relative p-4 shadow-sm bg-white hover:shadow-md rounded-lg group ${
              selectedFiles.includes(file._id) ? "border-blue-500" : ""
            }`}
          >
            {/* <input
              type="checkbox"
              className="absolute w-4 h-4 top-2 left-2 z-10"
              checked={selectedFiles.includes(file._id)}
              onChange={() => {
                setSelectedFiles((prev) =>
                  prev.includes(file._id)
                    ? prev.filter((id) => id !== file._id)
                    : [...prev, file._id]
                );
              }}
            /> */}
            {/* <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "rename",
                    label: "Rename",
                    icon: <EditOutlined />,
                    onClick: () => {
                      setRenameTarget(file);
                      setNewName(file.name);
                      setRenameModalVisible(true);
                    },
                  },
                  ...(file.type === "file"
                    ? [
                        {
                          key: "share",
                          label: "Share",
                          icon: <ShareAltOutlined />,
                          onClick: () => handleShare(file),
                        },
                      ]
                    : []),
                  {
                    key: "download",
                    label: "Download",
                    icon: <DownloadOutlined />,
                    onClick: () => handleDownload(file),
                  },
                ],
              }}
              placement="bottomRight"
            >
              <MoreOutlined className="absolute top-2 right-2 text-xl cursor-pointer z-10" />
            </Dropdown> */}
            <div
              onClick={() => handleFileClick(file)}
              className="flex flex-col items-center"
            >
              <img
                src={
                  file.type === "folder"
                    ? folderIcon
                    : ["jpg", "jpeg", "png", "gif", "webp"].includes(
                        file.filetype?.toLowerCase()
                      )
                    ? fileIcon
                    : file.filetype?.toLowerCase() === "pdf"
                    ? pdfIcon
                    : ["doc", "docx", "rtf", "odt"].includes(
                        file.filetype?.toLowerCase()
                      )
                    ? docicon
                    : ["xls", "xlsx", "csv"].includes(
                        file.filetype?.toLowerCase()
                      )
                    ? excelicon
                    : unknownfile
                }
                alt="file"
                className="w-14 h-14 mb-2"
              />
              <div className=" flex justify-center items-center text-sm text-center truncate w-full">
                <div>{file.name}</div>
                <div>{file.type === "file" && <div>.{file.filetype}</div>}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <Drawer
        title="Create New Folder"
        placement="right"
        onClose={() => setShowFolderModal(false)}
        open={showFolderModal}
        destroyOnClose
        width={400}
      >
        <ModalCreateFolder
          parentId={currentFolder}
          onClose={() => {
            setShowFolderModal(false);
            fetchFiles(currentFolder);
          }}
        />
      </Drawer>

      <Drawer
        title="Upload File"
        placement="right"
        onClose={() => setShowUploadModal(false)}
        open={showUploadModal}
        destroyOnClose
        width={400}
      >
        <ModalUploadFile
          parentId={currentFolder}
          onClose={() => {
            setShowUploadModal(false);
            fetchFiles(currentFolder);
          }}
        />
      </Drawer>

      <Modal
        open={renameModalVisible}
        onCancel={() => setRenameModalVisible(false)}
        onOk={handleRename}
        okText="Rename"
        title={`Rename ${renameTarget?.type}`}
      >
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default Userfilemanager;
