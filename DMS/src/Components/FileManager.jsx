import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Space,
  Modal,
  message,
  Breadcrumb,
  Dropdown,
  Drawer,
  Input,
} from "antd";
import axios from "axios";
import {
  EditOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
  DeleteColumnOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import MicrophoneIcon from "@rsuite/icons/legacy/Microphone";

import ModalCreateFolder from "./ModalCreateFolder";
import ModalUploadFile from "./ModalUploadFile";

import folderIcon from "../images/folder1.png";
import fileIcon from "../images/image.png";
import pdfIcon from "../images/pdf.png";
import docicon from "../images/doc.png";
import excelicon from "../images/logo (1).png";
import unknownfile from "../images/unknown.png";

import { InputGroup } from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import { useSyncExternalStore } from "react";

const CustomInputGroup = ({ placeholder, onChange }) => (
  <InputGroup style={{ marginBottom: 10 }}>
    <Input placeholder={placeholder} onChange={(value) => onChange(value)} />
    <InputGroup.Addon>
      <SearchIcon />
    </InputGroup.Addon>
  </InputGroup>
);

const FileManager = () => {
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
  const [messageApi, contextHolder] = message.useMessage();
  const [allfiles, setAllfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [sharefile, setSharefile] = useState("");
  const [filePathsMap, setFilePathsMap] = useState({});

  const recognitionRef = useRef(null);
  const success = () => {
    messageApi.open({
      type: "success",
      content: "Folder created successfully",
    });
  };

  const uploadsuccess = () => {
    messageApi.open({
      type: "success",
      content: "File uploaded successfully",
    });
  };
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

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript); // ✅ update state directly
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
    };

    recognition.start();
  };

  useEffect(() => {
    const updateSearchPaths = async () => {
      if (searchQuery.trim() === "") {
        setFilePathsMap({});
        return;
      }

      const matchingFiles = (searchQuery ? allfiles : files).filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const newPaths = {};
      for (const file of matchingFiles) {
        const path = await getFilePath(file);
        newPaths[file._id] = path;
      }
      setFilePathsMap(newPaths);
    };

    updateSearchPaths();
  }, [searchQuery, allfiles]);

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

  const getFilePath = async (file) => {
    const stack = await buildBreadcrumbStack(file.parent);
    const pathString = stack.map((folder) => folder.name).join(" / ");
    return pathString;
  };

  const fetchAllfiles = async () => {
    try {
      const response = await API.get("/files/allfiles");
      setAllfiles(response.data);

      console.log("response", response.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchAllfiles();
  }, []);

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
      navigate(`/files?folderId=${file._id}`);
    } else {
      navigate(`/file-detail/${file._id}`, {
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
    setSharefile(file.path);
    setIsModalOpen(true); // open modal
    // console.log("path", file.path)
  };

  const handleSend = async () => {
    if (!mobileNumber) {
      alert("Please enter a mobile number");
      return;
    }

    try {
      const payload = {
        destination: `+91${mobileNumber}`,
        // url: "https://whatsapp-media-library.s3.ap-south-1.amazonaws.com/IMAGE/6353da2e153a147b991dd812/4958901_highanglekidcheatingschooltestmin.jpg",
        url: sharefile,
      };
      const response = await axios.post(
        "http://127.0.0.1:5000/api/files/whatsapp",
        payload
      );
      message.success(`File shared to ${mobileNumber}`);
      setIsModalOpen(false);
      setMobileNumber("");

      console.log("response", response);
    } catch (error) {
      console.log("error", error);
    }

    console.log("Sharing file:", sharefile, "to", mobileNumber);
    // TODO: Call your API to send the image here
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

  const handleDelete = async (file) => {
    alert(file._id);
    // try {
    //   await API.delete(`/files/${file._id}`);
    //   alert("deleted");
    // } catch (error) {
    //   console.log("error", error);
    // }
  };

  const goToBreadcrumb = (index) => {
    const target = folderStack[index];
    navigate(`/files?folderId=${target._id || ""}`);
  };

  const filteredFiles = (searchQuery?.trim() === "" ? files : allfiles).filter(
    (file) => file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // const filteredFiles = files.filter((file) =>
  //   file.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  console.log("filter", filteredFiles);

  const breadcrumbItems = [
    {
      title: (
        <span className="cursor-pointer" onClick={() => navigate("/files")}>
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

  const [parentpath, setParentpath] = useState("");

  const breadcrumbitem = () => {
    const itemb = breadcrumbItems.map((item) => {
      return item?.title?.props?.children || ""; // Extract 'children' from the props
    });

    // Join the items with a '/' separator and log the result
    const breadcrumbString = itemb.join("/");
    setParentpath(breadcrumbString);
  };

  console.log("parent", parentpath);

  useEffect(() => {
    breadcrumbitem();
  }, [breadcrumbItems]);

  console.log("breadcrumb", breadcrumbItems);

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-5xl mx-auto">
      {contextHolder}
      <div className="my-4 lg:flex gap-5 justify-between">
        <div className="font-semibold text-xl">Manage Files</div>
        <Space>
          <Button type="primary" onClick={() => setShowFolderModal(true)}>
            Create Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>Upload File</Button>
          {folderStack.length > 0 && (
            <Button onClick={() => navigate(-1)}>⬅️ Back</Button>
          )}
        </Space>
      </div>

      <div className="lg:flex justify-between items-center mb-4">
        <div className="lg:w-1/3">
          <InputGroup style={{ marginBottom: 10 }}>
            <Input
              value={searchQuery}
              placeholder="Search files"
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear // ✅ This shows the ❌ button
            />

            <InputGroup.Addon
              onClick={startListening}
              style={{ cursor: "pointer" }}
            >
              <MicrophoneIcon />
            </InputGroup.Addon>
            <InputGroup.Addon>
              <SearchIcon />
            </InputGroup.Addon>
          </InputGroup>
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
            <input
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
            />
            <Dropdown
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
                        {
                          key: "download",
                          label: "Download",
                          icon: <DownloadOutlined />,
                          onClick: () => handleDownload(file),
                        },
                      ]
                    : []),

                  {
                    key: "delete",
                    label: "Delete",
                    icon: <DeleteColumnOutlined />,
                    onClick: () => handleDelete(file),
                  },
                ],
              }}
              placement="bottomRight"
            >
              <MoreOutlined className="absolute top-2 right-2 text-xl cursor-pointer z-10" />
            </Dropdown>
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
              {searchQuery && filePathsMap[file._id] && (
                <div className="text-xs text-gray-500 mt-1 text-center truncate w-full">
                  {filePathsMap[file._id]}
                </div>
              )}
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
          success={success}
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
          parentpath={parentpath}
          onClose={() => {
            setShowUploadModal(false);
            fetchFiles(currentFolder);
          }}
          success={uploadsuccess}
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
      <Modal
        title="Share File via WhatsApp"
        open={isModalOpen}
        onOk={handleSend}
        onCancel={() => setIsModalOpen(false)}
        okText="Share"
        cancelText="Cancel"
      >
        <p>
          <strong>File:</strong> {sharefile}
        </p>
        <Input
          placeholder="Enter mobile number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default FileManager;
