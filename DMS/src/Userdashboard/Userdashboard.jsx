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
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);

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

  console.log("images", images);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/files/notification/${user?.user?._id}`
      );
      const data = res.data;

      setNotifications(data);
      setUnseenCount(data.filter((notif) => !notif.seen).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (user?.user?._id) {
      fetchNotifications();

      socket.on("new_notification", () => {
        fetchNotifications();
      });

      return () => socket.off("new_notification");
    }
  }, [user]);

  const handleMarkAsSeen = async (notifId) => {
    try {
      await axios.post(`http://127.0.0.1:5000/api/files/mark-seen/${notifId}`, {
        userId: user?.user?._id,
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notifId ? { ...notif, seen: true } : notif
        )
      );

      setUnseenCount((prev) => (prev > 0 ? prev - 1 : 0));
      AntMessage.success("Marked as seen!");
    } catch (err) {
      console.error("Error marking notification as seen", err);
      AntMessage.error("Failed to mark as seen");
    }
  };

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

  const notificationContent = (
    <div className="space-y-2 min-w-[300px]  flex flex-col gap-5 max-h-80 overflow-scroll">
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif._id}
            className="flex justify-between gap-2  shadow-md p-2 rounded-md  hover:bg-slate-200"
          >
            <div className="text-sm  ">
              {/* <div className=" text-md font-sans">New File Uploaded</div> */}
              <div className=" font-semibold">
                <span className=" font-Thin">File</span> {notif.message}
              </div>

              <div className=" text-md font-sans">
                uploaded in {notif?.parent}
              </div>
              <div className="text-md font-sans">
                {new Date(notif.time).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
            {!notif.seen && (
              <a
                size="small"
                className="underline-offset-0"
                style={{
                  textDecoration: "none",
                }}
                onClick={() => handleMarkAsSeen(notif._id)}
              >
                Mark as Seen
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-purple-100 p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-700">Dashboard</h2>

        <Popover
          content={notificationContent}
          title="Notifications"
          trigger="click"
        >
          <Badge count={unseenCount} className="cursor-pointer">
            <IoIosNotificationsOutline
              // size={30}
              className="text-green-500 w-6 h-6"
            />
          </Badge>
        </Popover>
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
