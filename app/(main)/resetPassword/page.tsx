'use client'
import React, {useState} from "react";
import { getAuth } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link.js";

const ResetPassword = () =>{
    const [sent, setSent] = useState(false);
    const [emailState, setEmail] = useState("");
    const [error, setError] = useState("");
    function assertIsFormFieldElement(element: Element): asserts element is HTMLInputElement {
        if (!("value" in element)) {
            throw new Error(`Element is not a form field element`);
        }
      }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        assertIsFormFieldElement(e.currentTarget[0]);
        let email = e.currentTarget[0].value;
        setEmail(email)
        const auth = getAuth();
        sendPasswordResetEmail(auth, email).then(()=>{
            setError("");
            setSent(true)
        }).catch(error=>{
            console.log(error)
            if(error.code=="auth/missing-email"){
                setError("Email field is blank")
            }
            else if(error.code=="auth/invalid-email"){
                setError("Invalid email")
            }
            else if(error.code="auth/user-not-found"){
                setError("Account not found")
            }
            else{
                setError(error.code)
            }
        })
    }
    return(
        <div className="formContainer">
            <div className="loginDiv">
                <div className="formWrapper">
                    <span className="label">Reset Password</span>
                    <form onSubmit={(e)=>handleSubmit(e)}>
                        <input type="email" placeholder="email" />
                        <p>A link to reset your password will be sent via email</p>
                        <button>Send Email</button>
                        {error&&<p className="errorCode">{error}</p>}
                        {sent&&<p className="successCode">Password reset email has been sent to {emailState}</p>}
                    </form>
                    <Link style={{fontSize:"12px", marginTop:"10px", color:"#5555a5"}} href="/login">Return to login page</Link>
                </div>
            </div>
        </div>
    )
}


export default ResetPassword;
