"use client";
import { db } from "@/firebase/firebase";
import { collection, deleteField, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import React, { useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import Avatar from "./Avatar";
import { useAuth } from "@/context/authContext";
import { useChatContext } from "@/context/chatContext";
import changeTheme from "../hooks/useTheme";
import UserSearchItem from "./UserSearchItem";
type SearchUserProps = {
    onHide:()=>void
};
type User = {
  displayName: string;
  email: string;
};
const SearchUser: React.FC<SearchUserProps> = ({onHide}) => {
  const [username, setUsername] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState<boolean>(false);
  
  const { currentUser } = useAuth();
  const { users, dispatch } = useChatContext();

  const handleSelectUser = async (user:any) => {
    try {
      const combinedId = currentUser?.uid && user.uid
      ? currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid
      : ""
      const res = await getDoc(doc(db,"chats",combinedId))
      if(!res.exists() && currentUser){
        await setDoc(doc(db,'chats',combinedId),{
          messages:[]
        })
        
        const currentUserChatRef = await getDoc(
         
          doc(db,"userChats",currentUser.uid)
        )
        await updateDoc(doc(db,"userChats",currentUser.uid),{
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
            color: user.color
          },
          [combinedId + ".date"]: serverTimestamp()
        })
        if(!currentUserChatRef.exists() && user){
          await setDoc(doc(db,"userChats",user.uid),{})
        }
        await updateDoc(doc(db,"userChats",user.uid),{
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || null,
            color: currentUser.color
          },
          [combinedId + ".date"]: serverTimestamp()
        })
        setUser(null)
        setUsername("")
        dispatch({type:"CHANGE_USER",payload:user});
        onHide()
      }else if(currentUser) {
        await updateDoc(doc(db,'userChats',currentUser?.uid),{
          [combinedId + ".chatDeleted"]: deleteField(),
        })
      }

    } catch (error) {
      console.log(error)
    }
  }
  const onkeyup = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !!username) {
      try {
        setErr(false);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", username));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setErr(true);
          setUser(null);
        } else {
          querySnapshot.forEach((doc) => {
            const userData = doc.data() as unknown;
            setUser(userData as string | null);
          });
        }
      } catch (error) {
        console.log(error), setErr(true);
      }
    }
  };
  const theme = changeTheme()
  return (
    <div className="shrink-0">
      <div className="relative">
        <RiSearch2Line className="absolute top-4 left-4 text-c3" />
        <input
          type="text"
          placeholder="Search user"
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={onkeyup}
          value={username}
          autoFocus
          className={`w-full h-12 ${theme.isDarkTheme?"text-white":"text-black"} rounded-xl ${theme.isDarkTheme ? "bg-c1/[0.5]" : "bg-white/[0.8]"} shadow-md  pl-11 pr-16 ${theme.isDarkTheme ? "placeholder:text-c3": "placeholder:text-black"}  outline-none text-base`}
        />
        <span className="absolute top-[14px] right-4 text-sm text-c3 pointer-events-none cursor-none">
          Enter
        </span>
      </div>
      {err && (
      <>
        <div className="text-sm text-red-500 mt-2 w-full text-center">User not found</div>
        <div className={`w-full h-[1px] ${theme.isDarkTheme?"bg-white/[0.1]":"bg-black/10"} mt-5`}></div>
      </>
     )}
      {user && (
        <>
         
          <UserSearchItem user={user} handleLogic={handleSelectUser(user)}/>
        </>
      )}
    </div>
  );
};
export default SearchUser;
