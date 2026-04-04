import { useEffect, useState } from "react";

function TeacherAttendance() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingStudent, setSavingStudent] = useState(null);
  const [showSuccess, setShowSuccess] = useState("");
  const [showError, setShowError] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [assignedCourse, setAssignedCourse] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false); // NEW: confirmation state

  const API = "http://127.0.0.1:8000/api/";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .attendance-table tr:hover {
        background: #f8fafc;
        transition: background 0.2s ease;
      }
      .status-btn:hover {
        transform: translateY(-1px);
        transition: transform 0.2s;
      }
      .single-save-btn:hover, .save-all-btn:hover {
        transform: translateY(-1px);
        transition: transform 0.2s;
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
    setLoading(true);
    
    setExistingAttendance({});
    setAttendanceRecords({});
    
    fetch(`${API}students/?course=${courseId}`)
      .then(r => r.json())
      .then(async (studentsList) => {
        const studentsArray = Array.isArray(studentsList) ? studentsList : [];
        setStudents(studentsArray);
        
        const existing = {};
        
        for (const student of studentsArray) {
          try {
            const res = await fetch(`${API}attendance/?student=${student.id}&date=${attendanceDate}`);
            if (!res.ok) {
              continue;
            }
            const data = await res.json();
            const attendanceData = Array.isArray(data) ? data : [];
            
            if (attendanceData.length > 0) {
              existing[student.id] = attendanceData[0];
            }
          } catch (err) {
            console.error(`Error fetching attendance for student ${student.id}:`, err);
          }
        }
        
        setExistingAttendance(existing);
        
        const records = {};
        studentsArray.forEach(s => {
          records[s.id] = existing[s.id] ? existing[s.id].status : true;
        });
        setAttendanceRecords(records);
      })
      .catch(err => {
        console.error("Error fetching students:", err);
        setShowError("Failed to load students");
        setTimeout(() => setShowError(""), 3000);
      })
      .finally(() => setLoading(false));
  };

  // Reset confirmation when class or date changes
  useEffect(() => {
    if (selectedCourse && attendanceDate) {
      setIsConfirmed(false);
    }
  }, [selectedCourse, attendanceDate]);

  // Load students only when confirmed
  useEffect(() => {
    if (selectedCourse && attendanceDate && isConfirmed) {
      fetchStudents(selectedCourse);
    }
  }, [selectedCourse, attendanceDate, refreshKey, isConfirmed]);

  const handleConfirm = () => {
    if (!selectedCourse) {
      setShowError("❌ Please select a class first");
      setTimeout(() => setShowError(""), 3000);
      return;
    }
    
    const courseName = courses.find(c => c.id == selectedCourse)?.name;
    
    const confirmBox = window.confirm(
      `Are you sure?\n\nClass: ${courseName}\nDate: ${attendanceDate}\n\nClick OK to load attendance data.`
    );
    
    if (confirmBox) {
      setIsConfirmed(true);
    } else {
      setIsConfirmed(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status === "present"
    }));
  };

  const handleSaveSingleStudent = async (studentId) => {
    if (!selectedCourse) {
      setShowError("❌ Please select a class first");
      setTimeout(() => setShowError(""), 3000);
      return;
    }
    
    if (!attendanceDate) {
      setShowError("❌ Please select a date first");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setSavingStudent(studentId);
    const status = attendanceRecords[studentId];
    const existing = existingAttendance[studentId];
    
    const teacherId = teacher?.id ? parseInt(teacher.id) : null;
    
    try {
      let response;
      
      if (existing) {
        response = await fetch(`${API}attendance/${existing.id}/`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            status: status,
            marked_by: teacherId
          })
        });
      } else {
        const payload = {
          student: parseInt(student.id),
          course: parseInt(selectedCourse),
          date: attendanceDate,
          status: status,
          marked_by: teacherId
        };
        
        response = await fetch(`${API}attendance/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        setExistingAttendance(prev => ({
          ...prev,
          [studentId]: data
        }));
        setShowSuccess(`✅ ${student.name}'s attendance saved for ${attendanceDate}!`);
        setTimeout(() => setShowSuccess(""), 3000);
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        
        let errorMessage = "Error saving attendance";
        if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(", ");
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        setShowError(errorMessage);
        setTimeout(() => setShowError(""), 5000);
      }
    } catch (err) {
      console.error("Save error:", err);
      setShowError("Network error. Please check your connection.");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setSavingStudent(null);
    }
  };

  const handleSaveAllAttendance = async () => {
    if (!selectedCourse) {
      setShowError("❌ Please select a class first");
      setTimeout(() => setShowError(""), 3000);
      return;
    }
    
    if (!attendanceDate) {
      setShowError("❌ Please select a date first");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    if (students.length === 0) {
      setShowError("No students in this class");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    const errorList = [];

    const teacherId = teacher?.id ? parseInt(teacher.id) : null;

    for (const student of students) {
      const status = attendanceRecords[student.id];
      const existing = existingAttendance[student.id];
      
      try {
        let response;
        
        if (existing) {
          response = await fetch(`${API}attendance/${existing.id}/`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              status: status,
              marked_by: teacherId
            })
          });
        } else {
          const payload = {
            student: parseInt(student.id),
            course: parseInt(selectedCourse),
            date: attendanceDate,
            status: status,
            marked_by: teacherId
          };
          
          response = await fetch(`${API}attendance/`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload)
          });
        }
        
        if (response.ok) {
          const data = await response.json();
          setExistingAttendance(prev => ({
            ...prev,
            [student.id]: data
          }));
          successCount++;
        } else {
          errorCount++;
          errorList.push(student.name);
        }
      } catch (err) {
        errorCount++;
        errorList.push(student.name);
      }
    }
    
    if (errorCount === 0) {
      setShowSuccess(`✅ All attendance saved successfully! ${successCount}/${students.length} records updated.`);
    } else if (successCount > 0) {
      setShowSuccess(`⚠️ Partial success: ${successCount} saved, ${errorCount} failed. Failed: ${errorList.join(", ")}`);
    } else {
      setShowError(`❌ Failed to save attendance. Please try again.`);
    }
    
    setTimeout(() => {
      setShowSuccess("");
      setShowError("");
    }, 5000);
    setLoading(false);
    setRefreshKey(prev => prev + 1);
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendanceRecords).filter(v => v === true).length;
    const absent = total - present;
    const presentPercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, presentPercentage };
  };

  const stats = getAttendanceStats();
  const presentPercentageColor = stats.presentPercentage >= 75 ? "#10b981" : stats.presentPercentage >= 50 ? "#f59e0b" : "#ef4444";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const styles = {
    container: { 
      padding: isMobile ? "16px" : "24px", 
      background: "#f8fafc", 
      minHeight: "calc(100vh - 70px)",
      fontFamily: "'Inter', sans-serif"
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
    
    confirmSection: {
      background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
      padding: isMobile ? "16px" : "20px",
      borderRadius: "20px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px"
    },
    confirmBtn: {
      padding: isMobile ? "10px 20px" : "12px 28px",
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      color: "white",
      border: "none",
      borderRadius: "40px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: isMobile ? "13px" : "14px",
      transition: "all 0.2s",
      boxShadow: "0 2px 8px rgba(59,130,246,0.3)"
    },
    confirmText: {
      fontSize: isMobile ? "13px" : "14px",
      color: "#1e3a8a",
      fontWeight: "500"
    },
    
    filters: { display: "flex", gap: isMobile ? "12px" : "24px", marginBottom: "28px", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" },
    filterGroup: { display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: isMobile ? "100%" : "250px" },
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
    
    statsGrid: { 
      display: "grid", 
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", 
      gap: isMobile ? "12px" : "16px", 
      marginBottom: "24px" 
    },
    statCard: { 
      background: "white", 
      borderRadius: "20px", 
      padding: isMobile ? "14px" : "18px", 
      display: "flex", 
      alignItems: "center", 
      gap: isMobile ? "10px" : "14px", 
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)", 
      border: "1px solid #e2e8f0",
      transition: "all 0.2s"
    },
    statIcon: { fontSize: isMobile ? "28px" : "36px", width: isMobile ? "45px" : "52px", height: isMobile ? "45px" : "52px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", borderRadius: "14px" },
    statLabel: { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
    statValue: { fontSize: isMobile ? "22px" : "26px", fontWeight: "700", color: "#1e293b" },
    
    tableCard: { 
      background: "white", 
      borderRadius: "24px", 
      overflow: "hidden", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)", 
      border: "1px solid #e2e8f0",
      animation: "fadeIn 0.3s ease"
    },
    tableHeader: { 
      padding: isMobile ? "16px 20px" : "20px 24px", 
      borderBottom: "2px solid #e2e8f0", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      flexWrap: "wrap", 
      gap: "16px",
      background: "#fafcfc"
    },
    submitBtn: { 
      padding: isMobile ? "8px 16px" : "10px 24px", 
      background: "linear-gradient(135deg, #22c55e, #16a34a)", 
      color: "white", 
      border: "none", 
      borderRadius: "40px", 
      cursor: "pointer", 
      fontWeight: "600", 
      fontSize: isMobile ? "12px" : "13px",
      transition: "all 0.2s", 
      minWidth: isMobile ? "120px" : "160px",
      opacity: loading ? 0.7 : 1,
      cursor: loading ? "not-allowed" : "pointer"
    },
    
    tableWrapper: { overflowX: "auto" },
    table: { 
      width: "100%", 
      borderCollapse: "collapse",
      minWidth: isMobile ? "600px" : "750px"
    },
    thPhoto: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      width: isMobile ? "8%" : "10%"
    },
    thName: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "left", 
      background: "#f8fafc", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      width: isMobile ? "25%" : "30%"
    },
    thAdmission: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      width: isMobile ? "15%" : "15%"
    },
    thStatus: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      width: isMobile ? "35%" : "30%"
    },
    thAction: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      width: isMobile ? "17%" : "15%"
    },
    tableRow: { 
      transition: "background 0.2s" 
    },
    tdPhoto: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdName: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "left", 
      borderBottom: "1px solid #f1f5f9",
      fontWeight: "500"
    },
    tdAdmission: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdStatus: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9" 
    },
    tdAction: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      borderBottom: "1px solid #f1f5f9" 
    },
    
    avatar: { width: isMobile ? "36px" : "44px", height: isMobile ? "36px" : "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" },
    avatarPlaceholder: { 
      width: isMobile ? "36px" : "44px", 
      height: isMobile ? "36px" : "44px", 
      borderRadius: "50%", 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
      display: "inline-flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontSize: isMobile ? "18px" : "22px", 
      color: "white"
    },
    admissionBadge: {
      display: "inline-block",
      padding: isMobile ? "2px 8px" : "4px 12px",
      borderRadius: "20px",
      background: "#f1f5f9",
      color: "#475569",
      fontSize: isMobile ? "10px" : "12px",
      fontWeight: "500",
      fontFamily: "monospace"
    },
    savedBadge: { 
      display: "inline-block", 
      marginLeft: "8px", 
      padding: "2px 8px", 
      borderRadius: "12px", 
      fontSize: "9px", 
      background: "#dcfce7", 
      color: "#166534", 
      fontWeight: "500"
    },
    teacherBadge: {
      marginLeft: "8px",
      padding: "2px 8px",
      background: "#e0f2fe",
      color: "#0369a1",
      borderRadius: "10px",
      fontSize: "10px",
      fontWeight: "500",
      display: "inline-block"
    },
    
    statusToggle: { display: "flex", gap: isMobile ? "6px" : "10px", justifyContent: "center", flexWrap: "wrap" },
    statusBtn: { 
      padding: isMobile ? "4px 10px" : "6px 14px", 
      borderRadius: "30px", 
      border: "none", 
      cursor: "pointer", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "600",
      transition: "all 0.2s"
    },
    statusPresent: { background: "#f1f5f9", color: "#475569" },
    statusPresentActive: { background: "#22c55e", color: "white", boxShadow: "0 2px 8px rgba(34,197,94,0.3)" },
    statusAbsent: { background: "#f1f5f9", color: "#475569" },
    statusAbsentActive: { background: "#ef4444", color: "white", boxShadow: "0 2px 8px rgba(239,68,68,0.3)" },
    
    editBtn: {
      padding: isMobile ? "4px 12px" : "6px 16px",
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      color: "white",
      border: "none",
      borderRadius: "30px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: isMobile ? "10px" : "12px",
      transition: "all 0.2s",
      minWidth: isMobile ? "70px" : "90px"
    },
    saveBtn: {
      padding: isMobile ? "4px 12px" : "6px 16px",
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      color: "white",
      border: "none",
      borderRadius: "30px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: isMobile ? "10px" : "12px",
      transition: "all 0.2s",
      minWidth: isMobile ? "70px" : "90px"
    },
    
    emptyState: { 
      textAlign: "center", 
      padding: isMobile ? "40px 20px" : "60px 20px", 
      background: "white", 
      borderRadius: "24px", 
      border: "1px solid #e2e8f0" 
    },
    emptyIcon: { fontSize: isMobile ? "48px" : "64px", marginBottom: "16px", opacity: 0.6 },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: "16px",
    },
    spinner: {
      width: "44px",
      height: "44px",
      border: "3px solid #e2e8f0",
      borderTopColor: "#22c55e",
      borderRadius: "50%",
      animation: "spin 0.9s linear infinite",
    },
  };

  if (loading && students.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📅 Daily Attendance</h2>
        <p style={styles.subtitle}>Mark attendance for your students</p>
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
          <label style={styles.label}>Date</label>
          <input
            type="date"
            style={styles.input}
            value={attendanceDate}
            onChange={e => setAttendanceDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* CONFIRMATION SECTION */}
      {selectedCourse && attendanceDate && !isConfirmed && (
        <div style={styles.confirmSection}>
          <span style={styles.confirmText}>
            📌 Selected: {courses.find(c => c.id == selectedCourse)?.name} | {formatDate(attendanceDate)}
          </span>
          <button style={styles.confirmBtn} onClick={handleConfirm}>
            ✅ Confirm & Load Attendance
          </button>
        </div>
      )}

      {isConfirmed && selectedCourse && students.length > 0 && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👨‍🎓</span>
            <div>
              <div style={styles.statLabel}>Total Students</div>
              <div style={styles.statValue}>{stats.total}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <div>
              <div style={styles.statLabel}>Present</div>
              <div style={{...styles.statValue, color: "#22c55e"}}>{stats.present}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>❌</span>
            <div>
              <div style={styles.statLabel}>Absent</div>
              <div style={{...styles.statValue, color: "#ef4444"}}>{stats.absent}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📊</span>
            <div>
              <div style={styles.statLabel}>Attendance Rate</div>
              <div style={{...styles.statValue, color: presentPercentageColor}}>{stats.presentPercentage}%</div>
            </div>
          </div>
        </div>
      )}

      {isConfirmed && selectedCourse && students.length > 0 ? (
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h3 style={{margin: 0, fontSize: isMobile ? "14px" : "16px"}}>📋 Attendance for {formatDate(attendanceDate)}</h3>
            </div>
            <button 
              className="save-all-btn"
              style={styles.submitBtn} 
              onClick={handleSaveAllAttendance}
              disabled={loading}
            >
              {loading ? "⏳ Saving..." : "💾 Save All Attendance"}
            </button>
          </div>
          
          <div style={styles.tableWrapper}>
            <table className="attendance-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thPhoto}>Photo</th>
                  <th style={styles.thName}>Student Name</th>
                  <th style={styles.thAdmission}>Admission No</th>
                  <th style={styles.thStatus}>Status</th>
                  <th style={styles.thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isPresent = attendanceRecords[student.id] === true;
                  const existing = existingAttendance[student.id];
                  const isSaving = savingStudent === student.id;
                  const isAlreadySaved = existing !== undefined;
                  const teacherName = existing?.teacher_name; // Get teacher name from API
                  
                  return (
                    <tr key={student.id} style={styles.tableRow}>
                      <td style={styles.tdPhoto}>
                        {student.image_url ? (
                          <img src={student.image_url} style={styles.avatar} alt={student.name} />
                        ) : (
                          <div style={styles.avatarPlaceholder}>🎓</div>
                        )}
                      </td>
                      <td style={styles.tdName}>
                        <strong>{student.name}</strong>
                        {teacherName && (
                          <span style={styles.teacherBadge}>
                            🧑‍🏫 {teacherName}
                          </span>
                        )}
                        {isAlreadySaved && (
                          <span style={styles.savedBadge}>
                            ✓ Saved
                          </span>
                        )}
                      </td>
                      <td style={styles.tdAdmission}>
                        <span style={styles.admissionBadge}>{student.admission_no}</span>
                      </td>
                      <td style={styles.tdStatus}>
                        <div style={styles.statusToggle}>
                          <button
                            className="status-btn"
                            style={{
                              ...styles.statusBtn,
                              ...styles.statusPresent,
                              ...(isPresent ? styles.statusPresentActive : {})
                            }}
                            onClick={() => handleAttendanceChange(student.id, "present")}
                          >
                            ✅ Present
                          </button>
                          <button
                            className="status-btn"
                            style={{
                              ...styles.statusBtn,
                              ...styles.statusAbsent,
                              ...(!isPresent ? styles.statusAbsentActive : {})
                            }}
                            onClick={() => handleAttendanceChange(student.id, "absent")}
                          >
                            ❌ Absent
                          </button>
                        </div>
                      </td>
                      <td style={styles.tdAction}>
                        {isAlreadySaved ? (
                          <button
                            className="single-save-btn"
                            style={{
                              ...styles.editBtn,
                              opacity: isSaving ? 0.7 : 1,
                              cursor: isSaving ? "wait" : "pointer"
                            }}
                            onClick={() => handleSaveSingleStudent(student.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? "⏳" : "✏️"}
                            {!isMobile && (isSaving ? " Updating..." : " Update")}
                          </button>
                        ) : (
                          <button
                            className="single-save-btn"
                            style={{
                              ...styles.saveBtn,
                              opacity: isSaving ? 0.7 : 1,
                              cursor: isSaving ? "wait" : "pointer"
                            }}
                            onClick={() => handleSaveSingleStudent(student.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? "⏳" : "💾"}
                            {!isMobile && (isSaving ? " Saving..." : " Save")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : isConfirmed && selectedCourse && students.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No Students Found</h3>
          <p>No students enrolled in this class yet.</p>
        </div>
      ) : null}
    </div>
  );
}

export default TeacherAttendance;