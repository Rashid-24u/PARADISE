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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";


import Students from "./pages/admin/Students";
import Fees from "./pages/admin/Fees";
import Notices from "./pages/admin/Notices";
import GalleryAdmin from "./pages/admin/GalleryAdmin";
import TeachersAdmin from "./pages/admin/TeachersAdmin";

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

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/fees" element={<Fees />} />
        <Route path="/admin/notices" element={<Notices />} />
        <Route path="/admin/gallery" element={<GalleryAdmin />} />
        <Route path="/admin/teachers" element={<TeachersAdmin />} />
        
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;