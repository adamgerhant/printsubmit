'use client'
import React, { useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation'
import { User } from "@/@types/user";
import { onAuthStateChanged } from "firebase/auth";
import auth, { db } from "../firebase";
import { useRouter } from "next/navigation";


const AuthorizeEmail = () => {
    const [currentUser, setCurrentUser] = useState<User>({uid:"", email:""});
    const router = useRouter();

    useEffect(() => {
       onAuthStateChanged(auth, (user) => {
            console.log("setting current user")
            const currentUserObj: User = {uid:"", email:""};
            if(user?.uid){
                currentUserObj.uid = user.uid;
                if(user.email){
                    currentUserObj.email = user.email;
                }
                else{ 
                    currentUserObj.email = "Guest";
                }
            }
            else{
                router.push("/login")
            }
            console.log(currentUserObj)
            setCurrentUser(currentUserObj);
        })
        
    }, []);
    const googleoauth = () => {
        if(auth.currentUser){
          auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
            fetch('http://localhost:5001/dprintsubmissionapp/us-central1/api/googleLogin', {
              method: "POST",
              headers: {
                'Content-type': 'application/json'
              },
              body: JSON.stringify({"token": idToken})
            })
            .then((response) => response.json())
            .then((result) => {
              console.log(result)
              window.open(result.url, "_self")
            })
          }).catch(function(error) {
            console.log("couldnt get user token")
          });
        }
      }

    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const success = searchParams.get('success')
    console.log(success)
    if(currentUser.email&&email){
        return(
            <div className="h-full flex flex-column justify-center">
                <div className="rounded p-6 mt-10">
                    <p className="text-3xl mb-4">Authorization {success?"complete":"failed"}</p>
                    {success=="true"&&
                    <p className="text-lg">Your Print Submit account
                        <b> {currentUser.email} </b> 
                        will now send automated emails from
                        <b> {email}</b>
                    </p>}
    
                    {success=="false"&&
                    <>
                        <p className="text-lg">
                            Email permisson not granted. Please try again
                        </p>
                        <button className="authorizeButton" onClick={()=>googleoauth()}><img style={{width:"20px", marginRight:"5px", marginBottom:"1px"}}src={'/g-logo.png'} alt="Google logo"/> 
                            Authorize Google account
                        </button>
                    </>
                    }
                    <button className="border-[1px] border-black px-2 rounded mt-4 text-lg" onClick={()=>{router.push("/emails")}}>Back to dashboard</button>
                </div>  
            </div>
        )
    }
    else{
        return(<></>)
    }
    
}
export default AuthorizeEmail;