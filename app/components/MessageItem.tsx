import { useAuth } from "@/context/authContext";
import React, { useState } from "react";
import Avatar from "./Avatar";
import { useChatContext } from "@/context/chatContext";
import Image from "next/image";
import ImageViewer from "react-simple-image-viewer";
import { Timestamp } from "firebase/firestore";
import { formatData } from "@/utils/helper";
import changeTheme from "../hooks/useTheme";
import Icon from "./Icon";
import { GoChevronDown } from "react-icons/go";
import MesssageMenu from "./MessageMenu";
import { TiAttachment } from "react-icons/ti";
import DeleteMessagePopup from "./popup/DeleteMessagePopup";

type DateObject = {
  nanoseconds: number;
  seconds: number;
};
type replyType = {
  isImage: boolean;
  content: string;
};
type MessageItemProps = {
  props: {
    sender: string;
    text: string;
    id: string;
    date: DateObject;
    img: string;
    reply: replyType;
    delete: boolean;
  };
};

const MessageItem: React.FC<MessageItemProps> = ({ props }) => {
  const { currentUser } = useAuth();
  const {
    users,
    data,
    setImageViewer,
    imageViewer,
    delelePopup,
    setDeletePopup,
  } = useChatContext();
  const [showMenu, setShowMenu] = useState();

  const self = currentUser && props?.sender === currentUser.uid;

  const timestamp = new Timestamp(props.date?.seconds, props.date?.nanoseconds);
  const time = timestamp.toDate();
  const date = formatData(time);
  const theme = changeTheme();
  return (
    <div
      className={`mb-5 relative max-w-[75%] ${self ? "self-end" : ""} ${
        props.reply ? "mt-10" : "mt-0"
      }`}
    >
      <>
        {props.reply && (
          <div
            className={`rounded-t-md rounded-bl-md absolute gap-3 top-[-35px] left-[-37px] text-center ${
              theme.isDarkTheme
                ? "text-gray-400 bg-black/[.4]"
                : "text-white bg-[#e7e7e7]"
            } text-sm  px-2 py-3 min-w-[80px] w-auto`}
          >
            {props.reply.isImage ? (
              <div className="flex items-center text-xs">
                <TiAttachment className="mr-1" size={13} />
                Attachment
              </div>
            ) : (
              <span>{props.reply.content}</span>
            )}
          </div>
        )}
        <div
          className={`flex items-end gap-3 mb-1  ${
            self ? "justify-start flex-row-reverse" : ""
          }`}
        >
          <Avatar
            size="small"
            user={self ? currentUser : users[data.user.uid]}
          />
          <div className="flex flex-col items-end justify-center">
            <div
              className={`group flex flex-col gap-4  p-4 rounded-3xl relative break-all
            ${
              self
                ? `rounded-br-md ${
                    theme.isDarkTheme ? "bg-c5" : "bg-gray-400"
                  } `
                : `rounded-bl-md duration-layout bg-[#7a7a7a]`
            }`}
            >
              {props.delete ? (
                <div
                  className={`${
                    theme.isDarkTheme ? "text-[#a8a8a8]" : "text-[#e1e1e1]"
                  }`}
                >
                  Tin nhắn đã xóa
                </div>
              ) : (
                <>
                  {props.text && <div className="text-sm">{props.text}</div>}
                  {props.img && (
                    <>
                      <Image
                        src={props.img}
                        width={250}
                        height={250}
                        alt={props.text}
                        className="rounded-3xl cursor-pointer max-w-[250px]"
                        onClick={() => {
                          setImageViewer({
                            msgId: props.id,
                            url: props.img,
                          });
                        }}
                      />
                      {imageViewer && imageViewer.msgId === props.id && (
                        <div className="relative">
                          <ImageViewer
                            src={[imageViewer.url]}
                            currentIndex={0}
                            disableScroll={false}
                            closeOnClickOutside={true}
                            onClose={() => setImageViewer(null)}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div
                    className={`${
                      showMenu ? "" : "hidden"
                    } group-hover:flex absolute top-1/2 -translate-y-1/2 ${
                      self
                        ? `${props.img ? "-left-[7rem]" : "-left-[4.8rem]"}`
                        : "right-2 "
                    }`}
                  >
                    <div
                      className={`bg-transparent w-3 h-8 absolute top-1 group-hover:flex ${
                        props.img ? "left-[6.2rem]" : "left-[4.05rem]"
                      } `}
                    ></div>
                    <MesssageMenu
                      self={self}
                      show={showMenu}
                      setShow={setShowMenu}
                      props={props}
                    />
                  </div>
                </>
              )}
            </div>
            {!props.delete && (
              <div className="text-[8px] font-semibold text-[#b2b2b2] mt-1">{date}</div>
            )}
          </div>
        </div>
      </>
    </div>
  );
};
export default MessageItem;
