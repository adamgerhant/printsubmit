import React, { useEffect, useRef, useState } from 'react'
import {AiFillCaretDown, AiFillCaretUp, AiOutlineCaretDown} from 'react-icons/ai'
import {StlViewer} from "react-stl-viewer";
import { getStorage, ref, getDownloadURL, deleteObject, } from 'firebase/storage';
import { doc, runTransaction, deleteDoc, getDoc } from "firebase/firestore";
import {db} from '@/app/firebase';
import { useContext } from 'react';
import { AuthContext, useAuthContext } from '../../layout';
import { getAuth } from 'firebase/auth';
const AllInformation = ({url, setUrl, informationWidths, headerWidths, date, fileName, fileID, rowIndex, firstSubmissionDiv, status, reason, lastStatus, dimensions, units, ip, blocked, fileSize, fileDeleted, accountInformation}) =>{
      
    const [render, setRender] = useState(false);
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const[expanded, setExpanded] = useState(false);
    const[cellLeave, setCellLeave] = useState(true);
    const[previewLeave, setPreviewLeave] = useState(true);
    const[displayReason, setDisplayReason]=useState(false);
    const [error, setError] = useState("");
    const {currentUser} = useContext(AuthContext)
    const [imageURL ,setImageURL] = useState();
    const [loading, setLoading] = useState(true)
    const [expandedCellBody, setExpandedCellBody] = useState();
    const [offsets, setOffsets] = useState();
    const [expandedIndex, setExpandedIndex] = useState();
    useEffect(()=>{

        if(currentUser){
            if(fileDeleted){
                setError(true)
            }else{
                const storage = getStorage();
                const pathReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/"+fileName);
                console.log("getting download url")
                getDownloadURL(pathReference).then((fileUrl)=>{
                    setUrl(fileUrl);
                    const pathReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/thumbnail.png");
                    getDownloadURL(pathReference).then((fileUrl)=>{
                        //const imageBlob = response.blob();
                        //const imageUrl = URL.createObjectURL(imageBlob);
                        setImageURL(fileUrl)
                        setRender(true);
                    })
                    
                })
            }
            
        }

    },[fileDeleted])
    
    useEffect(()=>{
        if(cellLeave&&previewLeave){
            setExpanded(false);
            setWidth("42px"); 
            setHeight("30px") 
        }
    },[cellLeave, previewLeave])

    function useOutsideAlerter(ref) {
        useEffect(() => {
          function handleClickOutside(event) {
            if (event.target.className!="reasonDiv"&&event.target.parentElement.className!="reasonDiv") {
                setDisplayReason(false)
            }
          }
          // Bind the event listener
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref, displayReason]);
    }
    
    const style = {  
        width: width,
        height: height,  
    }
    
    let statusColor = "";
    let backgroundColor = "";
    if(status=="Submitted"){
        statusColor="#ff0000";
        backgroundColor="#ffc6c6";
    }
    else if(status=="Printing"){
        statusColor="#868000"
        backgroundColor="#fffcbc"
    }
    else if(status=="Finished"){
        statusColor="#09871a"
        backgroundColor="#87e994"
    }
    else if(status=="Error"){
        statusColor="#ff1313"
        backgroundColor="#d1d1d1"
    }
    else if(status=="Cancelled"){
        statusColor="#000000"
        backgroundColor="#d1d1d1"
    }

    const byteUnits = ['bytes', 'kB', 'MB', 'GB', 'TB'];
    function niceBytes(x){

        let l = 0, n = parseInt(x, 10) || 0;

        while(n >= 1000 && ++l){
            n = n/1000;
        }
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + byteUnits[l]);
    }

    let fileSizeText = niceBytes(fileSize)
    if(accountInformation.accountType!="Premium"){
        fileSizeText=""
        dimensions=""
        ip=""
    }

    let timoutID;
    const myRef=useRef(null);
    useOutsideAlerter(myRef)
    return(
        <div>
            <div className="informationResponseDiv"style={{left:headerWidths[0]+10}}>
                
                <InformationCell text={date} informationWidths={informationWidths} index={0} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex} first={true} setExpandedCellBody={setExpandedCellBody} expandedCellBody={expandedCellBody} setOffsets={setOffsets} displayBlocked={false}/>

                <InformationCell text={ip} informationWidths={informationWidths} index={1} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex} first={false} setExpandedCellBody={setExpandedCellBody} expandedCellBody={expandedCellBody} setOffsets={setOffsets} blocked={blocked} displayBlocked={true}/>

                <InformationCell text={fileName} informationWidths={informationWidths} index={2} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex} first={false} setExpandedCellBody={setExpandedCellBody}expandedCellBody={expandedCellBody} setOffsets={setOffsets} displayBlocked={false}/>

                <InformationCell dimensions={dimensions} units={units} informationWidths={informationWidths} index={3} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex} first={false} setExpandedCellBody={setExpandedCellBody}expandedCellBody={expandedCellBody} setOffsets={setOffsets} displayBlocked={false}/>
                
                <InformationCell text={fileSizeText} informationWidths={informationWidths} index={4} expandedIndex={expandedIndex} setExpandedIndex={setExpandedIndex} first={false} setExpandedCellBody={setExpandedCellBody}expandedCellBody={expandedCellBody} setOffsets={setOffsets} displayBlocked={false}/>

                {!expanded&&<div className="responseCellSTLNoBorder" style={{width:informationWidths[5]}}>
                    {error&&<div className="stlError">error displaying file</div>}
                    {render&&informationWidths[5]>40&&!error ? <img
                            onError={(err)=>setError(err)}
                            onMouseEnter={() => {
                                if(cellLeave&&previewLeave){
                                    timoutID = setTimeout(() => {
                                    setWidth("150px"); 
                                    setHeight("150px"); 
                                    setExpanded(true)
                                    setCellLeave(false)
                                    setPreviewLeave(true)
                                    }, 100);
                                }
                            }}
                            onMouseOut={()=>{
                                clearTimeout(timoutID)
                                setExpanded(false)
                                setCellLeave(true)
                                setPreviewLeave(true)
                            }}
                            style={{height:"32px", marginLeft:"4px"}}
                            src={imageURL}    
                            /> : null}
                
                </div>}
                <div className="absoluteResponseCell" style={{width:informationWidths[6]-3,
                                                            left:informationWidths[0]+informationWidths[1]+informationWidths[2]+informationWidths[3]+informationWidths[4]+informationWidths[5]+2,
                                                            }}>
                    <div className="statusDiv"style={{ backgroundColor: backgroundColor}}>
                        <p className="statusText"style={{color:statusColor}}>{status}</p>
                        {(status=="Cancelled"||status=="Error")?<div className="caret"onClick={()=>setDisplayReason(true)}>
                            {displayReason?<AiFillCaretUp/>:<AiOutlineCaretDown/>}
                            </div>:""}
                    </div>
                    
                </div>         
            </div>
            {displayReason&&<div className="reasonDiv" style={{ left:headerWidths[0]+informationWidths[0]+informationWidths[1]+informationWidths[2]+informationWidths[3]+informationWidths[4]+informationWidths[5]+2}}>
                    {status=="Cancelled"?
                    <>
                        <div className='reasonText'>Status when cancelled</div>
                        <div className={'status '+lastStatus}> {lastStatus} </div>
                    </>:""}     

                    <p className='reasonText'>{status=="Cancelled"?"Cancel reason":"Error message"} </p>
                    <p className='reason' ref={myRef}>{reason==""?"":reason}</p>
                </div>}
            {expanded&&
            <div>
                    <div className="emptyResponseCell"
                        style={{left:headerWidths[0]+informationWidths[0]+informationWidths[1]+informationWidths[2]+informationWidths[3]+informationWidths[4]+7,
                            top: 31*(rowIndex)+(firstSubmissionDiv?76:0),
                            width:informationWidths[5]-1}} 
                        onMouseOver={() => {setCellLeave(false);
                            setPreviewLeave(false)
                        }}
                        onMouseLeave={() => {setCellLeave(true);setPreviewLeave(true); setLoading(true)}}>
                            
                        <div className="responseCellSTL"  
                        onMouseOver={()=>{setPreviewLeave(false)}}
                        onMouseLeave={() => {setPreviewLeave(true)}}
                        >
                        {loading&&<div className="loader"/>}
                        {error&&<>error displaying file</>}
                        {render&&informationWidths[5]>40&&!error ? <StlViewer

                            style={style}
                            orbitControls
                            modelProps={{
                                scale:1.5,
                                positionX:0,
                                positionY:0,
                                color:'grey'
                            }}
                            url={url}
                            onFinishLoading={()=>setLoading(false)}
                            
                            /> : null}
                            </div>
                    </div>
            </div>
            }
            {expandedCellBody&&offsets&&
            <div className="informationExpandedCell" id="expanded" style={{ left:offsets.left+headerWidths[0]}}>
                {expandedCellBody}
            </div>
            }
        </div>
    )
}
const InformationCell = ({text, units, dimensions, informationWidths, index, setExpandedIndex, expandedIndex, first, setExpandedCellBody, expandedCellBody, setOffsets, blocked, displayBlocked}) => {
    function useOutsideAlerter(ref) {
        useEffect(() => {

          function handleClickOutside(event) {
            if(expandedIndex==index){
                if (ref.current && event.target.id!="expanded") {
                    setExpandedCellBody()
                    setOffsets()
                    setExpandedIndex()
                }
            }
          }
          if(ref.current&&expandedIndex==index){
            const offsets = {top:ref.current.getBoundingClientRect().top};
            offsets.left = informationWidths.slice(0, index).reduce((sum, current) => sum + current, 0) +(index>0?5:0);
            setOffsets(offsets)
          }
          // Bind the event listener
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref, expandedCellBody]);
    }

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);
    if(text=="none"){text="unknown"}
    const cellBody = 
    <>
        <p className={first?"firstResponseText":"responseText"} id="expanded">{text} </p>
        {dimensions&&
        <p className="responseText" id="expanded">
            {" "+Math.round(dimensions.height * 100) / 100}<span className="text-xs">{units}</span>  
            {" "+Math.round(dimensions.width * 100) / 100}<span className="text-xs">{units}</span> 
            {" "+Math.round(dimensions.length * 100) / 100}<span className="text-xs">{units}</span>
        </p>
        }
    </>
    const cellWidth = informationWidths[index]+(index==0?6:0)
    return(
        <div ref={wrapperRef} className="responseCell" onDoubleClick={()=>{setExpandedCellBody(cellBody);setExpandedIndex(index)}} style={{width:cellWidth}}>
            <p className={`${first?"firstResponseText":"responseText"}${(displayBlocked&&blocked)?"Blocked":""}`}>{text}</p>
            {dimensions&&
            <p className="responseText" >
                {" "+Math.round(dimensions.height * 100) / 100}<span className="text-xs">{units}</span>  
                {" "+Math.round(dimensions.width * 100) / 100}<span className="text-xs">{units}</span> 
                {" "+Math.round(dimensions.length * 100) / 100}<span className="text-xs">{units}</span>
            </p>
            }
        </div>
    )
}
const AllActions = ({url, allData, status, setData, rowIndex, index, headerWidths, actionWidths, fileName, fileID, cancelID, IPData, IP, blocked, setIPData, fileDeleted, questionData, response, accountInformation, setSentPopup, deleteLock, setDeleteLock}) =>{
    const {currentUser} = useAuthContext();
    const[displayErrorInput, setDisplayErrorInput]=useState(false);
    const[errorInput, setErrorInput] = useState("")
    
    
    let buttonStatus="";
   
    if(status=="Submitted"){
        buttonStatus="Printing";
    }
    else if(status=="Printing"){
        buttonStatus="Finished";    
    }
    else if(status=="Cancelled"){
        buttonStatus=""
    }
    const getRecipient = () =>{
        const foundQuestion = questionData.find(question=>question.variable=="email")

        
        if(foundQuestion){
            return response.inputData[foundQuestion.questionID]
        }
        return ""
    }
    const getName = () =>{
        const foundQuestion = questionData.find(question=>question.variable=="name")
        if(foundQuestion){
            return response.inputData[foundQuestion.questionID]
        }
        return ""
    }
    const setErrorMessage=(saveInput)=>{
        if(saveInput){
            const docRef = doc(db, "users", currentUser.uid, "data", "submissionData");
            try{
                runTransaction(db, async (transaction) => {
                    const doc = await transaction.get(docRef);
                    if (!doc.exists()) {
                    throw "Document does not exist!";
                    }        
                    console.log("sending submission data")
                    const data = doc.data().data;
                    const newArr = [...data]
                    newArr[index].inputData.status = "Error";
                    newArr[index].inputData.errorMessage = errorInput;
                    transaction.update(docRef, { data: newArr});
                    setData({data: newArr});
                }).then(()=>{
                    const recipient = getRecipient()
                    if(recipient!=""){
                        const name = getName();
                        const auth = getAuth();
                        if(auth.currentUser){
                            auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
                                //http://localhost:5001/dprintsubmissionapp/us-central1/api
                                //https://us-central1-dprintsubmissionapp.cloudfunctions.net/api
                                fetch('https://us-central1-print-submit.cloudfunctions.net/api/sendEmail', {
                                    method: "POST",
                                    headers: {
                                        'Content-type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        "token": idToken,
                                        "status":"error",
                                        "recipient":recipient,
                                        "name":name,
                                        "errorMessage":errorInput,
                                        "cancelID":allData[index].inputData.cancelID,
                                    })
                                }).then(response=>response.json().then(data => ({ status: response.status, data: data })))
                                .then((response)=>{
                                    console.log(response)
                                    if(response.status==200&&response.data.message=="email sent"){
                                        setSentPopup({
                                        type:"error", 
                                        message:"Error email sent to "+recipient})
                                    }
                                    else if(response.status==400&&response.data.message=="maximum daily emails have already been sent"){
                                        setSentPopup({
                                            type:"errorSending", 
                                            message: "Error sending email. Maximum daily emails have been sent"
                                        })
                                    }
                                    else if(response.status==400){
                                        setSentPopup({
                                            type:"errorSending", 
                                            message: "Error sending email"
                                        })
                                    }
                                    console.log("sent error email to: "+recipient)
                                    console.log("response: ")
                                    console.log(response)
                                }).catch((error)=>{
                                    console.log("error: ")
                                    console.log(error)
                                });
                            })
                        }
                    }
                    else{
                        setSentPopup({
                            type:"errorSending", 
                            message: "Error sending email: Invalid recipient"
                        })
                    }    
                })   
            }catch (e) {
                console.error(e);
            }
        }
        setDisplayErrorInput(false);
    }
    const setPrintStatus = () =>{

        let updatedStatus = "";
        if(status=="Submitted"){
            const newArr = [...allData]
            newArr[index].inputData.status = "Printing";
            setData({data: newArr});
            updatedStatus = "Printing"
        }
        else if(status=="Printing"){
            const newArr = [...allData]
            newArr[index].inputData.status = "Finished";
            setData({data: newArr}); 
            updatedStatus = "Finished"
        }
        
        const docRef = doc(db, "users", currentUser.uid, "data", "submissionData");
        try{
            runTransaction(db, async (transaction) => {
                console.log("sending print status to server")
                const doc = await transaction.get(docRef);
                if (!doc.exists()) {
                    throw "Document does not exist!";
                }        
                const data = doc.data().data;
                const newArr = [...data]
                newArr[index].inputData.status = updatedStatus;
                setData({data: newArr});
                transaction.update(docRef, { data: newArr});
                }).then(()=>{
                    const recipient = getRecipient()
                    if(recipient!=""){
                        const name = getName();
                        const auth = getAuth();
                        if(auth.currentUser){
                            auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
                                //http://localhost:5001/dprintsubmissionapp/us-central1/api
                                //https://us-central1-dprintsubmissionapp.cloudfunctions.net/api
                                fetch('https://us-central1-print-submit.cloudfunctions.net/api/sendEmail', {
                                    method: "POST",
                                    headers: {
                                        'Content-type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        "token": idToken,
                                        "status":updatedStatus.toLowerCase(),
                                        "recipient":recipient,
                                        "name":name,
                                        "errorMessage":errorInput,
                                        "cancelID":allData[index].inputData.cancelID,
                                    })
                                }).then(response=>response.json().then(data => ({ status: response.status, data: data })))
                                .then((response)=>{
                                    console.log(response)
                                    if(response.status==200&&response.data.message=="email sent"){
                                        setSentPopup({
                                            type:updatedStatus.toLowerCase(), 
                                            message: updatedStatus+ " email sent to "+recipient
                                        })
                                    }
                                    else if(response.status==400&&response.data.message=="maximum daily emails have already been sent"){
                                        setSentPopup({
                                            type:"errorSending", 
                                            message: "Error sending email. Maximum daily emails have been sent"
                                        })
                                    }
                                    else if(response.status==400){
                                        setSentPopup({
                                            type:"errorSending", 
                                            message: "Error sending email"
                                        })
                                    }
                                    console.log("response: ")
                                    console.log(response)
                                }).catch((error)=>{
                                    console.log("error: ")
                                    console.log(error)
                                });
                            })
                        }
                    }    
                })
        }catch (e) {
            console.error(e);
        }
       
    }
    const blockIP = () =>{
        const newObj = {...IPData}
        newObj[IP.replace(/\./g, '%2E')].blocked = !blocked;
        setIPData(newObj);

        const docRef = doc(db, "users", currentUser.uid, "data", "submissionData", "ipData", "ipData");
        try{
            runTransaction(db, async (transaction) => {
                console.log("sending blocked status to server")
                const doc = await transaction.get(docRef);
                if (!doc.exists()) {
                    throw "Document does not exist!";
                }        
                const data = doc.data();
                const newObj = {...data}
                const encodedIP = IP.replace(/\./g, '%2E');

                newObj[encodedIP].blocked = !blocked;
                transaction.update(docRef, newObj);
            });
        }catch (e) {
            console.error(e);
        }
       
    }
    const getStorageUsed = () =>{
        console.log("deleted all files")
        //https://us-central1-dprintsubmissionapp.cloudfunctions.net/api/storageUsed
        //http://localhost:5001/dprintsubmissionapp/us-central1/api/storageUsed
        const auth = getAuth();
        if(auth.currentUser){
            auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
                fetch('https://us-central1-print-submit.cloudfunctions.net/api/storageUsed', {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        "token": idToken,
                    })
                })
            })
        }
    }
    const deleteEntry = async ()=>{
        if(!deleteLock){
            setDeleteLock(true)
            const docRef = doc(db, "users", currentUser.uid, "data", "submissionData");
            try{
                console.log("sending to server")
                await runTransaction(db, async (transaction) => {
                    const doc = await transaction.get(docRef);
                    if (!doc.exists()) {
                        throw "Document does not exist!";
                    }
                
                    const data = doc.data().data;
                    
                    let newArr
                    if(data.length==1){
                        newArr = []
                    }
                    else{
                        newArr = [...data]
                        newArr.splice(index, 1);
                    }
                    await transaction.update(docRef, { data: newArr});   
                    setData({data: newArr});             
                });

                
            }catch (e) {
                console.error(e);
            }
            const fileIDRef = doc(db, "users", currentUser.uid, "data", "submissionData", "submittedFileIDs",fileID);
            const cancelIDRef = doc(db, "users", currentUser.uid, "data", "submissionData", "cancelRequests",cancelID);
            
            //deleteDoc(cancelIDRef)
            //deleteDoc(fileIDRef)

            const storage = getStorage();
        
            const inputDataReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/inputData.json");
            const ipReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/ip.json");
            const thumbnailReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/thumbnail.png");
            
            if(!allData[index].inputData.fileDeleted){
                const pathReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/"+fileName);
                deleteObject(pathReference).then(()=>{
                    deleteObject(thumbnailReference).then(()=>{
                        deleteObject(inputDataReference).then(()=>{
                            deleteObject(ipReference).then(()=>{
                                getStorageUsed()
                            })
                        })
                    })
                })
            }else{
                deleteObject(ipReference).then(()=>{
                    deleteObject(inputDataReference).then(()=>{
                        getStorageUsed()
                    })
                })
            }
        }
      
       

    }
    const deleteFile = () =>{

        const docRef = doc(db, "users", currentUser.uid, "data", "submissionData");
        try{
            console.log("sending to server")
            runTransaction(db, async (transaction) => {
                const doc = await transaction.get(docRef);
                if (!doc.exists()) {
                    throw "Document does not exist!";
                }
                const data = doc.data().data;
                let newArr = [...data]
                newArr[index].inputData.fileDeleted=true
                newArr[index].inputData.fileName="deleted"
                console.log("model size: "+newArr[index].inputData.modelSize)
                newArr[index].inputData.fileSize-=newArr[index].inputData.modelSize
                newArr[index].inputData.fileSize-=newArr[index].inputData.thumbnailSize

                setData({data: newArr});
                transaction.update(docRef, { data: newArr});
                
                return newArr;
                });
        }catch (e) {
            console.error(e);
        }
        if(allData[index].inputData.fileID!="deleted"){
            const storage = getStorage();
            const pathReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/"+fileName);
            const thumbnailReference = ref(storage, "users/"+currentUser.uid+"/"+fileID+"/thumbnail.png");

            deleteObject(pathReference).then(()=>{
                deleteObject(thumbnailReference).then(()=>{
                    getStorageUsed()
                })
            })
            
        }
        setDisplayDeleteFile(false)
    }
    const handleDownload = async () =>{
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            const renamedBlob = new Blob([blob], { type: blob.type });
            const renamedUrl = URL.createObjectURL(renamedBlob);
        
            const link = document.createElement('a');
            link.href = renamedUrl;
            link.download = fileName; // Set the desired file name
            link.click();
        
            URL.revokeObjectURL(renamedUrl);
          } catch (error) {
            console.error('Error downloading and renaming file:', error);
          }
    }
    const[displayDeleteFile, setDisplayDeleteFile] = useState(false)

    function useOutsideAlerter(ref) {
        useEffect(() => {
          function handleClickOutside(event) {
            if (event.target.className!="deleteFileDiv"&&event.target.parentElement.className!="deleteFileDiv") {
                setDisplayDeleteFile(false)
            }
          }
          // Bind the event listener
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, 
        [ref, displayDeleteFile]);
    }
    const expandDeleteRef = useRef(null)
    useOutsideAlerter(expandDeleteRef)

    return( 
    <>
    
    <div className="actionResponseDiv" style={{left:headerWidths[0]+headerWidths[1]+20}}>
        <div className="firstResponseCell"style={{width: actionWidths[0]}}>
            {
            (status=="Submitted"||status=="Printing") &&
            <button onClick={()=>setPrintStatus("")}className={(status=="Submitted"?"printing":"finished")+"StatusButton"} style={{width: actionWidths[0]}}>
                <div className="buttonText" style={{width: actionWidths[0]-10}}>{buttonStatus}</div>
                </button>
            }
        </div>
        
        <div className="responseCell"style={{width: actionWidths[1], marginLeft:"8px"}}>
            {
                 (status!="Error"&&status!="Cancelled") &&
                 <button onClick={()=>setDisplayErrorInput(true)}className={"errorStatusButton"} style={{width: actionWidths[1]-7}}><div className="buttonText">Error</div></button>
            }
        </div>
        <div className="responseCell"style={{width: actionWidths[2]}}>
            {!fileDeleted&&
            <a onClick={()=>handleDownload()} className="downloadLink">            
                <button className="downloadButton" style={{width: actionWidths[2]-6}}><div className="buttonText">Download</div></button>
            </a>    
            }
        </div>
        <div className="responseCell"style={{width: actionWidths[3]}}>
            {IP!="none"&&accountInformation.accountType=="Premium"&&
                <p className="blockIcon" onClick={()=>blockIP()} style={{color:blocked?"green":"red"}}>{blocked?"Unblock":"Block IP"}</p>
            }
        </div>

        <div className="responseCell"style={{width: actionWidths[4]}}>
            <div className="deleteCell">
            <p className="trashIcon" onClick={()=>deleteEntry()}>Delete</p>
            {!fileDeleted&&
                <>
                {!displayDeleteFile?<AiFillCaretDown className="expandDeleteIcon" onClick={()=>setDisplayDeleteFile(true)}/>:<AiFillCaretUp className="expandDeleteIcon"/>}
                </>
            }
            {deleteLock&&
                <div className="deleteCellOverlay" style={{width: actionWidths[4]}}/>
            }
            </div>
        </div>
       
        
    </div>
    {displayErrorInput&&
    <div className="errorInputDiv" style={{left:headerWidths[0]+headerWidths[1]+actionWidths[0]+4}}>
        <p className="errorMessage">Error Message</p>
        <input className="errorInput" value={errorInput} onChange={(e)=>setErrorInput(e.target.value)}/>
        <div className="buttonDiv">
            <div className="saveButton" onClick={()=>setErrorMessage(true)}>Save</div>
            <div className="cancelButton" onClick={()=>setErrorMessage(false)}>Cancel</div>
        </div>
    </div>
    }
    {displayDeleteFile&&
    <div ref={expandDeleteRef} className="deleteFileDiv" style={{left:headerWidths[0]+headerWidths[1]+actionWidths[0]+actionWidths[1]+actionWidths[2]+actionWidths[3]-50}}>
        <span className="deleteFileButton" onClick={()=>{deleteFile()}}>Delete file only</span>
    </div>
    }
    
    </>
   )
}

const ResponseCell = ({question, index, questionValue})=>{
    const [expanded, setExpanded] = useState(false);
    const [expandedWidth, setExpandedWidth] = useState()
    function useOutsideAlerter(ref) {
        useEffect(() => {
        if(ref.current){
            const textWidth = ref.current.offsetWidth;
            if(textWidth<question.width){
                if(question.width>294){
                    setExpandedWidth(294);
                }
                setExpandedWidth(question.width-6);
            }
            else if(textWidth<294){
                setExpandedWidth(textWidth-6);
            }
            else{
                setExpandedWidth(294);
            }

        }
          function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
              setExpanded(false)
            }
          }
          // Bind the event listener
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, [ref, expanded]);
    }
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);
    return(
        <>
        <div className="responseCell" onDoubleClick={()=>setExpanded(true)} style={{width:question.width-1}}>
            <p className={(index==0?"firstR":"r")+"esponseText"} key={question.questionID} >{questionValue}</p>
            {expanded &&
            <div ref={wrapperRef} className="expanded" style={{left:-index+1, width:expandedWidth, whiteSpace:`${expandedWidth==294?"normal":"nowrap"}`}}>{questionValue}</div>
            } 
        </div>
        </>
        
    );
}
    

const ResponseRow = ({allData, fileData, setData, questionData, response, rowIndex, index, firstSubmissionDiv, actionWidths, headerWidths, showDeleted, informationWidths, cancelRequests, IPData, setIPData, accountInformation, setSentPopup, deleteLock, setDeleteLock }) =>{
    const allQuestionResponses = questionData.map((question)=>{
        
        let questionValue="";
        let displayIndex = 0;
        Object.keys(response.inputData).forEach(function(key) {
          
            if(question.questionID==key){
                questionValue=response.inputData[key];
            }
        });


        if(question.display||showDeleted){
            return(<ResponseCell key={question.questionID} question={question} index={displayIndex} questionValue={questionValue}/>)
        }
        
    })
    

    let date = new Date(response.inputData.date);


    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth()+1;
    const dateDay = date.getDate();
    let hour = date.getHours();
    var ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    let minutes = date.getMinutes();
   
    if(parseInt(minutes/10)==0){
        minutes = "0"+minutes;
    }
    date=dateMonth+"/"+dateDay+"/"+dateYear.toString().substring(2)+" "+hour+":"+minutes+ " "+ampm;
    

    
    let reason = ""
    let status = response.inputData.status;
    let lastStatus="";

    if(cancelRequests[response.inputData.cancelID]){
        if(cancelRequests[response.inputData.cancelID][0]){
            lastStatus=status
            status="Cancelled"
            reason=cancelRequests[response.inputData.cancelID][1]
        }
    }   
    if(response.inputData.status=="Error"){
        reason=response.inputData.errorMessage;
    }
    const [url, setUrl] = useState();
    
    let lastIndex;
    fileData.slice().reverse().map((response,index) =>{
       
        questionData.map(question=>{
            const hasResponse = Object.keys(response.inputData).indexOf(question.questionID.toString())>-1;
            if(hasResponse&&question.display||showDeleted){
                lastIndex = index;
            }
        })
        
    })
    let blocked=false
    if(response.inputData.ip!="none"&&IPData.hasOwnProperty(response.inputData.ip.replace(/\./g, '%2E'))){
        blocked = IPData[response.inputData.ip.replace(/\./g, '%2E')].blocked
    }
    return(
        <div className = "responseRowDiv" key={response.inputData.fileID} style={rowIndex<lastIndex ? {"borderBottom" : "1px solid rgb(166, 166, 166)"} : {border: "none"}}>
            {<div className="questionResponseDiv" >
                {allQuestionResponses}
            </div>}

            <AllInformation url={url} setUrl={setUrl} informationWidths={informationWidths} headerWidths={headerWidths} date={date} fileName={response.inputData.fileName} fileID={response.inputData.fileID} rowIndex={rowIndex} firstSubmissionDiv={firstSubmissionDiv} status={status} reason={reason} lastStatus={lastStatus} dimensions={response.inputData.dimensions} units={response.inputData.units} ip={response.inputData.ip} IPData={IPData} blocked={blocked} fileSize={response.inputData.fileSize} fileDeleted={response.inputData.fileDeleted} accountInformation={accountInformation}/>
            <AllActions allData={allData} url={url} setData={setData} status={status}  rowIndex={rowIndex} index={index} fileName={response.inputData.fileName} fileID={response.inputData.fileID} headerWidths={headerWidths} actionWidths={actionWidths} cancelID={response.inputData.cancelID} IP={response.inputData.ip} blocked={blocked} setIPData={setIPData} IPData={IPData} fileDeleted={response.inputData.fileDeleted} questionData={questionData} response={response} accountInformation={accountInformation} setSentPopup={setSentPopup} deleteLock={deleteLock} setDeleteLock={setDeleteLock}/>
    </div>)
}

const Responses = (({allData, data, setData, questionData, headerWidths, informationWidths, actionWidths, showDeleted, cancelRequests, firstSubmissionDiv, IPData, setIPData,accountInformation, setSentPopup, deleteLock, setDeleteLock }) =>{
   
    const responses = data.slice(0).reverse().map((response, index)=>{
        
        let renderResponseRow = showDeleted;
      
        questionData.map(question=>{
            if(question.display){
                
                if(Object.keys(response.inputData).indexOf(""+question.questionID)>-1){
                    renderResponseRow=true;
                }
            }
        })
        
        if(renderResponseRow){
            return(  
                <ResponseRow key={index} allData={allData} fileData={data} setData={setData} questionData={questionData} response={response} firstSubmissionDiv={firstSubmissionDiv} rowIndex={index} index={response.inputData.index}  actionWidths={actionWidths} headerWidths={headerWidths} showDeleted={showDeleted} informationWidths={informationWidths} cancelRequests={cancelRequests} IPData={IPData} setIPData={setIPData} accountInformation={accountInformation} setSentPopup={setSentPopup} deleteLock={deleteLock} setDeleteLock={setDeleteLock}/>       
             )
        }
        

    })
    return(
        <div className="responses">    
            <div className="responseRowsDiv">
                {responses}
                {allData.length==0&& <div className="submittedPlaceholder">When the submission form is submitted, responses will appear here</div>}
            </div>  
        </div>
    )
    
})


export default Responses;