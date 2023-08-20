'use client'
import React, { useEffect, useState, useRef  } from 'react'
import { DocumentData, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL  } from 'firebase/storage';
import { StlViewer } from 'react-stl-viewer';
import { db } from '@/app/firebase';

const CancelSubmission = ({params} : {params: any}) => {
    const [cancelData, setCancelData] = useState<DocumentData|null>(null);
    const [url, setUrl] = useState("");
    const [reason, setReason] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const myRef = useRef(true);
    console.log("rendering cancel submisison")
    console.log(params);
    useEffect(()=>{
        const userID = params.userID;
        const cancelID = params.cancelID;
        const cancelDataRef = doc(db,"users",userID,"data","submissionData","cancelRequests",cancelID);
        if(!cancelData){
            console.log("getting cancel data")
            getDoc(cancelDataRef).then((docSnap)=>{
                if(docSnap.exists()){
                    setCancelData(docSnap.data());
                    const storage = getStorage();
                    const pathReference = ref(storage, "users/"+userID+"/"+docSnap.data().fileID+"/"+docSnap.data().fileName);
                    console.log("getting download url")
                    getDownloadURL(pathReference).then((fileUrl)=>{
                        setUrl(fileUrl);
                    })
                }
                else{
                    console.log("doc not found")
                }
            })
        }      
    },[])

    const style = {
        top: 0,
        left: 0,
        width: 250,
        height: 250,
    }
    let dateTime="";
    function numberSuffix(i:any) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }
    if(cancelData){
        
        let date = new Date(cancelData.date); // Epoch
        const dateYear = date.getFullYear();
        const dateMonth = date.getMonth()+1;
        const dateDay = date.getDate();
        let hour = date.getHours();
        var ampm = hour >= 12 ? 'pm' : 'am';
        hour = hour % 12;
        hour = hour ? hour : 12; // the hour '0' should be '12'
        let minutesNum : number = date.getMinutes();
        let minutes: string = "";
        if(minutesNum==0){
            minutes = "00"
        }
        else if(minutesNum<10){
            minutes = "0"+minutesNum;
        }
        else{
            minutes = ""+minutesNum;
        }
        var months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];
           
        dateTime =" "+hour+":"+minutes+ " "+ampm +" on "+ months[dateMonth-1]+" "+numberSuffix(dateDay)+" "+dateYear;
        
    }
    const onSubmit=()=>{
        const safeReason = reason?reason:""
        if(Array.isArray(params.slug)){
            const userID = params.slug[0];
            const cancelID = params.slug[1];
            updateDoc(doc(db, "users", userID, "data", "submissionData", "cancelRequests", cancelID), {
                cancelled:true,
                reason:safeReason
            }).then(()=>{
                setSubmitted(true)
            })
        }
    }
    if(!cancelData){return(<></>)};
    if(!submitted&&!cancelData.cancelled){
        return (
            <div className="cancelSubmissionPage">
                <div className="cancelSubmissionDiv">
                    <div className='header'>Cancel Submission</div>
                    {cancelData&&
                        <>
                        <div className="informationText">Cancelling request for file named {cancelData.fileName} submitted at {dateTime}</div>
                        <div className="previewText">Submitted model</div>
                        <div className="viewerDiv">
                            {url&&<StlViewer orbitControls style={style} url={url} modelProps={{scale:1.5, positionX:1, positionY:1}}/>}
                        </div>
                        
                        <div className="reasonRow">
                            <p className="reasonText">Cancel reason </p>
                            <p className="optionalText">(optional)</p>
                        <input value={reason} onChange={(e)=>setReason(e.target.value)}className="reasonInput"></input>
                        </div>
                        <div className='cancelButton' onClick={()=>onSubmit()}>{submitted==false? "Cancel Submission":"submitting..."}</div>
                        </>
                    }
                    {!cancelData&&<>Loading</>}
                </div>
            </div>
           
        )
    }
    else{
        return(
            <div className="cancelSubmissionPage">
                <div className="cancelSubmissionDiv">
                    <div className="header">Submission Cancelled</div>
                    <div className="informationText"style={{marginLeft:10}}>Your submission has been successfully cancelled</div>
                </div>
            </div>
        ) 
    }
    
}

export default CancelSubmission