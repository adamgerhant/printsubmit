'use client'

import React, { useState, useEffect} from "react";
import { DocumentData, doc, getDoc} from "firebase/firestore";
import { db, } from "../../firebase.js";
import { useRouter } from "next/navigation.js";
import SubmissionForm from "@/app/(main)/(dashboard)/submissionForm/SubmissionForm.jsx";


const PublicForm = ({ params }: { params: { userID: string } }) =>{
    

    const[submissionFormData, setSubmissionFormData] = useState<DocumentData|null>(null);
    const[accountInformation, setAccountInformation] = useState<DocumentData|null>(null);
    useEffect(()=>{
        const docRef = doc(db, "users",  params.userID, "data", "submissionForm");
        const accountRef = doc(db, "users",  params.userID, "data", "accountInformation");

        if(!submissionFormData){
            console.log("getting data from server")
            getDoc(docRef).then((docSnap)=>{
                if (docSnap.exists()) {
                    setSubmissionFormData(docSnap.data())
                } else {
                    console.log("No such document!");
                }
            }).catch((err)=>{
                console.log("error getting doc" + err)
            })
        }
        if(!accountInformation){
            console.log("getting data from server")
            getDoc(accountRef).then((docSnap)=>{
                if (docSnap.exists()) {
                    setAccountInformation(docSnap.data())
                } else {
                    console.log("No such document!");
                }
            }).catch((err)=>{
                console.log("error getting doc" + err)
            })
        }
    },[])

    if(submissionFormData&&accountInformation){
        return(
            <SubmissionForm submissionFormData={submissionFormData} id={params.userID} accountInformation={accountInformation} />
        )  
    }

    else{
        return(
            <div/>
        )
    }

}

export default PublicForm;