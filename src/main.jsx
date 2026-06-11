import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode intentionally removed — it double-invokes effects in dev,
// which causes GSAP ScrollTrigger animations and canvas loops to stutter.
createRoot(document.getElementById('root')).render(<App />)
