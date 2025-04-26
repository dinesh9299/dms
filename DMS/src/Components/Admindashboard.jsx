import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Flame,
  Users,
  MessageCircle,
  RefreshCcw,
} from "lucide-react";
import { useUser } from "../Components/UserContext";
import { io } from "socket.io-client";
import axios from "axios";
import { Badge, Popover, Button, message as AntMessage } from "antd";
import { IoIosNotificationsOutline } from "react-icons/io";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

const dashboardData = [
  {
    title: "Total Documents",
    count: 128,
    icon: <BarChart3 className="text-purple-500 w-6 h-6" />,
  },
  {
    title: "Types",
    count: 12,
    icon: <Flame className="text-red-500 w-6 h-6" />,
  },
  {
    title: "Users",
    count: 245,
    icon: <Users className="text-blue-500 w-6 h-6" />,
  },
  {
    title: "Downloads",
    count: 54,
    icon: <MessageCircle className="text-green-500 w-6 h-6" />,
  },
  {
    title: "Uploads",
    count: 7,
    icon: <RefreshCcw className="text-yellow-500 w-6 h-6" />,
  },
];

function Userdashboard() {
  const [allfiles, setfiles] = useState([]);
  const [folders, setFolders] = useState(0);
  const [filescount, setFilescount] = useState(0);
  const [images, setImages] = useState(0);
  const [pdf, setPdfCount] = useState(0);
  const [docs, setDocs] = useState(0);
  const [excel, setExcel] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [allcount, setAllcount] = useState(0);

  const fetchfiles = async () => {
    const response = await axios.get(
      "http://127.0.0.1:5000/api/files/allfiles"
    );
    setfiles(response.data);
    console.log("data", response.data);
    setAllcount(response.data.length);
  };

  useEffect(() => {
    const filterfolders = allfiles.filter((file) => file.type === "folder");
    setFolders(filterfolders.length);

    const filterfiles = allfiles.filter((file) => file.type === "file");
    setFilescount(filterfiles.length);

    const filterImages = allfiles.filter((file) => {
      if (!file.filetype) return false;
      const ext = file.filetype.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
    });
    setImages(filterImages.length);

    const filterPDFs = allfiles.filter((file) => {
      if (!file.filetype) return false;
      return file.filetype.toLowerCase() === "pdf";
    });
    setPdfCount(filterPDFs.length);

    const filterWordFiles = allfiles.filter((file) => {
      if (!file.filetype) return false;
      return ["doc", "docx"].includes(file.filetype.toLowerCase());
    });
    setDocs(filterWordFiles.length);

    const filterExcelFiles = allfiles.filter((file) => {
      if (!file.filetype) return false;
      return ["xls", "xlsx"].includes(file.filetype.toLowerCase());
    });
    setExcel(filterExcelFiles.length);

    // ✅ Now handle Unknown Files
    const knownExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "svg", // images
      "pdf", // pdf
      "doc",
      "docx", // word
      "xls",
      "xlsx", // excel
    ];

    const unknownFiles = allfiles.filter((file) => {
      if (file.type === "folder") return false; // ❌ skip folders
      if (!file.filetype) return true; // ✅ if no filetype for a file, count as unknown
      const ext = file.filetype.toLowerCase();
      return !knownExtensions.includes(ext); // ✅ if filetype not known, count as unknown
    });

    console.log("unknown", unknownFiles);

    setUnknown(unknownFiles.length); // <-- create `unknown` state
  }, [allfiles]);

  useEffect(() => {
    fetchfiles();
  }, []);

  const dashboardData = [
    {
      title: "Total Documents",
      count: allcount,
      icon: <BarChart3 className="text-purple-500 w-6 h-6" />,
    },
    {
      title: "Folders",
      count: folders,
      icon: <Flame className="text-red-500 w-6 h-6" />,
    },
    {
      title: "Files",
      count: filescount,
      icon: <Flame className="text-red-500 w-6 h-6" />,
    },
    // {
    //   title: "Users",
    //   count: 245,
    //   icon: <Users className="text-blue-500 w-6 h-6" />,
    // },
    {
      title: "Images",
      count: images,
      icon: <MessageCircle className="text-green-500 w-6 h-6" />,
    },
    {
      title: "Pdf files",
      count: pdf,
      icon: <RefreshCcw className="text-yellow-500 w-6 h-6" />,
    },
    {
      title: "Word files",
      count: docs,
      icon: <RefreshCcw className="text-yellow-500 w-6 h-6" />,
    },
    {
      title: "Excel files",
      count: excel,
      icon: <RefreshCcw className="text-yellow-500 w-6 h-6" />,
    },
    {
      title: "Unknown files",
      count: unknown,
      icon: <RefreshCcw className="text-yellow-500 w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-purple-100 p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-700">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardData.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-2xl p-4 hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">{item.title}</p>
                <h3 className="text-2xl font-bold text-purple-800">
                  {item.count}
                </h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">{item.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Userdashboard;
