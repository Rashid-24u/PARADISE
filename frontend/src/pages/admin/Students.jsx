import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    student_class: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [message, setMessage] = useState("");

  const API = "http://127.0.0.1:8000/api/students/";

  // 🔥 NORMALIZE CLASS
  const normalize = (value) => value.trim().toUpperCase();

  // 🔥 FETCH
  const fetchStudents = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🔔 MESSAGE AUTO HIDE
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 2000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // 🔥 ADD / UPDATE
  const handleSubmit = async () => {
    if (!form.name || !form.student_class) {
      setMessage("⚠️ Fill required fields");
      return;
    }

    const payload = {
      ...form,
      student_class: normalize(form.student_class),
    };

    if (editingId) {
      await fetch(API + editingId + "/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage("✅ Student updated");
      setEditingId(null);
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage("✅ Student added");
    }

    setForm({ name: "", student_class: "", phone: "" });
    fetchStudents();
  };

  // 🔥 DELETE
  const deleteStudent = async (id) => {
    await fetch(API + id + "/", { method: "DELETE" });
    setMessage("🗑️ Student deleted");
    fetchStudents();
  };

  // 🔥 EDIT LOAD
  const editStudent = (s) => {
    setForm({
      name: s.name,
      student_class: s.student_class,
      phone: s.phone,
    });
    setEditingId(s.id);
  };

  // 🔥 FILTER + SEARCH
  const filtered = students.filter((s) => {
    return (
      (!filterClass ||
        normalize(s.student_class) === normalize(filterClass)) &&
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  // 🔥 COUNT
  const classCount = {};
  students.forEach((s) => {
    const cls = normalize(s.student_class);
    classCount[cls] = (classCount[cls] || 0) + 1;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Students Management</h2>

      {/* MESSAGE */}
      {message && <div style={styles.message}>{message}</div>}

      {/* FORM */}
      <div style={styles.form}>
        <input
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          style={styles.input}
          placeholder="Class (LKG, 1, 2...)"
          value={form.student_class}
          onChange={(e) =>
            setForm({ ...form, student_class: e.target.value })
          }
        />

        <input
          style={styles.input}
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <button style={styles.addBtn} onClick={handleSubmit}>
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div style={styles.controls}>
        <input
          style={styles.input}
          placeholder="Search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Filter class..."
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        />
      </div>

      {/* COUNT */}
      <div style={styles.countBox}>
        {Object.keys(classCount).map((c) => (
          <span key={c} style={styles.count}>
            {c}: {classCount[c]}
          </span>
        ))}
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Class</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={styles.td}>{s.name}</td>
                <td style={styles.td}>
                  {normalize(s.student_class)}
                </td>
                <td style={styles.td}>{s.phone}</td>
                <td style={styles.td}>
                  <div style={styles.actionBox}>
                    <button
                      style={styles.editBtn}
                      onClick={() => editStudent(s)}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => deleteStudent(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            No students found
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px 20px",
    maxWidth: "1100px",
    margin: "auto",
  },

  title: {
    textAlign: "center",
    color: "#065f46",
    marginBottom: "20px",
  },

  message: {
    background: "#dcfce7",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  addBtn: {
    background: "#065f46",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  controls: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },

  countBox: {
    marginBottom: "15px",
  },

  count: {
    background: "#facc15",
    padding: "6px 12px",
    borderRadius: "20px",
    marginRight: "8px",
    fontWeight: "600",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  th: {
    background: "#065f46",
    color: "white",
    padding: "12px",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
  },

  actionBox: {
    display: "flex",
    gap: "8px",
  },

  editBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Students;