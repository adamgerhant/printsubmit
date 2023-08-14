import React,{useState, useEffect, useRef} from 'react'
import Draggable from 'react-draggable';
import { doc, updateDoc, runTransaction  } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { BsThreeDots } from 'react-icons/bs';
import Responses from './Responses.jsx'
import { useAuthContext } from '../../layout';
import {BiSolidLock} from "react-icons/bi"
import { Tooltip } from 'react-tooltip';

const LargeResizer = ({questionWidths, questionData, setQuestionData, setQuestionWidths, headerWidths, setHeaderWidths, headerID, handleStop, informationWidths, setInformationWidths, actionWidths, setActionWidths, totalHeight}) =>{
    const {currentUser} = useAuthContext();
    const [resizePos, setResizePos] = useState(0);
    const [selected, setSelected] = useState(false);
    const handleDrag = (e, data)=>{
        setResizePos(data.x)
        setSelected(true)
    }/*
    const dragHandleStop=()=>{
        setSelected(false)
        const newArr = [...headerWidths]
        if(headerID==0){
            newArr[0]= headerWidths[0]+resizePos;
            var tempInformationWidths = [...informationWidths];
            if(resizePos>0){
                var tempResizePos = resizePos;
                var index = informationWidths.length-1;
                while(tempResizePos>0){
                    if(tempInformationWidths[index]<tempResizePos){
                        tempResizePos -= tempInformationWidths[index];
                        tempInformationWidths[index]=1;
                    }else{
                        tempInformationWidths[index] -= tempResizePos;
                        tempResizePos=0
                    }
                    index--;
                }
            }
            else{
                tempInformationWidths[informationWidths.length-1] -= resizePos;
            }
            setInformationWidths(tempInformationWidths);
            newArr[1]= tempInformationWidths.reduce((a, b) => a + b, 0);
        }

        else{
            newArr[1]= headerWidths[1]+resizePos;
           
            var tempActionWidths = [...actionWidths];

            if(resizePos>0){
                var tempResizePos = resizePos;
                var index = tempActionWidths.length-1;
                while(tempResizePos>0){
                    if(tempActionWidths[index]<tempResizePos){
                        tempResizePos -= tempActionWidths[index];
                        tempActionWidths[index]=1;
                    }else{
                        tempActionWidths[index] -= tempResizePos;
                        tempResizePos=0
                    }
                    index--;
                }
            }
            else{
                tempActionWidths[tempActionWidths.length-1] -= resizePos;
            }
            setActionWidths(tempActionWidths);
            
        }
        setHeaderWidths(newArr);

        if(headerID==1){
            
            var tempInformationWidths = [...informationWidths];
            tempInformationWidths[informationWidths.length-1] += resizePos;
            setInformationWidths(tempInformationWidths);

        }
        
        console.log("updating doc with arr: "+newArr)
        updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
            headerWidths:newArr
        });
        if (headerID==0||headerID==1) {
            updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
                informationWidths: tempInformationWidths
            });
        }
        
        setResizePos(0);
    }
    */
    const dragHandleStop=()=>{
        setSelected(false)
        let headerWidthsCopy = [...headerWidths]
        let informationWidthsCopy = [...informationWidths];

        if(headerID==0){
            headerWidthsCopy[0]+=resizePos;
            headerWidthsCopy[1]-=resizePos;
            let questionWidthsCopy = {...questionWidths}
            let maxIndex = 0;
            for (const key in questionWidthsCopy) {
                if (key>maxIndex) {
                    maxIndex=key
                }
            }

            questionWidthsCopy[maxIndex]+=resizePos
            informationWidthsCopy[0]-=resizePos

            let questionDataCopy = [...questionData]

            questionDataCopy[maxIndex-1].width+=resizePos

            
            setQuestionData(questionDataCopy)
            setInformationWidths(informationWidthsCopy)
            setQuestionWidths(questionWidthsCopy)
            setHeaderWidths(headerWidthsCopy)
            setResizePos(0)

            updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
                headerWidths:headerWidthsCopy
            });
            updateDoc(doc(db, "users", currentUser.uid, "data", "submissionForm"), {
                questions: questionDataCopy
            });
            updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
                informationWidths: informationWidthsCopy
            });

        }

        if(headerID==1){
            headerWidthsCopy[1]+=resizePos;
            let actionWidthsCopy = [...actionWidths];

            informationWidthsCopy[informationWidthsCopy.length-2]+=resizePos
            actionWidthsCopy[0]-=resizePos

            setInformationWidths(informationWidthsCopy)
            setActionWidths(actionWidthsCopy)
            setHeaderWidths(headerWidthsCopy)
            setResizePos(0)
            updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
                headerWidths:headerWidthsCopy
            });
            updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
                actionWidths: actionWidthsCopy
            });
            updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
                informationWidths: informationWidthsCopy
            });
        }
    }
    let rightBound=informationWidths[0]-5
    if(headerID==1){
        rightBound = actionWidths[0]
        var leftBound = -informationWidths[informationWidths.length-2]
    }
        
    if(headerID==0){
        let maxIndex = 0;
        for (const key in questionWidths) {
            if (key>maxIndex) {
                maxIndex=key
            }
        }
        var leftBound = -questionWidths[maxIndex]
        const questionWidthsArray = Object.values(questionWidths);
        
        const widthSum = questionWidthsArray.reduce((a, b) => a + b, 0) - questionWidthsArray[questionWidthsArray.length-1];
        
        const questionLeftBound = -headerWidths[headerID]+widthSum+35+questionWidthsArray.length*2;
        leftBound = Math.max(questionLeftBound, leftBound);
    }
        
    let leftOffset = headerWidths[0];
    if(headerID==1){
        leftOffset+=headerWidths[1]-2;
    }
    
    const nodeRef = useRef(null);
    

    return(
        <>
            <Draggable nodeRef={nodeRef} axis = "x" bounds={{left:leftBound, right:rightBound}} position={{x:resizePos, y:0}} onDrag={(e, data) => handleDrag(e, data)} onStop={dragHandleStop} >
                <div ref={nodeRef} className={`headerSeperator${selected ? "Selected" : ""}`} style={{left: leftOffset, height:totalHeight}} />
            </Draggable>
          
        </>
        
    )
}

const Resizer = ({leftOffset, positionSum, maxWidth, questionData, handleStop, questionID, questionWidths, height}) =>{
    const [resizePos, setResizePos] = useState(0);
    const [selected, setSelected] = useState(false);
    const {currentUser} = useAuthContext();

    const handleDrag = (e, data)=>{
        if(data.x+questionWidths[questionID]>0){
            setResizePos(data.x)
        }
        setSelected(true)
    }

    const dragHandleStop=()=>{
        const newArr = [...questionData]
        newArr[questionID-1].width =newArr[questionID-1].width+resizePos;
        if(questionID<Object.values(questionWidths).length){
            var keysString = Object.keys(questionWidths);
            keysString.sort(function(a, b) {
                return a - b;
            });
            const keys = keysString.map(Number);
                    
            const idIndex = keys.indexOf(questionID);
            const nextID = keys[idIndex+1];
            newArr[nextID-1].width= (newArr[nextID-1].width-resizePos) 
        }
        setResizePos(0)
        handleStop(newArr)
        setSelected(false)
        console.log("updating doc")
        updateDoc(doc(db, "users", currentUser.uid, "data", "submissionForm"), {
            questions: newArr
        });
    }

    let rightBound=questionWidths[questionID+1];
    if(questionID<Object.values(questionWidths).length-1){
        var keysString = Object.keys(questionWidths);
        keysString.sort(function(a, b) {
            return a - b;
        });
        const keys = keysString.map(Number);
                
        const idIndex = keys.indexOf(questionID);
        const nextID = keys[idIndex+1];
        rightBound=questionWidths[nextID];
    }
    else{
        rightBound=maxWidth-positionSum-45;
    }
    rightBound-=2;
    /*
    let leftOffset=0;
    for(let i=1; i<=questionID; i++){
        leftOffset+=questionWidths[i];
    }
    */
    const nodeRef = useRef(null);
    return(
        <>
        <Draggable nodeRef={nodeRef} axis = "x" bounds={{left:-questionWidths[questionID]+5, right:rightBound}} position={{x:resizePos, y:0}} onDrag={(e, data) => handleDrag(e, data)} onStop={dragHandleStop} >
            <div ref={nodeRef} className={`resizeDiv${selected ? "Selected" : ""}`} style={{left:leftOffset+3, height:height}} />
        </Draggable>
        </>
        
    )   
}

const SimpleResizer = ({index, widths, setWidths, type, headerWidths, setHeaderWidths, totalHeight}) =>{
    const {currentUser} = useAuthContext();
    const [resizePos, setResizePos] = useState(0);
    const [selected, setSelected] = useState(false);

    const handleDrag = (e, data)=>{

        setResizePos(data.x)
        setSelected(true)
        
    }

    const dragHandleStop=()=>{
        const newArr = [...widths]
        newArr[index] = newArr[index]+resizePos;
        newArr[index+1]= newArr[index+1]-resizePos;
        
        setResizePos(0)
        setWidths(newArr)
        setSelected(false)
        console.log("updating doc")
        updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
            [type]: newArr
        });
        
        if(type=="informationWidths"){
            var newHeaderWidths=[...headerWidths];
            
            newHeaderWidths[1] = widths.reduce((a, b) => a + b, 0) 
            setHeaderWidths(newHeaderWidths)
        
            updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
                headerWidths:newHeaderWidths
            });       
        }
    }
    
    let leftOffset=0;
    if(type=="informationWidths"){
       
        leftOffset = headerWidths[0]
    }
    if(type=="actionWidths"){
        
        leftOffset = headerWidths[0]+headerWidths[1]-1;
    }

    for(let i=0; i<=index; i++){
        leftOffset+=widths[i]; 
    }
    const nodeRef = useRef(null);
    
    return(
        <Draggable nodeRef={nodeRef} axis = "x" bounds={{left:-widths[index]+3, right:widths[index+1]-2}} position={{x:resizePos, y:0}} onDrag={(e, data) => handleDrag(e, data)} onStop={dragHandleStop} >
            <div ref={nodeRef} className={`resizeDiv${selected ? "Selected" : ""}`} style={{left:leftOffset+5, height:totalHeight}} />
        </Draggable>
    )   

}

const QuestionHeader = ({maxWidth, showDeleted, questionData, setQuestionData, questionWidths, setQuestionWidths, height}) =>{
    const {currentUser} = useAuthContext();

    const handleStop=(questionDataArray)=>{
        setQuestionData(questionDataArray);
        const newObj = {};
        questionData.map((question)=>{
            newObj[question.questionID] = question.width;
          
      });   
        setQuestionWidths(newObj)
    }

    const questionArray = [];
    const displayedQuestionWidths = {};
    questionData.map((question)=>{
        
        if(question.display==true||showDeleted){
          questionArray.push([question.question, question.questionID])
          displayedQuestionWidths[question.questionID] = questionWidths[question.questionID]
        }  
      }); 
    const restoreQuestion=(id)=>{
        const newArr = [...questionData];
        newArr[id-1].display=true;
        console.log("updating doc")

        updateDoc(doc(db, "users", currentUser.uid, "data", "submissionForm"), {
            questions: newArr
        });
        setQuestionData(newArr);
    }
    let positionSum=0;
    let leftOffset = 0;
    return(questionArray.map((question, i) =>{
        positionSum+=displayedQuestionWidths[question[1]]
        let questionWidth = displayedQuestionWidths[question[1]];
        
        if(questionArray.length==i+1){
            questionWidth=100//maxWidth-positionSum;
        }
        leftOffset+=questionWidth;
        return(
        <div className="questionNamesDiv" key={question[1]} >
            
            <p className={`questionName${questionData[question[1]-1].display ? "" : "Hidden"}`} style={{width: questionWidth+4}}>
                {question[0]}
                {questionData[question[1]-1].display ? null : <button className="restoreButton" onClick={()=>restoreQuestion(question[1])}>
                    Restore
                    <p className="restoreNotice">Question will be restored on the submission form</p>
                </button>}  
            </p>
            {i+1!=questionArray.length && 
            <Resizer leftOffset={leftOffset} positionSum={positionSum} maxWidth={maxWidth} questionData={questionData} handleStop={handleStop} questionID={question[1]} questionWidths={displayedQuestionWidths} height={height}/>}

        </div>
        )
        
    })    
    );

}

const InformationHeader = ({informationWidths, setInformationWidths, headerWidths, setHeaderWidths, totalHeight, accountInformation}) =>{
    return(
        <div className="informationTitlesDiv">
            
            <div className="firstInformationHeader" style={{width:informationWidths[0]}}>
                Date
            </div>
            <SimpleResizer
            index={0}
            widths={informationWidths} 
            setWidths={setInformationWidths}
            type={"informationWidths"}
            headerWidths={headerWidths}
            setHeaderWidths={setHeaderWidths}
            totalHeight={totalHeight}
            />
            <Tooltip id="IPTooltip" />

            <p className='informationHeader' style={{width:informationWidths[1]}}>
                IP
                {accountInformation.accountType!="Premium"&&<BiSolidLock className="absolute left-[22px] top-[5px] text-red-600 h-[20px] w-[20px] cursor-pointer" data-tooltip-id="IPTooltip" data-tooltip-content="Premium feature" place="top" effect="solid"/>}
            </p>
            <SimpleResizer
            index={1}
            widths={informationWidths} 
            setWidths={setInformationWidths}
            type={"informationWidths"}
            headerWidths={headerWidths}
            setHeaderWidths={setHeaderWidths}
            totalHeight={totalHeight}
            />
            <p className='informationHeader' style={{width:informationWidths[2]}}>
                File Name
            </p>
            <SimpleResizer
            index={2}
            widths={informationWidths} 
            setWidths={setInformationWidths}
            type={"informationWidths"}
            headerWidths={headerWidths}
            setHeaderWidths={setHeaderWidths}
            totalHeight={totalHeight}
            />
            <Tooltip id="dimensionsTooltip" />
            <p className='informationHeader' style={{width:informationWidths[3]}}>
                Dimensions
                {accountInformation.accountType!="Premium"&&<BiSolidLock className="absolute left-[100px] top-[5px] text-red-600 h-[20px] w-[20px] cursor-pointer" data-tooltip-id="dimensionsTooltip" data-tooltip-content="Premium feature" place="top" effect="solid"/>}
            </p>
            <SimpleResizer
            index={3}
            widths={informationWidths} 
            setWidths={setInformationWidths}
            type={"informationWidths"}
            headerWidths={headerWidths}
            setHeaderWidths={setHeaderWidths}
            totalHeight={totalHeight}
            />
            <Tooltip id="filesizeTooltip" />
            <p className='informationHeader' style={{width:informationWidths[4]}}>
                File size
                {accountInformation.accountType!="Premium"&&<BiSolidLock className="absolute left-[70px] top-[5px] text-red-600 h-[20px] w-[20px] cursor-pointer" data-tooltip-id="filesizeTooltip" data-tooltip-content="Premium feature" place="top" effect="solid"/>}
            </p>
            <SimpleResizer
            index={4}
            widths={informationWidths} 
            setWidths={setInformationWidths}
            type={"informationWidths"}
            headerWidths={headerWidths}
            setHeaderWidths={setHeaderWidths}
            totalHeight={totalHeight}
            />
            <p className='informationHeader' style={{width:informationWidths[5]}}>
                Preview
            </p>
            <SimpleResizer
            index={5}
            widths={informationWidths} 
            setWidths={setInformationWidths}
            type={"informationWidths"}
            headerWidths={headerWidths}
            setHeaderWidths={setHeaderWidths}
            totalHeight={totalHeight}
            />

            <p className='informationHeader' style={{width:informationWidths[6]}}>
                Status
            </p>
            
        </div>
    );
}

const ActionHeader = ({actionWidths, setActionWidths, totalHeight, headerWidths, accountInformation}) =>{
    return(
        <div className="informationTitlesDiv">
            
            <p className='firstActionHeader' style={{width:actionWidths[0]+5}}>
                Set Status
            </p>
            <SimpleResizer
            index={0}
            widths={actionWidths} 
            setWidths={setActionWidths}
            type={"actionWidths"}
            totalHeight={totalHeight}
            headerWidths={headerWidths}
            />

            <p className='actionHeader' style={{width:actionWidths[1]}}>
                Set Error
            </p>
            <SimpleResizer
            index={1}
            widths={actionWidths} 
            setWidths={setActionWidths}
            type={"actionWidths"}
            totalHeight={totalHeight}
            headerWidths={headerWidths}
            />

            <p className='actionHeader' style={{width:actionWidths[2]}}>
                Download
            </p>
            <SimpleResizer
            index={2}
            widths={actionWidths} 
            setWidths={setActionWidths}
            type={"actionWidths"}
            totalHeight={totalHeight}
            headerWidths={headerWidths}
            />
            <Tooltip id="tooltip" />
            <p className='actionHeader' style={{width:actionWidths[3]}}>
                Block IP
                {accountInformation.accountType!="Premium"&&<BiSolidLock className="absolute left-[70px] top-[5px] text-red-600 h-[20px] w-[20px] cursor-pointer" data-tooltip-id="tooltip" data-tooltip-content="Premium feature" place="top" effect="solid"/>}
            </p>
            <SimpleResizer
            index={3}
            widths={actionWidths} 
            setWidths={setActionWidths}
            type={"actionWidths"}
            totalHeight={totalHeight}
            headerWidths={headerWidths}
            />

            <p className='actionHeader' style={{width:actionWidths[4]}}>
                Delete
            </p>
            
        </div>
    );
}

const useOutsideAlerter=(ref, setOptionsMenuOpen)=>{

    useEffect(() => {

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target) && event.composedPath()[2].className!="openOptionsMenu" && event.composedPath()[2].className!="optionsMenuDiv") {
            setOptionsMenuOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
    };

    }, [ref]);
}


const Submissions = ({data, setData, questionData, setQuestionData, widthData, cancelRequests, settingsData, setSettingsData, IPData, setIPData, accountInformation, submissionFormData, setSubmissionFormData}) => {
    const {currentUser} = useAuthContext();

    const[headerWidths, setHeaderWidths] = useState(widthData.headerWidths)
    const[questionWidths, setQuestionWidths] = useState(widthData.questionWidths)
    const[informationWidths, setInformationWidths] = useState(widthData.informationWidths)
    const[actionWidths, setActionWidths] = useState(widthData.actionWidths)
    const[showDeleted, setShowDeleted] = useState(false);
    const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
    const [seperateResponses, setSeperateResponses] = useState(settingsData.seperateResponses);
    const [interval, setInterval] = useState("Week")
    const [type, setType] = useState("Line Graph")

    let firstRenderedNum=0;
    let printingRenderedNum=0;
    let finishedRenderedNum=0;
    let errorRenderedNum=0;

    let indexedData = [];
    //indexedData = data.data.map((response, index)=>({inputData:{...response.inputData, index}}))

    data.data.map((response, index)=>{
        let rendered=false;
        questionData.map(question=>{
            const hasResponse = Object.keys(response.inputData).indexOf(question.questionID.toString())>-1;
            if(hasResponse&&question.display||showDeleted){
                rendered = true;
            }
        })
        if(rendered){
            indexedData.push({inputData:{...response.inputData, index}})
            //console.log(response)
            if(cancelRequests.hasOwnProperty(response.inputData.cancelID)&&cancelRequests[response.inputData.cancelID][0]){
                errorRenderedNum++;
            }
            else{
                
                if(response.inputData.status=="Submitted"){
                    firstRenderedNum++;
                }
                if(response.inputData.status=="Printing"){
                    printingRenderedNum++;
                }  
                if(response.inputData.status=="Finished"){
                    finishedRenderedNum++;
                }    
                if(response.inputData.status=="Error"){
                    errorRenderedNum++;
                }
            }
        }
    })
    
    let heights=[];
    heights.push(75+firstRenderedNum*31+(firstRenderedNum==0?1:0));
    heights.push(printingRenderedNum*31);
    heights.push(finishedRenderedNum*31);
    heights.push(errorRenderedNum*31);
    console.log(heights)

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, setOptionsMenuOpen);

    const headerHandleStop=(resizePos, headerID)=>{
        const newArr=[...headerWidths]
        newArr[headerID]=headerWidths[headerID]+resizePos
        if(headerID==0){
            newArr[1]=headerWidths[1]-resizePos
        }
        
        setHeaderWidths(newArr)
    }
    const showDeletedChange = (e)=>{
        const value = e.target.checked;
       
        if(value==true){
            var currentWidth = 0;
            var newQuestionArr = [...questionData];
            var newWidthObj = {};
            questionData.map(question=>{
                var questionObj = {...question}
                if(currentWidth+question.width>headerWidths[0]-10){
                    questionObj.width = 2;
                    
                }
                newWidthObj[question.questionID] = questionObj.width;
                newQuestionArr[question.questionID-1] = questionObj;
                currentWidth+=questionObj.width;

            });
            setQuestionData(newQuestionArr);
            setQuestionWidths(newWidthObj);
            setShowDeleted(true);
            
        }
        else{
            setShowDeleted(false);
        }
        
    }
    const updateSeperateResponses=()=>{
        const docRef = doc(db, "users", currentUser.uid, "data", "settings");
        try{
            runTransaction(db, async (transaction) => {
                const doc = await transaction.get(docRef);
                if (!doc.exists()) {
                    throw "Document does not exist!";
                }        
                console.log("sending settings data")
                const settingsData = doc.data();
                settingsData.seperateResponses=!seperateResponses;
                transaction.update(docRef, settingsData);
                return settingsData;
            });
        setSeperateResponses(!seperateResponses);
        }catch (e) {
            console.error(e);
        }
        
    }
    const resetColumns=()=>{
        

        const resetQuestionData = [...questionData]
        const count = questionData.filter((obj) => obj.display === true).length;
        
        resetQuestionData.map((question, index)=>{
            
            resetQuestionData[index].width = 540/count;
            

        })
        
        setQuestionData(resetQuestionData)

        const resetWidthData={}
        resetQuestionData.map((question)=>{
      
            resetWidthData[question.questionID] = question.width;

        });   
        setQuestionWidths(resetWidthData)
        setHeaderWidths([500, 700])
        setInformationWidths([125, 70, 95, 125, 90, 70, 120, 5])
        setActionWidths([85, 80, 95,90, 70])

        console.log("updating doc")

        updateDoc(doc(db, "users", currentUser.uid, "data", "settings"), {
            headerWidths:[500, 700],
            informationWidths: [125, 70, 95, 125, 90, 70, 120, 5],
            actionWidths: [85, 80, 95,90, 70]
        });
        updateDoc(doc(db, "users", currentUser.uid, "data", "submissionForm"), {
            questions: resetQuestionData
        });
    }
    const toggleDeleteOldFiles=()=>{
        const deleteOldFiles = submissionFormData.deleteOldFiles
        setSubmissionFormData({...submissionFormData, deleteOldFiles:!deleteOldFiles})
        updateDoc(doc(db, "users", currentUser.uid, "data", "submissionForm"), {
            deleteOldFiles: !deleteOldFiles
        });
    }

    const displayedQuestionWidths = {};
    questionData.map((question)=>{

        if(question.display==true||showDeleted){
          displayedQuestionWidths[question.questionID] = questionWidths[question.questionID]
        }  
    }); 
    let firstData=[]
    let printingArr=[];
    let finishedArr=[];
    let errorArr=[];
    
    const uncancelledArr = indexedData.filter(response=>!cancelRequests[response.inputData.cancelID][0])
    const cancelledArr=indexedData.filter(response=>cancelRequests[response.inputData.cancelID][0])

    firstData=uncancelledArr.filter(response=>response.inputData.status=="Submitted")
    printingArr=uncancelledArr.filter(response=>response.inputData.status=="Printing")
    finishedArr=uncancelledArr.filter(response=>response.inputData.status=="Finished")
    errorArr=uncancelledArr.filter(response=>response.inputData.status=="Error").concat(cancelledArr)
    
    

    let totalHeight=0;
    const gapHeight=20;
    const gaps = heights.map((height, index)=>{
        totalHeight+=height
        if(height>1&&seperateResponses){
            totalHeight+=gapHeight+(index==0&&height==76?1:1);
            return(<div key={index} className="blankSeperator" style={{ top:totalHeight-gapHeight, height:gapHeight}}/>)
        }
    })

    const [sentPopup, setSentPopup] = useState({type:"", message:""});
    useEffect(()=>{
        console.log("sent popup: ")
        console.log(sentPopup)
        if(sentPopup.type){
            console.log("setting close timeout")
            setTimeout(()=>{
                setSentPopup({type:"", message:""})
            },5000)
        }
    },[sentPopup])

    const [deleteLock, setDeleteLock] = useState(false);
    useEffect(()=>{
        if(deleteLock){
            setTimeout(()=>{
                setDeleteLock(false)
            },500)
        }
    })
    return (
    <>
        <div className='titleDiv'>Submissions</div> 

        <div className='submissionBox'>
            <div className="headers" style={(seperateResponses&&firstData.length==0&&indexedData.length>0)?{}:{borderBottom: "1px solid black"}}>
                <div className="formQuestionsDiv" style={{width:headerWidths[0]}}>
                    <p className="formInformationText">Form Responses</p>

                    <div className="questionsRow">
                        <div className="topLeftBorder"/>
                        <QuestionHeader 
                        maxWidth={headerWidths[0]}
                        showDeleted={showDeleted} 
                        questionData={questionData} 
                        setQuestionData={setQuestionData} 
                        questionWidths={questionWidths} 
                        setQuestionWidths={setQuestionWidths}
                        height={totalHeight-49}/>
                    </div>
                    
                </div>
                
                <LargeResizer
                questionWidths={displayedQuestionWidths}
                questionData={questionData} 
                setQuestionData={setQuestionData}
                headerWidths={headerWidths} 
                setHeaderWidths={setHeaderWidths}
                headerID={0} 
                handleStop={headerHandleStop}
                informationWidths={informationWidths}
                setInformationWidths={setInformationWidths}
                actionWidths={actionWidths}
                setActionWidths={setActionWidths}
                totalHeight={totalHeight}
                setQuestionWidths={setQuestionWidths}
                /> 
                
                <div className="informationHeaderDiv"style={{width:headerWidths[1]}}>
                    <p className="formInformationText">Information</p>
                    <div className="informationRow">
                        <InformationHeader 
                        informationWidths={informationWidths} 
                        setInformationWidths={setInformationWidths}
                        headerWidths={headerWidths}
                        setHeaderWidths={setHeaderWidths}
                        totalHeight={totalHeight-49}
                        accountInformation={accountInformation}
                        />
                        
                    </div>
                    
                </div>

                <LargeResizer
                questionWidths={questionWidths}
                headerWidths={headerWidths} 
                setHeaderWidths={setHeaderWidths}
                headerID={1} 
                handleStop={headerHandleStop}
                informationWidths={informationWidths}
                setInformationWidths={setInformationWidths}
                actionWidths={actionWidths}
                setActionWidths={setActionWidths}
                totalHeight={totalHeight}
                setQuestionWidths={setQuestionWidths}

                /> 
                
                <div className="informationHeaderDiv" style={{width: 1630-headerWidths[0]-headerWidths[1]-5}}>
                    <p className="formInformationText">Actions</p>
                    <ActionHeader
                    actionWidths={actionWidths}
                    setActionWidths={setActionWidths}
                    headerWidths={headerWidths}
                    totalHeight={totalHeight-49}
                    accountInformation={accountInformation}
                    />
                </div>
                {indexedData.length>0&&gaps}
            </div>
            {(!seperateResponses||(seperateResponses&&firstData.length>0)||indexedData.length==0)&&
            <Responses
            allData={data.data}
            data={seperateResponses?firstData:indexedData}
            setData={setData}
            questionData={questionData}
            headerWidths={headerWidths}
            informationWidths={informationWidths}
            actionWidths={actionWidths}
            showDeleted={showDeleted}
            cancelRequests={cancelRequests}
            seperateResponses={seperateResponses}
            firstSubmissionDiv={true}
            IPData={IPData}
            setIPData={setIPData}
            accountInformation={accountInformation}
            setSentPopup={setSentPopup}
            setDeleteLock={setDeleteLock}
            deleteLock={deleteLock}
            />
            }
        </div>
        {printingArr.length!=0&&seperateResponses&&
        <div className='submissionBox'>
            <Responses
            allData={data.data}
            data={printingArr}
            setData={setData}
            questionData={questionData}
            headerWidths={headerWidths}
            informationWidths={informationWidths}
            actionWidths={actionWidths}
            showDeleted={showDeleted}
            cancelRequests={cancelRequests}
            seperateResponses={seperateResponses}
            firstSubmissionDiv={false}
            IPData={IPData}
            setIPData={setIPData}
            accountInformation={accountInformation}
            setSentPopup={setSentPopup}
            deleteLock={deleteLock}
            setDeleteLock={setDeleteLock}
            />
        </div>
        }
        {finishedArr.length!=0&&seperateResponses&&
        <div className='submissionBox'>
            <Responses
            allData={data.data}
            data={finishedArr}
            setData={setData}
            questionData={questionData}
            headerWidths={headerWidths}
            informationWidths={informationWidths}
            actionWidths={actionWidths}
            showDeleted={showDeleted}
            cancelRequests={cancelRequests}
            seperateResponses={seperateResponses}
            firstSubmissionDiv={false}
            IPData={IPData}
            setIPData={setIPData}
            accountInformation={accountInformation}
            setSentPopup={setSentPopup}
            deleteLock={deleteLock}
            setDeleteLock={setDeleteLock}
            />
        </div>
        }
        {errorArr.length!=0&&seperateResponses&&
        <div className='submissionBox'>
            <Responses
            allData={data.data}
            data={errorArr}
            setData={setData}
            questionData={questionData}
            headerWidths={headerWidths}
            informationWidths={informationWidths}
            actionWidths={actionWidths}
            showDeleted={showDeleted}
            cancelRequests={cancelRequests}
            seperateResponses={seperateResponses}
            firstSubmissionDiv={false}
            IPData={IPData}
            setIPData={setIPData}
            accountInformation={accountInformation}
            setSentPopup={setSentPopup}
            deleteLock={deleteLock}
            setDeleteLock={setDeleteLock}
            />
        </div>
        }
        <div className='optionsMenuDiv'>
            <div className="openOptionsMenu" onClick={()=>setOptionsMenuOpen(!optionsMenuOpen)}>
                <BsThreeDots className='dots'/>
            </div> 
            {optionsMenuOpen &&
                <div className="settingsDiv" ref={wrapperRef}>
                    <p className='optionsText'>Options</p>
                    <hr className='lineBreak'/>
                    <div className="optionDiv">
                        <div className="option">
                            Show responses from deleted questions
                            <input type="checkbox" defaultChecked={showDeleted} onChange={showDeletedChange} className="checkbox"/>
                        </div>
                        <div className="option">
                            Display responses based on status
                            <input type="checkbox" defaultChecked={seperateResponses} onChange={()=>updateSeperateResponses()} className="checkbox"/>
                        </div>
                        <div className="option">
                            Delete oldest files when storage is full
                            <input type="checkbox" defaultChecked={submissionFormData.deleteOldFiles} onChange={()=>toggleDeleteOldFiles()} className="checkbox"/>
                        </div>
                        
                        <div className="option">
                        <p className="resetColumns" onClick={()=>resetColumns()}>Reset Column Widths</p>
                        </div>
                        
                    </div>
                </div>
            } 
        </div>

        <div className="emailSentPopupDiv">
            <span className={`printingEmailPopup${sentPopup.type==="printing" ? 'scaled' : ''}`}>
                {sentPopup.message}
            </span>
            <span className={`finishedEmailPopup${sentPopup.type==="finished" ? 'scaled' : ''}`}>
                {sentPopup.message}
            </span>
            <span className={`errorEmailPopup${sentPopup.type==="error" ? 'scaled' : ''}`}>
                {sentPopup.message}
            </span>
            <span className={`errorSendingEmailPopup${sentPopup.type==="errorSending" ? 'scaled' : ''}`}>
                {sentPopup.message}
            </span>
        </div>
    </>
       
    
    )
  }
export default Submissions