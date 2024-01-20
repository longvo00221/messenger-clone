import { useChatContext } from "@/context/chatContext";
import React, { useState } from "react";
import { TbSend } from "react-icons/tb";
import changeTheme from "../hooks/useTheme";
import {
  Timestamp,
  arrayUnion,
  deleteField,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/firebase/firebase";
import { v4 as uuid } from "uuid";
import { useAuth } from "@/context/authContext";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { toast } from "react-hot-toast";
type ComposebarProps = {};
let typingTimeout: string | number | NodeJS.Timeout | null | undefined = null;
const Composebar: React.FC<ComposebarProps> = () => {
  const {
    inputText,
    setInputText,
    data,
    attachment,
    setAttachment,
    setAttachmentPreview,
    replyMessage,
    setReplyMessage,
    setReplyMessageImage,
    replyMessageImage,
  } = useChatContext();
  const { currentUser } = useAuth();

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    await updateDoc(doc(db, "chats", data.chatId), {
      [`typing.${currentUser?.uid}`]: true,
    });
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    typingTimeout = setTimeout(async () => {
      await updateDoc(doc(db, "chats", data.chatId), {
        [`typing.${currentUser?.uid}`]: false,
      });
      typingTimeout = null;
    }, 500);
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (inputText || attachment)) {
      handleSend();
    }
  };
  const [like, setLike] = useState<string>("👍");
  const [likeClicked, setLikeClicked] = useState<boolean>(false);
  const handleSend = async () => {
    if (attachment) {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, attachment);

      let isUploadCompleted = false;

      uploadTask.on(
        "state_changed",
        (snapshot: {
          bytesTransferred: number;
          totalBytes: number;
          state: any;
        }) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          toast.promise(new Promise((resolve) => resolve("resolve")), {
            loading: "Upload is " + progress + "% done",
            success: "Done!",
            error: "Something wrong",
          });
        },
        (error: any) => {
          toast.error(error);
        },
        () => {
          if (!isUploadCompleted) {
            isUploadCompleted = true;
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                await updateDoc(doc(db, "chats", data.chatId), {
                  messages: arrayUnion({
                    id: uuid(),
                    text: inputText,
                    sender: currentUser?.uid,
                    date: Timestamp.now(),
                    read: false,
                    img: downloadURL,
                  }),
                });
              }
            );
          }
        }
      );
    } else if (!inputText.startsWith(" ") || likeClicked) {
      if (replyMessage) {
        const docRef = doc(db, "chats", data.chatId);

        const newMessage = {
          id: uuid(),
          text: inputText || like,
          sender: currentUser?.uid,
          date: Timestamp.now(),
          read: false,
          delete: false,
          reply: {
            content: replyMessage,
            isImage: replyMessageImage ? true : false,
          },
        };

        await updateDoc(docRef, {
          messages: arrayUnion(newMessage),
        });
      } else {
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text: inputText || like,
            sender: currentUser?.uid,
            date: Timestamp.now(),
            read: false,
            delete: false,
          }),
        });
      }
    }
    if (!inputText.startsWith(" ") || likeClicked) {
      let msg = { text: inputText || like, img: false };
      if (attachment) {
        msg.img = true;
      }
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
          [data.chatId + ".chatDeleted"]: deleteField(),
        });
      }
    }

    setInputText("");
    setAttachment(null);
    setAttachmentPreview(null);
    setReplyMessage(null);
    setReplyMessageImage(false);
    setLike("");
    setLikeClicked(false);
  };
  const theme = changeTheme();
  return (
    <div className="flex items-center gap-2 grow">
      <input
        type="text"
        className={`grow w-full outline-0 px-2 py-2 ${
          theme.isDarkTheme ? "text-white " : "text-black"
        }  bg-transparent placeholder:text-c3 outline-none text-base`}
        placeholder="Type a message"
        value={inputText}
        onChange={handleTyping}
        onKeyUp={onKeyUp}
      />
      {inputText.length === 0 ? (
        <button
          className={`h-10 w-10 rounded-xl shrink-0 flex justify-center items-center ${
            inputText.trim().length > 0 ? "bg-c4" : ""
          }`}
          onClick={async () => {
            setLikeClicked(true);
            if (likeClicked) handleSend();
          }}
        >
          👍
        </button>
      ) : (
        <button
          className={`h-10 w-10 rounded-xl shrink-0 flex justify-center items-center ${
            inputText.trim().length > 0 ? "bg-c4" : ""
          }`}
          onClick={handleSend}
        >
          <TbSend
            size={20}
            className={`${theme.isDarkTheme ? "text-white" : "text-black"}`}
          />
        </button>
      )}
    </div>
  );
};
export default Composebar;
