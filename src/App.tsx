/*import PasswordGenerator from './components/PasswordGenerator'
import './App.css'

function App() {
  return <PasswordGenerator />
}

export default App
*/
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PasswordPage from './pages/tools/PasswordPage'
import UsernamePage from './pages/tools/UsernamePage'
import PINPage from './pages/tools/PINPage'
import CreditCardPage from './pages/tools/CreditCardPage'
import WiFiPage from './pages/tools/WiFiPage'
import OTPPage from './pages/tools/OTPPage'
import MemorablePage from './pages/tools/MemorablePage'
import APIKeyPage from './pages/tools/APIKeyPage'
import UUIDPage from './pages/tools/UUIDPage'
import LicensePage from './pages/tools/LicensePage'
import IdentityPage from './pages/tools/IdentityPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/password-generator" element={<PasswordPage />} />
        <Route path="/username-generator" element={<UsernamePage />} />
        <Route path="/pin-generator" element={<PINPage />} />
        <Route path="/credit-card-generator" element={<CreditCardPage />} />
        <Route path="/wifi-password-generator" element={<WiFiPage />} />
        <Route path="/otp-generator" element={<OTPPage />} />
        <Route path="/memorable-password-generator" element={<MemorablePage />} />
        <Route path="/api-key-generator" element={<APIKeyPage />} />
        <Route path="/uuid-generator" element={<UUIDPage />} />
        <Route path="/license-plate-generator" element={<LicensePage />} />
        <Route path="/fake-identity-generator" element={<IdentityPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App