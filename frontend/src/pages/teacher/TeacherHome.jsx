import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api/";

function TeacherHome() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [stats, setStats] = useState({
    studentCount: 0,
    courseName: "",
    subjectName: "",
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [assignedCourse, setAssignedCourse] = useState(null);
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

  // Safe localStorage parsing
  useEffect(() => {
    const raw = localStorage.getItem("teacher");
    let stored = null;
    
    try {
      stored = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Error parsing teacher data:", error);
      stored = null;
      localStorage.removeItem("teacher");
    }
    
    if (stored?.teacher_id) {
      fetchTeacherData(stored.teacher_id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTeacherData = async (teacherId) => {
    try {
      const teacherRes = await axios.get(`${API}teachers/${teacherId}/`);
      const teacherData = teacherRes.data;
      setTeacher(teacherData);
      
      if (teacherData.course) {
        setAssignedCourse(teacherData.course);
      }
      
      let students = [];
      if (teacherData.course) {
        const studentsRes = await axios.get(`${API}students/?course=${teacherData.course}`);
        students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      } else {
        const studentsRes = await axios.get(`${API}students/`);
        students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      }
      
      setStats({
        studentCount: students.length,
        courseName: teacherData.course_name || "All Classes",
        subjectName: teacherData.subject || "Not Assigned",
        totalStudents: students.length,
      });
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: "👨‍🎓", title: "Students", color: "#3b82f6", bg: "#eff6ff", path: "/teacher/students", desc: "View student list" },
    { icon: "📅", title: "Attendance", color: "#22c55e", bg: "#ecfdf5", path: "/teacher/attendance", desc: "Mark daily attendance" },
    { icon: "📝", title: "Marks", color: "#f59e0b", bg: "#fffbeb", path: "/teacher/marks", desc: "Update student marks" },
    { icon: "📄", title: "Notes", color: "#8b5cf6", bg: "#f5f3ff", path: "/teacher/notes", desc: "Upload study materials" },
    { icon: "📊", title: "Reports", color: "#ef4444", bg: "#fef2f2", path: "/teacher/reports", desc: "View performance reports" },
    { icon: "💰", title: "Salary", color: "#10b981", bg: "#ecfdf5", path: "/teacher/salary", desc: "View salary details" },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Styles with responsive grid
  const styles = {
    container: { 
      padding: isMobile ? "16px" : "24px", 
      maxWidth: "1400px", 
      margin: "0 auto", 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#f8fafc",
      minHeight: "calc(100vh - 70px)"
    },
    loadingContainer: { 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "400px", 
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
    errorContainer: { 
      textAlign: "center", 
      padding: "60px 20px", 
      background: "white", 
      borderRadius: "20px", 
      margin: isMobile ? "20px" : "40px" 
    },
    errorIcon: { fontSize: "64px", marginBottom: "20px" },
    loginBtn: { 
      marginTop: "20px", 
      padding: "12px 30px", 
      background: "#22c55e", 
      color: "white", 
      border: "none", 
      borderRadius: "10px", 
      cursor: "pointer", 
      fontSize: "14px", 
      fontWeight: "600" 
    },
    welcomeBanner: { 
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", 
      borderRadius: "20px", 
      padding: isMobile ? "20px" : "28px", 
      marginBottom: "24px", 
      color: "white" 
    },
    welcomeContent: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      flexWrap: "wrap", 
      gap: "16px" 
    },
    greeting: { 
      fontSize: "13px", 
      opacity: 0.8, 
      margin: "0 0 4px 0" 
    },
    welcomeTitle: { 
      fontSize: isMobile ? "20px" : "26px", 
      margin: "0 0 6px 0", 
      fontWeight: "700" 
    },
    welcomeSubtitle: { 
      fontSize: "13px", 
      opacity: 0.8, 
      margin: 0 
    },
    dateBadge: { 
      background: "rgba(255,255,255,0.15)", 
      padding: "6px 14px", 
      borderRadius: "30px", 
      fontSize: "12px" 
    },
    statsGrid: { 
      display: "grid", 
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", 
      gap: isMobile ? "12px" : "18px", 
      marginBottom: "28px" 
    },
    statCard: { 
      background: "white", 
      borderRadius: "16px", 
      padding: isMobile ? "14px" : "18px", 
      display: "flex", 
      alignItems: "center", 
      gap: isMobile ? "10px" : "14px", 
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)", 
      border: "1px solid #e2e8f0", 
      transition: "all 0.2s",
      cursor: "pointer",
      "&:hover": { 
        transform: "translateY(-2px)", 
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)" 
      }
    },
    statIcon: { 
      fontSize: isMobile ? "28px" : "36px", 
      width: isMobile ? "45px" : "52px", 
      height: isMobile ? "45px" : "52px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "#f1f5f9", 
      borderRadius: "14px" 
    },
    statInfo: { flex: 1 },
    statValue: { 
      fontSize: isMobile ? "20px" : "24px", 
      fontWeight: "700", 
      margin: "0", 
      color: "#0f172a" 
    },
    statLabel: { 
      fontSize: "12px", 
      color: "#64748b", 
      margin: "4px 0 0 0" 
    },
    statDetail: { 
      fontSize: "10px", 
      color: "#94a3b8", 
      display: "block", 
      marginTop: "2px" 
    },
    sectionTitle: { 
      fontSize: isMobile ? "16px" : "18px", 
      fontWeight: "600", 
      margin: "0 0 18px 0", 
      color: "#0f172a" 
    },
    actionsGrid: { 
      display: "grid", 
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", 
      gap: isMobile ? "12px" : "18px", 
      marginBottom: "28px" 
    },
    actionCard: { 
      padding: isMobile ? "14px" : "18px", 
      borderRadius: "16px", 
      textAlign: "center", 
      cursor: "pointer", 
      transition: "all 0.2s", 
      border: "1px solid #e2e8f0",
      "&:hover": { 
        transform: "translateY(-4px)", 
        boxShadow: "0 12px 24px rgba(0,0,0,0.08)" 
      }
    },
    actionIcon: { 
      fontSize: isMobile ? "28px" : "36px", 
      display: "block", 
      marginBottom: "10px" 
    },
    actionTitle: { 
      fontSize: isMobile ? "13px" : "15px", 
      fontWeight: "600", 
      margin: "0 0 6px 0", 
      color: "#0f172a" 
    },
    actionDesc: { 
      fontSize: "11px", 
      color: "#64748b", 
      margin: 0 
    },
    tipCard: { 
      background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", 
      borderRadius: "16px", 
      padding: isMobile ? "16px" : "18px", 
      display: "flex", 
      gap: isMobile ? "12px" : "14px", 
      alignItems: "flex-start", 
      border: "1px solid #a7f3d0" 
    },
    tipIcon: { fontSize: isMobile ? "24px" : "28px" },
    tipContent: { 
      flex: 1, 
      h4: { 
        fontSize: "14px", 
        fontWeight: "600", 
        margin: "0 0 4px 0", 
        color: "#065f46" 
      }, 
      p: { 
        fontSize: "12px", 
        color: "#047857", 
        margin: "0 0 8px 0", 
        lineHeight: "1.5" 
      } 
    },
    tipHint: { 
      display: "flex", 
      gap: "14px", 
      flexWrap: "wrap", 
      marginTop: "6px",
      flexDirection: isMobile ? "column" : "row",
      span: { 
        fontSize: "10px", 
        color: "#10b981", 
        background: "white", 
        padding: "4px 10px", 
        borderRadius: "20px" 
      } 
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

  if (!teacher) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2>Not Logged In</h2>
        <p>Please login to access your dashboard</p>
        <button style={styles.loginBtn} onClick={() => navigate("/teacher-login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeContent}>
          <div>
            <p style={styles.greeting}>{getGreeting()}! 👋</p>
            <h1 style={styles.welcomeTitle}>Welcome back, {teacher.name}</h1>
            <p style={styles.welcomeSubtitle}>Here's your teaching overview for today</p>
          </div>
          <div style={styles.dateBadge}>
            📅 {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Grid - 3 columns on desktop, 2 on mobile */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👨‍🎓</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statValue}>{stats.studentCount}</h3>
            <p style={styles.statLabel}>Total Students</p>
            {/* ✅ CHANGED: "in your class" to "in your school" */}
            <span style={styles.statDetail}>In your school</span>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statValue}>{stats.subjectName}</h3>
            <p style={styles.statLabel}>Subject</p>
            <span style={styles.statDetail}>You teach</span>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏫</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statValue}>{stats.courseName}</h3>
            <p style={styles.statLabel}>Class</p>
            <span style={styles.statDetail}>Assigned to</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - 3 columns on desktop, 2 on mobile */}
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

      {/* Teaching Tip Card */}
      <div style={styles.tipCard}>
        <div style={styles.tipIcon}>💡</div>
        <div style={styles.tipContent}>
          <h4>Teaching Tip</h4>
          <p>Regular attendance tracking and timely feedback help students perform better. Keep up the great work!</p>
          <div style={styles.tipHint}>
            <span>📅 Mark attendance daily</span>
            <span>📝 Update marks regularly</span>
            <span>📄 Share study materials</span>
          </div>
        </div>
      </div>

      {/* Add animations */}
      <style jsx="true">{`
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
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .actions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default TeacherHome;