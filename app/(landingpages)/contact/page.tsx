import logo from "@/public/Logo.svg"
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
            </div>
        </div>

    </>
  )
}
