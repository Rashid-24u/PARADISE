import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/paradise.jpeg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("admin");

  // Check screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Close menu when switching to desktop
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.navbar-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (menuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen, isMobile]);

  // SCROLL FUNCTION
  const handleNavClick = (e) => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ADMIN CLICK HANDLER
  const handleAdminClick = () => {
    if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate("/admin-login");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile menu */}
      {isMobile && menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}
      
      <nav className="navbar-container" style={styles.nav}>
        {/* LEFT SECTION */}
        <div style={styles.left} onClick={() => navigate("/")}>
          <img src={logo} alt="Paradise Islamic School" style={styles.logoImg} />
          <div style={styles.logoTextContainer}>
            <h2 style={styles.logoText}>Paradise Islamic School</h2>
            <p style={styles.tagline}>Learn Today, Lead Tomorrow</p>
          </div>
        </div>

        {/* HAMBURGER MENU ICON - Only on mobile */}
        {isMobile && (
          <div
            style={styles.menuIcon}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            aria-label="Toggle menu"
          >
            <div style={styles.hamburgerIcon}>
              <span style={{...styles.hamburgerLine, transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'}} />
              <span style={{...styles.hamburgerLine, opacity: menuOpen ? 0 : 1}} />
              <span style={{...styles.hamburgerLine, transform: menuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'}} />
            </div>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <div
          style={{
            ...styles.links,
            ...(isMobile && menuOpen ? styles.mobileMenuOpen : {}),
            ...(!isMobile ? styles.desktopLinks : {})
          }}
        >
          {navItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={handleNavClick}
              style={({ isActive }) => {
                // Special style for Abacus link
                if (item.name === "Abacus ✨") {
                  return isActive ? styles.abacusActiveLink : styles.abacusLink;
                }
                return isActive ? styles.activeLink : styles.link;
              }}
            >
              {item.name === "Abacus ✨" ? (
                <span style={styles.abacusText}>
                  🧮 {item.name}
                </span>
              ) : (
                <span style={styles.linkText}>{item.name}</span>
              )}
            </NavLink>
          ))}

          {/* ADMIN BUTTON */}
          <button style={styles.adminBtn} onClick={handleAdminClick}>
            {isAdmin ? "📊 Dashboard" : "👤 Admin"}
          </button>

          {/* ADMISSION BUTTON */}
          <NavLink
            to="/admission"
            onClick={handleNavClick}
            style={({ isActive }) =>
              isActive ? styles.activeBtn : styles.btn
            }
          >
            🎓 Admission
          </NavLink>
        </div>
      </nav>
    </>
  );
}

const navItems = [
  { name: "🏠 Home", path: "/" },
  { name: "📖 About", path: "/about" },
  { name: "📚 Courses", path: "/courses" },
  { name: "Abacus ✨", path: "/abacus" },
  { name: "🖼️ Gallery", path: "/gallery" },
  { name: "📢 Notice", path: "/notice" },
  { name: "📞 Contact", path: "/contact" }
];

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    zIndex: 1000,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    flex: 1,
  },

  logoImg: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #facc15",
    transition: "transform 0.3s",
  },

  logoTextContainer: {
    display: "flex",
    flexDirection: "column",
  },

  logoText: {
    fontSize: "clamp(12px, 4vw, 16px)",
    margin: 0,
    fontWeight: "700",
    color: "white",
    lineHeight: 1.2,
  },

  tagline: {
    fontSize: "8px",
    margin: 0,
    color: "#d1fae5",
    letterSpacing: "0.3px",
  },

  menuIcon: {
    cursor: "pointer",
    padding: "8px",
    transition: "transform 0.2s",
    WebkitTapHighlightColor: "transparent",
    zIndex: 1001,
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

  links: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  desktopLinks: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    top: "auto",
    right: "auto",
    background: "transparent",
    width: "auto",
    padding: "0",
  },

  mobileMenuOpen: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #065f46, #047857)",
    flexDirection: "column",
    width: "280px",
    padding: "80px 20px 20px",
    display: "flex",
    boxShadow: "-5px 0 20px rgba(0,0,0,0.3)",
    animation: "slideInRight 0.3s ease",
    gap: "8px",
    zIndex: 1000,
    overflowY: "auto",
  },

  link: {
    color: "#f0fdf4",
    textDecoration: "none",
    padding: "12px 16px",
    transition: "all 0.2s",
    fontSize: "16px",
    fontWeight: "500",
    borderRadius: "12px",
    display: "block",
    WebkitTapHighlightColor: "transparent",
  },

  activeLink: {
    color: "#facc15",
    textDecoration: "none",
    padding: "12px 16px",
    fontWeight: "600",
    fontSize: "16px",
    background: "rgba(250, 204, 21, 0.15)",
    borderRadius: "12px",
  },

  linkText: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  // Special styles for Abacus link
  abacusLink: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "white",
    textDecoration: "none",
    padding: "10px 20px",
    transition: "all 0.3s",
    fontSize: "15px",
    fontWeight: "700",
    borderRadius: "30px",
    display: "block",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
    animation: "pulse 2s infinite",
    textAlign: "center",
    WebkitTapHighlightColor: "transparent",
  },

  abacusActiveLink: {
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: "#065f46",
    textDecoration: "none",
    padding: "10px 20px",
    transition: "all 0.3s",
    fontSize: "15px",
    fontWeight: "800",
    borderRadius: "30px",
    display: "block",
    boxShadow: "0 4px 20px rgba(245, 158, 11, 0.6)",
    transform: "scale(1.02)",
    textAlign: "center",
  },

  abacusText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },

  btn: {
    background: "linear-gradient(135deg, #facc15, #fde047)",
    padding: "10px 20px",
    borderRadius: "30px",
    color: "#065f46",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
    display: "block",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(250, 204, 21, 0.3)",
    WebkitTapHighlightColor: "transparent",
  },

  activeBtn: {
    background: "linear-gradient(135deg, #fde047, #facc15)",
    padding: "10px 20px",
    borderRadius: "30px",
    color: "#065f46",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 2px 12px rgba(250, 204, 21, 0.4)",
  },

  adminBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
    WebkitTapHighlightColor: "transparent",
  },
};

// Add CSS animations
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
  
  .navbar-container {
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  
  /* Touch-friendly tap targets */
  .navbar-container a,
  .navbar-container button {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    /* Larger touch targets on mobile */
    .navbar-container a,
    .navbar-container button {
      min-height: 48px;
      margin: 4px 0;
    }
    
    /* Adjust logo size on mobile */
    [style*="logoImg"] {
      width: 36px;
      height: 36px;
    }
  }
  
  /* Hover effects - only on non-touch devices */
  @media (hover: hover) {
    .navbar-container a:hover,
    .navbar-container button:hover {
      transform: translateY(-2px);
      transition: transform 0.2s;
    }
    
    [style*="abacusLink"]:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 8px 30px rgba(245, 158, 11, 0.7);
    }
  }
  
  /* Active/Tap feedback */
  .navbar-container a:active,
  .navbar-container button:active {
    transform: scale(0.98);
    transition: transform 0.05s;
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;