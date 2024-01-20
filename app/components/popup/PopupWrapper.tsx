import React from "react";
import Icon from "../Icon";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";
import changeTheme from "@/app/hooks/useTheme";

type PopupWrapperProps = {
  children: React.ReactNode;
  title: String;
  height?:string;
  onHide: () => void;
  className?: string;
};

const PopupWrapper: React.FC<PopupWrapperProps> = ({
  children,
  title,
  height,
  onHide,
}) => {
  const container = {
    
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
    hiddenAfter: { opacity: 0 },
  };
  const glass = {
    hidden: {
      opacity: 0,
      scale: 0.98,
    },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "smooth" },
    },
  };
  const popup = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "smooth", duration: 0.4 },
    },
  };
  const theme = changeTheme()
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={container}
      className="fixed top-0 left-0 z-20 w-full h-full flex items-center justify-center"
    >
      <motion.div
        onClick={() => {
          onHide();
        }}
        variants={glass}
        className="w-full h-full absolute glass-effect"
      ></motion.div>
      <motion.div
        variants={popup}
        onClick={(e)=>{e.preventDefault()}}
        className={`flex flex-col w-[500px] max-h-[80%]  ${height} ${theme.isDarkTheme ? "bg-c2" : "bg-white"}  relative z-10 rounded-3xl`}
      >
        <div className="shrink-0 p-6 flex items-center justify-between">
          <div className={`text-lg ${theme.isDarkTheme ? "text-white":"text-black"} font-semibold`}> {title} </div>
          <Icon
            size="small"
            className={`${theme.isDarkTheme?"text-white":"text-black"} ${theme.isDarkTheme?"hover:bg-black":"hover:bg-white"}`}
            icon={<IoClose size={20} />}
            onClick={() => {
              onHide();
            }}
          />
        </div>
        <div className="grow flex flex-col p-6 pt-0">{children}</div>
      </motion.div>
    </motion.div>
  );
};
export default PopupWrapper;
