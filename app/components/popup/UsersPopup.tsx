import React from 'react';
import PopupWrapper from './PopupWrapper';
import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext';
import Avatar from '../Avatar';
import { deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import SearchUser from '../SearchUser';
import changeTheme from '@/app/hooks/useTheme';

type User = {
  id: string;
  displayName: string;
  email:string
  
};

type UsersPopupProps = {
  onHide: () => void;
  title: string;
  className?: string;
};

const UsersPopup: React.FC<UsersPopupProps> = ({ onHide, title, className }) => {
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
        dispatch({type:"CHANGE_USER",payload:user});
        onHide()
      }else if(currentUser) {
    
      }

    } catch (error) {
      console.log(error)
    }
  }

  const theme = changeTheme()
  return (
    <PopupWrapper className={className} title={title} onHide={onHide} height='min-h-[600px]'>
      <SearchUser onHide={onHide}/>
      <div className='mt-5 flex flex-col gap-2 grow relative overflow-auto scrollbar'>
        <div className='absolute w-full'>
          {users &&
            (Object.entries(users) as [string, User][]).map(([userId, user]) => {
              return (
                <div
                  className={`flex items-center gap-4 rounded-xl ${theme.isDarkTheme? "hover:bg-c5" : "hover:bg-white/[0.3]"}  py-2 px-4 cursor-pointer`}
                  onClick={()=>{handleSelectUser(user)}}
                  key={userId}
                >
                  <Avatar size='large' user={user} />
                  <div className='flex flex-col gap-1 grow'>
                    <span className={`text-base ${theme.isDarkTheme?"text-white":"text-black"} flex items-center justify-between`}>
                      <div>{user?.displayName}</div>
                    </span>
                    <p className='text-sm text-c3'>{user?.email}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </PopupWrapper>
  );
};

export default UsersPopup;
