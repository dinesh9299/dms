import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Descriptions, Button, message, Image, Row, Col } from "antd";
import { DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";
import fileImage from "../images/document.png";
import folderIcon from "../images/folder1.png";
import pdfIcon from "../images/pdf.png";
import docicon from "../images/doc.png";
import excelicon from "../images/logo (1).png";
import unknownfile from "../images/unknown.png";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";

const FileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fromFolder, folderStack } = location.state || {};

  const [file, setFile] = useState();

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/files/file/${id}`
        );
        setFile(res.data);
      } catch {
        message.error("File not found or error fetching file");
      }
    };
    fetchFile();
  }, [id]);

  const getFileIcon = (file) => {
    if (!file) return fileImage;
    if (file.type === "folder") return folderIcon;
    const type = file.filetype?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(type)) {
      return file.path;
    }
    if (type === "pdf") return pdfIcon;
    if (
      ["xlsx", "xlsm", "xltx", "xltm", "xls", "xlt", "csv", "xml"].includes(
        type
      )
    ) {
      return excelicon;
    }
    if (
      ["doc", "docx", "dot", "dotx", "docm", "dotm", "rtf", "odt"].includes(
        type
      )
    ) {
      return docicon;
    }

    return unknownfile;
  };

  const handleDownload = () => {
    const filePath = file.path.replace("http://127.0.0.1:5000/uploads/", "");
    const downloadUrl = `http://localhost:5000/api/files/download/${filePath}/${file.name}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    const msg = `Check this out: ${file.name}\n${file.path}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (!file) return <p>Loading...</p>;

  return (
    <div className="" style={{ padding: "24px" }}>
      <button
        style={{ borderRadius: "10px", marginBottom: "10px" }}
        className="flex  items-center gap-1 px-4 py-2 mb-6 text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-100 transition-all duration-150"
        onClick={() =>
          navigate("/Files", {
            state: { returnToFolder: fromFolder, returnStack: folderStack },
          })
        }
      >
        <IoIosArrowRoundBack className="text-2xl" />
        <span className="text-base font-medium">Back</span>
      </button>

      <Card
        title="File Details"
        className=""
        style={{ maxWidth: 700, margin: "0 auto" }}
      >
        <Row gutter={24} align="middle">
          <Col xs={24} sm={8} md={6} style={{ textAlign: "center" }}>
            <div>
              {["jpg", "jpeg", "png", "gif", "webp"].includes(
                file.filetype?.toLowerCase()
              ) ? (
                <Image
                  className="rounded-md"
                  // width={200}
                  src={getFileIcon(file)}
                />
              ) : (
                <Image
                  preview={false}
                  className="rounded-md"
                  width={150}
                  height={150}
                  src={getFileIcon(file)}
                />
              )}
            </div>
          </Col>
          <Col xs={24} sm={16} md={18}>
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Name">{file.name}</Descriptions.Item>
              <Descriptions.Item label="Type">
                {file.filetype}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {file.size ? `${(file.size / 1024).toFixed(2)} KB` : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Uploaded On">
                {new Date(file.createdtime).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <div
          style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}
        >
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            style={{ width: "100%", maxWidth: 200 }}
          >
            Download
          </Button>
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleShare}
            style={{ width: "100%", maxWidth: 200 }}
          >
            Share
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FileDetail;
