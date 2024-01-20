import { useChatContext } from "@/context/chatContext";
import { db } from "@/firebase/firebase";
import {doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import MessageItem from "./MessageItem";
import { useAuth } from "@/context/authContext";

type UserMessageProps = {};

const UserMessage: React.FC<UserMessageProps> = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data, setIsTyping, chats } = useChatContext();
  const {currentUser} = useAuth()
  const [messages, setMessages] = useState<Array<any>>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages);
        setIsTyping(doc.data()?.typing?.[data.user.uid] || false);
      }
      scrollToBottom()
    });
  }, [data.chatId, data.user.uid, setIsTyping]);
  const scrollToBottom = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };
  return (
    <div ref={chatContainerRef} className="grow p-5 overflow-auto scrollbar flex flex-col">
  {messages
    ?.filter((m) => {
      return currentUser && (!m?.deletedChatInfo?.[currentUser.uid] || m?.chatDeleted);
    })
    .map((m) => {
      return (
        <React.Fragment key={m.id}>
          <MessageItem props={m} />
        </React.Fragment>
      );
    })}
</div>

  );
};
export default UserMessage;
