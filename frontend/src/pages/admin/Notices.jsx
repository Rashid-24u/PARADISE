import { useEffect, useState } from "react";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: null,
    is_important: false,
  });

  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  const API = "http://127.0.0.1:8000/api/notices/";

  // FETCH
  const fetchNotices = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setNotices(data);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // IMAGE PREVIEW
  const handleImage = (file) => {
    if (!file) return;
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // ADD / UPDATE
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("is_important", form.is_important);

    if (form.image) formData.append("image", form.image);

    if (editId) {
      await fetch(API + editId + "/", {
        method: "PUT",
        body: formData,
      });
      setMsg("Updated ✅");
    } else {
      await fetch(API, {
        method: "POST",
        body: formData,
      });
      setMsg("Added ✅");
    }

    setForm({ title: "", content: "", image: null, is_important: false });
    setPreview(null);
    setEditId(null);
    fetchNotices();
  };

  // DELETE
  const handleDelete = async (id) => {
    await fetch(API + id + "/", { method: "DELETE" });
    setMsg("Deleted 🗑️");
    fetchNotices();
  };

  // EDIT
  const handleEdit = (n) => {
    setForm({
      title: n.title,
      content: n.content,
      image: null,
      is_important: n.is_important,
    });

    setPreview(n.image_url);
    setEditId(n.id);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Notice Management</h2>

      {msg && <div style={styles.msg}>{msg}</div>}

      {/* FORM */}
      <div style={styles.card}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={styles.input}
        />

        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={styles.textarea}
        />

        <div style={styles.row}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.is_important}
              onChange={(e) =>
                setForm({ ...form, is_important: e.target.checked })
              }
            />
            Important
          </label>

          <input
            type="file"
            onChange={(e) => handleImage(e.target.files[0])}
          />
        </div>

        {preview && <img src={preview} style={styles.preview} />}

        <button style={styles.btn} onClick={handleSubmit}>
          {editId ? "Update Notice" : "Add Notice"}
        </button>
      </div>

      {/* LIST */}
      <div style={styles.card}>
        {notices.map((n) => (
          <div key={n.id} style={styles.noticeRow}>
            {n.image_url && (
              <img src={n.image_url} style={styles.image} />
            )}

            <div style={{ flex: 1 }}>
              <h4>
                {n.title}
                {n.is_important && (
                  <span style={styles.badge}>Important</span>
                )}
              </h4>
              <p>{n.content}</p>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.editBtn}
                onClick={() => handleEdit(n)}
              >
                Edit
              </button>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(n.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "auto", padding: "20px" },
  title: { textAlign: "center", color: "#065f46" },

  msg: {
    background: "#dcfce7",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
  },

  card: {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  input: { width: "100%", padding: "10px", marginBottom: "10px" },
  textarea: { width: "100%", padding: "10px", marginBottom: "10px" },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  checkbox: { display: "flex", gap: "5px" },

  preview: {
    width: "120px",
    borderRadius: "8px",
    marginBottom: "10px",
  },

  btn: {
    width: "100%",
    background: "#065f46",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
  },

  noticeRow: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    padding: "10px 0",
  },

  image: { width: "80px", borderRadius: "6px" },

  actions: { display: "flex", gap: "10px" },

  editBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
  },

  deleteBtn: {
    background: "#ef4444",
    color: "white",
    padding: "6px 10px",
    borderRadius: "6px",
  },

  badge: {
    background: "#facc15",
    marginLeft: "8px",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
  },
};

export default Notices;