"use client";
import React, { ReactNode } from "react";
import { createContext, useContext, useState, useReducer } from "react";
import { useAuth } from "./authContext";

type ChatContextProps = {
  users: boolean | any;
  chats: Array<any> | null;
  replyMessage:string;
  selectedChat: any;
  inputText: string;
  attachment: File;
  attachmentPreview: string;
  editMsg: any;
  isTyping: any;
  delelePopup:boolean;
  imageViewer: any;
  replyMessageImage:boolean;
  setReplyMessageImage: React.Dispatch<React.SetStateAction<boolean>> | any;
  setInputText: React.Dispatch<React.SetStateAction<string>> | any;
  setAttachment: React.Dispatch<React.SetStateAction<File>> | any;
  setAttachmentPreview: React.Dispatch<React.SetStateAction<string>> | any;
  setEditMsg: React.Dispatch<React.SetStateAction<any>> | any;
  setIsTyping: React.Dispatch<React.SetStateAction<any>> | any;
  setImageViewer: React.Dispatch<React.SetStateAction<any>> | any;
  setChats: React.Dispatch<React.SetStateAction<any>> | any;
  setSelectedChat: React.Dispatch<React.SetStateAction<any>> | any;
  setUsers: React.Dispatch<React.SetStateAction<boolean>> | any;
  setReplyMessage: React.Dispatch<React.SetStateAction<string>> | any;
  setDeletePopup: React.Dispatch<React.SetStateAction<boolean>> | any;
  dispatch: React.Dispatch<any>;
  data: any;
};
interface ChatProviderProps {
  children: ReactNode;
}
const chatContext = createContext<ChatContextProps | null>(null);

export const ChatContextProvider: React.FC<ChatProviderProps> = ({
  children,
}) => {
  const [users, setUsers] = useState<boolean>(false);
  const [chats, setChats] = useState<Array<any> | null>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState<string>("");
  const [attachment, setAttachment] = useState<any>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<any>(null);
  const [editMsg, setEditMsg] = useState<any>(null);
  const [isTyping, setIsTyping] = useState<any>(null);
  const [imageViewer, setImageViewer] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState<string | any>(null);
  const [replyMessageImage, setReplyMessageImage] = useState<boolean | any>(false);
  const [delelePopup, setDeletePopup] = useState<boolean>(false);

  const INITIAL_STATE = {
    chatId: "",
    user: null,
  };

  const chatReducer = (state: typeof INITIAL_STATE, action: any) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId:
            currentUser?.uid && action.payload.uid
              ? currentUser.uid > action.payload.uid
                ? currentUser.uid + action.payload.uid
                : action.payload.uid + currentUser.uid
              : "",
        };
      case "EMPTY":
        return INITIAL_STATE
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <chatContext.Provider
      value={{
        users,
        setUsers,
        dispatch,
        data: state,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        inputText,
        setInputText,
        attachment,
        setAttachment,
        attachmentPreview,
        setAttachmentPreview,
        editMsg,
        setEditMsg,
        isTyping,
        setIsTyping,
        imageViewer,
        setImageViewer,
        replyMessage,
        setReplyMessage,
        replyMessageImage,
        setReplyMessageImage,
        delelePopup,
        setDeletePopup
      }}
    >
      {children}
    </chatContext.Provider>
  );
};
export const useChatContext = (): ChatContextProps => {
  const context = useContext(chatContext);

  if (!context) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }

  return context;
};
