'use client'
import logo from "@/public/Logo.svg"
import { useEffect, useState } from "react"
import ReCAPTCHA from 'react-google-recaptcha';

export default function Page() {
    const [subject, setSubject] = useState("")
    const [text, setText] = useState("")
    const [from, setFrom] = useState("")
    const [name, setName] = useState("")
    const [token, setToken] = useState("")
    const [buttonStatus, setButtonStatus] = useState("Send message")
    const [errorMessage, setErrorMessage] = useState("")
    const [requiredFields, setRequiredFields] = useState([false, false, false])
    const [dots, setDots] = useState("")

    useEffect(()=>{
        if(buttonStatus=="Sending message"){
            setTimeout(() => {
                setDots(prevDots => {
                    const dotsCopy = prevDots + ".";
                    return dotsCopy === "...." ? "" : dotsCopy;
                });
            }, 500);
        }
    },[dots, buttonStatus])

    const sendEmail = () =>{

        const requiredFieldsCopy = [...requiredFields]
        if(!from){
            requiredFieldsCopy[0] = true;
        }
        else{
            requiredFieldsCopy[0] = false;
        }
        if(!subject){
            requiredFieldsCopy[1] = true;
        }
        else{
            requiredFieldsCopy[1] = false;
        }
        if(!text){
            requiredFieldsCopy[2] = true;
        }
        else{
            requiredFieldsCopy[2] = false;
        }
        setRequiredFields(requiredFieldsCopy)

        if(requiredFieldsCopy.includes(true)){
            setErrorMessage("Please fill out the highlighted fields")
        }
        else if(!token){
            setErrorMessage("Recaptcha required")
        }
        else if(buttonStatus!="Message sent"){
            setButtonStatus("Sending message")
            setErrorMessage("")
            fetch('https://us-central1-print-submit.cloudfunctions.net/api/sendContactEmail', {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    subject: subject,
                    text: text,
                    from: from,
                    name:name,
                    token:token,
                })
            }).then((response)=>{
                if(response.status==200){
                    setButtonStatus("Message sent")
                }
                else{
                    setButtonStatus("Send message")
                    setErrorMessage("Error sending message")
                }
            })
        }
        
    }
    return (
        <>
            <div className="flex w-full overflow-y-scroll h-[100vh] justify-center">
                <div className="flex flex-col w-full max-w-[1400px] ">
                    <div className="bg-white h-[65px] flex flex-row justify-between items-center">
                        <div className="flex flex-row">
                            <a href="/" className="font-bold text-[25px] py-1 whitespace-nowrap flex flex-row
                            align-center mt-1">
                                <img src={logo.src} className="w-[40px] mt-[-2px] mr-1"/>
                                Print Submit
                            </a>
                            <a href="/about" className="mt-[14px] h-6 ml-14 text-[16px] text-gray-700 px-3 cursor-pointer">
                                About
                            </a>
                            <a href="/pricing" className="mt-[14px] h-[25px]  ml-8 text-[16px] text-gray-700 px-3 cursor-pointer">
                                Pricing
                            </a>
                            <a href="/contact" className="mt-[14px] h-6 ml-8 text-[16px] text-gray-700 px-3 bg-gray-200 rounded-xl cursor-pointer">
                                Contact
                            </a>
                        </div>
                        <div className="flex w-1/2 items-center justify-end cursor-pointer">
                            <a href="/login" className="font-semibold text-blue-600  py-1 px-2 rounded-lg hover:bg-gray-600/[0.1]">Login</a>
                            <a href="/register" className="font-semibold text-blue-600 ml-2  py-1 px-2 rounded-lg hover:bg-gray-600/[0.1]">Create account</a>
                            <a href="/submissions?continue=guest" className="min-w-[170px] font-semibold text-center py-2 ml-3 mr-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer">Go to Dashboard</a>
                        </div>
                    </div> 
                    
                    <div className="px-10 py-8 shadow-xl border w-[600px] mt-14 self-center rounded-sm">   
                        <div className="w-[600px] self-center text-4xl font-semibold text-gray-700">   
                            Contact
                        </div>
                        <div className="flex flex-col">
                            <p className="font-semibold mt-5 mb-1">Your email address</p>
                            <input className={`border border-gray-700 p-1 rounded-sm ${requiredFields[0]?"border-red-500 border-2 m-0":"m-[1px]"}`} onChange={(e)=>setFrom(e.target.value)}/>
                        </div>
                        <div className="mt-5 flex flex-col">
                            <div className="flex flex-row align-baseline mb-1">
                                <p className="font-semibold">Name</p>
                                <p className="text-gray-600 text-sm mt-[3px] ml-2">(optional)</p>
                            </div>
                            <input className={`border border-gray-700 p-1 rounded-sm`} onChange={(e)=>setName(e.target.value)}/>
                        </div>
                        <div className="mt-5 flex flex-col">
                            <p className="font-semibold mb-1">Subject</p> 
                            <input className={`border border-gray-700 p-1 rounded-sm ${requiredFields[1]?"border-red-500 border-2 m-0":"m-[1px]"}`} onChange={(e)=>setSubject(e.target.value)}/>
                        </div>
                        <div className="mt-5 flex flex-col">
                            <p className="font-semibold mb-1">Body</p> 
                            <textarea className={`border border-gray-700 p-1 resize-none rounded-sm ${requiredFields[2]?"border-red-500 border-2 m-0":"m-[1px]"}`} rows={6} onChange={(e)=>setText(e.target.value)}/>
                        </div>
                        <div className="mt-5">
                            <ReCAPTCHA
                            sitekey="6LdJ_r0nAAAAAKTDnNzHjdEe-QV4Cp05KPcGAQtC"
                            onChange={(token : any)=>{setToken(token); setButtonStatus("Send message")}}
                            />
                        </div>
                        <div className="mt-8 flex flex-col w-full items-center relative">
                            <button className="p-2 border border-gray-700 w-52 rounded-sm text-center text-lg" onClick={()=>sendEmail()}>
                                {buttonStatus}
                                {buttonStatus=="Sending message"&&dots}
                            </button>
                            <p className="text-lg text-[#ff0000] mt-3">
                                {errorMessage}
                            </p>
                            {(buttonStatus=="Message sent")&&
                            <p className="text-lg text-green-600 mt-3">
                                Your message has been successfully sent
                            </p>
                            }
                        </div>
                        
                    </div>
                </div>
            </div>

        </>
    )
}
