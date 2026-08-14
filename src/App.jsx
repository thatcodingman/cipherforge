import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import PasswordGenerator from "./pages/PasswordGenerator";
import CipherPlayground from "./pages/CipherPlayground";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/cipher" element={<CipherPlayground />} />
        <Route path="/" element={<Hub />} />
        <Route path="/generator" element={<PasswordGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}
