import React from 'react'


const EmailProcess=({setCurrentEmail, currentEmail, handleCheckboxUpdate, toSend, saved})=>{
    return(
        <div className="emailProcessDiv">
            <div className="emailDiv">
                <div className={"emailSelectorDivSubmission"+(currentEmail=="Submission"?"Selected":"")} onClick={()=>setCurrentEmail("Submission")}>
                    Submission
                </div>
                <div className='sendEmailDiv'>
                    Send Email
                    <input className={`sendEmailCheckbox${saved?"Highlighted":""}`} checked={toSend.submitted} onChange={(e)=>handleCheckboxUpdate(e, "submitted")} type="checkbox"/>
                </div>
            </div>

            <div className="emailDiv">
                <div className={"emailSelectorDivPrinting"+(currentEmail=="Printing"?"Selected":"")} onClick={()=>setCurrentEmail("Printing")}>
                    Printing
                </div>
                <div className='sendEmailDiv'>
                    Send Email
                    <input className={`sendEmailCheckbox${saved?"Highlighted":""}`} checked={toSend.printing} onChange={(e)=>handleCheckboxUpdate(e, "printing")} type="checkbox"/>
                </div>
            </div>

            <div className="emailDiv">
                <div className={"emailSelectorDivFinished"+(currentEmail=="Finished"?"Selected":"")} onClick={()=>setCurrentEmail("Finished")}>
                    Finished
                </div>
                <div className='sendEmailDiv'>
                    Send Email
                    <input className={`sendEmailCheckbox${saved?"Highlighted":""}`} checked={toSend.finished} onChange={(e)=>handleCheckboxUpdate(e, "finished")} type="checkbox"/>
                </div>
            </div>

            <div className="emailDiv">
                
                <div className={"emailSelectorDivError"+(currentEmail=="Error"?"Selected":"")} onClick={()=>setCurrentEmail("Error")}>
                    Error
                </div>
                <div className='sendEmailDiv'>
                    Send Email
                    <input className={`sendEmailCheckbox${saved?"Highlighted":""}`} checked={toSend.error} onChange={(e)=>handleCheckboxUpdate(e, "error")} type="checkbox"/>
                </div>
            </div>
        </div>
    )
}
export default EmailProcess