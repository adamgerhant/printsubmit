'use client'
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import auth, { db } from "@/app/firebase";
import { AuthContext, useAuthContext } from "../layout";
import { useRouter } from "next/navigation";
import { DocumentData, collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { UserContext } from "@/@types/user";
import {  User, FirebaseContext, SubmissionData, SubmissionForm, CancelRequests, Settings, EmailData} from "@/@types/user";
import Header from "./Header";
import Profile from "./Profile";
import Sidebar from "./Sidebar"
export const firebaseContext = createContext<FirebaseContext|null>(null);
export const useFirebaseContext = () => useContext(firebaseContext);

const AppLayout = ({children}: {children: React.ReactNode})=>{
    const {currentUser} = useAuthContext() as UserContext;
    const [submissionData, setSubmissionData] = useState<DocumentData|null>(null);
    const [submissionFormData, setSubmissionFormData] = useState<DocumentData|null>(null);
    const [cancelRequests, setCancelRequests] = useState<DocumentData|null>(null);
    const [settingsData, setSettingsData] = useState<DocumentData|null>(null);
    const [emailData, setEmailData] = useState<DocumentData|null>(null);
    const [IPData, setIPData] = useState<DocumentData|null>(null);
    const [accountInformation, setAccountInformation] = useState<DocumentData|null>(null);
    const [accountType, setAccountType] = useState<String|null>(null);
    const [emailCount, setEmailCount] = useState<DocumentData|null>(null);
    const router = useRouter();
    const user = currentUser;
    useEffect(()=>{
        
        if(user.email&&user.uid){
            const submissionDataRef = doc(db, "users",  user.uid, "data", "submissionData");
            const submissionFormRef = doc(db, "users",  user.uid, "data", "submissionForm")
            const cancelRequestsRef = collection(db,"users",  user.uid, "data", "submissionData", "cancelRequests")
            const settingsRef = doc(db, "users",  user.uid, "data", "settings")
            const emailsRef = doc(db, "users",  user.uid, "data", "emailData");
            const IPRef = doc(db, "users",  user.uid, "data", "submissionData", "ipData", "ipData");
            const accountInformationRef = doc(db, "users",  user.uid, "data", "accountInformation");
            const emailCountRef = doc(db, "users",  user.uid, "data", "emailCount")
            
            if(!submissionData){
                console.log("getting submission data")
                getDoc(submissionDataRef).then((docSnap)=>{
                    if (docSnap.exists()) {
                        setSubmissionData(docSnap.data())
                    } else {
                        const submissionData={
                            data:[]
                        }
                        setDoc(submissionDataRef, submissionData); 
                        setSubmissionData(submissionData)
                    }
                }).catch((err)=>{console.log("error getting doc" + err)})
            }
            if(!submissionFormData){
                console.log("getting submission form data")
                getDoc(submissionFormRef).then((docSnap)=>{
                    if (docSnap.exists()) {
                    setSubmissionFormData(docSnap.data())
                    } else {
                    const submissionFormData = {
                        userID : user.uid,
                        closed:false,
                        closedTitle: "Form Closed",
                        closedInformation: "Form is currently closed",
                        title:"",
                        description:"",
                        uploadInformation:"",
                        questions:  [{questionID:1, question: "", description: "", required:true, display:true, width:530, variable:"", type:"text", options:[]}],
                        maxSizeEnabled: false,
                        maxSize: [0,0,0],
                        units: "in",
                        maxUploadSize: 250,
                        deleteOldFiles: true,
                        captchaEnabled: false,
                    }
                    setDoc(submissionFormRef, submissionFormData); 
                    setSubmissionFormData(submissionFormData)
                    }
                }).catch((err)=>{
                    console.log("error getting doc" + err)
                })
            }
            if(!cancelRequests){
                //console.log("getting cancel requests")

                getDocs(cancelRequestsRef).then((querySnapshot) => {
                    let cancelRequestsObj : CancelRequests = {};
                    querySnapshot.forEach((doc) => {
                        const docData = doc.data();
                        cancelRequestsObj[doc.id] = [docData.cancelled, docData.reason];
                    });
                    setCancelRequests(cancelRequestsObj)
                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
            }
            if(!settingsData){
                //console.log("getting settings data")

                getDoc(settingsRef).then((docSnap)=>{
                    if (docSnap.exists()) {   
                        setSettingsData(docSnap.data())                
                    } else {
                        const settingsData={
                            headerWidths:[500, 690],
                            informationWidths: [125, 65, 95, 125, 90, 70, 115, 5],
                            actionWidths: [95, 80, 95,90, 70],     
                            seperateResponses:false,
                            showDeleted:false                                                                                                                                                                                                                                                                                                                                                                    
                        }
                        setDoc(settingsRef, settingsData); 
                        setSettingsData(settingsData)
                    }
                }).catch((err)=>{
                    console.log("error getting doc" + err)
                })
            }
            if(!emailData){
                //console.log("getting email data")
                getDoc(emailsRef).then((docSnap)=>{
                    if (docSnap.exists()) {   
                    setEmailData(docSnap.data())                
                    } else {
                    const emailData ={
                        email:"",
                        refresh_token:"",
                        toSend:{submitted:true,printing:true,finished:true,error:true},
                        submittedEmail:{subject:"3D Print Submitted",
                                        body:"Hello [name],\n\nYour 3D print has successfully been submitted.\n\n\nThe following link can be used to cancel your submission:\n[cancelLink]"},
                        printingEmail:{subject:"3D Print Printing",
                                        body:"Hello [name],\n\nYour 3D print has started printing. When the part is finished, another email will be sent."},
                        finishedEmail:{subject:"3D Print Finished",
                                        body:"Hello [name],\n\nYour 3D print has finished printing."},
                        errorEmail:{subject:"3D Print Error",
                                        body:"Hello [name],\n\nYour 3D print has an error and it was not able to print. Here is the error message staff left: [errorMessage]\n\n\nFor more information, respond to this email with any questions"}                                                                                                                                                                                                                                                                                                                                                               
                    }
                    setDoc(emailsRef, emailData); 
                    setEmailData(emailData);
                    }
                }).catch((err)=>{
                    console.log("error getting doc" + err)
                })
            }
            if(!IPData){
                //console.log("getting IP data")
                getDoc(IPRef).then(docSnap=>{
                    if (docSnap.exists()) {   
                        setIPData(docSnap.data())                
                    }   
                    else{
                        setDoc(IPRef, {}); 
                        setIPData({})
                    }
                })
            }
            if(!accountInformation){
                //console.log("getting account information")
                getDoc(accountInformationRef).then(docSnap=>{
                    if (docSnap.exists()) {   
                        setAccountInformation(docSnap.data())   
                        setAccountType(docSnap.data().accountType)           
                    }   
                    else{
                        const auth = getAuth();
                        if(auth.currentUser){
                            if (auth.currentUser.isAnonymous) {
                                setAccountInformation({
                                    storageUsed:0,
                                    totalStorage:5,
                                    dailyMax:20,
                                    accountType:"Guest"
                                })
                                setAccountType("Guest")
                              } else {
                                setAccountInformation({
                                    storageUsed:0,
                                    totalStorage:5,
                                    dailyMax:20,
                                    accountType:"Free"
                                })
                                setAccountType("Free")
                              }
                        }
                    }
                })
            }
            if(!emailCount){
                //console.log("getting email counts")
                getDoc(emailCountRef).then(docSnap=>{
                    if (docSnap.exists()) {   
                        setEmailCount(docSnap.data())                
                    }   
                    else{
                        const auth = getAuth();
                        if(auth.currentUser){
                         
                            setEmailCount({
                                dailyTotal:0,
                                total:0,
                                submitted:0,
                                printing:0,
                                finished:0,
                                error:0,
                            })
                        }
                    }
                })
            }
        }
    }, [user, submissionData, submissionFormData, settingsData, emailData, cancelRequests, IPData, accountInformation])
   
    const resetData = ()=>{
        setSubmissionData(null)
        setCancelRequests(null);
        setSubmissionFormData(null);
        setSettingsData(null);
        setEmailData(null);
        setIPData(null);
        setAccountInformation(null)
    }
    const resetStatisticsData = () =>{
        setSubmissionData(null)
        setAccountInformation(null)
        setEmailCount(null)
        setCancelRequests(null)
    }
    const resetAllData = () =>{
        setSubmissionData
        setSubmissionFormData
        setCancelRequests
        setSettingsData
        setEmailData
        setIPData
        setAccountInformation
        setAccountType
        setEmailCount
    }
    if(currentUser.email){

        if(!submissionData||!submissionFormData||!settingsData||!emailData||!IPData||!accountInformation||!emailCount){
            return(
                <firebaseContext.Provider value = {{submissionData, submissionFormData, settingsData, emailData, cancelRequests, IPData, accountInformation, emailCount, setSubmissionData, setSubmissionFormData, setSettingsData, setEmailData, setCancelRequests, setIPData, resetData, resetStatisticsData, resetAllData}}>
                    <div className="dashboard"> 
                        <Header/>
                        <div className='workspace'>
                            <Sidebar accountType={accountType}/> 
                            <div className="loadingDiv"><div className="loader"/>Loading</div>
                        </div>
                    </div>
                </firebaseContext.Provider> 

            )
        }
        else{
            return(
                <firebaseContext.Provider value = {{submissionData, submissionFormData, settingsData, emailData, cancelRequests, IPData, accountInformation, emailCount, setSubmissionData, setSubmissionFormData, setSettingsData, setEmailData, setCancelRequests, setIPData, resetData, resetStatisticsData, resetAllData}}>
                    <div className="dashboard"> 
                        <Header/> 
                        <div className='workspace'>
                            <Sidebar accountType={accountType}/> 
                            {children} 
                        </div>
                    </div>
                </firebaseContext.Provider> 
            )
        }
        
        
    }
    else{
        console.log("no user")
        return(
            <></>
        )
    }
    
    
    
   
    
}
export default AppLayout;