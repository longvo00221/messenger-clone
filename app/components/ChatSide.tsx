import { useAuth } from "@/context/authContext";
import { useChatContext } from "@/context/chatContext";
import { db } from "@/firebase/firebase";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import Avatar from "./Avatar";
import changeTheme from "../hooks/useTheme";
import { formatData } from "@/utils/helper";

type ChatBoxProps = {};

const ChatBox: React.FC<ChatBoxProps> = () => {
  const {
    users,
    setUsers,
    selectedChat,
    setSelectedChat,
    chats,
    data,
    setChats,
    dispatch,
  } = useChatContext();
  const [search, setSearch] = useState<string>("");
  const { currentUser } = useAuth();
  const isBlockExcutedRef = useRef(false);
  const isUsersFetchedRef = useRef(false);
  const [unReadMsgs, setUnReadMsgs] = useState<any>({});
  useEffect(() => {
    onSnapshot(collection(db, "users"), (snapshot) => {
      const updatedUsers: { [key: string]: any } = {};
      snapshot.forEach((doc) => {
        updatedUsers[doc.id] = doc.data();
      });
      setUsers(updatedUsers);
      if (!isBlockExcutedRef.current) {
        isUsersFetchedRef.current = true;
      }
    });
  }, [setUsers]);
  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(
        doc(db, "userChats", currentUser?.uid || ""),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setChats(data);
            if (
              !isBlockExcutedRef.current &&
              isUsersFetchedRef.current &&
              users
            ) {
              const firstChat = Object.values(data)
                .filter((chat) => !chat.hasOwnProperty("chatDeleted"))
                .sort((a, b) => b.date - a.date)[0];
              if (firstChat) {
                const user = users[firstChat?.userInfo?.uid];
                handleSelect(user);
                const chatId =
                  currentUser?.uid && user.uid
                    ? currentUser.uid > user.uid
                      ? currentUser.uid + user.uid
                      : user.uid + currentUser.uid
                    : "";
                readChat(chatId);
              }
              isBlockExcutedRef.current = true;
            }
          }
        }
      );
    };
    currentUser?.uid && getChats();
  }, [currentUser?.uid, setChats, users, isBlockExcutedRef.current]);
  useEffect(() => {
    if (chats && typeof chats === "object") {
      const documentIds = Object.keys(chats);
      if (documentIds.length === 0) return;
      const q = query(
        collection(db, "chats"),
        where("__name__", "in", documentIds)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const msgs: { [key: string]: any } = {};
        snapshot.forEach((doc) => {
          if (doc.id !== data.chatId) {
            msgs[doc.id] = doc
              .data()
              .messages.filter(
                (m: any) => m.read === false && m.sender !== currentUser?.uid
              );
          }
          Object.keys(msgs || {})?.map((c) => {
            if (msgs[c]?.length < 1) {
              delete msgs[c];
            }
          });
        });
        setUnReadMsgs(msgs);
      });
      return () => unsub();
    }
  }, [chats]);
  const handleSelect = (user: any, selectedId?: string) => {
    setSelectedChat(user);
    dispatch({ type: "CHANGE_USER", payload: user });
    if (selectedId && unReadMsgs?.[selectedId]?.length > 0) {
      readChat(selectedId);
    }
  };

  const trimmedSearch = search.trim();
  const handleRevSpaceSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e?.target?.value;
    if (inputValue.trim() !== inputValue && inputValue.startsWith(" ")) {
      setSearch(inputValue.trim());
    } else {
      setSearch(inputValue);
    }
  };
  const filteredChats = Object.entries(chats || {})
  .filter(chat => !chat[1].hasOwnProperty('chatDeleted'))
    .filter(
      ([, chat]) =>
        chat.userInfo.displayName
          .toLowerCase()
          .includes(trimmedSearch.toLocaleLowerCase()) ||
        chat.lastMessage?.text
          .toLowerCase()
          .includes(trimmedSearch.toLocaleLowerCase())
    )
    .sort((a, b) => b[1].date - a[1].date);
  const readChat = async (chatId: any) => {
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);
    if (chatDoc) {
      let updatedMessages = chatDoc.data()?.messages.map((m: any) => {
        if (m?.read === false) {
          m.read = true;
        }
        return m;
      });

      await updateDoc(chatRef, {
        messages: updatedMessages,
      });
    }
  };
  const theme = changeTheme();
  return (
    <div className="flex flex-col h-full">
      <div
        className={`shrink-0 pt-5 sticky -top-[20px] z-10 flex justify-center duration-layout w-full ${
          theme.isDarkTheme ? "bg-c2" : "bg-white"
        } py-2`}
      >
        <RiSearch2Line
          className={`absolute top-[2.2rem] left-[4rem] ${
            theme.isDarkTheme ? "text-c3" : "text-black"
          } `}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleRevSpaceSearch(e)}
          placeholder="Search username"
          className={`w-[300px] h-12 rounded-xl duration-layout
          ${
            theme.isDarkTheme
              ? "bg-c1/[0.5] text-white"
              : "bg-gray-100 text-black"
          }
          ${
            theme.isDarkTheme ? "placeholder:text-c3" : "placeholder:text-black"
          }  
        
              pl-11 pr-5 text-base`}
        />
      </div>
      <ul className="flex flex-col w-full p-5 my-5 gap-[2px]">
        {Object.entries(users || {}).length > 0 &&
          filteredChats.map((chat, i) => {
            const user = users[chat[1].userInfo.uid];
            const timestamp = new Timestamp(
              chat[1].date?.seconds,
              chat[1].date?.nanoseconds
            );
            const date = timestamp.toDate();
            return (
              <li
                key={i}
                onClick={() => handleSelect(user, chat[0])}
                className={`h-[75px] flex items-center gap-4 rounded-3xl mb-2 duration-layout  p-4 cursor-pointer 
                ${
                  selectedChat?.uid === user?.uid
                    ? `${
                        theme.isDarkTheme
                          ? "bg-c1 hover:bg-c1/[0.5]"
                          : "bg-gray-200 hover:bg-gray-200"
                      }`
                    : ``
                }
          `}
              >
                <Avatar size="x-large" user={user} />
                <div className="flex flex-col gap-1 grow relative">
                  <span
                    className={`text-base ${
                      theme.isDarkTheme ? "text-white" : "text-black"
                    }  flex items-center justify-between`}
                  >
                    <div className="font-medium">{user?.displayName}</div>
                    <div className="text-xs text-c3">{formatData(date)}</div>
                  </span>
                  <p className="text-sm text-c3 line-clamp-1 break-all">
                    {chat[1]?.lastMessage?.text ||
                      (chat[1]?.lastMessage?.img && "image") ||
                      "Send first message "}
                  </p>
                  {!!unReadMsgs?.[chat[0]]?.length && (
                    <span className="absolute right-0 top-7 min-w-[20px] h-5 rounded-full bg-red-500 flex justify-center items-center text-sm">
                      {unReadMsgs?.[chat[0]]?.length}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};
export default ChatBox;
