import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/lgo.jpeg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔐 ROLE CHECK
  const admin = localStorage.getItem("admin");
  const teacher = localStorage.getItem("teacher");
  const student = localStorage.getItem("student");

  const isLoggedIn = admin || teacher || student;

  // 📱 RESPONSIVE & SCROLL EFFECT
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (!mobile) setMenuOpen(false);
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
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
    { name: "Home", path: "/", icon: "🏠" },
    { name: "About", path: "/about", icon: "📖" },
    { name: "Courses", path: "/courses", icon: "📚" },
    { name: "Abacus", path: "/abacus", icon: "🧮" },
    { name: "Gallery", path: "/gallery", icon: "🖼️" },
    { name: "Notice", path: "/notice", icon: "📢" },
    { name: "Contact", path: "/contact", icon: "📞" },
    { name: "Admission", path: "/admission", icon: "🎓" },
  ];

  const adminNavItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: "🏠" },
    { name: "Students", path: "/admin/students", icon: "🎓" },
    { name: "Teachers", path: "/admin/teachers", icon: "👨‍🏫" },
    { name: "Courses", path: "/admin/courses", icon: "📚" },
    { name: "Fees", path: "/admin/fees", icon: "💰" },
    { name: "Activities", path: "/admin/extra-activities", icon: "🎯" },
    { name: "Salary", path: "/admin/teacher-salary", icon: "💵" },
    { name: "Notices", path: "/admin/notices", icon: "📢" },
    { name: "Gallery", path: "/admin/gallery", icon: "🖼️" },
  ];

  const teacherNavItems = [
    { name: "Dashboard", path: "/teacher", icon: "🏠" },
    { name: "Attendance", path: "/teacher/attendance", icon: "📅" },
    { name: "Marks", path: "/teacher/marks", icon: "📝" },
    { name: "Notes", path: "/teacher/notes", icon: "📄" },
    { name: "Profile", path: "/teacher/profile", icon: "👤" },
    { name: "Salary", path: "/teacher/salary", icon: "💰" },
  ];

  const studentNavItems = [
    { name: "Dashboard", path: "/student", icon: "🏠" },
    { name: "Attendance", path: "/student/attendance", icon: "📅" },
    { name: "Marks", path: "/student/marks", icon: "📊" },
    { name: "Notes", path: "/student/notes", icon: "📄" },
    { name: "Fees", path: "/student/fees", icon: "💰" },
    { name: "Profile", path: "/student/profile", icon: "👤" },
  ];

  const onAdminRoute = location.pathname.startsWith("/admin");
  const onTeacherRoute = location.pathname.startsWith("/teacher");
  const onStudentRoute = location.pathname.startsWith("/student");

  let navItems = publicNavItems;
  if (onAdminRoute && admin) navItems = adminNavItems;
  else if (onTeacherRoute && teacher) navItems = teacherNavItems;
  else if (onStudentRoute && student) navItems = studentNavItems;

  // Check if current page is active
  const isActivePage = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const activeStyle = ({ isActive }) => ({
    color: "#d4af37",
    fontWeight: "700",
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  });

  // Special style for Abacus button
  const getAbacusStyle = (item) => {
    if (item.name === "Abacus") {
      return {
        border: "2px solid #d4af37",
        borderRadius: "25px",
        background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(245,158,11,0.05))",
        padding: "6px 16px",
      };
    }
    return {};
  };

  return (
    <>
      <nav style={{
        ...styles.nav,
        background: "#065f46",
        boxShadow: scrolled 
          ? "0 4px 15px rgba(0,0,0,0.15)" 
          : "0 2px 10px rgba(0,0,0,0.1)",
      }}>
        {/* Left Section with Logo */}
        <div style={styles.left} onClick={() => navigate("/")}>
          <img src={logo} alt="logo" style={styles.logo} />
          <div style={styles.titleWrapper}>
            <h3 style={styles.title}>
              <span className="school-name-shine">Paradise Islamic School</span>
            </h3>
          </div>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={styles.links}>
            {navItems.map((item, i) => (
              <NavLink 
                key={i} 
                to={item.path} 
                style={({ isActive }) => ({
                  ...activeStyle({ isActive }),
                  ...getAbacusStyle(item),
                  boxShadow: isActivePage(item.path) 
                    ? "0 2px 8px rgba(212,175,55,0.25)" 
                    : "none",
                  background: isActivePage(item.path) 
                    ? "rgba(212,175,55,0.12)" 
                    : "transparent",
                  borderRadius: item.name === "Abacus" ? "25px" : "8px",
                })}
                className="nav-link"
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}

            {/* Login Buttons */}
            {!isLoggedIn && !onAdminRoute && !onTeacherRoute && !onStudentRoute && (
              <div style={styles.btnGroup}>
                <button onClick={() => navigate("/admin-login")} style={styles.adminBtn}>
                  👑 Admin
                </button>
                <button onClick={() => navigate("/teacher-login")} style={styles.teacherBtn}>
                  👨‍🏫 Teacher
                </button>
                <button onClick={() => navigate("/student-login")} style={styles.studentBtn}>
                  🎓 Student
                </button>
              </div>
            )}

            {/* Dashboard & Logout */}
            {isLoggedIn && !(onAdminRoute || onTeacherRoute || onStudentRoute) && (
              <div style={styles.btnGroup}>
                <button onClick={goDashboard} style={styles.dashboardBtn}>
                  📊 Dashboard
                </button>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  🚪 Logout
                </button>
              </div>
            )}

            {/* Logout only for role pages */}
            {isLoggedIn && (onAdminRoute || onTeacherRoute || onStudentRoute) && (
              <button onClick={handleLogout} style={styles.logoutBtnSmall}>
                🚪 Logout
              </button>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            style={styles.menuBtn}
            className={menuOpen ? "menu-open" : ""}
          >
            <span style={styles.menuIcon}>{menuOpen ? "✕" : "☰"}</span>
          </button>
        )}
      </nav>

      {/* Page Indicator Shadow Line */}
      <div style={styles.pageIndicator}>
        <div style={styles.pageIndicatorLine}></div>
        <div style={styles.pageIndicatorText}>
          <span>📍 {location.pathname === "/" ? "Home" : location.pathname.replace("/", "").replace(/-/g, " ").toUpperCase()}</span>
        </div>
        <div style={styles.pageIndicatorLine}></div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && menuOpen && (
        <>
          <div style={styles.mobileOverlay} onClick={() => setMenuOpen(false)}></div>
          <div style={styles.mobileMenu}>
            <div style={styles.mobileHeader}>
              <span style={styles.mobileHeaderIcon}>✨</span>
              <span>Menu</span>
              <span style={styles.mobileHeaderIcon}>✨</span>
            </div>
            
            {/* Main Navigation Items */}
            <div style={styles.mobileNavSection}>
              <div style={styles.mobileSectionTitle}>📌 Navigation</div>
              {navItems.map((item, i) => (
                <NavLink
                  key={i}
                  to={item.path}
                  style={({ isActive }) => ({
                    ...styles.mobileLink,
                    background: isActive ? "linear-gradient(135deg, #d4af37, #f59e0b)" : "transparent",
                    color: isActive ? "#065f46" : "#fff",
                    border: item.name === "Abacus" ? "1px solid #d4af37" : "none",
                  })}
                  onClick={() => setMenuOpen(false)}
                >
                  <span style={styles.mobileLinkIcon}>{item.icon}</span>
                  <span style={styles.mobileLinkText}>{item.name}</span>
                  <span style={styles.mobileLinkArrow}>→</span>
                </NavLink>
              ))}
            </div>

            {/* Divider */}
            <div style={styles.mobileDivider}></div>

            {/* Login/Logout Section */}
            {!isLoggedIn && !onAdminRoute && !onTeacherRoute && !onStudentRoute && (
              <div style={styles.mobileBtnGroup}>
                <div style={styles.mobileSectionTitle}>🔐 Account Access</div>
                <button onClick={() => { navigate("/admin-login"); setMenuOpen(false); }} style={styles.mobileAdminBtn}>
                  <span>👑</span> Admin Login
                </button>
                <button onClick={() => { navigate("/teacher-login"); setMenuOpen(false); }} style={styles.mobileTeacherBtn}>
                  <span>👨‍🏫</span> Teacher Login
                </button>
                <button onClick={() => { navigate("/student-login"); setMenuOpen(false); }} style={styles.mobileStudentBtn}>
                  <span>🎓</span> Student Login
                </button>
              </div>
            )}

            {isLoggedIn && !(onAdminRoute || onTeacherRoute || onStudentRoute) && (
              <div style={styles.mobileBtnGroup}>
                <div style={styles.mobileSectionTitle}>📱 Quick Actions</div>
                <button onClick={() => { goDashboard(); setMenuOpen(false); }} style={styles.mobileDashboardBtn}>
                  <span>📊</span> Dashboard
                </button>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLogoutBtn}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}

            {isLoggedIn && (onAdminRoute || onTeacherRoute || onStudentRoute) && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLogoutFullBtn}>
                🚪 Logout
              </button>
            )}

            {/* School Info Footer */}
            <div style={styles.mobileFooter}>
              <div style={styles.mobileFooterLine}></div>
              <p style={styles.mobileFooterText}>🏫 Paradise Islamic School</p>
              <p style={styles.mobileFooterSub}>Quality Education with Islamic Values</p>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes goldenShine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .school-name-shine {
          background: linear-gradient(
            90deg,
            #fbbf24,
            #33def9,
            #e7f4f5,
            #6ab8e2,
            #edc132,
            #fbbf24
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: goldenShine 7s linear infinite;
          display: inline-block;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .nav-link {
          position: relative;
          transition: all 0.3s ease;
          color: #ffffff;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            #fbbf24,
            #33def9,
            #e7f4f5,
            #6ab8e2,
            #edc132
          );
          background-size: 300% auto;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after {
          width: 80%;
        }
        
        .nav-link:hover {
          transform: translateY(-1px);
        }
        
        button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        button:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
        
        .menu-open {
          transform: rotate(90deg);
        }

        /* Desktop view */
        @media (min-width: 1025px) {
          .school-name-shine {
            font-size: 18px;
          }
          .nav-link {
            font-size: 13px;
          }
        }

        /* Tablet view */
        @media (max-width: 1024px) and (min-width: 769px) {
          .school-name-shine {
            font-size: 16px;
          }
          .nav-link {
            font-size: 11px !important;
            padding: 5px 8px !important;
          }
        }

        /* Mobile view */
        @media (max-width: 768px) {
          .school-name-shine {
            font-size: 14px;
          }
        }
      `}} />
    </>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  pageIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    padding: "6px 20px",
    background: "#064e3b",
    borderBottom: "1px solid rgba(212,175,55,0.2)",
    position: "sticky",
    top: "69px",
    zIndex: 999,
  },
  pageIndicatorLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(90deg, transparent, #d4af37, #33def9, #d4af37, transparent)",
  },
  pageIndicatorText: {
    color: "#d4af37",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "1px",
    "& span": {
      background: "rgba(212,175,55,0.1)",
      padding: "4px 12px",
      borderRadius: "20px",
    },
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "2px solid #d4af37",
    objectFit: "cover",
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    lineHeight: 1.2,
  },
  navIcon: {
    fontSize: "14px",
  },
  links: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    flexWrap: "wrap",
    "& a": {
      textDecoration: "none",
      fontSize: "clamp(12px, 2vw, 13px)",
      padding: "6px 10px",
      borderRadius: "8px",
      transition: "all 0.3s ease",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    },
  },
  btnGroup: {
    display: "flex",
    gap: "8px",
    marginLeft: "8px",
  },
  adminBtn: {
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    border: "none",
    padding: "5px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    boxShadow: "0 2px 6px rgba(139,92,246,0.3)",
  },
  teacherBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    padding: "5px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
  },
  studentBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    padding: "5px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    boxShadow: "0 2px 6px rgba(59,130,246,0.3)",
  },
  dashboardBtn: {
    background: "linear-gradient(135deg, #d4af37, #f59e0b)",
    color: "#065f46",
    border: "none",
    padding: "5px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
    boxShadow: "0 2px 6px rgba(212,175,55,0.3)",
  },
  logoutBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "5px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
  },
  logoutBtnSmall: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "5px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    marginLeft: "8px",
    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
  },
  menuBtn: {
    background: "linear-gradient(135deg, #d4af37, #f59e0b)",
    border: "none",
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 6px rgba(212,175,55,0.3)",
  },
  menuIcon: {
    fontSize: "20px",
    color: "#065f46",
    fontWeight: "bold",
    display: "inline-block",
    transition: "transform 0.3s ease",
  },
  mobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(5px)",
    zIndex: 1001,
    animation: "fadeIn 0.3s ease",
  },
  mobileMenu: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "300px",
    height: "100vh",
    background: "linear-gradient(180deg, #065f46 0%, #064e3b 100%)",
    zIndex: 1002,
    padding: "20px",
    animation: "slideIn 0.3s ease",
    overflowY: "auto",
    boxShadow: "-8px 0 30px rgba(0,0,0,0.3)",
  },
  mobileHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 0",
    marginBottom: "20px",
    borderBottom: "2px solid rgba(212,175,55,0.3)",
    color: "#d4af37",
    fontSize: "20px",
    fontWeight: "bold",
  },
  mobileHeaderIcon: {
    fontSize: "22px",
  },
  mobileNavSection: {
    marginBottom: "20px",
  },
  mobileSectionTitle: {
    color: "#d4af37",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "1px",
    marginBottom: "12px",
    textTransform: "uppercase",
    paddingLeft: "8px",
  },
  mobileLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    margin: "6px 0",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#fff",
    transition: "all 0.3s ease",
  },
  mobileLinkIcon: {
    fontSize: "22px",
    minWidth: "45px",
  },
  mobileLinkText: {
    flex: 1,
    fontSize: "15px",
    fontWeight: "500",
  },
  mobileLinkArrow: {
    fontSize: "14px",
    opacity: 0.6,
  },
  mobileDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
    margin: "15px 0",
  },
  mobileBtnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "5px",
  },
  mobileAdminBtn: {
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  mobileTeacherBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  mobileStudentBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  mobileDashboardBtn: {
    background: "linear-gradient(135deg, #d4af37, #f59e0b)",
    color: "#065f46",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  mobileLogoutBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  mobileLogoutFullBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "20px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  mobileFooter: {
    marginTop: "30px",
    paddingTop: "20px",
    textAlign: "center",
  },
  mobileFooterLine: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
    marginBottom: "15px",
  },
  mobileFooterText: {
    color: "#d4af37",
    fontSize: "12px",
    fontWeight: "600",
    margin: "5px 0",
  },
  mobileFooterSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "10px",
    margin: 0,
  },
};

export default Navbar;