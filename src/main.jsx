import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 👇 这句话是重中之重！它负责把刚才写的 Tailwind 样式全部注入到网页里
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)