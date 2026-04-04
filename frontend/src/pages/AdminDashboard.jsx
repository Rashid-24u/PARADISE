import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImg from "../assets/adbg.png";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_courses: 0,
    total_fees_collected: 0,
    total_fees_pending: 0,
    total_activity_registrations: 0,
    total_salary_paid: 0,
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (!isAdmin) navigate("/admin-login");
    fetchStats();
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard-stats/");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    localStorage.removeItem("teacher");
    localStorage.removeItem("student");
    navigate("/admin-login");
  };

  const cards = [
    { 
      title: "Students", 
      icon: "🎓", 
      path: "/admin/students", 
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      description: "Manage student records",
      count: stats.total_students
    },
    { 
      title: "Teachers", 
      icon: "👨‍🏫", 
      path: "/admin/teachers", 
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      description: "Manage teacher profiles",
      count: stats.total_teachers
    },
    { 
      title: "Courses", 
      icon: "📚", 
      path: "/admin/courses", 
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
      description: "Manage class levels",
      count: stats.total_courses
    },
    { 
      title: "Fees", 
      icon: "💰", 
      path: "/admin/fees", 
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
      description: "Track fee collections",
      count: `₹${stats.total_fees_collected.toLocaleString()}`
    },
    { 
      title: "Extra Activities", 
      icon: "🎯", 
      path: "/admin/extra-activities", 
      color: "#ec489a",
      gradient: "linear-gradient(135deg, #ec489a 0%, #f472b6 100%)",
      description: "Manage Abacus, Chess & more",
      count: stats.total_activity_registrations
    },
    { 
      title: "Teacher Salary", 
      icon: "💵", 
      path: "/admin/teacher-salary", 
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
      description: "Manage teacher salaries",
      count: `₹${stats.total_salary_paid.toLocaleString()}`
    },
    { 
      title: "Notices", 
      icon: "📢", 
      path: "/admin/notices", 
      color: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
      description: "Post important updates",
      count: "Manage"
    },
    { 
      title: "Gallery", 
      icon: "🖼️", 
      path: "/admin/gallery", 
      color: "#0ea5e9",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
      description: "Manage media gallery",
      count: "Manage"
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Responsive grid columns based on screen size
  const getGridColumns = () => {
    if (isMobile) return "1fr";
    if (isTablet) return "repeat(2, 1fr)";
    return "repeat(auto-fill, minmax(300px, 1fr))";
  };

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.overlay,
        padding: isMobile ? "16px" : isTablet ? "24px" : "30px"
      }}>
        
        {/* Animated Background Orbs */}
        <div style={styles.orb1}></div>
        <div style={styles.orb2}></div>
        <div style={styles.orb3}></div>

        {/* Header Section - Responsive */}
        <div style={{
          ...styles.header,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "flex-start",
          marginBottom: isMobile ? "25px" : "40px"
        }}>
          <div style={styles.headerLeft}>
            <div style={styles.welcomeBadge}>
              <span style={styles.greetingIcon}>✨</span>
              <span style={styles.greeting}>{getGreeting()}</span>
            </div>
            <h1 style={{
              ...styles.title,
              fontSize: isMobile ? "28px" : isTablet ? "36px" : "44px"
            }}>
              <span style={styles.titleHighlight}>Admin</span> Dashboard
            </h1>
            <div style={{
              ...styles.userInfo,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? "8px" : "16px"
            }}>
              <p style={styles.user}>Welcome back, <strong>{username || "Administrator"}</strong></p>
              <div style={styles.dateChip}>
                <span>📅</span>
                <span>{getCurrentDate()}</span>
              </div>
            </div>
          </div>

          <button style={{
            ...styles.logoutBtn,
            width: isMobile ? "100%" : "auto",
            justifyContent: "center"
          }} onClick={() => setShowLogoutConfirm(true)}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div style={{
          ...styles.statsGrid,
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
          gap: isMobile ? "12px" : "20px",
          marginBottom: isMobile ? "30px" : "45px"
        }}>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <span style={styles.statIcon}>👨‍🎓</span>
            </div>
            <div style={styles.statContent}>
              <div style={{
                ...styles.statValue,
                fontSize: isMobile ? "22px" : "26px"
              }}>{stats.total_students}</div>
              <div style={styles.statLabel}>Total Students</div>
            </div>
            <div style={styles.statBadge}>Active</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <span style={styles.statIcon}>👨‍🏫</span>
            </div>
            <div style={styles.statContent}>
              <div style={{
                ...styles.statValue,
                fontSize: isMobile ? "22px" : "26px"
              }}>{stats.total_teachers}</div>
              <div style={styles.statLabel}>Total Teachers</div>
            </div>
            <div style={styles.statBadge}>Active</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <span style={styles.statIcon}>💰</span>
            </div>
            <div style={styles.statContent}>
              <div style={{
                ...styles.statValue,
                fontSize: isMobile ? "18px" : "26px"
              }}>₹{stats.total_fees_collected.toLocaleString()}</div>
              <div style={styles.statLabel}>Fees Collected</div>
            </div>
            <div style={styles.statBadge}>Total</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIconWrapper}>
              <span style={styles.statIcon}>⚠️</span>
            </div>
            <div style={styles.statContent}>
              <div style={{
                ...styles.statValue,
                fontSize: isMobile ? "18px" : "26px"
              }}>₹{stats.total_fees_pending.toLocaleString()}</div>
              <div style={styles.statLabel}>Pending Fees</div>
            </div>
            <div style={styles.statBadge}>Due</div>
          </div>
        </div>

        {/* Section Title - Responsive */}
        <div style={{
          ...styles.sectionHeader,
          marginBottom: isMobile ? "25px" : "35px",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "12px" : "20px"
        }}>
          <div style={styles.sectionLine}></div>
          <div style={styles.sectionText}>
            <h2 style={{
              ...styles.sectionTitle,
              fontSize: isMobile ? "20px" : "26px"
            }}>Management Modules</h2>
            <p style={styles.sectionSubtitle}>Click on any card to manage</p>
          </div>
          <div style={styles.sectionLine}></div>
        </div>

        {/* Cards Grid - Responsive */}
        <div style={{
          ...styles.grid,
          gridTemplateColumns: getGridColumns(),
          gap: isMobile ? "16px" : "25px",
          marginBottom: isMobile ? "30px" : "50px"
        }}>
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                animation: `slideUp 0.5s ease ${i * 0.08}s both`
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(card.path)}
            >
              <div style={{...styles.cardBorder, background: card.gradient}}></div>
              <div style={{
                ...styles.cardInner,
                padding: isMobile ? "20px" : "28px"
              }}>
                <div style={{
                  ...styles.cardIcon,
                  width: isMobile ? "60px" : "70px",
                  height: isMobile ? "60px" : "70px"
                }}>
                  <span style={{
                    ...styles.cardIconEmoji,
                    fontSize: isMobile ? "30px" : "36px"
                  }}>{card.icon}</span>
                </div>
                <h3 style={{
                  ...styles.cardTitle,
                  fontSize: isMobile ? "18px" : "20px"
                }}>{card.title}</h3>
                <p style={styles.cardDesc}>{card.description}</p>
                <div style={styles.cardCount}>
                  <span style={{...styles.countBadge, background: card.color}}>
                    {card.count}
                  </span>
                </div>
                <div style={styles.cardFooter}>
                  <span style={styles.cardArrow}>
                    Manage Module
                    <span style={styles.cardArrowIcon}>→</span>
                  </span>
                </div>
              </div>
              {hoveredCard === i && (
                <div style={{...styles.cardGlow, background: card.gradient}}></div>
              )}
            </div>
          ))}
        </div>

        {/* Footer - Responsive */}
        <div style={styles.footer}>
          <p>© 2026 Paradise Islamic Pre-School | All Rights Reserved</p>
        </div>

        {/* Logout Modal - Responsive */}
        {showLogoutConfirm && (
          <div style={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
            <div style={{
              ...styles.modal,
              width: isMobile ? "90%" : "340px",
              padding: isMobile ? "24px" : "32px"
            }} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalIcon}>🚪</div>
              <h3 style={{
                ...styles.modalTitle,
                fontSize: isMobile ? "20px" : "22px"
              }}>Confirm Logout</h3>
              <p style={styles.modalText}>Are you sure you want to logout from the admin dashboard?</p>
              <div style={{
                ...styles.modalButtons,
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "10px" : "12px"
              }}>
                <button style={styles.modalCancel} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                <button style={styles.modalConfirm} onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, -20px) rotate(5deg); }
          50% { transform: translate(-10px, 15px) rotate(-3deg); }
          75% { transform: translate(20px, 10px) rotate(2deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        /* Responsive touch improvements */
        @media (max-width: 768px) {
          button {
            -webkit-tap-highlight-color: transparent;
          }
          .stat-card {
            padding: 14px 18px !important;
          }
        }
        
        /* Desktop hover effects */
        @media (min-width: 1024px) {
          .card:hover .card-arrow-icon {
            transform: translateX(5px);
          }
        }
        
        /* Smooth scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }
      `}} />
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
    position: "relative",
  },
  overlay: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 100%)",
    backdropFilter: "blur(3px)",
    position: "relative",
  },
  orb1: {
    position: "absolute",
    top: "-150px",
    right: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 25s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    bottom: "-100px",
    left: "-150px",
    width: "350px",
    height: "350px",
    background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 20s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "pulse 15s ease-in-out infinite",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "20px",
    position: "relative",
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(10px)",
    padding: "5px 14px",
    borderRadius: "40px",
    marginBottom: "16px",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  greetingIcon: {
    fontSize: "14px",
  },
  greeting: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#f3f4f6",
  },
  title: {
    fontWeight: "800",
    marginBottom: "12px",
    color: "#ffffff",
  },
  titleHighlight: {
    background: "linear-gradient(135deg, #10b981, #34d399)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  userInfo: {
    display: "flex",
    flexWrap: "wrap",
  },
  user: {
    color: "#d1d5db",
    fontSize: "14px",
    margin: 0,
    strong: { color: "white", fontWeight: "600" },
  },
  dateChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.08)",
    padding: "4px 12px",
    borderRadius: "30px",
    fontSize: "11px",
    color: "#9ca3af",
  },
  logoutBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    padding: "10px 22px",
    borderRadius: "40px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(239,68,68,0.3)",
    "@media (hover: hover)": {
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(239,68,68,0.4)",
      },
    },
  },
  statsGrid: {
    display: "grid",
    position: "relative",
    zIndex: 2,
  },
  statCard: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    padding: "18px 22px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "all 0.3s ease",
    position: "relative",
    "@media (hover: hover)": {
      "&:hover": {
        transform: "translateY(-3px)",
        background: "rgba(255,255,255,0.12)",
        borderColor: "rgba(255,255,255,0.2)",
      },
    },
  },
  statIconWrapper: {
    width: "50px",
    height: "50px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statIcon: {
    fontSize: "28px",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontWeight: "700",
    color: "white",
    lineHeight: 1,
    marginBottom: "6px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#d1d5db",
  },
  statBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(16,185,129,0.2)",
    color: "#34d399",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "9px",
    fontWeight: "600",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  sectionLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
  },
  sectionText: {
    textAlign: "center",
  },
  sectionTitle: {
    fontWeight: "700",
    color: "white",
    marginBottom: "6px",
  },
  sectionSubtitle: {
    fontSize: "13px",
    color: "#a1a1aa",
  },
  grid: {
    display: "grid",
    position: "relative",
    zIndex: 2,
  },
  card: {
    position: "relative",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    "@media (hover: hover)": {
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      },
    },
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
  },
  cardInner: {
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },
  cardIcon: {
    margin: "0 auto 18px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  cardIconEmoji: {},
  cardTitle: {
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  cardCount: {
    marginBottom: "16px",
  },
  countBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
  },
  cardFooter: {
    borderTop: "1px solid #f0f0f0",
    paddingTop: "15px",
  },
  cardArrow: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#10b981",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
  },
  cardArrowIcon: {
    fontSize: "14px",
    transition: "transform 0.3s ease",
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    pointerEvents: "none",
    transition: "opacity 0.3s ease",
  },
  footer: {
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    position: "relative",
    zIndex: 2,
    p: {
      fontSize: "11px",
      color: "#6b7280",
      margin: 0,
    },
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "24px",
    textAlign: "center",
    animation: "modalFadeIn 0.3s ease",
  },
  modalIcon: {
    fontSize: "52px",
    marginBottom: "16px",
  },
  modalTitle: {
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "10px",
  },
  modalText: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  modalButtons: {
    display: "flex",
  },
  modalCancel: {
    flex: 1,
    padding: "12px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    "@media (hover: hover)": {
      "&:hover": {
        background: "#e5e7eb",
      },
    },
  },
  modalConfirm: {
    flex: 1,
    padding: "12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
    "@media (hover: hover)": {
      "&:hover": {
        background: "#dc2626",
        transform: "scale(1.02)",
      },
    },
  },
};

export default AdminDashboard;