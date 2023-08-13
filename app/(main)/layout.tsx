'use client'
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import auth, { db } from "../firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { UserContext, User, FirebaseContext, SubmissionData, SubmissionForm, CancelRequests, Settings, EmailData} from "@/@types/user";
import { getAuth, signOut } from "firebase/auth";
import { DocumentData, collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export const AuthContext = createContext<UserContext|null>(null);
export const useAuthContext = () => useContext(AuthContext);


const AppLayout = ({children}: {children: React.ReactNode})=>{
    const [currentUser, setCurrentUser] = useState<User>({uid:"", email:""});

    const router = useRouter();

    useEffect(() => {
        
        const unsub = onAuthStateChanged(auth, (user) => {
            const queryString = window.location.search;
            console.log("queryString: "+queryString);
            const urlParams = new URLSearchParams(queryString);
            const dashboard = urlParams.get('continue')
            const redirect = urlParams.has("redirect")

            console.log(redirect)
            const currentUserObj: User = {uid:"", email:""};
            if(user?.uid){
                console.log("logged in")
                if(!redirect){
                    router.push("/submissions")
                }
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
                if(dashboard=="guest"){
                    console.log("signing in as guest")
                    signInAnonymously(auth).then(()=>{
                        router.push("/submissions")
                    })
                }
                else if(redirect){
                    router.push("/register")
                }
                else{
                    router.push("/login")
                }
            }
            console.log(currentUserObj)
            setCurrentUser(currentUserObj);

        });
        return () => {
          unsub();
        };
    }, []);

   
    return(
        
        <AuthContext.Provider value={{currentUser}}>
            {children}
        </AuthContext.Provider>
    )
}
export default AppLayout;