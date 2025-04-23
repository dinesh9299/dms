import React, { useState, useEffect } from "react";
import { Button, Space, Modal, message, Breadcrumb, Dropdown } from "antd";
import {
  EditOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";

import ModalCreateFolder from "./ModalCreateFolder";
import ModalUploadFile from "./ModalUploadFile";

import folderIcon from "../images/folder1.png";
import fileIcon from "../images/image.png";
import pdfIcon from "../images/pdf.png";
import docicon from "../images/doc.png";
import excelicon from "../images/logo (1).png";
import unknownfile from "../images/unknown.png";
import { Input, InputGroup } from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import { Drawer } from "antd";
import { IoIosArrowRoundBack } from "react-icons/io";

const styles = { marginBottom: 10 };

const CustomInputGroup = ({ placeholder, onChange }) => (
  <InputGroup style={styles}>
    <Input
      className=" h-10"
      placeholder={placeholder}
      onChange={(value) => onChange(value)}
    />
    <InputGroup.Addon>
      <SearchIcon />
    </InputGroup.Addon>
  </InputGroup>
);

const FileManager = ({ parentId = null }) => {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(parentId);
  const [folderStack, setFolderStack] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mouseentered, setMouseentered] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchFiles = async (folderId = currentFolder) => {
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
      if (location.state?.returnToFolder !== undefined) {
        const returnTo = location.state.returnToFolder;
        const stack = location.state.returnStack || [];
        setCurrentFolder(returnTo);
        setFolderStack(stack);
        setTimeout(() => fetchFiles(returnTo), 0);
      } else {
        fetchFiles();
      }
    };
    init();
  }, []);

  useEffect(() => {
    // Clear selected files on folder change
    setSelectedFiles([]);
  }, [currentFolder]);

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
    const init = async () => {
      if (location.state?.returnToFolder !== undefined) {
        const returnTo = location.state.returnToFolder;
        const stack = location.state.returnStack || [];
        setCurrentFolder(returnTo);
        setFolderStack(stack);
        setTimeout(() => fetchFiles(returnTo), 0);
      } else {
        fetchFiles();
      }
    };
    init();
  }, []);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openFolder = async (folderId) => {
    if (currentFolder === folderId) return;
    const folderData = await fetchFolderName(folderId);
    setFolderStack((prev) =>
      prev.find((f) => f._id === folderId) ? prev : [...prev, folderData]
    );
    setCurrentFolder(folderId);
    fetchFiles(folderId);
  };

  const goToBreadcrumb = (index) => {
    const selected = folderStack[index];
    setCurrentFolder(selected._id);
    setFolderStack(folderStack.slice(0, index + 1));
    fetchFiles(selected._id);
  };

  const handleFileClick = (file) => {
    if (file.type === "folder") {
      openFolder(file._id);
    } else {
      navigate(`/file-detail/${file._id}`, {
        state: { fromFolder: currentFolder, folderStack },
      });
    }
  };

  const openRenameModal = (file) => {
    setRenameTarget(file);
    setNewName(file.name);
    setRenameModalVisible(true);
  };

  const handleRename = async () => {
    try {
      await API.post("/files/rename", { id: renameTarget._id, newName });
      message.success("Renamed successfully");
      setRenameModalVisible(false);
      fetchFiles();
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
      fetchFiles();
    } catch {
      message.error("Failed to delete selected files");
    }
  };

  const toggleSelect = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const breadcrumbItems = [
    {
      title: (
        <span
          className="cursor-pointer"
          onClick={() => {
            setCurrentFolder(null);
            setFolderStack([]);
            fetchFiles(null);
          }}
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
        <Space>
          <Button type="primary" onClick={() => setShowFolderModal(true)}>
            Create Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>Upload File</Button>
        </Space>
      </div>

      <div className="  h-20  lg:flex justify-between items-center">
        <div className="lg:w-1/3">
          <CustomInputGroup
            size="lg"
            placeholder="Search files"
            onChange={(value) => setSearchQuery(value)}
          />
        </div>

        <div className=" lg:-mt-10">
          {selectedFiles.length > 0 && (
            <Button danger onClick={handleBulkDelete}>
              🗑️ Delete Selected ({selectedFiles.length})
            </Button>
          )}
        </div>
      </div>

      <div className=" mb-2">
        {folderStack.length > 1 && (
          <Button onClick={() => goToBreadcrumb(folderStack.length - 2)}>
            <IoIosArrowRoundBack size={20} /> Back
          </Button>
        )}
        {folderStack.length === 1 && (
          <Button
            onClick={() => {
              setCurrentFolder(null);
              setFolderStack([]);
              fetchFiles(null);
            }}
          >
            <IoIosArrowRoundBack size={20} /> Back
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
            onMouseEnter={() => {
              setMouseentered(true);
            }}
            onMouseLeave={() => {
              setMouseentered(false);
            }}
            className={`relative p-4 hover:cursor-pointer shadow-sm bg-white hover:border-gray-100 rounded-lg hover:shadow-md transition-all group ${
              selectedFiles.includes(file._id) ? "border-blue-500" : ""
            }`}
          >
            <input
              type="checkbox"
              className="absolute hover:cursor-pointer w-4 h-4 top-2 left-2 z-10"
              checked={selectedFiles.includes(file._id)}
              onChange={() => toggleSelect(file._id)}
            />
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "rename",
                    label: "Rename",
                    icon: <EditOutlined />,
                    onClick: () => openRenameModal(file),
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
            </Dropdown>
            <div
              className="flex flex-col items-center"
              onClick={() => handleFileClick(file)}
            >
              <img
                src={
                  file.type === "folder"
                    ? folderIcon
                    : ["jpg", "jpeg", "png", "gif", "webp"].includes(
                        file.filetype?.toLowerCase()
                      )
                    ? fileIcon
                    : ["pdf"].includes(file.filetype?.toLowerCase())
                    ? pdfIcon
                    : [
                        "doc",
                        "docx",
                        "dot",
                        "dotx",
                        "docm",
                        "dotm",
                        "rtf",
                        "odt",
                      ].includes(file.filetype?.toLowerCase())
                    ? docicon
                    : [
                        "xlsx",
                        "xlsm",
                        "xltx",
                        "xltm",
                        "xls",
                        "xlt",
                        "csv",
                        "xml",
                      ].includes(file.filetype?.toLowerCase())
                    ? excelicon
                    : unknownfile
                }
                alt="file"
                className="w-14 h-14 mb-2"
              />
              <p className="text-sm text-center truncate w-full">{file.name}</p>
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
            fetchFiles();
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
            fetchFiles();
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

export default FileManager;
