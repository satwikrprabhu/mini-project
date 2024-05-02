import React from 'react'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { EditProfile } from '~/components/EditProfile'
import { useRouter } from 'next/router'
import { Button } from '~/components/ui/button'

const Profile = () => {
  const { data: sessionData } = useSession();
  const router = useRouter()
  if(sessionData)
  return (
    <div className='flex justify-center items-center gap-4'>
      <Button onClick={()=>void signOut()} className="rounded-md bg-white/10 px-6 font-semibold text-white no-underline transition hover:bg-white/20">Signout</Button>
      <EditProfile />
      </div>
  )
  else{
    return(
    <>
    {router.push(`/`)}
    </>)
  }
    
  
}

export default Profile