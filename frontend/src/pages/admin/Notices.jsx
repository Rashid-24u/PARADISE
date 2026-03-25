import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Notices() {
  const navigate = useNavigate();
  const formRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: null,
    is_important: false,
  });

  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  const API = "http://127.0.0.1:8000/api/notices/";

  // Check screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FETCH
  const fetchNotices = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // AUTO HIDE MESSAGE
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  // VALIDATION FUNCTIONS
  const validateTitle = (title) => {
    if (!title || title.trim() === "") {
      return "Title is required";
    }
    if (title.length < 3) {
      return "Title must be at least 3 characters";
    }
    if (title.length > 100) {
      return "Title must be less than 100 characters";
    }
    return null;
  };

  const validateContent = (content) => {
    if (!content || content.trim() === "") {
      return "Content is required";
    }
    if (content.length < 10) {
      return "Content must be at least 10 characters";
    }
    if (content.length > 1000) {
      return "Content must be less than 1000 characters";
    }
    return null;
  };

  const validateForm = () => {
    const titleError = validateTitle(form.title);
    if (titleError) {
      setMsg(titleError);
      setMsgType("error");
      return false;
    }

    const contentError = validateContent(form.content);
    if (contentError) {
      setMsg(contentError);
      setMsgType("error");
      return false;
    }

    return true;
  };

  // IMAGE PREVIEW
  const handleImage = (file) => {
    if (!file) return;
    
    // Validate image size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMsg("Image size must be less than 5MB");
      setMsgType("error");
      return;
    }
    
    // Validate image type
    if (!file.type.startsWith("image/")) {
      setMsg("Please select a valid image file");
      setMsgType("error");
      return;
    }
    
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // ADD / UPDATE
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("content", form.content.trim());
    formData.append("is_important", form.is_important);

    if (form.image) formData.append("image", form.image);

    try {
      if (editId) {
        await fetch(API + editId + "/", {
          method: "PUT",
          body: formData,
        });
        setMsg("✅ Notice updated successfully");
        setMsgType("success");
      } else {
        await fetch(API, {
          method: "POST",
          body: formData,
        });
        setMsg("✅ Notice added successfully");
        setMsgType("success");
      }

      setForm({ title: "", content: "", image: null, is_important: false });
      setPreview(null);
      setEditId(null);
      fetchNotices();
    } catch (error) {
      setMsg("❌ Error saving notice");
      setMsgType("error");
    }
  };

  // DELETE
  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure to delete notice "${title}"?`
    );
    if (!confirmDelete) return;

    try {
      await fetch(API + id + "/", { method: "DELETE" });
      setMsg(`🗑️ Notice "${title}" deleted successfully`);
      setMsgType("success");
      fetchNotices();
    } catch (error) {
      setMsg("❌ Error deleting notice");
      setMsgType("error");
    }
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
    
    // scroll + highlight
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
      formRef.current.style.boxShadow = "0 0 0 3px #10b981";
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.boxShadow = "";
        }
      }, 1500);
    }
  };

  // CANCEL EDIT
  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ title: "", content: "", image: null, is_important: false });
    setPreview(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div style={styles.container}>
      {/* BACK BUTTON */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate("/admin-dashboard")}>
          ⬅ {isMobile ? "Back" : "Back to Dashboard"}
        </button>
      </div>

      <h2 style={styles.title}>Notice Management</h2>

      {/* MESSAGE */}
      {msg && (
        <div style={{...styles.message, ...(msgType === "error" ? styles.errorMessage : {})}}>
          {msg}
        </div>
      )}

      {/* FORM */}
      <div style={styles.form} ref={formRef}>
        <div style={styles.inputGroup}>
          <input
            placeholder="Notice Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={styles.input}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => {
              e.target.style.border = "1px solid #e5e7eb";
              const error = validateTitle(form.title);
              if (error && form.title) {
                setMsg(error);
                setMsgType("error");
              }
            }}
          />
          {form.title && validateTitle(form.title) && (
            <span style={styles.errorText}>{validateTitle(form.title)}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <textarea
            placeholder="Notice Content * (Minimum 10 characters)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            style={styles.textarea}
            rows={4}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => {
              e.target.style.border = "1px solid #e5e7eb";
              const error = validateContent(form.content);
              if (error && form.content) {
                setMsg(error);
                setMsgType("error");
              }
            }}
          />
          {form.content && validateContent(form.content) && (
            <span style={styles.errorText}>{validateContent(form.content)}</span>
          )}
          <span style={styles.charCount}>
            {form.content.length}/1000 characters
          </span>
        </div>

        <div style={styles.row}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.is_important}
              onChange={(e) =>
                setForm({ ...form, is_important: e.target.checked })
              }
            />
            <span>⭐ Mark as Important</span>
          </label>

          <div style={styles.fileInput}>
            <label style={styles.fileLabel}>
              📷 Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(e.target.files[0])}
                style={styles.hiddenInput}
              />
            </label>
          </div>
        </div>

        {preview && (
          <div style={styles.previewContainer}>
            <img src={preview} style={styles.preview} alt="Preview" />
            <button
              style={styles.removeImage}
              onClick={() => {
                setPreview(null);
                setForm({ ...form, image: null });
              }}
            >
              ✕ Remove
            </button>
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button style={styles.addBtn} onClick={handleSubmit}>
            {editId ? "✏️ Update Notice" : "➕ Add Notice"}
          </button>
          
          {editId && (
            <button style={styles.cancelBtn} onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* NOTICES LIST */}
      <div style={styles.listContainer}>
        <h3 style={styles.listTitle}>
          All Notices ({notices.length})
        </h3>
        
        {isMobile ? (
          // Mobile Card View
          <div style={styles.mobileCardContainer}>
            {notices.map((notice) => (
              <div
                key={notice.id}
                style={{
                  ...styles.mobileCard,
                  borderLeft: notice.is_important ? "4px solid #f59e0b" : "4px solid #10b981"
                }}
                onClick={() => setSelectedNotice(notice)}
              >
                <div style={styles.mobileCardHeader}>
                  {notice.image_url && (
                    <img src={notice.image_url} style={styles.mobileCardImage} alt={notice.title} />
                  )}
                  <div style={styles.mobileCardInfo}>
                    <h4 style={styles.mobileCardTitle}>
                      {notice.title}
                      {notice.is_important && (
                        <span style={styles.importantBadge}>Important</span>
                      )}
                    </h4>
                    {notice.created_at && (
                      <span style={styles.mobileCardDate}>
                        📅 {formatDate(notice.created_at)}
                      </span>
                    )}
                  </div>
                </div>
                <p style={styles.mobileCardContent}>
                  {notice.content.length > 100 
                    ? `${notice.content.substring(0, 100)}...` 
                    : notice.content}
                </p>
                <div style={styles.mobileCardActions}>
                  <button
                    style={styles.mobileEditBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(notice);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    style={styles.mobileDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notice.id, notice.title);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
            {notices.length === 0 && (
              <div style={styles.noResults}>No notices found. Add your first notice!</div>
            )}
          </div>
        ) : (
          // Desktop Table View
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Content</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice, index) => (
                <tr
                  key={notice.id}
                  style={{
                    ...styles.row,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                  onClick={() => setSelectedNotice(notice)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#ffffff" : "#f9fafb";
                  }}
                >
                  <td style={styles.td}>
                    {notice.image_url ? (
                      <img src={notice.image_url} style={styles.tableImage} alt={notice.title} />
                    ) : (
                      <div style={styles.placeholderImage}>📄</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.titleContainer}>
                      <span style={styles.noticeTitle}>{notice.title}</span>
                      {notice.is_important && (
                        <span style={styles.importantBadge}>Important</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.contentPreview}>
                      {notice.content.length > 80 
                        ? `${notice.content.substring(0, 80)}...` 
                        : notice.content}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.dateText}>
                      {notice.created_at ? formatDate(notice.created_at) : "—"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(notice);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notice.id, notice.title);
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isMobile && notices.length === 0 && (
          <div style={styles.noResults}>No notices found. Add your first notice!</div>
        )}
      </div>

      {/* NOTICE DETAIL MODAL */}
      {selectedNotice && (
        <div style={styles.overlay} onClick={() => setSelectedNotice(null)}>
          <div style={isMobile ? styles.cardMobile : styles.card} onClick={(e) => e.stopPropagation()}>
            <button style={styles.cardClose} onClick={() => setSelectedNotice(null)}>
              ✕
            </button>

            <div style={styles.cardHeader}>
              {selectedNotice.image_url && (
                <img src={selectedNotice.image_url} style={styles.cardImage} alt={selectedNotice.title} />
              )}
              <h2 style={styles.cardTitle}>
                {selectedNotice.title}
                {selectedNotice.is_important && (
                  <span style={styles.cardImportantBadge}>Important</span>
                )}
              </h2>
              {selectedNotice.created_at && (
                <div style={styles.cardDate}>
                  📅 Posted on {formatDate(selectedNotice.created_at)}
                </div>
              )}
            </div>

            <div style={styles.cardBody}>
              <div style={styles.cardContent}>
                {selectedNotice.content}
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button
                style={styles.cardEditBtn}
                onClick={() => {
                  handleEdit(selectedNotice);
                  setSelectedNotice(null);
                }}
              >
                ✏️ Edit Notice
              </button>
              <button
                style={styles.cardDeleteBtn}
                onClick={() => {
                  handleDelete(selectedNotice.id, selectedNotice.title);
                  setSelectedNotice(null);
                }}
              >
                🗑️ Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "15px",
    maxWidth: "1200px",
    margin: "auto",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  topBar: {
    marginBottom: "15px",
  },

  backBtn: {
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    WebkitTapHighlightColor: "transparent",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "clamp(24px, 6vw, 32px)",
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
    fontSize: "14px",
  },

  errorMessage: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
  },

  errorText: {
    fontSize: "12px",
    color: "#dc2626",
    marginTop: "4px",
    display: "block",
  },

  charCount: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "4px",
    textAlign: "right",
  },

  form: {
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "16px",
    transition: "all 0.2s",
    outline: "none",
    fontFamily: "inherit",
    WebkitAppearance: "none",
  },

  textarea: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "16px",
    transition: "all 0.2s",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#374151",
  },

  fileInput: {
    position: "relative",
  },

  fileLabel: {
    background: "#f3f4f6",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#374151",
    display: "inline-block",
    transition: "all 0.2s",
  },

  hiddenInput: {
    display: "none",
  },

  previewContainer: {
    position: "relative",
    display: "inline-block",
    marginBottom: "15px",
  },

  preview: {
    width: "120px",
    height: "120px",
    borderRadius: "12px",
    objectFit: "cover",
    border: "2px solid #10b981",
  },

  removeImage: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonGroup: {
    display: "flex",
    gap: "10px",
  },

  addBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
    WebkitTapHighlightColor: "transparent",
  },

  cancelBtn: {
    flex: 1,
    background: "#6b7280",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  },

  listContainer: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  listTitle: {
    padding: "16px 20px",
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
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
    padding: "14px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
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
    padding: "12px 12px",
    verticalAlign: "middle",
  },

  tableImage: {
    width: "50px",
    height: "50px",
    borderRadius: "8px",
    objectFit: "cover",
  },

  placeholderImage: {
    width: "50px",
    height: "50px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  noticeTitle: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "14px",
  },

  importantBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "600",
    display: "inline-block",
  },

  contentPreview: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.4",
  },

  dateText: {
    fontSize: "12px",
    color: "#6b7280",
    whiteSpace: "nowrap",
  },

  editBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    marginRight: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
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
    WebkitTapHighlightColor: "transparent",
  },

  // Mobile Card Styles
  mobileCardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
  },

  mobileCard: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  },

  mobileCardHeader: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
  },

  mobileCardImage: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
  },

  mobileCardInfo: {
    flex: 1,
  },

  mobileCardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  mobileCardDate: {
    fontSize: "11px",
    color: "#6b7280",
  },

  mobileCardContent: {
    fontSize: "13px",
    color: "#4b5563",
    lineHeight: "1.5",
    marginBottom: "12px",
  },

  mobileCardActions: {
    display: "flex",
    gap: "10px",
  },

  mobileEditBtn: {
    flex: 1,
    background: "#3b82f6",
    color: "white",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },

  mobileDeleteBtn: {
    flex: 1,
    background: "#ef4444",
    color: "white",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },

  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "14px",
  },

  // Modal Styles
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "16px",
  },

  card: {
    position: "relative",
    background: "white",
    borderRadius: "24px",
    width: "500px",
    maxWidth: "100%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },

  cardMobile: {
    position: "relative",
    background: "white",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "95%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },

  cardClose: {
    position: "sticky",
    top: "12px",
    left: "calc(100% - 44px)",
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
    zIndex: 10,
    margin: "12px 12px 0 auto",
    WebkitTapHighlightColor: "transparent",
  },

  cardHeader: {
    padding: "0 24px 20px",
    textAlign: "center",
  },

  cardImage: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  cardTitle: {
    fontSize: "clamp(20px, 5vw, 24px)",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  cardImportantBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  cardDate: {
    fontSize: "12px",
    color: "#6b7280",
  },

  cardBody: {
    padding: "0 24px 20px",
  },

  cardContent: {
    fontSize: "15px",
    color: "#374151",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
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
    padding: "12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    WebkitTapHighlightColor: "transparent",
  },

  cardDeleteBtn: {
    flex: 1,
    padding: "12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    WebkitTapHighlightColor: "transparent",
  },
};

export default Notices;