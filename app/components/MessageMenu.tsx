import React, { useState } from "react";
import Icon from "./Icon";
import { BsReplyFill, BsDownload } from "react-icons/bs";
import changeTheme from "../hooks/useTheme";
import { saveAs } from "file-saver";
import { useChatContext } from "@/context/chatContext";
import { AiOutlineDelete } from "react-icons/ai";
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firebase";
import { useAuth } from "@/context/authContext";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
type MesssageMenuProps = {
  show: any;
  self: any;
  setShow: React.Dispatch<any>;
  props: {
    img: string;
    id: string;
    text: string;
  };
};

const MesssageMenu: React.FC<MesssageMenuProps> = ({
  show,
  setShow,
  self,
  props,
}) => {
  const theme = changeTheme();
  const { setReplyMessage, setReplyMessageImage,setDeletePopup } = useChatContext();
  const handleDownloadImage = () => {
    const fileUrl = props.img;
    saveAs(fileUrl);
  };
  const { data } = useChatContext();
  const { currentUser } = useAuth();
  const deleteFunc = () => {
    confirmAlert({
      title: "Confirm to Delete",
      message: "Are you sure you want to delete",
      buttons: [
        {
          label: "Delete",
          onClick: handleDeleteMessage
        },
        {
          label: "Cancel"
          // onClick: () => alert("Click No")
        }
      ]
    })
  }
  const handleDeleteMessage = async () => {
  
    try {
      const chatRef = doc(db, "chats", data.chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists() && chatDoc !== undefined) {
        const messages = chatDoc?.data().messages;
        const messageId = props.id;
        const messageIndex = messages.findIndex(
          (message: any) => message.id === messageId
        );
        if (messageIndex !== -1) {
          messages[messageIndex].delete = true;
        }

        await updateDoc(chatRef, {
          messages: messages,
        });
        let msg = { text: "Tin nhắn đã bị gỡ bỏ" };

        if (currentUser !== null) {
          await updateDoc(doc(db, "userChats", currentUser.uid), {
            [data.chatId + ".lastMessage"]: msg,
            [data.chatId + ".date"]: serverTimestamp(),
          });
        }
        if (data !== null) {
          await updateDoc(doc(db, "userChats", data?.user?.uid), {
            [data.chatId + ".lastMessage"]: msg,
            [data.chatId + ".date"]: serverTimestamp(),
          });
        }
      }
    
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      className={`flex items-center justify-center ${
        theme.isDarkTheme ? "text-black" : "text-black"
      } `}
    >
      {props.img && (
        <Icon
          size="medium"
          icon={<BsDownload size={16} />}
          onClick={() => handleDownloadImage()}
          className=""
        />
      )}
      <Icon
        size="medium"
        icon={<BsReplyFill size={16} />}
        onClick={() => {
          if (props.img) {
            setReplyMessageImage(true);
            setReplyMessage(props.img);
          } else {
            setReplyMessageImage(false);
            setReplyMessage(props.text);
          }
        }}
        className=""
      />
      <Icon
        size="medium"
        icon={<AiOutlineDelete size={16} />}
        onClick={deleteFunc}
        className=""
      />
    </div>
  );
};
export default MesssageMenu;
