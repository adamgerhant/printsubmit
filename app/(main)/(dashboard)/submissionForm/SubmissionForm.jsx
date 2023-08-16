import React from 'react'
import { useState, useRef, useEffect, memo} from 'react';
import { doc, onSnapshot} from 'firebase/firestore';
import { db, storage } from '@/app/firebase';
import Link from 'next/link';
import { StlViewer } from 'react-stl-viewer';
import ReCAPTCHA from 'react-google-recaptcha';

const Questions = ({displayArray, handleInputDataChange, highlightQuestions, accountInformation})=>{
   
    return  displayArray.map((questionObject) => {
        let questionPlaceholder=<div/>
        let descriptionPlaceholder=<div/>
        let required=""
        const shouldHighlight = highlightQuestions.includes(questionObject.questionID)
        //handleInputDataChange(questionObject.questionID, "")

        const onInputChange = (e)=>{
            handleInputDataChange(questionObject.questionID, e.target.value)
        }
        if(questionObject.question === ""){
            questionPlaceholder = <p className="questionText">New question</p>
        }
    
        if(questionObject.description === ""){
            descriptionPlaceholder = <div></div>
        }
        if(questionObject.required === true){
            required=<div className="requiredDiv">
                        <p className="astericks">*</p>
                    </div>
        }
        if(questionObject.display){
        
        
        let allOptions = questionObject.options.map((option)=>{
            return(<option value={option}>{option}</option>)
        })
        
        return(
            <div key={questionObject.questionID}> 
                <div className="questionTitleDiv">
                    {questionPlaceholder}
                    <p className="questionText">{questionObject.question}</p>
                    {required}
                </div>
                
                {descriptionPlaceholder}
                <p className="questionDescription">{questionObject.description}</p>
                {(questionObject.type=="text"||accountInformation.accountType!="Premium")&&
                    <input onChange={onInputChange} type="text" className={`submissionInput${shouldHighlight ? "Highlighted" : ""}`}/>
                }          
                {questionObject.type=="dropdown"&&accountInformation.accountType=="Premium"&&
                    <select className="select" onChange={onInputChange}>
                        {allOptions}
                    </select>
                }                                    

            </div> 
        )
        }
    })
}
const SubmitButton = ({setUploadStatus, file, setFile, id, inputData, setSubmitted, setHighlightIDs, submissionFormData, setCancelID, imageURL, dimensions, setErrorUploading, recaptchaToken, accountInformation}) =>{
    const [submitButton, setSubmitButton]= useState("submit")
    const [fileID, setFileID] = useState()
    
    console.log("fileID: "+fileID)
    useEffect(() => {
    // Reference to the Firestore document you want to listen to
    console.log("onsnapshot file id: "+fileID)
    if(fileID){
        const docRef = doc(db, "users", id, "data", "submissionData", "submittedFileIDs", fileID)
        // Subscribe to real-time updates for the document
        const unsubscribe = onSnapshot(docRef,  snapshot => {
        // The callback function triggered when the document is updated
        console.log("running onsnapshot")
        if (snapshot.exists()) {
            const fileData = snapshot.data();
            console.log(fileData)
            if(fileData.transferred=="complete"){
                setSubmitted(true)
                setCancelID(fileData.cancelID)
            }
            else if(fileData.transferred=="error"){
                setErrorUploading(fileData.errorMessage)
                setSubmitButton("submit")
            }
        }
        });
    // Clean up the subscription when the component unmounts
        return () => unsubscribe();
    }
        
    }, [fileID]);
    const submit=async ()=>{
        const tempIDs = []
        setSubmitButton("pressed")
        let canSubmit =true

        if(file==""||file=="none"){
            setFile("none");
            canSubmit=false;
            setSubmitButton("submit")
        }

        submissionFormData.questions.map((questionObject)=>{

            let hasRequiredField=false;

            if(questionObject.required&&questionObject.display){
                Object.keys(inputData).forEach(function(key,index) {
                    // key: the name of the object key
                    // index: the ordinal position of the key within the object
                    if(key==questionObject.questionID && inputData[key] !== ""){         
                        hasRequiredField=true
                    }
                });
                if(!hasRequiredField){
                    canSubmit=false
                    tempIDs.push(questionObject.questionID);
                    setSubmitButton("submit")
                }
            }
        })
        if(submissionFormData.closed){
            canSubmit=false;
        }

        if(submissionFormData.maxSizeEnabled&&dimensions){
            const submittedDimensions = [dimensions.width, dimensions.height, dimensions.length]
            submittedDimensions.sort()
            const maxDimensions = submissionFormData.maxSize
            maxDimensions.sort()
            for(var i=0;i<3;i++){
                if(submittedDimensions[i]>maxDimensions[i]){
                    canSubmit=false;
                    setSubmitButton("submit")
                    setErrorUploading("Error Uploading\nModel is larger than maximum size")
                }
            }
        }
        if(!recaptchaToken&&submissionFormData.captchaEnabled){
            setErrorUploading("Error uploading\nI'm not a robot check must be completed")
            setSubmitButton("submit")
        }
        else if(canSubmit){
            setHighlightIDs([]);
            inputData.fileName = file.name;
            if(accountInformation.accountType!="Premium"){
                inputData.dimensions = {height:0, width:0, length:0}
            }
            else{
                inputData.dimensions = dimensions;
            }
            inputData.units = submissionFormData.units
            inputData.status = "Submitted";
            const newDate = new Date()
            inputData.date = newDate.getTime();         

            const inputDataBlob = new Blob([JSON.stringify(inputData)])
            var inputDataFile = new File([inputDataBlob], "inputData.json", {type:'application/json'});
            
            //https://us-central1-dprintsubmissionapp.cloudfunctions.net/api/uploadURL
            //http://localhost:5001/dprintsubmissionapp/us-central1/api/uploadURL
            //http://localhost:5001/dprintsubmissionapp/us-central1/api/sendEmail


            let imageData = imageURL.split(',')[1];
            console.log(imageData)
            inputData.imageUpload = true;
            if(!imageData){
                imageData="0"
                inputData.imageUpload = false;
            } 
            const imageBuffer = Buffer.from(imageData, 'base64');
            
            
            setUploadStatus("Verifying submission request")
            fetch('https://us-central1-print-submit.cloudfunctions.net/api/uploadURL', {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    "id": id,
                    "fileName":file.name,
                    "fileSize":file.size,
                    "thumbnailSize":imageBuffer.length,
                    "inputDataSize":inputDataFile.size,
                    "password": inputData.hasOwnProperty("password"),
                    "recaptchaToken" : recaptchaToken
                })
            }).then(response=>response.json().then(data => ({ status: response.status, data: data })))
            .then((response)=>{
                if(response.status==200){
                    setFileID(response.data.fileID)
                    setUploadStatus("Uploading files")

                    const uploadURL = response.data.uploadURL
                    const thumbnailURL = response.data.thumbnailURL
                    const inputDataURL = response.data.inputDataURL
                    fetch(uploadURL, {
                        method: 'PUT',
                        headers: {
                          'Content-type': "application/octet-stream",
                          'X-Upload-Content-Length': file.size
                        },
                        body: file,  
                    }).then(()=>{  
                        console.log("uploaded file")                         
                        fetch(thumbnailURL, { 
                            method: 'PUT',
                            headers: {
                                'Content-type':  "image/png",
                                'X-Upload-Content-Length': imageBuffer.length
                            },
                            body: imageBuffer,
                        }).then(()=>{
                            console.log("uploaded thumbnail")
                            fetch(inputDataURL, { 
                                method: 'PUT',
                                headers: {
                                'Content-type':  "application/json",
                                'X-Upload-Content-Length':  inputDataFile.size
                                },
                                body: inputDataFile,
                            }).then(()=>{
                                console.log("uploaded inputData")
                                setUploadStatus("Processing submission")

                            }).catch((error)=>{
                                console.log("error uploading inputData")
                                setErrorUploading(true)
                                setSubmitButton("submit")
                            });
                        }).catch(()=>{
                            console.log("error uploading thumbnail")
                            setErrorUploading()
                            setSubmitButton("submit")
                        });
                        
                    }).catch(()=>{
                        console.log("error uploading file")
                        setErrorUploading("Error uploading")
                        setSubmitButton("submit")
                    });
                }
                else if(response.status==403){
                    console.log("setting file too large")
                    setErrorUploading(response.data.message)
                    setSubmitButton("submit")
                }
                else {
                    setErrorUploading("Error uploading")
                    setSubmitButton("submit")
                }    
            }).catch((error)=>{
                console.log("error: ")
                console.log(error)
                setErrorUploading("Error uploading")
                setSubmitButton("submit")
            });
         

        }
        else{
            setHighlightIDs(tempIDs);
        }
       
    }

    if(submitButton==="submit"){
        return(
        <input className="submitButton" onClick={()=>{setErrorUploading(false);submit()}} value="Submit" type="button"/>
        )
    }
    else if(submitButton==="pressed"){
        return(
        <input className="submitButton"  value="Submitting" type="button"/>
        )
    }


}
const IncompleteForm = ({display})=>{
    if(display){
        return(
            <div className="incompleteFormDiv">
                <p className="incompleteText">Please fill out highlighted questions</p>
            </div>
        )
    }
    else{
        return(
            <div/>
        )
    }
}
const StlDiv = memo(function StlDiv({file, setConvertedDimensions, setStlError}){
    console.log("rendered")
    let fileURL = ""
    console.log(file)
    if(file!="none"){
        fileURL = window.URL.createObjectURL(file);
    }
    return (<div className="bg-white w-[200px] border-[2px] border-gray-300 cursor-pointer">
    <StlViewer
        url={fileURL}
        style={{width:"200px", height:"200px"}}
        orbitControls={true}
        modelProps={{
            scale:1.5,
            positionX:-1,
            positionY:-3,
        }}
        onError={(err)=>{setStlError("yes")}}
        onFinishLoading={(ev)=>{setConvertedDimensions(ev); setStlError("no")}}
        canvasId='3d_canvas'
    />
</div>)
}, (prevProps, nextProps)=>{
    return(prevProps.file.lastModified===nextProps.file.lastModified)
})

const SubmissionForm = ({id, submissionFormData, accountInformation}) => {
    console.log("submisison form data: ")
    console.log(submissionFormData)
    const[submitted,setSubmitted] = useState(false);
    const[highlightIDs, setHighlightIDs] = useState([]);
    const[file, setFile] = useState("");
    const[progressWidth, setProgressWidth] = useState(0);
    const[cancelID, setCancelID] = useState();
    const[closedHeight, setClosedHeight] = useState(0);
    const [stlError, setStlError] = useState("")
    const [dimensions, setDimensions] = useState({})
    const [imageURL, setImageURL] = useState();
    const [errorUploading, setErrorUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState("")
    const [dots, setDots] = useState("");
    const [recaptchaToken , setRecaptchaToken ] = useState(false);
    if(accountInformation.accountType!="Premium"){
        submissionFormData.captchaEnabled=false;
    }
    useEffect(()=>{
        if(uploadStatus){
            setTimeout(()=>{
                if(dots=="..."){
                    setDots("")
                }
                else{
                    setDots(dots+".")
                }
            },500) 
        }
    },[dots, uploadStatus])

    const tempInputData = {}
    submissionFormData.questions.map(question=>{
        if(question.type=="dropdown"&&question.display&&question.options.length>0){
            tempInputData[question.questionID] = question.options[0]
        }
    })
    const[inputData, setInputData] = useState(tempInputData);

    const handleInputDataChange = (id, data) =>{
        const newObj = {...inputData}
        newObj[id] = data;
        setInputData(newObj)
    }
    const handlePasswordChange = ()=>{
        const newObj = {...inputData}
        newObj.password = true;
        setInputData(newObj)
    }
    let titlePlaceholder=<div/>

    if(submissionFormData.title === ""){
        titlePlaceholder=<p className='titleText'>Title</p>
    }
    let information=null;

    if(submissionFormData.description !== ""){
        const newDescription =submissionFormData.description.split('\n').map( (str, index) => {
            if(str==""){
                return(<br key={index} className='descriptionText'/>)
            }
            else{
                return(<p key={index} className='descriptionText' >{str}</p>)
            }
       
        })
        information = <div className="descriptionTextDiv">
                        {newDescription}
                    </div>   
    }
    let closedInformation=submissionFormData.closedInformation;
    if(closedInformation!=""){
        closedInformation =submissionFormData.closedInformation.split('\n').map( (str, index) => {
            if(str==""){
                return(<br key={index} className='formClosedDescription'/>)
            }
            else{
                return(<p key={index} className='formClosedDescription'>{str}</p>)
            }
       
        })
    }
    

    const myRef = useRef(null);
    useEffect(()=>{
        if(submissionFormData.closed){
            setClosedHeight(myRef.current.clientHeight)

        }
    })
    useEffect(()=>{
        let timer1
        if(dimensions&&stlError){

            timer1 = setTimeout(() => {
                console.log("stl error: "+stlError)
                if(stlError=="no"){
                    var canvas = document.getElementById('3d_canvas').firstChild.firstChild;
                    setImageURL(canvas.toDataURL("image/png"))
                }
                else if(stlError=="yes"){
                    setImageURL("")
                }
            }
            , 250);
        }
        return () => clearTimeout(timer1);   
        
    },[dimensions, stlError])

    
    
    const ref = useRef(true);
    const setConvertedDimensions = (dimensions) =>{
        
        if(submissionFormData.units=="mm"){
            const height = Math.round(dimensions.height * 100) / 100
            const width = Math.round(dimensions.width * 100) / 100
            const length = Math.round(dimensions.length * 100) / 100
            setDimensions({height:height, width:width, length:length});
        }
        if(submissionFormData.units=="in"){
            const height = Math.round(dimensions.height/25.4 * 100) / 100
            const width = Math.round(dimensions.width/25.4 * 100) / 100
            const length = Math.round(dimensions.length/25.4 * 100) / 100
            setDimensions({height:height, width:width, length:length});
        }
    }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB'];
   
    function niceBytes(x){

        let l = 0, n = parseInt(x, 10) || 0;

        while(n >= 1000 && ++l){
            n = n/1000;
        }
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }
    let fileSizeDisplay = ""
    if(file&&file!="none"){
        fileSizeDisplay = niceBytes(file.size)
    }
  
    if(!submitted||!cancelID){
        return (
            <>

            <div className="submissionFormContainer" >
                {submissionFormData.closed&&
                <>
                <div ref={myRef} className="formClosedDiv">
                    <div className="formClosedTitle">{submissionFormData.closedTitle}</div>
                    {closedInformation}
                </div>
                    <div className="overlayDiv" style={{top:closedHeight+10}}/>
                </>
                }

                <div className="submissionFormHeader">
                <div className="titleTextDiv">
                    {titlePlaceholder}
                    <p className='titleText'>{submissionFormData.title}</p>
                </div>

                {information}

                <div className="questionsDiv">
                    <div className="requiredDiv">
                        <p className="astericks">*</p>
                        <p className="requiredText">Required</p>
                    </div>

                    <Questions accountInformation={accountInformation} displayArray={submissionFormData.questions} handleInputDataChange={handleInputDataChange} highlightQuestions={highlightIDs}/>
                    <hr className='formLineBreak'/>
                    <div className="fileUploadDiv">
                        <p className="questionText">File Upload</p>
                        <p className="astericks">*</p>
                        <div className="flex flex-column">
                        
                        </div>
                        
                    </div>
                    
                        <div className="flex flex-col ">
                            {submissionFormData.maxSizeEnabled&&<p className="text-sm mt-1">Maximum model dimensions: {submissionFormData.maxSize[0]} {submissionFormData.units} x {submissionFormData.maxSize[1]} {submissionFormData.units} x {submissionFormData.maxSize[2]} {submissionFormData.units} </p> }
                            <p className="text-sm mt-1">Maximum upload size: {submissionFormData.maxUploadSize} MB</p>
                        </div>
                   
                    <p className="questionDescription">{submissionFormData.uploadInformation}</p>
                    
                    <input className="fileUploadInput" onChange={(event)=>{
                        setFile(event.target.files[0]);
                        setStlError()
                        setDimensions({})
                        ref.current=true;
                        }} type="file"/>  

                     {file&&file!="none"&&(stlError=="no"||!stlError)&&
                     <div className='flex flex-col items-left ml-2'>
                     <p className="text-xl mb-2">Preview</p>
                     <StlDiv file={file} setStlError={setStlError} setConvertedDimensions={setConvertedDimensions}/>
                    
                    {file&&file!="none"&&
                        
                        <p className="mt-2 text-gray-700"> File size: {fileSizeDisplay}</p>
                    }
                    {dimensions&&<p className="mt-1 text-gray-700">Dimensions: 
                        {" "+dimensions.height} {submissionFormData.units} x 
                        {" "+dimensions.width} {submissionFormData.units} x 
                        {" "+dimensions.length} {submissionFormData.units}</p>}
                    </div>}
                    {file&&stlError=="yes"&&
                    <>
                        <p className="text-xl mb-2">Preview</p>
                        <div className="bg-white w-[200px] h-[200px]">
                        <p className='font-bold text-gray-500 w-full text-center pt-[80px]'>Error displaying file</p>
                    </div>
                    </>
                    
                    }
                    <input type="checkbox" onChange={()=>handlePasswordChange()} name="contactByEmail" value="1" style={{display:"none"}} tabIndex="-1" autoComplete="off"/>
                    <hr className='formLineBreak' style={{marginTop:"10px"}}/>
                    {submissionFormData.captchaEnabled&&
                    <div className="mt-5">
                         <ReCAPTCHA
                        sitekey="6LfYj58nAAAAAL3VRFce6SrIHCn2nxFxeEzA63zn"
                        onChange={(token)=>setRecaptchaToken(token)}
                        />
                    </div>
                   
                    }
                    
                    <div className='submitButtonDiv'>
                        <SubmitButton 
                        setProgressWidth={setProgressWidth}
                        file={file} setFile={setFile}
                        id={id} 
                        setHighlightIDs={setHighlightIDs} 
                        inputData={inputData} 
                        submissionFormData={submissionFormData} 
                        setSubmitted={setSubmitted} 
                        setCancelID={setCancelID}
                        imageURL={imageURL}
                        dimensions={dimensions}
                        setErrorUploading={setErrorUploading}
                        setUploadStatus={setUploadStatus}
                        recaptchaToken={recaptchaToken}
                        accountInformation={accountInformation}
                        />
                    </div>
                        <IncompleteForm display={highlightIDs.length!=0}/>
                        {file=="none" &&
                        <div className="incompleteFormDiv">
                            <p className="incompleteText">File must be uploaded</p>
                        </div>}
                        {progressWidth==0 && <div style={{height:8}}/>}
                        {progressWidth>0 &&
                            <div className="progressBarDiv">
                                <div style={{width:progressWidth}} className="progressBar"/>
                            </div>
                        }
                        {uploadStatus&&!errorUploading&&
                            <div className="submittingFormDiv">
                                <div className="statusText">{uploadStatus+dots}</div>
                            </div>
                        }
                        {uploadStatus=="Processing submission"&&
                            <>
                                <div className="submittingFormDiv">
                                    <div className="processingText">Processing can take up to 1 minute. The link to the cancel submission form will appear when your file is done processing</div>
                                </div>
                                
                            </>
                            

                        }   
                        {errorUploading && 
                        <div className="incompleteFormDiv">
                            {
                            errorUploading.split('\n').map((line, index) => (
                                <p className="incompleteText" key={index}>
                                    {index === 0 ? <strong style={{fontSize:"18px", marginTop:0}}>{line}</strong> : line}
                                </p>
                            ))
                            }
                        </div>
                        }
                </div>         
                </div>   
            </div>
            
            
            </>       
        )
    }
    else{
        return(
            <div className="submissionFormContainer">
                <div className='confirmationDiv'>
                    <p className='successText'>Submission Complete</p>
                    <p className='confirmationText'>Your file and form information have been successfully submitted</p>
                    <p className='linkText'> Use the form at the following URL to cancel your submission </p>
                    <Link className="link" href={"/public/"+id+"/"+cancelID}target="_blank" rel="noopener noreferrer">{"localhost:3000/public/"+id+"/"+cancelID}</Link>
                </div>
            </div>
        )
    }

}

export default SubmissionForm