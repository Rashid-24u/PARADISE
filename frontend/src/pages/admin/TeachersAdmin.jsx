import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function TeachersAdmin() {
  const navigate = useNavigate();
  const formRef = useRef();

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    phone: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [message, setMessage] = useState("");

  const API = "http://127.0.0.1:8000/api/teachers/";

  // FETCH
  const fetchTeachers = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setTeachers(data);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 2000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // IMAGE
  const handleImage = (file) => {
    if (!file) return;
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!form.name || !form.subject) {
      setMessage("⚠️ Fill required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("subject", form.subject);
    formData.append("phone", form.phone);
    if (form.image) formData.append("image", form.image);

    if (editingId) {
      await fetch(API + editingId + "/", {
        method: "PUT",
        body: formData,
      });
      setMessage("✅ Teacher updated");
      setEditingId(null);
    } else {
      await fetch(API, {
        method: "POST",
        body: formData,
      });
      setMessage("✅ Teacher added");
    }

    setForm({ name: "", subject: "", phone: "", image: null });
    setPreview(null);
    fetchTeachers();
  };

  // DELETE
  const handleDelete = async (teacher) => {
    const confirmDelete = window.confirm(
      `Are you sure to delete "${teacher.name}"?`
    );
    if (!confirmDelete) return;

    await fetch(API + teacher.id + "/", { method: "DELETE" });
    setMessage(`🗑️ ${teacher.name} deleted`);
    fetchTeachers();
  };

  // EDIT
  const handleEdit = (t) => {
    setForm({
      name: t.name,
      subject: t.subject,
      phone: t.phone,
      image: null,
    });

    setPreview(t.image_url);
    setEditingId(t.id);

    // scroll + highlight
    formRef.current.scrollIntoView({ behavior: "smooth" });
    formRef.current.style.boxShadow = "0 0 0 3px #10b981";
    setTimeout(() => {
      formRef.current.style.boxShadow = "";
    }, 1500);
  };

  // FILTER
  const filtered = teachers.filter((t) => {
    const nameMatch = t.name.toLowerCase().includes(search.toLowerCase());
    const subjectMatch = filterSubject
      ? t.subject.toLowerCase().includes(filterSubject.toLowerCase())
      : true;

    return nameMatch && subjectMatch;
  });

  return (
    <div style={styles.container}>
      {/* BACK */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate("/admin-dashboard")}>
          ⬅ Back To Dashboard
        </button>
      </div>

      <h2 style={styles.title}>Teachers Management</h2>

      {message && <div style={styles.message}>{message}</div>}

      {/* FORM */}
      <div style={styles.form} ref={formRef}>
        <input
          style={styles.input}
          placeholder="Name"
          onFocus={(e) => (e.target.style.border = "1px solid #10b981")}
          onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Subject"
          onFocus={(e) => (e.target.style.border = "1px solid #10b981")}
          onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Phone"
          onFocus={(e) => (e.target.style.border = "1px solid #10b981")}
          onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input type="file" onChange={(e) => handleImage(e.target.files[0])} />

        {preview && <img src={preview} style={styles.preview} />}

        <button style={styles.addBtn} onClick={handleSubmit}>
          {editingId ? "Update Teacher" : "Add Teacher"}
        </button>
      </div>

      {/* SEARCH */}
      <div style={styles.filterBox}>
        <input
          style={styles.input}
          placeholder="🔍 Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="📚 Filter by subject..."
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Photo</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Subject</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t, index) => (
              <tr
                key={t.id}
                style={{
                  ...styles.row,
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                }}
                onClick={() => setSelectedTeacher(t)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#ffffff" : "#f9fafb";
                }}
              >
                <td style={styles.td}>
                  {t.image_url ? (
                    <img src={t.image_url} style={styles.img} alt={t.name} />
                  ) : (
                    <div style={styles.placeholderImg}>📸</div>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={styles.teacherName}>{t.name}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.subjectBadge}>{t.subject}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.phoneNumber}>{t.phone}</span>
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(t);
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.noResults}>No teachers found</div>
        )}
      </div>

      {/* UPDATED CARD - Only Image, Name, Subject, Phone */}
      {selectedTeacher && (
        <div style={styles.overlay} onClick={() => setSelectedTeacher(null)}>
          <div style={styles.card} onClick={(e) => e.stopPropagation()}>
            <button style={styles.cardClose} onClick={() => setSelectedTeacher(null)}>
              ✕
            </button>

            <div style={styles.cardHeader}>
              {selectedTeacher.image_url ? (
                <img
                  src={selectedTeacher.image_url}
                  style={styles.cardImg}
                  alt={selectedTeacher.name}
                />
              ) : (
                <div style={styles.cardPlaceholderImg}>👨‍🏫</div>
              )}
              <h2 style={styles.cardName}>{selectedTeacher.name}</h2>
              <div style={styles.cardSubject}>{selectedTeacher.subject}</div>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <div style={styles.infoIcon}>📞</div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Phone Number</div>
                  <div style={styles.infoValue}>{selectedTeacher.phone || "Not provided"}</div>
                </div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button
                style={styles.cardEditBtn}
                onClick={() => {
                  handleEdit(selectedTeacher);
                  setSelectedTeacher(null);
                }}
              >
                ✏️ Edit Profile
              </button>
              <button
                style={styles.cardDeleteBtn}
                onClick={() => {
                  handleDelete(selectedTeacher);
                  setSelectedTeacher(null);
                }}
              >
                🗑️ Delete Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* STYLES */
const styles = {
  container: {
    padding: "30px 20px",
    maxWidth: "1200px",
    margin: "auto",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  topBar: {
    marginBottom: "20px",
  },

  backBtn: {
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "32px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #065f46, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  message: {
    background: "#dcfce7",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "center",
    color: "#065f46",
    fontWeight: "500",
    border: "1px solid #a7f3d0",
  },

  form: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    maxWidth: "700px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginBottom: "30px",
    border: "1px solid #e5e7eb",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    transition: "all 0.2s",
    outline: "none",
    fontFamily: "inherit",
  },

  preview: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #10b981",
    marginTop: "5px",
  },

  addBtn: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "16px",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "25px",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    background: "white",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "inherit",
  },

  tableHeader: {
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    borderBottom: "2px solid #e2e8f0",
  },

  th: {
    padding: "16px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px",
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  row: {
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "1px solid #f1f5f9",
  },

  td: {
    padding: "14px 12px",
    verticalAlign: "middle",
  },

  img: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #e2e8f0",
  },

  placeholderImg: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  teacherName: {
    fontWeight: "600",
    color: "#0f172a",
  },

  subjectBadge: {
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#1e40af",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block",
  },

  phoneNumber: {
    color: "#475569",
    fontFamily: "monospace",
    fontSize: "13px",
  },

  editBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    marginRight: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  deleteBtn: {
    background: "#ef4444",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "14px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease",
  },

  card: {
    position: "relative",
    background: "white",
    borderRadius: "24px",
    width: "380px",
    maxWidth: "90%",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
    animation: "slideUp 0.3s ease",
  },

  cardClose: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#f1f5f9",
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    zIndex: 10,
  },

  cardHeader: {
    background: "linear-gradient(135deg, #065f46, #10b981)",
    padding: "30px 20px 20px",
    textAlign: "center",
    color: "white",
  },

  cardImg: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid white",
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
    marginBottom: "16px",
  },

  cardPlaceholderImg: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    margin: "0 auto 16px",
    border: "4px solid white",
  },

  cardName: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "white",
  },

  cardSubject: {
    fontSize: "14px",
    background: "rgba(255,255,255,0.2)",
    display: "inline-block",
    padding: "4px 16px",
    borderRadius: "20px",
    fontWeight: "500",
  },

  cardBody: {
    padding: "24px",
    background: "white",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
  },

  infoIcon: {
    fontSize: "28px",
    width: "48px",
    textAlign: "center",
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },

  infoValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
  },

  cardFooter: {
    padding: "16px 24px 24px",
    display: "flex",
    gap: "12px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },

  cardEditBtn: {
    flex: 1,
    padding: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  cardDeleteBtn: {
    flex: 1,
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default TeachersAdmin;