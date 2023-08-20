import logo from "@/public/Logo.svg"
import {BiCheck} from "react-icons/bi"
import { RxCross2 } from "react-icons/rx"
import {BsArrowRight} from "react-icons/bs"
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
                        <a href="/pricing" className="mt-[14px] h-[25px] px-3 ml-8 text-[16px] text-gray-700 px-3 bg-gray-200 rounded-xl cursor-pointer">
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
                <div className="flex flex-row justify-around mt-10 p-10 w-[1100px] rounded-xl self-center ">
                    <div className="w-[400px] h-[730px] p-10 border-2 border-gray-300 rounded-xl">
                        <p className="font-bold text-2xl">Free</p>
                        <p className="font-bold text-4xl mt-1">$0</p>
                        <div className="mt-6 text-gray-700 flex flex-row">
                            <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                            1 GB uploaded file storage
                        </div>
                        <div className="mt-3 text-gray-700 flex flex-row">
                            <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                            5 Emails per day
                        </div>

                        <div className="mt-3 ml-2 font-semibold text-gray-700 flex flex-row">
                            Basic submission form editor
                        </div>
                        <div className="mt-1 ml-7 text-gray-700 flex flex-col">
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Form title and description
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Text question input
                            </div>
                            <div className="flex flex-row">
                                <RxCross2 className="h-[22px] w-[22px] text-red-600 mt-[1px] mr-1"/>
                                Dropdown question input
                            </div>       
                        </div>

                        <div className="mt-3 ml-2 font-semibold text-gray-700 flex flex-row">
                            Basic submission validation
                        </div>
                        <div className="mt-1 ml-7 text-gray-700 flex flex-col">
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                File size
                            </div>
                            <div className="flex flex-row">
                                <RxCross2 className="h-[22px] w-[22px] text-red-600 mr-1"/>
                                Model dimensions
                            </div>
                            <div className="flex flex-row">
                                <RxCross2 className="h-[22px] w-[22px] text-red-600 mt-[1px] mr-1"/>
                                Blocked IP
                            </div>
                            <div className="flex flex-row">
                                <RxCross2 className="h-[22px] w-[22px] text-red-600 mt-[1px] mr-1"/>
                                Google reCAPTCHA
                            </div>
                        </div>

                        <div className="mt-3 ml-2 font-semibold text-gray-700 flex flex-row">
                            Basic response information
                        </div>
                        <div className="mt-1 ml-7 text-gray-700 flex flex-col">
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Date
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                File name
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Preview
                            </div>
                            <div className="flex flex-row">
                                <RxCross2 className="h-[22px] w-[22px] text-red-600 mt-[1px] mr-1"/>
                                IP
                            </div>
                            <div className="flex flex-row">
                                <RxCross2 className="h-[22px] w-[22px] text-red-600 mt-[1px] mr-1"/>
                                Dimensions
                            </div>
                            <div className="flex flex-row">
                                <RxCross2 className="h-[22px] w-[22px] text-red-600 mt-[1px] mr-1"/>
                                File size
                            </div>
                            
                        </div>
                        <a href="/register" className="mx-2 mt-6 px-4 py-2 w-[290px] border-[1px] border-black rounded flex flex-row justify-between cursor-pointer hover:bg-black text-gray-700 hover:text-white ease-out duration-200">
                            
                            <p className="text-[15px] font-semibold ">Create Account</p>
                            <BsArrowRight className="h-full w-[22px]"/>
                        </a>
                    </div>

                    <div className="w-[400px] h-[730px] p-10 border-2 border-[#ddd6fe] shadow-[0px_0px_5px_#ddd6fe] border-gray-300 rounded-xl ">
                        <p className="font-bold text-2xl">Premium</p>
                        <div className="flex flex-row items-baseline mt-1">
                            <span className="font-bold text-4xl ">$5</span>
                            <span className="text-2xl text-gray-600 ml-2">per month</span>
                        </div>
                        <div className="mt-6 text-gray-700 flex flex-row">
                            <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                            10 GB uploaded file storage
                        </div>
                        <div className="mt-3 text-gray-700 flex flex-row">
                            <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                            25 Emails per day
                        </div>
                        <div className="mt-3 ml-2 font-semibold text-gray-700 flex flex-row">
                            Full submission form editor
                        </div>
                        <div className="mt-1 ml-7 text-gray-700 flex flex-col">
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Form title and description
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Text question input
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Dropdown question input
                            </div>       
                        </div>

                        <div className="mt-3 ml-2 font-semibold text-gray-700 flex flex-row">
                            Full submission validation
                        </div>
                        <div className="mt-1 ml-7 text-gray-700 flex flex-col">
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                File size
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Model dimensions
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Blocked IP
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Google reCAPTCHA
                            </div>
                        </div>

                        <div className="mt-3 ml-2 font-semibold text-gray-700 flex flex-row">
                            Full response information
                        </div>
                        <div className="mt-1 ml-7 text-gray-700 flex flex-col">
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Date
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                File name
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Preview
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                IP
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                Dimensions
                            </div>
                            <div className="flex flex-row">
                                <BiCheck className="h-[22px] w-[22px] text-green-600 mr-1"/>
                                File size
                            </div>
                            
                        </div>
                        <div className="mx-2 mt-6 px-4 py-2 w-[290px] border-[1px] border-violet-700 bg-violet-700 rounded flex flex-row justify-between cursor-pointer hover:bg-white text-white hover:text-violet-700 ease-out duration-200 shadow-[0_0_10px_#6d28d9]">
                            <p className="text-[15px] font-semibold">Temporarily Unavailable</p>
                            <BsArrowRight className="h-full w-[22px]"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>
  )
}
