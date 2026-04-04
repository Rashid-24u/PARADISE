import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api/";

function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [filterCourse, setFilterCourse] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedCourse, setAssignedCourse] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const pageSize = 10;
  const [page, setPage] = useState(1);

  // Check screen size for responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchTeacherAndStudents();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterCourse]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}courses/`);
      setCourses(res.data);
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };

  const fetchTeacherAndStudents = async () => {
    const stored = JSON.parse(localStorage.getItem("teacher") || "{}");
    if (!stored.teacher_id) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API}teachers/${stored.teacher_id}/`);
      const t = res.data;
      setTeacher(t);
      
      if (t.course) {
        setAssignedCourse(t.course);
        setFilterCourse(String(t.course));
      }
      await fetchStudentsForScope(t, t.course ? String(t.course) : "");
    } catch (error) {
      toast.error("Failed to load teacher data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teacher) return;
    if (teacher.course) return;
    fetchStudentsForScope(teacher, filterCourse);
  }, [filterCourse, teacher]);

  const fetchStudentsForScope = async (t, courseId) => {
    try {
      let url = `${API}students/`;
      if (t.course) {
        url += `?course=${t.course}`;
      } else if (courseId) {
        url += `?course=${courseId}`;
      }

      const res = await axios.get(url);
      setStudents(res.data);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => String(c.id) === String(courseId));
    return course ? course.name : "Unknown";
  };

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const adm = (s.admission_no || "").toLowerCase();
      return name.includes(q) || adm.includes(q);
    });
  }, [students, search]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const renderPageNumbers = () => {
    const maxButtons = isMobile ? 3 : 5;
    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

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
    header: { marginBottom: isMobile ? "20px" : "28px", textAlign: "center" },
    title: {
      fontSize: isMobile ? "24px" : "32px",
      fontWeight: "700",
      margin: "0 0 8px 0",
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.3px",
    },
    subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },

    classInfoCard: {
      background: "white",
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      padding: isMobile ? "16px 20px" : "20px 24px",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },
    classInfoLeft: { display: "flex", alignItems: "center", gap: isMobile ? "12px" : "16px" },
    classIcon: { fontSize: isMobile ? "28px" : "36px" },
    classLabel: { fontSize: "12px", color: "#64748b", margin: 0, fontWeight: "500" },
    className: { fontSize: isMobile ? "16px" : "18px", fontWeight: "700", color: "#1e293b", margin: "4px 0 0 0" },
    studentCountBadge: {
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
      padding: isMobile ? "8px 16px" : "12px 24px",
      borderRadius: "40px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: isMobile ? "12px" : "14px",
      color: "white",
      fontWeight: "500",
    },
    countNumber: { fontSize: isMobile ? "22px" : "28px", fontWeight: "700" },
    assignedBadge: {
      background: "#ecfdf5",
      color: "#065f46",
      padding: "8px 16px",
      borderRadius: "30px",
      fontSize: "13px",
      fontWeight: "500",
    },

    filterBar: { 
      display: "flex", 
      gap: "16px", 
      marginBottom: "24px", 
      flexWrap: "wrap", 
      alignItems: "center",
      flexDirection: isMobile ? "column" : "row",
    },
    searchBox: {
      flex: 2,
      minWidth: isMobile ? "100%" : "300px",
      width: isMobile ? "100%" : "auto",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: "white",
      borderRadius: "48px",
      border: "1px solid #e2e8f0",
      padding: "0 20px",
      transition: "all 0.2s",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    searchIcon: { fontSize: "18px", color: "#94a3b8" },
    searchInput: {
      flex: 1,
      padding: isMobile ? "12px 0" : "14px 0",
      border: "none",
      outline: "none",
      fontSize: "14px",
      background: "transparent",
    },
    clearBtn: { 
      background: "none", 
      border: "none", 
      cursor: "pointer", 
      fontSize: "16px", 
      color: "#94a3b8", 
      padding: "8px", 
      borderRadius: "50%",
      "&:hover": { background: "#f1f5f9" }
    },
    filterSelect: {
      padding: isMobile ? "12px 16px" : "12px 20px",
      borderRadius: "48px",
      border: "1px solid #e2e8f0",
      background: "white",
      fontSize: "14px",
      outline: "none",
      cursor: "pointer",
      fontWeight: "500",
      color: "#1e293b",
      minWidth: isMobile ? "100%" : "180px",
      width: isMobile ? "100%" : "auto",
    },

    tableCard: {
      background: "white",
      borderRadius: "24px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    },
    tableHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: isMobile ? "16px 20px" : "20px 24px",
      borderBottom: "2px solid #eef2f6",
      background: "#ffffff",
      flexWrap: "wrap",
      gap: "12px",
    },
    tableTitle: { fontSize: isMobile ? "14px" : "16px", fontWeight: "600", color: "#1e293b" },
    tableMeta: { fontSize: "13px", color: "#64748b", fontWeight: "500" },

    tableWrapper: { overflowX: "auto", WebkitOverflowScrolling: "touch" },
    premiumTable: { 
      width: "100%", 
      borderCollapse: "collapse", 
      minWidth: isMobile ? "500px" : "900px" 
    },
    thPhoto: { 
      width: isMobile ? "60px" : "80px", 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "700", 
      color: "#475569", 
      background: "#f8fafc", 
      borderBottom: "2px solid #e2e8f0", 
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thName: { 
      textAlign: "left", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "700", 
      color: "#475569", 
      background: "#f8fafc", 
      borderBottom: "2px solid #e2e8f0", 
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thAdmission: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "700", 
      color: "#475569", 
      background: "#f8fafc", 
      borderBottom: "2px solid #e2e8f0", 
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thClass: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "700", 
      color: "#475569", 
      background: "#f8fafc", 
      borderBottom: "2px solid #e2e8f0", 
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thPhone: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "700", 
      color: "#475569", 
      background: "#f8fafc", 
      borderBottom: "2px solid #e2e8f0", 
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thEmail: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "700", 
      color: "#475569", 
      background: "#f8fafc", 
      borderBottom: "2px solid #e2e8f0", 
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },

    tableRow: { 
      cursor: "pointer", 
      transition: "all 0.2s ease",
      "&:hover": { background: "#f8fafc" }
    },

    tdPhoto: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdName: { 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdAdmission: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdClass: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdPhone: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdEmail: { 
      textAlign: "center", 
      padding: isMobile ? "12px 8px" : "16px 12px", 
      borderBottom: "1px solid #f1f5f9" 
    },

    avatar: { 
      width: isMobile ? "36px" : "44px", 
      height: isMobile ? "36px" : "44px", 
      borderRadius: "50%", 
      objectFit: "cover", 
      border: "2px solid #d4af37" 
    },
    avatarPlaceholder: { 
      width: isMobile ? "36px" : "44px", 
      height: isMobile ? "36px" : "44px", 
      borderRadius: "50%", 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
      display: "inline-flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontSize: isMobile ? "18px" : "22px", 
      color: "white", 
      margin: "0 auto" 
    },
    studentName: { 
      fontWeight: "600", 
      color: "#1e293b", 
      fontSize: isMobile ? "13px" : "14px", 
      marginBottom: "4px" 
    },
    studentSubjects: { 
      fontSize: "10px", 
      color: "#64748b", 
      marginTop: "2px" 
    },
    admissionBadge: { 
      display: "inline-block", 
      padding: isMobile ? "4px 8px" : "6px 12px", 
      borderRadius: "20px", 
      background: "#f1f5f9", 
      color: "#475569", 
      fontWeight: "600", 
      fontSize: isMobile ? "10px" : "12px", 
      fontFamily: "monospace" 
    },
    courseBadge: { 
      display: "inline-block", 
      padding: isMobile ? "4px 10px" : "6px 14px", 
      borderRadius: "20px", 
      background: "#eef2ff", 
      color: "#4f46e5", 
      fontWeight: "600", 
      fontSize: isMobile ? "10px" : "12px" 
    },
    phoneLink: { 
      color: "#22c55e", 
      textDecoration: "none", 
      fontSize: isMobile ? "11px" : "13px", 
      fontWeight: "500", 
      display: "inline-flex", 
      alignItems: "center", 
      gap: "4px" 
    },
    emailLink: { 
      color: "#3b82f6", 
      textDecoration: "none", 
      fontSize: isMobile ? "11px" : "13px", 
      fontWeight: "500", 
      display: "inline-flex", 
      alignItems: "center", 
      gap: "4px" 
    },
    naText: { color: "#94a3b8", fontSize: isMobile ? "11px" : "13px" },

    paginationContainer: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: isMobile ? "16px 20px" : "18px 24px", 
      borderTop: "1px solid #eef2f6", 
      background: "#fafcfc", 
      flexWrap: "wrap", 
      gap: "16px",
      flexDirection: isMobile ? "column" : "row",
    },
    paginationControls: { 
      display: "flex", 
      alignItems: "center", 
      gap: isMobile ? "8px" : "12px", 
      flexWrap: "wrap",
      justifyContent: "center",
    },
    pageBtn: { 
      padding: isMobile ? "6px 12px" : "8px 18px", 
      borderRadius: "40px", 
      border: "1px solid #e2e8f0", 
      background: "white", 
      cursor: "pointer", 
      fontWeight: "600", 
      fontSize: isMobile ? "12px" : "13px", 
      color: "#1e293b",
      transition: "all 0.2s",
      "&:hover:not(:disabled)": { background: "#f1f5f9", borderColor: "#cbd5e1" }
    },
    pageBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
    pageNumbers: { display: "flex", gap: isMobile ? "4px" : "8px" },
    pageNum: { 
      minWidth: isMobile ? "32px" : "36px", 
      height: isMobile ? "32px" : "36px", 
      padding: "0 6px", 
      borderRadius: "10px", 
      border: "1px solid #e2e8f0", 
      background: "white", 
      cursor: "pointer", 
      fontWeight: "600", 
      fontSize: isMobile ? "12px" : "13px", 
      color: "#1e293b",
      transition: "all 0.2s",
      "&:hover": { background: "#f1f5f9" }
    },
    pageNumActive: { background: "#1a472a", color: "white", borderColor: "#1a472a" },
    pageInfo: { fontSize: "13px", color: "#64748b", fontWeight: "500" },

    emptyState: { textAlign: "center", padding: isMobile ? "60px 20px" : "80px 20px" },
    emptyIcon: { fontSize: isMobile ? "60px" : "80px", marginBottom: "16px", opacity: 0.7 },

    modalOverlay: { 
      position: "fixed", 
      inset: 0, 
      background: "rgba(0,0,0,0.7)", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      zIndex: 1000, 
      padding: "20px", 
      backdropFilter: "blur(8px)", 
      animation: "fadeIn 0.3s ease" 
    },
    modalContent: { 
      position: "relative", 
      background: "white", 
      borderRadius: "32px", 
      maxWidth: isMobile ? "95%" : "700px", 
      width: "100%", 
      maxHeight: "85vh", 
      overflowY: "auto", 
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)", 
      animation: "slideUp 0.3s ease" 
    },
    modalClose: { 
      position: "absolute", 
      top: 16, 
      right: 16, 
      background: "white", 
      border: "none", 
      width: 36, 
      height: 36, 
      borderRadius: "50%", 
      cursor: "pointer", 
      fontSize: 18, 
      zIndex: 10, 
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      transition: "all 0.2s",
      "&:hover": { transform: "scale(1.1)", background: "#fee2e2" } 
    },
    modalHeader: { 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
      padding: isMobile ? "24px" : "32px", 
      textAlign: "center", 
      borderTopLeftRadius: "32px", 
      borderTopRightRadius: "32px", 
      position: "relative" 
    },
    modalPhoto: { marginBottom: 16 },
    modalAvatar: { 
      width: isMobile ? "80px" : "100px", 
      height: isMobile ? "80px" : "100px", 
      borderRadius: "50%", 
      objectFit: "cover", 
      border: "4px solid #d4af37", 
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)" 
    },
    modalAvatarPlaceholder: { 
      width: isMobile ? "80px" : "100px", 
      height: isMobile ? "80px" : "100px", 
      borderRadius: "50%", 
      background: "rgba(255,255,255,0.2)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontSize: isMobile ? "40px" : "48px", 
      color: "white", 
      margin: "0 auto", 
      border: "4px solid #d4af37" 
    },
    modalInfo: { color: "white" },
    modalName: { fontSize: isMobile ? "22px" : "26px", margin: "0 0 8px 0", fontWeight: "700" },
    modalId: { 
      fontSize: "13px", 
      opacity: 0.9, 
      margin: "0 0 12px 0", 
      fontFamily: "monospace", 
      background: "rgba(255,255,255,0.15)", 
      display: "inline-block", 
      padding: "4px 12px", 
      borderRadius: "20px" 
    },
    modalCourse: { 
      display: "inline-block", 
      background: "rgba(255,255,255,0.2)", 
      padding: "6px 16px", 
      borderRadius: "30px", 
      fontSize: "12px", 
      fontWeight: "600" 
    },
    modalBody: { padding: isMobile ? "20px" : "28px" },
    modalGrid: { 
      display: "grid", 
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", 
      gap: "16px", 
      marginBottom: "20px" 
    },
    modalGridItem: { 
      background: "#f8fafc", 
      padding: "14px 16px", 
      borderRadius: "16px", 
      transition: "all 0.2s" 
    },
    modalSection: { marginTop: "20px", background: "#f8fafc", padding: "16px", borderRadius: "16px" },
    modalKey: { 
      fontSize: "11px", 
      color: "#64748b", 
      fontWeight: "700", 
      marginBottom: "6px", 
      textTransform: "uppercase", 
      letterSpacing: "0.5px", 
      display: "flex", 
      alignItems: "center", 
      gap: "6px" 
    },
    modalVal: { fontSize: isMobile ? "14px" : "15px", color: "#0f172a", fontWeight: "500", lineHeight: "1.5" },
    parentPhone: { fontSize: "13px", color: "#22c55e", fontWeight: "normal", marginLeft: "8px" },
    modalFooter: { padding: isMobile ? "16px 20px" : "20px 28px", borderTop: "1px solid #e2e8f0", textAlign: "center" },
    modalCloseBtn: { 
      padding: isMobile ? "10px 24px" : "10px 32px", 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
      color: "white", 
      border: "none", 
      borderRadius: "40px", 
      cursor: "pointer", 
      fontSize: "14px", 
      fontWeight: "600", 
      transition: "all 0.2s" 
    },

    loadingContainer: { 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "400px", 
      gap: "16px" 
    },
    spinner: { 
      width: "44px", 
      height: "44px", 
      border: "3px solid #e2e8f0", 
      borderTopColor: "#22c55e", 
      borderRadius: "50%", 
      animation: "spin 0.9s linear infinite" 
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />

      <div style={styles.header}>
        <h1 style={styles.title}>👨‍🎓 My Students</h1>
        <p style={styles.subtitle}>View and manage all students in your class</p>
      </div>

      {teacher && (
        <div style={styles.classInfoCard}>
          <div style={styles.classInfoLeft}>
            <span style={styles.classIcon}>📚</span>
            <div>
              <p style={styles.classLabel}>Your Class</p>
              <p style={styles.className}>
                {assignedCourse ? teacher.course_name || "Assigned class" : "All Classes"}
              </p>
            </div>
          </div>
          <div style={styles.studentCountBadge}>
            <span style={styles.countNumber}>{filteredStudents.length}</span>
            <span>Total Students</span>
          </div>
        </div>
      )}

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        {!assignedCourse && (
          <select
            style={styles.filterSelect}
            value={filterCourse || ""}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Classes</option>
            {courses.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {assignedCourse && teacher && (
          <div style={styles.assignedBadge}>
            📌 You are assigned to: <strong>{teacher.course_name}</strong>
          </div>
        )}
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.tableTitle}>
            <span>📋 Student Directory</span>
          </div>
          <div style={styles.tableMeta}>
            Showing <strong>{paginatedStudents.length}</strong> of{" "}
            <strong>{filteredStudents.length}</strong> students
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={{ marginBottom: 6 }}>No Students Found</h3>
            <p style={{ margin: 0, color: "#64748b" }}>
              {assignedCourse
                ? "No students enrolled in your class yet."
                : "No students match your search criteria."}
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.premiumTable}>
                <thead>
                  <tr>
                    <th style={styles.thPhoto}>Photo</th>
                    <th style={styles.thName}>Student</th>
                    <th style={styles.thAdmission}>Admission</th>
                    <th style={styles.thClass}>Class</th>
                    {!isMobile && <th style={styles.thPhone}>Phone</th>}
                    {!isMobile && <th style={styles.thEmail}>Email</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s, idx) => (
                    <tr
                      key={s.id}
                      style={styles.tableRow}
                      onClick={() => setSelected(s)}
                    >
                      <td style={styles.tdPhoto}>
                        {s.image_url ? (
                          <img
                            src={s.image_url}
                            style={styles.avatar}
                            alt={s.name}
                          />
                        ) : (
                          <div style={styles.avatarPlaceholder}>🎓</div>
                        )}
                      </td>
                      <td style={styles.tdName}>
                        <div style={styles.studentName}>
                          {isMobile && s.name.length > 15 ? s.name.substring(0, 12) + '...' : s.name}
                        </div>
                        {s.subjects && !isMobile && (
                          <div style={styles.studentSubjects}>📖 {s.subjects.length > 20 ? s.subjects.substring(0, 17) + '...' : s.subjects}</div>
                        )}
                      </td>
                      <td style={styles.tdAdmission}>
                        <span style={styles.admissionBadge}>
                          {isMobile && s.admission_no.length > 8 ? s.admission_no.substring(0, 6) + '...' : s.admission_no}
                        </span>
                      </td>
                      <td style={styles.tdClass}>
                        <span style={styles.courseBadge}>
                          {isMobile && getCourseName(s.course).length > 8 ? getCourseName(s.course).substring(0, 6) + '...' : getCourseName(s.course)}
                        </span>
                      </td>
                      {!isMobile && (
                        <>
                          <td style={styles.tdPhone}>
                            {s.phone ? (
                              <a href={`tel:${s.phone}`} style={styles.phoneLink}>
                                📞 {s.phone}
                              </a>
                            ) : (
                              <span style={styles.naText}>—</span>
                            )}
                          </td>
                          <td style={styles.tdEmail}>
                            {s.email ? (
                              <a href={`mailto:${s.email}`} style={styles.emailLink}>
                                ✉️ {s.email.length > 20 ? s.email.substring(0, 17) + '...' : s.email}
                              </a>
                            ) : (
                              <span style={styles.naText}>—</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <div style={styles.paginationControls}>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    style={{...styles.pageBtn, ...(safePage === 1 ? styles.pageBtnDisabled : {})}}
                  >
                    ← Prev
                  </button>
                  
                  <div style={styles.pageNumbers}>
                    {renderPageNumbers().map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        style={{
                          ...styles.pageNum,
                          ...(n === safePage ? styles.pageNumActive : {})
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    style={{...styles.pageBtn, ...(safePage === totalPages ? styles.pageBtnDisabled : {})}}
                  >
                    Next →
                  </button>
                </div>
                <div style={styles.pageInfo}>
                  Page {safePage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Student Detail Modal */}
      {selected && (
        <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setSelected(null)}>
              ✕
            </button>

            <div style={styles.modalHeader}>
              <div style={styles.modalPhoto}>
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    style={styles.modalAvatar}
                    alt={selected.name}
                  />
                ) : (
                  <div style={styles.modalAvatarPlaceholder}>👨‍🎓</div>
                )}
              </div>
              <div style={styles.modalInfo}>
                <h2 style={styles.modalName}>{selected.name}</h2>
                <p style={styles.modalId}>
                  Admission: {selected.admission_no}
                </p>
                <span style={styles.modalCourse}>
                  {getCourseName(selected.course)}
                </span>
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalGrid}>
                <div style={styles.modalGridItem}>
                  <div style={styles.modalKey}>📞 Phone</div>
                  <div style={styles.modalVal}>
                    {selected.phone || "Not provided"}
                  </div>
                </div>
                <div style={styles.modalGridItem}>
                  <div style={styles.modalKey}>📧 Email</div>
                  <div style={styles.modalVal}>
                    {selected.email || "Not provided"}
                  </div>
                </div>
                <div style={styles.modalGridItem}>
                  <div style={styles.modalKey}>📖 Subjects</div>
                  <div style={styles.modalVal}>
                    {selected.subjects || "Not assigned"}
                  </div>
                </div>
                <div style={styles.modalGridItem}>
                  <div style={styles.modalKey}>🎂 DOB</div>
                  <div style={styles.modalVal}>
                    {selected.dob ? new Date(selected.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not provided"}
                  </div>
                </div>
                <div style={styles.modalGridItem}>
                  <div style={styles.modalKey}>🩸 Blood Group</div>
                  <div style={styles.modalVal}>
                    {selected.blood_group || "Not provided"}
                  </div>
                </div>
                <div style={styles.modalGridItem}>
                  <div style={styles.modalKey}>⚥ Gender</div>
                  <div style={styles.modalVal}>
                    {selected.gender || "Not provided"}
                  </div>
                </div>
              </div>

              <div style={styles.modalSection}>
                <div style={styles.modalKey}>📍 Address</div>
                <div style={styles.modalVal}>
                  {selected.address || "Not provided"}
                </div>
              </div>

              <div style={styles.modalSection}>
                <div style={styles.modalKey}>👨‍👩 Parent / Guardian</div>
                <div style={styles.modalVal}>
                  {selected.parent_name || "Not provided"}
                  {selected.parent_phone && (
                    <span style={styles.parentPhone}> • 📱 {selected.parent_phone}</span>
                  )}
                </div>
              </div>

              {selected.details && (
                <div style={styles.modalSection}>
                  <div style={styles.modalKey}>📝 Additional Info</div>
                  <div style={styles.modalVal}>{selected.details}</div>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.modalCloseBtn}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .premium-table tr:hover {
    background: #f8fafc !important;
    transition: background 0.2s ease;
  }
  button:hover {
    transform: translateY(-1px);
    transition: transform 0.2s;
  }
  button:active {
    transform: translateY(0);
  }
  .filter-select, .search-box {
    transition: all 0.2s ease;
  }
  .filter-select:focus, .search-box:focus-within {
    border-color: #1a472a;
    box-shadow: 0 0 0 3px rgba(26,71,42,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default TeacherStudents;