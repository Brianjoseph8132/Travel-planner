import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import AddTrip from './pages/AddTrip'
import History from './pages/History'
import NoPage from './pages/NoPage'
import { UserProvider } from './context/UserContext'
import { TripProvider } from './context/TripContext'
import SingleTrip from './pages/SingleTrip'
import AddActivity from './pages/AddActivity'

function App() {
  

  return (
    <BrowserRouter>
    
      <UserProvider>
        <TripProvider>


          <Routes>
            <Route>
              <Route path="/" element={<Layout/>}>
                <Route index element={<Home/>}/>
                <Route path='login' element={<Login/>}/>
                <Route path='signup' element={<SignUp/>}/>
                <Route path='profile' element={<Profile/>}/>
                <Route path='addtrip' element={<AddTrip/>}/>
                <Route path='history' element={<History/>}/>
                <Route path='addactivity' element={<AddActivity/>}/>
                <Route path="/trip/:id" element={<SingleTrip />} />

                <Route path='*' element={<NoPage/>}/>
              </Route>
            </Route>
          </Routes>


        </TripProvider>
      </UserProvider>

    </BrowserRouter>
  )
}

export default App
