import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function TeacherSidebar() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    localStorage.removeItem("teacher");
    localStorage.removeItem("student");
    navigate("/teacher-login");
  };

  const linkStyle = ({ isActive }) => ({
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    color: isActive ? "#fff" : "#94a3b8",
    background: isActive ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    fontSize: "14px",
  });

  const navItems = [
    { to: "/teacher", icon: "🏠", label: "Dashboard" },
    { to: "/teacher/profile", icon: "👤", label: "Profile" },
    { to: "/teacher/students", icon: "👨‍🎓", label: "Students" },
    { to: "/teacher/attendance", icon: "📅", label: "Attendance" },
    { to: "/teacher/marks", icon: "📝", label: "Marks" },
    { to: "/teacher/notes", icon: "📄", label: "Notes" },
    { to: "/teacher/reports", icon: "📊", label: "Reports" },
    { to: "/teacher/salary", icon: "💰", label: "Salary" },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isMobile && (
        <button style={styles.menuBtn} onClick={toggleSidebar}>
          <span style={styles.menuIcon}>☰</span>
          <span style={styles.menuText}>Menu</span>
        </button>
      )}

      {isMobile && isOpen && (
        <div style={styles.overlay} onClick={toggleSidebar}></div>
      )}

      <div
        style={{
          ...styles.sidebar,
          ...(isMobile && {
            transform: isOpen ? "translateX(0)" : "translateX(-100%)",
            position: "fixed",
            zIndex: 1001,
            transition: "transform 0.3s ease",
          }),
        }}
      >
        <div>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>👨‍🏫</div>
            <h2 style={styles.logo}>Teacher Portal</h2>
          </div>

          {isMobile && (
            <button style={styles.closeBtn} onClick={toggleSidebar}>
              ✕
            </button>
          )}

          <div style={styles.navContainer}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={linkStyle}
                onClick={handleLinkClick}
                className="teacher-sidebar-link"
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowLogoutConfirm(true)} 
          style={styles.logoutBtn} 
          className="teacher-sidebar-logout"
        >
          <span style={styles.logoutIcon}>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {showLogoutConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}>🚪</div>
            <h3 style={styles.modalTitle}>Confirm Logout</h3>
            <p style={styles.modalText}>Are you sure you want to logout from your teacher account?</p>
            <div style={styles.modalButtons}>
              <button style={styles.modalCancel} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button style={styles.modalConfirm} onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
    position: "sticky",
    top: 0,
    left: 0,
  },
  menuBtn: {
    position: "fixed",
    top: "80px",
    left: "16px",
    zIndex: 1000,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
  },
  menuIcon: { fontSize: "18px" },
  menuText: { fontSize: "12px" },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoIcon: { fontSize: "28px" },
  logo: { color: "#22c55e", fontSize: "18px", fontWeight: "700", margin: 0 },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "white",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  navContainer: { display: "flex", flexDirection: "column", gap: "4px" },
  navIcon: { fontSize: "18px", minWidth: "28px" },
  logoutBtn: {
    padding: "12px 16px",
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    marginTop: "auto",
  },
  logoutIcon: { fontSize: "18px" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    background: "white",
    padding: "28px",
    borderRadius: "24px",
    width: "320px",
    maxWidth: "90%",
    textAlign: "center",
  },
  modalIcon: { fontSize: "48px", marginBottom: "12px" },
  modalTitle: { fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" },
  modalText: { fontSize: "14px", color: "#64748b", marginBottom: "24px" },
  modalButtons: { display: "flex", gap: "12px" },
  modalCancel: {
    flex: 1,
    padding: "10px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  modalConfirm: {
    flex: 1,
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default TeacherSidebar;