/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Icon from "./Icon";
import { CgAttachment } from "react-icons/cg";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import Composebar from "./Composebar";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import { ClickAwayListener } from "@mui/material";
import changeTheme from "../hooks/useTheme";
import { useChatContext } from "@/context/chatContext";
import { IoClose } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { motion } from "framer-motion";
import { BsReplyFill } from "react-icons/bs";
import Image from "next/image";
import { AiOutlineClose } from "react-icons/ai";
type ChatContentFooterProps = {};

const ChatContentFooter: React.FC<ChatContentFooterProps> = () => {
  const {
    isTyping,
    editMsg,
    setEditMsg,
    inputText,
    setInputText,
    setAttachment,
    setAttachmentPreview,
    replyMessage,
    attachmentPreview,
    replyMessageImage,
    setReplyMessage,
  } = useChatContext();
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const themeLayout = changeTheme();
  const themeEmoji = themeLayout.isDarkTheme ? Theme.DARK : Theme.LIGHT;
  const onEmojiClick = (emojiData?: any, event?: any) => {
    let text = inputText;
    setInputText((text += emojiData.emoji));
  };
  const onFileChange = (e: any) => {
    const file = e.target.files[0];
    setAttachment(file);
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setAttachmentPreview(blobUrl);
    }
  };
  const varinantAttachment = {
    visible: {
      opacity: 1,
      y: 0,
    },
    hidden: {
      opacity: 0,
      y: 30,
    },
  };
  const varinantReplyMessage = {
    visible: {
      opacity: 1,
      y: 0,
      x: "-50%",
    },
    hidden: {
      opacity: 0,
      x: "-50%",
      y: 20,
    },
    exit: {
      opacity: 0,
      x: "-50%",
      y: 20,
      transition: { ease: "easeInOut" },
    },
  };
  return (
    <div
      className={`flex mb-2 items-center ${
        themeLayout.isDarkTheme ? "bg-c1/[0.5]" : "bg-gray-100"
      } duration-layout  p-2 mx-2 rounded-xl relative`}
    >
     {replyMessage && <motion.div
        variants={varinantReplyMessage}
        initial="hidden"
        exit="exit"
        animate="visible"
        className={`rounded-t-md bg-black/[.3] left-1/2 min-h-8 flex items-center justify-between  w-[95%] py-2 absolute ${
          replyMessageImage ? "top-[-72px]" : "top-[-48px]"
        }  px-5`}
      >
        <div className="flex items-center">
          <BsReplyFill />
          {replyMessageImage ? (
            <Image
              src={replyMessage}
              width={100}
              height={100}
              alt="123"
              className="rounded-md cursor-pointer max-h-[58px] ml-2 max-w-[250px]"
            />
          ) : (
            <span className="ml-2 text-base">{replyMessage}</span>
          )}
        </div>
        <Icon
          size="small"
          onClick={() => {
            setReplyMessage(null);
          }}
          className="float-right"
          icon={<AiOutlineClose />}
        />
      </motion.div>}

      {attachmentPreview && (
        <motion.div
          variants={varinantAttachment}
          transition={{ delay: 0.8 }}
          initial="hidden"
          animate="visible"
          className="absolute w-[100px] h-[100px] bottom-16 left-5 bg-c1 p-2 rounded-md"
        >
          <img
            src={attachmentPreview}
            alt="attachment preview"
            className="h-full object-contain w-full"
          />
          <div
            className="w-6 h-6 rounded-full bg-black flex justify-center items-center absolute -right-2 -top-2 cursor-pointer"
            onClick={() => {
              setAttachment(null);
              setAttachmentPreview(null);
            }}
          >
            <MdDeleteForever size={14} />
          </div>
        </motion.div>
      )}
      <div className="shrink-0">
        <input
          type="file"
          id="fileUploader"
          className="hidden"
          onChange={onFileChange}
        />
        <label htmlFor="fileUploader">
          <Icon
            size="large"
            onClick={() => {}}
            icon={
              <CgAttachment
                size={20}
                className={` ${
                  themeLayout.isDarkTheme ? "text-c3" : "text-black"
                } duration-layout`}
              />
            }
          />
        </label>
      </div>
      <div className="shrink-0 relative">
        <Icon
          onClick={() => {
            setShowEmoji(true);
          }}
          size="large"
          className={``}
          icon={
            <HiOutlineEmojiHappy
              size={20}
              className={` ${
                themeLayout.isDarkTheme ? "text-c3" : "text-black"
              } duration-layout`}
            />
          }
        />
        {showEmoji && (
          <ClickAwayListener
            onClickAway={() => {
              setShowEmoji(false);
            }}
          >
            <div className="absolute bottom-12 left-0 shadow-lg">
              {" "}
              <EmojiPicker
                theme={themeEmoji}
                emojiStyle={EmojiStyle.FACEBOOK}
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
              />
            </div>
          </ClickAwayListener>
        )}
      </div>
      {isTyping && (
        <div className="absolute top-[-65px]  left-4 w-auto h-6">
          <div className="flex gap-2 w-auto h-full relative opacity-50 text-sm text-white">
            <div className="py-5 px-3 rounded-t-full rounded-r-full bg-gray-500">
              <img
                src="/typing.svg"
                alt="typing"
                className="translate-y-[-1.19rem]"
              />
            </div>
          </div>
        </div>
      )}
      {editMsg && (
        <div
          className="absolute -top-14 left-1/2 hover:scale-105 transition-transform -translate-x-1/2 bg-black flex items-center gap-2 py-2 px-4 pr-2 rounded-full text-sm font-semibold cursor-pointer shadow-lg"
          onClick={() => setEditMsg(null)}
        >
          <span>Cancel edit</span>
          <IoClose size={20} className="text-white" />
        </div>
      )}
      <Composebar />
    </div>
  );
};
export default ChatContentFooter;
