import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import PassphraseTrainer from "./pages/PassphraseTrainer";
import Breach from "./pages/Breach";
import PasswordGenerator from "./pages/PasswordGenerator";
import CipherPlayground from "./pages/CipherPlayground";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/memory" element={<PassphraseTrainer />} />
      <Route path="/breach" element={<Breach />} />
      <Route path="/cipher" element={<CipherPlayground />} />
        <Route path="/" element={<Hub />} />
        <Route path="/generator" element={<PasswordGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}
