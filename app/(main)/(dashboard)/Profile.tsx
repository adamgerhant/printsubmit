import React, { useContext } from 'react'
import {signOut} from "firebase/auth"
import { useAuthContext } from '../layout';
import { UserContext } from '@/@types/user';
import { useRouter } from 'next/navigation';
import auth from '@/app/firebase';


const Profile = ({resetData,  accountInformation}:any, ) => {
  const {currentUser} = useAuthContext() as UserContext;
  const router = useRouter();
  const signOutFunction = () =>{
    signOut(auth).then(()=>{
      resetData();
    })
  }


  return (
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
            <p>Getting account type:</p>
          </> 
          }
         
        </div>
        {accountInformation.accountType=="Free"&&
          <a href="pricing" target="_blank">
            <button className="upgradeButton">Upgrade to Premium</button>
          </a>
        }
        <hr/>
        <button className="signoutButton" onClick={()=>{signOutFunction()}}>Sign out</button>
      </div>   
  
  )
}

export default Profile