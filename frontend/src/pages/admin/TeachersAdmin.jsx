import { useEffect, useState } from "react";

function TeachersAdmin() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
    address: "",
    details: "",
    image: null,
  });

  const API = "http://127.0.0.1:8000/api/";

  const fetchData = () => {
    fetch(API + "teachers/")
      .then(r => r.json())
      .then(setTeachers)
      .catch(err => console.error("Fetch error:", err));
    fetch(API + "courses/")
      .then(r => r.json())
      .then(setCourses)
      .catch(err => console.error("Fetch error:", err));
    fetch(API + "subjects/")
      .then(r => r.json())
      .then(setSubjects)
      .catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validation function - FIXED for subject as number
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name?.trim()) newErrors.name = "Name is required";
    
    // Fix: subject can be a number (ID), so check if it exists
    if (!form.subject && form.subject !== 0) newErrors.subject = "Subject is required";
    
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
      address: "",
      details: "",
      image: null,
    });
    setEditId(null);
    setErrors({});
    setShowPassword(false);
  };

  // ADD Teacher (POST)
  const handleAddTeacher = async () => {
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
    }
  };

  // UPDATE Teacher (PATCH)
  const handleUpdateTeacher = async () => {
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
            if (selected?.id === id) setSelected(null);
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

  const handleEdit = (teacher) => {
    setEditId(teacher.id);
    setForm({
      name: teacher.name || "",
      subject: teacher.subject || "",
      email: teacher.email || "",
      password: "",
      phone: teacher.phone || "",
      course: teacher.course || "",
      dob: teacher.dob || "",
      blood_group: teacher.blood_group || "",
      gender: teacher.gender || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      address: teacher.address || "",
      details: teacher.details || "",
      image: null,
    });
    setErrors({});
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const getSubjectName = (subjectId) => {
    if (!subjectId) return "Unknown";
    const subject = subjects.find(s => s.id == subjectId);
    return subject ? subject.name : "Unknown";
  };

  // Professional Table Print
  const handlePrintTable = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Teachers List - Paradise Islamic Pre-School</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', 'Poppins', Arial, sans-serif; padding: 40px; background: white; }
            .print-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #d4af37; }
            .print-school-name { font-size: 32px; font-weight: bold; color: #d4af37; letter-spacing: 1px; }
            .print-school-address { color: #666; font-size: 14px; margin-top: 5px; }
            .print-school-motto { color: #888; font-size: 12px; margin-top: 5px; font-style: italic; }
            .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .print-table th { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 12px; text-align: left; font-weight: 600; }
            .print-table td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }
            .print-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            .watermark { position: fixed; bottom: 50px; right: 50px; opacity: 0.1; font-size: 60px; pointer-events: none; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="print-school-name">🏫 PARADISE ISLAMIC PRE-SCHOOL</div>
            <div class="print-school-address">Pullur, Tirur - 676102</div>
            <div class="print-school-motto">"Empowering Minds, Nurturing Souls"</div>
            <div style="font-size: 20px; margin-top: 20px; color: #2c3e50;">Teachers Directory</div>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">Generated on: ${new Date().toLocaleString()} | Total: ${filtered.length} Teachers</div>
          </div>
          <table class="print-table">
            <thead>
              <tr><th>Photo</th><th>Name</th><th>Subject</th><th>Course</th><th>Phone</th><th>Email</th> </thead>
            <tbody>
              ${filtered.map(t => `
                <tr>
                  <td>${t.image_url ? `<img src="${t.image_url}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" />` : '📷'}  <td><strong>${t.name || ""}</strong>  <td>${getSubjectName(t.subject)}  <td>${getCourseName(t.course)}  <td>${t.phone || "-"}  <td>${t.email || "-"}  </tr>
              `).join('')}
            </tbody>
           </table>
          <div class="print-footer">
            <p>This is a computer-generated document. Valid with authorized signature.</p>
            <p>Paradise Islamic Pre-School | Pullur, Tirur | Ph: +91 1234567890 | www.paradiseschool.edu</p>
          </div>
          <div class="watermark">📚</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Professional ID Card Print
  const handlePrintCards = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Teacher ID Cards - Paradise Islamic Pre-School</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', 'Poppins', Arial, sans-serif; background: #f0f2f5; padding: 40px; }
            .cards-container { display: flex; flex-wrap: wrap; gap: 25px; justify-content: center; }
            .print-id-card { width: 380px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.2); page-break-inside: avoid; margin-bottom: 25px; }
            .card-header-print { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 20px; text-align: center; color: white; }
            .card-header-print h3 { font-size: 18px; margin-bottom: 5px; }
            .photo-section-print { text-align: center; margin-top: -40px; position: relative; }
            .photo-print { width: 100px; height: 100px; border-radius: 50%; background: white; margin: 0 auto; overflow: hidden; border: 4px solid #d4af37; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
            .photo-print img { width: 100%; height: 100%; object-fit: cover; }
            .card-body-print { padding: 20px; }
            .teacher-name-print { text-align: center; font-size: 20px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
            .teacher-subject-print { text-align: center; color: #2ecc71; font-size: 14px; margin-bottom: 15px; }
            .info-grid-print { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; border-top: 1px dashed #ddd; padding-top: 15px; }
            .card-footer-print { background: #f8f9fa; padding: 12px; text-align: center; border-top: 1px solid #eee; font-size: 10px; color: #999; }
            @media print { body { padding: 20px; background: white; } .print-id-card { break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="cards-container">
            ${filtered.map(t => `
              <div class="print-id-card">
                <div class="card-header-print">
                  <h3>🏫 PARADISE ISLAMIC PRE-SCHOOL</h3>
                  <p>TEACHER IDENTIFICATION CARD</p>
                </div>
                <div class="photo-section-print">
                  <div class="photo-print">
                    ${t.image_url ? `<img src="${t.image_url}" />` : '<div style="display:flex; align-items:center; justify-content:center; height:100%; font-size:45px;">👨‍🏫</div>'}
                  </div>
                </div>
                <div class="card-body-print">
                  <div class="teacher-name-print">${t.name || ""}</div>
                  <div class="teacher-subject-print">📚 ${getSubjectName(t.subject)}</div>
                  <div class="info-grid-print">
                    <div>📧 ${t.email || "-"}</div><div>📞 ${t.phone || "-"}</div>
                    <div>🎓 ${t.qualification || "-"}</div><div>📊 ${t.experience || "-"} yrs</div>
                    <div>🩸 ${t.blood_group || "-"}</div><div>⚥ ${t.gender || "-"}</div>
                  </div>
                </div>
                <div class="card-footer-print">
                  <div>Pullur, Tirur - 676102 | Valid for Academic Year</div>
                  <div>Authorized Signature: _________________</div>
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

  const containerStyle = {
    padding: "20px",
    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    minHeight: "calc(100vh - 70px)",
    boxSizing: "border-box"
  };

  return (
    <div style={containerStyle}>
      {/* School Header */}
      <div style={{
        textAlign: "center",
        marginBottom: "30px",
        padding: "25px",
        background: "linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%)",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        border: "1px solid #d4af37"
      }}>
        <h1 style={{
          fontSize: "clamp(24px, 5vw, 36px)",
          fontWeight: "bold",
          color: "#d4af37",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          letterSpacing: "1px",
          margin: 0
        }}>🏫 PARADISE ISLAMIC PRE-SCHOOL</h1>
        <p style={{
          color: "#f0f0f0",
          fontSize: "clamp(12px, 3vw, 14px)",
          marginTop: "10px",
          opacity: 0.9
        }}>Pullur, Tirur - 676102 | Quality Education with Islamic Values</p>
      </div>

      {/* Success Message */}
      {showSuccess.show && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", background: "#28a745", color: "white",
          padding: "12px 20px", borderRadius: "8px", zIndex: 1001, boxShadow: "0 5px 15px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "10px"
        }}>
          <span>{showSuccess.message}</span>
          {lastSaved && (
            <button
              style={{ padding: "6px 10px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
              onClick={() => setSelected(lastSaved)}
            >
              View
            </button>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm.show && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{ background: "white", borderRadius: "15px", padding: "25px", width: "400px", maxWidth: "90vw" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#dc3545" }}>Confirm Action</h3>
            <p>{showConfirm.message}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button style={{ padding: "8px 16px", background: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                onClick={() => setShowConfirm({ show: false, message: "", type: "", onConfirm: null })}>Cancel</button>
              <button style={{ padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                onClick={showConfirm.onConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button style={{
        background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)", color: "white", border: "none",
        padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", marginBottom: "20px"
      }} onClick={() => window.location.href = "/admin-dashboard"}>
        ← Back to Dashboard
      </button>

      {/* Premium Form */}
      <div style={{ background: "white", borderRadius: "20px", padding: "clamp(20px, 4vw, 30px)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "2px solid #e0e0e0", paddingBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0, color: "#333", fontSize: "clamp(18px, 4vw, 24px)" }}>{editId ? "✏️ Edit Teacher" : "➕ Add New Teacher"}</h3>
          {editId && <button style={{ background: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }} onClick={resetForm}>Cancel Edit</button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { label: "Full Name *", name: "name", type: "text", placeholder: "Enter teacher name" },
            { label: "Email *", name: "email", type: "email", placeholder: "Enter email address" },
            { label: "Phone Number *", name: "phone", type: "text", placeholder: "Enter phone number" },
            { label: "Qualification *", name: "qualification", type: "text", placeholder: "Enter qualification (e.g., M.Sc, B.Ed)" },
            { label: "Experience (Years) *", name: "experience", type: "text", placeholder: "Enter years of experience" }
          ].map(field => (
            <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>{field.label}</label>
              <input type={field.type} style={{ padding: "12px", border: `1px solid ${errors[field.name] ? "#dc3545" : "#ddd"}`, borderRadius: "8px", fontSize: "14px", outline: "none" }}
                placeholder={field.placeholder} value={form[field.name]} onChange={e => setForm({ ...form, [field.name]: e.target.value })} />
              {errors[field.name] && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors[field.name]}</span>}
            </div>
          ))}

          {/* Password Field with Show/Hide Toggle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Password {!editId && "*"}</label>
            <div style={{ display: "flex", position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                style={{ 
                  padding: "12px", 
                  border: `1px solid ${errors.password ? "#dc3545" : "#ddd"}`, 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  outline: "none",
                  flex: 1,
                  paddingRight: "40px"
                }}
                placeholder={editId ? "Leave blank to keep current" : "Enter password"} 
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "4px",
                  color: "#666"
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.password}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Subject *</label>
            <select
              style={{ padding: "12px", border: `1px solid ${errors.subject ? "#dc3545" : "#ddd"}`, borderRadius: "8px", fontSize: "14px", backgroundColor: "white" }}
              value={form.subject || ""}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subject && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.subject}</span>}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Course (Optional)</label>
            <select style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", backgroundColor: "white" }}
              value={form.course || ""} onChange={e => setForm({ ...form, course: e.target.value })}>
              <option value="">None (all classes)</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Date of Birth *</label>
            <input type="date" style={{ padding: "12px", border: `1px solid ${errors.dob ? "#dc3545" : "#ddd"}`, borderRadius: "8px", fontSize: "14px" }}
              value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
            {errors.dob && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.dob}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Blood Group *</label>
            <select style={{ padding: "12px", border: `1px solid ${errors.blood_group ? "#dc3545" : "#ddd"}`, borderRadius: "8px", fontSize: "14px", backgroundColor: "white" }}
              value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
              <option value="">Select Blood Group</option>
              {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            {errors.blood_group && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.blood_group}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Gender *</label>
            <select style={{ padding: "12px", border: `1px solid ${errors.gender ? "#dc3545" : "#ddd"}`, borderRadius: "8px", fontSize: "14px", backgroundColor: "white" }}
              value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select Gender</option>
              {genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.gender && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.gender}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Address *</label>
            <textarea style={{ padding: "12px", border: `1px solid ${errors.address ? "#dc3545" : "#ddd"}`, borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
              rows="2" placeholder="Enter address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            {errors.address && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.address}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Profile Photo</label>
            <input type="file" style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
              onChange={e => setForm({ ...form, image: e.target.files[0] })} />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "600", color: "#555", fontSize: "14px" }}>Additional Details</label>
            <textarea style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
              rows="3" placeholder="Enter any additional information..." value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />
          </div>
        </div>
        <button style={{ background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)", color: "white", border: "none", padding: "14px 28px", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "25px", width: "100%" }}
          onClick={handleSubmit}>{editId ? "✏️ Update Teacher" : "➕ Add Teacher"}</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", flex: "1" }}>
          <div style={{ display: "flex", alignItems: "center", background: "white", borderRadius: "10px", padding: "5px 15px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", flex: "1", minWidth: "200px" }}>
            <span style={{ fontSize: "18px", marginRight: "8px" }}>🔍</span>
            <input style={{ padding: "10px", border: "none", outline: "none", fontSize: "14px", width: "100%" }}
              placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ padding: "10px 15px", border: "1px solid #ddd", borderRadius: "10px", fontSize: "14px", background: "white" }}
            value={filterCourse || ""} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">All Classes</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button style={{ padding: "10px 20px", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold", backgroundColor: "#17a2b8" }}
            onClick={handlePrintTable}>🖨️ Print Table</button>
          <button style={{ padding: "10px 20px", border: "none", borderRadius: "8px", color: "#2c3e50", cursor: "pointer", fontWeight: "bold", backgroundColor: "#d4af37" }}
            onClick={handlePrintCards}>🪪 Print ID Cards</button>
          <button style={{ padding: "10px 20px", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold", backgroundColor: viewMode === "table" ? "#2ecc71" : "#6c757d" }}
            onClick={() => setViewMode("table")}>📋 Table</button>
          <button style={{ padding: "10px 20px", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold", backgroundColor: viewMode === "card" ? "#2ecc71" : "#6c757d" }}
            onClick={() => setViewMode("card")}>🃏 Cards</button>
        </div>
      </div>

      {/* Total Count */}
      <div style={{ background: "white", padding: "12px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "clamp(14px, 4vw, 16px)", fontWeight: "500", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        👨‍🏫 Total Teachers: <strong>{filtered.length}</strong> {filterCourse && `(Filtered by: ${getCourseName(filterCourse)})`}
      </div>

      {/* Table View - Removed extra View button */}
      {viewMode === "table" && (
        <div style={{ background: "white", borderRadius: "15px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left" }}>Photo</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Subject</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Course</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Phone</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => setSelected(t)}>
                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #f0f0f0" }}>
                      {t.image_url ? 
                        <img src={t.image_url} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", objectPosition: "center top" }} /> :
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👨‍🏫</div>
                      }
                    </td>
                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #f0f0f0" }}><strong>{t.name}</strong></td>
                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #f0f0f0" }}>{getSubjectName(t.subject)}</td>
                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ background: "#e8f5e9", color: "#2ecc71", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>{getCourseName(t.course)}</span>
                    </td>
                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #f0f0f0" }}>{t.phone || "-"}</td>
                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #f0f0f0" }}>{t.email || "-"}</td>
                    <td style={{ padding: "12px 15px", borderBottom: "1px solid #f0f0f0" }}>
                      <button style={{ background: "#28a745", color: "white", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", marginRight: "5px" }}
                        onClick={(e) => { e.stopPropagation(); handleEdit(t); }}>✏️</button>
                      <button style={{ background: "#dc3545", color: "white", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#999" }}>No teachers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View - Premium Design */}
      {viewMode === "card" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
          marginTop: "20px"
        }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              background: "white",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }} onClick={() => setSelected(t)}>
              {/* School Name Banner */}
              <div style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f5b042 100%)",
                padding: "8px 12px",
                textAlign: "center"
              }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#1a472a",
                  letterSpacing: "0.5px",
                  display: "block"
                }}>🏫 PARADISE ISLAMIC PRE-SCHOOL</span>
              </div>
              
              {/* Image Section */}
              <div style={{
                height: "200px",
                background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                overflow: "hidden"
              }}>
                {t.image_url ? (
                  <img src={t.image_url} style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top"
                  }} alt={t.name} />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "70px",
                    color: "rgba(255,255,255,0.9)"
                  }}>👨‍🏫</div>
                )}
              </div>
              
              {/* Content Section */}
              <div style={{ padding: "18px" }}>
                <h3 style={{
                  margin: "0 0 6px 0",
                  fontSize: "19px",
                  color: "#1a472a",
                  fontWeight: "bold",
                  textAlign: "center"
                }}>{t.name}</h3>
                <p style={{
                  color: "#2ecc71",
                  fontSize: "14px",
                  marginBottom: "10px",
                  fontWeight: "500",
                  textAlign: "center"
                }}>📚 {getSubjectName(t.subject)}</p>
                <div style={{ textAlign: "center", marginBottom: "15px" }}>
                  <span style={{
                    display: "inline-block",
                    background: "#e8f5e9",
                    color: "#2ecc71",
                    padding: "5px 14px",
                    borderRadius: "25px",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>{getCourseName(t.course)}</span>
                </div>
                
                {/* Quick Info */}
                <div style={{
                  marginTop: "12px",
                  borderTop: "1px solid #eee",
                  paddingTop: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "12px", color: "#666" }}>
                    <span>📞</span> <span>{t.phone || "No phone"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "12px", color: "#666" }}>
                    <span>🎓</span> <span>{t.qualification || "No qualification"}</span>
                  </div>
                  {t.experience && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#666" }}>
                      <span>📊</span> <span>{t.experience} years</span>
                    </div>
                  )}
                </div>
                
                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button style={{
                    flex: 1,
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500"
                  }} onClick={(e) => { e.stopPropagation(); handleEdit(t); }}>✏️ Edit</button>
                  <button style={{
                    flex: 1,
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500"
                  }} onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Details Modal - Professional Redesign */}
      {selected && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "20px",
          overflowY: "auto"
        }} onClick={() => setSelected(null)}>
          <div style={{
            position: "relative",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            background: "white",
            borderRadius: "28px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
            animation: "modalSlideUp 0.3s ease"
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header with Profile */}
            <div style={{
              background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
              padding: "35px 30px",
              position: "relative",
              textAlign: "center"
            }}>
              <div style={{
                position: "absolute",
                top: "20px",
                right: "20px"
              }}>
                <button style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "none",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)"
                }} onClick={() => setSelected(null)}>✖</button>
              </div>
              
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                margin: "0 auto 15px",
                overflow: "hidden",
                border: "4px solid #d4af37",
                background: "white",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
              }}>
                {selected.image_url ? (
                  <img src={selected.image_url} style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top"
                  }} alt={selected.name} />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "50px",
                    background: "#f5f5f5",
                    color: "#999"
                  }}>👨‍🏫</div>
                )}
              </div>
              <h2 style={{ margin: "0 0 5px 0", fontSize: "28px", color: "white" }}>{selected.name}</h2>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>{getSubjectName(selected.subject)} • {getCourseName(selected.course)}</p>
            </div>

            {/* Content Sections - 3 Column Grid */}
            <div style={{ padding: "30px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "25px"
              }}>
                {/* Personal Information */}
                <div style={{
                  background: "#f8f9fa",
                  borderRadius: "16px",
                  padding: "18px"
                }}>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#2ecc71", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>👤</span> Personal Information
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Phone Number</span><strong>{selected.phone || "Not provided"}</strong></div>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Email Address</span><strong>{selected.email || "Not provided"}</strong></div>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Date of Birth</span><strong>{selected.dob || "Not provided"}</strong></div>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Blood Group</span><strong>{selected.blood_group || "Not provided"}</strong></div>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Gender</span><strong>{selected.gender || "Not provided"}</strong></div>
                  </div>
                </div>

                {/* Professional Information */}
                <div style={{
                  background: "#f8f9fa",
                  borderRadius: "16px",
                  padding: "18px"
                }}>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#2ecc71", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🎓</span> Professional Information
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Subject</span><strong>{getSubjectName(selected.subject)}</strong></div>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Course/Class</span><strong>{getCourseName(selected.course)}</strong></div>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Qualification</span><strong>{selected.qualification || "Not provided"}</strong></div>
                    <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Experience</span><strong>{selected.experience || "Not provided"} years</strong></div>
                  </div>
                </div>

                {/* Address Information */}
                <div style={{
                  background: "#f8f9fa",
                  borderRadius: "16px",
                  padding: "18px"
                }}>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#2ecc71", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📍</span> Address
                  </h3>
                  <div><span style={{ color: "#666", fontSize: "12px", display: "block" }}>Residential Address</span><strong>{selected.address || "Not provided"}</strong></div>
                </div>
              </div>

              {/* Additional Details */}
              {selected.details && (
                <div style={{
                  background: "#f8f9fa",
                  borderRadius: "16px",
                  padding: "18px",
                  marginBottom: "20px"
                }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#2ecc71", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📝</span> Additional Information
                  </h3>
                  <p style={{ margin: 0, color: "#555", lineHeight: "1.6" }}>{selected.details}</p>
                </div>
              )}

              {/* Close Button */}
              <div style={{ textAlign: "center" }}>
                <button style={{
                  background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }} onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes modalSlideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          button:hover {
            transform: translateY(-2px);
            transition: transform 0.2s;
          }
          
          button:active {
            transform: translateY(0);
          }
          
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
          }
        `
      }} />
    </div>
  );
}

export default TeachersAdmin;