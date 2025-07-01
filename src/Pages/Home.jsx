import React from 'react'
import Banner from '../Components/ui/Banner'
import Movies from '../Components/Movies'
import { Outlet } from 'react-router-dom'
import Navbar from '../Components/Navbar'


function Home() {
  return (
    <div className='w-full overflow-hidden min-h-screen bg-black'>
        <Navbar/>
        <Banner/>
        <Movies/>
        <Outlet/>
    </div>
  )
}

export default Home