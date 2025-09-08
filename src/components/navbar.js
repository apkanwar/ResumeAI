import Image from 'next/image'
import styles from "@/styles/imageShine.module.css";

export default function Navbar() {

  return (
    <header className="bg-dm-black text-white cursor-default select-none">
      <nav className="mx-auto flex max-w-7xl items-center justify-center gap-4 p-4">
        <div className={`${styles.shine}`}>
          <Image width={64} height={64} src="/logo.png" alt="" className='rounded-xl' />
        </div>
        <h1 className='font-headings font-bold text-2xl hover:bg-gray-600 transition ease-in duration-300 py-2 px-4 rounded-xl'>Resume Analyzer</h1>
      </nav>
    </header>
  )
}