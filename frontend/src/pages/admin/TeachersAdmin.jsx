import { useEffect, useState } from "react";

function TeachersAdmin() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [selected, setSelected] = useState(null);
  const [editId, setEditId] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [showConfirm, setShowConfirm] = useState({ show: false, message: "", type: "", onConfirm: null });
  const [showSuccess, setShowSuccess] = useState({ show: false, message: "" });
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(false);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    email: "",
    password: "",
    phone: "",
    course: "",
    dob: "",
    blood_group: "",
    gender: "",
    qualification: "",
    experience: "",
    career_details: "",
    teaching_level: "",
    address: "",
    details: "",
    image: null,
    salary: "",
  });

  const API = "http://127.0.0.1:8000/api/";

  const fetchData = () => {
    Promise.all([
      fetch(API + "teachers/").then(r => r.json()),
      fetch(API + "courses/").then(r => r.json()),
    ]).then(([teachersData, coursesData]) => {
      setTeachers(teachersData);
      setCourses(coursesData);
    }).catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch full teacher details with documents
  const fetchTeacherDetails = async (teacherId) => {
    try {
      const res = await fetch(API + `teachers/${teacherId}/`);
      const data = await res.json();
      setTeacherDetails(data);
      return data;
    } catch (err) {
      console.error("Error fetching teacher details:", err);
      return null;
    }
  };

  // Delete document function (ONLY FOR EDIT FORM)
  const handleDeleteDocument = async (teacherId, documentId, documentTitle) => {
    setShowConfirm({
      show: true,
      message: `Are you sure you want to delete "${documentTitle}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        setDeletingDoc(true);
        try {
          const res = await fetch(API + `teachers/${teacherId}/delete-document/${documentId}/`, {
            method: "DELETE",
          });
          
          if (res.ok) {
            // Remove the deleted document from existingDocuments state
            setExistingDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
            
            // Also refresh the main teachers list
            fetchData();
            
            setShowSuccess({ show: true, message: "Document deleted successfully!" });
            setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
          } else {
            const error = await res.json();
            setShowSuccess({ show: true, message: "Failed to delete document: " + (error.error || "Unknown error") });
            setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
          }
        } catch (err) {
          console.error("Delete error:", err);
          setShowSuccess({ show: true, message: "Network error while deleting document!" });
          setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
        } finally {
          setDeletingDoc(false);
          setShowConfirm({ show: false, message: "", type: "", onConfirm: null });
        }
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name?.trim()) newErrors.name = "Name is required";
    if (!form.subject?.trim()) newErrors.subject = "Subject is required";
    if (!form.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!editId && !form.password) newErrors.password = "Password is required for new teachers";
    if (form.password && form.password.length < 4) newErrors.password = "Password must be at least 4 characters";
    if (!form.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9+\-\s()]{10,15}$/.test(form.phone)) newErrors.phone = "Phone number is invalid";
    if (!form.dob) newErrors.dob = "Date of Birth is required";
    if (!form.blood_group) newErrors.blood_group = "Blood group is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.qualification?.trim()) newErrors.qualification = "Qualification is required";
    if (!form.experience?.trim()) newErrors.experience = "Experience is required";
    if (!form.address?.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      subject: "",
      email: "",
      password: "",
      phone: "",
      course: "",
      dob: "",
      blood_group: "",
      gender: "",
      qualification: "",
      experience: "",
      career_details: "",
      teaching_level: "",
      address: "",
      details: "",
      image: null,
      salary: "",
    });
    setDocuments([]);
    setEditId(null);
    setErrors({});
    setShowPassword(false);
    setExistingDocuments([]);
  };

  const handleAddTeacher = async () => {
    if (!validateForm()) {
      setShowSuccess({ show: true, message: "Please fill all required fields" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });

    documents.forEach((doc, index) => {
      if (doc.file) {
        formData.append(`documents`, doc.file);
        formData.append(`document_types`, doc.type);
        formData.append(`document_titles`, doc.title);
      }
    });

    try {
      const res = await fetch(API + "teachers/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        fetchData();
        resetForm();
        setLastSaved(data);
        setShowSuccess({ show: true, message: "Teacher added successfully!" });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      } else {
        setShowSuccess({ show: true, message: "Error: " + JSON.stringify(data) });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      }
    } catch (err) {
      setShowSuccess({ show: true, message: "Network error!" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!validateForm()) {
      setShowSuccess({ show: true, message: "Please fill all required fields" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });

    documents.forEach((doc, index) => {
      if (doc.file) {
        formData.append(`documents`, doc.file);
        formData.append(`document_types`, doc.type);
        formData.append(`document_titles`, doc.title);
      }
    });

    try {
      const res = await fetch(API + `teachers/${editId}/`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        fetchData();
        resetForm();
        setLastSaved(data);
        setShowSuccess({ show: true, message: "Teacher updated successfully!" });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      } else {
        setShowSuccess({ show: true, message: "Error: " + JSON.stringify(data) });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      }
    } catch (err) {
      setShowSuccess({ show: true, message: "Network error!" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (editId) {
      handleUpdateTeacher();
    } else {
      handleAddTeacher();
    }
  };

  const handleDelete = async (id) => {
    setShowConfirm({
      show: true,
      message: "Are you sure you want to delete this teacher? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(API + `teachers/${id}/`, { method: "DELETE" });
          if (res.ok) {
            fetchData();
            if (selected?.id === id) {
              setSelected(null);
              setTeacherDetails(null);
            }
            setShowSuccess({ show: true, message: "Teacher deleted successfully!" });
            setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
          } else {
            setShowSuccess({ show: true, message: "Delete failed!" });
            setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
          }
        } catch (err) {
          setShowSuccess({ show: true, message: "Delete failed!" });
          setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
        }
        setShowConfirm({ show: false, message: "", type: "", onConfirm: null });
      }
    });
  };

  const handleEdit = async (teacher) => {
    setEditId(teacher.id);
    setForm({
      name: teacher.name || "",
      subject: teacher.subject || "",
      email: teacher.email || "",
      password: "",
      phone: teacher.phone || "",
      course: teacher.course || "",  // This should work now
      dob: teacher.dob || "",
      blood_group: teacher.blood_group || "",
      gender: teacher.gender || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      career_details: teacher.career_details || "",
      teaching_level: teacher.teaching_level || "",
      address: teacher.address || "",
      details: teacher.details || "",
      image: null,
      salary: teacher.salary || "",
    });
    
    // Fetch existing documents
    try {
      const res = await fetch(API + `teachers/${teacher.id}/`);
      const data = await res.json();
      setExistingDocuments(data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
    
    setErrors({});
    setShowPassword(false);
    setDocuments([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewTeacher = async (teacher) => {
    const fullDetails = await fetchTeacherDetails(teacher.id);
    setSelected(fullDetails || teacher);
  };

  const addDocument = () => {
    setDocuments([...documents, { file: null, type: "certificate", title: "" }]);
  };

  const removeDocument = (index) => {
    const newDocs = [...documents];
    newDocs.splice(index, 1);
    setDocuments(newDocs);
  };

  const updateDocument = (index, field, value) => {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  };

  const filtered = teachers
    .filter(t => {
      if (!filterCourse) return true;
      return String(t.course) === String(filterCourse);
    })
    .filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  const getCourseName = (courseId) => {
    if (!courseId && courseId !== 0) return "All classes";
    const course = courses.find(c => c.id == courseId);
    return course ? course.name : "All classes";
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const genders = ["Male", "Female", "Other"];
  const documentTypes = [
    { value: "certificate", label: "📜 Certificate", icon: "📜" },
    { value: "qualification", label: "🎓 Qualification", icon: "🎓" },
    { value: "experience", label: "📋 Experience Letter", icon: "📋" },
    { value: "id_proof", label: "🪪 ID Proof", icon: "🪪" },
    { value: "other", label: "📎 Other", icon: "📎" },
  ];
  const teachingLevels = ["Pre-KG", "LKG", "UKG", "1st Standard", "2nd Standard", "3rd Standard", "4th Standard", "5th Standard"];

  const getDocumentIcon = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.icon : "📎";
  };

  return (
    <div style={styles.container}>
      {/* School Header */}
      <div style={styles.schoolHeader}>
        <h1 style={styles.schoolName}>🏫 PARADISE ISLAMIC PRE-SCHOOL</h1>
        <p style={styles.schoolAddress}>Pullur, Tirur - 676102 | Quality Education with Islamic Values</p>
      </div>

      {/* Success Toast */}
      {showSuccess.show && (
        <div style={styles.toast}>
          <span>{showSuccess.message}</span>
          {lastSaved && (
            <button style={styles.toastBtn} onClick={() => handleViewTeacher(lastSaved)}>View</button>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmDialog}>
            <h3 style={styles.confirmTitle}>Confirm Action</h3>
            <p style={styles.confirmMessage}>{showConfirm.message}</p>
            <div style={styles.confirmActions}>
              <button style={styles.cancelBtn} onClick={() => setShowConfirm({ show: false, message: "", type: "", onConfirm: null })}>Cancel</button>
              <button style={styles.confirmBtn} onClick={showConfirm.onConfirm} disabled={deletingDoc}>
                {deletingDoc ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button style={styles.backBtn} onClick={() => window.location.href = "/admin-dashboard"}>
        ← Back to Dashboard
      </button>

      {/* Form Section */}
      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <h3 style={styles.formTitle}>{editId ? "✏️ Edit Teacher" : "➕ Add New Teacher"}</h3>
          {editId && <button style={styles.cancelEditBtn} onClick={resetForm}>Cancel Edit</button>}
        </div>

        {/* Login Credentials Section - HIGHLIGHTED */}
        <div style={styles.loginCredentialsSection}>
          <div style={styles.loginSectionHeader}>
            <span style={styles.loginIcon}>🔐</span>
            <h4 style={styles.loginSectionTitle}>Teacher Login Credentials</h4>
            <span style={styles.loginBadge}>Used for teacher login</span>
          </div>
          <div style={styles.loginCredentialsGrid}>
            <div style={styles.highlightField}>
              <label style={styles.highlightLabel}>
                <span style={styles.labelIcon}>📧</span> Email Address *
              </label>
              <input 
                type="email" 
                style={{...styles.highlightInput, borderColor: errors.email ? "#dc3545" : "#d4af37"}}
                placeholder="Enter email address (used for login)"
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              <small style={styles.highlightHint}>📌 Teacher will use this email to login</small>
            </div>
            
            <div style={styles.highlightField}>
              <label style={styles.highlightLabel}>
                <span style={styles.labelIcon}>🔑</span> Password {!editId && "*"}
              </label>
              <div style={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  style={{...styles.highlightInput, paddingRight: "40px", borderColor: errors.password ? "#dc3545" : "#d4af37"}}
                  placeholder={editId ? "Leave blank to keep current" : "Enter password (used for login)"} 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                />
                <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
              <small style={styles.highlightHint}>🔒 Minimum 4 characters - Teacher will use this to login</small>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div style={styles.sectionDivider}>
          <span style={styles.sectionDividerIcon}>👤</span>
          <span style={styles.sectionDividerText}>Personal Information</span>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formField}>
            <label style={styles.formLabel}>Full Name *</label>
            <input type="text" style={{...styles.formInput, borderColor: errors.name ? "#dc3545" : "#e2e8f0" }}
              placeholder="Enter teacher name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Subject (Text) *</label>
            <input type="text" style={{...styles.formInput, borderColor: errors.subject ? "#dc3545" : "#e2e8f0" }}
              placeholder="e.g., Arabic, English, Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            {errors.subject && <span style={styles.errorText}>{errors.subject}</span>}
            <small style={styles.hintText}>Enter the subject this teacher specializes in</small>
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Phone Number *</label>
            <input type="text" style={{...styles.formInput, borderColor: errors.phone ? "#dc3545" : "#e2e8f0" }}
              placeholder="Enter phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Course (Optional)</label>
            <select style={styles.formSelect} value={form.course || ""} onChange={e => setForm({ ...form, course: e.target.value })}>
              <option value="">None (all classes)</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Teaching Level *</label>
            <select style={{...styles.formSelect, borderColor: errors.teaching_level ? "#dc3545" : "#e2e8f0" }}
              value={form.teaching_level} onChange={e => setForm({ ...form, teaching_level: e.target.value })}>
              <option value="">Select Teaching Level</option>
              {teachingLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
            {errors.teaching_level && <span style={styles.errorText}>{errors.teaching_level}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Date of Birth *</label>
            <input type="date" style={{...styles.formInput, borderColor: errors.dob ? "#dc3545" : "#e2e8f0" }}
              value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
            {errors.dob && <span style={styles.errorText}>{errors.dob}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Blood Group *</label>
            <select style={{...styles.formSelect, borderColor: errors.blood_group ? "#dc3545" : "#e2e8f0" }}
              value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
              <option value="">Select Blood Group</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            {errors.blood_group && <span style={styles.errorText}>{errors.blood_group}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Gender *</label>
            <select style={{...styles.formSelect, borderColor: errors.gender ? "#dc3545" : "#e2e8f0" }}
              value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select Gender</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.gender && <span style={styles.errorText}>{errors.gender}</span>}
          </div>

          <div style={styles.formFieldFull}>
            <label style={styles.formLabel}>Address *</label>
            <textarea style={{...styles.formTextarea, borderColor: errors.address ? "#dc3545" : "#e2e8f0" }}
              rows="2" placeholder="Enter address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            {errors.address && <span style={styles.errorText}>{errors.address}</span>}
          </div>
        </div>

        {/* Professional Information Section */}
        <div style={styles.sectionDivider}>
          <span style={styles.sectionDividerIcon}>🎓</span>
          <span style={styles.sectionDividerText}>Professional Information</span>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formField}>
            <label style={styles.formLabel}>Qualification *</label>
            <textarea style={{...styles.formTextarea, borderColor: errors.qualification ? "#dc3545" : "#e2e8f0" }}
              rows="2" placeholder="Enter qualifications (degrees, certifications)" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
            {errors.qualification && <span style={styles.errorText}>{errors.qualification}</span>}
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Experience *</label>
            <textarea style={{...styles.formTextarea, borderColor: errors.experience ? "#dc3545" : "#e2e8f0" }}
              rows="2" placeholder="Enter experience details (years, schools, roles)" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
            {errors.experience && <span style={styles.errorText}>{errors.experience}</span>}
          </div>

          <div style={styles.formFieldFull}>
            <label style={styles.formLabel}>Career Details</label>
            <textarea style={styles.formTextarea} rows="3" 
              placeholder="Enter full career history, achievements, specializations..." 
              value={form.career_details} onChange={e => setForm({ ...form, career_details: e.target.value })} />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Monthly Salary (₹)</label>
            <input type="number" style={styles.formInput}
              placeholder="Enter monthly salary amount" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
          </div>

          <div style={styles.formField}>
            <label style={styles.formLabel}>Profile Photo</label>
            <input type="file" accept="image/*" style={styles.formFile} onChange={e => setForm({ ...form, image: e.target.files[0] })} />
          </div>
        </div>

        {/* Documents Upload Section */}
        <div style={styles.sectionDivider}>
          <span style={styles.sectionDividerIcon}>📎</span>
          <span style={styles.sectionDividerText}>Documents & Certificates</span>
        </div>

        <div style={styles.formFieldFull}>
          <button type="button" style={styles.addDocBtn} onClick={addDocument}>
            + Add Document
          </button>
          
          {documents.map((doc, idx) => (
            <div key={idx} style={styles.docItem}>
              <select 
                style={styles.docSelect}
                value={doc.type}
                onChange={(e) => updateDocument(idx, 'type', e.target.value)}
              >
                {documentTypes.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
              <input
                type="text"
                style={styles.docTitle}
                placeholder="Document title"
                value={doc.title}
                onChange={(e) => updateDocument(idx, 'title', e.target.value)}
              />
              <input
                type="file"
                style={styles.docFile}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => updateDocument(idx, 'file', e.target.files[0])}
              />
              {doc.file && <span style={styles.docFileName}>{doc.file.name}</span>}
              <button type="button" style={styles.removeDocBtn} onClick={() => removeDocument(idx)}>✖</button>
            </div>
          ))}
          
          {/* Existing Documents with DELETE BUTTON - ONLY IN EDIT FORM */}
          {existingDocuments.length > 0 && editId && (
            <div style={styles.existingDocs}>
              <strong>📂 Existing Documents:</strong>
              {existingDocuments.map((doc, idx) => (
                <div key={idx} style={styles.existingDocItem}>
                  <span>{getDocumentIcon(doc.document_type)}</span>
                  <span style={styles.existingDocTitle}>{doc.title}</span>
                  <span style={styles.existingDocType}>{doc.document_type}</span>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={styles.viewDocLink}>View</a>
                  <button 
                    style={styles.deleteDocBtn} 
                    onClick={() => handleDeleteDocument(editId, doc.id, doc.title)}
                    title="Delete document"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.formFieldFull}>
          <label style={styles.formLabel}>Additional Notes</label>
          <textarea style={styles.formTextarea} rows="3" 
            placeholder="Enter any additional information..." 
            value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />
        </div>
        
        <button style={styles.submitBtn} onClick={handleSubmit} disabled={uploading}>
          {uploading ? "⏳ Uploading..." : (editId ? "✏️ Update Teacher" : "➕ Add Teacher")}
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input style={styles.searchInput} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={styles.filterSelect} value={filterCourse || ""} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">All Classes</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={styles.actionGroup}>
          <button style={styles.actionBtn} onClick={() => setViewMode("table")}>📋 Table View</button>
          <button style={styles.actionBtnGold} onClick={() => setViewMode("card")}>🃏 Card View</button>
        </div>
      </div>

      {/* Total Count */}
      <div style={styles.totalCount}>
        👨‍🏫 Total Teachers: <strong>{filtered.length}</strong> {filterCourse && `(Filtered by: ${getCourseName(filterCourse)})`}
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Sl No</th>
                <th style={styles.th}>Photo</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Actions</th>
               </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={t.id} style={styles.tableRow} onClick={() => handleViewTeacher(t)}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    {t.image_url ? 
                      <img src={t.image_url} style={styles.tableAvatar} alt={t.name} /> :
                      <div style={styles.tableAvatarPlaceholder}>👨‍🏫</div>
                    }
                  </td>
                  <td style={styles.td}><strong>{t.name}</strong></td>
                  <td style={styles.td}>{t.subject || "-"}</td>
                  <td style={styles.td}>
                    <span style={styles.courseBadge}>{getCourseName(t.course)}</span>
                  </td>
                  <td style={styles.td}>{t.phone || "-"}</td>
                  <td style={styles.td}>{t.email || "-"}</td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={(e) => { e.stopPropagation(); handleEdit(t); }}>✏️</button>
                    <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>🗑️</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={styles.emptyRow}>No teachers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div style={styles.cardGrid}>
          {filtered.map(t => (
            <div key={t.id} style={styles.teacherCard} onClick={() => handleViewTeacher(t)}>
              <div style={styles.cardHeader}>
                <div style={styles.cardPhoto}>
                  {t.image_url ? (
                    <img src={t.image_url} style={styles.cardAvatar} alt={t.name} />
                  ) : (
                    <div style={styles.cardAvatarPlaceholder}>👨‍🏫</div>
                  )}
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardName}>{t.name}</h3>
                  <p style={styles.cardSubject}>📚 {t.subject || "No subject"}</p>
                  <span style={styles.cardCourse}>{getCourseName(t.course)}</span>
                </div>
              </div>
              <div style={styles.cardDetails}>
                <div style={styles.cardDetailItem}>
                  <span>📞</span> {t.phone || "No phone"}
                </div>
                <div style={styles.cardDetailItem}>
                  <span>🎓</span> {t.qualification?.split('\n')[0] || "No qualification"}
                </div>
                {t.experience && (
                  <div style={styles.cardDetailItem}>
                    <span>📊</span> {t.experience?.split('\n')[0] || "-"} 
                  </div>
                )}
                {t.salary && (
                  <div style={styles.cardDetailItem}>
                    <span>💰</span> ₹{t.salary.toLocaleString()}/month
                  </div>
                )}
              </div>
              <div style={styles.cardActions}>
                <button style={styles.cardEditBtn} onClick={(e) => { e.stopPropagation(); handleEdit(t); }}>✏️ Edit</button>
                <button style={styles.cardDeleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Detail Modal - NO DELETE BUTTON */}
      {selected && (
        <div style={styles.modalOverlay} onClick={() => { setSelected(null); setTeacherDetails(null); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalPhoto}>
                {selected.image_url ? (
                  <img src={selected.image_url} style={styles.modalAvatar} alt={selected.name} />
                ) : (
                  <div style={styles.modalAvatarPlaceholder}>👨‍🏫</div>
                )}
              </div>
              <div style={styles.modalInfo}>
                <h2 style={styles.modalName}>{selected.name}</h2>
                <p style={styles.modalId}>{selected.subject} • {getCourseName(selected.course)}</p>
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>👤 Personal Information</h4>
                <div style={styles.modalGrid}>
                  <div><span>📞 Phone:</span> <strong>{selected.phone || "Not provided"}</strong></div>
                  <div><span>📧 Email:</span> <strong>{selected.email || "Not provided"}</strong></div>
                  <div><span>🎂 DOB:</span> <strong>{selected.dob || "Not provided"}</strong></div>
                  <div><span>🩸 Blood:</span> <strong>{selected.blood_group || "Not provided"}</strong></div>
                  <div><span>⚥ Gender:</span> <strong>{selected.gender || "Not provided"}</strong></div>
                  <div><span>🏫 Teaching Level:</span> <strong>{selected.teaching_level || "Not provided"}</strong></div>
                </div>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>🎓 Professional Information</h4>
                <div style={styles.modalGrid}>
                  <div><span>📚 Subject:</span> <strong>{selected.subject || "Not provided"}</strong></div>
                  <div><span>🏫 Course:</span> <strong>{getCourseName(selected.course)}</strong></div>
                  <div><span>🎓 Qualification:</span> <strong>{selected.qualification || "Not provided"}</strong></div>
                  <div><span>📊 Experience:</span> <strong>{selected.experience || "Not provided"}</strong></div>
                  <div><span>💰 Salary:</span> <strong>₹{selected.salary?.toLocaleString() || "Not set"}/month</strong></div>
                </div>
              </div>

              {selected.career_details && (
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSectionTitle}>📋 Career Details</h4>
                  <p style={styles.modalDetails}>{selected.career_details}</p>
                </div>
              )}

              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>📍 Address</h4>
                <p style={styles.modalAddress}>{selected.address || "Not provided"}</p>
              </div>

              {/* Documents Section - VIEW ONLY */}
              {selected.documents && selected.documents.length > 0 && (
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSectionTitle}>📎 Documents & Certificates ({selected.documents.length})</h4>
                  <div style={styles.documentsGrid}>
                    {selected.documents.map((doc, idx) => (
                      <div key={idx} style={styles.documentCard}>
                        <div style={styles.documentIcon}>{getDocumentIcon(doc.document_type)}</div>
                        <div style={styles.documentInfo}>
                          <div style={styles.documentTitle}>{doc.title}</div>
                          <div style={styles.documentType}>{doc.document_type}</div>
                        </div>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={styles.documentViewBtn}>
                          📄 View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selected.documents || selected.documents.length === 0) && (
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSectionTitle}>📎 Documents & Certificates</h4>
                  <div style={styles.noDocuments}>
                    <span>📭</span>
                    <p>No documents uploaded yet</p>
                  </div>
                </div>
              )}

              {selected.details && (
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSectionTitle}>📝 Additional Information</h4>
                  <p style={styles.modalDetails}>{selected.details}</p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.modalCloseBtn} onClick={() => { setSelected(null); setTeacherDetails(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        button:hover { transform: translateY(-1px); transition: all 0.2s; }
        .teacher-card:hover { transform: translateY(-4px); transition: all 0.3s ease; }
        .document-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s; }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    background: "#f5f7fb",
    minHeight: "calc(100vh - 70px)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  schoolHeader: {
    textAlign: "center",
    marginBottom: "24px",
    padding: "20px",
    background: "linear-gradient(135deg, #215764, #0c595f)",
    borderRadius: "16px",
    border: "1px solid #d4af37",
  },
  schoolName: {
    fontSize: "clamp(20px, 4vw, 28px)",
    fontWeight: "bold",
    color: "#d4af37",
    margin: 0,
  },
  schoolAddress: {
    fontSize: "12px",
    color: "#e0e0e0",
    marginTop: "8px",
  },
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#10b981",
    color: "white",
    padding: "12px 20px",
    borderRadius: "12px",
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    animation: "slideIn 0.3s ease",
  },
  toastBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    padding: "4px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  confirmDialog: {
    background: "white",
    borderRadius: "20px",
    padding: "24px",
    width: "380px",
    maxWidth: "90vw",
  },
  confirmTitle: {
    margin: "0 0 12px 0",
    color: "#dc3545",
    fontSize: "20px",
  },
  confirmMessage: {
    color: "#555",
    marginBottom: "24px",
  },
  confirmActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "8px 20px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "8px 20px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  backBtn: {
    background: "linear-gradient(135deg, #14c3bd, #1bb193)",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "20px",
  },
  formCard: {
    background: "white",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e2e8f0",
  },
  formTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
  },
  cancelEditBtn: {
    background: "#f1f5f9",
    border: "none",
    padding: "6px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#475569",
  },
  // Login Credentials Section Styles
  loginCredentialsSection: {
    background: "linear-gradient(135deg, #fef9e7 0%, #fff8e7 100%)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    border: "2px solid #d4af37",
    boxShadow: "0 2px 8px rgba(212, 175, 55, 0.2)",
  },
  loginSectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #d4af37",
  },
  loginIcon: {
    fontSize: "24px",
  },
  loginSectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a472a",
    margin: 0,
  },
  loginBadge: {
    background: "#d4af37",
    color: "#1a472a",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    marginLeft: "auto",
  },
  loginCredentialsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  highlightField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  highlightLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1a472a",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  labelIcon: {
    fontSize: "16px",
  },
  highlightInput: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "2px solid #d4af37",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    background: "white",
    fontWeight: "500",
  },
  highlightHint: {
    fontSize: "11px",
    color: "#1a472a",
    marginTop: "4px",
    fontWeight: "500",
  },
  // Section Divider Styles
  sectionDivider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "24px 0 20px 0",
    padding: "8px 0",
    borderBottom: "2px solid #e2e8f0",
  },
  sectionDividerIcon: {
    fontSize: "20px",
    background: "#f1f5f9",
    padding: "6px 10px",
    borderRadius: "10px",
  },
  sectionDividerText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a472a",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formFieldFull: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  formInput: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
  },
  formSelect: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    background: "white",
  },
  formTextarea: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  formFile: {
    padding: "8px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "13px",
  },
  passwordWrapper: {
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#94a3b8",
  },
  errorText: {
    fontSize: "11px",
    color: "#dc3545",
  },
  hintText: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  submitBtn: {
    width: "100%",
    marginTop: "24px",
    padding: "12px",
    background: "linear-gradient(135deg, #2f7ea5, #0c617b)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  addDocBtn: {
    padding: "8px 16px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    marginBottom: "12px",
    alignSelf: "flex-start",
  },
  docItem: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  docSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    background: "white",
    minWidth: "140px",
  },
  docTitle: {
    flex: 2,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    outline: "none",
    minWidth: "180px",
  },
  docFile: {
    flex: 1,
    padding: "6px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "11px",
    minWidth: "150px",
  },
  docFileName: {
    fontSize: "11px",
    color: "#10b981",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeDocBtn: {
    padding: "6px 10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  existingDocs: {
    marginTop: "16px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  existingDocItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  existingDocTitle: {
    flex: 2,
    fontSize: "13px",
    fontWeight: "500",
  },
  existingDocType: {
    fontSize: "11px",
    color: "#64748b",
    background: "#e2e8f0",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  viewDocLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "12px",
    padding: "4px 12px",
    background: "#eef2ff",
    borderRadius: "6px",
  },
  deleteDocBtn: {
    padding: "4px 10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    marginLeft: "4px",
  },
  documentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
  },
  documentCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s",
  },
  documentIcon: {
    fontSize: "28px",
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
  },
  documentType: {
    fontSize: "10px",
    color: "#64748b",
    textTransform: "capitalize",
  },
  documentViewBtn: {
    padding: "6px 12px",
    background: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "500",
  },
  noDocuments: {
    textAlign: "center",
    padding: "30px",
    background: "#f8fafc",
    borderRadius: "12px",
    color: "#94a3b8",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    background: "white",
    borderRadius: "12px",
    padding: "0 12px",
    border: "1px solid #e2e8f0",
    flex: 1,
    minWidth: "200px",
  },
  searchIcon: {
    fontSize: "16px",
    color: "#94a3b8",
  },
  searchInput: {
    flex: 1,
    padding: "10px 8px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    background: "transparent",
  },
  filterSelect: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: "14px",
  },
  actionGroup: {
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    padding: "8px 16px",
    background: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  actionBtnGold: {
    padding: "8px 16px",
    background: "#d4af37",
    color: "#1a472a",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  totalCount: {
    background: "white",
    padding: "12px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  tableWrapper: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    color: "#334155",
  },
  tableRow: {
    cursor: "pointer",
    transition: "background 0.2s",
    "&:hover": { background: "#f8fafc" },
  },
  tableAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  tableAvatarPlaceholder: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
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
  editBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "6px",
    fontSize: "12px",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  emptyRow: {
    textAlign: "center",
    padding: "48px",
    color: "#94a3b8",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px",
  },
  teacherCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  cardPhoto: {
    flexShrink: 0,
  },
  cardAvatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #d4af37",
  },
  cardAvatarPlaceholder: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    color: "white",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 4px 0",
    color: "#1e293b",
  },
  cardSubject: {
    fontSize: "12px",
    color: "#1a472a",
    margin: "0 0 6px 0",
    fontWeight: "500",
  },
  cardCourse: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
  },
  cardDetails: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "12px",
    marginBottom: "12px",
  },
  cardDetailItem: {
    fontSize: "12px",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
  },
  cardEditBtn: {
    flex: 1,
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  cardDeleteBtn: {
    flex: 1,
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  modalContent: {
    background: "white",
    borderRadius: "28px",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
    padding: "32px",
    textAlign: "center",
    borderTopLeftRadius: "28px",
    borderTopRightRadius: "28px",
  },
  modalPhoto: {
    marginBottom: "16px",
  },
  modalAvatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #d4af37",
  },
  modalAvatarPlaceholder: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    color: "white",
    margin: "0 auto",
  },
  modalInfo: {
    color: "white",
  },
  modalName: {
    fontSize: "24px",
    margin: "0 0 6px 0",
  },
  modalId: {
    fontSize: "13px",
    opacity: 0.8,
    margin: 0,
  },
  modalBody: {
    padding: "24px",
  },
  modalSection: {
    marginBottom: "24px",
  },
  modalSectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a472a",
    margin: "0 0 12px 0",
    paddingBottom: "8px",
    borderBottom: "2px solid #e2e8f0",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    fontSize: "14px",
    "& span": {
      color: "#64748b",
      marginRight: "8px",
      minWidth: "85px",
      display: "inline-block",
    },
  },
  modalAddress: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.5",
    margin: 0,
  },
  modalDetails: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    margin: 0,
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
  },
  modalCloseBtn: {
    padding: "10px 32px",
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
    color: "white",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default TeachersAdmin;