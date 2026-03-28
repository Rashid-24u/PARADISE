import { useEffect, useState } from "react";
import axios from "axios";

function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ present: 0, total: 0, percentage: 0 });
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    const stored = JSON.parse(localStorage.getItem("student"));
    if (!stored?.student_id) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/attendance/?student=${stored.student_id}`
      );
      const data = res.data;
      setAttendance(data);
      
      // ✅ FIX: Count periods, not days
      const presentPeriods = data.filter(a => a.status === true).length;
      const totalPeriods = data.length;
      
      setStats({
        present: presentPeriods,
        total: totalPeriods,
        percentage: totalPeriods > 0 ? ((presentPeriods / totalPeriods) * 100).toFixed(1) : 0
      });
    } catch (err) {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAttendance = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
    const monthAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
    
    switch(filterType) {
      case "daily":
        return attendance.filter(a => a.date === today);
      case "weekly":
        return attendance.filter(a => a.date >= weekAgo);
      case "monthly":
        return attendance.filter(a => a.date >= monthAgo);
      default:
        return attendance;
    }
  };

  const filteredAttendance = getFilteredAttendance();

  // Group by date for calendar view
  const groupedByDate = filteredAttendance.reduce((acc, curr) => {
    const date = curr.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  const getStatusColor = (status) => status ? "#10b981" : "#ef4444";

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading attendance records...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Attendance Record</h1>
        <p style={styles.subtitle}>Track your daily attendance progress</p>
      </div>

      {/* Stats Cards - Updated to show PERIODS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.present}</div>
            <div style={styles.statLabel}>Present Periods</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📆</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Periods</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.percentage}%</div>
            <div style={styles.statLabel}>Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>
          <span>Overall Attendance (Periods)</span>
          <span style={{ fontWeight: "bold", color: stats.percentage >= 75 ? "#10b981" : "#f59e0b" }}>
            {stats.percentage}%
          </span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${stats.percentage}%` }}></div>
        </div>
        {stats.percentage < 75 && (
          <p style={styles.warningMsg}>⚠️ Your attendance is below 75%. Regular attendance is important!</p>
        )}
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.viewToggle}>
          <button 
            style={{...styles.viewBtn, ...(viewMode === "list" ? styles.viewBtnActive : {})}}
            onClick={() => setViewMode("list")}
          >
            📋 List View
          </button>
          <button 
            style={{...styles.viewBtn, ...(viewMode === "calendar" ? styles.viewBtnActive : {})}}
            onClick={() => setViewMode("calendar")}
          >
            📅 Calendar View
          </button>
        </div>
        
        <div style={styles.filterGroup}>
          <select 
            style={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Records</option>
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* List View - Shows each period as separate record */}
      {viewMode === "list" && (
        <div style={styles.listContainer}>
          {filteredAttendance.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p>No attendance records found</p>
            </div>
          ) : (
            filteredAttendance.map((a) => (
              <div key={a.id} style={styles.recordCard}>
                <div style={styles.recordDate}>
                  <div style={styles.dateDay}>{new Date(a.date).getDate()}</div>
                  <div style={styles.dateMonth}>{new Date(a.date).toLocaleString('default', { month: 'short' })}</div>
                  <div style={styles.dateYear}>{new Date(a.date).getFullYear()}</div>
                </div>
                <div style={styles.recordDetails}>
                  <div style={styles.recordSubject}>{a.subject_name || "General Studies"}</div>
                  <div style={styles.recordMeta}>
                    <span style={styles.periodBadge}>Period {a.period || 1}</span>
                    {a.teacher_name && (
                      <span style={styles.teacherName}>👨‍🏫 {a.teacher_name}</span>
                    )}
                  </div>
                </div>
                <div style={{...styles.statusBadge, background: a.status ? "#dcfce7" : "#fee2e2", color: a.status ? "#166534" : "#991b1b"}}>
                  {a.status ? "✅ Present" : "❌ Absent"}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar View - Groups periods by date */}
      {viewMode === "calendar" && (
        <div style={styles.calendarContainer}>
          {sortedDates.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p>No attendance records found</p>
            </div>
          ) : (
            sortedDates.map((date) => {
              const records = groupedByDate[date];
              const presentPeriods = records.filter(r => r.status === true).length;
              const totalPeriods = records.length;
              const percentageForDay = totalPeriods > 0 ? (presentPeriods / totalPeriods) * 100 : 0;
              const statusColor = percentageForDay === 100 ? "#10b981" : percentageForDay >= 50 ? "#f59e0b" : "#ef4444";
              
              return (
                <div 
                  key={date} 
                  style={styles.calendarCard}
                  onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                >
                  <div style={{...styles.calendarHeader, borderLeftColor: statusColor}}>
                    <div style={styles.calendarDate}>
                      <div style={styles.calendarDay}>{new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                      <div style={styles.calendarNum}>{new Date(date).getDate()}</div>
                      <div style={styles.calendarMonth}>{new Date(date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div style={styles.calendarSummary}>
                      <div style={styles.attendanceDot}></div>
                      <span>{presentPeriods} / {totalPeriods} periods</span>
                      <span style={{ color: statusColor }}>
                        {percentageForDay === 100 ? "✓ Full Day" : percentageForDay >= 50 ? "⚠️ Partial" : "✗ Poor"}
                      </span>
                    </div>
                  </div>
                  
                  {selectedDate === date && (
                    <div style={styles.periodDetails}>
                      {records.map(r => (
                        <div key={r.id} style={styles.periodDetailItem}>
                          <span style={styles.periodTime}>Period {r.period || 1}</span>
                          <span style={styles.periodSubject}>{r.subject_name || "General"}</span>
                          <span style={styles.periodTeacher}>{r.teacher_name || "N/A"}</span>
                          <span style={{...styles.periodStatus, color: r.status ? "#10b981" : "#ef4444"}}>
                            {r.status ? "Present" : "Absent"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1000px",
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
    background: "linear-gradient(135deg, #1e293b, #3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  statIcon: {
    fontSize: "32px",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    borderRadius: "12px",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  },
  progressSection: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "8px",
    color: "#475569",
  },
  progressBar: {
    height: "10px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #10b981)",
    borderRadius: "10px",
    transition: "width 0.5s ease",
  },
  warningMsg: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#f59e0b",
    padding: "8px 12px",
    background: "#fffbeb",
    borderRadius: "8px",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
  },
  viewToggle: {
    display: "flex",
    gap: "8px",
    background: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
  },
  viewBtn: {
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  viewBtnActive: {
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  filterGroup: {
    display: "flex",
    gap: "8px",
  },
  filterSelect: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  recordCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s",
  },
  recordDate: {
    width: "70px",
    textAlign: "center",
    padding: "8px",
    background: "#f1f5f9",
    borderRadius: "12px",
  },
  dateDay: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 1,
  },
  dateMonth: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
  },
  dateYear: {
    fontSize: "9px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  recordDetails: {
    flex: 1,
  },
  recordSubject: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
  },
  recordMeta: {
    display: "flex",
    gap: "12px",
    marginTop: "6px",
  },
  periodBadge: {
    fontSize: "11px",
    padding: "2px 8px",
    background: "#e2e8f0",
    borderRadius: "12px",
    color: "#475569",
  },
  teacherName: {
    fontSize: "11px",
    color: "#64748b",
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  calendarContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  calendarCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderLeft: "4px solid",
    transition: "background 0.2s",
  },
  calendarDate: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  calendarDay: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    width: "40px",
  },
  calendarNum: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },
  calendarMonth: {
    fontSize: "12px",
    color: "#64748b",
  },
  calendarSummary: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "13px",
    color: "#475569",
  },
  attendanceDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#10b981",
  },
  periodDetails: {
    padding: "16px",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  periodDetailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  periodTime: {
    fontWeight: "600",
    color: "#0f172a",
    width: "80px",
  },
  periodSubject: {
    flex: 1,
    color: "#334155",
  },
  periodTeacher: {
    color: "#64748b",
    width: "100px",
  },
  periodStatus: {
    fontWeight: "500",
    width: "70px",
    textAlign: "right",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
};

export default StudentAttendance;