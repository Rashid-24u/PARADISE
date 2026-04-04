import { useEffect, useState } from "react";

function CoursesAdmin() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });  // Removed total_periods
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const API = "http://127.0.0.1:8000/api/courses/";

  const fetchCourses = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => setCourses(data));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ ADD / UPDATE
  const handleSubmit = async () => {
    if (!form.name) {
      alert("Course name required");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId ? API + editId + "/" : API;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        // Remove total_periods
      }),
    });

    setForm({ name: "", description: "" });
    setEditId(null);
    fetchCourses();
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete course?")) return;

    await fetch(API + id + "/", {
      method: "DELETE",
    });

    fetchCourses();
  };

  // ✏️ EDIT
  const handleEdit = (c) => {
    setForm({
      name: c.name,
      description: c.description,
    });
    setEditId(c.id);
  };

  // 🔍 SEARCH
  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>📚 Course Management</h2>
        <p style={styles.headerSubtitle}>Manage classes (Pre-KG, LKG, UKG, 1st to 5th Standard)</p>
      </div>

      {/* Top layout: form + summary */}
      <div style={styles.topRow}>
        {/* FORM */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editId ? "✏️ Edit Course" : "➕ Add New Course"}</h3>
          <div style={styles.formGrid}>
            <div style={styles.formField}>
              <label style={styles.label}>Course Name *</label>
              <input
                style={styles.input}
                placeholder="Pre-KG, LKG, UKG, 1st Standard..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>
          <div style={styles.formField}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              placeholder="Short description about this class..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={styles.formActions}>
            {editId && (
              <button style={styles.cancelBtn} onClick={() => { setEditId(null); setForm({ name: "", description: "" }); }}>
                Cancel
              </button>
            )}
            <button style={styles.primaryBtn} onClick={handleSubmit}>
              {editId ? "Update Course" : "Add Course"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Overview</h3>
          <p style={styles.summaryValue}>{filtered.length}</p>
          <p style={styles.summaryLabel}>Active Courses</p>
          <p style={styles.summaryHint}>These classes are used across Students, Teachers, Notes and Attendance.</p>
        </div>
      </div>

      {/* SEARCH */}
      <div style={styles.searchRow}>
        <input
          style={styles.search}
          placeholder="Search course..."
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* CARDS */}
      <div style={styles.grid}>
        {filtered.map(c => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{c.name}</h3>
            </div>
            <p style={styles.cardDescription}>{c.description || "No description provided."}</p>
            <div style={styles.actions}>
              <button style={styles.editBtn} onClick={() => handleEdit(c)}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ marginTop: 20, color: "#6b7280" }}>No courses found.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    background: "linear-gradient(135deg,#e0f2fe,#f9fafb)",
    minHeight: "calc(100vh - 70px)",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
    gap: 20,
    marginBottom: 20,
  },
  formCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
  },
  formTitle: {
    margin: "0 0 12px 0",
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
  },
  formGrid: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  formField: {
    flex: 1,
    minWidth: 200,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#4b5563",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
  },
  textarea: {
    minHeight: 70,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    resize: "vertical",
  },
  formActions: {
    marginTop: 16,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  primaryBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  cancelBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#e5e7eb",
    color: "#374151",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 14,
  },
  summaryCard: {
    background: "#0f172a",
    color: "#e5e7eb",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 25px rgba(15,23,42,0.6)",
  },
  summaryTitle: {
    margin: "0 0 8px 0",
    fontSize: 16,
    fontWeight: 600,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 700,
    margin: "4px 0",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  summaryHint: {
    marginTop: 12,
    fontSize: 12,
    color: "#9ca3af",
  },
  searchRow: {
    marginBottom: 10,
  },
  search: {
    padding: 10,
    width: "100%",
    maxWidth: 320,
    borderRadius: 999,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },
  cardDescription: {
    margin: "4px 0 0 0",
    fontSize: 13,
    color: "#6b7280",
    minHeight: 32,
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: 10,
  },
  editBtn: {
    flex: 1,
    padding: "8px 0",
    borderRadius: 8,
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    padding: "8px 0",
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default CoursesAdmin;