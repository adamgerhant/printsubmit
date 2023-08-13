import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link';
import { useFirebaseContext } from './layout';
import { FirebaseContext } from '@/@types/user';
import { Tooltip } from 'react-tooltip';
import { BiSolidLock } from 'react-icons/bi';
const Sidebar = ({accountType}: any) => {
  const pathname = usePathname()
  const {resetData, resetStatisticsData} = useFirebaseContext() as FirebaseContext;
  return (
    <div className='sidebar'>
      <Link href="/submissions"className={`navButton${pathname=="/submissions"?'Selected':''}`} onClick={()=>{resetData()}}>Submissions</Link>
      <Link href="/submissionForm" className={`navButton${pathname=="/submissionForm"?'Selected':''}`} >Submission Form</Link>
      <Link href="/emails" className={`navButton${pathname=="/emails"?'Selected':''}`}>Emails</Link>
      <Link href="/statistics" className={`bottomNavButton${pathname=="/statistics"?'Selected':''}`} onClick={()=>{resetStatisticsData()}}>Statistics</Link>
      {(accountType&&accountType!="Premium")&&
      <>
        <Tooltip id="ipmanagerTooltip" />
        <div className={`navButton${pathname=="/ipmanager"?'Selected':''}`}>
          IP Manager
          <div className="absolute left-[0px] top-[2px] rounded bg-gray-500/[0.2] w-[135px] h-[33px] cursor-pointer" data-tooltip-id="ipmanagerTooltip" data-tooltip-content="Premium feature" ></div>
          <BiSolidLock className="text-red-600 ml-1 mt-[3px] h-[20px] w-[20px] cursor-pointer" />
        </div>
      </>  
      } 
      {(accountType&&accountType=="Premium")&&  
      <Link href="/ipmanager" className={`navButton${pathname=="/ipmanager"?'Selected':''}`}>
        IP Manager
      </Link>
      }
      {!accountType&&
          <div className={`navButton${pathname=="/ipmanager"?'Selected':''}`}>
            IP Manager
          </div>
      }
    </div>
  )
}

export default Sidebar