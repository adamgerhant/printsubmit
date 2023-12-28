'use client'
import React, { useState } from "react";
import Link from "next/link";
import { useFirebaseContext } from "../layout";
import { db } from '@/app/firebase';
import { useAuthContext } from "../../layout";
import { CSVLink } from "react-csv";
import {LineChart} from 'recharts';
import { XAxis, YAxis, Line, Tooltip, CartesianGrid, Bar, BarChart } from 'recharts';

const Statistics = () =>{
    const {submissionData, submissionFormData, emailCount, cancelRequests, accountInformation} = useFirebaseContext();
    const {currentUser} = useAuthContext()
    const [interval, setInterval] = useState("Week")
    const [type, setType] = useState("Line Graph")

    let indexedData = [];

    submissionData.data.map((response, index)=>{
        let rendered=false;
        submissionFormData.questions.map(question=>{
            const hasResponse = Object.keys(response.inputData).indexOf(question.questionID.toString())>-1;
            if(hasResponse&&question.display){
                rendered = true;
            }
        })
        if(rendered){
            indexedData.push({inputData:{...response.inputData, index}})
        }
    })
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
    const totalSubmitted = firstData.length
    const totalPrinting = printingArr.length
    const totalSubmissions = indexedData.length
    const totalFinished = finishedArr.length
    const totalError = uncancelledArr.filter(response=>response.inputData.status=="Error").length
    const totalCancelled = cancelledArr.length;
    const placeholderDate = new Date();
    let statData = [{name: placeholderDate.getMonth()+1+"/"+placeholderDate.getDate(), 
        Submissions: 0, 
        Submitted: 0,
        Printing: 0,
        Finished: 0, 
        Error: 0, 
        Cancelled: 0
    }]
    
    if(indexedData.length>0){

        let firstDate = new Date(indexedData[0].inputData.date);
        
        firstDate.setHours(0, 0, 0, 0)

        if(interval=="Week"){
            firstDate.setDate(firstDate.getDate() - firstDate.getDay()) // Start of the week (Sunday)
        }
        else if(interval=="Month"){
            firstDate.setDate(1)
        }
        let secondDate = new Date(firstDate)
        if(interval=="Day"){
            secondDate.setDate(firstDate.getDate()+1)
        }
        if(interval=="Week"){
            secondDate.setDate(firstDate.getDate()+7)
        }
        if(interval=="Month"){
            secondDate.setMonth(firstDate.getMonth()+1)
        }
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let intervalTotal=0
        let submittedTotal=0;
        let printingTotal=0;
        let finishedTotal=0
        let errorTotal=0
        let cancelledTotal=0;
        let name=""
        let index=0;
        let dataIndex=0;
        const lastDate = new Date(indexedData[indexedData.length-1].inputData.date)
        while(firstDate.getTime()<lastDate.getTime()){

            if(interval=="Day"||interval=="Week"){
                name=firstDate.getMonth()+1+"/"+firstDate.getDate()
            }
            if(interval=="Month"){
                name=months[firstDate.getMonth()]
            }
            statData[dataIndex] = {name:name, 
                Submissions: intervalTotal, 
                Submitted: submittedTotal,
                Printing: printingTotal,
                Finished: finishedTotal, 
                Error: errorTotal, 
                Cancelled: cancelledTotal
            }
           
            if(index<indexedData.length){
                let currentDate = new Date(indexedData[index].inputData.date)
                if(currentDate.getTime()>secondDate.getTime()){
                    firstDate = new Date(secondDate)
                    if(interval=="Day"){
                        secondDate.setDate(firstDate.getDate()+1)
                    }
                    if(interval=="Week"){
                        secondDate.setDate(firstDate.getDate()+7)
                    }
                    if(interval=="Month"){
                        secondDate.setMonth(firstDate.getMonth()+1)
                    }
                    dataIndex++;
                    intervalTotal=0
                    submittedTotal=0;
                    printingTotal=0;
                    finishedTotal=0
                    errorTotal=0
                    cancelledTotal=0;
                }
                else{
                    let response=indexedData[index];
                    intervalTotal++;
                    if(cancelRequests[response.inputData.cancelID][0]){
                        cancelledTotal++
                    }
                    else if(response.inputData.status=="Submitted"){
                        submittedTotal++
                    }
                    else if(response.inputData.status=="Printing"){
                        printingTotal++
                    }
                    else if(response.inputData.status=="Finished"){
                        finishedTotal++
                    }
                    else if(response.inputData.status=="Error"){
                        errorTotal++
                    }    
                                
                    index++;
                }
            }
            else{
                firstDate = secondDate
            }
            
        }
        
    }
    const byteUnits = ['bytes', 'kB', 'MB', 'GB', 'TB'];

    function niceBytes(x){

        let l = 0, n = parseInt(x, 10) || 0;

        while(n >= 1000 && ++l){
            n = n/1000;
        }
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + byteUnits[l]);
    }
    const downloadData=indexedData.map((response, index)=>{
        const modifiedResponse={}
        modifiedResponse.responseNumber = index+1;
        submissionData.data.map((question,index)=>{
            if(question.display){
                modifiedResponse["question"+(index+1)+": "+question.question] = response.inputData[question.questionID]
            }
        })
        const date = new Date(response.inputData.date)
        modifiedResponse.fileName = response.inputData.fileName
        modifiedResponse.width = response.inputData.dimensions.width
        modifiedResponse.height = response.inputData.dimensions.height
        modifiedResponse.length= response.inputData.dimensions.length
        modifiedResponse.units = response.inputData.units
        modifiedResponse.IP = response.inputData.ip
        modifiedResponse.fileSize = niceBytes(response.inputData.fileSize)
        modifiedResponse.date = date.toString()
        if(cancelRequests[response.inputData.cancelID][0]){
            modifiedResponse.status = "Cancelled"
        }
        else{
            modifiedResponse.status = response.inputData.status;
        }
        
        return(modifiedResponse)
    })

    const storageUsed = accountInformation.storageUsed
    const totalStorage = accountInformation.totalStorage*1000*1000*1000
    
    const bytesStored = niceBytes(storageUsed)
    const totalStorageBytes = niceBytes(totalStorage)
    
    let percentUsed = (storageUsed/(totalStorage) * 100).toFixed(3)+"%"
    if(totalStorage==0){
        percentUsed = "100%"
    }
    console.log(percentUsed)
    return(
        <div className="statisticsDiv">
            <div className="titleDiv">Statistics</div>
            <div className="statisticsBoxDiv">
                <div className='optionsText'>
                    Statistics
                    <CSVLink data={downloadData}  filename={"submission_data.csv"}>
                        <div className="downloadData" >Download Data</div>
                    </CSVLink>
                </div>
                <hr className='lineBreak'/>

                <div className="storageDiv">
                    <div className='title' style={{marginTop:"15px"}} >Storage Used</div>
                    <div className="storageUsedDiv">
                        <div className="storageUsedBar" style={{width:percentUsed}}/>
                    </div>
                    <div className="storageInformationDiv">
                        <span className="storageUsedText">
                            {percentUsed}
                        </span>
                        <span className="storageUsedText">
                            {bytesStored} / {totalStorageBytes}
                        </span>
                        {accountInformation.accountType!="Premium"&&
                            <a href="/pricing" target="_blank" className="upgradeButton">
                                Upgrade
                            </a>
                        }
                        
                    </div>
                    
                </div>
                <div className='title'>Number of Emails</div>
                <div className="statsDiv">
                    <div className="firstStatNameDiv">
                        <div className="firstStatRow">
                            Maximum daily emails
                        </div>                        
                        <div className="statRow">
                            Total emails sent
                        </div>
                        <div className="statRow">
                            Finished emails
                        </div>
                    </div>
                    <div className="statNumDiv">
                        <div className="firstStatRow">
                            {accountInformation.dailyMax}
                        </div>
                        {accountInformation.accountType!="Premium"&&
                            <a href="/pricing" style={{top:"163px", left:"200px"}} target="_blank" className="upgradeButton">
                            Upgrade
                        </a>
                        }
                        
                        <div className="statRow">
                            {emailCount.total}
                        </div>

                        <div className="statRow">
                            {emailCount.finished}

                        </div>
                    </div>
                    <div className="statNameDiv">
                        <div className="firstStatRow">
                            Emails sent today
                        </div>                        
                        <div className="statRow">
                            Submitted emails
                        </div>
                        <div className="statRow">
                            Error emails

                        </div>
                    </div>
                    <div className="statNumDiv">
                        <div className="firstStatRow">
                            {emailCount.dailyTotal}
                        </div>
                        
                        <div className="statRow">
                            {emailCount.submitted} 
                        </div>
                        <div className="statRow">
                            {emailCount.error}
                        </div>
                    </div>
                    <div className="statNameDiv">
                        <div className="firstStatRow"/>

                        <div className="statRow">
                            Printing emails
                        </div>                        
                    
                    </div>
                    <div className="statNumDiv">
                        <div className="firstStatRow"/>
                    
                        <div className="statRow">
                            {emailCount.printing}
                        </div>
                    </div>
                </div>
                <hr className="lineBreak"/>
                <div className='title'>Number of Submissions</div>

                <div className="statsDiv">

                    <div className="firstStatNameDiv">
                        <div className="statRow">
                            Total Submissions 
                        </div>                        
                        <div className="statRow">
                            Submitted
                        </div>
                    </div>
                    <div className="statNumDiv">
                        <div className="statRow">
                            {totalSubmissions} 
                        </div>
                        
                        <div className="statRow">
                            {totalSubmitted}
                        </div>
                        
                    </div>
                    <div className="statNameDiv" >         
                        <div className="statRow">
                            Finished 
                        </div>
                        <div className="statRow">
                            Printing 
                        </div>
                    </div>
                    <div className="statNumDiv">
                        <div className="statRow">
                            {totalFinished} 
                        </div>
                        <div className="statRow">
                            {totalPrinting}
                        </div>
                    </div>
                    <div className="statNameDiv" >         
                        <div className="statRow">
                            Cancelled 
                        </div>
                        <div className="statRow">
                            Error
                        </div>
                    </div>
                    <div className="statNumDiv">
                        <div className="statRow">
                            {totalError}
                        </div>
                        <div className="statRow">
                            {totalCancelled} 
                        </div>
                    </div>
                </div>
                <div className="selectDiv">
                    Interval
                    <select className="selectInterval" value={interval} onChange={(e)=>setInterval(e.target.value)}>
                        <option value="Day" className="variable">Day</option>
                        <option value="Week" className="variable">Week</option>
                        <option value="Month" className="variable">Month</option>
                    </select>
                    Type
                    <select className="selectInterval" value={type} onChange={(e)=>setType(e.target.value)}>
                        <option value="Histogram" className="variable">Histogram</option>
                        <option value="Line Graph" className="variable">Line Graph</option>
                    </select>
                </div>
                {type=="Line Graph"&&
                <LineChart
                    width={770}
                    height={310}
                    data={statData}
                    margin={{
                        top: 25,
                        right: 30,
                        left: 0,
                        bottom: 5
                    }}
                    >
                    <XAxis dataKey="name"/>
                    <YAxis yAxisId="yAxis"/>
                    <Tooltip/>
                    <Line type="monotone" dataKey="Submissions" stroke='#000000' yAxisId="yAxis" />
                    <Line type="monotone" dataKey="Cancelled" stroke="#5a5a5a" yAxisId="yAxis"/>
                    <Line type="monotone" dataKey="Error" stroke="#ff0000"yAxisId="yAxis" />
                    <Line type="monotone" dataKey="Finished" stroke="#09871a" yAxisId="yAxis"/>
                </LineChart>
                }
                {type=="Histogram"&&
                <BarChart 
                    width={770}
                    height={310}
                    data={statData}
                    margin={{
                        top: 25,
                        right: 30,
                        left: 0,
                        bottom: 5
                    }} >
                    <XAxis dataKey="name"/>
                    <YAxis />
                    <Tooltip/>
                    <Bar dataKey="Submitted" stackId="a" fill="#ff0000" />
                    <Bar dataKey="Printing" stackId="a" fill="#e4dc00" />
                    <Bar dataKey="Finished" stackId="a" fill="#09871a" />
                    <Bar dataKey="Error" stackId="a" fill="#ad0000" />
                    <Bar dataKey="Cancelled" stackId="a" fill="#5a5a5a" />
                </BarChart>
                }
            </div>
                    
        </div>
    )
}
export default Statistics