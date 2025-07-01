import React from 'react'
import Home from './Pages/Home'
import { Route, Routes } from 'react-router-dom'
import Trending from './Components/Trending'
import TvShows from './Pages/TvShows'
import MyPage from './Pages/MyPage'
import LoginPage from './Components/LoginPage'
import MoviePage from './Pages/MoviePage'

function App() {
  return (
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/trending' element={<Trending/>}/>
        <Route path='/tvshows' element={<TvShows/>}/>
        <Route path='/list' element={<MyPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/show/:id' element = {<MoviePage/>}/>
      </Routes>
  )
}

export default App