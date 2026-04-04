import { Outlet, Navigate } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import { useState, useEffect } from "react";

function TeacherLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [teacher, setTeacher] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FIX: Safe localStorage parsing with cleanup
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
    
    // FIX: Style injection with cleanup
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (max-width: 768px) {
        .teacher-topbar { padding: 12px 16px !important; flex-direction: column !important; align-items: flex-start !important; }
        .teacher-page { padding: 16px !important; }
        .teacher-topbar-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
        .teacher-topbar-icon { display: none !important; }
      }
      @media (max-width: 480px) {
        .teacher-topbar { padding: 10px 14px !important; }
        .teacher-page { padding: 12px !important; }
        .teacher-date-chip { font-size: 10px !important; padding: 4px 10px !important; }
        .teacher-topbar-title { font-size: 14px !important; }
        .teacher-topbar-greeting { font-size: 11px !important; }
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
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div style={styles.container}>
      <TeacherSidebar />
      
      <div style={styles.content}>
        <div style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <div style={styles.topbarHeader}>
              <span style={styles.topbarIcon}>👨‍🏫</span>
              <div>
                <h3 style={styles.topbarTitle}>Teacher Dashboard</h3>
                <p style={styles.topbarGreeting}>{getGreeting()}, {teacher.name || "Teacher"}!</p>
              </div>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.dateChip}>
              <span>📅</span>
              <span>{getCurrentDate()}</span>
            </div>
          </div>
        </div>
        
        <div style={styles.page}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#f5f7fb" },
  content: { flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" },
  topbar: { background: "white", padding: "14px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
  topbarLeft: { flex: 1 },
  topbarHeader: { display: "flex", alignItems: "center", gap: "12px" },
  topbarIcon: { fontSize: "28px" },
  topbarTitle: { fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0, marginBottom: "2px" },
  topbarGreeting: { fontSize: "12px", color: "#64748b", margin: 0 },
  dateChip: { background: "#f1f5f9", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" },
  page: { padding: "24px", flex: 1 },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f5f7fb", gap: "15px" },
  spinner: { width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 1s linear infinite" },
};

export default TeacherLayout;