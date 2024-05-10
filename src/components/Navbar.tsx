import Link from "next/link"
import Image from "next/image"
import { Button } from "../../src/components/ui/button"
import { signIn, useSession } from "next-auth/react"

const Navbar = () => {
const {data:sessionData} = useSession();
  return (
    <nav className="fixed top-0 w-full z-20 text-center md:text-left border-b border-gray-400/20 bg-gray-600 bg-opacity-5 backdrop-blur-lg backdrop-filter p-3 flex justify-between items-center drop-shadow-xl px-4">
        <h1 className="md:px-12 font-bold text-2xl md:text-4xl text-black dark:text-white flex flex-row justify-between items-center gap-2 md:gap-4">
          <Image src="/favicon.png" alt="" height={20} width={50} />
          <Link href='/' className="text-white">FaceWarp</Link>
          </h1>
          <div className="flex flex-row gap-20 justify-center items-center">
            <div className="hidden lg:flex flex-row gap-6">
          <ul className="flex flex-row gap-12 text-lg font-semibold text-white" >
            <Link href='/'>Home</Link>
            {/* <Link href='/team'>Team</Link> */}
            <Link href='/'>About</Link>
          </ul>
          </div>
          <div className="flex flex-row gap-2 items-center">
            {
              sessionData ? <Button className="rounded-md bg-white/10 px-6 font-semibold text-white no-underline transition hover:bg-white/20 mr-4"><Link href='profile'>Profile</Link></Button>:
                <Button className="rounded-md bg-white/10 px-6 font-semibold text-white no-underline transition hover:bg-white/20 mr-4" onClick={()=>{void signIn("google")}}>Login</Button>
            }     
          </div> 
          </div>
    </nav>
  )
}

export default Navbar