import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImg from "../assets/adbg.png"; // 🔥 ADD IMAGE

function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (!isAdmin) navigate("/admin-login");
  }, [navigate]);

  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    navigate("/admin-login");
  };

  const cards = [
    { title: "Students", icon: "🎓", path: "/admin/students", color: "#6366f1" },
    { title: "Teachers", icon: "👨‍🏫", path: "/admin/teachers", color: "#10b981" },
    { title: "Fees", icon: "💰", path: "/admin/fees", color: "#f59e0b" },
    { title: "Notices", icon: "📢", path: "/admin/notices", color: "#ef4444" },
    { title: "Gallery", icon: "🖼️", path: "/admin/gallery", color: "#0ea5e9" },
  ];

  return (
    <div style={styles.container}>

      {/* 🔥 OVERLAY */}
      <div style={styles.overlay}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.user}>Welcome, {username || "Admin"}</p>
          </div>

          <button style={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* GRID */}
        <div style={styles.grid}>
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                borderTop: `4px solid ${card.color}`
              }}
              onClick={() => navigate(card.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  `0 20px 40px ${card.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(0,0,0,0.08)";
              }}
            >
              <div style={styles.icon}>{card.icon}</div>
              <h3 style={styles.cardTitle}>{card.title}</h3>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundImage: `url(${bgImg})`, // 🔥 BG IMAGE
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  },

  // 🔥 DARK GLASS OVERLAY
  overlay: {
    minHeight: "100vh",
    background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))",
    padding: "30px"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "10px"
  },

  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#ffffff"
  },

  user: {
    color: "#d1d5db",
    fontSize: "14px"
  },

  logout: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 5px 15px rgba(239,68,68,0.3)"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "25px"
  },

  card: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    padding: "35px",
    borderRadius: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },

  icon: {
    fontSize: "40px",
    marginBottom: "10px"
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2933"
  }
};

export default AdminDashboard;