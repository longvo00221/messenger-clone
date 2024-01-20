"use client";
import React, { useState } from "react";
import { IoLogoGoogle, IoLogoFacebook } from "react-icons/io";
import * as Yup from "yup";
import { useFormik } from "formik";
import Link from "next/link";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import {
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import toast, { Toaster } from 'react-hot-toast';
import { auth, db } from "@/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { profileColors } from "@/utils/contants";
import { useRouter } from "next/navigation";
const gProvider = new GoogleAuthProvider();
const fProvider = new FacebookAuthProvider();
const RegisterPage = () => {
  const [isLoginRequest, setIsLoginRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [showPassword, setShowPassword] = useState<Boolean>(false);
  const [showConfirmPassword, setConfirmShowPassword] =
    useState<Boolean>(false);
  const router = useRouter();
  const signupForm = useFormik({
    initialValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Please Enter Your Email"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Please enter password"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Comfirm password not match")
        .required("Please enter confirm password"),
      displayName: Yup.string()
        .min(3, "Display name must be greater than 3")
        .required("Please tell us your name"),
    }),
    onSubmit: async (values) => {
      setErrorMessage(undefined);
      setIsLoginRequest(true);
      const colorIndex = Math.floor(Math.random() * profileColors.length);
      const displayName = signupForm.values.displayName;
      const email = signupForm.values.email;
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          signupForm.values.email,
          signupForm.values.password
        );
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName,
          email,
          color: profileColors[colorIndex],
        });
        await setDoc(doc(db, "userChats", user.uid), {});
        await updateProfile(user, {
          displayName,
        });
        toast.success("Signup success");
        router.push("/");
      } catch (error) {
        if(typeof error === 'object' && error !== null && 'code' in error){
          let errorMessage = (error as { code: string }).code
          .toString()
          .replace('auth/', '')
          .replace(/-/g, ' ')
          
          toast.error(errorMessage);
        }
      }
    },
  });
  return (
    <div className="h-full min-h-screen pb-5 flex justify-center items-center bg-c1">
           <Toaster/>
      <div className="flex items-center flex-col w-[600px]">
        <div className="text-center">
          <div className="text-4xl font-bold">Create New Account</div>
          <div className="mt-3 text-c3">
            Connect and chat with anyone, anywhere
          </div>
        </div>
        <div className="flex md:flex-row flex-col items-center gap-2 w-full mt-10 mb-5">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[73.5%] md:w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
            <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md">
              <IoLogoGoogle size={24} />
              <span>Login with Google</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[73.5%] md:w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
            <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md">
              <IoLogoFacebook size={24} />
              <span>Login with Facebook</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-5 h-[1px] bg-c3"></span>
          <span className="text-c3 font-semibold">OR</span>
          <span className="w-5 h-[1px] bg-c3"></span>
        </div>
        <form
          onSubmit={signupForm.handleSubmit}
          className="flex flex-col items-center gap-3 w-[80%] md:px-0 px-5 md:w-[600px] mt-5"
        >
          <input
            type="text"
            placeholder="Display name"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
            autoComplete="off"
            name="displayName"
            value={signupForm.values.displayName}
            onChange={signupForm.handleChange}
            onBlur={signupForm.handleBlur}
          />
          {signupForm.touched.displayName && signupForm.errors.displayName ? (
            <div className="text-red-500 w-full text-left ml-3">
              {signupForm.errors.displayName}
            </div>
          ) : null}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
            autoComplete="off"
            name="email"
            value={signupForm.values.email}
            onChange={signupForm.handleChange}
            onBlur={signupForm.handleBlur}
          />
          {signupForm.touched.email && signupForm.errors.email ? (
            <div className="text-red-500 w-full text-left ml-3">
              {signupForm.errors.email}
            </div>
          ) : null}
          <div className="relative w-full bg-c5 rounded-xl outline-none border-none px-5 text-c3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-[90%] h-14 outline-none bg-transparent"
              autoComplete="off"
              name="password"
              value={signupForm.values.password}
              onChange={signupForm.handleChange}
              onBlur={signupForm.handleBlur}
            />
            {showPassword ? (
              <div className="absolute right-5 cursor-pointer top-[50%] translate-y-[-50%]">
                <AiFillEye
                  size={24}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            ) : (
              <div className="absolute right-5 cursor-pointer top-[50%] translate-y-[-50%]">
                <AiFillEyeInvisible
                  size={24}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            )}
          </div>
          {signupForm.touched.password && signupForm.errors.password ? (
            <div className="text-red-500 w-full text-left ml-3">
              {signupForm.errors.password}
            </div>
          ) : null}
          <div className="relative w-full bg-c5 rounded-xl outline-none border-none px-5 text-c3">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Your Password"
              className="w-[90%] h-14 outline-none bg-transparent"
              autoComplete="off"
              name="confirmPassword"
              value={signupForm.values.confirmPassword}
              onChange={signupForm.handleChange}
              onBlur={signupForm.handleBlur}
            />
            <div className="absolute right-5 top-[50%] cursor-pointer translate-y-[-50%]">
              {showConfirmPassword ? (
                <AiFillEye
                  size={24}
                  onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                />
              ) : (
                <AiFillEyeInvisible
                  size={24}
                  onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                />
              )}
            </div>
          </div>
          {signupForm.touched.confirmPassword &&
          signupForm.errors.confirmPassword ? (
            <div className="text-red-500 w-full text-left ml-3">
              {signupForm.errors.confirmPassword}
            </div>
          ) : null}
          <button
            className="mt-4  w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            type="submit"
          >
            Sign up Your Account
          </button>
        </form>
        <div className="flex justify-center gap-1 text-c3 mt-5">
          <span className="text-c3 hover:text-white ">
            Already have account ?
          </span>
          <Link
            className="underline-offset-2 font-semibold cursor-pointer text-white"
            href="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
