'use client'
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { UserContext, User, FirebaseContext, SubmissionData, SubmissionForm, CancelRequests, Settings, EmailData} from "@/@types/user";
import { getAuth, signOut } from "firebase/auth";
import auth, { db } from "@/app/firebase";
import logo from "@/public/Logo.svg"
import {BsArrowRight} from "react-icons/bs"
import Link from "next/link";
import { createCheckoutSession } from "@/stripe/createCheckoutSession";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";


const confirmation = ()=>{



    return(
        <div className="w-full h-[90vh] flex flex-row justify-center items-center">

                <div className="border rounded p-10">
                    <a href="/" className="font-bold text-[35px] py-1 whitespace-nowrap flex flex-row
                        align-center mt-1">
                            <img src={logo.src} className="w-[60px] mt-[-2px] mr-1"/>
                            Print Submit
                    </a>
                    <span className="cursor-default bg-violet-200 text-violet-800 font-bold p-1 px-2 rounded text-lg">
                        Premium
                    </span>
                    
                    <p className="mt-6 text-2xl text-center">
                        Purchase complete
                    </p>
                    <p className="mt-2 text-lg text-center">
                        It may take a few minutes for your account type to update.
                    </p>
                    <div className="w-full flex flex-row justify-center">
                        <a href="/submissions" className="font-semibold text-center py-2 px-4 mt-14 bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-md cursor-pointer">
                            Go to Dashboard
                        </a>
                    </div>
                    


                </div>
              
        </div>
    )
}

export default confirmation