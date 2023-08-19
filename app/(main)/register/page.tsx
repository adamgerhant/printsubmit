'use client'
import React, { useEffect, useState } from "react";
import {signInAnonymously, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import auth from "@/app/firebase";
import Link from "next/link.js";
import { useRouter } from "next/navigation";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Error");
  const [pressed, setPressed] = useState(false)
  const [hideIcon1, setHideIcon1] = useState(true)
  const [hideIcon2, setHideIcon2] = useState(true)
  const router = useRouter()
  function assertIsFormFieldElement(element: Element): asserts element is HTMLInputElement {
    if (!("value" in element)) {
        throw new Error(`Element is not a form field element`);
    }
  }
  

  const provider = new GoogleAuthProvider();
  const signInWithGoogle = () => {router.push("/submissions");signInWithRedirect(auth, provider)}
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    assertIsFormFieldElement(e.currentTarget[0]);
    assertIsFormFieldElement(e.currentTarget[1]);
    assertIsFormFieldElement(e.currentTarget[2]);
    const email = e.currentTarget[0].value;
    const password = e.currentTarget[1].value;
    const confirmPassword = e.currentTarget[2].value;

    if(password!=confirmPassword){
      setErr(true);
      setErrorMessage("Passwords do not match")
    }
    else{
      try {
        console.log("creating user")
        const res = await createUserWithEmailAndPassword(auth, email, password)
        console.log(res)
        router.push("/submissions")
      } 
      catch (err:any) {
        setErr(true);
        setLoading(false);
        console.log("-------error:"+err.code+err);

        if(err.code === "auth/email-already-in-use"){
          setErrorMessage("An account with this email has already been created");
        }
        if(err.code === "auth/weak-password"){
          setErrorMessage("Password must be at least 6 characters long");
        }
      }
    }
    
  };
  const continueAsGuest=()=>{
    console.log("signing in anonymously")

    signInAnonymously(auth).then(()=>{
        console.log("signed in anonymously")
        router.push("/submissions")
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
  }
  
  return (
    <div className="formContainer">
      <div className="loginDiv" style={{height:"570px"}}>

        <div className="formWrapper">
          <span className="label">Create Account</span>
          <form onSubmit={(e)=>handleSubmit(e)}>
            <input required type="email" placeholder="email" />
            <input required type={hideIcon1? "password": "text"} placeholder="password" />
            <img src={hideIcon1? "./passwordHideIcon.PNG" : "./passwordShowIcon.PNG"} onClick={()=>setHideIcon1(!hideIcon1)} className="hideIcon1"/>
            <input required type={hideIcon2? "password": "text"} placeholder="confirm password" />
            <img src={hideIcon2? "./passwordHideIcon.PNG" : "./passwordShowIcon.PNG"} onClick={()=>setHideIcon2(!hideIcon2)} className="hideIcon2"/>
            <button disabled={loading}>Create Account</button>
            {err && <span className="errorCode">{errorMessage}</span>}
          </form>
          <p style={{marginTop:"15px"}}>Already have an account? <Link href="/login">Sign in</Link></p>
          {//pressed?<img style={{cursor:"pointer", marginTop:"20px"}} src={googleButtonFocus}/>:<img style={{cursor:"pointer", marginTop:"20px"}} onClick={()=>{signInWithGoogle();setPressed(true)}} src={googleButton}/>=
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
    </div>
  );
  
};

export default Register;
