import { NavLink, useNavigate } from "react-router-dom";

function TeacherSidebar() {
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    padding: "12px",
    borderRadius: "8px",
    textDecoration: "none",
    color: isActive ? "#fff" : "#cbd5f5",
    background: isActive ? "#22c55e" : "transparent",
    marginBottom: "10px",
    display: "block",
    fontWeight: "500",
  });

  // 🔥 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    localStorage.removeItem("teacher");
    localStorage.removeItem("student");
    navigate("/teacher-login");
  };

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>👨‍🏫 Teacher</h2>

      <NavLink to="/teacher" style={linkStyle}>🏠 Dashboard</NavLink>
      <NavLink to="/teacher/students" style={linkStyle}>👨‍🎓 Students</NavLink>
      <NavLink to="/teacher/attendance" style={linkStyle}>📅 Attendance</NavLink>
      <NavLink to="/teacher/marks" style={linkStyle}>📝 Marks</NavLink>
      <NavLink to="/teacher/notes" style={linkStyle}>📄 Notes</NavLink>
      <NavLink to="/teacher/reports" style={linkStyle}>📊 Reports</NavLink>

      {/* 🔥 LOGOUT BUTTON */}
      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    height: "calc(100vh - 70px)",
    background: "#0f172a",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: "70px",
  },
  logo: {
    color: "#22c55e",
    marginBottom: "30px",
  },
  logoutBtn: {
    marginTop: "auto",
    padding: "12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default TeacherSidebar;