import React from 'react'
import EmailProcess from './EmailProcess'
import { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useAuthContext } from '../../layout';
import { addDoc } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { getAuth, linkWithPopup, linkwithRedirect, GoogleAuthProvider } from 'firebase/auth';

const Emails = ({emailData, setEmailData, googleoauth, revoke}) => {
  const {currentUser} = useAuthContext();
  const[currentEmail, setCurrentEmail] = useState("Submission");
  const[saved, setSaved] = useState(false);
  const[loading, setLoading] = useState(false);
  const updateDatabase=()=>{
    console.log("sending email data to server")
    setDoc(doc(db, "users", currentUser.uid, "data", "emailData"), emailData);
  }
  
  const handleEmailChange=(e, emailDataName)=>{
    if(e.target.tagName=="TEXTAREA"){
      let newEmailData = {...emailData}
      newEmailData[emailDataName].body = e.target.value;
      setEmailData(newEmailData);
    }
    if(e.target.tagName=="INPUT"){
      let newEmailData = {...emailData}
      newEmailData[emailDataName].subject = e.target.value;
      setEmailData(newEmailData);
    }
  }
  const saveChanges=()=>{
    updateDatabase()
    setSaved(true);
    setTimeout(()=>setSaved(false),100);
  }
  const handleCheckboxUpdate=(e, email)=>{
    let newEmailData={...emailData};
    newEmailData.toSend[email]=e.target.checked;
    setEmailData(newEmailData);
  }
  let emailDataName="";
  let informationMessage;
  if(currentEmail=="Submission"){
    emailDataName="submittedEmail";
    informationMessage="This email will be sent when a user submits the form"
  }
  else if(currentEmail=="Printing"){
    emailDataName="printingEmail";
    informationMessage="This email will be sent when the state is set to printing"
  }
  else if(currentEmail=="Finished"){
    emailDataName="finishedEmail";
    informationMessage="This email will be sent when the state is set to finished"
  }
  else if(currentEmail=="Error"){
    emailDataName="errorEmail";
    informationMessage="This email will be sent when the state is set to error"
  }
 

  return (
      <>
      <div className='titleDiv' style={{top:"0"}}>
        Emails 
      </div>
      <EmailProcess setCurrentEmail={setCurrentEmail} currentEmail={currentEmail} handleCheckboxUpdate={handleCheckboxUpdate} toSend={emailData.toSend} saved={saved}/>
      <div className="emailEditContainer">

        <div className="emailEditDiv">
          Edit {currentEmail} Email
          <div className="informationDiv">
            {informationMessage}
          </div>
          <div className="emailTextDiv" style={{height:"20px", marginTop:"5px"}}>
            From: <span className="currentEmail">{emailData.email==""?"No account":emailData.email}</span>
            <button onClick={()=>{setLoading(true);googleoauth()}} className="accountButtons">Change account</button>
            <button onClick={()=>{setLoading(true);revoke()}} className="accountButtons">Sign out</button>
            {loading&&
              <div className='loader'/>
            }
          </div>
          <div className="emailTextDiv">
            Subject:<input onChange={(e)=>handleEmailChange(e,emailDataName)}  value={emailData[emailDataName].subject} className={`emailInput${saved ? "Highlighted":""}`}/>
          </div>
          <div className="emailTextDiv">
            Body:<textarea onChange={(e)=>handleEmailChange(e,emailDataName)} value={emailData[emailDataName].body} className={`bodyEmailInput${saved ? "Highlighted":""}`}/>
          </div>
          <div className="emailTextDiv">
            Variables:
            <div className="variableDiv">
              <div className="variableRow">
                <div className="variableTextDiv">[name]</div>
                <div className="variableInformationDiv">This variable will be replaced by the response to the question set to the name variable</div>
              </div>
              <div className="variableRow">
                <div className="variableTextDiv">[errorMessage]</div>
                <div className="variableInformationDiv">This variable will be replaced by the information entered when setting status to error</div>
              </div>
              <div className="variableRow">
                <div className="variableTextDiv">[cancelLink]</div>
                <div className="variableInformationDiv">This variable will be replaced by the link to the cancel form</div>
              </div>
            </div>
          </div>
          
        </div>
        <button className="saveButton" onClick={saveChanges}>Save All Changes</button>
        {saved}
              
        </div>
    </>
  )
}
export default Emails