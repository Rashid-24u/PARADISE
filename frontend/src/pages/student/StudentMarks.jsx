import { useEffect, useState } from "react";
import axios from "axios";

function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    presentPeriods: 0,
    totalPeriods: 0,
    percentage: null,
  });
  const [filterExam, setFilterExam] = useState("");
  const [summary, setSummary] = useState({ 
    total: 0, 
    max: 0, 
    percentage: null,
    hasData: false,
    grade: { grade: "N/A", color: "#6b7280", label: "No Data" },
    result: "N/A",
    byExam: {},
    examCount: 0
  });

  const getGrade = (percentage) => {
    if (percentage === null || percentage === undefined) return { grade: "N/A", color: "#6b7280", label: "No Data" };
    const num = parseFloat(percentage);
    if (num >= 90) return { grade: "A+", color: "#10b981", label: "Excellent" };
    if (num >= 80) return { grade: "A", color: "#22c55e", label: "Very Good" };
    if (num >= 70) return { grade: "B+", color: "#f59e0b", label: "Good" };
    if (num >= 60) return { grade: "B", color: "#f97316", label: "Satisfactory" };
    if (num >= 50) return { grade: "C", color: "#ef4444", label: "Pass" };
    if (num >= 40) return { grade: "D", color: "#dc2626", label: "Needs Improvement" };
    return { grade: "F", color: "#991b1b", label: "Fail" };
  };

  const getResult = (percentage) => {
    if (percentage === null) return "N/A";
    return parseFloat(percentage) >= 40 ? "PASS" : "FAIL";
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    const stored = JSON.parse(localStorage.getItem("student"));
    if (!stored?.student_id) {
      setLoading(false);
      return;
    }

    const studentId = stored.student_id;
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/marks/?student=${studentId}`
      );
      
      // Safety fix: Ensure data is array
      const data = Array.isArray(res.data) ? res.data : [];
      setMarks(data);

      // Student details
      axios
        .get(`http://127.0.0.1:8000/api/students/${studentId}/`)
        .then((r) => setStudentInfo(r.data))
        .catch(() => {});

      // Attendance summary - Safety fix
      axios
        .get(`http://127.0.0.1:8000/api/attendance/?student=${studentId}`)
        .then((ar) => {
          const arr = Array.isArray(ar.data) ? ar.data : [];
          const present = arr.filter((a) => a.status === true).length;
          const total = arr.length;
          const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
          setAttendanceStats({
            presentPeriods: present,
            totalPeriods: total,
            percentage: pct,
          });
        })
        .catch(() => {});
      
      const hasMarksData = data.length > 0;
      
      if (!hasMarksData) {
        setSummary({
          total: 0,
          max: 0,
          percentage: null,
          hasData: false,
          grade: { grade: "N/A", color: "#6b7280", label: "No Data" },
          result: "N/A",
          byExam: {},
          examCount: 0
        });
        setLoading(false);
        return;
      }
      
      // Calculate summary
      let totalObtained = 0;
      let totalMax = 0;
      let totalPercentageSum = 0;
      const examGroups = {};

      data.forEach((m) => {
        const got = Number(m.marks) || 0;
        const mx = Number(m.max_marks) || 100;
        const examPercent = mx > 0 ? (got / mx) * 100 : 0;

        totalObtained += got;
        totalMax += mx;
        totalPercentageSum += examPercent;

        if (!examGroups[m.exam_type]) {
          examGroups[m.exam_type] = { obtained: 0, max: 0, subjects: [], totalPercent: 0, count: 0 };
        }
        examGroups[m.exam_type].obtained += got;
        examGroups[m.exam_type].max += mx;
        examGroups[m.exam_type].totalPercent += examPercent;
        examGroups[m.exam_type].count += 1;
        examGroups[m.exam_type].subjects.push(m);
      });

      // Calculate average percentage across all exams
      const overallPercentage = data.length > 0 ? totalPercentageSum / data.length : 0;
      const overallGrade = getGrade(overallPercentage);
      const result = getResult(overallPercentage);

      setSummary({
        total: totalObtained,
        max: totalMax,
        percentage: overallPercentage.toFixed(1),
        hasData: true,
        grade: overallGrade,
        result: result,
        byExam: examGroups,
        examCount: data.length
      });
    } catch (err) {
      setError("Failed to load marks data");
      setMarks([]); // Safety: set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredMarks = filterExam
    ? marks.filter((m) => String(m.exam_type).trim() === String(filterExam).trim())
    : marks;

  const examTypes = [...new Set(marks.map((m) => String(m.exam_type).trim()))];

  const calculateSubjectPercentage = (marks, maxMarks) => {
    const max = maxMarks || 100;
    const percentage = ((marks / max) * 100);
    // Fix: Cap at 100% to avoid overflow
    return Math.min(100, percentage).toFixed(1);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading marks...</p>
      </div>
    );
  }

  if (!summary.hasData && marks.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Marks & Results</h1>
          <p style={styles.subtitle}>Track your academic performance</p>
        </div>
        <div style={styles.emptyStateCard}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No Marks Available</h3>
          <p style={styles.emptyText}>No exam results have been published yet.</p>
          <p style={styles.emptyHint}>Check back after your exams are completed!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Marks & Results</h1>
        <p style={styles.subtitle}>Track your academic performance</p>
      </div>

      {/* Student Info Card */}
      {studentInfo && (
        <div style={styles.studentInfoCard}>
          <div style={styles.studentInfoLeft}>
            {studentInfo.image_url ? (
              <img src={studentInfo.image_url} style={styles.studentAvatar} alt={studentInfo.name} />
            ) : (
              <div style={styles.studentAvatarPlaceholder}>👨‍🎓</div>
            )}
            <div>
              <h3 style={styles.studentName}>{studentInfo.name}</h3>
              <p style={styles.studentDetails}>Admission: {studentInfo.admission_no} | Class: {studentInfo.course_name || "Not Assigned"}</p>
            </div>
          </div>
          <div style={styles.attendanceBadge}>
            <span>📅 Attendance: {attendanceStats.percentage}%</span>
            <span style={styles.attendanceDetail}>({attendanceStats.presentPeriods}/{attendanceStats.totalPeriods})</span>
          </div>
        </div>
      )}

      {/* Overall Result Card */}
      <div style={styles.overallCard}>
        <div style={styles.overallScore}>
          <div style={styles.scoreCircle}>
            <div style={styles.scoreCircleInner}>
              <span style={styles.scorePercent}>{summary.percentage || "0"}%</span>
            </div>
          </div>
          <div style={styles.scoreDetails}>
            <div style={styles.scoreTotal}>
              <span>📊 Total Marks : </span>
              <strong>{summary.total} / {summary.max}</strong>
            </div>
            <div style={styles.scoreGrade}>
              <span>🎓 Overall Grade : </span>
              <strong style={{...styles.gradeBadge, background: summary.grade?.color}}>
                {summary.grade?.grade}
              </strong>
            </div>
            <div style={styles.scoreResult}>
              <span>✅ Result : </span>
              <strong style={{color: summary.result === "PASS" ? "#10b981" : summary.result === "FAIL" ? "#ef4444" : "#94a3b8"}}>
                {summary.result}
              </strong>
            </div>
            <div style={styles.scoreExams}>
              <span>📝 Total Exams : </span>
              <strong>{summary.examCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Report Card Button */}
      <div style={styles.reportActions}>
        <button
          type="button"
          style={styles.reportBtn}
          disabled={!studentInfo || loading || filteredMarks.length === 0}
          onClick={() => {
            const student = studentInfo;
            if (!student) return;

            const win = window.open("", "_blank");
            if (!win) {
              window.alert("Popup blocked. Please allow pop-ups to download the report card.");
              return;
            }
            const gradeObj = summary?.grade || {};
            const gradeColor = gradeObj?.color || "#94a3b8";
            const gradeText = gradeObj?.grade || "—";

            const attendancePct = attendanceStats?.percentage;
            const attendanceLine = attendanceStats.totalPeriods === 0
              ? "No attendance data"
              : `${attendanceStats.presentPeriods} / ${attendanceStats.totalPeriods} periods (${attendancePct}%)`;

            const markRows = filteredMarks
              .map((m) => {
                const mx = m.max_marks || 100;
                let pct = mx > 0 ? ((Number(m.marks) / Number(mx)) * 100) : 0;
                pct = Math.min(100, pct); // Cap at 100%
                const g = getGrade(pct);
                return `
                  <tr>
                    <td style="text-align:left;padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;">${m.subject}</td>
                    <td style="text-align:center;padding:12px;border-bottom:1px solid #e2e8f0;">${m.exam_type}</td>
                    <td style="text-align:center;padding:12px;border-bottom:1px solid #e2e8f0;">${m.marks}</td>
                    <td style="text-align:center;padding:12px;border-bottom:1px solid #e2e8f0;">${mx}</td>
                    <td style="text-align:center;padding:12px;border-bottom:1px solid #e2e8f0;">${pct.toFixed(1)}%</td>
                    <td style="text-align:center;padding:12px;border-bottom:1px solid #e2e8f0;"><span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${g.color};color:white;font-weight:700;font-size:12px;">${g.grade}</span></td>
                  </tr>
                `;
              })
              .join("");

            const overallPct = summary?.percentage;
            const overallPctText = overallPct === null ? "—" : `${overallPct}%`;
            const resultText = summary?.result ?? "N/A";

            win.document.write(`
              <html>
                <head>
                  <title>Student Report Card - ${student.name}</title>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; background: white; color: #0f172a; }
                    .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #d4af37; }
                    .school { font-size: 28px; font-weight: 800; color: #1a472a; }
                    .addr { font-size: 12px; color: #6b7280; margin-top: 6px; }
                    .title { font-size: 20px; margin-top: 10px; font-weight: 700; color: #1a472a; }
                    .student-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 20px 0; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
                    .student-left { display: flex; gap: 16px; align-items: center; }
                    .student-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
                    .student-avatar-placeholder { width: 60px; height: 60px; border-radius: 50%; background: #1a472a; display: flex; align-items: center; justify-content: center; font-size: 30px; color: white; }
                    .student-name { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
                    .student-details { font-size: 12px; color: #64748b; }
                    .attendance-badge { background: #eef2ff; padding: 8px 16px; border-radius: 30px; font-size: 12px; font-weight: 600; color: #4f46e5; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #1a472a; color: white; padding: 12px; font-size: 13px; font-weight: 600; text-align: center; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; }
                    .overall-box { background: linear-gradient(135deg, #1a472a, #2e5c3a); border-radius: 16px; padding: 20px; color: white; margin: 20px 0; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
                    .overall-item { text-align: center; }
                    .overall-label { font-size: 12px; opacity: 0.8; margin-bottom: 4px; }
                    .overall-value { font-size: 24px; font-weight: 700; }
                    .grade-badge { display: inline-block; padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 700; color: white; }
                    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    @media print { body { padding: 15px; } }
                    @media (max-width: 768px) {
                      body { padding: 15px; }
                      .student-card { flex-direction: column; }
                      .overall-box { flex-direction: column; text-align: center; }
                      th, td { padding: 8px; font-size: 11px; }
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div class="school">🏫 PARADISE ISLAMIC PRE-SCHOOL</div>
                    <div class="addr">Pullur, Tirur - 676102 | Quality Education with Islamic Values</div>
                    <div class="title">STUDENT REPORT CARD</div>
                    <div style="font-size:12px;color:#6b7280;margin-top:6px;">Generated on: ${new Date().toLocaleString()}</div>
                  </div>

                  <div class="student-card">
                    <div class="student-left">
                      ${student.image_url ? `<img src="${student.image_url}" class="student-avatar" />` : `<div class="student-avatar-placeholder">👨‍🎓</div>`}
                      <div>
                        <div class="student-name">${student.name}</div>
                        <div class="student-details">Admission: ${student.admission_no} | Class: ${student.course_name || "—"}</div>
                        <div class="student-details">Phone: ${student.phone || "—"} | Parent: ${student.parent_name || "—"}</div>
                      </div>
                    </div>
                    <div class="attendance-badge">📅 Attendance: ${attendanceLine}</div>
                  </div>

                  <div class="overall-box">
                    <div class="overall-item">
                      <div class="overall-label">Overall Percentage</div>
                      <div class="overall-value">${overallPctText}</div>
                    </div>
                    <div class="overall-item">
                      <div class="overall-label">Overall Grade</div>
                      <div class="grade-badge" style="background:${gradeColor}">${gradeText}</div>
                    </div>
                    <div class="overall-item">
                      <div class="overall-label">Result</div>
                      <div class="overall-value" style="color:${resultText === "PASS" ? "#a3e635" : resultText === "FAIL" ? "#f87171" : "#94a3b8"}">${resultText}</div>
                    </div>
                    <div class="overall-item">
                      <div class="overall-label">Total Exams</div>
                      <div class="overall-value">${summary.examCount}</div>
                    </div>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Exam Type</th>
                        <th>Marks</th>
                        <th>Out Of</th>
                        <th>%</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${markRows}
                    </tbody>
                  </table>

                  <div class="footer">
                    This is a computer-generated report. Valid with authorized signature.
                    <div>Paradise Islamic Pre-School | Pullur, Tirur - 676102</div>
                  </div>
                </body>
              </html>
            `);

            win.document.close();
            win.focus();
            win.print();
          }}
        >
          🖨️ Download Report Card
        </button>
      </div>

      {/* Exam-wise Summary */}
      {Object.keys(summary.byExam).length > 0 && (
        <div style={styles.examSummary}>
          <h3 style={styles.sectionTitle}>📋 Exam-wise Performance</h3>
          <div style={styles.examGrid}>
            {Object.entries(summary.byExam)
              .filter(([exam]) => {
                if (!filterExam) return true;
                return String(exam).trim() === String(filterExam).trim();
              })
              .map(([exam, data]) => {
              const avgPercentage = data.count > 0 ? (data.totalPercent / data.count).toFixed(1) : 0;
              const examGrade = getGrade(avgPercentage);
              return (
                <div key={exam} style={styles.examCard}>
                  <div style={styles.examHeader}>
                    <span style={styles.examName}>{exam}</span>
                    <span style={{...styles.examPercent, color: examGrade.color}}>
                      {avgPercentage}%
                    </span>
                  </div>
                  <div style={styles.examProgress}>
                    <div style={{...styles.examFill, width: `${avgPercentage}%`, background: examGrade.color}}></div>
                  </div>
                  <div style={styles.examScore}>
                    📊 {data.obtained} / {data.max} total marks
                  </div>
                  <div style={styles.examSubjects}>
                    {data.subjects.length} subject(s) • Grade {examGrade.grade}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterLeft}>
          <label style={styles.filterLabel}>Filter by Exam:</label>
          <select 
            style={styles.filterSelect}
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
          >
            <option value="">All Exams</option>
            {examTypes.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <span style={styles.recordCount}>
          📚 {filteredMarks.length} subject(s) found
        </span>
      </div>

      {/* Marks Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Subject</th>
              <th style={styles.th}>Exam Type</th>
              <th style={styles.th}>Marks</th>
              <th style={styles.th}>Out Of</th>
              <th style={styles.th}>Percentage</th>
              <th style={styles.th}>Grade</th>
              </tr>
          </thead>
          <tbody>
            {filteredMarks.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyRow}>
                  <div style={styles.emptyIconSmall}>📭</div>
                  <p style={styles.emptyTextSmall}>
                    {filterExam
                      ? `No marks found for ${filterExam} exam.`
                      : "No marks records found."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredMarks.map((m, idx) => {
                const percent = calculateSubjectPercentage(m.marks, m.max_marks);
                const grade = getGrade(percent);
                return (
                  <tr key={m.id} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.subjectCell}>
                      <span style={styles.subjectIcon}>📘</span>
                      <span>{m.subject}</span>
                    </td>
                    <td style={styles.examCell}>
                      <span style={styles.examBadge}>{m.exam_type}</span>
                    </td>
                    <td style={styles.marksCell}>
                      <span style={styles.marksValue}>{m.marks}</span>
                    </td>
                    <td style={styles.maxCell}>{m.max_marks || 100}</td>
                    <td style={styles.percentCell}>
                      <div style={styles.percentWrapper}>
                        <span style={{color: grade.color, fontWeight: "600"}}>
                          {percent}%
                        </span>
                        <div style={styles.smallBar}>
                          <div style={{...styles.smallFill, width: `${percent}%`, background: grade.color}}></div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.gradeCell}>
                      <span style={{...styles.gradeChip, background: grade.color}}>
                        {grade.grade}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grade Scale Legend */}
      <div style={styles.legend}>
        <h4 style={styles.legendTitle}>📊 Grade Scale</h4>
        <div style={styles.legendGrid}>
          <div style={styles.legendItem}><span style={{background: "#10b981"}}>A+</span> 90-100% (Excellent)</div>
          <div style={styles.legendItem}><span style={{background: "#22c55e"}}>A</span> 80-89% (Very Good)</div>
          <div style={styles.legendItem}><span style={{background: "#f59e0b"}}>B+</span> 70-79% (Good)</div>
          <div style={styles.legendItem}><span style={{background: "#f97316"}}>B</span> 60-69% (Satisfactory)</div>
          <div style={styles.legendItem}><span style={{background: "#ef4444"}}>C</span> 50-59% (Pass)</div>
          <div style={styles.legendItem}><span style={{background: "#dc2626"}}>D</span> 40-49% (Needs Improvement)</div>
          <div style={styles.legendItem}><span style={{background: "#991b1b"}}>F</span> Below 40% (Fail)</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "24px",
    textAlign: "center",
  },
  title: {
    fontSize: "clamp(24px, 5vw, 32px)",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "#1a472a",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
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
  studentInfoCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  studentInfoLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  studentAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #d4af37",
  },
  studentAvatarPlaceholder: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    color: "white",
  },
  studentName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  studentDetails: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  attendanceBadge: {
    background: "#eef2ff",
    padding: "8px 16px",
    borderRadius: "30px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#4f46e5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  attendanceDetail: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "2px",
  },
  overallCard: {
    background: "linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%)",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "24px",
  },
  overallScore: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  scoreCircle: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.1)",
  },
  scoreCircleInner: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  scorePercent: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a472a",
  },
  scoreDetails: {
    color: "white",
  },
  scoreTotal: {
    fontSize: "16px",
    marginBottom: "12px",
    span: { color: "#cbd5e1", marginRight: "12px" },
  },
  scoreGrade: {
    fontSize: "16px",
    marginBottom: "12px",
    span: { color: "#cbd5e1", marginRight: "12px" },
  },
  scoreResult: {
    fontSize: "16px",
    marginBottom: "12px",
    span: { color: "#cbd5e1", marginRight: "12px" },
  },
  scoreExams: {
    fontSize: "14px",
    span: { color: "#cbd5e1", marginRight: "12px" },
  },
  gradeBadge: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "600",
    marginLeft: "8px",
    color: "white",
  },
  reportActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "24px",
  },
  reportBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(26,71,42,0.3)",
    transition: "all 0.2s",
  },
  examSummary: {
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#1e293b",
  },
  examGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  examCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  examHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  examName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  examPercent: {
    fontSize: "14px",
    fontWeight: "700",
  },
  examProgress: {
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "6px",
    marginBottom: "10px",
    overflow: "hidden",
  },
  examFill: {
    height: "100%",
    borderRadius: "6px",
  },
  examScore: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px",
  },
  examSubjects: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  filterLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
  },
  filterSelect: {
    padding: "8px 16px",
    borderRadius: "40px",
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  },
  recordCount: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "6px 14px",
    borderRadius: "20px",
  },
  tableContainer: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  subjectCell: {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
    fontSize: "13px",
    color: "#1e293b",
    borderBottom: "1px solid #f1f5f9",
  },
  subjectIcon: {
    fontSize: "16px",
  },
  examCell: {
    padding: "14px 16px",
    textAlign: "center",
    borderBottom: "1px solid #f1f5f9",
  },
  examBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
    background: "#f1f5f9",
    color: "#475569",
  },
  marksCell: {
    padding: "14px 16px",
    textAlign: "center",
    fontWeight: "600",
    color: "#1e293b",
    borderBottom: "1px solid #f1f5f9",
  },
  marksValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1a472a",
  },
  maxCell: {
    padding: "14px 16px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
    borderBottom: "1px solid #f1f5f9",
  },
  percentCell: {
    padding: "14px 16px",
    textAlign: "center",
    borderBottom: "1px solid #f1f5f9",
  },
  percentWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  smallBar: {
    width: "70px",
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  smallFill: {
    height: "100%",
    borderRadius: "4px",
  },
  gradeCell: {
    padding: "14px 16px",
    textAlign: "center",
    borderBottom: "1px solid #f1f5f9",
  },
  gradeChip: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
  },
  rowEven: {
    background: "white",
  },
  rowOdd: {
    background: "#fafbfc",
  },
  emptyRow: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIconSmall: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  emptyTextSmall: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  emptyStateCard: {
    textAlign: "center",
    padding: "60px 40px",
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "16px",
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "4px",
  },
  emptyHint: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  legend: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },
  legendTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#1e293b",
  },
  legendGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#475569",
    "& span": {
      display: "inline-block",
      width: "36px",
      padding: "2px 6px",
      borderRadius: "12px",
      color: "white",
      fontSize: "11px",
      fontWeight: "600",
      textAlign: "center",
    },
  },
};

// Add animation style
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .overall-score {
        flex-direction: column;
        text-align: center;
      }
      .score-details {
        text-align: center;
      }
      .student-info-card {
        flex-direction: column;
        text-align: center;
      }
      .student-info-left {
        flex-direction: column;
      }
      .filter-bar {
        flex-direction: column;
      }
      .filter-left {
        width: 100%;
      }
      .filter-select {
        flex: 1;
      }
      .exam-grid {
        grid-template-columns: 1fr !important;
      }
      .legend-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      th, td {
        padding: 10px 8px !important;
        font-size: 11px !important;
      }
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 12px !important;
      }
      .overall-card {
        padding: 20px !important;
      }
      .score-circle {
        width: 100px !important;
        height: 100px !important;
      }
      .score-circle-inner {
        width: 80px !important;
        height: 80px !important;
      }
      .score-percent {
        font-size: 24px !important;
      }
      .legend-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default StudentMarks;