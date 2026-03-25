import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/lgo.jpeg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("admin");

  // Check screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Close menu when switching to desktop
      if (!mobile) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when clicking outside (only on mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && isMobile && !event.target.closest('.mobile-menu-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen, isMobile]);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (menuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, isMobile]);

  // Handle navigation
  const handleNavClick = (e, path) => {
    if (e) e.stopPropagation();
    setMenuOpen(false);
    if (path === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ADMIN CLICK HANDLER
  const handleAdminClick = (e) => {
    e.stopPropagation();
    if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate("/admin-login");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { name: "🏠 Home", path: "/" },
    { name: "📖 About", path: "/about" },
    { name: "📚 Courses", path: "/courses" },
    { name: "Abacus ✨", path: "/abacus" },
    { name: "🖼️ Gallery", path: "/gallery" },
    { name: "📢 Notice", path: "/notice" },
    { name: "📞 Contact", path: "/contact" }
  ];

  return (
    <>
      <nav className="navbar" style={styles.nav}>
        {/* LEFT SECTION */}
        <div 
          className="navbar-left"
          style={styles.left} 
          onClick={() => {
            navigate("/");
            handleNavClick(null, "/");
          }}
        >
          <img 
            src={logo} 
            alt="Paradise Islamic School" 
            style={styles.logoImg}
            className="navbar-logo"
          />
          <div style={styles.logoTextContainer}>
            <h2 style={styles.logoText}>Paradise Islamic School</h2>
            <p style={styles.tagline}>Learn Today, Lead Tomorrow</p>
          </div>
        </div>

        {/* DESKTOP MENU - Only visible on desktop */}
        {!isMobile && (
          <div className="desktop-menu" style={styles.desktopLinks}>
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                style={({ isActive }) => {
                  if (item.name === "Abacus ✨") {
                    return isActive ? styles.abacusActiveLink : styles.abacusLink;
                  }
                  return isActive ? styles.activeLink : styles.link;
                }}
              >
                {item.name === "Abacus ✨" ? (
                  <span style={styles.abacusText}>
                    🧮 Abacus ✨
                  </span>
                ) : (
                  <span>{item.name}</span>
                )}
              </NavLink>
            ))}

            {/* ADMIN BUTTON */}
            <button 
              className="admin-btn"
              style={styles.adminBtn} 
              onClick={handleAdminClick}
            >
              {isAdmin ? "📊 Dashboard" : "👤 Admin"}
            </button>

            {/* ADMISSION BUTTON */}
            <NavLink
              to="/admission"
              onClick={(e) => handleNavClick(e, "/admission")}
              style={({ isActive }) =>
                isActive ? styles.activeBtn : styles.btn
              }
            >
              🎓 Admission
            </NavLink>
          </div>
        )}

        {/* MOBILE HAMBURGER ICON - Only on mobile */}
        {isMobile && (
          <button
            className="mobile-hamburger"
            style={styles.menuIcon}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <div style={styles.hamburgerIcon}>
              <span style={{
                ...styles.hamburgerLine,
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              }} />
              <span style={{
                ...styles.hamburgerLine,
                opacity: menuOpen ? 0 : 1
              }} />
              <span style={{
                ...styles.hamburgerLine,
                transform: menuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
              }} />
            </div>
          </button>
        )}
      </nav>

      {/* MOBILE MENU - Separate component, only visible on mobile when open */}
      {isMobile && menuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="mobile-overlay"
            style={styles.overlay}
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Mobile Menu Container */}
          <div className="mobile-menu-container" style={styles.mobileMenu}>
            <div style={styles.mobileMenuContent}>
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className="mobile-nav-link"
                  style={({ isActive }) => ({
                    ...styles.mobileLink,
                    ...(isActive ? styles.mobileActiveLink : {})
                  })}
                >
                  {item.name === "Abacus ✨" ? (
                    <span style={styles.mobileAbacusText}>
                      🧮 Abacus ✨
                    </span>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </NavLink>
              ))}

              {/* ADMIN BUTTON */}
              <button 
                className="mobile-admin-btn"
                style={styles.mobileAdminBtn} 
                onClick={handleAdminClick}
              >
                {isAdmin ? "📊 Dashboard" : "👤 Admin"}
              </button>

              {/* ADMISSION BUTTON */}
              <NavLink
                to="/admission"
                onClick={(e) => handleNavClick(e, "/admission")}
                style={({ isActive }) => ({
                  ...styles.mobileBtn,
                  ...(isActive ? styles.mobileActiveBtn : {})
                })}
              >
                🎓 Admission
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    zIndex: 1000,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    minHeight: "70px",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    flex: 1,
  },

  logoImg: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #facc15",
    transition: "transform 0.3s ease",
  },

  logoTextContainer: {
    display: "flex",
    flexDirection: "column",
  },

  logoText: {
    fontSize: "clamp(14px, 3vw, 18px)",
    margin: 0,
    fontWeight: "700",
    color: "white",
    lineHeight: 1.3,
    letterSpacing: "-0.3px",
  },

  tagline: {
    fontSize: "clamp(8px, 2vw, 10px)",
    margin: 0,
    color: "#d1fae5",
    letterSpacing: "0.5px",
    fontWeight: "500",
  },

  // Desktop styles
  desktopLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  link: {
    color: "#f0fdf4",
    textDecoration: "none",
    padding: "8px 16px",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px",
    display: "inline-flex",
    alignItems: "center",
    WebkitTapHighlightColor: "transparent",
    whiteSpace: "nowrap",
  },

  activeLink: {
    color: "#facc15",
    textDecoration: "none",
    padding: "8px 16px",
    fontWeight: "600",
    fontSize: "14px",
    background: "rgba(250, 204, 21, 0.15)",
    borderRadius: "8px",
    whiteSpace: "nowrap",
  },

  abacusLink: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
    textDecoration: "none",
    padding: "8px 18px",
    transition: "all 0.3s ease",
    fontSize: "14px",
    fontWeight: "700",
    borderRadius: "30px",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
    animation: "pulse 2s infinite",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  abacusActiveLink: {
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: "#065f46",
    textDecoration: "none",
    padding: "8px 18px",
    transition: "all 0.3s ease",
    fontSize: "14px",
    fontWeight: "800",
    borderRadius: "30px",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.6)",
    transform: "scale(1.02)",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  abacusText: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  btn: {
    background: "linear-gradient(135deg, #facc15, #fde047)",
    padding: "8px 20px",
    borderRadius: "30px",
    color: "#065f46",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(250, 204, 21, 0.3)",
    whiteSpace: "nowrap",
  },

  activeBtn: {
    background: "linear-gradient(135deg, #fde047, #facc15)",
    padding: "8px 20px",
    borderRadius: "30px",
    color: "#065f46",
    fontWeight: "800",
    fontSize: "14px",
    boxShadow: "0 2px 12px rgba(250, 204, 21, 0.4)",
    whiteSpace: "nowrap",
  },

  adminBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
    whiteSpace: "nowrap",
  },

  // Mobile menu icon
  menuIcon: {
    cursor: "pointer",
    padding: "10px",
    transition: "transform 0.2s",
    WebkitTapHighlightColor: "transparent",
    zIndex: 1001,
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  hamburgerIcon: {
    width: "24px",
    height: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  hamburgerLine: {
    width: "100%",
    height: "2px",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    borderRadius: "2px",
  },

  // Mobile menu styles
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
    backdropFilter: "blur(3px)",
    animation: "fadeIn 0.3s ease",
  },

  mobileMenu: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "280px",
    background: "linear-gradient(135deg, #065f46, #047857)",
    zIndex: 1000,
    boxShadow: "-5px 0 25px rgba(0,0,0,0.3)",
    animation: "slideInRight 0.3s ease",
    overflowY: "auto",
  },

  mobileMenuContent: {
    padding: "80px 20px 30px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  mobileLink: {
    color: "#f0fdf4",
    textDecoration: "none",
    padding: "14px 20px",
    transition: "all 0.2s ease",
    fontSize: "16px",
    fontWeight: "500",
    borderRadius: "12px",
    display: "block",
    textAlign: "center",
    WebkitTapHighlightColor: "transparent",
  },

  mobileActiveLink: {
    color: "#facc15",
    background: "rgba(250, 204, 21, 0.15)",
    fontWeight: "600",
  },

  mobileAbacusText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  mobileAdminBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    padding: "14px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    marginTop: "8px",
  },

  mobileBtn: {
    background: "linear-gradient(135deg, #facc15, #fde047)",
    padding: "14px 20px",
    borderRadius: "30px",
    color: "#065f46",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "16px",
    transition: "all 0.2s ease",
    display: "block",
    textAlign: "center",
    marginTop: "8px",
  },

  mobileActiveBtn: {
    background: "linear-gradient(135deg, #fde047, #facc15)",
    fontWeight: "800",
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 6px 25px rgba(245, 158, 11, 0.6);
        transform: scale(1.02);
      }
      100% {
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        transform: scale(1);
      }
    }
    
    /* Desktop hover effects */
    @media (hover: hover) and (min-width: 769px) {
      .navbar-left:hover .navbar-logo {
        transform: scale(1.05);
      }
      
      .desktop-menu a:not(.abacus-link):hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }
      
      .admin-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      }
      
      .admission-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(250, 204, 21, 0.4);
      }
      
      .abacus-link:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 30px rgba(245, 158, 11, 0.7);
      }
    }
    
    /* Mobile touch feedback */
    @media (max-width: 768px) {
      .mobile-nav-link:active,
      .mobile-admin-btn:active,
      .mobile-btn:active {
        transform: scale(0.98);
        transition: transform 0.05s;
      }
    }
    
    /* Scrollbar styling for mobile menu */
    .mobile-menu-container::-webkit-scrollbar {
      width: 4px;
    }
    
    .mobile-menu-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .mobile-menu-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
  `;
  
  if (!document.head.querySelector('#navbar-styles')) {
    styleSheet.id = 'navbar-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Navbar;