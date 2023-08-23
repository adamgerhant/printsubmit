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

export const AuthContext = createContext<UserContext|null>(null);
export const useAuthContext = () => useContext(AuthContext);

const payment = ()=>{
    const [currentUser, setCurrentUser] = useState<User>({uid:"", email:""});

    useEffect(() => {
        
        const unsub = onAuthStateChanged(auth, (user) => {
            const currentUserObj: User = {uid:"", email:""};
            if(user?.uid){
                console.log("logged in")
                currentUserObj.uid = user.uid;
                if(user.email){
                    currentUserObj.email = user.email;
                }
                else{ 
                    currentUserObj.email = "Guest";
                }
            }
            else{
                console.log("not logged in")
                currentUserObj.uid = "none";
                currentUserObj.email = "none";
            }
            console.log(currentUserObj)
            setCurrentUser(currentUserObj);

        });
        return () => {
          unsub();
        };
    }, []);
    const [loading, setLoading] = useState(false);
    const [dots, setDots] = useState("");
    const [err, setErr] = useState(false);
    const [redirectError, setRedirectError] = useState("");
    useEffect(()=>{
        if(loading){
            setTimeout(()=>{
                let dotsCopy=dots+"."
                if(dots=="..."){
                    setDots("")
                }
                else{
                    setDots(dotsCopy)
                }
            },500)
        }
    },[loading, dots])
    const router = useRouter()

    const provider = new GoogleAuthProvider();

    const signInWithGoogle = () => {signInWithRedirect(auth, provider)}

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
    const checkout = () =>{
        setLoading(true)
        const accountInformationRef = doc(db, "users",  currentUser.uid, "data", "accountInformation");
        const subscriptionCollectionRef = collection(db, "users",  currentUser.uid, "subscriptions")
        getDoc(accountInformationRef).then().then((docSnap)=>{
            if (!docSnap.exists()) {
                setRedirectError("You must navigate to the dashboard before buying a subscription"); 
            }
            else{
                getDocs(subscriptionCollectionRef).then((querySnapshot) => {
                    let canCheckout = true;
                    querySnapshot.forEach((doc) => {
                        if(doc.exists()){
                            if(doc.data().status=="active"){
                                setRedirectError("A subscription is already active on this account");
                                canCheckout=false;
                            }
                        }
                    })
                    if(canCheckout){
                        createCheckoutSession(currentUser.uid, setRedirectError)
                    }
                })
            }
        })
        
       
    }   
    if(currentUser.email == "Guest" || currentUser.email == "none"){
        return(
            
            <div className="formContainer" style={{/*backgroundColor:"white"*/}}>
                
                <div className="loginDiv" style={{height:"420px" /*border:"1px solid lightgray", borderRadius:"5px"*/ }}>
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
                       
                    <div className="lineBreakDiv">
                        <div className="lineBreak"/>
                        or
                        <div className="lineBreak"/>
                    </div>
                    <div className="googleButton" onClick={()=>{signInWithGoogle()}}>
                    <img
                        src={'/g-logo.png'}
                        alt="Google logo"
                    />
                        Sign in with Google
                    </div>
                </div>
            </div>
            
            
        </div>
        )
    }
    else if(currentUser.uid){
        return(
            <div className="w-full h-[90vh] flex flex-row justify-center items-center">
                {!loading&&
                    <div className="border rounded p-10">
                        <a href="/" className="font-bold text-[35px] py-1 whitespace-nowrap flex flex-row
                            align-center mt-1">
                                <img src={logo.src} className="w-[60px] mt-[-2px] mr-1"/>
                                Print Submit
                        </a>
                        <span className="cursor-default bg-violet-200 text-violet-800 font-bold p-1 px-2 rounded text-lg">
                            Premium
                        </span>
                        <div className="mt-12 cursor-default flex flex-row items-baseline justify-center  py-2 pb-3 border-2 border-violet-400 shadow-lg rounded">
                            <span className="font-bold text-4xl ">$5</span>
                            <span className="text-2xl text-gray-600 ml-2">per month</span>
                        </div>
                        <p className="mt-12 text-xl">
                            Purchase as
                        </p>
                        <div className="flex flex-col">
                            <p className="text-lg font-semibold mr-2">
                                {currentUser.email}
            
                            </p>
                            <span className="border rounded py-1 px-2 cursor-pointer" onClick={()=>{signOut(auth)}}>Switch account</span>
                        </div>
                        <hr className="mt-6"/>
                        <div onClick={() => checkout()} className="mt-6 px-4 py-2 border-[1px] border-violet-700 bg-violet-700 rounded flex flex-row justify-between cursor-pointer hover:bg-violet-800 text-white ease-out duration-200">
                            <p className="text-[15px] font-semibold">Buy now</p>
                            <BsArrowRight className="h-full w-[22px]"/>
                        </div>

                    </div>
                }
                {loading&&!redirectError&&
                    <div>
                        Redirecting to payment form{dots}
                    </div>
                }
                {loading&&redirectError&&
                    <div className="w-[550px] ">
                         <p className="text-center text-red-600 mb-2 text-lg">
                            Error redirecting
                         </p>
                        <p className="text-center mb-2">
                             Please try again or use the contact form at  
                            <a href="/contact" className="text-blue-600" target="_blank"> www.printsubmit.com/contact </a>
                            and include the following information.
                        </p>
                        <div className="flex flex-row items-baseline mt-5 mb-2">
                            <p>User ID: </p>
                            <p className="border py-1 px-2 rounded bg-gray-100">
                                {currentUser.uid}
                            </p>
                        </div>
                        <div className="flex flex-row items-baseline mt-2 mb-2">
                            <p>User email: </p>
                            <p className="border py-1 px-2 rounded bg-gray-100">
                                {currentUser.email}
                            </p>
                        </div>
                        <div className="flex flex-row items-baseline mt-2 mb-5">
                            <p>Error Message:</p>
                            <p className="border py-1 px-2 rounded bg-gray-100">
                                {redirectError}
                            </p>
                        </div>
                        <a href="/pricing" className="border rounded py-2 px-4">
                            Back
                        </a>
                    </div>
                }
            </div>
        )
    }
    else{
        return(
            <div className="loadingDiv">
                <div className="loader"/>
            </div>
        )
    }
}

export default payment