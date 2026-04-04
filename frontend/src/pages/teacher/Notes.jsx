import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "http://127.0.0.1:8000/api/";
const FILE_BASE = "http://127.0.0.1:8000";

function TeacherNotes() {
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [course, setCourse] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");

  // FIX: Safe localStorage parsing with cleanup
  useEffect(() => {
    const raw = localStorage.getItem("teacher");
    let stored = null;
    
    try {
      stored = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Error parsing teacher data:", error);
      stored = null;
      localStorage.removeItem("teacher");
    }
    
    if (stored?.teacher_id) {
      fetchData(stored.teacher_id);
    } else {
      setLoading(false);
    }
    
    // FIX: Style injection with cleanup
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (max-width: 768px) {
        .form-row { grid-template-columns: 1fr !important; gap: 16px !important; }
        .list-header { flex-direction: column !important; align-items: flex-start !important; }
        .list-controls { width: 100% !important; justify-content: space-between !important; }
        .filter-select { flex: 1 !important; }
        td { padding: 10px 12px !important; }
        .download-btn, .delete-btn { padding: 4px 10px !important; font-size: 11px !important; }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const fetchData = async (teacherId) => {
    try {
      const [coursesRes, notesRes, teacherRes] = await Promise.all([
        axios.get(`${API}courses/`),
        axios.get(`${API}notes/`),
        axios.get(`${API}teachers/${teacherId}/`)
      ]);
      
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      // FIX: Ensure notes is array
      setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
      
      const teacherData = teacherRes.data;
      setTeacher(teacherData);
      
      if (teacherData.course) {
        setCourse(String(teacherData.course));
        setSelectedCourseFilter(String(teacherData.course));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      setCourses([]);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!course) {
      toast.error("Please select a course/class");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("file", file);
    formData.append("course", course);

    setUploading(true);
    try {
      const res = await axios.post(`${API}notes/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.data) {
        toast.success("✅ Note uploaded successfully");
        setTitle("");
        setFile(null);
        const notesRes = await axios.get(`${API}notes/`);
        setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload note");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await axios.delete(`${API}notes/${id}/`);
      toast.success("Note deleted successfully");
      const notesRes = await axios.get(`${API}notes/`);
      setNotes(Array.isArray(notesRes.data) ? notesRes.data : []);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete note");
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    return `${FILE_BASE}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const handleView = (note) => {
    const url = getFileUrl(note.file);
    if (!url) {
      toast.error("Preview not available for this file");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📁';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (ext === 'doc' || ext === 'docx') return '📝';
    if (ext === 'ppt' || ext === 'pptx') return '📊';
    if (ext === 'xls' || ext === 'xlsx') return '📈';
    return '📁';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getCourseName = (courseId) => {
    const courseObj = courses.find(c => c.id == courseId);
    return courseObj ? courseObj.name : "Unknown";
  };

  const filteredNotes = selectedCourseFilter
    ? notes.filter(n => n.course == selectedCourseFilter)
    : notes;

  const assignedCourseOnly = Boolean(teacher?.course);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={styles.header}>
        <h1 style={styles.title}>📄 Study Materials</h1>
        <p style={styles.subtitle}>Upload and manage notes, worksheets, and resources</p>
      </div>

      {/* Upload Form */}
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h3>Upload New Material</h3>
        </div>
        
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              placeholder="Enter title (e.g., Mathematics Chapter 1)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Course/Class *</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={assignedCourseOnly}
                style={styles.select}
              >
                <option value="">Select Class</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {assignedCourseOnly && teacher && (
                <p style={styles.hintText}>You are assigned to: {teacher.course_name}</p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>File *</label>
              <div style={styles.fileWrapper}>
                <input
                  id="file-input"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={styles.fileInput}
                />
                {file && (
                  <span style={styles.fileName}>
                    {getFileIcon(file.name)} {file.name}
                  </span>
                )}
              </div>
              <p style={styles.fileHint}>Supported: PDF, Images, Documents, Presentations</p>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={styles.submitBtn}
          >
            {uploading ? "⏳ Uploading..." : "📤 Upload Note"}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div style={styles.listCard}>
        <div style={styles.listHeader}>
          <h3>All Notes</h3>
          <div style={styles.listControls}>
            {!assignedCourseOnly && (
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Classes</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <span style={styles.countBadge}>{filteredNotes.length} notes</span>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3>No Notes Found</h3>
            <p>Upload your first note to get started</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>File</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note.id} style={styles.tr}>
                    <td style={styles.tdFile}>
                      <span style={styles.fileIcon}>{getFileIcon(note.file)}</span>
                    </td>
                    <td style={styles.tdTitle}>
                      <strong>{note.title}</strong>
                    </td>
                    <td style={styles.tdCourse}>
                      <span style={styles.courseBadge}>{getCourseName(note.course)}</span>
                    </td>
                    <td style={styles.tdDate}>{formatDate(note.uploaded_at || note.created_at)}</td>
                    <td style={styles.tdActions}>
                      <button
                        type="button"
                        style={styles.viewBtn}
                        onClick={() => handleView(note)}
                      >
                        👁 View
                      </button>
                      <a
                        href={getFileUrl(note.file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        style={styles.downloadBtn}
                      >
                        📥 Download
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id, note.title)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: "28px",
    textAlign: "center",
  },
  title: {
    fontSize: "clamp(24px, 5vw, 32px)",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  formCard: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    marginBottom: "24px",
  },
  formHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    h3: {
      margin: 0,
      fontSize: "16px",
      fontWeight: "600",
      color: "#1e293b",
    },
  },
  form: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    "&:focus": {
      borderColor: "#22c55e",
      boxShadow: "0 0 0 2px rgba(34,197,94,0.1)",
    },
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    background: "white",
    cursor: "pointer",
  },
  fileWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fileInput: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    background: "white",
    cursor: "pointer",
  },
  fileName: {
    fontSize: "12px",
    color: "#22c55e",
    background: "#ecfdf5",
    padding: "6px 10px",
    borderRadius: "6px",
    display: "inline-block",
    width: "fit-content",
  },
  fileHint: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  hintText: {
    fontSize: "11px",
    color: "#22c55e",
    marginTop: "4px",
  },
  submitBtn: {
    padding: "12px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "8px",
    "&:hover": {
      background: "#16a34a",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
  listCard: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    h3: {
      margin: 0,
      fontSize: "16px",
      fontWeight: "600",
      color: "#1e293b",
    },
  },
  listControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  filterSelect: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    outline: "none",
    background: "white",
    cursor: "pointer",
  },
  countBadge: {
    background: "#e2e8f0",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    background: "#fafbfc",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    "&:hover": {
      background: "#f8fafc",
    },
  },
  tdFile: {
    padding: "12px 16px",
    width: "60px",
  },
  tdTitle: {
    padding: "12px 16px",
  },
  tdCourse: {
    padding: "12px 16px",
  },
  tdDate: {
    padding: "12px 16px",
    whiteSpace: "nowrap",
  },
  tdActions: {
    padding: "12px 16px",
    whiteSpace: "nowrap",
  },
  fileIcon: {
    fontSize: "24px",
  },
  courseBadge: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  viewBtn: {
    display: "inline-block",
    background: "#e0f2fe",
    color: "#0369a1",
    border: "none",
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    marginRight: "8px",
    cursor: "pointer",
  },
  downloadBtn: {
    display: "inline-block",
    background: "#22c55e",
    color: "white",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    marginRight: "8px",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
    "&:hover": {
      background: "#dc2626",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    gap: "15px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#22c55e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default TeacherNotes;