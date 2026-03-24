import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/paradise.jpeg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("admin");

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate("/admin-login");
    }
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>

      {/* LEFT */}
      <div style={styles.left}>
        <img src={logo} alt="logo" style={styles.logoImg} />
        <div>
          <h2 style={styles.logoText}>Paradise Islamic School</h2>
          <p style={styles.tagline}>Learn Today, Lead Tomorrow</p>
        </div>
      </div>

      {/* HAMBURGER */}
      <div style={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* LINKS */}
      <div
        style={{
          ...styles.links,
          ...(menuOpen ? styles.mobileMenuOpen : {})
        }}
      >
        {navItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            onClick={() => setMenuOpen(false)}
            style={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            {item.name}
          </NavLink>
        ))}

        {/* ADMIN BUTTON */}
        <button style={styles.adminBtn} onClick={handleAdminClick}>
          {isAdmin ? "Dashboard" : "Admin"}
        </button>

        {/* ADMISSION */}
        <NavLink
          to="/admission"
          onClick={() => setMenuOpen(false)}
          style={({ isActive }) =>
            isActive ? styles.activeBtn : styles.btn
          }
        >
          Admission
        </NavLink>
      </div>
    </nav>
  );
}

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Courses", path: "/courses" },
  { name: "Abacus✨", path: "/abacus" },
  { name: "Gallery", path: "/gallery" },
  { name: "Notice", path: "/notice" },
  { name: "Contact", path: "/contact" }
];

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    background: "linear-gradient(90deg, #0c3b2e, #14532d)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  logoImg: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #facc15"
  },

  logoText: {
    fontSize: "16px",
    margin: 0
  },

  tagline: {
    fontSize: "11px",
    margin: 0,
    color: "#d1d5db"
  },

  menuIcon: {
    display: "block",
    fontSize: "26px",
    cursor: "pointer"
  },

  links: {
    display: "none"
  },

  mobileMenuOpen: {
    position: "absolute",
    top: "70px",
    right: 0,
    background: "#0e4938",
    flexDirection: "column",
    width: "220px",
    padding: "15px",
    display: "flex"
  },

  link: {
    color: "#e5e7eb",
    margin: "10px",
    textDecoration: "none"
  },

  activeLink: {
    color: "#facc15",
    margin: "10px",
    fontWeight: "bold"
  },

  btn: {
    background: "#facc15",
    padding: "8px 15px",
    borderRadius: "20px",
    color: "black",
    margin: "10px",
    textAlign: "center"
  },

  activeBtn: {
    background: "#fde047",
    padding: "8px 15px",
    borderRadius: "20px",
    color: "black",
    margin: "10px"
  },

  adminBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    margin: "10px",
    cursor: "pointer"
  }
};

export default Navbar;