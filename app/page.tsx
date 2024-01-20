"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "./components/Loader";
import LeftNav from "./components/LeftNav";
import changeTheme from "./hooks/useTheme";
import ChatBox from "./components/ChatSide";
import ChatContent from "./components/ChatContent";
import { useChatContext } from "@/context/chatContext";
export default function Home() {
  const { currentUser, isLoading } = useAuth();
  const { data, selectedChat } = useChatContext();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoading]);
  const theme = changeTheme();

  return !currentUser ? (
    <Loader />
  ) : (
    <div
      className={`${
        theme.isDarkTheme ? "bg-c1" : "bg-gray-100"
      } duration-layout flex h-[100vh]`}
    >
      <div className="flex w-full h-full items-center shrink-0">
        <LeftNav />
        <div
          className={`flex ${
            theme.isDarkTheme ? "bg-c2" : "bg-white"
          } duration-layout  h-full grow`}
        >
          <div
            className={`w-[400px]  overflow-auto scrollbar shrink-0 border-r ${
              theme.isDarkTheme ? "border-white/[0.05]" : "border-gray-200"
            } `}
          >
            <div className="flex flex-col h-full">
              <ChatBox />
            </div>
          </div>
          {data?.user && <ChatContent />}
        </div>
      </div>
    </div>
  );
}
