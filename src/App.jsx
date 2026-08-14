import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import PassphraseTrainer from "./pages/PassphraseTrainer";
import Breach from "./pages/Breach";
import TOTPGenerator from "./pages/TOTPGenerator";
import PasswordGenerator from "./pages/PasswordGenerator";
import CipherPlayground from "./pages/CipherPlayground";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/totp" element={<TOTPGenerator />} />
        <Route path="/memory" element={<PassphraseTrainer />} />
        <Route path="/breach" element={<Breach />} />
        <Route path="/cipher" element={<CipherPlayground />} />
        <Route path="/" element={<Hub />} />
        <Route path="/generator" element={<PasswordGenerator />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  );
}