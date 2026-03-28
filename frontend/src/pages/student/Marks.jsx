import { useEffect, useState } from "react";
import axios from "axios";

function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [summary, setSummary] = useState({ total: 0, max: 0, percentage: 0, byExam: {} });

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "#10b981", label: "Excellent" };
    if (percentage >= 80) return { grade: "A", color: "#22c55e", label: "Very Good" };
    if (percentage >= 70) return { grade: "B+", color: "#f59e0b", label: "Good" };
    if (percentage >= 60) return { grade: "B", color: "#f97316", label: "Satisfactory" };
    if (percentage >= 50) return { grade: "C", color: "#ef4444", label: "Pass" };
    if (percentage >= 40) return { grade: "D", color: "#dc2626", label: "Needs Improvement" };
    return { grade: "F", color: "#991b1b", label: "Fail" };
  };

  const getResult = (percentage) => {
    return percentage >= 40 ? "PASS" : "FAIL";
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

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/marks/?student=${stored.student_id}`
      );
      const data = res.data;
      setMarks(data);
      
      // Calculate summary
      let totalObtained = 0;
      let totalMax = 0;
      const examGroups = {};
      
      data.forEach(m => {
        totalObtained += m.marks;
        totalMax += m.max_marks || 100;
        
        if (!examGroups[m.exam_type]) {
          examGroups[m.exam_type] = { obtained: 0, max: 0, subjects: [] };
        }
        examGroups[m.exam_type].obtained += m.marks;
        examGroups[m.exam_type].max += m.max_marks || 100;
        examGroups[m.exam_type].subjects.push(m);
      });
      
      const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const overallGrade = getGrade(overallPercentage);
      
      setSummary({
        total: totalObtained,
        max: totalMax,
        percentage: overallPercentage.toFixed(1),
        grade: overallGrade,
        result: getResult(overallPercentage),
        byExam: examGroups
      });
    } catch (err) {
      setError("Failed to load marks data");
    } finally {
      setLoading(false);
    }
  };

  const filteredMarks = filterExam
    ? marks.filter(m => m.exam_type === filterExam)
    : marks;

  const examTypes = [...new Set(marks.map(m => m.exam_type))];

  const calculateSubjectPercentage = (marks, maxMarks) => {
    const max = maxMarks || 100;
    return ((marks / max) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading marks...</p>
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

      {/* Overall Result Card */}
      <div style={styles.overallCard}>
        <div style={styles.overallScore}>
          <div style={styles.scoreCircle}>
            <span style={styles.scorePercent}>{summary.percentage}%</span>
          </div>
          <div style={styles.scoreDetails}>
            <div style={styles.scoreTotal}>
              <span>Total Obtained:</span>
              <strong>{summary.total} / {summary.max}</strong>
            </div>
            <div style={styles.scoreGrade}>
              <span>Grade:</span>
              <strong style={{...styles.gradeBadge, background: summary.grade?.color, color: "white"}}>
                {summary.grade?.grade}
              </strong>
            </div>
            <div style={styles.scoreResult}>
              <span>Result:</span>
              <strong style={{color: summary.result === "PASS" ? "#10b981" : "#ef4444"}}>
                {summary.result}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Exam-wise Summary */}
      {Object.keys(summary.byExam).length > 0 && (
        <div style={styles.examSummary}>
          <h3 style={styles.sectionTitle}>Exam-wise Performance</h3>
          <div style={styles.examGrid}>
            {Object.entries(summary.byExam).map(([exam, data]) => {
              const examPercentage = data.max > 0 ? ((data.obtained / data.max) * 100).toFixed(1) : 0;
              const examGrade = getGrade(examPercentage);
              return (
                <div key={exam} style={styles.examCard}>
                  <div style={styles.examHeader}>
                    <span style={styles.examName}>{exam}</span>
                    <span style={{...styles.examPercent, color: examGrade.color}}>
                      {examPercentage}%
                    </span>
                  </div>
                  <div style={styles.examProgress}>
                    <div style={{...styles.examFill, width: `${examPercentage}%`, background: examGrade.color}}></div>
                  </div>
                  <div style={styles.examScore}>
                    {data.obtained} / {data.max} • Grade {examGrade.grade}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={styles.filterBar}>
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
        <span style={styles.recordCount}>{filteredMarks.length} subjects</span>
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
                  <div style={styles.emptyIcon}>📭</div>
                  <p>No marks records found</p>
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
                      {m.subject}
                    </td>
                    <td>
                      <span style={styles.examBadge}>{m.exam_type}</span>
                    </td>
                    <td style={styles.marksCell}>{m.marks}</td>
                    <td>{m.max_marks || 100}</td>
                    <td>
                      <div style={styles.percentCell}>
                        <span style={{color: grade.color, fontWeight: "600"}}>
                          {percent}%
                        </span>
                        <div style={styles.smallBar}>
                          <div style={{...styles.smallFill, width: `${percent}%`, background: grade.color}}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{...styles.gradeChip, background: grade.color, color: "white"}}>
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

      {/* Legend */}
      <div style={styles.legend}>
        <h4>Grade Scale</h4>
        <div style={styles.legendGrid}>
          <div><span style={{background: "#10b981"}}>A+</span> 90-100% (Excellent)</div>
          <div><span style={{background: "#22c55e"}}>A</span> 80-89% (Very Good)</div>
          <div><span style={{background: "#f59e0b"}}>B+</span> 70-79% (Good)</div>
          <div><span style={{background: "#f97316"}}>B</span> 60-69% (Satisfactory)</div>
          <div><span style={{background: "#ef4444"}}>C</span> 50-59% (Pass)</div>
          <div><span style={{background: "#dc2626"}}>D</span> 40-49% (Needs Improvement)</div>
          <div><span style={{background: "#991b1b"}}>F</span> Below 40% (Fail)</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
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
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    marginBottom: "32px",
    textAlign: "center",
  },
  title: {
    fontSize: "clamp(24px, 5vw, 32px)",
    fontWeight: "700",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1e293b, #f59e0b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  overallCard: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "32px",
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
    background: "conic-gradient(from 0deg, #f59e0b 0deg, #f59e0b 0deg, #334155 0deg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  scorePercent: {
    fontSize: "32px",
    fontWeight: "700",
    color: "white",
    background: "#0f172a",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreDetails: {
    color: "white",
  },
  scoreTotal: {
    fontSize: "18px",
    marginBottom: "12px",
    span: { color: "#94a3b8", marginRight: "12px" },
  },
  scoreGrade: {
    fontSize: "18px",
    marginBottom: "12px",
    span: { color: "#94a3b8", marginRight: "12px" },
  },
  scoreResult: {
    fontSize: "18px",
    span: { color: "#94a3b8", marginRight: "12px" },
  },
  gradeBadge: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "16px",
    fontWeight: "600",
    marginLeft: "8px",
  },
  examSummary: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#0f172a",
  },
  examGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  examCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  examHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  examName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  examPercent: {
    fontSize: "14px",
    fontWeight: "600",
  },
  examProgress: {
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "6px",
    marginBottom: "8px",
    overflow: "hidden",
  },
  examFill: {
    height: "100%",
    borderRadius: "6px",
  },
  examScore: {
    fontSize: "12px",
    color: "#64748b",
    textAlign: "right",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  filterSelect: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: "13px",
    outline: "none",
  },
  recordCount: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  tableContainer: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: "32px",
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
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  subjectCell: {
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
  },
  subjectIcon: {
    fontSize: "18px",
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
    fontWeight: "600",
    color: "#0f172a",
  },
  percentCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  smallBar: {
    width: "80px",
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  smallFill: {
    height: "100%",
    borderRadius: "4px",
  },
  gradeChip: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  rowEven: {
    background: "white",
  },
  rowOdd: {
    background: "#f8fafc",
  },
  emptyRow: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  legend: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "20px",
    h4: {
      fontSize: "14px",
      fontWeight: "600",
      margin: "0 0 12px 0",
      color: "#0f172a",
    },
  },
  legendGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
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
      marginRight: "8px",
      textAlign: "center",
    },
  },
};

export default StudentMarks;