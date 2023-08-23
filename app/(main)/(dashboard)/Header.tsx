import React from 'react'
import Profile from './Profile';
import { useState, useEffect } from 'react';
import { useFirebaseContext } from './layout';
import { FirebaseContext, UserContext } from '@/@types/user.js';
import { useAuthContext } from '../layout';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import auth from '@/app/firebase';
import { useRouter } from 'next/navigation';
import { getAuth, deleteUser } from "firebase/auth";

const Header = () => {
  const {resetAllData, accountInformation} = useFirebaseContext() as FirebaseContext;
  const {currentUser} = useAuthContext() as UserContext;
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [confirmCancelSubscription, setConfirmCancelSubscription] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [subscriptionCancelled, setSubscriptionCancelled] = useState("")
  const [accountDeleted, setAccountDeleted] = useState("")
  useEffect(() => {

    const handleClickOutside = (event:any) => {
      let clickedOutside = true
      event.composedPath().map((element: { className: any; })=>{
        if(element.className=="profileWrapper"){
          clickedOutside = false;
        }
      })

      if (clickedOutside) {
          setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
        document.removeEventListener('click', handleClickOutside, true);
    };

  }, []);

  const toggleProfile = () => {
    setIsOpen(!isOpen);
  };
  const router = useRouter();
  const signOutFunction = () =>{
    signOut(auth).then(()=>{
      resetAllData();
      router.push("/register?redirect=false")
    })
  }

  const deleteAccount = () =>{
    console.log("running delete account")
    const auth = getAuth();
    const user = auth.currentUser;
    if(user){
      user.getIdToken(/* forceRefresh */ true).then(function(idToken:string) {
        //http://localhost:5001/dprintsubmissionapp/us-central1/api
        //https://us-central1-dprintsubmissionapp.cloudfunctions.net/api
        fetch('https://us-central1-print-submit.cloudfunctions.net/api/cancelSubscription', {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                "token": idToken,
            })
        })
      }).then(()=>{
        deleteUser(user).catch((err)=>{
          console.log(err.code)
          if(err.code=="auth/requires-recent-login"){
            setAccountDeleted("recentLogin")
          }
          else{
            setAccountDeleted("error")
          }
        })
      }).catch(()=>{
        setAccountDeleted("error")
      })
    }
  }

  const cancelSubscription = () =>{
    const auth = getAuth();
    setSubscriptionCancelled("loading")
    if(auth.currentUser){
      auth.currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken:string) {
        //http://localhost:5001/dprintsubmissionapp/us-central1/api
        //https://us-central1-dprintsubmissionapp.cloudfunctions.net/api
        fetch('https://us-central1-print-submit.cloudfunctions.net/api/cancelSubscription', {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                "token": idToken,
            })
        }).then((response)=>{
          console.log(response.status)
          if(response.status==200){
            setSubscriptionCancelled("success");
          }
          else if(response.status==400){
            setSubscriptionCancelled("error");
          }
        })
      })
    }
  }
  console.log(accountDeleted)
  return (
    <>
    <div className='header'>
      <a href="/" className="logo">
        <img style={{width:"32px", marginLeft:"25px"}}src={'/logo_white_11.svg'} alt="logo"/> 
        <p className="name">Print Submit</p>
      </a>
      <div>
        {currentUser.email=="Guest"&&
        <div className="guestDiv">
          <span className="guestText">Currently using a guest account.</span>
          
          <span onClick={()=>signOutFunction()} className="linkText">Create Account</span>
          <span className="guestText">for full functionality</span>

        </div>
        }
      </div>
      <button className='profilebutton' onClick={toggleProfile}>
          Profile
      </button>
      <div className="profileWrapper">
        {isOpen && <Profile resetData={resetAllData} accountInformation={accountInformation} setConfirmDeleteAccount={setConfirmDeleteAccount} setConfirmCancelSubscription={setConfirmCancelSubscription}/>}
      </div>
    </div>
    {confirmDeleteAccount&&
      <div className='absolute z-10 top-0 left-0 w-[100vw] h-[100vh] bg-gray-600/[0.7] flex flex-row justify-center items-center'>
        <div className="bg-white border rounded px-10 py-5 w-[550px]">
          {!accountDeleted&&
          <>
            <p className="text-3xl w-full text-center">Confirm account deletion</p>
            <p className="text-xl mt-2 text-gray 700 w-[500px]">Deleting your account will permanently delete all data and stop any subscriptions</p>
            <div className="flex flex-row justify-between mt-6">
              <div onClick={()=>deleteAccount()}className='text-red-600 py-2 w-[200px] text-center border border-red-600 rounded text-xl cursor-pointer hover:text-white hover:bg-red-600'>Delete account</div>
              <div onClick={()=>setConfirmDeleteAccount(false)} className='text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Close</div>
            </div>
          </>
          }
          {accountDeleted=="recentLogin"&&
          <div className="h-full w-full flex flex-col justify-center items-center">
            <p className='text-red-600 text-xl mb-2'>Error deleting account</p>
            <p className='text-center'>
              In order to delete your account you must have recently been authenticated. Please Re-login and try again.
            </p>
            <div className="flex flex-row mt-4">
              <div onClick={()=>{signOut(auth).then(()=>{resetAllData()})}} className='mr-20 text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Re-login</div>
              <div onClick={()=>setConfirmDeleteAccount(false)} className='text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Close</div>
            </div>
          </div>
          }
          {accountDeleted=="error"&&
          <div className="h-full w-full flex flex-col justify-center items-center">
            <p className='text-red-600 text-xl mb-2'>Error deleting account</p>
            <p className='text-center'>
              There was an error cancelling your subscription. Please try again or use the contact form at  
              <a href="/contact" className="text-blue-600" target="_blank"> www.printsubmit.com/contact </a>
              and include the following information.
            </p>

            <p>User ID: {currentUser.uid}</p>
            <p>User email: {currentUser.email}</p>

            <div onClick={()=>setConfirmDeleteAccount(false)} className='text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Close</div>

          </div>
          }
          
        </div>
       
      </div>
    }
    {confirmCancelSubscription&&
      <div className='absolute z-10 top-0 left-0 w-[100vw] h-[100vh] bg-gray-600/[0.7] flex flex-row justify-center items-center'>
        <div className="bg-white border rounded px-10 py-5 h-[220px] w-[600px]">
          {!subscriptionCancelled&&
          <>
           <p className="text-3xl w-full text-center">Confirm subscription cancel</p>
            <p className="text-xl mt-2 text-gray 700 w-[500px]">Cancelling your subscription will immediately stop all payments and return account type to Free </p>
            <div className="flex flex-row justify-between mt-6">
              <div onClick={()=>cancelSubscription()}className='text-red-600 py-2 w-[230px] text-center border border-red-600 rounded text-xl cursor-pointer hover:text-white hover:bg-red-600'>Cancel subscription</div>
              <div onClick={()=>setConfirmCancelSubscription(false)} className='text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Close</div>
            </div>
          </>
          }
          {subscriptionCancelled=="loading"&&
            <div className="h-full w-full flex flex-col justify-center items-center text-xl">
              Cancelling...
            </div>
          }
          {subscriptionCancelled=="success"&&
            <div className="h-full w-full flex flex-col justify-center items-center">
              <p className='text-green-600 text-xl mb-2'>Subscription successfully cancelled</p>
              <p className='text-center'>It may take a few minutes for your subscription status to refresh</p>
              <div onClick={()=>setConfirmCancelSubscription(false)} className='mt-10 text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Close</div>
            </div>
          }
          {subscriptionCancelled=="error"&&
            <div className="h-full w-full flex flex-col justify-center items-center">
              <p className='text-red-600 text-xl mb-2'>Error cancelling</p>
              <p className='text-center'>
                There was an error cancelling your subscription. Please try again or use the contact form at  
                <a href="/contact" className="text-blue-600" target="_blank"> www.printsubmit.com/contact </a>
                and include the following information.
              </p>

              <p>User ID: {currentUser.uid}</p>
              <p>User email: {currentUser.email}</p>


              <div onClick={()=>setConfirmCancelSubscription(false)} className='text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Close</div>

            </div>
          }
          
        </div>
       
      </div>
    }
    </>
    
  )
}
export default Header