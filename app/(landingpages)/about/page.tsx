import logo from "@/public/Logo.svg"
import clientSubmission from "@/public/mediumClientSide2.png"//"@/public/clientSubmission.png"
import serverSubmission from "@/public/mediumServerSide.png"//from "@/public/serverSubmission.png"
import oauthProccess from "@/public/OAuthProcess.png"
import medium from "@/public/medium.png"
import words from "@/public/words.png"
import portrait from "@/public/portrait2.jpg"
export default function Page() {

  return (
    <>
        <div className="flex w-full justify-center">
                <div className="flex flex-col w-full max-w-[1400px]">
                <div className="bg-white h-[65px] max-w-[1400px] flex flex-row justify-between items-center">
                    <div className="flex flex-row">
                    <a href="/" className="font-bold text-[25px] py-1 whitespace-nowrap flex flex-row
                    align-center mt-1">
                        <img src={logo.src} className="w-[40px] mt-[-2px] mr-1"/>
                        Print Submit
                    </a>
                    <a href="/about" className="mt-[14px] h-6 ml-14 text-[16px] bg-gray-200 rounded-xl text-gray-700 px-3 cursor-pointer">
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
                    <a href="/register?redirect=false" className="font-semibold text-blue-600 ml-2  py-1 px-2 rounded-lg hover:bg-gray-600/[0.1]">Create account</a>
                    <a href="/submissions?continue=guest" className="min-w-[170px] font-semibold text-center py-2 ml-3 mr-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer">Go to Dashboard</a>
                    </div>

                </div>

                <div className="border w-[850px] mt-14 px-10 py-4 self-center shadow">
                    <div className="flex flex-row mb-2 items-center">
                        <img className="h-[65px] w-[65px] rounded-full" src={portrait.src}/>
                        <div className="flex flex-col ml-4 justify-end">
                            <p className="text-lg font-bold text-gray-700">Developer</p>
                            <p className="text-2xl">Adam Gerhant</p>
                        </div>
                    </div>
                    <hr/>
                    <div className="text text-gray-800 mt-2 w">Hi, I&apos;m Adam. I had the idea for Print Submit after starting a 3D printing service at my local library,
                     and realizing there were no good tools for creating an online submission form specifically for 3D print requests.
                     This app helps simplify this process and includes many security, customizability, and quality of life features.</div>
                </div> 
               
               
                <div className="w-[900px] mb-[100px] self-center mt-20 flex flex-col text-xl text-gray-800 ">
                    <p className="text-3xl font-semibold">Server side submission process for maximum security</p>
                    
                    <hr className="w-[900px] self-center"/>
                    
                    <p className="text-gray-800 mt-4 text-lg">The simplest way to upload files to a server is by allowing the database to be publicly writeable,
                    and have the client send files as needed. However, this is not a safe method, since there is no way to enfore security. Any data can be uploaded at any time. 
                    </p>
                    <img className="w-[500px] self-center  mt-4"src={clientSubmission.src}/>
                    <p className="text-gray-800 mt-2 text-lg">With a client side submission process, if a user can upload a file, then a malicious user can as well. This is why Print Submit 
                    uses a server side submission process.
                    </p>
                    <img className="w-[600px] self-center mt-4"src={serverSubmission.src}/>
                    <p className="text-gray-800 mt-2 text-lg"> The basic process behind this is to first verify the request, then send a temporary storage key to the user which can be used to upload files.
                    This allows for the database and storage and be locked, which provides security against attacks and malicious users.
                    </p>
                    <div className="self-center w-[630px] mt-8">
                        <p className="self-center text-left">Read the full article for a more detailed explanation</p>
                    </div>
                    <a href="https://medium.com/@adamgerhant/server-side-upload-process-to-cloud-storage-and-firestore-with-cloud-functions-c748384eee91" 
                        target="_blank"
                        className="p-4 border self-center hover:shadow-lg transition mt-2 relative">
                        <img className="w-[600px] z-1 self-center cursor-pointer"src={medium.src}/>
                        <img className="z-2 absolute bottom-[28px] left-[148px] w-[60px]"src={words.src}/>
                    </a>

                    <p className="text-3xl mt-40 font-semibold">Secure storage for Gmail access credentials</p>
                    <hr className="w-[900px] self-center"/>
                    <p className="text-gray-800 mt-2 text-lg"> Since the email account which is authorized to send emails isnt necessarily your account, the credentials must be kept seperately.
                    In order to securly store the credentials, they are stored in a database document which cannot be written to, and can only be read by the authenticated user.
                    However, this means that the only way to store them is to use a server side Cloud Function.
                    </p>

                    <img className="w-[750px] self-center mt-8"src={oauthProccess.src}/>
                    
                    <p className="text-gray-800 mt-2 text-lg">
                        By only using the server to read and write from the document which stores credentials, it allows the credentials to be kept secure and prevent any unauthorized users from accessing them.
                    </p>
                    
                    <div className="self-center w-[630px] mt-8">
                        <p className="self-center text-left">Read the full article for a more detailed explanation</p>
                    </div>
                    <a href="https://medium.com/@adamgerhant/server-side-upload-process-to-cloud-storage-and-firestore-with-cloud-functions-c748384eee91" 
                        target="_blank"
                        className="p-4 border self-center hover:shadow-lg transition mt-2 relative">
                        <img className="w-[600px] z-1 self-center cursor-pointer"src={medium.src}/>
                        <img className="z-2 absolute bottom-[28px] left-[148px] w-[60px]"src={words.src}/>
                    </a>
                </div>
                
            </div>
        </div>

    </>
  )
}
