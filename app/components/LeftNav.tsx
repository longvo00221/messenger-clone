"use client";
import React, { useState } from "react";
import { BiCheck, BiEdit } from "react-icons/bi";
import Avatar from "./Avatar";
import { UserProfile, useAuth } from "@/context/authContext";
import { FiPlus } from "react-icons/fi";
import { IoClose, IoLogOutOutline } from "react-icons/io5";
import { MdPhotoCamera, MdAddAPhoto, MdDeleteForever } from "react-icons/md";
import { BsFillCheckCircleFill } from "react-icons/bs";
import Icon from "./Icon";
import { profileColors } from "@/utils/contants";
import { collection, doc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "@/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { Toaster, toast } from "react-hot-toast";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { CiDark, CiLight } from "react-icons/ci";
import changeTheme from "../hooks/useTheme";
import UsersPopup from "./popup/UsersPopup";

type LeftNavProps = {};
const LeftNav: React.FC<LeftNavProps> = () => {
  const [userPopup, setUserPopup] = useState<Boolean>(false);
  const { currentUser, signOutUser, setCurrentUser } = useAuth();
  const [editProfile, setEditProfile] = useState<Boolean>(false);
  const [nameEdited, setNameEdited] = useState<Boolean>(false);
  const authUser = auth?.currentUser;
  const theme = changeTheme();

  const onkeyup = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.innerText.trim() !== currentUser?.displayName) {
      setNameEdited(true);
    } else {
      setNameEdited(false);
    }
  };
  const onkeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  const uploadImageToFireStore = (file: File) => {
    try {
     if(file){
      const storageRef = ref(storage, currentUser?.displayName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      let isUploadCompleted = false; // Flag to track if upload is completed

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
            isUploadCompleted = true; // Set the flag to indicate upload is completed
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                handleUpdateProfile("photo", downloadURL);
              }
            );
          }
        }
      );
     }
    } catch (error) {
      console.log(error);
    }
  };

  
  const handleUpdateProfile = (type: string, value: any) => {
    let obj = { ...currentUser };
    switch (type) {
      case "color":
        obj.color = value;
        break;
      case "name":
        obj.displayName = value;
        break;
      case "photo":
        obj.photoURL = value;
        break;
      case "Remove Photo":
        obj.photoURL = null;
        break;
      default:
        break;
    }
    try {
      toast.promise(
        new Promise(async (resolve) => {
          const userId = currentUser?.uid;

          if (userId) {
            const userDocRef = doc(db, "users", userId);

            if (type === "color") {
              obj.color = value;
              await updateDoc(userDocRef, { color: obj?.color });
            } else if (type === "name") {
              obj.displayName = value;
              await updateDoc(userDocRef, { displayName: obj?.displayName });
            } else if (type === "photo") {
              obj.photoURL = value;
              await updateDoc(userDocRef, { photoURL: obj?.photoURL });
            } else if (type === "Remove Photo") {
              obj.photoURL = null;
              await updateDoc(userDocRef, { photoURL: obj?.photoURL });
            }
            setCurrentUser(obj as UserProfile);
          }

          resolve("success");
        }),
        {
          loading: "Updating...",
          success: `Updated ${type} successfully`,
          error: "Failed to update",
        }
      );
    } catch (error) {
      console.log(error);
    }
  };
  const editProfileContainer = () => {
    return (
      <div className="relative flex flex-col items-center">
        <Icon
          size="small"
          className={`${
            theme.isDarkTheme ? "text-white" : "text-black"
          } absolute top-0 right-5 hover:bg-c2`}
          icon={<IoClose size={20} />}
          onClick={() => setEditProfile(false)}
        />
        <Toaster />
        <div className="relative group cursor-pointer">
          <Avatar size="xx-large" user={currentUser} />
          <div className="w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center flex opacity-0 hover:opacity-100 transition-opacity duration-150 ease-in">
            <label className="cursor-pointer" htmlFor="fileUpload">
              {currentUser?.photoURL ? (
                <MdPhotoCamera size={30} />
              ) : (
                <MdAddAPhoto size={30} />
              )}
            </label>
            <input
              id="fileUpload"
              className="hidden"
              type="file"
              name="avatar"
              onChange={(e) => {
                const selectedFile = e?.target?.files?.[0];
                if (selectedFile) {
                  uploadImageToFireStore(selectedFile);
                }
              }}
            />
          </div>
          {currentUser?.photoURL && (
            <div
              onClick={() => handleUpdateProfile("Remove Photo", null)}
              className="w-6 h-6 rounded-full bg-red-500 flex justify-center items-center absolute right-0 bottom-0"
            >
              <MdDeleteForever size={14} />
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-col items-center">
          <div className="flex items-center gap-2">
            {!nameEdited && <BiEdit className="text-c3" />}
            {nameEdited && (
              <BsFillCheckCircleFill
                className="text-c4 cursor-pointer"
                onClick={() => {
                  handleUpdateProfile(
                    "name",
                    document.getElementById("displayNameEdit")?.innerText
                  );
                }}
              />
            )}
            <div
              contentEditable
              className={`${
                theme.isDarkTheme ? "text-white" : "text-black"
              } bg-transparent outline-none border-none text-center`}
              id="displayNameEdit"
              onKeyUp={onkeyup}
              onKeyDown={onkeydown}
            >
              {currentUser?.displayName}
            </div>
          </div>
          <span
            className={`${theme.isDarkTheme ? "text-c3" : "text-c2"}  text-sm`}
          >
            {currentUser?.email}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-5">
          {profileColors.map((color, index) => (
            <span
              style={{ backgroundColor: color }}
              key={index}
              onClick={() => handleUpdateProfile("color", color)}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
            >
              {color === currentUser?.color && <BiCheck size={24} />}
            </span>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div
      className={`
    ${editProfile ? "w-[350px]" : "w-[80px] items-center"}
     h-full  flex flex-col justify-between py-5 shrink-0 transition-all ease-in duration-200`}
    >
      {editProfile ? (
        editProfileContainer()
      ) : (
        <div
          onClick={() => setEditProfile(true)}
          className="relative group cursor-pointer"
        >
          <Avatar size="large" user={currentUser} />
          <div className="w-full ease-in duration-150 h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center opacity-0 flex  transition-all hover:opacity-100">
            <BiEdit size={14} />
          </div>
        </div>
      )}

      <div
        className={`flex transition-all gap-5 ${
          editProfile ? "justify-around w-full" : "flex-col  items-center"
        }`}
      >
        <Icon
          size="large"
          className="bg-black transition-colors ease-in duration-150 hover:bg-gray-600"
          icon={<FiPlus size={24} />}
          onClick={() => {setUserPopup(!userPopup)}}
        />
        {theme.isDarkTheme ? (
          <Icon
            size="large"
            className="bg-black text-white transition-colors ease-in duration-150"
            icon={<CiDark size={24} />}
            onClick={() => {
              theme.changeLight();
            }}
          />
        ) : (
          <Icon
            size="large"
            className="bg-white text-black transition-colors ease-in duration-150 hover:bg-gray-200"
            icon={<CiLight size={24} />}
            onClick={() => {
              theme.changeDark();
            }}
          />
        )}
        <Icon
          size="large"
          className={`${
            theme.isDarkTheme ? "text-white" : "text-black"
          }  hover:bg-c2`}
          icon={<IoLogOutOutline size={24} />}
          onClick={signOutUser}
        />
      </div>
      {userPopup && <UsersPopup onHide={()=>setUserPopup(false)} title="Find Users"/>}
    </div>
  );
};
export default LeftNav;
