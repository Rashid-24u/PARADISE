import { Outlet, Navigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import { useState, useEffect } from "react";

function StudentLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [student, setStudent] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // FIX: Safe localStorage parsing with error handling
    const storedRaw = localStorage.getItem("student");
    let parsedStudent = null;
    
    if (storedRaw) {
      try {
        parsedStudent = JSON.parse(storedRaw);
      } catch (error) {
        console.error("Error parsing student data:", error);
        localStorage.removeItem("student");
      }
    }
    
    if (parsedStudent && parsedStudent.student_id) {
      setStudent(parsedStudent);
    } else {
      setStudent(null);
      // Clean up invalid data
      if (localStorage.getItem("student")) {
        localStorage.removeItem("student");
      }
    }
    setIsChecking(false);
  }, []);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // 🔐 PROTECT DASHBOARD
  if (!student || !student.student_id) {
    return <Navigate to="/student-login" replace />;
  }

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
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div style={styles.container}>
      <StudentSidebar />
      
      <div style={styles.content}>
        <div style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <div style={styles.topbarHeader}>
              <span style={styles.topbarIcon}>🎓</span>
              <div>
                <h3 style={styles.topbarTitle}>Student Dashboard</h3>
                <p style={styles.topbarGreeting}>{getGreeting()}, {student.name || "Student"}!</p>
              </div>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.dateChip}>
              <span>📅</span>
              <span>{getCurrentDate()}</span>
            </div>
            <div style={styles.studentBadge}>
              <span>🎓</span>
              <span>{student.admission_no || "Student"}</span>
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
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f7fb",
  },
  content: {
    flex: 1,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    background: "white",
    padding: "14px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  topbarLeft: {
    flex: 1,
  },
  topbarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  topbarIcon: {
    fontSize: "28px",
  },
  topbarTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
    marginBottom: "2px",
  },
  topbarGreeting: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
  },
  studentBadge: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(59,130,246,0.2)",
  },
  page: {
    padding: "24px",
    flex: 1,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f5f7fb",
    gap: "15px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// FIX: Style injection with cleanup
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .student-topbar {
        padding: 12px 16px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      .student-page {
        padding: 16px !important;
      }
      .student-topbar-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 8px !important;
      }
      .student-topbar-icon {
        display: none !important;
      }
      .student-topbar-right {
        width: 100% !important;
        justify-content: space-between !important;
      }
      .student-date-chip {
        font-size: 11px !important;
        padding: 5px 12px !important;
      }
      .student-badge {
        font-size: 11px !important;
        padding: 5px 12px !important;
      }
    }
    
    @media (max-width: 480px) {
      .student-topbar {
        padding: 10px 14px !important;
      }
      .student-page {
        padding: 12px !important;
      }
      .student-date-chip {
        font-size: 10px !important;
        padding: 4px 10px !important;
      }
      .student-badge {
        font-size: 10px !important;
        padding: 4px 10px !important;
      }
      .student-topbar-title {
        font-size: 14px !important;
      }
      .student-topbar-greeting {
        font-size: 11px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default StudentLayout;