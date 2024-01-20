/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import { IoLogoGoogle, IoLogoFacebook } from "react-icons/io";
import * as Yup from "yup";
import { useFormik } from "formik";
import Link from "next/link";
import {auth} from '@/firebase/firebase'
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/context/authContext";
import {useRouter} from "next/navigation"
import {AiFillEyeInvisible,AiFillEye} from 'react-icons/ai'
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, FacebookAuthProvider, sendPasswordResetEmail} from "firebase/auth";
import toast,{Toaster} from 'react-hot-toast';
const gProvider = new GoogleAuthProvider()
const fProvider = new FacebookAuthProvider()
const LoginPage = () => {  
  const router = useRouter()
  const [isLoginRequest, setIsLoginRequest] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [showPassword,setShowPassword] = useState<Boolean>(false)
  const { currentUser, isLoading } = useAuth();
  useEffect(()=>{
    if(!isLoading && currentUser){
      router.push("/")
    }
  },[currentUser,isLoading])
  const signinForm = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Please Enter Your Email"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Please enter password"),
    }),
    onSubmit: async (values) => {
      setErrorMessage(undefined);
      setIsLoginRequest(true);
      try {
        await signInWithEmailAndPassword(auth,values?.email,values?.password)
        toast.success("Login Success")
      } catch (error) {
        if(typeof error === 'object' && error !== null && 'code' in error){
          const errorMessage = (error as { code: string }).code
          .toString()
          .replace('auth/', '')
          .replace(/-/g, ' ');
          toast.error(errorMessage);
        }
      }
    },
  });
  const signInFacebook = async () => {
    try {
      await signInWithPopup(auth,fProvider)
      toast.success("Login Success")
    } catch (error) {
       if(typeof error === 'object' && error !== null && 'code' in error){
          const errorMessage = (error as { code: string }).code
          .toString()
          .replace('auth/', '')
          .replace(/-/g, ' ');
          toast.error(errorMessage);
        }
    }

  }
  const signInGoogle = async () => {
    try {
      await signInWithPopup(auth,gProvider)
      toast.success("Login Success")
    } catch (error) {
       if(typeof error === 'object' && error !== null && 'code' in error){
          let errorMessage = (error as { code: string }).code
          .toString()
          .replace('auth/', '')
          .replace(/-/g, ' ')
          toast.error(errorMessage);
        }
    }
  }
  console.log(currentUser)
  return isLoading || (!isLoading && currentUser) ? <div>Loading..
    
  </div> : (
    <div className="h-full min-h-screen flex justify-center items-center bg-c1">
      <Toaster/>
      <div className="flex items-center flex-col w-[600px]">
        <div className="text-center">
          <div className="text-4xl font-bold">Login to Your Account</div>
          <div className="mt-3 text-c3">
            Connect and chat with anyone, anywhere
          </div>
        </div>
        <div className="flex md:flex-row flex-col items-center gap-2 w-full mt-10 mb-5">
          <div onClick={signInGoogle} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[73.5%] md:w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
            <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md">
              <IoLogoGoogle size={24} />
              <span>Login with Google</span>
            </div>
          </div>
          <div onClick={signInFacebook} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[73.5%] md:w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
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
          onSubmit={signinForm.handleSubmit}
          className="flex flex-col items-center gap-3 w-[80%] md:px-0 px-5 md:w-[600px] mt-5"
        >
          <input
            type="email"
            placeholder="Email Address"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
            autoComplete="off"
            name="email"
            value={signinForm.values.email}
            onChange={signinForm.handleChange}
            onBlur={signinForm.handleBlur}
          />
          {signinForm.touched.email && signinForm.errors.email ? (
            <div className="text-red-500 w-full text-left ml-3">{signinForm.errors.email}</div>
          ) : null}
       <div className="relative w-full bg-c5 rounded-xl outline-none border-none px-5 text-c3">
            <input
              type={showPassword?"text":"password"}
              placeholder="Password"
              className="w-[90%] h-14 outline-none bg-transparent"
              autoComplete="off"
              name="password"
              value={signinForm.values.password}
              onChange={signinForm.handleChange}
              onBlur={signinForm.handleBlur}
            />
            {/* <button className="absolute right-5 top-[50%] translate-y-[-50%]">
              {showPassword ? <AiFillEye size={24} onClick={()=>setShowPassword(!showPassword)}/> : <AiFillEyeInvisible size={24} onClick={()=>setShowPassword(!showPassword)}/>}
            </button> */}
            {showPassword ? <div className="absolute cursor-pointer right-5 top-[50%] translate-y-[-50%]">
              <AiFillEye size={24} onClick={()=>setShowPassword(!showPassword)}/>
            </div> : <div className="absolute cursor-pointer right-5 top-[50%] translate-y-[-50%]">
              <AiFillEyeInvisible size={24} onClick={()=>setShowPassword(!showPassword)}/>
            </div>}
       </div>
          {signinForm.touched.password && signinForm.errors.password ? (
            <div className="text-red-500 w-full text-left ml-3">{signinForm.errors.password}</div>
          ) : null}
          <div onClick={()=>router.push("/forgotpassword")} className="text-right w-full">
            <span className="cursor-pointer text-c3 hover:text-white">Forgot Password ?</span>
          </div>
           <button className="mt-4  w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" type="submit">Login to Your Account</button>
        </form>
        <div className="flex justify-center gap-1 text-c3 mt-5">
            <span>Not a member yet ?</span>
            <Link className="underline-offset-2 font-semibold cursor-pointer text-white" href="/register">Join Now</Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
