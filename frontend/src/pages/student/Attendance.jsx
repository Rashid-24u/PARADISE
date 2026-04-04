import { useEffect, useState } from "react";
import axios from "axios";

function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterWeekday, setFilterWeekday] = useState("Mon");
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [teachers, setTeachers] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      
      if (Array.isArray(data)) {
        setAttendance(data);
        // Fetch teacher names for each attendance record
        await fetchTeacherNames(data);
      } else {
        setAttendance([]);
      }
    } catch (err) {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherNames = async (attendanceData) => {
    const teacherMap = {};
    for (const record of attendanceData) {
      if (record.marked_by && !teacherMap[record.marked_by]) {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/api/teachers/${record.marked_by}/`);
          teacherMap[record.marked_by] = res.data.name;
        } catch (err) {
          console.error("Error fetching teacher:", err);
          teacherMap[record.marked_by] = "Unknown Teacher";
        }
      }
    }
    setTeachers(teacherMap);
  };

  const getFilteredAttendance = () => {
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
    const monthAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];

    const weekdayMap = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    
    switch(filterType) {
      case "date":
        return attendance.filter(a => a.date === filterDate);
      case "day":
        return attendance.filter(a => new Date(a.date).getDay() === weekdayMap[filterWeekday]);
      case "week":
        return attendance.filter(a => a.date >= weekAgo);
      case "month":
        return attendance.filter(a => a.date >= monthAgo);
      default:
        return attendance;
    }
  };

  const filteredAttendance = getFilteredAttendance();

  const filteredStats = (() => {
    const presentDays = filteredAttendance.filter((a) => a.status === true).length;
    const totalDays = filteredAttendance.length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    return { presentDays, totalDays, percentage };
  })();

  const groupedByDate = filteredAttendance.reduce((acc, curr) => {
    const date = curr.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  // Dynamic styles based on mobile state
  const styles = {
    container: {
      padding: isMobile ? "16px" : "24px",
      maxWidth: "1000px",
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
      background: "#f8fafc",
      minHeight: "calc(100vh - 70px)",
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
      marginBottom: isMobile ? "24px" : "32px",
      textAlign: "center",
    },
    title: {
      fontSize: isMobile ? "24px" : "32px",
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
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },
    statCard: {
      background: "white",
      borderRadius: "16px",
      padding: isMobile ? "16px" : "20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    statIcon: {
      fontSize: isMobile ? "28px" : "32px",
      width: isMobile ? "40px" : "50px",
      height: isMobile ? "40px" : "50px",
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
      fontSize: isMobile ? "24px" : "28px",
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
      padding: isMobile ? "16px" : "20px",
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
      flexDirection: isMobile ? "column" : "row",
    },
    viewToggle: {
      display: "flex",
      gap: "8px",
      background: "#f1f5f9",
      padding: "4px",
      borderRadius: "12px",
      width: isMobile ? "100%" : "auto",
    },
    viewBtn: {
      padding: isMobile ? "8px 12px" : "8px 16px",
      border: "none",
      background: "transparent",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.2s",
      flex: isMobile ? 1 : "auto",
    },
    viewBtnActive: {
      background: "white",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    filterGroup: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      width: isMobile ? "100%" : "auto",
      flexWrap: "wrap",
    },
    filterSelect: {
      padding: "8px 16px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "white",
      fontSize: "13px",
      outline: "none",
      cursor: "pointer",
      flex: isMobile ? 1 : "auto",
    },
    dateInputSmall: {
      padding: "8px 12px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      fontSize: "13px",
    },
    labelSmall: {
      fontSize: "12px",
      color: "#64748b",
    },
    listContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    recordCard: {
      background: "white",
      borderRadius: "16px",
      padding: isMobile ? "12px" : "16px",
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "12px" : "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "transform 0.2s",
      flexWrap: isMobile ? "wrap" : "nowrap",
    },
    recordDate: {
      width: isMobile ? "60px" : "70px",
      textAlign: "center",
      padding: isMobile ? "6px" : "8px",
      background: "#f1f5f9",
      borderRadius: "12px",
    },
    dateDay: {
      fontSize: isMobile ? "20px" : "24px",
      fontWeight: "700",
      color: "#0f172a",
      lineHeight: 1,
    },
    dateMonth: {
      fontSize: "10px",
      color: "#64748b",
      textTransform: "uppercase",
    },
    dateYear: {
      fontSize: "8px",
      color: "#94a3b8",
      marginTop: "2px",
    },
    recordDetails: {
      flex: 1,
    },
    recordSubject: {
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "600",
      color: "#0f172a",
    },
    recordMeta: {
      display: "flex",
      gap: "12px",
      marginTop: "6px",
      flexWrap: "wrap",
    },
    dayBadge: {
      fontSize: "11px",
      padding: "2px 8px",
      background: "#e2e8f0",
      borderRadius: "12px",
      color: "#475569",
    },
    teacherName: {
      fontSize: "11px",
      color: "#64748b",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    statusBadge: {
      padding: isMobile ? "4px 12px" : "6px 14px",
      borderRadius: "20px",
      fontSize: isMobile ? "11px" : "12px",
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
      padding: isMobile ? "12px" : "16px",
      borderLeft: "4px solid",
      transition: "background 0.2s",
      flexWrap: "wrap",
      gap: "8px",
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
      width: isMobile ? "35px" : "40px",
    },
    calendarNum: {
      fontSize: isMobile ? "20px" : "24px",
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
      flexWrap: "wrap",
    },
    attendanceDot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
    },
    periodDetails: {
      padding: isMobile ? "12px" : "16px",
      borderTop: "1px solid #e2e8f0",
      background: "#f8fafc",
    },
    periodDetailItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #e2e8f0",
      fontSize: isMobile ? "11px" : "13px",
      flexWrap: "wrap",
      gap: "8px",
    },
    periodTime: {
      fontWeight: "600",
      color: "#0f172a",
      width: isMobile ? "60px" : "80px",
    },
    periodSubject: {
      flex: 1,
      color: "#334155",
    },
    periodTeacher: {
      color: "#64748b",
      width: isMobile ? "80px" : "100px",
    },
    periodStatus: {
      fontWeight: "500",
      width: isMobile ? "60px" : "70px",
      textAlign: "right",
    },
    emptyState: {
      textAlign: "center",
      padding: isMobile ? "40px 20px" : "60px 20px",
      background: "white",
      borderRadius: "20px",
    },
    emptyIcon: {
      fontSize: isMobile ? "48px" : "64px",
      marginBottom: "16px",
    },
  };

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
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Attendance Record</h1>
        <p style={styles.subtitle}>Track your daily attendance progress</p>
      </div>

      {/* Stats Cards - Showing Days instead of Periods */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{filteredStats.presentDays}</div>
            <div style={styles.statLabel}>Present Days</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📆</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{filteredStats.totalDays}</div>
            <div style={styles.statLabel}>Total Days</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{filteredStats.percentage}%</div>
            <div style={styles.statLabel}>Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>
          <span>Overall Attendance ({filteredStats.presentDays}/{filteredStats.totalDays} days)</span>
          <span
            style={{
              fontWeight: "bold",
              color: Number(filteredStats.percentage) >= 75 ? "#10b981" : "#f59e0b",
            }}
          >
            {filteredStats.percentage}%
          </span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{ ...styles.progressFill, width: `${filteredStats.percentage}%` }}
          ></div>
        </div>
        {Number(filteredStats.percentage) < 75 && (
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
            <option value="date">By Date</option>
            <option value="day">By Day</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {filterType === "date" && (
          <div style={styles.filterGroup}>
            <label style={styles.labelSmall}>Select Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={styles.dateInputSmall}
            />
          </div>
        )}

        {filterType === "day" && (
          <div style={styles.filterGroup}>
            <label style={styles.labelSmall}>Select Day</label>
            <select
              value={filterWeekday}
              onChange={(e) => setFilterWeekday(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="Mon">Monday</option>
              <option value="Tue">Tuesday</option>
              <option value="Wed">Wednesday</option>
              <option value="Thu">Thursday</option>
              <option value="Fri">Friday</option>
              <option value="Sat">Saturday</option>
              <option value="Sun">Sunday</option>
            </select>
          </div>
        )}
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div style={styles.listContainer}>
          {filteredAttendance.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p>No attendance records found</p>
            </div>
          ) : (
            filteredAttendance.map((a) => {
              const dateObj = new Date(a.date);
              const teacherName = teachers[a.marked_by] || "Unknown Teacher";
              return (
                <div key={a.id} style={styles.recordCard}>
                  <div style={styles.recordDate}>
                    <div style={styles.dateDay}>{dateObj.getDate()}</div>
                    <div style={styles.dateMonth}>{dateObj.toLocaleString('default', { month: 'short' })}</div>
                    <div style={styles.dateYear}>{dateObj.getFullYear()}</div>
                  </div>
                  <div style={styles.recordDetails}>
                    <div style={styles.recordSubject}>
                      {dateObj.toLocaleDateString('en-IN', { weekday: 'long' })}
                    </div>
                    <div style={styles.recordMeta}>
                      <span style={styles.dayBadge}>
                        📅 Day {dateObj.getDate()}
                      </span>
                      <span style={styles.teacherName}>
                        👨‍🏫 {teacherName}
                      </span>
                    </div>
                  </div>
                  <div style={{...styles.statusBadge, background: a.status ? "#dcfce7" : "#fee2e2", color: a.status ? "#166534" : "#991b1b"}}>
                    {a.status ? "✅ Present" : "❌ Absent"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Calendar View */}
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
              const presentCount = records.filter(r => r.status === true).length;
              const totalCount = records.length;
              const percentageForDay = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
              const statusColor = percentageForDay === 100 ? "#10b981" : percentageForDay >= 50 ? "#f59e0b" : "#ef4444";
              const dateObj = new Date(date);
              const teacherName = teachers[records[0]?.marked_by] || "Unknown Teacher";
              
              return (
                <div 
                  key={date} 
                  style={styles.calendarCard}
                  onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                >
                  <div style={{...styles.calendarHeader, borderLeftColor: statusColor}}>
                    <div style={styles.calendarDate}>
                      <div style={styles.calendarDay}>{dateObj.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                      <div style={styles.calendarNum}>{dateObj.getDate()}</div>
                      <div style={styles.calendarMonth}>{dateObj.toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div style={styles.calendarSummary}>
                      <div style={{...styles.attendanceDot, background: statusColor}}></div>
                      <span>{presentCount} / {totalCount} days</span>
                      <span style={{ color: statusColor }}>
                        {percentageForDay === 100 ? "✓ Full Day" : percentageForDay >= 50 ? "⚠️ Partial" : "✗ Absent"}
                      </span>
                    </div>
                  </div>
                  
                  {selectedDate === date && (
                    <div style={styles.periodDetails}>
                      {records.map(r => (
                        <div key={r.id} style={styles.periodDetailItem}>
                          <span style={styles.periodTime}>Status</span>
                          <span style={styles.periodSubject}>
                            {r.status ? "Present ✅" : "Absent ❌"}
                          </span>
                          <span style={styles.periodTeacher}>
                            👨‍🏫 {teachers[r.marked_by] || "Unknown Teacher"}
                          </span>
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

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default StudentAttendance;