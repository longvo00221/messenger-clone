import React from "react";
import ChatContentHeader from "./ChatContentHeader";
import UserMessage from "./UserMessage";
import { useChatContext } from "@/context/chatContext";
import ChatContentFooter from "./ChatContentFooter";
import { useAuth } from "@/context/authContext";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import changeTheme from "../hooks/useTheme";

type ChatContentProps = {};

const ChatContent: React.FC<ChatContentProps> = () => {
  const { data, users } = useChatContext();
  const { currentUser } = useAuth();
  const isUserBlocked =
    currentUser &&
    users[currentUser.uid]?.blockedUsers?.find((u: any) => u === data.user.uid);
  const IamBlocked = users[data.user.uid]?.blockedUsers?.find(
    (u: string) => currentUser && u === currentUser.uid
  );
  const handleBlockUser = async (action: String) => {
    if (action === "UNBLOCK" && currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), {
        blockedUsers: arrayRemove(data.user.uid),
      });
    }
  };
  const theme = changeTheme()
  return (
    <div className="flex flex-col  grow">
      <ChatContentHeader />
      {data.chatId && <UserMessage />}
      {!isUserBlocked && !IamBlocked && <ChatContentFooter />}
      {isUserBlocked && (
        <div className={`w-full flex flex-col justify-center items-center ${theme.isDarkTheme && 'glass'} `}>
          <div className={`w-full text-center ${theme.isDarkTheme? 'text-c3' : 'text-black'}  py-5`}>
            This user has been Blocked
          </div>
          <button
            onClick={() => handleBlockUser("UNBLOCK")}
            className="w-[250px] mb-5 hover:bg-[#edecec] hover:scale-105 transition text-center rounded-md bg-[#e2e2e2] text-black py-4 px-2"
          >
            Unblock this user
          </button>
        </div>
      )}
      {IamBlocked && <div className={`w-full text-center ${theme.isDarkTheme ? 'text-c3':'text-black'} py-5`}>
        {`${data.user.displayName} has blocked you`}</div>}
    </div>
  );
};
export default ChatContent;
