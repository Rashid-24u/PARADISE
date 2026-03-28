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

function Marks() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState(null);

  const [course, setCourse] = useState("");
  const [student, setStudent] = useState("");
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const savingRef = useRef(false);

  useEffect(() => {
    axios.get(`${API}courses/`).then((res) => setCourses(res.data));
    const stored = JSON.parse(localStorage.getItem("teacher") || "{}");
    if (!stored.teacher_id) return;
    axios.get(`${API}teachers/${stored.teacher_id}/`).then((res) => {
      setTeacher(res.data);
      if (res.data.course) {
        setCourse(String(res.data.course));
      } else {
        setCourse("");
      }
    });
  }, []);

  useEffect(() => {
    if (!teacher) return;
    if (teacher.course) {
      axios
        .get(`${API}students/?course=${teacher.course}`)
        .then((res) => setStudents(res.data));
      return;
    }
    if (!course) {
      axios.get(`${API}students/`).then((res) => setStudents(res.data));
      return;
    }
    axios
      .get(`${API}students/?course=${course}`)
      .then((res) => setStudents(res.data));
  }, [teacher, course]);

  useEffect(() => {
    setSuccess("");
    setError("");
  }, [course, student, subject, exam, marksObtained, maxMarks]);

  const assignedOnly = Boolean(teacher?.course);

  const resetEntryFields = () => {
    setSubject("");
    setExam("");
    setMarksObtained("");
    setMaxMarks("100");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (savingRef.current || loading) return;

    const sel = students.find((s) => String(s.id) === String(student));
    const c = assignedOnly
      ? String(teacher.course)
      : course || (sel && sel.course != null ? String(sel.course) : "");
    if (!c || !student) {
      setError("Select class and student.");
      return;
    }
    if (!subject.trim()) {
      setError("Enter a subject.");
      return;
    }
    if (!exam) {
      setError("Select exam type.");
      return;
    }
    const marksNum = Number(marksObtained);
    const maxNum = Number(maxMarks);
    if (marksObtained === "" || Number.isNaN(marksNum)) {
      setError("Enter marks obtained.");
      return;
    }
    if (marksNum < 0) {
      setError("Marks cannot be negative.");
      return;
    }
    if (Number.isNaN(maxNum) || maxNum < 1) {
      setError("Out of (max marks) must be at least 1.");
      return;
    }
    if (marksNum > maxNum) {
      setError(`Marks obtained cannot exceed out of (${maxNum}).`);
      return;
    }

    const payload = {
      student: Number(student),
      course: Number(c),
      subject: subject.trim(),
      exam_type: exam,
      marks: marksNum,
      max_marks: maxNum,
    };

    savingRef.current = true;
    setLoading(true);
    try {
      const res = await axios.post(`${API}marks/`, payload);
      setSuccess(res.data?.message || "Marks saved successfully");
      resetEntryFields();
    } catch (err) {
      setSuccess("");
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      savingRef.current = false;
    }
  };

  const preview =
    marksObtained !== "" &&
    maxMarks !== "" &&
    !Number.isNaN(Number(marksObtained)) &&
    !Number.isNaN(Number(maxMarks))
      ? `${marksObtained} / ${maxMarks}`
      : null;

  return (
    <div style={styles.page}>
      <h2>Marks Entry 📝</h2>

      {success && (
        <p style={styles.success} role="status">
          {success}
        </p>
      )}
      {error && (
        <p style={styles.error} role="alert">
          {error}
        </p>
      )}

      <div style={styles.form}>
        {!assignedOnly && (
          <label style={styles.label}>
            Class
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              style={styles.input}
            >
              <option value="">All Classes</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {assignedOnly && teacher && (
          <p style={styles.note}>
            Class:{" "}
            <strong>
              {courses.find((c) => String(c.id) === String(teacher.course))
                ?.name || "—"}
            </strong>
          </p>
        )}

        <label style={styles.label}>
          Student
          <select
            value={student}
            onChange={(e) => setStudent(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Subject
          <input
            type="text"
            placeholder="e.g. Mathematics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Exam type
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Exam</option>
            <option value="Unit Test">Unit Test</option>
            <option value="Mid Term">Mid Term</option>
            <option value="Final">Final</option>
          </select>
        </label>

        <label style={styles.label}>
          Marks obtained
          <input
            type="number"
            min={0}
            step={1}
            placeholder="0"
            value={marksObtained}
            onChange={(e) => setMarksObtained(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Out of (max marks)
          <input
            type="number"
            min={1}
            step={1}
            placeholder="100"
            value={maxMarks}
            onChange={(e) => setMaxMarks(e.target.value)}
            style={styles.input}
          />
        </label>

        {preview && (
          <p style={styles.preview}>
            Display: <strong>{preview}</strong>
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={styles.btn}
        >
          {loading ? "Saving…" : "Save marks"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "420px" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
  },
  note: {
    color: "#475569",
    margin: 0,
    fontSize: "14px",
  },
  preview: {
    margin: 0,
    padding: "10px 12px",
    background: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#475569",
  },
  success: {
    color: "#15803d",
    marginBottom: "8px",
    fontWeight: 600,
  },
  error: {
    color: "#b91c1c",
    marginBottom: "8px",
  },
  btn: {
    padding: "12px",
    background: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "15px",
    marginTop: "4px",
  },
};

export default Marks;
