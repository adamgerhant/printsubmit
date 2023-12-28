'use client'
import { FirebaseContext, UserContext } from "@/@types/user";
import React from "react";
import { useAuthContext } from "../../layout";
import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useFirebaseContext } from "../layout";

const IPManager = () =>{
  const {currentUser} = useAuthContext() as UserContext;
  const {submissionData, IPData, accountInformation, setIPData} = useFirebaseContext() as FirebaseContext;


  const IPs = Object.keys(IPData);
  const IPSubmissionCount : {[key: string]:number} = {}
  submissionData.data.map((response: { inputData: {ip: string} })=>{
    if(response.inputData.ip){
      if(!IPs.includes(response.inputData.ip.replace(/\./g, '%2E'))){
        IPs.push(response.inputData.ip.replace(/\./g, '%2E'))
      }
      if(IPSubmissionCount.hasOwnProperty(response.inputData.ip.replace(/\./g, '%2E'))){
        IPSubmissionCount[response.inputData.ip.replace(/\./g, '%2E')]++
      }
      else{
        IPSubmissionCount[response.inputData.ip.replace(/\./g, '%2E')]=1
      }
    }
  })
  const unsortedArray = IPs.map(ip=>{
    if(IPData.hasOwnProperty(ip.replace(/\./g, '%2E'))){
      if(IPSubmissionCount.hasOwnProperty(ip.replace(/\./g, '%2E'))){
        return[ip.replace(/%2E/g, '.'), IPSubmissionCount[ip.replace(/\./g, '%2E')], IPData[ip.replace(/\./g, '%2E')].blocked]
      }
      else{
        return(
          [ip.replace(/%2E/g, '.'), 0, IPData[ip.replace(/\./g, '%2E')].blocked]
        )
      }
      
    }
    else{
      return(
        [ip.replace(/%2E/g, '.'), IPSubmissionCount[ip.replace(/\./g, '%2E')], "blocked status not found"]
      )
    }
  })
  const changeBlockStatus = (IP:string) =>{
    const IPDataCopy = {...IPData}
    IPDataCopy[IP.replace(/\./g, '%2E')].blocked= !IPDataCopy[IP.replace(/\./g, '%2E')].blocked
    setIPData(IPDataCopy)

    updateDoc(doc(db, "users", currentUser.uid, "data", "submissionData", "ipData", "ipData"), {
      [IP.replace(/\./g, '%2E')]: {blocked : IPDataCopy[IP.replace(/\./g, '%2E')].blocked}
    });
  }
  const sortedArr = [...unsortedArray].sort((a, b) => b[1] - a[1]);
  console.log(sortedArr)
  const ipRows = sortedArr.map((row, index)=>{
    return(
      <div key={index} className="ipRow" style={{borderBottom:index==sortedArr.length-1?"none":"1px solid rgb(192, 192, 192)"}}>
        <div className="ipText">{row[0]=="none"?"unknown":row[0]}</div>
        <div className="ipText">{row[1]}</div>
        <div className="ipText" style={{borderRight:"none"}}>
          {row[0]!="none"&&row[2]!="blocked status not found"&&
            <span 
            className="blockButton" 
            style={{color:row[2]?"green": "red"}}
            onClick={()=>changeBlockStatus(row[0])}>
              {row[2]?"Unblock": "Block"}
            </span>
          }
          {row[2]=="blocked status not found"&&
            <span className="blockButton">block status not found</span>
          }
        </div>
      </div>
    )
  })
  if(accountInformation.accountType=="Premium"){
    return(
      <div className="ipManagerDiv">
        <div className="titleDiv">IP Manager
        </div>
        
        <div className="ipBoxDiv">
          <div className="headerDiv">
            <div className="headerText">IP address</div>
            <div className="headerText">Submissions</div>
            <div className="headerText" style={{borderRight:"none"}}>Block/Unblock</div>
          </div>
          {ipRows}
        </div>
        
      </div>
      
    )
  }
  return(<></>)
}

export default IPManager
