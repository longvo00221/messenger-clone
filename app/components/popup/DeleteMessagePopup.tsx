import React from "react";
import PopupWrapper from "./PopupWrapper";



import { RiErrorWarningLine } from "react-icons/ri";
import { useAuth } from "@/context/authContext";
import changeTheme from "@/app/hooks/useTheme";
type DeleteMessagePopupProps = {
  props: {
    sender: string;
  };
  onHide: () => void;
};

const DeleteMessagePopup: React.FC<DeleteMessagePopupProps> = ({
  onHide,
  props,
}) => {
  const { currentUser } = useAuth();

  const self = currentUser && props?.sender === currentUser.uid;
  const theme = changeTheme();
  return (
    <PopupWrapper title="Delete Message" className="" onHide={onHide}>
      <div className="mt-10 mb-5">
        <div className="flex items-center justify-center gap-3">
          <RiErrorWarningLine size={24} className="text-red-500" />
          <div
            className={`text-lg ${
              theme.isDarkTheme ? "text-white" : "text-black"
            }`}
          >
            Are you sure, you want to delete message?
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-10">
          <button
            onClick={() => {
              onHide;
              return true;
            }}
            className="border-[2px] border-red-700 py-2 px-4 text-sm rounded-md text-red-500 hover:bg-red-700 duration-layout hover:text-white"
          >
            Delete
          </button>

          <button
            onClick={onHide}
            className={`border-[2px] py-2 px-4 text-sm rounded-m duration-layout ${
              theme.isDarkTheme
                ? "text-white border-white  hover:bg-white hover:text-black"
                : "text-black border-black hover:bg-black hover:text-white"
            } `}
          >
            Cancel
          </button>
        </div>
      </div>
    </PopupWrapper>
  );
};
export default DeleteMessagePopup;
