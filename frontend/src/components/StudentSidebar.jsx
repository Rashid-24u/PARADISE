import { NavLink, useNavigate } from "react-router-dom";

function StudentSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    localStorage.removeItem("teacher");
    localStorage.removeItem("student");
    navigate("/student-login");
  };

  const linkStyle = ({ isActive }) => ({
    padding: "12px",
    borderRadius: "8px",
    textDecoration: "none",
    color: isActive ? "#fff" : "#cbd5f5",
    background: isActive ? "#3b82f6" : "transparent",
    marginBottom: "10px",
    display: "block",
    fontWeight: "500",
    transition: "all 0.3s ease",
  });

  return (
    <div style={styles.sidebar}>
      {/* 🔹 TOP */}
      <div>
        <h2 style={styles.logo}>🎓 Student</h2>

        <NavLink to="/student" style={linkStyle}>
          🏠 Dashboard
        </NavLink>

        <NavLink to="/student/profile" style={linkStyle}>
          👤 Profile
        </NavLink>

        <NavLink to="/student/attendance" style={linkStyle}>
          📅 Attendance
        </NavLink>

        <NavLink to="/student/marks" style={linkStyle}>
          📊 Marks
        </NavLink>

        <NavLink to="/student/notes" style={linkStyle}>
          📄 Notes
        </NavLink>
      </div>

      {/* 🔥 BOTTOM LOGOUT */}
      <button onClick={handleLogout} style={styles.logout}>
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
    justifyContent: "space-between",
    boxShadow: "2px 0 10px rgba(0,0,0,0.2)",
    position: "sticky",
    top: "70px",
  },
  logo: {
    color: "#3b82f6",
    marginBottom: "30px",
    fontWeight: "700",
  },
  logout: {
    padding: "12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "0.3s",
  },
};

export default StudentSidebar;