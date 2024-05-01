/* eslint-disable */
import React, { useState } from 'react'
import FaceDetection from '~/components/FaceDetection'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
const Scan = () => {
  const [Face, setFace] = useState<{} | null>(null)
  const [Available, setAvailable] = useState(false)
  const { data: sessionData } = useSession()
  const router = useRouter()
  if(sessionData)
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] overflow-x-clip gap-8 pt-4'>
      <h1 className="mt-16 font-bold text-5xl text-white">Scan your Face</h1>
      <FaceDetection data={Face} available={Available} />
    </div>
  )
  else{
    router.push('/');
  } 
}

export default Scan;