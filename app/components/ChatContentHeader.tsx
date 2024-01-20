"use client";
import { useChatContext } from "@/context/chatContext";
import React, { useState } from "react";
import Avatar from "./Avatar";
import changeTheme from "../hooks/useTheme";
import Icon from "./Icon";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import Button from "@mui/material/Button";
import ChatMenu from "./ChatMenu";
import { AiTwotonePhone } from "react-icons/ai";
import { BsFillCameraVideoFill } from "react-icons/bs";
type ChatContentHeaderProps = {};

const ChatContentHeader: React.FC<ChatContentHeaderProps> = () => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { users, data } = useChatContext();
  const online = users[data.user.uid]?.isOnline;
  const user = users[data.user.uid];
  const theme = changeTheme();
  return (
    <div
      className={`flex justify-between items-center border-b px-5 py-2 border-white/[0.05] shadow-md`}
    >
      {user && (
        <div className="flex items-center gap-3">
          <Avatar size="large" user={user} />
          <div>
            <div
              className={`${theme.isDarkTheme ? "text-white" : "text-black"}`}
            >
              {user.displayName}
            </div>
            <p className="text-sm text-c3">{online ? "Online" : "Offline"}</p>
          </div>
        </div>
      )}
      <div className="flex items-center">
        <Button
          sx={{ minWidth: "0", padding: 2, borderRadius: "50%" }}
          color="primary"
          className={`${showMenu ? "bg-c1" : ""}`}
        >
          <AiTwotonePhone size={20} className="text-c3" />
        </Button>
        <Button
          sx={{ minWidth: "0", padding: 2, borderRadius: "50%" }}
          color="primary"
          className={`${showMenu ? "bg-c1" : ""}`}
        >
          <BsFillCameraVideoFill size={20} className="text-c3" />
        </Button>
        <Button
          sx={{ minWidth: "0", padding: 2, borderRadius: "50%" }}
          color="primary"
          onClick={() => setShowMenu(true)}
          className={`${showMenu ? "bg-c1" : ""}`}
        >
          <IoEllipsisVerticalSharp size={20} className="text-c3" />
        </Button>
        {showMenu && <ChatMenu show={showMenu} setShow={setShowMenu} />}
      </div>
    </div>
  );
};
export default ChatContentHeader;
