import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/";

function parseApiError(err) {
  const d = err.response?.data;
  if (typeof d?.message === "string") return d.message;
  if (typeof d?.detail === "string") return d.detail;
  if (d && typeof d === "object") {
    for (const v of Object.values(d)) {
      const x = Array.isArray(v) ? v[0] : v;
      if (typeof x === "string") return x;
    }
  }
  return err.message || "Request failed";
}

function Attendance() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const savingRef = useRef(false);

  useEffect(() => {
    axios.get(`${API}courses/`).then((res) => setCourses(res.data));
    axios.get(`${API}subjects/`).then((res) => setSubjects(res.data));

    const stored = JSON.parse(localStorage.getItem("teacher") || "{}");
    if (!stored.teacher_id) return;
    axios
      .get(`${API}teachers/${stored.teacher_id}/`)
      .then((res) => {
        setTeacher(res.data);
        if (res.data?.course) {
          setSelectedCourse(String(res.data.course));
        } else {
          setSelectedCourse("");
        }
        if (res.data?.subject) setSelectedSubject(String(res.data.subject));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      setAttendance({});
      return;
    }
    axios.get(`${API}students/?course=${selectedCourse}`).then((res) => {
      setStudents(res.data);
      const initial = {};
      res.data.forEach((s) => {
        initial[s.id] = true;
      });
      setAttendance(initial);
    });
  }, [selectedCourse]);

  useEffect(() => {
    setSuccess("");
    setError("");
  }, [selectedCourse, selectedSubject, selectedPeriod, date]);

  const handleChange = (id, value) => {
    setAttendance({ ...attendance, [id]: value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (savingRef.current || loading) return;

    const stored = JSON.parse(localStorage.getItem("teacher") || "{}");
    const teacherId = stored?.teacher_id;

    if (!teacherId) {
      setError("Teacher not logged in.");
      return;
    }
    if (!selectedCourse) {
      setError("Select a class.");
      return;
    }
    if (!selectedSubject) {
      setError("Select a subject.");
      return;
    }
    if (!date) {
      setError("Select a date.");
      return;
    }

    const data = students.map((s) => ({
      student: s.id,
      course: Number(selectedCourse),
      subject: Number(selectedSubject),
      teacher: teacherId,
      date,
      period: Number(selectedPeriod),
      status: Boolean(attendance[s.id]),
    }));

    savingRef.current = true;
    setLoading(true);
    try {
      for (const item of data) {
        const res = await axios.post(`${API}attendance/`, item);
        if (res.data?.message && res.status === 201) {
          /* continue */
        }
      }
      setSuccess("Attendance saved successfully");
    } catch (err) {
      setSuccess("");
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      savingRef.current = false;
    }
  };

  const assignedCourseId = teacher?.course ? String(teacher.course) : null;
  const totalPeriods =
    courses.find((c) => String(c.id) === String(selectedCourse))?.total_periods ||
    4;

  return (
    <div>
      <h2>Attendance 📅</h2>

      {success && (
        <p style={{ color: "#15803d", marginBottom: "8px", fontWeight: 600 }}>
          {success}
        </p>
      )}
      {error && (
        <p style={{ color: "#b91c1c", marginBottom: "8px" }} role="alert">
          {error}
        </p>
      )}

      <div style={styles.top}>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          disabled={Boolean(assignedCourseId)}
        >
          {!assignedCourseId && <option value="">All Classes — pick one</option>}
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
        >
          {Array.from({ length: Number(totalPeriods) }, (_, i) => i + 1).map(
            (p) => (
              <option key={p} value={p}>
                Period {p}
              </option>
            )
          )}
        </select>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {assignedCourseId && (
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "12px" }}>
          You are assigned to one class only. Attendance is saved for that class.
        </p>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                <select
                  value={String(attendance[s.id])}
                  onChange={(e) =>
                    handleChange(s.id, e.target.value === "true")
                  }
                >
                  <option value="true">Present</option>
                  <option value="false">Absent</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        style={styles.btn}
        onClick={handleSubmit}
        disabled={loading || students.length === 0}
      >
        {loading ? "Saving…" : "Save Attendance"}
      </button>
    </div>
  );
}

const styles = {
  top: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  table: {
    width: "100%",
    background: "#fff",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  btn: {
    padding: "10px 20px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Attendance;
