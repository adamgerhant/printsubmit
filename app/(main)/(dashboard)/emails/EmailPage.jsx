import React from 'react'
import Emails from './Emails'
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
const EmailPage =({emailData, setEmailData, submissionFormData})=>{

  const { currentUser } = useContext(AuthContext);
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if(emailData&&submissionFormData){
    console.log("test")
    let hasEmail=false;
    submissionFormData.questions.map(question=>{
      if(question.variable=="email"){
          hasEmail=true;
      }
    })
  
    if(!hasEmail&&emailData.email){
      return(
        <div className='emails'>
          <Emails emailData={emailData} setEmailData={setEmailData}/>
        </div>
      )
    }
    else{
      return(
        <div className='emails'>
          <div className="noEmailDiv">
            <div className="noEmailTextDiv">
              <p className="noEmailHeader">Email setup incomplete</p> 
              <p className="noEmailText">To enable email functionality, both steps must be completed</p>
              <p className="noEmailText">1. set the variable of a question to email. 
              The user input for this question will be the address to which emails are sent</p> 
              <p className="noEmailText">2. 
                <button className="authorizeButton">Authorize google account</button>
              </p> 
              <p>This is the account from which emails will be sent. This account can be any Google account</p>
            </div>
            
          </div>
          <div className="darkenDiv"/>
          <Emails emailData={emailData} setEmailData={setEmailData}/>
        </div>
      ) 
    }
  } else {
    return(
      <div className='loadingDiv'>loading</div>
    )
  }
}
export default EmailPage