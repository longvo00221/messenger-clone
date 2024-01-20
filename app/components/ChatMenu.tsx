import React from "react";
import ClickAwayListener from "react-click-away-listener";
import { motion } from "framer-motion";
import { useAuth } from "@/context/authContext";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useChatContext } from "@/context/chatContext";
type ChatMenuProps = {
  show: boolean;
  setShow: React.Dispatch<any>;
  className?: string;
  action?: string;
  onClick?: () => void;
};

const ChatMenu: React.FC<ChatMenuProps> = ({
  show,
  setShow,
  action,
  className,
  onClick,
}) => {
  const { currentUser } = useAuth();
  const { data, users, chats, dispatch, setSelectedChat } = useChatContext();

  const isUserBlocked =
    currentUser &&
    users[currentUser.uid]?.blockedUsers?.find((u: any) => u === data.user.uid);
  const IamBlocked = users[data.user.uid]?.blockedUsers?.find(
    (u: string) => currentUser && u === currentUser.uid
  );
  const handleClickAway = () => {
    setShow(false);
  };
  const variants = {
    visible: { opacity: 1, y: -15 },
    hidden: { opacity: 0, y: -25 },
  };

  const handleBlockUser = async (action: String) => {
    if (action === "BLOCK" && currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayUnion(data.user.uid),
      });
    }
    if (action === "UNBLOCK" && currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayRemove(data.user.uid),
      });
    }
  };
  const handleDeletaChat = async () => {
    try {
      const chatRef = doc(db, "chats", data.chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists() && currentUser) {
        const updatedMessages = chatDoc.data().messages.map((m: any) => {
          m.deleteChatInfo = {
            ...m.deleteChatInfo,
            [currentUser.uid]: true,
          };
          return m;
        });
        await updateDoc(chatRef, {
          messages: updatedMessages,
        });
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [data.chatId + ".chatDeleted"]: true,
        });
        const filteredChat = Object.entries(chats || {})
          .filter(([id, chat]) => id !== data.chatId)
          .sort((a, b) => b[1].date - a[1].date);
        if (filteredChat.length > 0) {
          setSelectedChat(filteredChat[0][1]?.userInfo);
          dispatch({
            type: "CHANGE_USER",
            payload: filteredChat[0][1]?.userInfo,
          });
        } else {
          dispatch({ type: "EMPTY" });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <motion.div
        variants={variants}
        animate="visible"
        initial="hidden"
        className="w-[200px] absolute top-[70px] right-5 bg-c0 z-10 rounded-md overflow-hidden"
      >
        <ul className="flex flex-col py-2">
          {!IamBlocked && (
            <li
              onClick={(e) => {
                e.stopPropagation();
                handleBlockUser(isUserBlocked ? "UNBLOCK" : "BLOCK");
              }}
              className="flex items-center py-3 px-5 hover:bg-black cursor-pointer"
            >
              {isUserBlocked ? "Unblock user" : "Block user"}
            </li>
          )}
          <li onClick={handleDeletaChat} className="flex items-center py-3 px-5 hover:bg-black cursor-pointer">
            Delete chat
          </li>
        </ul>
      </motion.div>
    </ClickAwayListener>
  );
};
export default ChatMenu;
