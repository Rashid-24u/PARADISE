import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api/";

function TeacherReports() {
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [assignedCourse, setAssignedCourse] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentExamDetails, setStudentExamDetails] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getGradeObject = (percentage) => {
    if (percentage === null || percentage === undefined) return { grade: "-", color: "#94a3b8", label: "No Data", bg: "#f1f5f9" };
    const num = parseFloat(percentage);
    if (num >= 90) return { grade: "A+", color: "#10b981", label: "Excellent", bg: "#10b98115" };
    if (num >= 80) return { grade: "A", color: "#22c55e", label: "Very Good", bg: "#22c55e15" };
    if (num >= 70) return { grade: "B+", color: "#f59e0b", label: "Good", bg: "#f59e0b15" };
    if (num >= 60) return { grade: "B", color: "#f97316", label: "Satisfactory", bg: "#f9731615" };
    if (num >= 50) return { grade: "C+", color: "#ef4444", label: "Pass", bg: "#ef444415" };
    if (num >= 40) return { grade: "C", color: "#dc2626", label: "Needs Improvement", bg: "#dc262615" };
    return { grade: "D", color: "#991b1b", label: "Poor", bg: "#991b1b15" };
  };

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
    }
    
    fetchCourses();
    
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .premium-table tr:hover {
        background: #f8fafc !important;
        transition: background 0.2s ease;
      }
      .print-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26,71,42,0.3);
        transition: all 0.2s;
      }
      .view-details-btn:hover {
        transform: translateY(-1px);
        transition: all 0.2s;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const fetchCourses = () => {
    axios.get(`${API}courses/`)
      .then(res => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Error fetching courses:", err));
  };

  const fetchTeacherData = async (teacherId) => {
    try {
      const res = await axios.get(`${API}teachers/${teacherId}/`);
      const teacherData = res.data;
      setTeacher(teacherData);
      
      if (teacherData.course) {
        setAssignedCourse(teacherData.course);
        setSelectedCourse(String(teacherData.course));
      }
    } catch (error) {
      console.error("Failed to load teacher:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchStudents = (courseId) => {
    if (!courseId) return;
    setLoadingAll(true);
    axios.get(`${API}students/?course=${courseId}`)
      .then(res => {
        const studentsList = Array.isArray(res.data) ? res.data : [];
        setStudents(studentsList);
        fetchAllStudentsReport(studentsList);
      })
      .catch(err => {
        console.error("Error fetching students:", err);
        setLoadingAll(false);
        toast.error("Failed to load students");
      });
  };

  const fetchStudentExamDetails = async (studentId) => {
    if (studentExamDetails[studentId]) return;
    
    try {
      const res = await axios.get(`${API}marks/?student=${studentId}`);
      const marksData = Array.isArray(res.data) ? res.data : [];
      
      const examGroups = {};
      marksData.forEach(mark => {
        if (!examGroups[mark.exam_type]) {
          examGroups[mark.exam_type] = [];
        }
        examGroups[mark.exam_type].push(mark);
      });
      
      const examResults = {};
      Object.keys(examGroups).forEach(examType => {
        const marks = examGroups[examType];
        let totalMarks = 0;
        let totalMaxMarks = 0;
        
        marks.forEach(m => {
          totalMarks += m.marks;
          totalMaxMarks += m.max_marks;
        });
        
        const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
        examResults[examType] = {
          marks: marks,
          total_marks: totalMarks,
          total_max_marks: totalMaxMarks,
          percentage: percentage.toFixed(1),
          grade: getGradeObject(percentage).grade,
          color: getGradeObject(percentage).color
        };
      });
      
      setStudentExamDetails(prev => ({
        ...prev,
        [studentId]: examResults
      }));
    } catch (error) {
      console.error("Error fetching exam details:", error);
      setStudentExamDetails(prev => ({
        ...prev,
        [studentId]: {}
      }));
    }
  };

  const handleViewDetails = async (student) => {
    setExpandedStudent(student);
    await fetchStudentExamDetails(student.id);
  };

  const fetchAllStudentsReport = async (studentsList) => {
    setLoadingAll(true);
    const reportData = [];
    
    for (const student of studentsList) {
      try {
        const [attRes, markRes] = await Promise.all([
          axios.get(`${API}attendance/?student=${student.id}`),
          axios.get(`${API}marks/?student=${student.id}`),
        ]);
        
        let totalDays = 0;
        let presentDays = 0;
        
        const attendanceData = Array.isArray(attRes.data) ? attRes.data : [];
        attendanceData.forEach(a => {
          totalDays++;
          if (a.status === true || a.status === 1) {
            presentDays++;
          }
        });
        
        const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";
        
        let examCount = 0;
        let totalPercentage = 0;
        
        const marksData = Array.isArray(markRes.data) ? markRes.data : [];
        marksData.forEach(m => {
          const marksObtained = Number(m.marks) || 0;
          const maxMarks = Number(m.max_marks) || 100;
          examCount++;
          const examPercent = (marksObtained / maxMarks) * 100;
          totalPercentage += examPercent;
        });
        
        const overallPercent = examCount > 0 ? (totalPercentage / examCount).toFixed(1) : null;
        
        const getGradeForPercent = (p) => {
          if (p === null) return "-";
          const num = parseFloat(p);
          if (num >= 90) return "A+";
          if (num >= 80) return "A";
          if (num >= 70) return "B+";
          if (num >= 60) return "B";
          if (num >= 50) return "C+";
          if (num >= 40) return "C";
          return "D";
        };
        
        reportData.push({
          id: student.id,
          name: student.name,
          admission_no: student.admission_no,
          course_name: student.course_name,
          image_url: student.image_url,
          parent_name: student.parent_name,
          phone: student.phone,
          email: student.email,
          attendance_percent: attendancePercent,
          attendance_days: `${presentDays}/${totalDays}`,
          marks_percent: overallPercent,
          grade: getGradeForPercent(overallPercent),
          hasMarks: examCount > 0,
          examCount: examCount,
          subjects: student.subjects,
          address: student.address,
          dob: student.dob,
          blood_group: student.blood_group,
          gender: student.gender
        });
      } catch (error) {
        console.error("Error fetching student report:", error);
      }
    }
    
    setAllStudentsData(reportData);
    setLoadingAll(false);
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents(selectedCourse);
    }
  }, [selectedCourse]);

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    setAllStudentsData([]);
    setStudents([]);
    setExpandedStudent(null);
    setStudentExamDetails({});
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const courseName = courses.find(c => c.id == selectedCourse)?.name || "All Students";
    const currentDate = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const totalStudents = allStudentsData.length;
    const avgAttendance = totalStudents > 0 
      ? (allStudentsData.reduce((sum, s) => sum + parseFloat(s.attendance_percent), 0) / totalStudents).toFixed(1) 
      : 0;
    const studentsWithMarks = allStudentsData.filter(s => s.hasMarks).length;
    const avgMarks = studentsWithMarks > 0 
      ? (allStudentsData.filter(s => s.hasMarks).reduce((sum, s) => sum + parseFloat(s.marks_percent), 0) / studentsWithMarks).toFixed(1)
      : 0;
    const passCount = allStudentsData.filter(s => s.marks_percent !== null && parseFloat(s.marks_percent) >= 40).length;
    const failCount = allStudentsData.filter(s => s.marks_percent !== null && parseFloat(s.marks_percent) < 40).length;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Class Report - ${courseName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: white; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px; }
            .school-name { font-size: 28px; font-weight: bold; color: #1a472a; margin-bottom: 5px; }
            .school-address { font-size: 12px; color: #666; }
            .report-title { font-size: 20px; margin-top: 10px; color: #1a472a; font-weight: 600; }
            .report-date { font-size: 12px; color: #666; margin-top: 8px; }
            .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 25px 0; }
            .stat-card { background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
            .stat-value { font-size: 28px; font-weight: 800; color: #1a472a; }
            .stat-label { font-size: 12px; color: #64748b; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th { background: #1a472a; color: white; padding: 14px 12px; text-align: center; font-size: 13px; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; }
            td:first-child { text-align: center; }
            td:nth-child(2) { text-align: left; }
            .student-photo { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
            .photo-placeholder { width: 45px; height: 45px; border-radius: 50%; background: #1a472a; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
            .grade-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; color: white; }
            .attendance-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">🏫 PARADISE ISLAMIC PRE-SCHOOL</div>
            <div class="school-address">Pullur, Tirur - 676102 | Quality Education with Islamic Values</div>
            <div class="report-title">CLASS PERFORMANCE REPORT</div>
            <div class="report-date">Class: ${courseName} | Generated on: ${currentDate}</div>
          </div>
          
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">${totalStudents}</div>
              <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${avgAttendance}%</div>
              <div class="stat-label">Average Attendance</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${avgMarks}%</div>
              <div class="stat-label">Average Marks</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${passCount}</div>
              <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${failCount}</div>
              <div class="stat-label">Failed</div>
            </div>
          </div>
          
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="width: 8%">Photo</th>
                <th style="width: 27%">Student Name</th>
                <th style="width: 15%">Admission No</th>
                <th style="width: 18%">Attendance</th>
                <th style="width: 18%">Marks %</th>
                <th style="width: 14%">Grade</th>
              </tr>
            </thead>
            <tbody>
              ${allStudentsData.map(s => {
                const gradeColor = s.grade === "-" ? "#94a3b8" : getGradeObject(s.marks_percent).color;
                const attendanceColor = s.attendance_percent >= 75 ? "#10b981" : s.attendance_percent >= 50 ? "#f59e0b" : "#ef4444";
                return `
                  <tr>
                    <td style="text-align:center;">${s.image_url ? `<img src="${s.image_url}" class="student-photo" />` : `<div class="photo-placeholder">🎓</div>`}</td>
                    <td style="text-align:left"><strong>${s.name}</strong></td>
                    <td style="text-align:center;">${s.admission_no}</td>
                    <td style="text-align:center;"><span class="attendance-badge" style="background: ${attendanceColor}15; color: ${attendanceColor}">${s.attendance_percent}%</span><br><small>${s.attendance_days}</small></td>
                    <td style="text-align:center;">${s.marks_percent !== null ? `${s.marks_percent}%` : "—"}</td>
                    <td style="text-align:center;"><span class="grade-badge" style="background: ${gradeColor}">${s.grade}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is a computer-generated report. Valid with authorized signature.</p>
            <p>Paradise Islamic Pre-School | Pullur, Tirur - 676102</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const styles = {
    container: { 
      padding: isMobile ? "16px" : "24px", 
      maxWidth: "1400px", 
      margin: "0 auto", 
      background: "#f8fafc", 
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    header: { marginBottom: isMobile ? "20px" : "28px", textAlign: "center" },
    title: { 
      fontSize: isMobile ? "24px" : "32px", 
      fontWeight: "700", 
      margin: "0 0 8px 0", 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
    
    selectorCard: { 
      background: "white", 
      borderRadius: "24px", 
      border: "1px solid #e2e8f0", 
      padding: isMobile ? "20px" : "24px", 
      marginBottom: "24px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
    },
    selectorContent: { display: "flex", gap: "24px", flexWrap: "wrap" },
    selectorLeft: { flex: 1, minWidth: isMobile ? "100%" : "280px" },
    label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" },
    select: { 
      width: "100%", 
      padding: "12px 16px", 
      borderRadius: "12px", 
      border: "1px solid #e2e8f0", 
      fontSize: "14px", 
      background: "white", 
      cursor: "pointer",
      transition: "all 0.2s"
    },
    hintText: { fontSize: "12px", color: "#22c55e", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" },
    
    summaryTableCard: { 
      background: "white", 
      borderRadius: "24px", 
      border: "1px solid #e2e8f0", 
      overflow: "hidden", 
      marginBottom: "24px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      animation: "fadeIn 0.3s ease"
    },
    summaryTableHeader: { 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: isMobile ? "16px 20px" : "20px 24px", 
      borderBottom: "2px solid #e2e8f0",
      background: "#fafcfc",
      flexWrap: "wrap",
      gap: "16px"
    },
    tableSubtitle: { margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" },
    printBtn: { 
      padding: isMobile ? "8px 16px" : "10px 24px", 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
      color: "white", 
      border: "none", 
      borderRadius: "40px", 
      cursor: "pointer", 
      fontSize: isMobile ? "12px" : "13px", 
      fontWeight: "600",
      transition: "all 0.2s"
    },
    
    summaryStatsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: isMobile ? "12px" : "16px",
      padding: isMobile ? "16px 20px" : "20px 24px",
      borderBottom: "1px solid #e2e8f0",
      background: "#ffffff"
    },
    statSummaryCard: {
      background: "#f8fafc",
      borderRadius: "16px",
      padding: isMobile ? "12px" : "16px",
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "8px" : "12px",
      border: "1px solid #e2e8f0"
    },
    statSummaryIcon: {
      fontSize: isMobile ? "28px" : "32px",
      width: isMobile ? "40px" : "48px",
      height: isMobile ? "40px" : "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
      borderRadius: "12px"
    },
    statSummaryValue: {
      fontSize: isMobile ? "20px" : "24px",
      fontWeight: "700",
      color: "#1e293b"
    },
    statSummaryLabel: {
      fontSize: "11px",
      color: "#64748b",
      marginTop: "2px"
    },
    
    loadingSmall: { 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: isMobile ? "40px" : "60px", 
      gap: "12px",
      color: "#94a3b8"
    },
    spinnerSmall: { 
      width: "32px", 
      height: "32px", 
      border: "3px solid #e2e8f0", 
      borderTopColor: "#1a472a", 
      borderRadius: "50%", 
      animation: "spin 0.8s linear infinite" 
    },
    
    smallAvatar: { 
      width: isMobile ? "36px" : "44px", 
      height: isMobile ? "36px" : "44px", 
      borderRadius: "50%", 
      objectFit: "cover", 
      border: "2px solid #e2e8f0" 
    },
    smallAvatarPlaceholder: { 
      width: isMobile ? "36px" : "44px", 
      height: isMobile ? "36px" : "44px", 
      borderRadius: "50%", 
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      fontSize: isMobile ? "18px" : "22px", 
      color: "white",
      margin: "0 auto"
    },
    percentBadge: { 
      display: "inline-block", 
      padding: isMobile ? "3px 8px" : "4px 12px", 
      borderRadius: "20px", 
      fontSize: isMobile ? "10px" : "12px", 
      fontWeight: "600" 
    },
    gradeBadgeSmall: { 
      display: "inline-block", 
      padding: isMobile ? "3px 8px" : "4px 12px", 
      borderRadius: "20px", 
      fontSize: isMobile ? "10px" : "11px", 
      fontWeight: "600", 
      color: "white" 
    },
    
    tableWrapper: { overflowX: "auto" },
    premiumTable: { 
      width: "100%", 
      borderCollapse: "collapse",
      minWidth: isMobile ? "500px" : "800px"
    },
    thCenter: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "center", 
      background: "#f8fafc", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    thLeft: { 
      padding: isMobile ? "10px 8px" : "14px 16px", 
      textAlign: "left", 
      background: "#f8fafc", 
      fontSize: isMobile ? "11px" : "12px", 
      fontWeight: "600", 
      color: "#475569", 
      borderBottom: "2px solid #e2e8f0",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    tableRow: { 
      transition: "background 0.2s" 
    },
    tdCenter: { 
      textAlign: "center",
      padding: isMobile ? "10px 8px" : "14px 16px",
      borderBottom: "1px solid #f1f5f9"
    },
    tdLeft: { 
      textAlign: "left",
      padding: isMobile ? "10px 8px" : "14px 16px",
      borderBottom: "1px solid #f1f5f9"
    },
    tdName: { 
      textAlign: "left", 
      fontWeight: "500",
      padding: isMobile ? "10px 8px" : "14px 16px",
      borderBottom: "1px solid #f1f5f9"
    },
    viewDetailsBtn: {
      marginTop: "4px",
      padding: "4px 8px",
      background: "#f1f5f9",
      border: "none",
      borderRadius: "6px",
      fontSize: "10px",
      cursor: "pointer",
      color: "#1a472a",
      fontWeight: "500",
      transition: "all 0.2s"
    },
    
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px"
    },
    modalContent: {
      background: "white",
      borderRadius: "28px",
      maxWidth: isMobile ? "95%" : "800px",
      width: "100%",
      maxHeight: "85vh",
      overflowY: "auto",
      animation: "slideIn 0.3s ease"
    },
    modalHeader: {
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
      padding: isMobile ? "24px" : "28px",
      textAlign: "center",
      borderTopLeftRadius: "28px",
      borderTopRightRadius: "28px"
    },
    modalAvatar: {
      width: isMobile ? "80px" : "100px",
      height: isMobile ? "80px" : "100px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "3px solid #d4af37",
      marginBottom: "12px"
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
      margin: "0 auto 12px auto"
    },
    modalName: {
      fontSize: isMobile ? "22px" : "26px",
      fontWeight: "700",
      color: "white",
      margin: "0 0 8px 0"
    },
    modalAdmission: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.9)",
      margin: "0 0 4px 0"
    },
    modalCourse: {
      display: "inline-block",
      background: "rgba(255,255,255,0.2)",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      color: "white"
    },
    modalBody: {
      padding: isMobile ? "20px" : "24px"
    },
    modalGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: "12px",
      marginBottom: "20px"
    },
    modalInfoCard: {
      background: "#f8fafc",
      padding: "12px",
      borderRadius: "12px"
    },
    modalLabel: {
      fontSize: "11px",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px"
    },
    modalValue: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#1e293b"
    },
    
    examSection: {
      marginTop: "20px",
      padding: "16px",
      background: "#f8fafc",
      borderRadius: "16px"
    },
    examTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a472a",
      marginBottom: "16px",
      paddingBottom: "8px",
      borderBottom: "2px solid #e2e8f0"
    },
    examCard: {
      background: "white",
      borderRadius: "12px",
      padding: "12px",
      marginBottom: "12px",
      border: "1px solid #e2e8f0"
    },
    examHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      flexWrap: "wrap",
      gap: "8px"
    },
    examType: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#1a472a"
    },
    examTotal: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#3b82f6"
    },
    subjectRow: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gap: "8px",
      padding: "8px",
      borderBottom: "1px solid #e2e8f0"
    },
    subjectHeader: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#64748b",
      textTransform: "uppercase",
      padding: "8px",
      background: "#f1f5f9",
      borderRadius: "8px",
      marginBottom: "4px"
    },
    subjectName: {
      fontSize: "13px",
      fontWeight: "500",
      color: "#1e293b"
    },
    subjectMarks: {
      fontSize: "13px",
      color: "#475569",
      textAlign: "center"
    },
    subjectPercentage: {
      fontSize: "13px",
      fontWeight: "600",
      textAlign: "center"
    },
    noMarks: {
      textAlign: "center",
      padding: "20px",
      color: "#94a3b8",
      fontSize: "13px"
    },
    
    modalClose: {
      padding: "10px 24px",
      background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
      color: "white",
      border: "none",
      borderRadius: "40px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      width: "100%"
    },
    modalCloseBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      background: "white",
      border: "none",
      width: 32,
      height: 32,
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    
    emptyState: { 
      textAlign: "center", 
      padding: isMobile ? "40px 20px" : "60px 20px", 
      background: "white", 
      borderRadius: "24px", 
      border: "1px solid #e2e8f0" 
    },
    emptyIcon: { fontSize: isMobile ? "48px" : "64px", marginBottom: "16px", opacity: 0.6 },
  };

  const examDetails = expandedStudent ? studentExamDetails[expandedStudent.id] : null;

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Class Performance Report</h1>
        <p style={styles.subtitle}>Complete academic performance and attendance summary</p>
      </div>

      <div style={styles.selectorCard}>
        <div style={styles.selectorContent}>
          <div style={styles.selectorLeft}>
            <label style={styles.label}>Select Class</label>
            <select 
              value={selectedCourse} 
              onChange={(e) => handleCourseChange(e.target.value)}
              style={styles.select}
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
        </div>
      </div>

      {selectedCourse && allStudentsData.length > 0 && (
        <div style={styles.summaryTableCard}>
          <div style={styles.summaryTableHeader}>
            <div>
              <h3 style={{margin: 0, fontSize: isMobile ? "16px" : "18px"}}>📋 Class Performance Summary</h3>
              <p style={styles.tableSubtitle}>{courses.find(c => c.id == selectedCourse)?.name} • {allStudentsData.length} students</p>
            </div>
            <button onClick={handlePrintReport} style={styles.printBtn} className="print-btn">
              🖨️ {isMobile ? "Print" : "Print Class Report"}
            </button>
          </div>
          
          {loadingAll ? (
            <div style={styles.loadingSmall}>
              <div style={styles.spinnerSmall}></div>
              <p>Loading student data...</p>
            </div>
          ) : (
            <>
              <div style={styles.summaryStatsGrid}>
                <div style={styles.statSummaryCard}>
                  <div style={styles.statSummaryIcon}>👨‍🎓</div>
                  <div>
                    <div style={styles.statSummaryValue}>{allStudentsData.length}</div>
                    <div style={styles.statSummaryLabel}>Total Students</div>
                  </div>
                </div>
                <div style={styles.statSummaryCard}>
                  <div style={styles.statSummaryIcon}>📊</div>
                  <div>
                    <div style={styles.statSummaryValue}>
                      {(allStudentsData.reduce((sum, s) => sum + parseFloat(s.attendance_percent), 0) / allStudentsData.length).toFixed(1)}%
                    </div>
                    <div style={styles.statSummaryLabel}>Average Attendance</div>
                  </div>
                </div>
                <div style={styles.statSummaryCard}>
                  <div style={styles.statSummaryIcon}>📝</div>
                  <div>
                    <div style={styles.statSummaryValue}>
                      {(allStudentsData.filter(s => s.hasMarks).reduce((sum, s) => sum + parseFloat(s.marks_percent), 0) / (allStudentsData.filter(s => s.hasMarks).length || 1)).toFixed(1)}%
                    </div>
                    <div style={styles.statSummaryLabel}>Average Marks</div>
                  </div>
                </div>
                <div style={styles.statSummaryCard}>
                  <div style={styles.statSummaryIcon}>✅</div>
                  <div>
                    <div style={styles.statSummaryValue}>
                      {allStudentsData.filter(s => s.marks_percent !== null && parseFloat(s.marks_percent) >= 40).length}
                    </div>
                    <div style={styles.statSummaryLabel}>Passed</div>
                  </div>
                </div>
              </div>
              
              <div style={styles.tableWrapper}>
                <table className="premium-table" style={styles.premiumTable}>
                  <thead>
                    <tr>
                      <th style={isMobile ? styles.thCenter : styles.thCenter}>Photo</th>
                      <th style={isMobile ? styles.thLeft : styles.thLeft}>Student</th>
                      <th style={isMobile ? styles.thCenter : styles.thCenter}>Admission</th>
                      <th style={isMobile ? styles.thCenter : styles.thCenter}>Attendance</th>
                      <th style={isMobile ? styles.thCenter : styles.thCenter}>Marks</th>
                      <th style={isMobile ? styles.thCenter : styles.thCenter}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudentsData.map((s) => {
                      const gradeColor = s.grade === "-" ? "#94a3b8" : getGradeObject(s.marks_percent).color;
                      const attendanceColor = s.attendance_percent >= 75 ? "#10b981" : s.attendance_percent >= 50 ? "#f59e0b" : "#ef4444";
                      return (
                        <tr key={s.id} style={styles.tableRow}>
                          <td style={styles.tdCenter}>
                            {s.image_url ? (
                              <img src={s.image_url} style={styles.smallAvatar} alt={s.name} />
                            ) : (
                              <div style={styles.smallAvatarPlaceholder}>🎓</div>
                            )}
                          </td>
                          <td style={styles.tdName}>
                            <div><strong>{s.name}</strong></div>
                            <button 
                              className="view-details-btn"
                              style={styles.viewDetailsBtn}
                              onClick={() => handleViewDetails(s)}
                            >
                              View Details →
                            </button>
                          </td>
                          <td style={styles.tdCenter}>{s.admission_no}</td>
                          <td style={styles.tdCenter}>
                            <span style={{...styles.percentBadge, background: `${attendanceColor}15`, color: attendanceColor}}>
                              {s.attendance_percent}%
                            </span>
                            <div style={{fontSize: "10px", color: "#64748b", marginTop: "2px"}}>
                              📅 {s.attendance_days}
                            </div>
                          </td>
                          <td style={styles.tdCenter}>
                            {s.marks_percent !== null ? (
                              <span style={{...styles.percentBadge, background: getGradeObject(s.marks_percent).bg, color: getGradeObject(s.marks_percent).color}}>
                                {s.marks_percent}%
                              </span>
                            ) : (
                              <span style={{color: "#94a3b8"}}>—</span>
                            )}
                          </td>
                          <td style={styles.tdCenter}>
                            <span style={{...styles.gradeBadgeSmall, background: gradeColor}}>{s.grade}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {selectedCourse && allStudentsData.length === 0 && !loadingAll && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No Students Found</h3>
          <p>No students are enrolled in this class yet.</p>
        </div>
      )}

      {expandedStudent && (
        <div style={styles.modalOverlay} onClick={() => setExpandedStudent(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalCloseBtn} onClick={() => setExpandedStudent(null)}>✕</button>
            
            <div style={styles.modalHeader}>
              {expandedStudent.image_url ? (
                <img src={expandedStudent.image_url} style={styles.modalAvatar} alt={expandedStudent.name} />
              ) : (
                <div style={styles.modalAvatarPlaceholder}>🎓</div>
              )}
              <h3 style={styles.modalName}>{expandedStudent.name}</h3>
              <p style={styles.modalAdmission}>Admission: {expandedStudent.admission_no}</p>
              <span style={styles.modalCourse}>{expandedStudent.course_name || "Not Assigned"}</span>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.modalGrid}>
                <div style={styles.modalInfoCard}>
                  <div style={styles.modalLabel}>📞 Phone</div>
                  <div style={styles.modalValue}>{expandedStudent.phone || "Not provided"}</div>
                </div>
                <div style={styles.modalInfoCard}>
                  <div style={styles.modalLabel}>📧 Email</div>
                  <div style={styles.modalValue}>{expandedStudent.email || "Not provided"}</div>
                </div>
                <div style={styles.modalInfoCard}>
                  <div style={styles.modalLabel}>👨‍👩 Parent</div>
                  <div style={styles.modalValue}>{expandedStudent.parent_name || "Not provided"}</div>
                </div>
                <div style={styles.modalInfoCard}>
                  <div style={styles.modalLabel}>📖 Subjects</div>
                  <div style={styles.modalValue}>{expandedStudent.subjects || "Not assigned"}</div>
                </div>
                <div style={styles.modalInfoCard}>
                  <div style={styles.modalLabel}>🎂 DOB</div>
                  <div style={styles.modalValue}>{expandedStudent.dob ? new Date(expandedStudent.dob).toLocaleDateString('en-IN') : "Not provided"}</div>
                </div>
                <div style={styles.modalInfoCard}>
                  <div style={styles.modalLabel}>🩸 Blood Group</div>
                  <div style={styles.modalValue}>{expandedStudent.blood_group || "Not provided"}</div>
                </div>
              </div>
              
              <div style={styles.modalInfoCard}>
                <div style={styles.modalLabel}>📍 Address</div>
                <div style={styles.modalValue}>{expandedStudent.address || "Not provided"}</div>
              </div>
              
              <div style={styles.examSection}>
                <div style={styles.examTitle}>📝 Exam Results</div>
                {examDetails && Object.keys(examDetails).length > 0 ? (
                  Object.keys(examDetails).map(examType => {
                    const exam = examDetails[examType];
                    return (
                      <div key={examType} style={styles.examCard}>
                        <div style={styles.examHeader}>
                          <span style={styles.examType}>{examType}</span>
                          <span style={styles.examTotal}>
                            Total: {exam.total_marks}/{exam.total_max_marks} ({exam.percentage}%)
                          </span>
                          <span style={{...styles.gradeBadgeSmall, background: exam.color}}>{exam.grade}</span>
                        </div>
                        <div>
                          <div style={styles.subjectHeader}>
                            <span>Subject</span>
                            <span style={{textAlign: "center"}}>Marks</span>
                            <span style={{textAlign: "center"}}>Percentage</span>
                          </div>
                          {exam.marks.map((mark, idx) => {
                            const subjPercent = (mark.marks / mark.max_marks) * 100;
                            const percentColor = subjPercent >= 75 ? "#10b981" : subjPercent >= 50 ? "#f59e0b" : "#ef4444";
                            return (
                              <div key={idx} style={styles.subjectRow}>
                                <span style={styles.subjectName}>{mark.subject}</span>
                                <span style={styles.subjectMarks}>{mark.marks}/{mark.max_marks}</span>
                                <span style={{...styles.subjectPercentage, color: percentColor}}>{subjPercent.toFixed(1)}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={styles.noMarks}>
                    <div>📭 No exam results available</div>
                    <div style={{fontSize: "11px", marginTop: "8px"}}>Marks have not been entered for this student yet.</div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{padding: "0 24px 24px 24px"}}>
              <button style={styles.modalClose} onClick={() => setExpandedStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherReports;