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
      if (selectedStudent?.id === student.id) {
        setSelectedStudent(null);
      }
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

  // COUNT BY CLASS
  const classCount = {};
  students.forEach((s) => {
    const cls = formatClassForDisplay(s.student_class);
    classCount[cls] = (classCount[cls] || 0) + 1;
  });

  // Filtered count by class
  const filteredClassCount = {};
  filtered.forEach((s) => {
    const cls = formatClassForDisplay(s.student_class);
    filteredClassCount[cls] = (filteredClassCount[cls] || 0) + 1;
  });

  // Get total counts
  const totalStudents = students.length;
  const filteredTotal = filtered.length;

  return (
    <div style={styles.container}>
      {/* BACK BUTTON */}
      <div style={styles.topBar}>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/admin-dashboard")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(6,95,70,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
        >
          ⬅ {isMobile ? "Back" : "Back to Dashboard"}
        </button>
      </div>

      <h2 style={styles.title}>🎓 Students Management</h2>

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

        <button 
          style={styles.addBtn} 
          onClick={handleSubmit}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(16,185,129,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(16,185,129,0.3)";
          }}
        >
          {editingId ? "✏️ Update Student" : "➕ Add Student"}
        </button>
        
        {editingId && (
          <button 
            style={styles.cancelBtn}
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", student_class: "", phone: "" });
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#5a6268")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6b7280")}
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

      {/* TOTAL STUDENTS COUNT */}
      <div style={styles.totalCountContainer}>
        <div style={styles.totalCountCard}>
          <span style={styles.totalCountIcon}>👨‍🎓</span>
          <div>
            <div style={styles.totalCountLabel}>Total Students</div>
            <div style={styles.totalCountValue}>{totalStudents}</div>
          </div>
        </div>
        {search || filterClass ? (
          <div style={styles.filteredCountCard}>
            <span style={styles.filteredCountIcon}>🔍</span>
            <div>
              <div style={styles.filteredCountLabel}>Filtered Results</div>
              <div style={styles.filteredCountValue}>{filteredTotal} of {totalStudents}</div>
            </div>
          </div>
        ) : null}
      </div>

      {/* CLASS WISE COUNT */}
      {Object.keys(classCount).length > 0 && (
        <div style={styles.countBox}>
          <div style={styles.countBoxTitle}>📊 Class-wise Distribution</div>
          <div style={styles.countGrid}>
            {Object.keys(classCount).sort((a, b) => {
              const order = { "Pre KG": 1, "LKG": 2, "UKG": 3 };
              const numA = parseInt(a);
              const numB = parseInt(b);
              if (order[a] && order[b]) return order[a] - order[b];
              if (order[a]) return -1;
              if (order[b]) return 1;
              return numA - numB;
            }).map((c) => (
              <div key={c} style={styles.countItem}>
                <span style={styles.countClass}>{c}</span>
                <span style={styles.countNumber}>{classCount[c]}</span>
                {filterClass && filteredClassCount[c] !== undefined && (
                  <span style={styles.countFilteredBadge}>
                    (filtered: {filteredClassCount[c]})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABLE / MOBILE CARDS */}
      <div style={styles.tableWrapper}>
        {!isMobile ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.thNumber}>#</th>
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
                  <td style={styles.tdNumber}>
                    <span style={styles.rowNumber}>{index + 1}</span>
                  </td>
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
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStudent(s);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Mobile Card View
          <div style={styles.mobileCardContainer}>
            {filtered.map((s, index) => (
              <div
                key={s.id}
                style={styles.mobileCard}
                onClick={() => setSelectedStudent(s)}
              >
                <div style={styles.mobileCardHeader}>
                  <div style={styles.mobileRowNumber}>
                    <span style={styles.mobileNumberBadge}>{index + 1}</span>
                  </div>
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
          </div>
        )}

        {filtered.length === 0 && (
          <div style={styles.noResults}>No students found</div>
        )}
        
        {/* Show filtered count */}
        {filtered.length > 0 && (
          <div style={styles.totalCountFooter}>
            Showing <strong>{filtered.length}</strong> of <strong>{totalStudents}</strong> students
            {search && <span> (Search: "{search}")</span>}
            {filterClass && <span> (Class: {filterClass})</span>}
          </div>
        )}
      </div>

      {/* STUDENT DETAIL CARD MODAL */}
      {selectedStudent && (
        <div style={styles.overlay} onClick={() => setSelectedStudent(null)}>
          <div style={isMobile ? styles.cardMobile : styles.card} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.cardClose} 
              onClick={() => setSelectedStudent(null)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            >
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
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
              >
                ✏️ Edit Profile
              </button>
              <button
                style={styles.cardDeleteBtn}
                onClick={() => {
                  deleteStudent(selectedStudent);
                  setSelectedStudent(null);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
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
    padding: "clamp(15px, 3vw, 20px)",
    maxWidth: "1400px",
    margin: "auto",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: "linear-gradient(135deg, #f8fafc, #ffffff)",
    minHeight: "100vh",
  },

  topBar: {
    marginBottom: "clamp(15px, 3vw, 20px)",
  },

  backBtn: {
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    padding: "clamp(8px, 2vw, 10px) clamp(16px, 3vw, 20px)",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "clamp(13px, 2.5vw, 14px)",
    fontWeight: "500",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "clamp(20px, 4vw, 25px)",
    fontSize: "clamp(24px, 5vw, 32px)",
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
    padding: "clamp(20px, 4vw, 25px)",
    borderRadius: "20px",
    maxWidth: "700px",
    margin: "0 auto 25px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    padding: "clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 14px)",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    transition: "all 0.2s",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },

  addBtn: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    padding: "clamp(10px, 2.5vw, 12px)",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "clamp(14px, 2.8vw, 16px)",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
    marginTop: "5px",
  },

  cancelBtn: {
    background: "#6b7280",
    color: "white",
    padding: "clamp(10px, 2.5vw, 12px)",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "clamp(14px, 2.8vw, 16px)",
    transition: "all 0.2s",
  },

  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "25px",
  },

  controlsMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },

  totalCountContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  totalCountCard: {
    background: "linear-gradient(135deg, #065f46, #10b981)",
    borderRadius: "16px",
    padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 25px)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    color: "white",
    flex: 1,
    minWidth: "180px",
    boxShadow: "0 4px 15px rgba(6,95,70,0.2)",
  },

  totalCountIcon: {
    fontSize: "clamp(32px, 6vw, 40px)",
  },

  totalCountLabel: {
    fontSize: "clamp(12px, 2.2vw, 13px)",
    opacity: 0.9,
  },

  totalCountValue: {
    fontSize: "clamp(28px, 5vw, 36px)",
    fontWeight: "800",
    lineHeight: 1,
  },

  filteredCountCard: {
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    borderRadius: "16px",
    padding: "clamp(15px, 3vw, 20px) clamp(20px, 4vw, 25px)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    color: "white",
    flex: 1,
    minWidth: "180px",
    boxShadow: "0 4px 15px rgba(245,158,11,0.2)",
  },

  filteredCountIcon: {
    fontSize: "clamp(32px, 6vw, 40px)",
  },

  filteredCountLabel: {
    fontSize: "clamp(12px, 2.2vw, 13px)",
    opacity: 0.9,
  },

  filteredCountValue: {
    fontSize: "clamp(24px, 4.5vw, 32px)",
    fontWeight: "700",
    lineHeight: 1,
  },

  countBox: {
    background: "white",
    borderRadius: "16px",
    padding: "clamp(15px, 3vw, 20px)",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  },

  countBoxTitle: {
    fontSize: "clamp(14px, 2.8vw, 16px)",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
  },

  countGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  countItem: {
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    padding: "8px 16px",
    borderRadius: "30px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "clamp(12px, 2.2vw, 13px)",
  },

  countClass: {
    fontWeight: "600",
    color: "#92400e",
  },

  countNumber: {
    fontWeight: "700",
    color: "#065f46",
    background: "white",
    padding: "2px 8px",
    borderRadius: "20px",
  },

  countFilteredBadge: {
    fontSize: "11px",
    color: "#f59e0b",
    fontWeight: "500",
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
    minWidth: "550px",
  },

  tableHeader: {
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    borderBottom: "2px solid #e2e8f0",
  },

  thNumber: {
    padding: "clamp(12px, 2.5vw, 14px) clamp(8px, 1.5vw, 10px)",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "clamp(12px, 2.2vw, 13px)",
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    width: "60px",
  },

  th: {
    padding: "clamp(12px, 2.5vw, 14px) clamp(10px, 2vw, 12px)",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "clamp(12px, 2.2vw, 13px)",
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  row: {
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "1px solid #f1f5f9",
  },

  tdNumber: {
    padding: "clamp(10px, 2vw, 12px) clamp(8px, 1.5vw, 10px)",
    verticalAlign: "middle",
    textAlign: "center",
  },

  td: {
    padding: "clamp(10px, 2vw, 12px) clamp(8px, 1.8vw, 12px)",
    verticalAlign: "middle",
  },

  rowNumber: {
    display: "inline-block",
    width: "30px",
    height: "30px",
    lineHeight: "30px",
    textAlign: "center",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    borderRadius: "50%",
    fontWeight: "600",
    fontSize: "12px",
    color: "#065f46",
  },

  studentName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "clamp(13px, 2.5vw, 14px)",
  },

  classBadge: {
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#1e40af",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "clamp(11px, 2vw, 12px)",
    fontWeight: "500",
    display: "inline-block",
  },

  phoneNumber: {
    color: "#475569",
    fontFamily: "monospace",
    fontSize: "clamp(12px, 2.2vw, 13px)",
  },

  editBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    marginRight: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "clamp(11px, 2vw, 12px)",
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
    fontSize: "clamp(11px, 2vw, 12px)",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  totalCountFooter: {
    textAlign: "center",
    padding: "clamp(12px, 2.5vw, 16px)",
    fontSize: "clamp(12px, 2.2vw, 13px)",
    color: "#6b7280",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
  },

  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "14px",
  },

  // Mobile Card View
  mobileCardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
  },

  mobileCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  mobileRowNumber: {
    marginRight: "4px",
  },

  mobileNumberBadge: {
    display: "inline-block",
    width: "32px",
    height: "32px",
    lineHeight: "32px",
    textAlign: "center",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    borderRadius: "50%",
    fontWeight: "600",
    fontSize: "13px",
    color: "#065f46",
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
  },
};

export default Students;