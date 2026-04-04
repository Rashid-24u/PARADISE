import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StudentHome() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    attendance: { present: 0, total: 0, percentage: 0 },
    marks: { 
      totalObtained: 0, 
      totalMax: 0, 
      percentage: null,
      hasData: false,
      grade: { grade: "N/A", color: "#6b7280", label: "No Data" },
      examCount: 0
    },
    notes: 0
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Grade calculation function
  const getGrade = (percentage) => {
    if (percentage === null || percentage === undefined) return { grade: "N/A", color: "#6b7280", label: "No Data" };
    const num = parseFloat(percentage);
    if (num >= 90) return { grade: "A+", color: "#10b981", label: "Excellent" };
    if (num >= 80) return { grade: "A", color: "#22c55e", label: "Very Good" };
    if (num >= 70) return { grade: "B+", color: "#f59e0b", label: "Good" };
    if (num >= 60) return { grade: "B", color: "#f97316", label: "Satisfactory" };
    if (num >= 50) return { grade: "C+", color: "#ef4444", label: "Pass" };
    if (num >= 40) return { grade: "C", color: "#dc2626", label: "Needs Improvement" };
    return { grade: "D", color: "#991b1b", label: "Poor" };
  };

  // Get greeting based on time of day
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Safe localStorage parsing
  useEffect(() => {
    setGreeting(getGreetingMessage());
    
    const storedRaw = localStorage.getItem("student");
    let stored = null;
    
    try {
      stored = storedRaw ? JSON.parse(storedRaw) : null;
    } catch (error) {
      console.error("Error parsing student data:", error);
      stored = null;
    }
    
    if (stored?.student_id) {
      setStudent(stored);
      fetchDashboardData(stored.student_id);
    } else {
      setLoading(false);
    }
  }, []);

  // Safe API calls with error handling
  const fetchDashboardData = async (studentId) => {
    try {
      const studentRes = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}/`);
      const studentData = studentRes.data;
      
      const attendanceRes = await axios.get(`http://127.0.0.1:8000/api/attendance/?student=${studentId}`);
      const attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      
      // Changed from periods to days
      const presentDays = attendanceData.filter(a => a.status === true).length;
      const totalDays = attendanceData.length;
      const attendancePercentage = totalDays > 0 ? Number(((presentDays / totalDays) * 100).toFixed(1)) : 0;
      
      const marksRes = await axios.get(`http://127.0.0.1:8000/api/marks/?student=${studentId}`);
      const marksData = Array.isArray(marksRes.data) ? marksRes.data : [];
      
      const hasMarksData = marksData.length > 0;
      let totalObtained = 0;
      let totalMax = 0;
      let percentage = null;
      let grade = { grade: "N/A", color: "#6b7280", label: "No Data" };
      let examCount = 0;
      
      if (hasMarksData) {
        totalObtained = marksData.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
        totalMax = marksData.reduce((sum, m) => sum + (Number(m.max_marks) || 100), 0);
        examCount = marksData.length;

        const percentSum = marksData.reduce((sum, m) => {
          const got = Number(m.marks) || 0;
          const mx = Number(m.max_marks) || 100;
          const p = mx > 0 ? (got / mx) * 100 : 0;
          return sum + p;
        }, 0);

        const overallPercentage = marksData.length > 0 ? Number((percentSum / marksData.length).toFixed(1)) : 0;
        percentage = overallPercentage;
        grade = getGrade(overallPercentage);
      }
      
      let notesCount = 0;
      if (studentData.course) {
        const notesRes = await axios.get(`http://127.0.0.1:8000/api/notes/?course=${studentData.course}`);
        notesCount = Array.isArray(notesRes.data) ? notesRes.data.length : 0;
      }
      
      setStats({
        attendance: { 
          present: presentDays, 
          total: totalDays, 
          percentage: attendancePercentage
        },
        marks: { 
          totalObtained: totalObtained,
          totalMax: totalMax,
          percentage: percentage,
          hasData: hasMarksData,
          grade: grade,
          examCount: examCount
        },
        notes: notesCount
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: "📅", title: "Attendance", color: "#3b82f6", bg: "#eff6ff", path: "/student/attendance", desc: "View attendance records" },
    { icon: "📊", title: "Marks", color: "#f59e0b", bg: "#fffbeb", path: "/student/marks", desc: "Check exam results" },
    { icon: "📄", title: "Notes", color: "#10b981", bg: "#ecfdf5", path: "/student/notes", desc: "Download study materials" },
    { icon: "👤", title: "Profile", color: "#8b5cf6", bg: "#f5f3ff", path: "/student/profile", desc: "View profile details" }
  ];

  // Dynamic styles based on mobile state
  const styles = {
    container: {
      padding: isMobile ? "16px" : "24px",
      maxWidth: "1400px",
      margin: "0 auto",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: "15px",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "3px solid #e2e8f0",
      borderTopColor: "#1a472a",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    errorContainer: {
      textAlign: "center",
      padding: "60px 20px",
      background: "white",
      borderRadius: "20px",
      margin: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    errorIcon: {
      fontSize: "60px",
      marginBottom: "16px",
    },
    loginBtn: {
      marginTop: "16px",
      padding: "10px 24px",
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
      color: "white",
      border: "none",
      borderRadius: "30px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
    },
    welcomeBanner: {
      background: "linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%)",
      borderRadius: "24px",
      padding: isMobile ? "20px" : "28px",
      marginBottom: "24px",
      color: "white",
      boxShadow: "0 8px 20px rgba(26,71,42,0.2)",
    },
    welcomeContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
    },
    welcomeText: {
      flex: 1,
    },
    greetingBadge: {
      display: "inline-block",
      background: "rgba(255,255,255,0.2)",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "500",
      marginBottom: "8px",
    },
    welcomeTitle: {
      fontSize: isMobile ? "20px" : "28px",
      margin: "0 0 6px 0",
      fontWeight: "700",
      letterSpacing: "-0.3px",
    },
    welcomeSubtitle: {
      fontSize: "13px",
      opacity: 0.85,
      margin: 0,
    },
    dateBadge: {
      background: "rgba(255,255,255,0.15)",
      padding: isMobile ? "6px 12px" : "8px 16px",
      borderRadius: "40px",
      fontSize: "12px",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      whiteSpace: "nowrap",
    },
    dateIcon: {
      fontSize: "14px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: isMobile ? "12px" : "16px",
      marginBottom: "28px",
    },
    statCard: {
      background: "white",
      borderRadius: "20px",
      padding: isMobile ? "14px" : "18px",
      display: "flex",
      gap: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      border: "1px solid #e2e8f0",
      transition: "all 0.3s ease",
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      },
    },
    statIconWrapper: {
      width: isMobile ? "48px" : "56px",
      height: isMobile ? "48px" : "56px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statIcon: {
      fontSize: isMobile ? "24px" : "28px",
    },
    statInfo: {
      flex: 1,
      minWidth: 0,
    },
    statHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: "8px",
      gap: "8px",
      flexWrap: "wrap",
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    statPercentage: {
      fontSize: isMobile ? "18px" : "22px",
      fontWeight: "700",
      color: "#0f172a",
    },
    statCourseName: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#8b5cf6",
      background: "#f5f3ff",
      padding: "3px 8px",
      borderRadius: "12px",
    },
    statProgress: {
      width: "100%",
      height: "6px",
      background: "#e2e8f0",
      borderRadius: "3px",
      margin: "8px 0",
      overflow: "hidden",
    },
    statProgressFill: {
      height: "100%",
      borderRadius: "3px",
      transition: "width 0.5s ease",
    },
    statNotesIcon: {
      fontSize: "24px",
      textAlign: "center",
      margin: "6px 0",
    },
    statFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "8px",
      gap: "8px",
      flexWrap: "wrap",
    },
    statDetail: {
      fontSize: "11px",
      color: "#94a3b8",
      fontWeight: "500",
    },
    statDetailLine: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "11px",
      color: "#475569",
      marginTop: "6px",
    },
    statCourseDetails: {
      marginTop: "6px",
    },
    gradeBadge: {
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: "12px",
      fontSize: "10px",
      fontWeight: "600",
      color: "white",
    },
    sectionHeader: {
      marginBottom: "16px",
    },
    sectionTitle: {
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: "700",
      margin: "0 0 4px 0",
      color: "#0f172a",
    },
    sectionSubtitle: {
      fontSize: "12px",
      color: "#64748b",
      margin: 0,
    },
    actionsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: isMobile ? "12px" : "16px",
      marginBottom: "28px",
    },
    actionCard: {
      background: "white",
      padding: isMobile ? "16px 12px" : "20px 16px",
      borderRadius: "20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "1px solid #e2e8f0",
      position: "relative",
      overflow: "hidden",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
      },
    },
    actionIconWrapper: {
      width: isMobile ? "50px" : "60px",
      height: isMobile ? "50px" : "60px",
      borderRadius: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 12px",
    },
    actionIcon: {
      fontSize: isMobile ? "26px" : "30px",
    },
    actionTitle: {
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "700",
      margin: "0 0 6px 0",
      color: "#0f172a",
    },
    actionDesc: {
      fontSize: "11px",
      color: "#64748b",
      margin: 0,
    },
    actionArrow: {
      position: "absolute",
      bottom: "12px",
      right: "16px",
      fontSize: "16px",
      color: "#cbd5e1",
      transition: "transform 0.2s ease",
      "&:hover": {
        transform: "translateX(4px)",
      },
    },
    tipCard: {
      background: "linear-gradient(135deg, #fef9e3 0%, #fff7ed 100%)",
      borderRadius: "20px",
      padding: isMobile ? "16px" : "20px",
      display: "flex",
      gap: "14px",
      alignItems: "flex-start",
      border: "1px solid #fed7aa",
    },
    tipIcon: {
      fontSize: isMobile ? "32px" : "36px",
    },
    tipContent: {
      flex: 1,
      h4: {
        fontSize: "14px",
        fontWeight: "700",
        margin: "0 0 6px 0",
        color: "#92400e",
      },
      p: {
        fontSize: "12px",
        color: "#b45309",
        margin: "0 0 10px 0",
        lineHeight: "1.5",
      },
    },
    performanceHint: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "10px",
      fontSize: "11px",
      color: "#b45309",
      background: "rgba(255,255,255,0.8)",
      padding: "8px 12px",
      borderRadius: "14px",
    },
    positiveBadge: {
      background: "#10b98115",
      color: "#10b981",
      padding: "3px 10px",
      borderRadius: "14px",
      fontSize: "10px",
      fontWeight: "600",
    },
    neutralBadge: {
      background: "#f59e0b15",
      color: "#f59e0b",
      padding: "3px 10px",
      borderRadius: "14px",
      fontSize: "10px",
      fontWeight: "600",
    },
    warningBadge: {
      background: "#ef444415",
      color: "#ef4444",
      padding: "3px 10px",
      borderRadius: "14px",
      fontSize: "10px",
      fontWeight: "600",
    },
    dangerBadge: {
      background: "#dc262615",
      color: "#dc2626",
      padding: "3px 10px",
      borderRadius: "14px",
      fontSize: "10px",
      fontWeight: "600",
    },
    attendanceWarning: {
      marginTop: "10px",
      background: "#ef444415",
      padding: "6px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      color: "#ef4444",
      textAlign: "center",
      fontWeight: "500",
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2>Not Logged In</h2>
        <p>Please login to access your dashboard</p>
        <button style={styles.loginBtn} onClick={() => navigate("/student-login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeContent}>
          <div style={styles.welcomeText}>
            <div style={styles.greetingBadge}>{greeting}</div>
            <h1 style={styles.welcomeTitle}>Welcome back, {student.name?.split(' ')[0] || 'Student'}! 👋</h1>
            <p style={styles.welcomeSubtitle}>Here's your academic overview</p>
          </div>
          <div style={styles.dateBadge}>
            <span style={styles.dateIcon}>📅</span>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>

      {/* Stats Cards - Shows Days instead of Periods */}
      <div style={styles.statsGrid}>
        {/* Attendance Card */}
        <div style={styles.statCard} onClick={() => navigate("/student/attendance")}>
          <div style={{...styles.statIconWrapper, background: "#eff6ff"}}>
            <span style={{...styles.statIcon, color: "#3b82f6"}}>📅</span>
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Attendance</span>
              <span style={styles.statPercentage}>{stats.attendance.percentage}%</span>
            </div>
            <div style={styles.statProgress}>
              <div style={{...styles.statProgressFill, width: `${stats.attendance.percentage}%`, background: "#3b82f6"}}></div>
            </div>
            <div style={styles.statFooter}>
              <span style={styles.statDetail}>
                📆 {stats.attendance.present} / {stats.attendance.total} days
              </span>
            </div>
          </div>
        </div>
        
        {/* Marks Card */}
        <div style={styles.statCard} onClick={() => navigate("/student/marks")}>
          <div style={{...styles.statIconWrapper, background: "#fffbeb"}}>
            <span style={{...styles.statIcon, color: "#f59e0b"}}>📊</span>
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Performance</span>
              <span style={styles.statPercentage}>
                {stats.marks.hasData ? `${stats.marks.percentage}%` : "N/A"}
              </span>
            </div>
            <div style={styles.statProgress}>
              <div style={{...styles.statProgressFill, width: `${stats.marks.hasData ? stats.marks.percentage : 0}%`, background: stats.marks.hasData ? stats.marks.grade.color : "#e2e8f0"}}></div>
            </div>
            <div style={styles.statFooter}>
              <span style={styles.statDetail}>
                {stats.marks.hasData 
                  ? `📝 ${stats.marks.totalObtained} / ${stats.marks.totalMax}`
                  : "📭 No marks"}
              </span>
              {stats.marks.hasData && stats.marks.grade.grade !== "N/A" && (
                <span style={{...styles.gradeBadge, background: stats.marks.grade.color}}>
                  {stats.marks.grade.grade}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Notes Card */}
        <div style={styles.statCard} onClick={() => navigate("/student/notes")}>
          <div style={{...styles.statIconWrapper, background: "#ecfdf5"}}>
            <span style={{...styles.statIcon, color: "#10b981"}}>📄</span>
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Notes</span>
              <span style={styles.statPercentage}>{stats.notes}</span>
            </div>
            <div style={styles.statNotesIcon}>
              {stats.notes > 0 ? "📚" : "📭"}
            </div>
            <div style={styles.statFooter}>
              <span style={styles.statDetail}>
                {stats.notes === 0 ? "No notes" : `${stats.notes} available`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Course Card */}
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: "#f5f3ff"}}>
            <span style={{...styles.statIcon, color: "#8b5cf6"}}>🎓</span>
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Course</span>
              <span style={styles.statCourseName}>{student.course_name?.split(' ')[0] || "N/A"}</span>
            </div>
            <div style={styles.statCourseDetails}>
              <div style={styles.statDetailLine}>
                <span>🆔</span>
                <span>{student.admission_no}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <p style={styles.sectionSubtitle}>Tap to navigate</p>
      </div>
      <div style={styles.actionsGrid}>
        {quickActions.map((action, idx) => (
          <div 
            key={idx} 
            style={styles.actionCard}
            onClick={() => navigate(action.path)}
          >
            <div style={{...styles.actionIconWrapper, background: action.bg}}>
              <span style={{...styles.actionIcon, color: action.color}}>{action.icon}</span>
            </div>
            <h3 style={styles.actionTitle}>{action.title}</h3>
            <p style={styles.actionDesc}>{action.desc}</p>
            <span style={styles.actionArrow}>→</span>
          </div>
        ))}
      </div>

      {/* Tips & Motivation Card */}
      <div style={styles.tipCard}>
        <div style={styles.tipIcon}>💡</div>
        <div style={styles.tipContent}>
          <h4>Did you know?</h4>
          <p>Regular attendance leads to better performance. Keep it up!</p>
          {stats.marks.hasData && stats.marks.percentage > 0 && (
            <div style={styles.performanceHint}>
              <span>🎯 {stats.marks.grade.label}</span>
              {stats.marks.percentage >= 75 && <span style={styles.positiveBadge}>🌟 Excellent!</span>}
              {stats.marks.percentage >= 50 && stats.marks.percentage < 75 && <span style={styles.neutralBadge}>📚 Good!</span>}
              {stats.marks.percentage < 50 && stats.marks.percentage >= 40 && <span style={styles.warningBadge}>💪 Improve!</span>}
              {stats.marks.percentage < 40 && <span style={styles.dangerBadge}>⚠️ Work harder!</span>}
            </div>
          )}
          {!stats.marks.hasData && (
            <div style={styles.performanceHint}>
              <span>📝 No results yet</span>
            </div>
          )}
          {stats.attendance.percentage < 75 && stats.attendance.total > 0 && (
            <div style={styles.attendanceWarning}>
              <span>⚠️ Attendance: {stats.attendance.percentage}% - Need improvement!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add keyframes for spinner animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .stat-card, .action-card, .tip-card {
      animation: slideIn 0.3s ease forwards;
    }
    
    .stat-card:nth-child(1) { animation-delay: 0.05s; }
    .stat-card:nth-child(2) { animation-delay: 0.1s; }
    .stat-card:nth-child(3) { animation-delay: 0.15s; }
    .stat-card:nth-child(4) { animation-delay: 0.2s; }
    
    @media (max-width: 480px) {
      .stat-card:nth-child(3), .stat-card:nth-child(4) {
        animation-delay: 0.05s;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default StudentHome;