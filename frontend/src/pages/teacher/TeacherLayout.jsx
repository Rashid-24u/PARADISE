import { Outlet, Navigate } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";

function TeacherLayout() {
  const teacherData = localStorage.getItem("teacher");

  let teacher = null;

  try {
    teacher = JSON.parse(teacherData);
  } catch {
    teacher = null;
  }

  // 🔐 PROTECT DASHBOARD
  if (!teacher || !teacher.teacher_id) {
    return <Navigate to="/teacher-login" replace />;
  }

  return (
    <div style={styles.container}>
      <TeacherSidebar />

      <div style={styles.content}>
        <div style={styles.topbar}>
          <h3>👨‍🏫 Teacher Dashboard</h3>
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
    background: "#ffffff",
    padding: "15px 25px",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: "600",
  },
  page: {
    padding: "25px",
  },
};

export default TeacherLayout;