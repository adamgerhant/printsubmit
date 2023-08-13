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

const Header = () => {
  const {resetData, accountInformation} = useFirebaseContext() as FirebaseContext;
  const {currentUser} = useAuthContext() as UserContext;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {

    const handleClickOutside = (event:any) => {
      if (event.composedPath()[0].tagName !== 'BUTTON') {
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
      resetData();
      router.push("/register?redirect=false")
    })
  }
  return (
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
        {isOpen && <Profile resetData={resetData} accountInformation={accountInformation}/>}
      </div>
    </div>
  )
}
export default Header