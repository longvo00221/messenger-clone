/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/firebase/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile extends User {
  email: string;
  color: string;
  displayName: string;
  uid:string 
  isOnline:boolean;
}

interface UserContextProps {
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  signOutUser: () => void;
}

const UserContext = createContext<UserContextProps | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clear = async () => {
    try {
      if(currentUser){
        await updateDoc(doc(db,"users",currentUser?.uid),{
          isOnline:false
        })
      }
      setCurrentUser(null);
    setIsLoading(false);
    } catch (error) {
      console.log(error)
    }
    
  };

  const authStateChanged = async (user: User | null) => {
    setIsLoading(true);
    if (!user) {
      clear();
      return;
    }
    const userDocExist = await getDoc(doc(db,"users",user.uid))
    if(userDocExist.exists()){
      await updateDoc(doc(db,"users",user.uid),{
        isOnline:true
      })
    }
    const userDoc = await getDoc(doc(db, "users", user.uid));
    setCurrentUser({ ...user, ...userDoc.data() } as UserProfile);

    setIsLoading(false);
  };

  const signOutUser = () => {
    signOut(auth).then(() => clear());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authStateChanged);
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
        signOutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = (): UserContextProps => {
  const authContext = useContext(UserContext);
  if (!authContext) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return authContext;
};
