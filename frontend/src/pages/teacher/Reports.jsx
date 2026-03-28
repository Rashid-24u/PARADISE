import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/";

function Reports() {
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [selected, setSelected] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("teacher") || "{}");
    if (!stored.teacher_id) return;
    axios.get(`${API}teachers/${stored.teacher_id}/`).then((res) => {
      setTeacher(res.data);
      if (res.data.course) {
        axios
          .get(`${API}students/?course=${res.data.course}`)
          .then((r) => setStudents(r.data));
      } else {
        axios.get(`${API}students/`).then((r) => setStudents(r.data));
      }
    });
  }, []);

  const marksSummary = useMemo(() => {
    let obtained = 0;
    let max = 0;
    for (const m of marks) {
      const o = Number(m.marks) || 0;
      const mx = Number(m.max_marks) || 100;
      obtained += o;
      max += mx;
    }
    const pct = max > 0 ? (obtained / max) * 100 : 0;
    return {
      obtained,
      max,
      percentage: pct,
    };
  }, [marks]);

  const loadData = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const [attRes, markRes] = await Promise.all([
        axios.get(`${API}attendance/?student=${selected}`),
        axios.get(`${API}marks/?student=${selected}`),
      ]);
      setAttendance(attRes.data);
      setMarks(markRes.data);
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(
    (s) => String(s.id) === String(selected)
  );

  return (
    <div style={styles.page}>
      <h2>Reports 📊</h2>

      {teacher && !teacher.course && (
        <p style={styles.hint}>
          Showing all students. Class teachers only see their class.
        </p>
      )}

      <div style={styles.row}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={loadData}
          disabled={!selected || loading}
          style={styles.loadBtn}
        >
          {loading ? "Loading…" : "Load report"}
        </button>
      </div>

      {selectedStudent && (
        <p style={styles.studentLine}>
          <strong>{selectedStudent.name}</strong>
          {selectedStudent.course_name
            ? ` · ${selectedStudent.course_name}`
            : ""}
        </p>
      )}

      <section style={styles.section}>
        <h3 style={styles.h3}>Attendance</h3>
        {attendance.length === 0 ? (
          <p style={styles.muted}>No attendance loaded.</p>
        ) : (
          <ul style={styles.list}>
            {attendance.map((a) => (
              <li key={a.id} style={styles.li}>
                {a.date} — {a.status ? "Present" : "Absent"}
                {a.subject_name ? ` · ${a.subject_name}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.section}>
        <h3 style={styles.h3}>Marks (subject-wise)</h3>
        {marks.length === 0 ? (
          <p style={styles.muted}>No marks loaded.</p>
        ) : (
          <>
            <ul style={styles.list}>
              {marks.map((m) => {
                const mx = m.max_marks != null ? m.max_marks : 100;
                return (
                  <li key={m.id} style={styles.li}>
                    <span style={styles.subject}>{m.subject}</span>
                    <span style={styles.exam}> ({m.exam_type})</span>
                    <span style={styles.score}>
                      {" "}
                      — {m.marks} / {mx}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div style={styles.totalsBox}>
              <p style={styles.totalLine}>
                <strong>Total obtained</strong> — {marksSummary.obtained} /{" "}
                {marksSummary.max}
              </p>
              <p style={styles.totalLine}>
                <strong>Percentage</strong> —{" "}
                {marksSummary.max > 0
                  ? `${marksSummary.percentage.toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: { maxWidth: "560px" },
  hint: { color: "#64748b", fontSize: "14px", marginBottom: "16px" },
  row: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" },
  select: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
  },
  loadBtn: {
    padding: "10px 18px",
    background: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },
  studentLine: { fontSize: "15px", color: "#334155", marginBottom: "20px" },
  section: {
    marginBottom: "28px",
    padding: "16px 18px",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  h3: { margin: "0 0 12px 0", fontSize: "17px", color: "#0f172a" },
  list: { margin: 0, paddingLeft: "20px", color: "#334155" },
  li: { marginBottom: "8px", lineHeight: 1.45 },
  subject: { fontWeight: 600 },
  exam: { color: "#64748b", fontSize: "14px" },
  score: { fontVariantNumeric: "tabular-nums" },
  muted: { color: "#94a3b8", margin: 0 },
  totalsBox: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px dashed #cbd5e1",
  },
  totalLine: { margin: "6px 0", fontSize: "15px", color: "#0f172a" },
};

export default Reports;
