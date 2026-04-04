import { useEffect, useState } from "react";

function TeacherMarks() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [examType, setExamType] = useState("Unit Test");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [existingMarks, setExistingMarks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState("");
  const [showError, setShowError] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [studentMarksList, setStudentMarksList] = useState([]);
  const [assignedCourse, setAssignedCourse] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const API = "http://127.0.0.1:8000/api/";
  const examTypes = ["Unit Test", "Mid Term", "Final"];

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
      fetch(`${API}teachers/${stored.teacher_id}/`)
        .then(r => r.json())
        .then(data => {
          setTeacher(data);
          if (data.course) {
            setAssignedCourse(data.course);
            setSelectedCourse(String(data.course));
          }
        })
        .catch(err => console.error("Error fetching teacher:", err));
    }
    fetchCourses();
    
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .marks-table tr:hover {
        background: #f8fafc;
        transition: background 0.2s ease;
      }
      .submit-btn:hover, .edit-btn:hover, .delete-btn:hover {
        transform: translateY(-2px);
        transition: transform 0.2s;
      }
      .edit-btn, .delete-btn {
        transition: all 0.2s;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const fetchCourses = () => {
    fetch(`${API}courses/`)
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching courses:", err));
  };

  const fetchStudents = (courseId) => {
    if (!courseId) return;
    fetch(`${API}students/?course=${courseId}`)
      .then(r => r.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching students:", err));
  };

  const fetchExistingMarks = (studentId) => {
    if (!studentId) return;
    fetch(`${API}marks/?student=${studentId}`)
      .then(r => r.json())
      .then(data => {
        const marksData = Array.isArray(data) ? data : [];
        const markForExam = marksData.find(m => m.exam_type === examType && m.subject === subject);
        if (markForExam) {
          setExistingMarks(markForExam);
          setMarks(markForExam.marks);
          setMaxMarks(markForExam.max_marks);
        } else {
          setExistingMarks(null);
          setMarks("");
          setMaxMarks(100);
        }
      })
      .catch(err => console.error("Error fetching marks:", err));
  };

  const fetchStudentMarksList = (courseId) => {
    if (!courseId) return;
    fetch(`${API}marks/?course=${courseId}`)
      .then(r => r.json())
      .then(data => setStudentMarksList(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching marks list:", err));
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents(selectedCourse);
      fetchStudentMarksList(selectedCourse);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedStudent) {
      fetchExistingMarks(selectedStudent);
    }
  }, [selectedStudent, examType, subject]);

  const handleSubmitMarks = async () => {
    if (!selectedStudent || !subject.trim()) {
      setShowError("Please select student and enter subject");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    if (!marks || marks < 0 || marks > maxMarks) {
      setShowError(`Marks must be between 0 and ${maxMarks}`);
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const student = students.find(s => s.id == selectedStudent);

    if (!student || String(student.course) !== String(selectedCourse)) {
      setShowError("Student not in selected course");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    setLoading(true);

    const payload = {
      student: parseInt(selectedStudent),
      course: parseInt(selectedCourse),
      subject: subject.trim(),
      exam_type: examType,
      marks: parseInt(marks),
      max_marks: parseInt(maxMarks),
      entered_by: teacher?.id
    };

    try {
      const url = existingMarks ? `${API}marks/${existingMarks.id}/` : `${API}marks/`;
      const method = existingMarks ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(existingMarks ? "✅ Marks updated successfully!" : "✅ Marks saved successfully!");
        setTimeout(() => setShowSuccess(""), 3000);
        
        fetchExistingMarks(selectedStudent);
        fetchStudentMarksList(selectedCourse);
        
        if (!existingMarks) {
          setSubject("");
          setMarks("");
          setMaxMarks(100);
        }
      } else {
        setShowError(data.error || data.message || "Error saving marks");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      console.error("Save error:", err);
      setShowError("Network error");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMarks = (mark) => {
    setSelectedStudent(String(mark.student));
    setExamType(mark.exam_type);
    setSubject(mark.subject);
    setMarks(mark.marks);
    setMaxMarks(mark.max_marks);
    setExistingMarks(mark);
    
    // Scroll to form
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteMarks = async (mark) => {
    if (!window.confirm(`Are you sure you want to delete ${mark.subject} marks for ${getStudentName(mark.student)}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API}marks/${mark.id}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.ok) {
        setShowSuccess(`✅ Marks deleted successfully!`);
        setTimeout(() => setShowSuccess(""), 3000);
        
        if (selectedStudent == mark.student && existingMarks?.id === mark.id) {
          setSelectedStudent("");
          setSubject("");
          setMarks("");
          setMaxMarks(100);
          setExistingMarks(null);
        }
        
        fetchStudentMarksList(selectedCourse);
      } else {
        const error = await res.json();
        setShowError(error.error || "Error deleting marks");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setShowError("Network error");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (id) => {
    const student = students.find(s => s.id == id);
    return student ? student.name : "Unknown";
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id == courseId);
    return course ? course.name : "Unknown";
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#22c55e";
    if (percentage >= 60) return "#f59e0b";
    if (percentage >= 40) return "#f97316";
    return "#ef4444";
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "D";
  };

  const selectedStudentData = students.find(s => s.id == selectedStudent);

  // Dynamic styles based on mobile state
  const styles = {
    container: { 
      padding: isMobile ? "16px" : "24px", 
      background: "#f8fafc", 
      minHeight: "calc(100vh - 70px)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    header: { marginBottom: isMobile ? "20px" : "28px", textAlign: "center" },
    title: { 
      fontSize: isMobile ? "24px" : "32px", 
      fontWeight: "700", 
      margin: 0, 
      background: "linear-gradient(135deg, #1e293b, #3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    subtitle: { fontSize: "14px", color: "#64748b", marginTop: "6px" },
    
    toastSuccess: { 
      position: "fixed", 
      top: isMobile ? "auto" : "20px", 
      bottom: isMobile ? "20px" : "auto",
      right: "20px", 
      background: "linear-gradient(135deg, #10b981, #059669)", 
      color: "white", 
      padding: isMobile ? "10px 16px" : "12px 20px", 
      borderRadius: "12px", 
      zIndex: 1000, 
      animation: "slideIn 0.3s ease", 
      fontWeight: "500",
      boxShadow: "0 10px 25px rgba(16,185,129,0.2)",
      fontSize: isMobile ? "13px" : "14px"
    },
    toastError: { 
      position: "fixed", 
      top: isMobile ? "auto" : "20px", 
      bottom: isMobile ? "20px" : "auto",
      right: "20px", 
      background: "linear-gradient(135deg, #ef4444, #dc2626)", 
      color: "white", 
      padding: isMobile ? "10px 16px" : "12px 20px", 
      borderRadius: "12px", 
      zIndex: 1000, 
      animation: "slideIn 0.3s ease", 
      fontWeight: "500",
      boxShadow: "0 10px 25px rgba(239,68,68,0.2)",
      fontSize: isMobile ? "13px" : "14px"
    },
    
    filters: { 
      display: "flex", 
      gap: isMobile ? "12px" : "24px", 
      marginBottom: "28px", 
      flexWrap: "wrap",
      flexDirection: isMobile ? "column" : "row"
    },
    filterGroup: { 
      display: "flex", 
      flexDirection: "column", 
      gap: "8px", 
      flex: 1, 
      minWidth: isMobile ? "100%" : "280px" 
    },
    label: { fontSize: "13px", fontWeight: "600", color: "#334155" },
    select: { 
      padding: "12px 16px", 
      borderRadius: "12px", 
      border: "1px solid #e2e8f0", 
      fontSize: "14px", 
      background: "white", 
      outline: "none", 
      cursor: "pointer",
      transition: "all 0.2s"
    },
    input: { 
      padding: "12px 16px", 
      borderRadius: "12px", 
      border: "1px solid #e2e8f0", 
      fontSize: "14px", 
      outline: "none", 
      transition: "all 0.2s"
    },
    hintText: { fontSize: "11px", color: "#22c55e", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" },
    
    formCard: { 
      background: "white", 
      borderRadius: "24px", 
      padding: isMobile ? "20px" : "28px", 
      marginBottom: "28px", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)", 
      border: "1px solid #e2e8f0",
      animation: "fadeIn 0.3s ease"
    },
    formHeader: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: "24px", 
      flexWrap: "wrap", 
      gap: "16px",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center"
    },
    studentBadge: { display: "flex", alignItems: "center", gap: "16px" },
    studentThumb: { width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #d4af37" },
    studentThumbPlaceholder: { 
      width: "48px", height: "48px", borderRadius: "50%", 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
      display: "flex", alignItems: "center", justifyContent: "center", 
      fontSize: "24px", color: "white"
    },
    studentInfoText: { fontSize: "12px", color: "#64748b", marginTop: "4px" },
    updateBadge: { 
      background: "#ffedd5", 
      color: "#9a3412", 
      padding: isMobile ? "4px 10px" : "6px 14px", 
      borderRadius: "30px", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "500"
    },
    formTitle: { margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" },
    formGrid: { 
      display: "grid", 
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", 
      gap: isMobile ? "16px" : "20px", 
      marginBottom: "20px"
    },
    formField: { display: "flex", flexDirection: "column", gap: "8px" },
    percentagePreview: { 
      textAlign: isMobile ? "center" : "right", 
      padding: "12px 16px", 
      background: "#f8fafc", 
      borderRadius: "12px", 
      marginBottom: "20px", 
      fontSize: "13px",
      display: "flex", 
      justifyContent: isMobile ? "center" : "flex-end", 
      gap: "12px", 
      alignItems: "center"
    },
    submitBtn: { 
      width: "100%", 
      padding: "14px", 
      background: "linear-gradient(135deg, #22c55e, #16a34a)", 
      color: "white", 
      border: "none", 
      borderRadius: "14px", 
      fontSize: "15px", 
      fontWeight: "600", 
      cursor: "pointer", 
      transition: "all 0.2s"
    },
    
    tableCard: { 
      background: "white", 
      borderRadius: "24px", 
      overflow: "hidden", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)", 
      border: "1px solid #e2e8f0"
    },
    tableHeader: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: isMobile ? "16px" : "20px 24px", 
      borderBottom: "2px solid #e2e8f0", 
      background: "#fafcfc",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "10px" : "0px",
      alignItems: isMobile ? "flex-start" : "center"
    },
    tableTitle: { margin: 0, fontSize: isMobile ? "16px" : "18px", fontWeight: "600", color: "#1e293b" },
    recordCount: { 
      background: "#f1f5f9", 
      color: "#475569", 
      padding: "4px 12px", 
      borderRadius: "20px", 
      fontSize: "12px", 
      fontWeight: "500"
    },
    tableWrapper: { 
      overflowX: "auto",
      WebkitOverflowScrolling: "touch"
    },
    table: { 
      width: "100%", 
      borderCollapse: "collapse",
      minWidth: isMobile ? "600px" : "750px"
    },
    
    // Desktop table headers
    thStudent: { 
      padding: "14px 16px", 
      textAlign: "left", 
      background: "#f8fafc", 
      fontSize: "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thSubject: { 
      padding: "14px 16px", 
      textAlign: "left", 
      background: "#f8fafc", 
      fontSize: "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thExam: { 
      padding: "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thMarks: { 
      padding: "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thPercentage: { 
      padding: "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thGrade: { 
      padding: "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thActions: { 
      padding: "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    
    // Mobile table header
    thMobile: { 
      padding: "12px 10px", 
      textAlign: "left", 
      background: "#f8fafc", 
      fontSize: "11px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    
    tableRow: { 
      transition: "background 0.2s" 
    },
    rowEditing: {
      background: "#fef3c7"
    },
    
    tdStudent: { 
      padding: isMobile ? "10px 8px" : "12px 16px", 
      borderBottom: "1px solid #f1f5f9"
    },
    tdSubject: { 
      padding: isMobile ? "10px 8px" : "12px 16px", 
      borderBottom: "1px solid #f1f5f9"
    },
    tdExam: { 
      padding: isMobile ? "10px 8px" : "12px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9"
    },
    tdMarks: { 
      padding: isMobile ? "10px 8px" : "12px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9"
    },
    tdPercentage: { 
      padding: "12px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdGrade: { 
      padding: "12px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdActions: { 
      padding: isMobile ? "10px 8px" : "12px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9"
    },
    
    studentCell: { 
      display: "flex", 
      alignItems: "center", 
      gap: isMobile ? "8px" : "10px"
    },
    studentInitial: { 
      width: isMobile ? "28px" : "32px", 
      height: isMobile ? "28px" : "32px", 
      borderRadius: "50%", 
      background: "linear-gradient(135deg, #667eea, #764ba2)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      color: "white", 
      fontSize: isMobile ? "12px" : "14px", 
      fontWeight: "600"
    },
    examBadge: { 
      display: "inline-block", 
      padding: isMobile ? "2px 8px" : "4px 12px", 
      borderRadius: "20px", 
      fontSize: isMobile ? "9px" : "11px", 
      fontWeight: "500", 
      background: "#f1f5f9", 
      color: "#475569"
    },
    marksValue: { 
      fontSize: isMobile ? "13px" : "15px", 
      fontWeight: "700", 
      color: "#3b82f6"
    },
    maxMarksSmall: { 
      fontSize: isMobile ? "9px" : "11px", 
      color: "#94a3b8"
    },
    percentWrapper: { 
      display: "flex", 
      flexDirection: "column", 
      gap: "6px", 
      alignItems: "center" 
    },
    miniProgress: { 
      width: "80px", 
      height: "4px", 
      background: "#e2e8f0", 
      borderRadius: "4px", 
      overflow: "hidden" 
    },
    miniFill: { 
      height: "100%", 
      borderRadius: "4px", 
      transition: "width 0.3s" 
    },
    gradeChip: { 
      display: "inline-block", 
      padding: isMobile ? "2px 8px" : "4px 12px", 
      borderRadius: "20px", 
      fontSize: isMobile ? "10px" : "11px", 
      fontWeight: "600", 
      color: "white"
    },
    
    actionButtons: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      alignItems: "center"
    },
    editBtn: {
      padding: isMobile ? "6px 10px" : "6px 12px",
      minWidth: isMobile ? "44px" : "60px",
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: isMobile ? "14px" : "12px",
      fontWeight: "500",
      transition: "all 0.2s"
    },
    deleteBtn: {
      padding: isMobile ? "6px 10px" : "6px 12px",
      minWidth: isMobile ? "44px" : "60px",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: isMobile ? "14px" : "12px",
      fontWeight: "500",
      transition: "all 0.2s"
    },
    
    emptyState: { 
      textAlign: "center", 
      padding: isMobile ? "40px 20px" : "60px 20px", 
      background: "white", 
      borderRadius: "24px", 
      border: "1px solid #e2e8f0" 
    },
    emptyIcon: { fontSize: isMobile ? "48px" : "64px", marginBottom: "16px", opacity: 0.6 },
    emptyHint: { fontSize: "12px", color: "#94a3b8", marginTop: "8px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📝 Exam Marks Management</h2>
        <p style={styles.subtitle}>Enter, edit, and manage student marks for exams</p>
      </div>

      {showSuccess && <div style={styles.toastSuccess}>{showSuccess}</div>}
      {showError && <div style={styles.toastError}>{showError}</div>}

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Select Class</label>
          <select
            style={styles.select}
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            disabled={!!assignedCourse}
          >
            <option value="">-- Select Class --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {assignedCourse && teacher && (
            <p style={styles.hintText}>📌 You are assigned to: {teacher.course_name}</p>
          )}
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Select Student</label>
          <select
            style={styles.select}
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            disabled={!selectedCourse}
          >
            <option value="">-- Select Student --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} - {s.admission_no}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedStudent && selectedStudentData && (
        <div className="form-card" style={styles.formCard}>
          <div style={styles.formHeader}>
            <div style={styles.studentBadge}>
              {selectedStudentData.image_url ? (
                <img src={selectedStudentData.image_url} style={styles.studentThumb} alt={selectedStudentData.name} />
              ) : (
                <div style={styles.studentThumbPlaceholder}>🎓</div>
              )}
              <div>
                <h3 style={styles.formTitle}>{existingMarks ? "✏️ Edit Marks" : "📝 Enter Marks"}</h3>
                <p style={styles.studentInfoText}>{selectedStudentData.name} • {selectedStudentData.admission_no}</p>
              </div>
            </div>
            {existingMarks && (
              <div style={styles.updateBadge}>
                <span>✏️ Editing: {existingMarks.subject} ({existingMarks.exam_type})</span>
              </div>
            )}
          </div>
          
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.label}>Exam Type *</label>
              <select 
                style={styles.select} 
                value={examType} 
                onChange={e => setExamType(e.target.value)}
              >
                {examTypes.map(et => (<option key={et} value={et}>{et}</option>))}
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Subject *</label>
              <input 
                type="text" 
                style={styles.input} 
                placeholder="Enter subject name" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Marks Obtained *</label>
              <input 
                type="number" 
                min="0"
                max={maxMarks}
                style={styles.input} 
                placeholder="Enter marks" 
                value={marks} 
                onChange={e => setMarks(e.target.value)} 
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Maximum Marks</label>
              <input 
                type="number" 
                min="1"
                style={styles.input} 
                placeholder="Maximum marks" 
                value={maxMarks} 
                onChange={e => setMaxMarks(e.target.value)} 
              />
            </div>
          </div>
          
          {marks && maxMarks > 0 && (
            <div style={styles.percentagePreview}>
              <span>Preview:</span>
              <strong style={{color: getPercentageColor((marks / maxMarks) * 100)}}>
                {((marks / maxMarks) * 100).toFixed(1)}% ({getGrade((marks / maxMarks) * 100)})
              </strong>
            </div>
          )}
          
          <button 
            style={styles.submitBtn} 
            onClick={handleSubmitMarks} 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "⏳ Saving..." : existingMarks ? "✏️ Update Marks" : "📝 Save Marks"}
          </button>
        </div>
      )}

      {selectedCourse && studentMarksList.length > 0 && (
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>📊 Marks Records - {getCourseName(selectedCourse)}</h3>
            <span style={styles.recordCount}>{studentMarksList.length} records</span>
          </div>
          <div style={styles.tableWrapper}>
            <table className="marks-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={isMobile ? styles.thMobile : styles.thStudent}>Student</th>
                  <th style={isMobile ? styles.thMobile : styles.thSubject}>Subject</th>
                  <th style={isMobile ? styles.thMobile : styles.thExam}>Exam</th>
                  <th style={isMobile ? styles.thMobile : styles.thMarks}>Marks</th>
                  {!isMobile && <th style={styles.thPercentage}>%</th>}
                  {!isMobile && <th style={styles.thGrade}>Grade</th>}
                  <th style={isMobile ? styles.thMobile : styles.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentMarksList.map(mark => {
                  const percentage = (mark.marks / mark.max_marks) * 100;
                  const grade = getGrade(percentage);
                  const gradeColor = getPercentageColor(percentage);
                  const isEditing = existingMarks?.id === mark.id;
                  
                  return (
                    <tr key={mark.id} style={{...styles.tableRow, ...(isEditing ? styles.rowEditing : {})}}>
                      <td style={styles.tdStudent}>
                        <div style={styles.studentCell}>
                          <div style={styles.studentInitial}>{getStudentName(mark.student).charAt(0)}</div>
                          <span>{isMobile ? getStudentName(mark.student).split(' ')[0] : getStudentName(mark.student)}</span>
                        </div>
                      </td>
                      <td style={styles.tdSubject}>
                        <strong>{isMobile ? (mark.subject.length > 10 ? mark.subject.substring(0, 8) + '...' : mark.subject) : mark.subject}</strong>
                      </td>
                      <td style={styles.tdExam}>
                        <span style={styles.examBadge}>
                          {isMobile ? (mark.exam_type === "Unit Test" ? "UT" : mark.exam_type === "Mid Term" ? "MT" : "Final") : mark.exam_type}
                        </span>
                      </td>
                      <td style={styles.tdMarks}>
                        <span style={styles.marksValue}>{mark.marks}</span>
                        <span style={styles.maxMarksSmall}>/{mark.max_marks}</span>
                      </td>
                      {!isMobile && (
                        <>
                          <td style={styles.tdPercentage}>
                            <div style={styles.percentWrapper}>
                              <span style={{color: gradeColor, fontWeight: "600"}}>
                                {percentage.toFixed(1)}%
                              </span>
                              <div style={styles.miniProgress}>
                                <div style={{...styles.miniFill, width: `${percentage}%`, background: gradeColor}}></div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.tdGrade}>
                            <span style={{...styles.gradeChip, background: gradeColor}}>{grade}</span>
                          </td>
                        </>
                      )}
                      <td style={styles.tdActions}>
                        <div style={styles.actionButtons}>
                          <button
                            className="edit-btn"
                            style={styles.editBtn}
                            onClick={() => handleEditMarks(mark)}
                            disabled={loading}
                            title="Edit marks"
                          >
                            {isMobile ? "✏️" : "Edit"}
                          </button>
                          <button
                            className="delete-btn"
                            style={styles.deleteBtn}
                            onClick={() => handleDeleteMarks(mark)}
                            disabled={loading}
                            title="Delete marks"
                          >
                            {isMobile ? "🗑️" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCourse && studentMarksList.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No Marks Records Found</h3>
          <p>No marks have been entered for this class yet.</p>
          <p style={styles.emptyHint}>Select a student from the dropdown to add marks.</p>
        </div>
      )}
    </div>
  );
}

export default TeacherMarks;