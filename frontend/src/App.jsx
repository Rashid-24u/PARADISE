import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Abacus from "./pages/Abacus";
import Gallery from "./pages/Gallery";
import Notice from "./pages/Notice";
import Contact from "./pages/Contact";
import Admission from "./pages/Admission";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/abacus" element={<Abacus />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admission" element={<Admission />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;