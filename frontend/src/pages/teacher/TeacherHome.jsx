import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/";

function TeacherHome() {
  const [studentCount, setStudentCount] = useState(null);
  const [courseLabel, setCourseLabel] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("teacher") || "{}");
    if (!stored.teacher_id) return;

    axios.get(`${API}teachers/${stored.teacher_id}/`).then((res) => {
      const t = res.data;
      if (t.course) {
        setCourseLabel(t.course_name || "Your class");
        axios
          .get(`${API}students/?course=${t.course}`)
          .then((r) => setStudentCount(r.data.length));
      } else {
        setCourseLabel("All classes");
        axios.get(`${API}students/`).then((r) => setStudentCount(r.data.length));
      }
    });
  }, []);

  return (
    <div>
      <h2 style={styles.title}>Welcome 👨‍🏫</h2>
      <p style={styles.subtitle}>
        Manage students, attendance, marks and notes easily.
      </p>
      {courseLabel && (
        <p style={styles.scope}>
          Scope: <strong>{courseLabel}</strong>
          {studentCount !== null && (
            <>
              {" "}
              · <strong>{studentCount}</strong> students visible
            </>
          )}
        </p>
      )}

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>👨‍🎓 Students</h3>
          <p>
            {studentCount !== null
              ? `${studentCount} students in your view`
              : "Loading…"}
          </p>
        </div>

        <div style={styles.card}>
          <h3>📅 Attendance</h3>
          <p>Mark daily attendance</p>
        </div>

        <div style={styles.card}>
          <h3>📝 Marks</h3>
          <p>Update student marks</p>
        </div>

        <div style={styles.card}>
          <h3>📄 Notes</h3>
          <p>Upload study materials</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: {
    marginBottom: "10px",
  },
  subtitle: {
    marginBottom: "12px",
    color: "#64748b",
  },
  scope: {
    marginBottom: "20px",
    color: "#475569",
    fontSize: "15px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    transition: "0.3s",
    cursor: "pointer",
  },
};

export default TeacherHome;
