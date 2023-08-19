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

  const [isOpen, setIsOpen] = useState(false);

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
    const auth = getAuth();
    const user = auth.currentUser;
    if(user){
      deleteUser(user)
    }
  }

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
        {isOpen && <Profile resetData={resetAllData} accountInformation={accountInformation} setConfirmDeleteAccount={setConfirmDeleteAccount}/>}
      </div>
    </div>
    {confirmDeleteAccount&&
      <div className='absolute z-10 top-0 left-0 w-[100vw] h-[100vh] bg-gray-600/[0.7] flex flex-row justify-center items-center'>
        <div className="bg-white border rounded px-10 py-5">
          <p className="text-3xl w-full text-center">Confirm account deletion</p>
          <p className="text-xl mt-2 text-gray 700 w-[500px]">Deleting your account will permanently delete all data and stop any subscriptions</p>
          <div className="flex flex-row justify-between mt-6">
            <div onClick={()=>deleteAccount()}className='text-red-600 py-2 w-[200px] text-center border border-red-600 rounded text-xl cursor-pointer hover:text-white hover:bg-red-600'>Delete account</div>
            <div onClick={()=>setConfirmDeleteAccount(false)} className='text-gray-500 py-2 w-[200px] text-center border border-gray-500 rounded text-xl cursor-pointer  hover:text-white hover:bg-gray-500'>Close</div>
          </div>
          
        </div>
       
      </div>
      }
    </>
    
  )
}
export default Header