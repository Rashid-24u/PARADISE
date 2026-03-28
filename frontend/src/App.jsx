import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTopBtn from "./components/ScrollToTopBtn";

// 🔐 LOGIN PAGES
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";

// 🌐 PUBLIC PAGES
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Abacus from "./pages/Abacus";
import Gallery from "./pages/Gallery";
import Notice from "./pages/Notice";
import Contact from "./pages/Contact";
import Admission from "./pages/Admission";

// 🛠 ADMIN
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/admin/Students";
import Fees from "./pages/admin/Fees";
import Notices from "./pages/admin/Notices";
import GalleryAdmin from "./pages/admin/GalleryAdmin";
import TeachersAdmin from "./pages/admin/TeachersAdmin";
import CoursesAdmin from "./pages/admin/CoursesAdmin";

// 👨‍🏫 TEACHER DASHBOARD
import TeacherLayout from "./pages/teacher/TeacherLayout";
import TeacherHome from "./pages/teacher/TeacherHome";
import TeacherProfile from "./pages/teacher/TeacherProfile"; // 🔥 ADD
import TeacherStudents from "./pages/teacher/Students";
import Attendance from "./pages/teacher/Attendance";
import Marks from "./pages/teacher/Marks";
import Notes from "./pages/teacher/Notes";
import Reports from "./pages/teacher/Reports";

// 🎓 STUDENT DASHBOARD
import StudentLayout from "./pages/student/StudentLayout";
import StudentHome from "./pages/student/StudentHome";
import Profile from "./pages/student/Profile";
import StudentAttendance from "./pages/student/Attendance";
import StudentMarks from "./pages/student/Marks";
import StudentNotes from "./pages/student/Notes";

function AppWrapper() {
  const location = useLocation();

  return (
    <>
      {/* Global navbar with role-aware links */}
      <Navbar />

      <Routes>
        {/* 🌐 PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/abacus" element={<Abacus />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admission" element={<Admission />} />

        {/* 🔐 LOGIN */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* 🛠 ADMIN */}
        <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/fees" element={<Fees />} />
        <Route path="/admin/notices" element={<Notices />} />
        <Route path="/admin/gallery" element={<GalleryAdmin />} />
        <Route path="/admin/teachers" element={<TeachersAdmin />} />
        <Route path="/admin/courses" element={<CoursesAdmin />} />

        {/* 👨‍🏫 TEACHER */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherHome />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="marks" element={<Marks />} />
          <Route path="notes" element={<Notes />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* 🎓 STUDENT */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="marks" element={<StudentMarks />} />
          <Route path="notes" element={<StudentNotes />} />
        </Route>
      </Routes>

      {/* Keep footer for public/login only */}
      {!(location.pathname.startsWith("/admin") || location.pathname.startsWith("/teacher") || location.pathname.startsWith("/student")) && <Footer />}

      <ScrollToTopBtn />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;