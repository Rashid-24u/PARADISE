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
      percentage: 0,
      grade: { grade: "N/A", color: "#6b7280", label: "No Data" }
    },
    notes: 0
  });
  const [loading, setLoading] = useState(true);

  // Grade calculation function
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "#10b981", label: "Excellent" };
    if (percentage >= 80) return { grade: "A", color: "#22c55e", label: "Very Good" };
    if (percentage >= 70) return { grade: "B+", color: "#f59e0b", label: "Good" };
    if (percentage >= 60) return { grade: "B", color: "#f97316", label: "Satisfactory" };
    if (percentage >= 50) return { grade: "C", color: "#ef4444", label: "Pass" };
    if (percentage >= 40) return { grade: "D", color: "#dc2626", label: "Needs Improvement" };
    return { grade: "F", color: "#991b1b", label: "Fail" };
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("student"));
    if (stored?.student_id) {
      setStudent(stored);
      fetchDashboardData(stored.student_id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (studentId) => {
    try {
      // Fetch student with course
      const studentRes = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}/`);
      const studentData = studentRes.data;
      
      // Fetch attendance (count periods, not days)
      const attendanceRes = await axios.get(`http://127.0.0.1:8000/api/attendance/?student=${studentId}`);
      const attendanceData = attendanceRes.data;
      const presentPeriods = attendanceData.filter(a => a.status === true).length;
      const totalPeriods = attendanceData.length;
      
      // Fetch marks
      const marksRes = await axios.get(`http://127.0.0.1:8000/api/marks/?student=${studentId}`);
      const marksData = marksRes.data;
      
      // ✅ CORRECT CALCULATION: percentage based on total marks / total max marks
      const totalObtained = marksData.reduce((sum, m) => sum + m.marks, 0);
      const totalMax = marksData.reduce((sum, m) => sum + (m.max_marks || 100), 0);
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const grade = getGrade(percentage);
      
      // Fetch notes - ONLY for student's course
      let notesCount = 0;
      if (studentData.course) {
        const notesRes = await axios.get(`http://127.0.0.1:8000/api/notes/?course=${studentData.course}`);
        notesCount = notesRes.data.length;
      }
      
      setStats({
        attendance: { 
          present: presentPeriods, 
          total: totalPeriods, 
          percentage: totalPeriods > 0 ? ((presentPeriods / totalPeriods) * 100).toFixed(1) : 0 
        },
        marks: { 
          totalObtained: totalObtained,
          totalMax: totalMax,
          percentage: percentage.toFixed(1),
          grade: grade
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
    { icon: "📅", title: "Attendance", color: "#3b82f6", bg: "#eff6ff", path: "/student/attendance", desc: "View your attendance records" },
    { icon: "📊", title: "Marks", color: "#f59e0b", bg: "#fffbeb", path: "/student/marks", desc: "Check your exam results" },
    { icon: "📄", title: "Notes", color: "#10b981", bg: "#ecfdf5", path: "/student/notes", desc: "Download study materials" },
    { icon: "👤", title: "Profile", color: "#8b5cf6", bg: "#f5f3ff", path: "/student/profile", desc: "View your profile details" }
  ];

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
          <div>
            <h1 style={styles.welcomeTitle}>Welcome back, {student.name}! 👋</h1>
            <p style={styles.welcomeSubtitle}>Here's your academic overview for today</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {/* Attendance Card */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statValue}>{stats.attendance.percentage}%</h3>
            <p style={styles.statLabel}>Attendance</p>
            <span style={styles.statDetail}>{stats.attendance.present} / {stats.attendance.total} periods</span>
          </div>
        </div>
        
        {/* Marks Card - Now shows PERCENTAGE with GRADE */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statValue}>
              {stats.marks.percentage}%
            </h3>
            <p style={styles.statLabel}>
              Academic Performance
              <span style={{...styles.gradeBadge, background: stats.marks.grade.color, marginLeft: "8px"}}>
                {stats.marks.grade.grade}
              </span>
            </p>
            <span style={styles.statDetail}>
              {stats.marks.totalObtained} / {stats.marks.totalMax} marks
            </span>
          </div>
        </div>
        
        {/* Notes Card */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📄</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statValue}>{stats.notes}</h3>
            <p style={styles.statLabel}>Notes Available</p>
            <span style={styles.statDetail}>Study materials</span>
          </div>
        </div>
        
        {/* Course Card */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎓</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statValue}>{student.course_name || "N/A"}</h3>
            <p style={styles.statLabel}>Course</p>
            <span style={styles.statDetail}>Admission: {student.admission_no}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={styles.sectionTitle}>Quick Actions</h2>
      <div style={styles.actionsGrid}>
        {quickActions.map((action, idx) => (
          <div 
            key={idx} 
            style={{...styles.actionCard, backgroundColor: action.bg, borderBottom: `3px solid ${action.color}`}}
            onClick={() => navigate(action.path)}
          >
            <span style={{...styles.actionIcon, color: action.color}}>{action.icon}</span>
            <h3 style={styles.actionTitle}>{action.title}</h3>
            <p style={styles.actionDesc}>{action.desc}</p>
          </div>
        ))}
      </div>

      {/* Tips Card */}
      <div style={styles.tipCard}>
        <div style={styles.tipIcon}>💡</div>
        <div style={styles.tipContent}>
          <h4>Did you know?</h4>
          <p>Regular attendance and consistent practice lead to better academic performance. Keep up the great work!</p>
          {stats.marks.percentage > 0 && (
            <div style={styles.performanceHint}>
              <span>🎯 Your performance: {stats.marks.grade.label}</span>
              {stats.marks.percentage >= 75 && <span>🌟 Keep it up!</span>}
              {stats.marks.percentage >= 50 && stats.marks.percentage < 75 && <span>📚 Aim higher!</span>}
              {stats.marks.percentage < 50 && <span>💪 Focus on improvement!</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
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
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "20px",
    margin: "40px",
  },
  errorIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  loginBtn: {
    marginTop: "20px",
    padding: "12px 30px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  welcomeBanner: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px",
    color: "white",
  },
  welcomeContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  welcomeTitle: {
    fontSize: "clamp(20px, 4vw, 28px)",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },
  welcomeSubtitle: {
    fontSize: "14px",
    opacity: 0.8,
    margin: 0,
  },
  dateBadge: {
    background: "rgba(255,255,255,0.15)",
    padding: "8px 16px",
    borderRadius: "40px",
    fontSize: "13px",
    backdropFilter: "blur(10px)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    },
  },
  statIcon: {
    fontSize: "40px",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    borderRadius: "16px",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "0",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 0 0",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  gradeBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    color: "white",
  },
  statDetail: {
    fontSize: "11px",
    color: "#94a3b8",
    display: "block",
    marginTop: "4px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 20px 0",
    color: "#0f172a",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  actionCard: {
    padding: "24px",
    borderRadius: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
    },
  },
  actionIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "12px",
  },
  actionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 8px 0",
    color: "#0f172a",
  },
  actionDesc: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  tipCard: {
    background: "linear-gradient(135deg, #fef9e3 0%, #fff7ed 100%)",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    border: "1px solid #fed7aa",
  },
  tipIcon: {
    fontSize: "32px",
  },
  tipContent: {
    flex: 1,
    h4: {
      fontSize: "16px",
      fontWeight: "600",
      margin: "0 0 4px 0",
      color: "#92400e",
    },
    p: {
      fontSize: "13px",
      color: "#b45309",
      margin: "0 0 8px 0",
      lineHeight: 1.5,
    },
  },
  performanceHint: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#b45309",
    background: "rgba(255,255,255,0.7)",
    padding: "8px 12px",
    borderRadius: "12px",
    span: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
    },
  },
};

// Add animation style
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default StudentHome;