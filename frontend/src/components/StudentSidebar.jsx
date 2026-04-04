import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function StudentSidebar() {
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
    navigate("/student-login");
  };

  const linkStyle = ({ isActive }) => ({
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    color: isActive ? "#fff" : "#94a3b8",
    background: isActive ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "transparent",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    fontSize: "14px",
  });

  const navItems = [
    { to: "/student", icon: "🏠", label: "Dashboard" },
    { to: "/student/profile", icon: "👤", label: "Profile" },
    { to: "/student/attendance", icon: "📅", label: "Attendance" },
    { to: "/student/marks", icon: "📊", label: "Marks" },
    { to: "/student/notes", icon: "📄", label: "Notes" },
    { to: "/student/fees", icon: "💰", label: "Fees" }, // NEW: Fees link
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
      {/* Mobile Menu Button */}
      {isMobile && (
        <button style={styles.menuBtn} onClick={toggleSidebar}>
          <span style={styles.menuIcon}>☰</span>
          <span style={styles.menuText}>Menu</span>
        </button>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isOpen && (
        <div style={styles.overlay} onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
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
        {/* Logo Section */}
        <div>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>🎓</div>
            <h2 style={styles.logo}>Student Portal</h2>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button style={styles.closeBtn} onClick={toggleSidebar}>
              ✕
            </button>
          )}

          {/* Navigation Links */}
          <div style={styles.navContainer}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={linkStyle}
                onClick={handleLinkClick}
                className="student-sidebar-link"
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => setShowLogoutConfirm(true)} 
          style={styles.logout}
          className="student-sidebar-logout"
        >
          <span style={styles.logoutIcon}>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}>🚪</div>
            <h3 style={styles.modalTitle}>Confirm Logout</h3>
            <p style={styles.modalText}>Are you sure you want to logout from your student account?</p>
            <div style={styles.modalButtons}>
              <button 
                style={styles.modalCancel}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.modalConfirm}
                onClick={handleLogout}
              >
                Logout
              </button>
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
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
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
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
    transition: "all 0.2s ease",
  },
  menuIcon: {
    fontSize: "18px",
  },
  menuText: {
    fontSize: "12px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    animation: "fadeIn 0.3s ease",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoIcon: {
    fontSize: "28px",
  },
  logo: {
    color: "#3b82f6",
    fontSize: "18px",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.3px",
  },
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(255,255,255,0.2)",
    },
  },
  navContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navIcon: {
    fontSize: "18px",
    minWidth: "28px",
  },
  logout: {
    padding: "12px 16px",
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    marginTop: "auto",
    "&:active": {
      transform: "scale(0.98)",
    },
  },
  logoutIcon: {
    fontSize: "18px",
  },
  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(5px)",
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
    animation: "modalFadeIn 0.3s ease",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  modalIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  modalText: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
  },
  modalCancel: {
    flex: 1,
    padding: "10px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#e2e8f0",
    },
  },
  modalConfirm: {
    flex: 1,
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#dc2626",
      transform: "scale(1.02)",
    },
  },
};

// Add global styles for animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Desktop hover effects */
  @media (min-width: 769px) {
    .student-sidebar-link:hover {
      background: rgba(59,130,246,0.1) !important;
      transform: translateX(4px);
    }
    
    .student-sidebar-logout:hover {
      background: rgba(239,68,68,0.25) !important;
      transform: translateY(-2px);
    }
  }
  
  /* Active link indicator */
  .student-sidebar-link.active {
    position: relative;
  }
  
  .student-sidebar-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: #3b82f6;
    border-radius: 0 3px 3px 0;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .student-sidebar {
      width: 280px;
    }
    
    .student-sidebar-link {
      padding: 14px 16px !important;
    }
    
    .student-sidebar-link:active {
      background: #3b82f6 !important;
      transform: scale(0.98);
    }
    
    .student-sidebar-logout:active {
      transform: scale(0.98);
    }
  }
  
  @media (max-width: 480px) {
    .student-sidebar {
      width: 260px !important;
    }
    
    .student-sidebar-link {
      padding: 12px 16px !important;
      font-size: 13px !important;
    }
    
    .student-sidebar-logo {
      font-size: 16px !important;
    }
    
    .student-sidebar-logo-icon {
      font-size: 24px !important;
    }
    
    .student-modal {
      width: 280px !important;
      padding: 20px !important;
    }
  }
  
  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    .student-sidebar-link {
      transition: transform 0.1s ease;
    }
    .student-sidebar-link:active {
      transform: scale(0.98);
    }
  }
`;
document.head.appendChild(styleSheet);

export default StudentSidebar;