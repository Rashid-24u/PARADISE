import { useEffect, useState } from "react";
import axios from "axios";

function StudentNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [previewNote, setPreviewNote] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("student"));
    if (stored?.student_id) {
      fetchStudentAndNotes(stored.student_id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStudentAndNotes = async (studentId) => {
    try {
      const studentRes = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}/`);
      const student = studentRes.data;
      setStudentInfo(student);
      
      if (student.course) {
        const notesRes = await axios.get(`http://127.0.0.1:8000/api/notes/?course=${student.course}`);
        setNotes(notesRes.data);
      } else {
        setNotes([]);
      }
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { type: 'pdf', icon: '📄', name: 'PDF', color: '#ef4444', bg: '#fee2e2' };
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return { type: 'image', icon: '🖼️', name: 'IMAGE', color: '#10b981', bg: '#ecfdf5' };
    if (ext === 'doc' || ext === 'docx') return { type: 'doc', icon: '📝', name: 'DOC', color: '#3b82f6', bg: '#eff6ff' };
    if (ext === 'ppt' || ext === 'pptx') return { type: 'ppt', icon: '📊', name: 'PPT', color: '#f59e0b', bg: '#fffbeb' };
    if (ext === 'xls' || ext === 'xlsx') return { type: 'excel', icon: '📈', name: 'XLS', color: '#22c55e', bg: '#ecfdf5' };
    return { type: 'file', icon: '📁', name: 'FILE', color: '#6b7280', bg: '#f3f4f6' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDownload = async (note, index) => {
    setDownloadStatus(prev => ({ ...prev, [index]: 'downloading' }));
    
    try {
      const fileUrl = `http://127.0.0.1:8000${note.file}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = note.title + (note.file?.split('.').pop() ? `.${note.file.split('.').pop()}` : '');
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDownloadStatus(prev => ({ ...prev, [index]: 'success' }));
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [index]: null }));
      }, 2000);
    } catch (err) {
      setDownloadStatus(prev => ({ ...prev, [index]: 'error' }));
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [index]: null }));
      }, 2000);
    }
  };

  const handlePreview = (note) => {
    const fileType = getFileType(note.file);
    const fileUrl = `http://127.0.0.1:8000${note.file}`;
    
    if (fileType.type === 'image') {
      setPreviewNote({ ...note, fileUrl, type: 'image' });
    } else if (fileType.type === 'pdf') {
      window.open(fileUrl, '_blank');
    } else {
      handleDownload(note, -1);
    }
  };

  const closePreview = () => {
    setPreviewNote(null);
  };

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading study materials...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>📚</div>
        <h1 style={styles.title}>Study Materials</h1>
        <p style={styles.subtitle}>Download notes, worksheets, and study resources</p>
      </div>

      {/* Course Info Card */}
      {studentInfo && (
        <div style={styles.courseInfo}>
          <div style={styles.courseBadge}>
            <span style={styles.courseIcon}>📚</span>
            <span>Your Course:</span>
            <strong>{studentInfo.course_name || "Not Assigned"}</strong>
          </div>
          <div style={styles.noteCount}>
            <span style={styles.countNumber}>{notes.length}</span>
            <span>{notes.length === 1 ? 'note' : 'notes'} available for your class</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <div className="search-box-wrapper" style={styles.searchBoxWrapper}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search notes by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button style={styles.clearBtn} onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No Notes Available</h3>
          {searchTerm ? (
            <p>No notes match your search "{searchTerm}"</p>
          ) : (
            <p>No study materials have been uploaded for your course yet.</p>
          )}
          <p style={styles.emptyHint}>Check back later for new resources!</p>
        </div>
      ) : (
        <div style={styles.notesGrid}>
          {filteredNotes.map((note, idx) => {
            const fileType = getFileType(note.file);
            const isDownloading = downloadStatus[idx] === 'downloading';
            const isSuccess = downloadStatus[idx] === 'success';
            const isError = downloadStatus[idx] === 'error';
            
            return (
              <div key={note.id} style={styles.noteCard}>
                <div style={{...styles.noteIcon, background: fileType.bg}}>
                  <span style={styles.iconEmoji}>{fileType.icon}</span>
                  <span style={{...styles.fileTypeBadge, color: fileType.color}}>
                    {fileType.name}
                  </span>
                </div>
                
                <div style={styles.noteContent}>
                  <h3 style={styles.noteTitle}>{note.title}</h3>
                  <div style={styles.noteMeta}>
                    <span style={styles.noteDate}>📅 {formatDate(note.uploaded_at || note.created_at)}</span>
                  </div>
                </div>
                
                <div style={styles.actionButtons}>
                  {(fileType.type === 'image' || fileType.type === 'pdf') && (
                    <button 
                      style={styles.previewBtn}
                      onClick={() => handlePreview(note)}
                      title="Preview"
                    >
                      👁️ Preview
                    </button>
                  )}
                  
                  <button 
                    style={{
                      ...styles.downloadBtn,
                      ...(isDownloading && styles.downloadingBtn),
                      ...(isSuccess && styles.successBtn),
                      ...(isError && styles.errorBtn)
                    }}
                    onClick={() => handleDownload(note, idx)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? '⏳ Downloading...' : 
                     isSuccess ? '✅ Downloaded!' : 
                     isError ? '❌ Failed' : 
                     '📥 Download'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewNote && previewNote.type === 'image' && (
        <div style={styles.modalOverlay} onClick={closePreview}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>{previewNote.title}</h3>
              <button style={styles.modalClose} onClick={closePreview}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <img 
                src={previewNote.fileUrl} 
                alt={previewNote.title}
                style={styles.previewImage}
              />
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={styles.downloadModalBtn}
                onClick={() => {
                  handleDownload(previewNote, -1);
                  closePreview();
                }}
              >
                📥 Download
              </button>
              <button style={styles.closeModalBtn} onClick={closePreview}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {notes.length > 0 && (
        <div style={styles.tipCard}>
          <div style={styles.tipIcon}>💡</div>
          <div style={styles.tipContent}>
            <h4>Study Tips</h4>
            <p>Review these notes regularly, take handwritten notes while studying, and don't hesitate to ask your teacher if you have questions!</p>
            <div style={styles.tipHint}>
              <span>📄 PDF files open in new tab</span>
              <span>🖼️ Images can be previewed</span>
              <span>📥 All files can be downloaded</span>
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
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
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
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  headerIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  title: {
    fontSize: "clamp(28px, 5vw, 36px)",
    fontWeight: "700",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1e293b, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  courseInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    background: "linear-gradient(135deg, #f8fafc, #ffffff)",
    padding: "16px 24px",
    borderRadius: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  courseBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#475569",
  },
  courseIcon: {
    fontSize: "18px",
  },
  noteCount: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    background: "#ecfdf5",
    padding: "8px 16px",
    borderRadius: "40px",
    color: "#10b981",
    fontWeight: "500",
  },
  countNumber: {
    fontSize: "20px",
    fontWeight: "700",
  },
  searchBar: {
    marginBottom: "32px",
  },
  searchBoxWrapper: {
    position: "relative",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "0 16px",
    transition: "all 0.3s ease",
  },
  searchIcon: {
    fontSize: "18px",
    color: "#94a3b8",
  },
  searchInput: {
    flex: 1,
    padding: "14px 12px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    background: "transparent",
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#94a3b8",
    padding: "8px",
    borderRadius: "8px",
  },
  notesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  noteCard: {
    background: "white",
    borderRadius: "24px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    border: "1px solid #eef2ff",
  },
  noteIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },
  iconEmoji: {
    fontSize: "32px",
  },
  fileTypeBadge: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 6px 0",
    color: "#0f172a",
    lineHeight: "1.4",
  },
  noteMeta: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  noteDate: {
    fontSize: "11px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  previewBtn: {
    padding: "8px 14px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  downloadBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  downloadingBtn: {
    background: "#f59e0b",
    cursor: "wait",
  },
  successBtn: {
    background: "#10b981",
  },
  errorBtn: {
    background: "#ef4444",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalContent: {
    background: "white",
    borderRadius: "28px",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid #e2e8f0",
    background: "white",
  },
  modalClose: {
    background: "#f1f5f9",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#64748b",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  modalBody: {
    padding: "24px",
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    borderRadius: "12px",
  },
  modalFooter: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    background: "white",
  },
  downloadModalBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  closeModalBtn: {
    padding: "10px 24px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "28px",
    marginBottom: "32px",
  },
  emptyIcon: {
    fontSize: "72px",
    marginBottom: "20px",
  },
  emptyHint: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "12px",
  },
  tipCard: {
    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    border: "1px solid #a7f3d0",
  },
  tipIcon: {
    fontSize: "40px",
  },
  tipContent: {
    flex: 1,
  },
  tipHint: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
};

// Add global styles with proper CSS (not inline)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .search-box-wrapper:focus-within .search-box {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
  }
  
  .note-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    border-color: #10b981;
  }
  
  .preview-btn:hover {
    background: #e2e8f0;
    transform: scale(1.02);
  }
  
  .download-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  }
  
  .modal-close:hover {
    background: #e2e8f0;
    transform: scale(1.05);
  }
  
  .download-modal-btn:hover,
  .close-modal-btn:hover {
    transform: scale(1.02);
  }
  
  .clear-btn:hover {
    background: #f1f5f9;
  }
  
  .tip-hint span {
    font-size: 12px;
    color: #10b981;
    background: white;
    padding: 6px 14px;
    border-radius: 30px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  
  .tip-content h4 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #065f46;
  }
  
  .tip-content p {
    font-size: 14px;
    color: #047857;
    margin: 0 0 12px 0;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    .notes-grid {
      grid-template-columns: 1fr;
    }
    
    .note-card {
      flex-wrap: wrap;
    }
    
    .action-buttons {
      width: 100%;
      justify-content: flex-end;
    }
  }
`;
document.head.appendChild(styleSheet);

export default StudentNotes;