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
                            <a href="/pricing" className="mt-[14px] h-[25px] px-3 ml-8 text-[16px] text-gray-700 px-3 rounded-xl cursor-pointer">
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
                    <div className="text-4xl font-bold text-gray-800 mt-10">Privacy Policy</div>
                    <div className="text-xl font-semibold mt-2">
                        Printsubmit.com is committed to protecting your privacy. This Privacy Policy explains the methods and reasons we collect, use, disclose, transfer, and store your information
                    </div>
                    <div className="text-4xl font-bold text-gray-800 mt-4">Information We Collect</div>
                    
                    <div className="text-3xl font-bold text-gray-800 mt-4">From customers</div>
                        <div className="text-xl  mt-2">
                            Registration information: We store information you provide us on this site when creating an account or filling out a form. This information commonly includes name and email address.
                        </div>
                        <div className="text-xl  mt-2">
                            Billing information: Our integrations with third party payment gateways are for processing only. We don&apos;t store or log any sensitive cardholder data provided by you or your form users. 
                        </div>
                        <div className="text-xl  mt-2">
                            Submission and Form data: When using the form editor, your changes are saved to a third party database provider. We currently use the Firebase Firestore database. Submissions are stored in a similar manner, but also include Google Cloud Storage for file storage.
                        </div>
                        <div className="text-xl mt-2">
                            Email data: When authenticating and authorizing your email address, a credential is stored in a database document that only the registered user can access. This credential is never shared or used by any service other than when the user makes a change that sends an automated email.
                        </div>
                    <div className="text-3xl font-bold text-gray-800 mt-4">From users</div>
                        <div className="text-xl  mt-2">
                            We store the information provided on the public submission form, as well as other metadata such as file size, dimensions, and IP.
                            This information can only be access by the registerd user who created the form
                        </div>
                    <div className="text-3xl font-bold text-gray-800 mt-4">In general</div>
                        <div className="text-xl font-semibold mt-2">
                            We may disclose information with third parties, for limited purposes, as follows:
                        </div>
                        <div className="text-xl  mt-2">
                            We use service providers who help us to provide you with our services. These service providers maintain technical protections to ensure the confidentiality of your personal information and data, to use it only for the provision of their services to us, and to handle it in accordance with this privacy policy. Examples of service providers include payment processors, hosting services, email service providers, and web traffic analytics tools
                        </div>
                </div>             
            </div>
        </>
    )
}
