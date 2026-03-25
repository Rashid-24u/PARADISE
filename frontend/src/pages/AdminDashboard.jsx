import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImg from "../assets/adbg.png";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (!isAdmin) navigate("/admin-login");
  }, [navigate]);

  // Check screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    navigate("/admin-login");
  };

  const cards = [
    { 
      title: "Students", 
      icon: "🎓", 
      path: "/admin/students", 
      color: "#6366f1",
      description: "Manage student records"
    },
    { 
      title: "Teachers", 
      icon: "👨‍🏫", 
      path: "/admin/teachers", 
      color: "#10b981",
      description: "Manage teacher profiles"
    },
    { 
      title: "Fees", 
      icon: "💰", 
      path: "/admin/fees", 
      color: "#f59e0b",
      description: "Track fee collections"
    },
    { 
      title: "Notices", 
      icon: "📢", 
      path: "/admin/notices", 
      color: "#ef4444",
      description: "Post important updates"
    },
    { 
      title: "Gallery", 
      icon: "🖼️", 
      path: "/admin/gallery", 
      color: "#0ea5e9",
      description: "Manage media gallery"
    },
  ];

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get current date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div style={styles.container}>
      {/* OVERLAY */}
      <div style={styles.overlay}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.welcomeBadge}>
              <span style={styles.greeting}>{getGreeting()}</span>
            </div>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.user}>
              Welcome back, <strong>{username || "Admin"}</strong>
            </p>
            <p style={styles.date}>{getCurrentDate()}</p>
          </div>

          <button 
            style={styles.logout} 
            onClick={() => setShowLogoutConfirm(true)}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            🚪 Logout
          </button>
        </div>

        {/* STATS CARDS */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>5</div>
              <div style={styles.statLabel}>Modules</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>Active</div>
              <div style={styles.statLabel}>Management</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>Quick</div>
              <div style={styles.statLabel}>Access</div>
            </div>
          </div>
        </div>

        {/* SECTION TITLE */}
        <div style={styles.sectionTitle}>
          <h2 style={styles.sectionHeading}>Management Modules</h2>
          <p style={styles.sectionSubtitle}>Click on any card to manage</p>
        </div>

        {/* GRID */}
        <div style={styles.grid}>
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                borderTop: `4px solid ${card.color}`,
                animation: `fadeInUp 0.5s ease ${i * 0.1}s both`
              }}
              onClick={() => navigate(card.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = `0 20px 40px ${card.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{...styles.icon, background: `${card.color}20`}}>
                {card.icon}
              </div>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDescription}>{card.description}</p>
              <div style={{...styles.cardFooter, borderTopColor: `${card.color}20`}}>
                <span style={styles.cardArrow}>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutConfirm && (
          <div style={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalIcon}>🚪</div>
              <h3 style={styles.modalTitle}>Confirm Logout</h3>
              <p style={styles.modalText}>Are you sure you want to logout?</p>
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
      </div>

      {/* Add keyframes animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundImage: `url(${bgImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  },

  // DARK GLASS OVERLAY
  overlay: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,0,0.65))",
    padding: isMobile => isMobile ? "20px" : "30px",
    backdropFilter: "blur(2px)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },

  headerLeft: {
    flex: 1,
  },

  welcomeBadge: {
    display: "inline-block",
    marginBottom: "10px",
  },

  greeting: {
    background: "rgba(255,255,255,0.2)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#f3f4f6",
  },

  title: {
    fontSize: "clamp(28px, 5vw, 40px)",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },

  user: {
    color: "#d1d5db",
    fontSize: "14px",
    marginBottom: "4px",
  },

  date: {
    color: "#9ca3af",
    fontSize: "12px",
  },

  logout: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 5px 15px rgba(239,68,68,0.3)",
    transition: "all 0.2s",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    WebkitTapHighlightColor: "transparent",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "40px",
  },

  statCard: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    padding: "15px 20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  statIcon: {
    fontSize: "32px",
  },

  statInfo: {
    flex: 1,
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "white",
    lineHeight: 1,
  },

  statLabel: {
    fontSize: "12px",
    color: "#d1d5db",
    marginTop: "4px",
  },

  sectionTitle: {
    textAlign: "center",
    marginBottom: "30px",
  },

  sectionHeading: {
    fontSize: "clamp(20px, 4vw, 24px)",
    fontWeight: "700",
    color: "white",
    marginBottom: "8px",
  },

  sectionSubtitle: {
    fontSize: "14px",
    color: "#d1d5db",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "25px",
    marginBottom: "40px",
  },

  card: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    position: "relative",
    overflow: "hidden",
  },

  icon: {
    fontSize: "48px",
    marginBottom: "15px",
    display: "inline-block",
    padding: "15px",
    borderRadius: "50%",
    transition: "all 0.3s",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: "8px",
  },

  cardDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "15px",
    lineHeight: 1.4,
  },

  cardFooter: {
    borderTop: "1px solid rgba(0,0,0,0.05)",
    paddingTop: "12px",
    marginTop: "5px",
  },

  cardArrow: {
    fontSize: "20px",
    color: "#10b981",
    transition: "transform 0.3s",
    display: "inline-block",
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
    zIndex: 1000,
  },

  modal: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    width: "320px",
    maxWidth: "90%",
    textAlign: "center",
    animation: "fadeInUp 0.3s ease",
  },

  modalIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },

  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2933",
    marginBottom: "10px",
  },

  modalText: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
  },

  modalButtons: {
    display: "flex",
    gap: "12px",
  },

  modalCancel: {
    flex: 1,
    padding: "10px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  modalConfirm: {
    flex: 1,
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
  },
};

export default AdminDashboard;