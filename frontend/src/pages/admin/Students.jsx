import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Students() {
  const navigate = useNavigate();
  const formRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    student_class: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const API = "http://127.0.0.1:8000/api/students/";

  // Check screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // NORMALIZE CLASS - Handle Pre KG specially
  const normalize = (value) => {
    const trimmed = value.trim().toUpperCase();
    // Handle "PRE KG" to "PREKG" for consistent storage
    if (trimmed === "PRE KG" || trimmed === "PREKG") {
      return "PREKG";
    }
    return trimmed;
  };

  // Format for display - convert back to readable format
  const formatClassForDisplay = (className) => {
    if (className === "PREKG") return "Pre KG";
    return className;
  };

  // FETCH
  const fetchStudents = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // MESSAGE AUTO HIDE
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // VALIDATION FUNCTIONS
  const validateName = (name) => {
    if (!name || name.trim() === "") {
      return "Name is required";
    }
    if (name.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.length > 50) {
      return "Name must be less than 50 characters";
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return "Name should only contain letters and spaces";
    }
    return null;
  };

  const validateClass = (studentClass) => {
    if (!studentClass || studentClass.trim() === "") {
      return "Class is required";
    }
    const normalized = normalize(studentClass);
    const validClasses = ["PREKG", "LKG", "UKG", "1", "2", "3", "4", "5"];
    if (!validClasses.includes(normalized)) {
      return "Class must be Pre KG, LKG, UKG, or 1-5";
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") {
      return null; // Phone is optional
    }
    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return null;
  };

  const validateForm = () => {
    const nameError = validateName(form.name);
    if (nameError) {
      setMessage(nameError);
      setMessageType("error");
      return false;
    }

    const classError = validateClass(form.student_class);
    if (classError) {
      setMessage(classError);
      setMessageType("error");
      return false;
    }

    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setMessage(phoneError);
      setMessageType("error");
      return false;
    }

    return true;
  };

  // ADD / UPDATE
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      student_class: normalize(form.student_class),
      phone: form.phone || "",
    };

    try {
      if (editingId) {
        await fetch(API + editingId + "/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("✅ Student updated successfully");
        setMessageType("success");
        setEditingId(null);
      } else {
        await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("✅ Student added successfully");
        setMessageType("success");
      }

      setForm({ name: "", student_class: "", phone: "" });
      fetchStudents();
    } catch (error) {
      setMessage("❌ Error saving student");
      setMessageType("error");
    }
  };

  // DELETE
  const deleteStudent = async (student) => {
    const confirmDelete = window.confirm(
      `Are you sure to delete "${student.name}"?`
    );
    if (!confirmDelete) return;

    try {
      await fetch(API + student.id + "/", { method: "DELETE" });
      setMessage(`🗑️ ${student.name} deleted successfully`);
      setMessageType("success");
      fetchStudents();
    } catch (error) {
      setMessage("❌ Error deleting student");
      setMessageType("error");
    }
  };

  // EDIT LOAD
  const editStudent = (s) => {
    setForm({
      name: s.name,
      student_class: formatClassForDisplay(s.student_class),
      phone: s.phone || "",
    });
    setEditingId(s.id);
    
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

  // FILTER + SEARCH
  const filtered = students.filter((s) => {
    const normalizedStudentClass = normalize(s.student_class);
    const normalizedFilterClass = filterClass ? normalize(filterClass) : "";
    const classMatch = !filterClass || normalizedStudentClass === normalizedFilterClass;
    const nameMatch = s.name.toLowerCase().includes(search.toLowerCase());
    return classMatch && nameMatch;
  });

  // COUNT
  const classCount = {};
  students.forEach((s) => {
    const cls = formatClassForDisplay(s.student_class);
    classCount[cls] = (classCount[cls] || 0) + 1;
  });

  return (
    <div style={styles.container}>
      {/* BACK BUTTON */}
      <div style={styles.topBar}>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/admin-dashboard")}
        >
          ⬅ {isMobile ? "Back" : "Back to Dashboard"}
        </button>
      </div>

      <h2 style={styles.title}>Students Management</h2>

      {/* MESSAGE */}
      {message && (
        <div style={{...styles.message, ...(messageType === "error" ? styles.errorMessage : {})}}>
          {message}
        </div>
      )}

      {/* FORM */}
      <div style={styles.form} ref={formRef}>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => {
              e.target.style.border = "1px solid #d1d5db";
              const error = validateName(form.name);
              if (error && form.name) {
                setMessage(error);
                setMessageType("error");
              }
            }}
          />
          {form.name && validateName(form.name) && (
            <span style={styles.errorText}>{validateName(form.name)}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Class (Pre KG, LKG, UKG, 1-5) *"
            value={form.student_class}
            onChange={(e) => setForm({ ...form, student_class: e.target.value })}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => {
              e.target.style.border = "1px solid #d1d5db";
              const error = validateClass(form.student_class);
              if (error && form.student_class) {
                setMessage(error);
                setMessageType("error");
              }
            }}
          />
          {form.student_class && validateClass(form.student_class) && (
            <span style={styles.errorText}>{validateClass(form.student_class)}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Phone (10 digits)"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm({ ...form, phone: value });
            }}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => {
              e.target.style.border = "1px solid #d1d5db";
              const error = validatePhone(form.phone);
              if (error && form.phone) {
                setMessage(error);
                setMessageType("error");
              }
            }}
          />
          {form.phone && form.phone.length > 0 && form.phone.length !== 10 && (
            <span style={styles.errorText}>Phone must be exactly 10 digits</span>
          )}
        </div>

        <button style={styles.addBtn} onClick={handleSubmit}>
          {editingId ? "✏️ Update Student" : "➕ Add Student"}
        </button>
        
        {editingId && (
          <button 
            style={styles.cancelBtn}
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", student_class: "", phone: "" });
            }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* SEARCH + FILTER */}
      <div style={isMobile ? styles.controlsMobile : styles.controls}>
        <input
          style={styles.input}
          placeholder="🔍 Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="📚 Filter by class..."
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        />
      </div>

      {/* COUNT */}
      {Object.keys(classCount).length > 0 && (
        <div style={styles.countBox}>
          {Object.keys(classCount).sort((a, b) => {
            const order = { "Pre KG": 1, "LKG": 2, "UKG": 3 };
            return (order[a] || 99) - (order[b] || 99);
          }).map((c) => (
            <span key={c} style={styles.count}>
              {c}: {classCount[c]}
            </span>
          ))}
        </div>
      )}

      {/* TABLE / MOBILE CARDS */}
      <div style={styles.tableWrapper}>
        {isMobile ? (
          // Mobile Card View
          <div style={styles.mobileCardContainer}>
            {filtered.map((s) => (
              <div
                key={s.id}
                style={styles.mobileCard}
                onClick={() => setSelectedStudent(s)}
              >
                <div style={styles.mobileCardHeader}>
                  <div style={styles.mobileCardAvatar}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.mobileCardInfo}>
                    <h3 style={styles.mobileCardName}>{s.name}</h3>
                    <span style={styles.mobileCardClass}>
                      {formatClassForDisplay(s.student_class)}
                    </span>
                  </div>
                </div>
                <div style={styles.mobileCardDetails}>
                  {s.phone && (
                    <span style={styles.mobilePhone}>📞 {s.phone}</span>
                  )}
                </div>
                <div style={styles.mobileCardActions}>
                  <button
                    style={styles.mobileEditBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      editStudent(s);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    style={styles.mobileDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStudent(s);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={styles.noResults}>No students found</div>
            )}
          </div>
        ) : (
          // Desktop Table View
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Class</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, index) => (
                <tr
                  key={s.id}
                  style={{
                    ...styles.row,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                  onClick={() => setSelectedStudent(s)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#ffffff" : "#f9fafb";
                  }}
                >
                  <td style={styles.td}>
                    <span style={styles.studentName}>{s.name}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.classBadge}>
                      {formatClassForDisplay(s.student_class)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.phoneNumber}>{s.phone || "—"}</span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        editStudent(s);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStudent(s);
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

        {!isMobile && filtered.length === 0 && (
          <div style={styles.noResults}>No students found</div>
        )}
      </div>

      {/* STUDENT DETAIL CARD MODAL - WITHOUT ID */}
      {selectedStudent && (
        <div style={styles.overlay} onClick={() => setSelectedStudent(null)}>
          <div style={isMobile ? styles.cardMobile : styles.card} onClick={(e) => e.stopPropagation()}>
            <button style={styles.cardClose} onClick={() => setSelectedStudent(null)}>
              ✕
            </button>

            <div style={styles.cardHeader}>
              <div style={styles.cardAvatar}>
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={styles.cardName}>{selectedStudent.name}</h2>
              <div style={styles.cardClass}>
                {formatClassForDisplay(selectedStudent.student_class)}
              </div>
            </div>

            <div style={styles.cardBody}>
              {selectedStudent.phone && (
                <div style={styles.infoRow}>
                  <div style={styles.infoIcon}>📞</div>
                  <div style={styles.infoContent}>
                    <div style={styles.infoLabel}>Phone Number</div>
                    <div style={styles.infoValue}>{selectedStudent.phone}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.cardFooter}>
              <button
                style={styles.cardEditBtn}
                onClick={() => {
                  editStudent(selectedStudent);
                  setSelectedStudent(null);
                }}
              >
                ✏️ Edit Profile
              </button>
              <button
                style={styles.cardDeleteBtn}
                onClick={() => {
                  deleteStudent(selectedStudent);
                  setSelectedStudent(null);
                }}
              >
                🗑️ Delete Student
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

  form: {
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    maxWidth: "700px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
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

  addBtn: {
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

  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "20px",
  },

  controlsMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },

  countBox: {
    marginBottom: "15px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  count: {
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    color: "#92400e",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
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
    minWidth: "500px",
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

  studentName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "14px",
  },

  classBadge: {
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#1e40af",
    padding: "4px 10px",
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

  mobileCardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
  },

  mobileCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  mobileCardAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #065f46, #10b981)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "white",
  },

  mobileCardInfo: {
    flex: 1,
  },

  mobileCardName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
    marginBottom: "4px",
  },

  mobileCardClass: {
    fontSize: "12px",
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#1e40af",
    padding: "2px 10px",
    borderRadius: "20px",
    display: "inline-block",
  },

  mobileCardDetails: {
    marginBottom: "12px",
    paddingTop: "8px",
    borderTop: "1px solid #f1f5f9",
  },

  mobilePhone: {
    fontSize: "13px",
    color: "#475569",
    fontFamily: "monospace",
  },

  mobileCardActions: {
    display: "flex",
    gap: "10px",
  },

  mobileEditBtn: {
    flex: 1,
    background: "#3b82f6",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },

  mobileDeleteBtn: {
    flex: 1,
    background: "#ef4444",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
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
    width: "380px",
    maxWidth: "100%",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },

  cardMobile: {
    position: "relative",
    background: "white",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "95%",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },

  cardClose: {
    position: "absolute",
    top: "12px",
    right: "12px",
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
    WebkitTapHighlightColor: "transparent",
  },

  cardHeader: {
    background: "linear-gradient(135deg, #065f46, #10b981)",
    padding: "30px 20px 20px",
    textAlign: "center",
    color: "white",
  },

  cardAvatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "600",
    margin: "0 auto 16px",
    border: "4px solid white",
    color: "white",
  },

  cardName: {
    fontSize: "clamp(20px, 5vw, 24px)",
    fontWeight: "700",
    marginBottom: "8px",
    color: "white",
  },

  cardClass: {
    fontSize: "14px",
    background: "rgba(255,255,255,0.2)",
    display: "inline-block",
    padding: "4px 16px",
    borderRadius: "20px",
    fontWeight: "500",
  },

  cardBody: {
    padding: "20px",
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
    fontSize: "clamp(16px, 4vw, 18px)",
    fontWeight: "600",
    color: "#0f172a",
    wordBreak: "break-word",
  },

  cardFooter: {
    padding: "16px 20px 20px",
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

export default Students;