import logo from "@/public/Logo.svg"
import clientSubmission from "@/public/clientSubmission.png"
export default function Page() {

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
                        <a href="/about" className="mt-[14px] h-6 ml-14 text-[16px] text-gray-700 px-3 bg-gray-200 rounded-xl cursor-pointer">
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
                <div className="border w-[850px] mt-14 px-10 py-4 self-center shadow">
                    <div className="flex flex-row mb-2">
                        <div className="h-[70px] w-[70px] rounded-xl bg-gray-300"/>
                        <div className="flex flex-col ml-4 justify-end">
                            <p className="text-lg font-bold text-gray-700">Developer</p>
                            <p className="text-2xl">Adam Gerhant</p>
                        </div>
                    </div>
                    <hr/>
                    <div className="text text-gray-800 mt-2 w">Hi, I'm Adam. I had the idea for Print Submit after starting a 3D printing service at my local library,
                     and realizing there were no good tools for creating an online submission form specifically for 3D print requests.
                     This app helps simplify this process and includes many security, customizeablilty, and quality of life features.</div>
                </div> 

                <div className="w-[900px] self-center mt-10 flex flex-col">
                    <p className="font-semibold text-xl">How a server side submission process enables maximum security</p>
                    <p className="text-gray-800 mt-2">THe simplest way to upload files to a server is by allowing the database to be publicly writeable,
                    and have the client send files as needed. However, this is not a safe method, since there is no way to enfore security. Any data can be uploaded at any time. 
                    </p>
                    <img className="w-[600px] self-center"src={clientSubmission.src}/>
                    <p className="text-gray-800 mt-2">With client side submissions, if a user can upload a file, then a malicious user can as well. This is why Print Submit 
                    uses a server side submission process.
                    The basic process beind this is to first verify the request, send a temporary upload link to the user, and then verify if the correct files were submitted.
                    </p>
                </div>
               
            </div>
        </div>

    </>
  )
}
