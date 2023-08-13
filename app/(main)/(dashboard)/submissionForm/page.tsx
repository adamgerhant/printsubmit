'use client'
import React from "react";
import Link from "next/link";
import { useFirebaseContext } from "../layout";
import { FirebaseContext, UserContext } from "@/@types/user";
import { useAuthContext } from "../../layout";
import SubmissionForm from "./SubmissionForm"
import EditForm from "./EditForm"

const SubmissionFormPage = () =>{
    const {currentUser} = useAuthContext() as UserContext;
    const {submissionFormData, setSubmissionFormData, settingsData, accountInformation} = useFirebaseContext() as FirebaseContext;

    return(           
        <div className='submissionFormPage'>
            <div className='titleDiv' >
                <p className="submissionFormTitle">Submission Form  </p>
            </div>
        
            <div className="contentDiv">
                <div className='preview'>
                <p className='previewText'>Preview</p>
                <div className="submissionFormContainerDisplay">
                    <SubmissionForm submissionFormData={submissionFormData} id={currentUser.uid} accountInformation={accountInformation}/>
                </div>
                    
                <div className='linkDiv'>
                    <p className="linkText">Public submission form URL:</p>
                <Link className="link"href={"/public/"+currentUser.uid} target="_blank" rel="noopener noreferrer" >{"future_domain_name/public/"+currentUser.uid}</Link>
                </div>
            </div>
        
            <div className='edit'>
                <p className='editText'>Edit Submission Form</p>
                <EditForm 
                setSubmissionFormData={setSubmissionFormData}
                submissionFormData={submissionFormData}
                headerWidth={settingsData.headerWidths[0]}
                accountInformation={accountInformation}/>    
                </div>
            </div>             
        </div>
    )
    
    
    
}
export default SubmissionFormPage;