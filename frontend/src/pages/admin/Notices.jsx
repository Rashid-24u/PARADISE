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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const validateTitle = (title) => {
    if (!title || title.trim() === "") return "Title is required";
    if (title.length < 3) return "Title must be at least 3 characters";
    if (title.length > 100) return "Title must be less than 100 characters";
    return null;
  };

  const validateContent = (content) => {
    if (!content || content.trim() === "") return "Content is required";
    if (content.length < 10) return "Content must be at least 10 characters";
    if (content.length > 1000) return "Content must be less than 1000 characters";
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

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMsg("Image size must be less than 5MB");
      setMsgType("error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMsg("Please select a valid image file");
      setMsgType("error");
      return;
    }
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("content", form.content.trim());
    formData.append("is_important", form.is_important);
    if (form.image) formData.append("image", form.image);

    try {
      if (editId) {
        await fetch(API + editId + "/", { method: "PUT", body: formData });
        setMsg("✅ Notice updated successfully");
        setMsgType("success");
      } else {
        await fetch(API, { method: "POST", body: formData });
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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure to delete notice "${title}"?`)) return;
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

  const handleEdit = (n) => {
    setForm({
      title: n.title,
      content: n.content,
      image: null,
      is_important: n.is_important,
    });
    setPreview(n.image_url);
    setEditId(n.id);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
      formRef.current.style.boxShadow = "0 0 0 2px #059669";
      setTimeout(() => {
        if (formRef.current) formRef.current.style.boxShadow = "";
      }, 1500);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ title: "", content: "", image: null, is_important: false });
    setPreview(null);
  };

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
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/admin-dashboard")}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>Notice Board</h1>
        <p style={styles.subtitle}>Manage announcements and important updates</p>
      </div>

      {/* Toast Message */}
      {msg && (
        <div style={{...styles.toast, ...(msgType === "error" ? styles.toastError : styles.toastSuccess)}}>
          {msg}
        </div>
      )}

      {/* Form Section */}
      <div style={styles.formCard} ref={formRef}>
        <div style={styles.formHeader}>
          <h3 style={styles.formTitle}>{editId ? "Edit Notice" : "Create New Notice"}</h3>
          {editId && (
            <button style={styles.cancelEditBtn} onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>

        <div style={styles.formBody}>
          <div style={styles.formField}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              placeholder="Enter notice title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={styles.input}
            />
            {form.title && validateTitle(form.title) && (
              <span style={styles.errorText}>{validateTitle(form.title)}</span>
            )}
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>Content *</label>
            <textarea
              placeholder="Enter notice content (minimum 10 characters)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={styles.textarea}
              rows={4}
            />
            <div style={styles.fieldFooter}>
              {form.content && validateContent(form.content) && (
                <span style={styles.errorText}>{validateContent(form.content)}</span>
              )}
              <span style={styles.charCount}>{form.content.length}/1000</span>
            </div>
          </div>

          <div style={styles.formRow}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.is_important}
                onChange={(e) => setForm({ ...form, is_important: e.target.checked })}
              />
              <span>Mark as Important</span>
            </label>

            <div style={styles.fileUpload}>
              <label style={styles.fileLabel}>
                <span>📷</span> Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {preview && (
            <div style={styles.previewWrapper}>
              <div style={styles.previewContainer}>
                <img src={preview} style={styles.previewImage} alt="Preview" />
                <button
                  style={styles.removePreviewBtn}
                  onClick={() => {
                    setPreview(null);
                    setForm({ ...form, image: null });
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <button style={styles.submitBtn} onClick={handleSubmit}>
            {editId ? "Update Notice" : "Publish Notice"}
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div style={styles.listCard}>
        <div style={styles.listHeader}>
          <h3 style={styles.listTitle}>All Notices</h3>
          <span style={styles.listCount}>{notices.length} notices</span>
        </div>

        {isMobile ? (
          <div style={styles.mobileList}>
            {notices.length === 0 ? (
              <div style={styles.emptyState}>No notices found. Create your first notice!</div>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  style={{
                    ...styles.mobileCard,
                    borderLeftColor: notice.is_important ? "#f59e0b" : "#059669",
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
                        {notice.is_important && <span style={styles.importantChip}>Important</span>}
                      </h4>
                      <span style={styles.mobileCardDate}>{formatDate(notice.created_at)}</span>
                    </div>
                  </div>
                  <p style={styles.mobileCardContent}>
                    {notice.content.length > 100 ? `${notice.content.substring(0, 100)}...` : notice.content}
                  </p>
                  <div style={styles.mobileCardActions}>
                    <button style={styles.editBtnSmall} onClick={(e) => { e.stopPropagation(); handleEdit(notice); }}>Edit</button>
                    <button style={styles.deleteBtnSmall} onClick={(e) => { e.stopPropagation(); handleDelete(notice.id, notice.title); }}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.thImage}>Image</th>
                  <th style={styles.thTitle}>Title</th>
                  <th style={styles.thContent}>Content</th>
                  <th style={styles.thDate}>Date</th>
                  <th style={styles.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notices.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyRow}>No notices found. Create your first notice!</td>
                  </tr>
                ) : (
                  notices.map((notice, idx) => (
                    <tr 
                      key={notice.id} 
                      style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                      onClick={() => setSelectedNotice(notice)}
                    >
                      <td style={styles.tdImage}>
                        {notice.image_url ? (
                          <div style={styles.imageContainer}>
                            <img src={notice.image_url} style={styles.tableImage} alt={notice.title} />
                          </div>
                        ) : (
                          <div style={styles.placeholderImage}>📄</div>
                        )}
                      </td>
                      <td style={styles.tdTitle}>
                        <div style={styles.titleContainer}>
                          <span style={styles.noticeTitle}>{notice.title}</span>
                          {notice.is_important && <span style={styles.importantChip}>Important</span>}
                        </div>
                      </td>
                      <td style={styles.tdContent}>
                        <div style={styles.contentPreview}>
                          {notice.content.length > 80 ? `${notice.content.substring(0, 80)}...` : notice.content}
                        </div>
                      </td>
                      <td style={styles.tdDate}>
                        <div style={styles.dateBadge}>{formatDate(notice.created_at)}</div>
                      </td>
                      <td style={styles.tdActions}>
                        <button 
                          className="edit-btn"
                          style={styles.editBtnSmall} 
                          onClick={(e) => { e.stopPropagation(); handleEdit(notice); }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="delete-btn"
                          style={styles.deleteBtnSmall} 
                          onClick={(e) => { e.stopPropagation(); handleDelete(notice.id, notice.title); }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notice Detail Modal with Full Size Image */}
      {selectedNotice && (
        <div style={styles.modalOverlay} onClick={() => setSelectedNotice(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setSelectedNotice(null)}>✕</button>
            
            {selectedNotice.image_url && (
              <div style={styles.modalImageContainer}>
                <img 
                  src={selectedNotice.image_url} 
                  style={styles.modalImage} 
                  alt={selectedNotice.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open full size in new tab on click
                    window.open(selectedNotice.image_url, '_blank');
                  }}
                />
                <div style={styles.fullSizeHint}>Click image to view full size</div>
              </div>
            )}
            
            <div style={styles.modalBody}>
              <h2 style={styles.modalTitle}>
                {selectedNotice.title}
                {selectedNotice.is_important && <span style={styles.modalImportantBadge}>Important</span>}
              </h2>
              <div style={styles.modalDate}>📅 {formatDate(selectedNotice.created_at)}</div>
              <div style={styles.modalContentText}>{selectedNotice.content}</div>
            </div>
            
            <div style={styles.modalFooter}>
              <button style={styles.modalEditBtn} onClick={() => { handleEdit(selectedNotice); setSelectedNotice(null); }}>✏️ Edit Notice</button>
              <button style={styles.modalDeleteBtn} onClick={() => { handleDelete(selectedNotice.id, selectedNotice.title); setSelectedNotice(null); }}>🗑️ Delete Notice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#f5f7fb",
    minHeight: "calc(100vh - 70px)",
  },
  header: {
    marginBottom: "28px",
  },
  backBtn: {
    background: "#1a472a",
    color: "white",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "16px",
    transition: "all 0.2s",
    ":hover": {
      transform: "translateY(-1px)",
      background: "#0f3620",
    },
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a472a",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "10px",
    zIndex: 1001,
    fontSize: "13px",
    fontWeight: "500",
    animation: "slideIn 0.3s ease",
  },
  toastSuccess: {
    background: "#059669",
    color: "white",
  },
  toastError: {
    background: "#dc2626",
    color: "white",
  },
  formCard: {
    background: "white",
    borderRadius: "16px",
    marginBottom: "28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
    background: "#fafbfc",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  cancelEditBtn: {
    background: "#f1f5f9",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    color: "#475569",
    transition: "all 0.2s",
    ":hover": {
      background: "#e2e8f0",
    },
  },
  formBody: {
    padding: "24px",
  },
  formField: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
    ":focus": {
      borderColor: "#059669",
      boxShadow: "0 0 0 2px rgba(5,150,105,0.1)",
    },
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    ":focus": {
      borderColor: "#059669",
      boxShadow: "0 0 0 2px rgba(5,150,105,0.1)",
    },
  },
  fieldFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },
  errorText: {
    fontSize: "11px",
    color: "#dc2626",
  },
  charCount: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  formRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#334155",
  },
  fileUpload: {
    position: "relative",
  },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#f1f5f9",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    color: "#475569",
    transition: "all 0.2s",
    ":hover": {
      background: "#e2e8f0",
    },
  },
  previewWrapper: {
    marginBottom: "20px",
  },
  previewContainer: {
    position: "relative",
    display: "inline-block",
  },
  previewImage: {
    width: "100px",
    height: "100px",
    borderRadius: "10px",
    objectFit: "cover",
    border: "1px solid #e2e8f0",
  },
  removePreviewBtn: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#dc2626",
    color: "white",
    border: "2px solid white",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "all 0.2s",
    ":hover": {
      transform: "scale(1.1)",
    },
  },
  submitBtn: {
    width: "100%",
    padding: "10px",
    background: "#059669",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#047857",
      transform: "translateY(-1px)",
    },
  },
  listCard: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e2e8f0",
    background: "#fafbfc",
  },
  listTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  listCount: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  tableHeaderRow: {
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  thImage: {
    padding: "14px 16px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    width: "80px",
  },
  thTitle: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  thContent: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  thDate: {
    padding: "14px 16px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    width: "110px",
  },
  thActions: {
    padding: "14px 16px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    width: "140px",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#f8fafc",
      transform: "translateX(2px)",
    },
  },
  tableRowAlt: {
    background: "#fafbfc",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#f1f5f9",
      transform: "translateX(2px)",
    },
  },
  tdImage: {
    padding: "12px 16px",
    textAlign: "center",
    verticalAlign: "middle",
  },
  tdTitle: {
    padding: "12px 16px",
    verticalAlign: "middle",
  },
  tdContent: {
    padding: "12px 16px",
    verticalAlign: "middle",
  },
  tdDate: {
    padding: "12px 16px",
    textAlign: "center",
    verticalAlign: "middle",
  },
  tdActions: {
    padding: "12px 16px",
    textAlign: "center",
    verticalAlign: "middle",
  },
  imageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tableImage: {
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    objectFit: "cover",
    border: "2px solid #e2e8f0",
    transition: "all 0.2s",
    ":hover": {
      transform: "scale(1.05)",
      borderColor: "#059669",
    },
  },
  placeholderImage: {
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    margin: "0 auto",
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
  importantChip: {
    display: "inline-block",
    background: "#fef3c7",
    color: "#92400e",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "600",
  },
  contentPreview: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
    maxWidth: "400px",
  },
  dateBadge: {
    display: "inline-block",
    background: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    color: "#475569",
    fontWeight: "500",
  },
  editBtnSmall: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "500",
    marginRight: "6px",
    transition: "all 0.2s",
    ":hover": {
      background: "#2563eb",
      transform: "translateY(-1px)",
    },
  },
  deleteBtnSmall: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "500",
    transition: "all 0.2s",
    ":hover": {
      background: "#b91c1c",
      transform: "translateY(-1px)",
    },
  },
  emptyRow: {
    textAlign: "center",
    padding: "48px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  mobileList: {
    padding: "16px",
  },
  mobileCard: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    border: "1px solid #e2e8f0",
    borderLeftWidth: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
  mobileCardHeader: {
    display: "flex",
    gap: "12px",
    marginBottom: "10px",
  },
  mobileCardImage: {
    width: "50px",
    height: "50px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  mobileCardInfo: {
    flex: 1,
  },
  mobileCardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    margin: "0 0 4px 0",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  mobileCardDate: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  mobileCardContent: {
    fontSize: "12px",
    color: "#64748b",
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  mobileCardActions: {
    display: "flex",
    gap: "8px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    position: "relative",
    background: "white",
    borderRadius: "20px",
    maxWidth: "650px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  modalClose: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "white",
    border: "1px solid #e2e8f0",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "all 0.2s",
    zIndex: 10,
    ":hover": {
      background: "#f1f5f9",
      transform: "scale(1.05)",
    },
  },
  modalImageContainer: {
    position: "relative",
    width: "100%",
    background: "#f8fafc",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    overflow: "hidden",
    cursor: "pointer",
  },
  modalImage: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "contain",
    background: "#f8fafc",
    transition: "transform 0.2s",
    ":hover": {
      transform: "scale(1.02)",
    },
  },
  fullSizeHint: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    pointerEvents: "none",
  },
  modalBody: {
    padding: "24px",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  modalImportantBadge: {
    display: "inline-block",
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  modalDate: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "16px",
  },
  modalContentText: {
    fontSize: "15px",
    color: "#334155",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
  },
  modalFooter: {
    display: "flex",
    gap: "12px",
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    background: "#fafbfc",
  },
  modalEditBtn: {
    flex: 1,
    padding: "10px",
    background: "#059669",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
    ":hover": {
      background: "#047857",
      transform: "translateY(-1px)",
    },
  },
  modalDeleteBtn: {
    flex: 1,
    padding: "10px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
    ":hover": {
      background: "#b91c1c",
      transform: "translateY(-1px)",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: "48px",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

// Add global hover and animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  button {
    transition: all 0.2s ease;
  }
  
  button:hover {
    transform: translateY(-1px);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  .edit-btn:hover, .delete-btn:hover {
    transform: translateY(-1px);
  }
  
  tr {
    transition: all 0.2s ease;
  }
  
  tr:hover {
    background: #f1f5f9 !important;
    transform: translateX(2px);
  }
  
  .mobile-card {
    transition: all 0.2s ease;
  }
  
  .mobile-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;
document.head.appendChild(styleSheet);

export default Notices;