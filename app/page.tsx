import Link from "next/link"
import submissions from "../public/submissions.png"
import submissionFocus from "../public/submissionFocus.png"
import submissionForm from "../public/submissionForm.png"
import emails from "../public/emails.png"
import analytics from "../public/analytics.png"
import logo from "../public/Logo.svg"
export default function Page() {

  return (
    <>
      <div className="flex w-full justify-center">
        <div className="flex flex-col w-full max-w-[1400px] ">
          <div className="bg-white h-[65px] max-w-[1400px] flex flex-row justify-between items-center">
            <div className="flex flex-row">
              <a href="/" className="font-bold text-[25px] py-1 whitespace-nowrap flex flex-row
              align-center mt-1">
                  <img src={logo.src} className="w-[40px] mt-[-2px] mr-1"/>
                  Print Submit
              </a>
              <a href="/about" className="mt-[14px] h-6 ml-14 text-[16px] text-gray-700 px-3 cursor-pointer">
                  About
              </a>
              <a href="/pricing" className="mt-[14px] h-[25px] ml-8 text-[16px] text-gray-700 px-3 cursor-pointer">
                  Pricing
              </a>
              <a href="/contact" className="mt-[14px] h-6 ml-8 text-[16px] text-gray-700 px-3 cursor-pointer">
                  Contact
              </a>
            </div>
            <div className="flex w-1/2 items-center justify-end cursor-pointer">
              <a href="/login" className="font-semibold text-blue-600  py-1 px-2 rounded-lg hover:bg-gray-600/[0.1]">Login</a>
              <a href="/register" className="font-semibold text-blue-600 ml-2  py-1 px-2 rounded-lg hover:bg-gray-600/[0.1]">Create account</a>
              <a href="/submissions?continue=guest" className="min-w-[170px] font-semibold text-center py-2 ml-3 mr-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer">Go to Dashboard</a>
            </div>

          </div>

          <div className="flex flex-row mt-32 relative">
            <div className="flex flex-col w-[490px] mt-5">
              <h1 className="text-6xl font-semibold mb-8">3D print file submission and managment</h1>
              <p className="text-xl font-light"> Create a customizable submission form, manage responses, and send automated emails.</p>
              <a href="/submissions?continue=guest" className="w-[200px] font-semibold text-center py-3 mt-10 bg-blue-600 text-white text-xl rounded-md cursor-pointer">Go to Dashboard</a>
            </div>
            <img src={submissions.src} className="absolute left-[490px] top-[-10px] w-[1040px] shadow-xl ml-4 "/>
          </div>  

          <div className="w-full mt-[300px]">
            <h2 className="text-4xl font-semibold text-center">Who is this app built for?</h2>
          </div>
          <div className="w-[950px] self-center mt-4 mb-[200px]">
            <p className="text-xl text-center flex flex-col">
              <span>
                3D printing makerspaces that need to efficiently manage and print client submissions. 
              </span>
              <span>
                For example, staff at libraries or universities, teachers, or businesses with custom print requests.
              </span>
            </p>
          </div>

          <div className="flex flex-row w-full">
            <div className="w-[500px] flex flex-col">
              <p className="text-4xl font-semibold mb-4 mt-3">Create a custom form</p>
              <p className="text-lg text-gray-600 mb-6">Use the submission form editor to create a public form for users to submit files and information</p>
              <hr/>
              <span className="rounded py-1 bg-blue-100 mt-6 w-28 text-center">
                <p className="text-blue-600 font-bold">Customize</p>
              </span>
              <div className="flex flex-row w-3/4 ml-6 mt-2">
                <ul className="list-disc grow text-lg">
                  <li className="mt-2">Title</li>
                  <li className="mt-2">Information</li>
                  <li className="mt-2">Questions</li>
                  <li className="mt-2">Variables</li>
                </ul>
                <ul className="list-disc text-lg">
                  <li className="mt-2">Text inputs</li>
                  <li className="mt-2">Dropdown inputs</li>
                  <li className="mt-2">Maximum model size</li>
                  <li className="mt-2">Closed form</li>
                </ul>
              </div>
            </div>
            <div>            
              <img src={submissionForm.src} className="shadow-xl self-end ml-[40px] w-[900px]"/>
            </div>
          </div>
          
          <div className="flex flex-row w-full mt-52">
            <div>            
              <img src={emails.src} className="shadow-xl ml-[-40px] w-[1100px]"/>
            </div>
            <div className="flex flex-col ml-8 w-[500px]">
              <p className="text-4xl font-semibold mb-4 mt-2">Customize emails</p>
              <p className="text-xl text-gray-600 mb-6">Use the email editor to select triggers to automatically send emails, customize subjust and body, and use variables for information from the submission.</p>
              <hr/>
              <span className="rounded py-1 bg-blue-100 mt-6 w-28 text-center">
                <p className="text-blue-600 font-bold">Features</p>
              </span>
              <div className="flex flex-row w-3/4 ml-6 mt-2">
                <ul className="list-disc grow text-lg">
                  <li className="mt-2">Send emails from any Google account</li>
                  <li className="mt-2">Set automatic email triggers</li>
                  <li className="mt-2">Custom Subject</li>
                  <li className="mt-2">Custom Body</li>
                  <li className="mt-2">Variables for name and error message</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-row w-full mt-52">
            <div className="w-[500px] flex flex-col">
              <p className="text-4xl font-semibold mb-4 mt-3">Manage Submissions</p>
              <p className="text-lg text-gray-600 mb-6">View submission form responses, upload information, and perform various actions on each response</p>
              <hr/>
              <span className="rounded py-1 bg-blue-100 mt-6 w-28 text-center">
                <p className="text-blue-600 font-bold">Features</p>
              </span>
              <div className="flex flex-row w-full ml-6 mt-2">
                <ul className="list-disc text-lg w-[260px]">
                  <li className="mt-2">Expandable cells</li>
                  <li className="mt-2">View information</li>
                  <li className="mt-2">Block/Unblock IPs</li>
                  <li className="mt-2">Set Error</li>
                </ul>
                <ul className="list-disc text-lg">
                  <li className="mt-2">Adjustable column widths</li>
                  <li className="mt-2">Update print status</li>
                  <li className="mt-2">Download file</li>
                  <li className="mt-2">Delete responses</li>
                </ul>
              </div>
            </div>
            <div>            
              <img src={submissionFocus.src} className="shadow-xl self-end ml-[40px] w-[900px]"/>
            </div>
          </div>

          <div className="flex flex-row w-full mt-52">
            <div className="w-[1000px]">            
              <img src={analytics.src} className="shadow-xl shadow-xl ml-40 w-[600px]"/>
            </div>
            <div className="flex flex-col ml-8 w-[500px]">
              <p className="text-4xl font-semibold mb-4 mt-2">Statistics</p>
              <p className="text-xl text-gray-600 mb-6">In depth statistics to keep track of usage</p>
              <hr/>
              <span className="rounded py-1 bg-blue-100 mt-6 w-28 text-center">
                <p className="text-blue-600 font-bold">Features</p>
              </span>
              <div className="flex flex-row w-3/4 ml-6 mt-2">
                <ul className="list-disc grow text-lg">
                  <li className="mt-2">Storage used</li>
                  <li className="mt-2">Number of emails and submissions</li>
                  <li className="mt-2">View line and histogram plots of submission data</li>
                  <li className="mt-2">Modifiable intervals</li>
                  <li className="mt-2">Download all response data</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-[300px] self-center">footer</div>
        </div>

        
      </div>
      
      
    </>
    
    
  )
}
