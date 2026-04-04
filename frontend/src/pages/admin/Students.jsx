import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [selected, setSelected] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [showConfirm, setShowConfirm] = useState({ show: false, message: "", type: "", onConfirm: null });
  const [showSuccess, setShowSuccess] = useState({ show: false, message: "" });
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    course: "",
    admission_no: "",
    password: "",
    phone: "",
    email: "",
    dob: "",
    blood_group: "",
    gender: "",
    parent_name: "",
    parent_phone: "",
    address: "",
    details: "",
    image: null,
  });

  const API = "http://127.0.0.1:8000/api/";

  const fetchData = () => {
    fetch(API + "students/")
      .then(r => r.json())
      .then(setStudents)
      .catch(err => console.error("Fetch error:", err));
    fetch(API + "courses/")
      .then(r => r.json())
      .then(setCourses)
      .catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = "Name is required";
    if (!form.admission_no?.trim()) newErrors.admission_no = "Admission number is required";
    if (!form.course) newErrors.course = "Course is required";
    if (!editingStudent && !form.password) newErrors.password = "Password is required for new students";
    if (form.password && form.password.length < 4) newErrors.password = "Password must be at least 4 characters";
    if (!form.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9+\-\s()]{10,15}$/.test(form.phone)) newErrors.phone = "Phone number is invalid";
    if (!form.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.dob) newErrors.dob = "Date of Birth is required";
    if (!form.blood_group) newErrors.blood_group = "Blood group is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (!form.parent_name?.trim()) newErrors.parent_name = "Parent name is required";
    if (!form.parent_phone?.trim()) newErrors.parent_phone = "Parent phone is required";
    else if (!/^[0-9+\-\s()]{10,15}$/.test(form.parent_phone)) newErrors.parent_phone = "Parent phone number is invalid";
    if (!form.address?.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      course: "",
      admission_no: "",
      password: "",
      phone: "",
      email: "",
      dob: "",
      blood_group: "",
      gender: "",
      parent_name: "",
      parent_phone: "",
      address: "",
      details: "",
      image: null,
    });
    setEditingStudent(null);
    setErrors({});
    setShowPassword(false);
  };

  const handleAddStudent = async () => {
    if (!validateForm()) {
      setShowSuccess({ show: true, message: "Please fill all required fields" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });

    try {
      const res = await fetch(API + "students/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        fetchData();
        resetForm();
        setLastSaved(data);
        setShowSuccess({ show: true, message: "Student added successfully!" });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      } else {
        setShowSuccess({ show: true, message: "Error: " + JSON.stringify(data) });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      }
    } catch (err) {
      setShowSuccess({ show: true, message: "Network error!" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
    }
  };

  const handleUpdateStudent = async () => {
    if (!validateForm()) {
      setShowSuccess({ show: true, message: "Please fill all required fields" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });

    try {
      const res = await fetch(API + `students/${editingStudent.id}/`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        fetchData();
        resetForm();
        setLastSaved(data);
        setShowSuccess({ show: true, message: "Student updated successfully!" });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      } else {
        setShowSuccess({ show: true, message: "Error: " + JSON.stringify(data) });
        setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
      }
    } catch (err) {
      setShowSuccess({ show: true, message: "Network error!" });
      setTimeout(() => setShowSuccess({ show: false, message: "" }), 3000);
    }
  };

  const handleSubmit = () => {
    if (editingStudent) {
      handleUpdateStudent();
    } else {
      handleAddStudent();
    }
  };

  const handleDelete = async (id) => {
    setShowConfirm({
      show: true,
      message: "Are you sure you want to delete this student? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(API + `students/${id}/`, { method: "DELETE" });
          if (res.ok) {
            fetchData();
            if (selected?.id === id) setSelected(null);
            setShowSuccess({ show: true, message: "Student deleted successfully!" });
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

  const handleEdit = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name || "",
      course: student.course || "",
      admission_no: student.admission_no || "",
      password: "",
      phone: student.phone || "",
      email: student.email || "",
      dob: student.dob || "",
      blood_group: student.blood_group || "",
      gender: student.gender || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      address: student.address || "",
      details: student.details || "",
      image: null,
    });
    setErrors({});
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = students
    .filter(s => !filterCourse || s.course == filterCourse)
    .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  const getCourseName = (courseId) => {
    if (!courseId) return "Unknown";
    const course = courses.find(c => c.id == courseId);
    return course ? course.name : "Unknown";
  };

  const handlePrintTable = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Students List - Paradise Islamic Pre-School</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', 'Poppins', 'Inter', Arial, sans-serif; 
              padding: 40px; 
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              min-height: 100vh;
            }
            .print-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(26, 71, 42, 0.15);
              overflow: hidden;
              padding: 30px;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 25px; 
              border-bottom: 3px solid #d4af37;
              position: relative;
            }
            .school-logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .print-school-name { 
              font-size: 32px; 
              font-weight: 800; 
              background: linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .print-school-address { 
              color: #4a5568; 
              font-size: 13px; 
              margin-top: 5px;
              font-weight: 500;
            }
            .print-school-motto {
              color: #d4af37;
              font-size: 11px;
              margin-top: 6px;
              font-style: italic;
              letter-spacing: 0.5px;
            }
            .print-title {
              font-size: 22px;
              font-weight: 700;
              color: #1a472a;
              margin-top: 20px;
              margin-bottom: 8px;
            }
            .print-meta {
              margin-top: 8px;
              font-size: 11px;
              color: #718096;
              display: flex;
              justify-content: center;
              gap: 20px;
            }
            .print-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 25px;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            .print-table th { 
              background: linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%);
              color: white; 
              padding: 14px 16px; 
              text-align: left; 
              font-weight: 600;
              font-size: 13px;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #d4af37;
            }
            .print-table td { 
              padding: 12px 16px; 
              border-bottom: 1px solid #e2e8f0;
              color: #2d3748;
              font-size: 13px;
            }
            .print-table tr:hover {
              background: #f7fafc;
            }
            .print-table tr:last-child td {
              border-bottom: none;
            }
            .print-footer { 
              margin-top: 30px; 
              padding-top: 20px;
              text-align: center; 
              font-size: 10px; 
              color: #a0aec0;
              border-top: 1px solid #e2e8f0;
            }
            .print-signature {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
              padding-top: 20px;
            }
            .signature-line {
              text-align: center;
              font-size: 10px;
              color: #718096;
            }
            .signature-line div {
              margin-top: 30px;
              width: 200px;
              border-top: 1px solid #cbd5e0;
            }
            @media print {
              body { background: white; padding: 20px; }
              .print-container { box-shadow: none; padding: 0; }
              .print-table th { background: #1a472a; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <div class="school-logo">🏫</div>
              <div class="print-school-name">PARADISE ISLAMIC PRE-SCHOOL</div>
              <div class="print-school-address">Pullur, Tirur - 676102 | Malappuram, Kerala</div>
              <div class="print-school-motto">"Quality Education with Islamic Values"</div>
              <div class="print-title">📋 Students Directory</div>
              <div class="print-meta">
                <span>📅 Generated: ${new Date().toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span>👨‍🎓 Total Students: ${filtered.length}</span>
              </div>
            </div>
            <table class="print-table">
              <thead>
                <tr>
                  <th style="width: 8%">Sl No</th>
                  <th style="width: 15%">Admission No</th>
                  <th style="width: 25%">Student Name</th>
                  <th style="width: 20%">Course</th>
                  <th style="width: 17%">Phone</th>
                  <th style="width: 15%">Parent Name</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((s, idx) => `
                  <tr>
                    <td style="font-weight: 600;">${idx + 1}</td>
                    <td><strong>${s.admission_no || ""}</strong></td>
                    <td>${s.name || ""}</td>
                    <td>${getCourseName(s.course)}</td>
                    <td>${s.phone || "-"}</td>
                    <td>${s.parent_name || "-"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="print-footer">
              <p>This is a computer-generated document. Valid with authorized signature.</p>
              <p>For any queries, please contact the school administration.</p>
            </div>
            <div class="print-signature">
              <div class="signature-line">
                <div></div>
                <span>Parent/Guardian Signature</span>
              </div>
              <div class="signature-line">
                <div></div>
                <span>Principal/Authorized Signatory</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintCards = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Cards - Paradise Islamic Pre-School</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 8mm;
            }
            
            body {
              font-family: 'Segoe UI', 'Poppins', 'Inter', Arial, sans-serif;
              background: white;
              padding: 0;
              margin: 0;
            }
            
            .cards-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 6mm;
              justify-content: center;
              max-width: 210mm;
              margin: 0 auto;
            }
            
            .id-card {
              width: 85.6mm;
              height: 54mm;
              background: white;
              overflow: hidden;
              page-break-inside: avoid;
              break-inside: avoid;
              position: relative;
              margin: 0 auto;
              border: 2px solid #000000;
              border-radius: 2mm;
            }
            
            .id-card-inner {
              position: absolute;
              top: 1.5mm;
              left: 1.5mm;
              right: 1.5mm;
              bottom: 1.5mm;
              border: 0.3mm dashed #cccccc;
              pointer-events: none;
              border-radius: 1mm;
            }
            
            .card-header {
              background: linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%);
              padding: 2.5mm 2mm;
              text-align: center;
              border-bottom: 1.5px solid #d4af37;
            }
            
            .card-header h3 {
              font-size: 3.2mm;
              font-weight: 700;
              letter-spacing: 0.3px;
              color: #d4af37;
              margin-bottom: 0.5mm;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .card-header p {
              font-size: 2mm;
              color: #e2e8f0;
              letter-spacing: 0.2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .photo-section {
              text-align: center;
              margin-top: -3mm;
              position: relative;
              z-index: 2;
            }
            
            .photo {
              width: 10mm;
              height: 10mm;
              border-radius: 50%;
              background: white;
              margin: 0 auto;
              overflow: hidden;
              border: 1.2mm solid #d4af37;
              box-shadow: 0 0.5mm 1mm rgba(0, 0, 0, 0.1);
            }
            
            .photo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .photo-placeholder {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 6mm;
              background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
            }
            
            .card-body {
              padding: 1.5mm 2.5mm 1mm;
              text-align: center;
            }
            
            .student-name {
              font-size: 3.8mm;
              font-weight: 700;
              color: #1a472a;
              margin-bottom: 0.5mm;
              line-height: 1.2;
              word-break: break-word;
              max-height: 7mm;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            
            .student-admission {
              font-size: 2.2mm;
              color: #2e5c3a;
              margin-bottom: 1mm;
              font-weight: 500;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.8mm;
              margin-top: 1mm;
              border-top: 0.3px dashed #cbd5e0;
              padding-top: 1mm;
              text-align: left;
            }
            
            .info-item {
              display: flex;
              align-items: center;
              gap: 0.8mm;
              font-size: 2mm;
              color: #4a5568;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .info-icon {
              font-size: 2.2mm;
              min-width: 3.5mm;
            }
            
            .info-label {
              font-weight: 600;
              color: #1a472a;
              margin-right: 0.3mm;
              font-size: 2mm;
            }
            
            .info-value {
              color: #2d3748;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .card-footer {
              background: #f7fafc;
              padding: 0.8mm;
              text-align: center;
              border-top: 0.3px solid #e2e8f0;
              font-size: 1.8mm;
              color: #718096;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .valid-badge {
              display: inline-block;
              background: #d4af37;
              color: #1a472a;
              padding: 0.2mm 1.5mm;
              border-radius: 1.5mm;
              font-size: 1.8mm;
              font-weight: 700;
              margin-top: 0.8mm;
            }
            
            @media print {
              body {
                background: white;
                margin: 0;
                padding: 0;
                zoom: 100%;
              }
              
              .cards-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 5mm;
                page-break-inside: avoid;
                margin: 0;
              }
              
              .id-card {
                break-inside: avoid;
                page-break-inside: avoid;
                box-shadow: none;
                border: 1.5px solid #000000;
                border-radius: 2mm;
              }
              
              .id-card-inner {
                border: 0.3mm dashed #aaaaaa;
              }
              
              .card-header {
                background: #1a472a;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              .valid-badge {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              .photo-placeholder {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
            
            @media screen {
              .cards-container {
                gap: 8mm;
              }
            }
            
            @media screen and (max-width: 700px) {
              .cards-container {
                grid-template-columns: 1fr;
                gap: 10mm;
              }
              .id-card {
                transform: scale(0.98);
              }
            }
          </style>
        </head>
        <body>
          <div class="cards-container">
            ${filtered.map(s => `
              <div class="id-card">
                <div class="id-card-inner"></div>
                <div class="card-header">
                  <h3>🏫 PARADISE ISLAMIC PRE-SCHOOL</h3>
                  <p>STUDENT IDENTIFICATION CARD</p>
                </div>
                <div class="photo-section">
                  <div class="photo">
                    ${s.image_url ? 
                      `<img src="${s.image_url}" alt="${s.name}" />` : 
                      `<div class="photo-placeholder">👨‍🎓</div>`
                    }
                  </div>
                </div>
                <div class="card-body">
                  <div class="student-name">${s.name || ""}</div>
                  <div class="student-admission">ID: ${s.admission_no || ""}</div>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-icon">📚</span>
                      <span class="info-label">Course:</span>
                      <span class="info-value">${getCourseName(s.course)}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-icon">🩸</span>
                      <span class="info-label">Blood:</span>
                      <span class="info-value">${s.blood_group || "N/A"}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-icon">📞</span>
                      <span class="info-label">Phone:</span>
                      <span class="info-value">${s.phone || "N/A"}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-icon">👨‍👩</span>
                      <span class="info-label">Parent:</span>
                      <span class="info-value">${s.parent_name?.split(' ')[0] || "N/A"}</span>
                    </div>
                  </div>
                  <div class="valid-badge">✓ VALID FOR ACADEMIC YEAR</div>
                </div>
                <div class="card-footer">
                  Pullur, Tirur - 676102
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const genders = ["Male", "Female", "Other"];

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
            <button style={styles.toastBtn} onClick={() => setSelected(lastSaved)}>View</button>
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
              <button style={styles.confirmBtn} onClick={showConfirm.onConfirm}>Confirm</button>
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
          <h3 style={styles.formTitle}>{editingStudent ? "✏️ Edit Student" : "➕ Add New Student"}</h3>
          {editingStudent && <button style={styles.cancelEditBtn} onClick={resetForm}>Cancel Edit</button>}
        </div>
        
        {/* Login Credentials Section - HIGHLIGHTED */}
        <div style={styles.loginCredentialsSection}>
          <div style={styles.loginSectionHeader}>
            <span style={styles.loginIcon}>🔐</span>
            <h4 style={styles.loginSectionTitle}>Student Login Credentials</h4>
            <span style={styles.loginBadge}>Important for student access</span>
          </div>
          <div style={styles.loginCredentialsGrid}>
            <div style={styles.highlightField}>
              <label style={styles.highlightLabel}>
                <span style={styles.labelIcon}>🎫</span> Admission Number *
              </label>
              <input 
                type="text" 
                style={{...styles.highlightInput, borderColor: errors.admission_no ? "#dc3545" : "#d4af37"}}
                placeholder="Enter admission number (used for login)"
                value={form.admission_no} 
                onChange={e => setForm({ ...form, admission_no: e.target.value })} 
              />
              {errors.admission_no && <span style={styles.errorText}>{errors.admission_no}</span>}
              <small style={styles.highlightHint}>📌 Student will use this to login</small>
            </div>
            
            <div style={styles.highlightField}>
              <label style={styles.highlightLabel}>
                <span style={styles.labelIcon}>🔑</span> Password {!editingStudent && "*"}
              </label>
              <div style={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  style={{...styles.highlightInput, paddingRight: "40px", borderColor: errors.password ? "#dc3545" : "#d4af37"}}
                  placeholder={editingStudent ? "Leave blank to keep current" : "Enter password (used for login)"} 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                />
                <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
              <small style={styles.highlightHint}>🔒 Minimum 4 characters - Student will use this to login</small>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div style={styles.sectionDivider}>
          <span style={styles.sectionDividerIcon}>👤</span>
          <span style={styles.sectionDividerText}>Personal Information</span>
        </div>

        <div style={styles.formGrid}>
          {[
            { label: "Full Name", name: "name", type: "text", placeholder: "Enter student name" },
            { label: "Phone Number", name: "phone", type: "text", placeholder: "Enter phone number" },
            { label: "Email Address", name: "email", type: "email", placeholder: "Enter email address" },
          ].map(field => (
            <div key={field.name} style={styles.formField}>
              <label style={styles.formLabel}>{field.label} *</label>
              <input type={field.type} style={{...styles.formInput, borderColor: errors[field.name] ? "#dc3545" : "#e2e8f0" }}
                placeholder={field.placeholder} value={form[field.name]} onChange={e => setForm({ ...form, [field.name]: e.target.value })} />
              {errors[field.name] && <span style={styles.errorText}>{errors[field.name]}</span>}
            </div>
          ))}
          
          {/* Course Field */}
          <div style={styles.formField}>
            <label style={styles.formLabel}>Course *</label>
            <select style={{...styles.formSelect, borderColor: errors.course ? "#dc3545" : "#e2e8f0" }}
              value={form.course || ""} onChange={e => setForm({ ...form, course: e.target.value })}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.course && <span style={styles.errorText}>{errors.course}</span>}
          </div>

          {/* Date of Birth Field */}
          <div style={styles.formField}>
            <label style={styles.formLabel}>Date of Birth *</label>
            <input type="date" style={{...styles.formInput, borderColor: errors.dob ? "#dc3545" : "#e2e8f0" }}
              value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
            {errors.dob && <span style={styles.errorText}>{errors.dob}</span>}
          </div>

          {/* Blood Group Field */}
          <div style={styles.formField}>
            <label style={styles.formLabel}>Blood Group *</label>
            <select style={{...styles.formSelect, borderColor: errors.blood_group ? "#dc3545" : "#e2e8f0" }}
              value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
              <option value="">Select Blood Group</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            {errors.blood_group && <span style={styles.errorText}>{errors.blood_group}</span>}
          </div>

          {/* Gender Field */}
          <div style={styles.formField}>
            <label style={styles.formLabel}>Gender *</label>
            <select style={{...styles.formSelect, borderColor: errors.gender ? "#dc3545" : "#e2e8f0" }}
              value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select Gender</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.gender && <span style={styles.errorText}>{errors.gender}</span>}
          </div>

          {/* Address Field */}
          <div style={styles.formFieldFull}>
            <label style={styles.formLabel}>Address *</label>
            <textarea style={{...styles.formTextarea, borderColor: errors.address ? "#dc3545" : "#e2e8f0" }}
              rows="2" placeholder="Enter address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            {errors.address && <span style={styles.errorText}>{errors.address}</span>}
          </div>
        </div>

        {/* Parent Information Section */}
        <div style={styles.sectionDivider}>
          <span style={styles.sectionDividerIcon}>👨‍👩‍👧</span>
          <span style={styles.sectionDividerText}>Parent / Guardian Information</span>
        </div>

        <div style={styles.formGrid}>
          {[
            { label: "Parent Name", name: "parent_name", type: "text", placeholder: "Enter parent/guardian name" },
            { label: "Parent Phone", name: "parent_phone", type: "text", placeholder: "Enter parent phone number" },
          ].map(field => (
            <div key={field.name} style={styles.formField}>
              <label style={styles.formLabel}>{field.label} *</label>
              <input type={field.type} style={{...styles.formInput, borderColor: errors[field.name] ? "#dc3545" : "#e2e8f0" }}
                placeholder={field.placeholder} value={form[field.name]} onChange={e => setForm({ ...form, [field.name]: e.target.value })} />
              {errors[field.name] && <span style={styles.errorText}>{errors[field.name]}</span>}
            </div>
          ))}
        </div>

        {/* Additional Information Section */}
        <div style={styles.sectionDivider}>
          <span style={styles.sectionDividerIcon}>📎</span>
          <span style={styles.sectionDividerText}>Additional Information</span>
        </div>

        <div style={styles.formGrid}>
          {/* Student Photo Field */}
          <div style={styles.formField}>
            <label style={styles.formLabel}>Student Photo</label>
            <input type="file" style={styles.formFile} onChange={e => setForm({ ...form, image: e.target.files[0] })} />
          </div>

          {/* Additional Details Field */}
          <div style={styles.formFieldFull}>
            <label style={styles.formLabel}>Additional Details</label>
            <textarea style={styles.formTextarea} rows="3" placeholder="Enter any additional information..." 
              value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />
          </div>
        </div>
        
        <button style={styles.submitBtn} onClick={handleSubmit}>
          {editingStudent ? "✏️ Update Student" : "➕ Add Student"}
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
          <button style={styles.actionBtn} onClick={handlePrintTable}>🖨️ Print Table</button>
          <button style={styles.actionBtnGold} onClick={handlePrintCards}>🪪 Print ID Cards</button>
          <button style={{...styles.viewToggle, ...(viewMode === "table" ? styles.viewToggleActive : {})}} onClick={() => setViewMode("table")}>📋 Table</button>
          <button style={{...styles.viewToggle, ...(viewMode === "card" ? styles.viewToggleActive : {})}} onClick={() => setViewMode("card")}>🃏 Cards</button>
        </div>
      </div>

      {/* Total Count */}
      <div style={styles.totalCount}>
        👨‍🎓 Total Students: <strong>{filtered.length}</strong> {filterCourse && `(Filtered by: ${getCourseName(filterCourse)})`}
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Sl No</th>
                <th style={styles.th}>Admission No</th>
                <th style={styles.th}>Photo</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.id} style={styles.tableRow} onClick={() => setSelected(s)}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}><strong>{s.admission_no}</strong></td>
                  <td style={styles.td}>
                    {s.image_url ? 
                      <img src={s.image_url} style={styles.tableAvatar} alt={s.name} /> :
                      <div style={styles.tableAvatarPlaceholder}>👨‍🎓</div>
                    }
                  </td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>
                    <span style={styles.courseBadge}>{getCourseName(s.course)}</span>
                  </td>
                  <td style={styles.td}>{s.phone || "-"}</td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={(e) => { e.stopPropagation(); handleEdit(s); }}>✏️</button>
                    <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>🗑️</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" style={styles.emptyRow}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div style={styles.cardGrid}>
          {filtered.map(s => (
            <div key={s.id} style={styles.studentCard} onClick={() => setSelected(s)}>
              <div style={styles.cardHeader}>
                <div style={styles.cardPhoto}>
                  {s.image_url ? (
                    <img src={s.image_url} style={styles.cardAvatar} alt={s.name} />
                  ) : (
                    <div style={styles.cardAvatarPlaceholder}>👨‍🎓</div>
                  )}
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardName}>{s.name}</h3>
                  <p style={styles.cardAdmission}>Admission No: {s.admission_no}</p>
                  <span style={styles.cardCourse}>{getCourseName(s.course)}</span>
                </div>
              </div>
              <div style={styles.cardDetails}>
                <div style={styles.cardDetailItem}>
                  <span>📞</span> {s.phone || "No phone"}
                </div>
                <div style={styles.cardDetailItem}>
                  <span>👨‍👩‍👧</span> {s.parent_name || "No parent"}
                </div>
                {s.blood_group && (
                  <div style={styles.cardDetailItem}>
                    <span>🩸</span> {s.blood_group}
                  </div>
                )}
                {s.gender && (
                  <div style={styles.cardDetailItem}>
                    <span>⚥</span> {s.gender}
                  </div>
                )}
              </div>
              <div style={styles.cardActions}>
                <button style={styles.cardEditBtn} onClick={(e) => { e.stopPropagation(); handleEdit(s); }}>✏️ Edit</button>
                <button style={styles.cardDeleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {selected && (
        <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalPhoto}>
                {selected.image_url ? (
                  <img src={selected.image_url} style={styles.modalAvatar} alt={selected.name} />
                ) : (
                  <div style={styles.modalAvatarPlaceholder}>👨‍🎓</div>
                )}
              </div>
              <div style={styles.modalInfo}>
                <h2 style={styles.modalName}>{selected.name}</h2>
                <p style={styles.modalId}>Admission No: {selected.admission_no}</p>
                <span style={styles.modalCourse}>{getCourseName(selected.course)}</span>
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
                </div>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>👨‍👩‍👧 Parent Information</h4>
                <div style={styles.modalGrid}>
                  <div><span>👨‍👩 Parent:</span> <strong>{selected.parent_name || "Not provided"}</strong></div>
                  <div><span>📱 Parent Phone:</span> <strong>{selected.parent_phone || "Not provided"}</strong></div>
                </div>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>📍 Address</h4>
                <p style={styles.modalAddress}>{selected.address || "Not provided"}</p>
              </div>

              {selected.details && (
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSectionTitle}>📝 Additional Information</h4>
                  <p style={styles.modalDetails}>{selected.details}</p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.modalCloseBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        button:hover { transform: translateY(-1px); transition: all 0.2s; }
        .student-card:hover { transform: translateY(-4px); transition: all 0.3s ease; }
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
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
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
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)",
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
  // New styles for login credentials section
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
  // Section divider styles
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
  submitBtn: {
    width: "100%",
    marginTop: "24px",
    padding: "12px",
    background: "linear-gradient(135deg, #059669, #047857)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
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
    flexWrap: "wrap",
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
  viewToggle: {
    padding: "8px 16px",
    background: "#e2e8f0",
    color: "#475569",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  viewToggleActive: {
    background: "#1a472a",
    color: "white",
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
    "&:hover": {
      background: "#f8fafc",
    },
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
  studentCard: {
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
  cardAdmission: {
    fontSize: "11px",
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
    maxWidth: "700px",
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
    margin: "0 0 8px 0",
  },
  modalCourse: {
    display: "inline-block",
    background: "rgba(255,255,255,0.2)",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "12px",
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
      minWidth: "95px",
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

export default Students;