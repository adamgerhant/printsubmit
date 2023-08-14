'use client'
import React, { useState } from "react";
import { useFirebaseContext } from "../layout";
import { FirebaseContext } from "@/@types/user";
import Emails from "./Emails"
import { getAuth } from "firebase/auth";
const EmailPage = () =>{
    const {emailData, setEmailData, submissionFormData} = useFirebaseContext() as FirebaseContext;
    const [loading, setLoading] = useState(false);
    if(emailData&&submissionFormData){
      const auth = getAuth();

      const googleoauth = () => {
        if(auth.currentUser){
          auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
            fetch('https://us-central1-print-submit.cloudfunctions.net/api/googleLogin', {
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

      const revoke = () => {
        if(auth.currentUser){
          auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
            fetch('https://us-central1-print-submit.cloudfunctions.net/api/revoke', {
              method: "POST",
              headers: {
                'Content-type': 'application/json'
              },
              body: JSON.stringify({"token": idToken})
            })
            .then(() =>{
              console.log("revoked")
              let emailCopy = {...emailData}
              emailCopy.email = ""
              emailCopy.refresh_token = ""
              setEmailData(emailCopy);
            })
          }).catch(function(error) {
            console.log("couldnt get user token")
          });
        }
      }
     
      let hasEmail:boolean=false;
      submissionFormData.questions.map((question: { variable: string; })=>{
        if(question.variable=="email"){
            hasEmail=true;
        }
      })
      
      if(hasEmail&&emailData.email){
        return(
          <div className='emails'>
            <Emails emailData={emailData} setEmailData={setEmailData} googleoauth={googleoauth} revoke={revoke}/>
          </div>
        )
      }
      else{
        return(
          <div className='emails'>
          <div className="noEmailDiv">
            <div className="noEmailTextDiv">
              <p className="noEmailHeader">Email setup incomplete</p> 
              <p className="noEmailDescription">To enable email functionality, the following steps must be completed</p>
              <p className="noEmailText">1. <span className={hasEmail?"completeText":"incompleteText"} style={{marginRight:"8px"}}>{hasEmail?"complete":"incomplete"}</span>Set the variable of a question to email.</p>
              <p className="description">The response to this question will be the address emails are sent to</p>
              <div className="secondDiv">
                <div className="buttonDiv">2. <span className={emailData.email?"completeText":"incompleteText"} style={{marginLeft:"10px"}}>{emailData.email?" complete":" incomplete"}</span>
                <button className="authorizeButton" onClick={()=>{setLoading(true);googleoauth()}}><img style={{width:"20px", marginRight:"5px", marginBottom:"1px"}}src={'/g-logo.png'} alt="Google logo"/> 
                  Authorize Google account
                </button>
                {loading&&
                  <div className='loader'/>
                }
                </div>
                <p className="description">This is the account emails will be sent from. This account can be any Google account</p>
              </div> 
            </div>
            
          </div>
          <div className="darkenDiv"/>
          <Emails emailData={emailData} setEmailData={setEmailData} googleoauth={googleoauth} revoke={revoke}/>
        </div>
        ) 
      }
    } else {
      return(
        <div className='loadingDiv'>loading</div>
      )
    }
  
}
export default EmailPage;