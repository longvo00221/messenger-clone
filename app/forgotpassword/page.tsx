'use client'
import React, { useState } from 'react';
import * as Yup from "yup";
import { useFormik } from "formik";
import Link from "next/link";
import {auth} from '@/firebase/firebase'
import { sendPasswordResetEmail} from "firebase/auth";
import  toast,{Toaster} from 'react-hot-toast';
import { useRouter } from 'next/navigation';
const ForgotPassword= () => {
    const [isForgotRequest,setIsForgotRequest] = useState<Boolean>(false)
    const router = useRouter()
    const forgotForm = useFormik({
        initialValues:{
            email:"",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Please enter your email address")
        }),
        onSubmit: async () => {
            setIsForgotRequest(true)
            try {
              toast.loading("Sending...")
              await sendPasswordResetEmail(auth,forgotForm.values.email)
              toast.success("Send email success")
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
    })

    return (
        <div className="h-[100vh] flex justify-center items-center bg-c1">
          <Toaster/>
        <div className="flex items-center flex-col w-[600px]">
          <div className="text-center">
            <div className="text-4xl font-bold">Forgot Your Account</div>
            <div className="mt-3 text-c3">
              Enter your email address below to recovery your account
            </div>
          </div>
        
          <form
            onSubmit={forgotForm.handleSubmit}
            className="flex flex-col items-center gap-3 w-[80%] md:px-0 px-5 md:w-[600px] mt-5"
          >
            <input
              type="email"
              placeholder="Email Address"
              className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
              autoComplete="off"
              name="email"
              value={forgotForm.values.email}
              onChange={forgotForm.handleChange}
              onBlur={forgotForm.handleBlur}
            />
            {forgotForm.touched.email && forgotForm.errors.email ? (
              <div className="text-red-500 w-full text-left ml-3">{forgotForm.errors.email}</div>
            ) : null}
         
            <div onClick={()=>router.push("/login")} className="text-left w-full mt-4 mb-3">
              <span className="cursor-pointer text-c3  hover:text-white">Login</span>
            </div>
             <button className="w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" type="submit">Send Email</button>
          </form>
        </div>
      </div>
    )
}
export default ForgotPassword;