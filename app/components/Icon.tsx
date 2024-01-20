import React from "react";
import changeTheme from "../hooks/useTheme";

type IconProps = {
  size: string;
  icon: JSX.Element;
  onClick: () => void;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ size, icon, onClick, className }) => {
  const c =
    size === "small"
      ? "w-8 h-8"
      : size === "medium"
      ? "w-9 h-9"
      : size === "large"
      ? "w-10 h-10"
      : "w-12 h-12";
  const theme = changeTheme();
  return (
    <div
      className={`${c} ${className} rounded-full flex items-center justify-center ${
        theme.isDarkTheme ? "hover:bg-c1 text-white" : "hover:bg-gray-300"
      }  cursor-pointer ${className}`}
      onClick={onClick}
    >
      {icon && icon}
    </div>
  );
};
export default Icon;
