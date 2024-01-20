import React from "react";
import Avatar from "./Avatar";
import changeTheme from "../hooks/useTheme";

type UserSearchItemProps = {
  user: any;
  handleLogic: any;
};

const UserSearchItem: React.FC<UserSearchItemProps> = ({
  user,
  handleLogic,
}) => {
  const theme = changeTheme();

  return (
    <>
      <div
        className="flex items-center gap-4 rounded-xl hover:bg-c5 py-2 px-4 cursor-pointer"
        onClick={() => { handleLogic(user) }}
      >
        <Avatar size="large" user={user} />
        <div className="flex flex-col gap-1 grow">
          <span className="text-base text-white flex items-center justify-between">
            <div>{user.displayName}</div>
          </span>
          <p className="text-sm text-c3">{user?.email}</p>
        </div>
      </div>
      <div
        className={`w-full h-[1px] ${
          theme.isDarkTheme ? "bg-white/[0.1]" : "bg-black/10"
        }  mt-5`}
      ></div>
    </>
  );
};

export default UserSearchItem;
