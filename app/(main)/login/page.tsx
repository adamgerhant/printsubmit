'use client'
import React, { useEffect, useState } from "react";
import {signInWithEmailAndPassword, signInAnonymously, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import auth from "@/app/firebase";
import Link from "next/link.js";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../layout";
import { UserContext } from "@/@types/user";

const Login = () => {
    const [err, setErr] = useState(false);
    const [pressed, setPressed] = useState(false)
    const router = useRouter()

    const {currentUser} = useAuthContext() as UserContext;
    const provider = new GoogleAuthProvider();

    const signInWithGoogle = () => {router.push("/submissions");signInWithRedirect(auth, provider)}

    function assertIsFormFieldElement(element: Element): asserts element is HTMLInputElement {
        if (!("value" in element)) {
            throw new Error(`Element is not a form field element`);
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        assertIsFormFieldElement(e.currentTarget[0]);
        assertIsFormFieldElement(e.currentTarget[1]);
        const email = e.currentTarget[0].value;
        const password = e.currentTarget[1].value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            //router.push("/submissions")
        } catch (err) {
            setErr(true);
        }
    };
    const continueAsGuest=()=>{
        signInAnonymously(auth).then(()=>{
            //router.push("/submissions")
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
    }

    return (
        

        <div className="formContainer">
            {!currentUser.uid&&!currentUser.email&&
            <div className="loginDiv">
            <div className="formWrapper">

                <p className="label">Sign in</p>
                
                <form onSubmit={(e)=>handleSubmit(e)}>
                <input type="email" placeholder="email" />
                <input type="password" placeholder="password"/>
                <div className="resetPasswordDiv">
                    <Link href="/resetPassword" className="resetPassword">forgot password?</Link>
                </div>
                <button>Sign in</button>
                {err && <span className="errorCode">Incorrect username or password</span>}
                </form>
                <p style={{marginTop:"15px"}}>Don&apos;t have an account? <Link href="/register">Create Account</Link></p>
                {//pressed?<img style={{cursor:"pointer", marginTop:"20px"}} src={googleButtonFocus}/>:<img style={{cursor:"pointer", marginTop:"20px"}} onClick={()=>{signInWithGoogle();setPressed(true)}} src={googleButton}/>
                }
            <div className="lineBreakDiv">
                <div className="lineBreak"/>
                or
                <div className="lineBreak"/>
            </div>
            <div className="googleButton" style={{backgroundColor: pressed?"#f1f1f1":"#ffffff"}}onClick={()=>{signInWithGoogle();setPressed(true)}}>
            <img
                src={'/g-logo.png'}
                alt="Google logo"
            />
                Sign in with Google
            </div>
            <div className="guestButton" onClick={()=>continueAsGuest()}>
                Continue as guest
            </div>

            
            </div>
            </div>
            
            }
        </div>
        
    );

};

export default Login;
