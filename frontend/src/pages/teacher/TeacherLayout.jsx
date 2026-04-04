import { Outlet, Navigate } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import { useState, useEffect } from "react";

function TeacherLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [teacher, setTeacher] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    handleResize(); // Call initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Safe localStorage parsing with cleanup
  useEffect(() => {
    const raw = localStorage.getItem("teacher");
    let parsedTeacher = null;
    
    if (raw) {
      try {
        parsedTeacher = JSON.parse(raw);
      } catch (error) {
        console.error("Error parsing teacher data:", error);
        localStorage.removeItem("teacher");
      }
    }
    
    if (parsedTeacher && (parsedTeacher.teacher_id || parsedTeacher.id)) {
      if (!parsedTeacher.teacher_id && parsedTeacher.id) {
        parsedTeacher.teacher_id = parsedTeacher.id;
      }
      setTeacher(parsedTeacher);
    } else {
      setTeacher(null);
      if (localStorage.getItem("teacher")) {
        localStorage.removeItem("teacher");
      }
    }
    setIsChecking(false);
    
    // Style injection with cleanup
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      /* Mobile Styles (<=768px) */
      @media (max-width: 768px) {
        .teacher-layout-content {
          margin-left: 0 !important;
        }
        .teacher-topbar {
          padding: 12px 16px !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
        }
        .teacher-page {
          padding: 16px !important;
        }
        .teacher-topbar-header {
          flex-direction: row !important;
          align-items: center !important;
          gap: 10px !important;
        }
        .teacher-topbar-icon {
          font-size: 24px !important;
        }
        .teacher-topbar-title {
          font-size: 16px !important;
          margin-bottom: 2px !important;
        }
        .teacher-topbar-greeting {
          font-size: 11px !important;
        }
        .teacher-date-chip {
          padding: 6px 12px !important;
          font-size: 11px !important;
          align-self: flex-start !important;
        }
        .teacher-stats-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
        }
      }
      
      /* Tablet Styles (769px - 1024px) */
      @media (min-width: 769px) and (max-width: 1024px) {
        .teacher-topbar {
          padding: 14px 20px !important;
        }
        .teacher-page {
          padding: 20px !important;
        }
        .teacher-topbar-title {
          font-size: 15px !important;
        }
        .teacher-date-chip {
          font-size: 11px !important;
        }
        .teacher-stats-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
      
      /* Desktop Styles (>=1025px) */
      @media (min-width: 1025px) {
        .teacher-layout-content {
          margin-left: 260px !important;
        }
        .teacher-topbar {
          padding: 16px 28px !important;
        }
        .teacher-page {
          padding: 28px !important;
        }
      }
      
      /* Small Mobile (<=480px) */
      @media (max-width: 480px) {
        .teacher-topbar {
          padding: 10px 14px !important;
        }
        .teacher-page {
          padding: 12px !important;
        }
        .teacher-date-chip {
          font-size: 10px !important;
          padding: 4px 10px !important;
        }
        .teacher-topbar-title {
          font-size: 14px !important;
        }
        .teacher-topbar-greeting {
          font-size: 10px !important;
        }
        .teacher-topbar-icon {
          font-size: 20px !important;
        }
        .teacher-stats-grid {
          gap: 10px !important;
        }
      }
      
      /* Smooth transitions */
      .teacher-layout-content {
        transition: margin-left 0.3s ease !important;
      }
      .teacher-topbar, .teacher-page {
        transition: all 0.3s ease !important;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (isChecking) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!teacher || !teacher.teacher_id) {
    return <Navigate to="/teacher-login" replace />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
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

  const getShortDate = () => {
    const date = new Date();
    if (isMobile) {
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
    }
    return getCurrentDate();
  };

  return (
    <div style={styles.container}>
      <TeacherSidebar 
        isMobile={isMobile}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div 
        className="teacher-layout-content"
        style={{
          ...styles.content,
          marginLeft: (!isMobile && !sidebarCollapsed) ? "260px" : (isMobile ? "0" : "80px"),
        }}
      >
        <div className="teacher-topbar" style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <div className="teacher-topbar-header" style={styles.topbarHeader}>
              <span className="teacher-topbar-icon" style={styles.topbarIcon}>👨‍🏫</span>
              <div>
                <h3 className="teacher-topbar-title" style={styles.topbarTitle}>
                  Teacher Dashboard
                </h3>
                <p className="teacher-topbar-greeting" style={styles.topbarGreeting}>
                  {getGreeting()}, {teacher.name || "Teacher"}!
                </p>
              </div>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div className="teacher-date-chip" style={styles.dateChip}>
              <span>📅</span>
              <span>{getShortDate()}</span>
            </div>
          </div>
        </div>
        
        <div className="teacher-page" style={styles.page}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: "flex", 
    minHeight: "100vh", 
    background: "#f5f7fb",
    position: "relative",
  },
  content: { 
    flex: 1, 
    minHeight: "100vh", 
    display: "flex", 
    flexDirection: "column",
    transition: "margin-left 0.3s ease",
    width: "100%",
  },
  topbar: { 
    background: "white", 
    borderBottom: "1px solid #e2e8f0", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    flexWrap: "wrap", 
    gap: "16px", 
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    position: "sticky",
    top: 0,
    zIndex: 99,
  },
  topbarLeft: { 
    flex: 1,
    minWidth: 0, // Prevents overflow
  },
  topbarHeader: { 
    display: "flex", 
    alignItems: "center", 
    gap: "12px",
  },
  topbarIcon: { 
    fontSize: "28px",
    lineHeight: 1,
  },
  topbarTitle: { 
    fontSize: "16px", 
    fontWeight: "600", 
    color: "#1e293b", 
    margin: 0, 
    marginBottom: "2px",
    lineHeight: 1.3,
  },
  topbarGreeting: { 
    fontSize: "12px", 
    color: "#64748b", 
    margin: 0,
    lineHeight: 1.4,
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
  },
  dateChip: { 
    background: "#f1f5f9", 
    padding: "6px 14px", 
    borderRadius: "20px", 
    fontSize: "12px", 
    color: "#475569", 
    display: "flex", 
    alignItems: "center", 
    gap: "6px",
    whiteSpace: "nowrap",
    fontWeight: "500",
  },
  page: { 
    padding: "24px", 
    flex: 1,
    width: "100%",
    overflowX: "hidden",
  },
  loadingContainer: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    minHeight: "100vh", 
    background: "#f5f7fb", 
    gap: "15px" 
  },
  spinner: { 
    width: "40px", 
    height: "40px", 
    border: "3px solid #e2e8f0", 
    borderTopColor: "#22c55e", 
    borderRadius: "50%", 
    animation: "spin 1s linear infinite" 
  },
};

export default TeacherLayout;