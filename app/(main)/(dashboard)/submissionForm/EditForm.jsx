import React from 'react'
import { collection, doc, getDoc, setDoc} from "firebase/firestore";
import { db} from '@/app/firebase';
import { useEffect, useState, useRef} from 'react';
import { useAuthContext } from '../../layout';
import {RxCross2} from 'react-icons/rx'
import { BiSolidLock } from 'react-icons/bi';
import Slider from '@mui/material/Slider';
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

const Questions = ({accountInformation, deleteQuestion, displayArray, onChange, variableChange, typeChange, tempSubmissionFormData, setTempSubmissionFormData}) => {
    const [optionInput, setOptionInput] = useState("")
    if(displayArray === null || displayArray === undefined){
        return(<div/>);
    }
    let questionNumber = 0;

    const handleDescriptionChange = e =>{
        const id = e.target.id;
        const text = e.target.value;
        onChange(id, "description", text)
    }
    const handleQuestionChange = e =>{
        const id = e.target.id;
        const text = e.target.value;
        onChange(id, "question", text)
    }
    const handleRequiredChange = (e) =>{
        const id=e.target.id;
        const value = e.target.checked;//=="on" ? true : false;
        if(displayArray.filter(question=>(question.questionID==id&&question.variable=="")).length>0){
            onChange(id, "required", value)
        }
    }
    const addOption = (id) =>{
        if(accountInformation.accountType=="Premium"){
            let newObj = {...tempSubmissionFormData}
            newObj.questions[id-1].options.push(optionInput);
            setTempSubmissionFormData(newObj)
            setOptionInput("");
        }
        
    } 
    const deleteOption = (id, index)=>{
        let newObj = {...tempSubmissionFormData}
        newObj.questions[id-1].options.splice(index, 1);
        setTempSubmissionFormData(newObj)
    }
    
    return  displayArray.map((questionObject) => {
        let options = ["email", "name"];
        
        displayArray.map((question)=>{
            if(question.variable!=""){
                const index = options.indexOf(question.variable)
                options.splice(index, 1)
                
            }
        })

        const optionCards = questionObject.options.map((option, index)=>{
            return(
                <span key="index" className="optionCardSpan">
                    {option}
                    <RxCross2 className="deleteOption" onClick={()=>deleteOption(questionObject.questionID, index)}/>
                </span>
            )
        })
        let displayOptions=[questionObject.variable];
        if(questionObject.variable!=""){
            displayOptions.push("")
        }
        displayOptions = displayOptions.concat(options);
        const allOptions = displayOptions.map((variable, i)=>{
            if(variable==""){
                return(<option key={i} value={variable} className="none">none</option>)
            }
            else{
                return(<option key={i} value={variable} className="variable">{variable}</option>)
            }
            

        })
        const handleKeyPress = (event, id) =>{
            if (event.key === 'Enter') {
                addOption(id)
            } 
        }
        if(questionObject.display){
            questionNumber++;
        
            return(
            <div className="questionDiv" key={questionObject.questionID}> 
                
                    <div className = "formRow">
                    <label className = "editInputText">Question {questionNumber}</label>
                        <input type="text" onChange={(e)=>handleQuestionChange(e)} defaultValue={questionObject.question} id={questionObject.questionID} className="input"/>
                    </div>
                    <div className = "formRow">
                        <label className = "editInputText">Description</label>
                        <input type="text" onChange={(e)=>handleDescriptionChange(e)} value={questionObject.description} id={questionObject.questionID} className="input"/>          
                    </div>
                
                {questionObject.type=="dropdown"&&
                <div className="relative">
                    {accountInformation.accountType!="Premium"&&
                    <>
                        <Tooltip id="dropdownTooltip" />
                        <div className='left-[10px] top-[-5px] w-[768px] h-[110px] bg-gray-500/[0.2] rounded-lg absolute cursor-pointer' data-tooltip-id="dropdownTooltip" data-tooltip-content="Premium feature" place="top" effect="solid"/>
                    </>
                        
                    }
                    <div className = "formRow" style={{marginTop:"5px", alignItems:"start"}}>
                        <label className = "editInputText" style={{width:"230px"}}>Current dropdown options:</label>
                        <div className="allOptionCardsDiv">{optionCards}</div>
                    </div>
                    <div className = "formRow">
                        <label className = "editInputText" style={{width:"148px"}}>Add new option:</label>
                        <input type="text" className="optionInput" onKeyDown={(e)=>handleKeyPress(e, questionObject.questionID)}value={optionInput} onChange={(e)=>setOptionInput(e.target.value)} ></input>
                        <button className="addOptionButton" onClick={()=>{addOption(questionObject.questionID)}}>Add option</button>
                    </div>
                </div>
                }
              
                <div className="requiredInputDiv">
                    Required
                    <input type="checkbox" onChange={(e)=>handleRequiredChange(e)} checked={questionObject.required} id={questionObject.questionID} className="checkboxInput"/>
                    Variable
                    <select id="test"className={`selectVariable ${questionObject.variable==""?"none":""}`} value={questionObject.variable} onChange={(e)=>variableChange(e, questionObject.questionID)}>
                        {allOptions}
                    </select>
                    Input type
                    <div className='flex flex-row'>
                        <select className={"selectVariable"} value={questionObject.type} onChange={(e)=>typeChange(e, questionObject.questionID)}>
                            <option value="text" className="variable">text</option>
                            <option value="dropdown" className="variable">
                                dropdown
                            </option>
                            
                        </select>
                        {questionObject.type=="dropdown"&&accountInformation.accountType!="Premium"&&<>
                            <Tooltip id="tooltip" />
                            <BiSolidLock className="text-red-600 h-[20px] w-[20px] cursor-pointer" data-tooltip-id="tooltip" data-tooltip-content="Premium feature" place="top" effect="solid"/>
                        </>
                        }
                       
                    </div>
                    
                    <button className="deleteButton" style={{marginLeft:questionObject.type=="dropdown"?"140px":"160px"}} onClick={()=>deleteQuestion(questionObject.questionID)}>Delete question</button>
                    
                </div>
            </div> 
        )}
        
    })
}

const EditForm = ({submissionFormData, setSubmissionFormData, headerWidth, accountInformation}) => {
    const [tempSubmissionFormData, setTempSubmissionFormData] = useState(submissionFormData)
    const [highlighting, setHighlighting]=  useState(false);
    const {currentUser} = useAuthContext ();

    const addQuestion = () => {
        const newObj = {...tempSubmissionFormData}
        const displayedQuestions = newObj.questions.filter(question=> question.display).length+1;
        const questionWidth=headerWidth/(displayedQuestions)
        newObj.questions.map((question, index)=>{
            newObj.questions[index].width = questionWidth;
        })
        newObj.questions.push({questionID:newObj.questions[newObj.questions.length-1].questionID+1, question: "", description: "", required:true, display:true, width:questionWidth, variable:"", type:"text", options:[]})
        setTempSubmissionFormData(newObj);
    }  

    const deleteQuestion = (id) =>{
        const newObj = {...tempSubmissionFormData}
        const displayedQuestions = newObj.questions.filter(question=>question.display).length;
        if(displayedQuestions>1){
            const questionWidth = headerWidth/(displayedQuestions-1);
            newObj.questions.map((question, index)=>{
                newObj.questions[index].width = questionWidth;
                if(question.questionID===id){
                    newObj.questions[index].display = false;
                    newObj.questions[index].variable = "";
                }   
            })  
            setTempSubmissionFormData(newObj);
        }
        
    }
   
    const saveData = () => {
        
        console.log("sending form data to server")   
        console.log(tempSubmissionFormData)
        setDoc(doc(db, "users", currentUser.uid, "data", "submissionForm"), {
            ...tempSubmissionFormData
        });    
        setSubmissionFormData(tempSubmissionFormData)
        setHighlighting(true);
        setTimeout(() => {
            setHighlighting(false);
        }, 50);
    }

    const handleInputChange = (id, type, value) => {
        const newObj = {...tempSubmissionFormData}
        const ids = newObj.questions.map(e => e.questionID)
        const index = ids.indexOf(parseInt(id, 10));
        newObj.questions[index][type] = value;
        setTempSubmissionFormData(newObj);
    }

    const handleTitleChange = (e) =>{
        const newObj={...tempSubmissionFormData};
        newObj.title=e.target.value
        setTempSubmissionFormData(newObj);
    }

    const handleHeaderDescriptionChange = (e) =>{
        let newObj={...tempSubmissionFormData};
        newObj.description=e.target.value;
        setTempSubmissionFormData(newObj);
    }
    
    const handleUploadInformationChange =(e)=>{
        const newObj = {...tempSubmissionFormData};
        newObj.uploadInformation = e.target.value;
        setTempSubmissionFormData(newObj)
    }
    const variableChange=(e, id)=>{
        let newObj = {...tempSubmissionFormData};
        newObj.questions[id-1].variable = e.target.value;
        if(e.target.value!=""){
            newObj.questions[id-1].required = true;
        }
        setTempSubmissionFormData(newObj);
    }
    const typeChange=(e, id)=>{
        let newObj = {...tempSubmissionFormData};
        newObj.questions[id-1].type = e.target.value;
        setTempSubmissionFormData(newObj);
    }
    const handleClose=(value)=>{
        let newObj = {...tempSubmissionFormData}
        newObj.closed = value;
        setTempSubmissionFormData(newObj)
    }
    const handleClosedTitleChange=(e)=>{
        let newObj = {...tempSubmissionFormData}
        newObj.closedTitle = e.target.value
        setTempSubmissionFormData(newObj)
    }
    const handleClosedInformationChange=(e)=>{
        let newObj = {...tempSubmissionFormData}
        newObj.closedInformation = e.target.value
        setTempSubmissionFormData(newObj)
    }
    const enableMaxSize = (e)=>{
        if(accountInformation.accountType=="Premium"){
            let newObj = {...tempSubmissionFormData}
            newObj.maxSizeEnabled = e.target.checked
            setTempSubmissionFormData(newObj)
        }
    }
    const handleDimensionSize = (e, index)=>{
        let newObj = {...tempSubmissionFormData}
        newObj.maxSize[index] = e.target.value;
        setTempSubmissionFormData(newObj)
    }
    const handleUnitChange = (e) =>{
        let newObj = {...tempSubmissionFormData}
        newObj.units = e.target.value;
        setTempSubmissionFormData(newObj)
    }
    const handleMaxUploadSize = (e)=>{
        let newObj = {...tempSubmissionFormData}
        newObj.maxUploadSize = e.target.value;
        setTempSubmissionFormData(newObj)
    }
    const enableCaptcha = (e)=>{
        if(accountInformation.accountType=="Premium"){
            let newObj = {...tempSubmissionFormData}
            newObj.captchaEnabled = e.target.checked;
            setTempSubmissionFormData(newObj)
        }
        
    }
    return (

        <div className={`editFormContainer${highlighting ? " highlight" : ""}`}>
            <div className = "editForm">
            {!tempSubmissionFormData.closed && 
            <> 
                <div className="editHeader">
                    <div className = "firstFormRow">
                        <label className = "editInputText">Title</label>
                        <input onChange={(e)=>handleTitleChange(e)} defaultValue={tempSubmissionFormData.title}type="text" id="title" className="input"/>
                    </div>          
                    <div className = "formRowUnaligned">
                        <label  className = "editInputText">Information</label>
                        <textarea onChange={(e)=>handleHeaderDescriptionChange(e)}  defaultValue={tempSubmissionFormData.description} type="text"  rows="3" id="information" className="input"/>
                    </div>
                </div>
                    
                
                <div className = "questionTextDiv">
                        <p className = "questionsText"></p>
                    </div>
                <div className="questionsDiv">
                    <Questions accountInformation={accountInformation} typeChange={typeChange} variableChange={variableChange} onChange={handleInputChange} deleteQuestion={deleteQuestion} displayArray={tempSubmissionFormData.questions} tempSubmissionFormData={tempSubmissionFormData} setTempSubmissionFormData={setTempSubmissionFormData}/>
                    <div className="addNewButtonDiv">
                        <button onClick={()=>addQuestion()} className='addNewButton'>+ Add new question</button>
                    </div>
                </div>
                <div className="lastFormRowDiv">
                    
                    <div className = "lastFormRow">
                        <div className="flex flex-row mt-2">
                            <label className = "editInputText">Upload Information</label>
                            <input onChange={(e)=>handleUploadInformationChange(e)} defaultValue={tempSubmissionFormData.uploadInformation}type="text" id="title" className="uploadInformationInput"/>
                        </div>
                        <div className="flex flex-row mt-5 pr-4 w-full relative">
                            
                            <label className = "maxSizeText">Maximum upload size</label>

                                
                            <Slider
                            onChange={(e)=>handleMaxUploadSize(e)}
                            sx={{ left:10, width: 530, bottom:5 }} 
                            defaultValue={tempSubmissionFormData.maxUploadSize}
                            valueLabelDisplay="auto"
                            step={5}
                            min={5}
                            max={250}
                            marks={[
                                { value: 5, label: '5 MB' },
                        
                                { value: 250, label: '250 MB' },
                            ]}
                            valueLabelFormat={(value) => `${value} MB`}
                            /> 
                            
                        </div>
                        <div className="flex flex-row mt-0 relative">
                            <Tooltip id="tooltip" />
                            {accountInformation.accountType!="Premium"&&<>
                                <BiSolidLock className="absolute left-[10px] top-[1px] text-red-600 h-[20px] w-[20px] " />
                                <div className="absolute left-[5px] top-[-3px] rounded bg-gray-500/[0.2] w-[465px] h-[33px] cursor-pointer" data-tooltip-id="tooltip" data-tooltip-content="Premium feature" place="top" effect="solid"></div>
                            </>}
                            <label className = "maxSizeText">Maximum dimensions</label>
                            <input className="cursor-pointer" type="checkbox" checked={tempSubmissionFormData.maxSizeEnabled} onChange={(e)=>enableMaxSize(e)}></input>
                            {tempSubmissionFormData.maxSizeEnabled&&
                            <>
                                <span className="w-[250px] flex flex-row">
                                    <input className="input" onClick={(event) => event.target.select()} value={tempSubmissionFormData.maxSize[0]} onChange={(e)=>handleDimensionSize(e, 0)} style={{width:"30px", marginRight:"0px", marginLeft:"26px", height:"22px"}}/>
                                    <div className="mt-[5px] text-sm ml-[2px] w-[24px]">{tempSubmissionFormData.units}</div><span className="text-lg ml-1">x</span>
                                    <input className="input" onClick={(event) => event.target.select()} value={tempSubmissionFormData.maxSize[1]} onChange={(e)=>handleDimensionSize(e, 1)} style={{width:"30px", marginRight:"0px", marginLeft:"10px", height:"22px"}}/>
                                    <div className="mt-[5px] text-sm ml-[2px] w-[24px]">{tempSubmissionFormData.units}</div><span className="text-lg ml-1">x</span>
                                    <input className="input" onClick={(event) => event.target.select()} value={tempSubmissionFormData.maxSize[2]} onChange={(e)=>handleDimensionSize(e, 2)} style={{width:"30px", marginRight:"0px", marginLeft:"10px", height:"22px"}}/>
                                    <div className="mt-[5px] text-sm ml-[2px] w-[24px]">{tempSubmissionFormData.units}</div>
                                </span>     
                            </>
                            }
                            <label className = "editInputText" style={{width:"80px"}}>Units</label>

                                <select className = "border-[1px] border-gray-400 rounded-sm cursor-pointer" value={tempSubmissionFormData.units} onChange={(e)=>handleUnitChange(e)}>
                                    <option value="in" >in</option>
                                    <option value="mm" >mm</option>
                                </select>
                            </div>
                            <div className="flex flex-row mt-3 relative">

                        </div>
                       
                        {tempSubmissionFormData.maxSizeEnabled&&
                        <div className="flex flex-row">
                            <span className="text-sm ml-8 mt-[-10px] text-gray-500">3D model can only be submitted if it can fit into a box of given dimensions</span>
                        </div>
                        }
                        
                        <div className="flex flex-row mt-2 relative" >
                            <Tooltip id="tooltip" />
                            {accountInformation.accountType!="Premium"&&<>
                            <BiSolidLock className="absolute left-[28px] top-[1px] text-red-600 h-[20px] w-[20px] " />
                            <div className="absolute left-[20px] rounded bg-gray-500/[0.2] w-[230px] h-[24px] cursor-pointer" data-tooltip-id="tooltip" data-tooltip-content="Premium feature" place="top" effect="solid"></div>
                            </>}
                            <label className = "maxSizeText">Enable reCAPTCHA</label>
                            <input className="cursor-pointer" type="checkbox" checked={tempSubmissionFormData.captchaEnabled} onChange={(e)=>enableCaptcha(e)}></input>
                        </div>
                    </div>
                </div>

            </>}
            {tempSubmissionFormData.closed &&
            <div className="editHeader">
                    <div className = "firstFormRow">
                        <label className = "editInputText">Title</label>
                        <input onChange={(e)=>handleClosedTitleChange(e)} value={tempSubmissionFormData.closedTitle}type="text" id="title" className="input"/>
                    </div>          
                    <div className = "formRowUnaligned">
                        <label  className = "editInputText">Information</label>
                        <textarea onChange={(e)=>handleClosedInformationChange(e)}  value={tempSubmissionFormData.closedInformation} type="text"  rows="5" id="information" className="input"/>
                    </div>
            </div>
            }
            </div>
            <div className="bottomDiv">

                <div className='openCloseDiv'>
                    <div className={'openDiv'+(!tempSubmissionFormData.closed?"Selected":"")} onClick={()=>handleClose(false)}>Open Form</div>
                    <div className={'closedDiv'+(tempSubmissionFormData.closed?"Selected":"")} onClick={()=>handleClose(true)}>Close Form</div>
                </div>
                <div className = "saveDiv">
                    <input type="submit" onClick={()=>saveData()} value="Save changes" className='saveButton'/>  
                </div>
            </div>
        </div>
    )

}

export default EditForm