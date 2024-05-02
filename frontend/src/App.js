import './App.css';
import React from "react"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Main from './pages/Main'
import Register from './pages/Register';
import Login from './pages/Login'

function App() {
  return(
   <>
    <Router>
      <Routes>
        <Route exact path="/" element={<Main/>} />
        <Route exact path="/login" element={<Login/>} />
        <Route exact path="/register" element={<Register/>} />
      </Routes>
    </Router>
   </>
  )
}

export default App;
