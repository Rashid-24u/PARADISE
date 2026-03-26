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

  const [errors, setErrors] = useState({
    name: "",
    subject: "",
    phone: "",
    image: "",
  });

  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const API = "http://127.0.0.1:8000/api/teachers/";

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // VALIDATION FUNCTIONS - ALL FIELDS REQUIRED
  const validateName = (name) => {
    if (!name || !name.trim()) {
      return "Teacher name is required";
    }
    if (name.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.length > 50) {
      return "Name must be less than 50 characters";
    }
    if (!/^[a-zA-Z\s\-\.]+$/.test(name)) {
      return "Name can only contain letters, spaces, hyphens and dots";
    }
    return "";
  };

  const validateSubject = (subject) => {
    if (!subject || !subject.trim()) {
      return "Subject is required";
    }
    if (subject.length < 2) {
      return "Subject must be at least 2 characters";
    }
    if (subject.length > 50) {
      return "Subject must be less than 50 characters";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
      return "Phone number is required";
    }
    const phoneRegex = /^[0-9\-\+\s]{10,15}$/;
    const cleanedPhone = phone.replace(/[\s\-]/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      return "Enter a valid phone number (10-15 digits)";
    }
    if (cleanedPhone.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (cleanedPhone.length > 15) {
      return "Phone number must be less than 15 digits";
    }
    return "";
  };

  const validateImage = (image, isEditing = false) => {
    // For editing, if no new image is selected, keep existing image
    if (isEditing && !image) {
      return "";
    }
    // For new teacher, image is required
    if (!image) {
      return "Profile image is required";
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(image.type)) {
      return "Only JPG, PNG, WEBP images are allowed";
    }
    if (image.size > maxSize) {
      return "Image size must be less than 5MB";
    }
    return "";
  };

  const validateForm = () => {
    const nameError = validateName(form.name);
    const subjectError = validateSubject(form.subject);
    const phoneError = validatePhone(form.phone);
    const imageError = validateImage(form.image, !!editingId);

    setErrors({
      name: nameError,
      subject: subjectError,
      phone: phoneError,
      image: imageError,
    });

    return !nameError && !subjectError && !phoneError && !imageError;
  };

  // IMAGE
  const handleImage = (file) => {
    if (!file) {
      if (editingId) {
        // For editing, allow removing image
        setForm({ ...form, image: null });
        setPreview(null);
        setErrors({ ...errors, image: "" });
      } else {
        // For new teacher, show error
        setErrors({ ...errors, image: "Profile image is required" });
      }
      return;
    }
    
    const imageError = validateImage(file, false);
    if (imageError) {
      setErrors({ ...errors, image: imageError });
      return;
    }
    
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: "" });
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!validateForm()) {
      setMessageType("error");
      setMessage("❌ Please fill all required fields correctly");
      
      // Scroll to form
      formRef.current.scrollIntoView({ behavior: "smooth" });
      
      // Highlight first error field
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("subject", form.subject.trim());
    formData.append("phone", form.phone.trim());
    
    // Handle image - if editing and no new image, don't send image field
    if (form.image) {
      formData.append("image", form.image);
    } else if (!editingId) {
      // For new teacher, image is required
      setMessageType("error");
      setMessage("❌ Profile image is required");
      return;
    }

    try {
      if (editingId) {
        await fetch(API + editingId + "/", {
          method: "PUT",
          body: formData,
        });
        setMessageType("success");
        setMessage("✅ Teacher updated successfully!");
        setEditingId(null);
      } else {
        await fetch(API, {
          method: "POST",
          body: formData,
        });
        setMessageType("success");
        setMessage("✅ Teacher added successfully!");
      }

      setForm({ name: "", subject: "", phone: "", image: null });
      setPreview(null);
      setErrors({ name: "", subject: "", phone: "", image: "" });
      fetchTeachers();
    } catch (error) {
      setMessageType("error");
      setMessage("❌ Failed to save teacher. Please try again.");
    }
  };

  // DELETE
  const handleDelete = async (teacher) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${teacher.name}"?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await fetch(API + teacher.id + "/", { method: "DELETE" });
      setMessageType("success");
      setMessage(`🗑️ ${teacher.name} deleted successfully`);
      fetchTeachers();
      if (selectedTeacher?.id === teacher.id) {
        setSelectedTeacher(null);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("❌ Failed to delete teacher. Please try again.");
    }
  };

  // EDIT
  const handleEdit = (t) => {
    setForm({
      name: t.name,
      subject: t.subject,
      phone: t.phone || "",
      image: null,
    });

    setPreview(t.image_url);
    setEditingId(t.id);
    setErrors({ name: "", subject: "", phone: "", image: "" });

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

  // Get message style based on type
  const getMessageStyle = () => {
    return {
      ...styles.message,
      background: messageType === "success" ? "#dcfce7" : "#fee2e2",
      color: messageType === "success" ? "#065f46" : "#991b1b",
      border: messageType === "success" ? "1px solid #a7f3d0" : "1px solid #fecaca",
    };
  };

  return (
    <div style={styles.container}>
      {/* BACK */}
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
          ⬅ Back To Dashboard
        </button>
      </div>

      <h2 style={styles.title}>👩‍🏫 Teachers Management</h2>

      {message && <div style={getMessageStyle()}>{message}</div>}

      {/* FORM - ALL FIELDS REQUIRED */}
      <div style={styles.form} ref={formRef}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Teacher Name <span style={styles.required}>*</span>
          </label>
          <input
            style={{
              ...styles.input,
              borderColor: errors.name ? "#ef4444" : "#e5e7eb",
            }}
            className={errors.name ? "error-field" : ""}
            placeholder="Enter teacher name"
            onFocus={(e) => {
              e.target.style.borderColor = "#10b981";
              setErrors({ ...errors, name: "" });
            }}
            onBlur={(e) => {
              setErrors({ ...errors, name: validateName(form.name) });
              e.target.style.borderColor = "#e5e7eb";
            }}
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
          />
          {errors.name && <div style={styles.errorText}>{errors.name}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Subject <span style={styles.required}>*</span>
          </label>
          <input
            style={{
              ...styles.input,
              borderColor: errors.subject ? "#ef4444" : "#e5e7eb",
            }}
            className={errors.subject ? "error-field" : ""}
            placeholder="Enter subject name"
            onFocus={(e) => {
              e.target.style.borderColor = "#10b981";
              setErrors({ ...errors, subject: "" });
            }}
            onBlur={(e) => {
              setErrors({ ...errors, subject: validateSubject(form.subject) });
              e.target.style.borderColor = "#e5e7eb";
            }}
            value={form.subject}
            onChange={(e) => {
              setForm({ ...form, subject: e.target.value });
              if (errors.subject) setErrors({ ...errors, subject: "" });
            }}
          />
          {errors.subject && <div style={styles.errorText}>{errors.subject}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Phone Number <span style={styles.required}>*</span>
          </label>
          <input
            style={{
              ...styles.input,
              borderColor: errors.phone ? "#ef4444" : "#e5e7eb",
            }}
            className={errors.phone ? "error-field" : ""}
            placeholder="Enter phone number"
            onFocus={(e) => {
              e.target.style.borderColor = "#10b981";
              setErrors({ ...errors, phone: "" });
            }}
            onBlur={(e) => {
              setErrors({ ...errors, phone: validatePhone(form.phone) });
              e.target.style.borderColor = "#e5e7eb";
            }}
            value={form.phone}
            onChange={(e) => {
              setForm({ ...form, phone: e.target.value });
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
          />
          {errors.phone && <div style={styles.errorText}>{errors.phone}</div>}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Profile Image <span style={styles.required}>*</span>
          </label>
          <div style={styles.fileInputWrapper}>
            <label style={{
              ...styles.fileLabel,
              borderColor: errors.image ? "#ef4444" : "#10b981",
              background: errors.image ? "#fee2e2" : "#f3f4f6",
            }}>
              📸 {preview ? "Change Image" : "Upload Image"}
              <input 
                type="file" 
                onChange={(e) => handleImage(e.target.files[0])}
                style={styles.fileInput}
                accept="image/jpeg,image/png,image/jpg,image/webp"
              />
            </label>
          </div>
          {errors.image && <div style={styles.errorText}>{errors.image}</div>}
          {preview && (
            <div style={styles.previewContainer}>
              <img src={preview} style={styles.preview} alt="Preview" />
              <button
                style={styles.removeImageBtn}
                onClick={() => {
                  setPreview(null);
                  setForm({ ...form, image: null });
                  if (!editingId) {
                    setErrors({ ...errors, image: "Profile image is required" });
                  } else {
                    setErrors({ ...errors, image: "" });
                  }
                }}
              >
                ✕ Remove
              </button>
            </div>
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
          {editingId ? "✏️ Update Teacher" : "➕ Add Teacher"}
        </button>
      </div>

      {/* SEARCH & FILTER */}
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

      {/* TEACHERS TABLE - Responsive with Row Numbers */}
      <div style={styles.tableWrapper}>
        {!isMobile ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.thNumber}>#</th>
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
                  <td style={styles.tdNumber}>
                    <span style={styles.rowNumber}>{index + 1}</span>
                  </td>
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
                    <span style={styles.phoneNumber}>{t.phone || "—"}</span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(t);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(t);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // MOBILE CARD VIEW with Row Numbers
          <div style={styles.mobileCardContainer}>
            {filtered.map((t, index) => (
              <div
                key={t.id}
                style={styles.mobileCard}
                onClick={() => setSelectedTeacher(t)}
              >
                <div style={styles.mobileCardHeader}>
                  <div style={styles.mobileRowNumber}>
                    <span style={styles.mobileNumberBadge}>{index + 1}</span>
                  </div>
                  {t.image_url ? (
                    <img src={t.image_url} style={styles.mobileImg} alt={t.name} />
                  ) : (
                    <div style={styles.mobilePlaceholderImg}>📸</div>
                  )}
                  <div style={styles.mobileCardInfo}>
                    <h3 style={styles.mobileName}>{t.name}</h3>
                    <span style={styles.mobileSubject}>{t.subject}</span>
                  </div>
                </div>
                <div style={styles.mobileCardBody}>
                  <div style={styles.mobilePhone}>
                    <span>📞</span> {t.phone || "Not provided"}
                  </div>
                </div>
                <div style={styles.mobileCardActions}>
                  <button
                    style={styles.mobileEditBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(t);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    style={styles.mobileDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t);
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
          <div style={styles.noResults}>No teachers found</div>
        )}
        
        {/* Show total count */}
        {filtered.length > 0 && (
          <div style={styles.totalCount}>
            Showing <strong>{filtered.length}</strong> of <strong>{teachers.length}</strong> teachers
          </div>
        )}
      </div>

      {/* DETAIL CARD MODAL */}
      {selectedTeacher && (
        <div style={styles.overlay} onClick={() => setSelectedTeacher(null)}>
          <div style={styles.card} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.cardClose} 
              onClick={() => setSelectedTeacher(null)}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
            >
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
                onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
              >
                ✏️ Edit Profile
              </button>
              <button
                style={styles.cardDeleteBtn}
                onClick={() => {
                  handleDelete(selectedTeacher);
                  setSelectedTeacher(null);
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                🗑️ Delete Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .error-field {
          border-color: #ef4444 !important;
        }
        
        @media (max-width: 768px) {
          .teachers-table {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

/* STYLES - Keep all existing styles, update required field indicators */
const styles = {
  container: {
    padding: "clamp(20px, 4vw, 30px) clamp(16px, 3vw, 20px)",
    maxWidth: "1400px",
    margin: "auto",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: "linear-gradient(135deg, #f8fafc, #ffffff)",
    minHeight: "100vh",
  },

  topBar: {
    marginBottom: "clamp(20px, 4vw, 30px)",
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
    marginBottom: "clamp(25px, 5vw, 35px)",
    fontSize: "clamp(24px, 5vw, 36px)",
    fontWeight: "700",
    background: "linear-gradient(135deg, #065f46, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  message: {
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "500",
    transition: "all 0.3s",
  },

  form: {
    background: "white",
    padding: "clamp(20px, 4vw, 30px)",
    borderRadius: "20px",
    maxWidth: "700px",
    margin: "0 auto 30px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "clamp(13px, 2.5vw, 14px)",
    fontWeight: "600",
    color: "#374151",
  },

  required: {
    color: "#ef4444",
    marginLeft: "4px",
  },

  input: {
    padding: "clamp(12px, 2.5vw, 14px) clamp(14px, 3vw, 16px)",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "clamp(13px, 2.5vw, 14px)",
    transition: "all 0.2s",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },

  errorText: {
    fontSize: "clamp(11px, 2vw, 12px)",
    color: "#ef4444",
    marginTop: "4px",
  },

  fileInputWrapper: {
    width: "100%",
  },

  fileLabel: {
    display: "inline-block",
    padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)",
    background: "#f3f4f6",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "clamp(13px, 2.5vw, 14px)",
    fontWeight: "500",
    color: "#374151",
    border: "2px dashed #10b981",
    transition: "all 0.2s",
    textAlign: "center",
    width: "100%",
  },

  fileInput: {
    display: "none",
  },

  previewContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },

  preview: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #10b981",
  },

  removeImageBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  addBtn: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    padding: "clamp(12px, 2.5vw, 14px)",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "clamp(14px, 2.8vw, 16px)",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
    marginTop: "10px",
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    background: "white",
    position: "relative",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "inherit",
    minWidth: "650px",
  },

  tableHeader: {
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    borderBottom: "2px solid #e2e8f0",
  },

  thNumber: {
    padding: "clamp(12px, 2.5vw, 16px) clamp(8px, 1.5vw, 10px)",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "clamp(12px, 2.2vw, 14px)",
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    width: "60px",
  },

  th: {
    padding: "clamp(12px, 2.5vw, 16px) clamp(10px, 2vw, 12px)",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "clamp(12px, 2.2vw, 14px)",
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
    padding: "clamp(10px, 2vw, 14px) clamp(8px, 1.5vw, 10px)",
    verticalAlign: "middle",
    textAlign: "center",
  },

  td: {
    padding: "clamp(10px, 2vw, 14px) clamp(8px, 1.8vw, 12px)",
    verticalAlign: "middle",
  },

  rowNumber: {
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

  img: {
    width: "clamp(40px, 6vw, 45px)",
    height: "clamp(40px, 6vw, 45px)",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #e2e8f0",
  },

  placeholderImg: {
    width: "clamp(40px, 6vw, 45px)",
    height: "clamp(40px, 6vw, 45px)",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(18px, 3vw, 20px)",
  },

  teacherName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "clamp(13px, 2.5vw, 14px)",
  },

  subjectBadge: {
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#1e40af",
    padding: "4px 12px",
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
    marginRight: "8px",
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

  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "14px",
  },

  totalCount: {
    textAlign: "center",
    padding: "16px",
    fontSize: "13px",
    color: "#6b7280",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
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
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid #e5e7eb",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    position: "relative",
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

  mobileImg: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #10b981",
  },

  mobilePlaceholderImg: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  mobileCardInfo: {
    flex: 1,
  },

  mobileName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
  },

  mobileSubject: {
    fontSize: "12px",
    color: "#10b981",
    background: "#ecfdf5",
    padding: "2px 8px",
    borderRadius: "12px",
    display: "inline-block",
    marginTop: "4px",
  },

  mobileCardBody: {
    padding: "8px 0",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
  },

  mobilePhone: {
    fontSize: "13px",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  mobileCardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },

  mobileEditBtn: {
    flex: 1,
    padding: "8px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },

  mobileDeleteBtn: {
    flex: 1,
    padding: "8px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },

  // Modal Card Styles
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
    width: "clamp(320px, 90%, 400px)",
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
    padding: "clamp(25px, 5vw, 30px) 20px 20px",
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
    fontSize: "clamp(20px, 4vw, 24px)",
    fontWeight: "700",
    marginBottom: "8px",
    color: "white",
  },

  cardSubject: {
    fontSize: "clamp(12px, 2.5vw, 14px)",
    background: "rgba(255,255,255,0.2)",
    display: "inline-block",
    padding: "4px 16px",
    borderRadius: "20px",
    fontWeight: "500",
  },

  cardBody: {
    padding: "clamp(20px, 4vw, 24px)",
    background: "white",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
  },

  infoIcon: {
    fontSize: "clamp(24px, 4vw, 28px)",
    width: "48px",
    textAlign: "center",
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: "clamp(11px, 2vw, 12px)",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },

  infoValue: {
    fontSize: "clamp(16px, 3vw, 18px)",
    fontWeight: "600",
    color: "#0f172a",
  },

  cardFooter: {
    padding: "clamp(16px, 3vw, 20px) clamp(20px, 4vw, 24px)",
    display: "flex",
    gap: "12px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },

  cardEditBtn: {
    flex: 1,
    padding: "clamp(10px, 2vw, 12px)",
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
    padding: "clamp(10px, 2vw, 12px)",
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