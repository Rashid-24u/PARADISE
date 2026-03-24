import { useEffect, useState } from "react";

function TeachersAdmin() {
  const [teachers, setTeachers] = useState([]);
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

  // AUTO MESSAGE
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 2000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // IMAGE HANDLE
  const handleImage = (file) => {
    if (!file) return;
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // ADD / UPDATE
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
  const handleDelete = async (id) => {
    await fetch(API + id + "/", { method: "DELETE" });
    setMessage("🗑️ Teacher deleted");
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
      <h2 style={styles.title}>Teachers Management</h2>

      {message && <div style={styles.message}>{message}</div>}

      {/* FORM */}
      <div style={styles.form}>
        <input
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="file"
          onChange={(e) => handleImage(e.target.files[0])}
        />

        {preview && <img src={preview} style={styles.preview} />}

        <button style={styles.addBtn} onClick={handleSubmit}>
          {editingId ? "Update Teacher" : "Add Teacher"}
        </button>
      </div>

      {/* SEARCH */}
      <div style={styles.filterBox}>
        <input
          style={styles.input}
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Filter by subject..."
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Photo</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Subject</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td style={styles.td}>
                  {t.image_url && (
                    <img src={t.image_url} style={styles.img} />
                  )}
                </td>

                <td style={styles.td}>{t.name}</td>
                <td style={styles.td}>{t.subject}</td>
                <td style={styles.td}>{t.phone}</td>

                <td style={styles.td}>
                  <div style={styles.actionBox}>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEdit(t)}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(t.id)}
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
            No teachers found
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
    fontSize: "28px",
    fontWeight: "700",
  },

  message: {
    background: "#dcfce7",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
    fontWeight: "500",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
  },

  preview: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  addBtn: {
    background: "#065f46",
    color: "white",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
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
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  th: {
    background: "#065f46",
    color: "white",
    padding: "14px",
    textAlign: "center",
  },

  td: {
    padding: "14px",
    textAlign: "center",
    borderBottom: "1px solid #eee",
  },

  img: {
    width: "55px",
    height: "55px",
    objectFit: "cover",
    borderRadius: "50%",
  },

  actionBox: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },

  editBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default TeachersAdmin;