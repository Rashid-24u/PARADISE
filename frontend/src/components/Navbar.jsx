import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/lgo.jpeg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔐 ROLE CHECK
  const admin = localStorage.getItem("admin");
  const teacher = localStorage.getItem("teacher");
  const student = localStorage.getItem("student");

  const isLoggedIn = admin || teacher || student;

  // 📱 RESPONSIVE
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔐 LOGOUT (ROLE BASED)
  const handleLogout = () => {
    const currentPath = location.pathname;
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    localStorage.removeItem("teacher");
    localStorage.removeItem("student");
    if (currentPath.startsWith("/admin")) navigate("/admin-login");
    else if (currentPath.startsWith("/teacher")) navigate("/teacher-login");
    else if (currentPath.startsWith("/student")) navigate("/student-login");
    else navigate("/");
  };

  // 📊 DASHBOARD NAV
  const goDashboard = () => {
    if (admin) navigate("/admin-dashboard");
    else if (teacher) navigate("/teacher");
    else if (student) navigate("/student");
  };

  const publicNavItems = [
    { name: "🏠 Home", path: "/" },
    { name: "📖 About", path: "/about" },
    { name: "📚 Courses", path: "/courses" },
    { name: "🧮 Abacus", path: "/abacus" },
    { name: "🖼️ Gallery", path: "/gallery" },
    { name: "📢 Notice", path: "/notice" },
    { name: "📞 Contact", path: "/contact" },
    { name: "🎓 Admission", path: "/admission" },
  ];

  const adminNavItems = [
    { name: "🏠 Dashboard", path: "/admin-dashboard" },
    { name: "🎓 Students", path: "/admin/students" },
    { name: "👨‍🏫 Teachers", path: "/admin/teachers" },
    { name: "📚 Courses", path: "/admin/courses" },
    { name: "💰 Fees", path: "/admin/fees" },
  ];

  const teacherNavItems = [
    { name: "🏠 Dashboard", path: "/teacher" },
    { name: "📅 Attendance", path: "/teacher/attendance" },
    { name: "📝 Marks", path: "/teacher/marks" },
    { name: "📄 Notes", path: "/teacher/notes" },
    { name: "👤 Profile", path: "/teacher/profile" },
  ];

  const studentNavItems = [
    { name: "🏠 Dashboard", path: "/student" },
    { name: "📅 Attendance", path: "/student/attendance" },
    { name: "📊 Marks", path: "/student/marks" },
    { name: "📄 Notes", path: "/student/notes" },
    { name: "👤 Profile", path: "/student/profile" },
  ];

  const onAdminRoute = location.pathname.startsWith("/admin");
  const onTeacherRoute = location.pathname.startsWith("/teacher");
  const onStudentRoute = location.pathname.startsWith("/student");

  let navItems = publicNavItems;
  if (onAdminRoute && admin) navItems = adminNavItems;
  else if (onTeacherRoute && teacher) navItems = teacherNavItems;
  else if (onStudentRoute && student) navItems = studentNavItems;

  const activeStyle = ({ isActive }) => ({
    color: "#facc15",
    fontWeight: "600",
  });

  return (
    <>
      <nav style={styles.nav}>
        {/* LEFT */}
        <div style={styles.left} onClick={() => navigate("/")}>
          <img src={logo} alt="logo" style={styles.logo} />
          <h3 style={styles.title}>Paradise Islamic School</h3>
        </div>

        {/* DESKTOP */}
        {!isMobile && (
          <div style={styles.links}>
            {navItems.map((item, i) => (
              <NavLink key={i} to={item.path} style={activeStyle}>
                {item.name}
              </NavLink>
            ))}

            {/* LOGIN */}
            {!isLoggedIn && !onAdminRoute && !onTeacherRoute && !onStudentRoute && (
              <>
                <button onClick={() => navigate("/admin-login")} style={styles.btn}>
                  Admin
                </button>
                <button onClick={() => navigate("/teacher-login")} style={styles.btn}>
                  Teacher
                </button>
                <button onClick={() => navigate("/student-login")} style={styles.btn}>
                  Student
                </button>
              </>
            )}

            {/* DASHBOARD */}
            {isLoggedIn && !(onAdminRoute || onTeacherRoute || onStudentRoute) && (
              <button onClick={goDashboard} style={styles.dashboard}>
                Dashboard
              </button>
            )}

            {/* LOGOUT */}
            {isLoggedIn && (
              <button onClick={handleLogout} style={styles.logout}>
                Logout
              </button>
            )}
          </div>
        )}

        {/* MOBILE BUTTON */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.menuBtn}>
            ☰
          </button>
        )}
      </nav>

      {/* MOBILE MENU */}
      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          {navItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}

          {!isLoggedIn && !onAdminRoute && !onTeacherRoute && !onStudentRoute && (
            <>
              <button onClick={() => navigate("/admin-login")}>Admin</button>
              <button onClick={() => navigate("/teacher-login")}>Teacher</button>
              <button onClick={() => navigate("/student-login")}>Student</button>
            </>
          )}

          {isLoggedIn && !(onAdminRoute || onTeacherRoute || onStudentRoute) && (
            <>
              <button onClick={goDashboard}>Dashboard</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    background: "#065f46",
    color: "#fff",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
  },
  links: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  btn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  dashboard: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logout: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  menuBtn: {
    background: "none",
    border: "none",
    fontSize: "22px",
    color: "#fff",
  },
  mobileMenu: {
    background: "#065f46",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  mobileLink: {
    color: "#fff",
    textDecoration: "none",
  },
};

export default Navbar;