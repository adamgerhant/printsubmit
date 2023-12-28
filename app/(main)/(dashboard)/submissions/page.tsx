'use client'
import React, { useState } from "react";
import Link from "next/link";
import { useFirebaseContext } from "../layout";
import { FirebaseContext, UserContext } from "@/@types/user";
import Submissions from "./Submissions"
import {RxArrowLeft} from 'react-icons/rx'
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useAuthContext } from "../../layout";

const SubmissionsPage = () =>{
  const {submissionData, submissionFormData, settingsData, cancelRequests, IPData, accountInformation, setSubmissionData, setSubmissionFormData, setSettingsData, setCancelRequests, setIPData} = useFirebaseContext() as FirebaseContext;
    
  const widthData : {[key:string]:any; questionWidths:{[key: number]:number}} = {questionWidths:{}};
  submissionFormData.questions.map((question:{
          width: number;
          questionID: number
  })=>{
    widthData.questionWidths[question.questionID] = question.width;
  });   
  widthData["headerWidths"] = settingsData.headerWidths;
  widthData["informationWidths"] = settingsData.informationWidths;
  widthData["actionWidths"] = settingsData.actionWidths;
  
  const setQuestionData=(newData:any)=>{
      const newObj = {...submissionFormData}
      newObj.questions = newData;
      setSubmissionFormData(newObj)
  }/*
  const actionHeaderWidth=1625-widthData.headerWidths[0]-widthData.headerWidths[1]
  let totalActionWidth = widthData.actionWidths.reduce((a:number,b:number)=>a+b,0)
  let currentIndex = 3;
  while(totalActionWidth+3>actionHeaderWidth&&totalActionWidth>4){
    if(widthData.actionWidths[currentIndex]==1){
      currentIndex--;
    }
    widthData.actionWidths[currentIndex]--
    totalActionWidth = widthData.actionWidths.reduce((a:number,b:number)=>a+b,0)
  }
  
  if(totalActionWidth<actionHeaderWidth){
    widthData.actionWidths[3] = actionHeaderWidth-3-totalActionWidth+widthData.actionWidths[widthData.actionWidths.length-1]
  }
  */
 
  return (
    <>
        <Submissions 
        data={submissionData}
        setData={setSubmissionData} 
        questionData={submissionFormData.questions} 
        setQuestionData={setQuestionData} 
        widthData={widthData} 
        cancelRequests={cancelRequests} 
        settingsData={settingsData} 
        setSettingsData={setSettingsData}
        IPData={IPData}
        setIPData={setIPData}
        accountInformation={accountInformation}
        submissionFormData={submissionFormData}
        setSubmissionFormData={setSubmissionFormData}
        />
    </>          
  )
}
  
    
    

export default SubmissionsPage;