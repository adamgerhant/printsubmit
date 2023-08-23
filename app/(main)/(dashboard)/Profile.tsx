'use client'
import React, { useContext, useState } from 'react'
import {getAuth, signOut} from "firebase/auth"
import { useAuthContext } from '../layout';
import { UserContext } from '@/@types/user';
import { useRouter } from 'next/navigation';
import auth from '@/app/firebase';


const Profile = ({resetData,  accountInformation, setConfirmDeleteAccount, setConfirmCancelSubscription}:any, ) => {
  const {currentUser} = useAuthContext() as UserContext;
  const router = useRouter();

  const signOutFunction = () =>{
    signOut(auth).then(()=>{
      resetData();
    })
  }
  
  return (
    <>
    <div className='profileContainer'>
        <p className='profileText'>Signed in as</p>
        <p className='emailText'>{currentUser.email}</p>
        <hr/>
        <div className="accountTypeDiv">
          {accountInformation&&
          <>
            <p>Account type:</p>
            {accountInformation.accountType!="Premium"&&<p className="accountLabel">{accountInformation.accountType}</p>}
            {accountInformation.accountType=="Premium"&&<p className="premiumLabel">{accountInformation.accountType}</p>}

          </> 
          }
         {!accountInformation&&
          <>
            <p>Getting account type</p>
          </> 
          }
         
        </div>
        {accountInformation&&accountInformation.accountType=="Free"&&
          <a href="pricing" target="_blank">
            <button className="upgradeButton">Upgrade to Premium</button>
          </a>
        }
        {accountInformation&&accountInformation.accountType=="Premium"&&
          <div className="py-1 px-2 mb-4 text-md text-center border border-[#ee0000] text-[#ee0000] rounded cursor-pointer hover:bg-[#ee0000] hover:text-white transition" 
          onClick={()=>setConfirmCancelSubscription(true)}>
            Cancel subscription
          </div>
        }
        <hr/>
        <div className='flex flex-row justify-between'>
          <button className="signoutButton" onClick={()=>{signOutFunction()}}>Sign out</button>
          <button className="deleteAccountButton" onClick={()=>{setConfirmDeleteAccount(true)}}>Delete account</button>

        </div>
      </div>   
      
    </>
      
  )
}

export default Profile