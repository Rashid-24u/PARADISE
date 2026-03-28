import { Outlet, Navigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";

function StudentLayout() {
  const studentData = localStorage.getItem("student");

  let student = null;

  try {
    student = JSON.parse(studentData);
  } catch {
    student = null;
  }

  // 🔐 PROTECT DASHBOARD
  if (!student || !student.student_id) {
    return <Navigate to="/student-login" replace />;
  }

  return (
    <div style={styles.container}>
      <StudentSidebar />

      <div style={styles.content}>
        <div style={styles.topbar}>
          🎓 Student Dashboard
        </div>

        <div style={styles.page}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
  },
  content: {
    flex: 1,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  topbar: {
    background: "#fff",
    padding: "15px 25px",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: "600",
  },
  page: {
    padding: "20px",
  },
};

export default StudentLayout;