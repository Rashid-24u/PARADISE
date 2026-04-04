import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TeacherProfile() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

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
      axios
        .get(`http://127.0.0.1:8000/api/teachers/${stored.teacher_id}/`)
        .then((res) => {
          setTeacher(res.data);
          setDocuments(res.data.documents || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching teacher:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    
    // FIX: Style injection with cleanup
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      button { transition: all 0.2s ease; }
      button:active { transform: translateY(0) !important; }
      @media (max-width: 768px) {
        .details-grid { grid-template-columns: 1fr !important; gap: 14px !important; padding: 16px !important; }
        .action-buttons { flex-direction: column !important; gap: 12px !important; padding: 16px !important; }
        .dashboard-btn, .logout-btn { width: 100% !important; text-align: center !important; }
        .profile-photo, .profile-photo-placeholder { width: 75px !important; height: 75px !important; }
        .cover-image { height: 80px !important; }
        .photo-section { margin-top: -40px !important; }
        .school-header { padding: 15px !important; }
        .school-name { font-size: 18px !important; }
        .documents-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 480px) {
        .container { padding: 20px 15px !important; }
        .badge-container { flex-direction: column !important; align-items: center !important; }
        .section-card { padding: 14px !important; }
      }
      .document-card:hover { transform: translateY(-2px); transition: all 0.2s; }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Helper function to get document icon based on type
  const getDocumentIcon = (type) => {
    const icons = {
      certificate: "📜",
      qualification: "🎓",
      experience: "📋",
      id_proof: "🪪",
      other: "📎"
    };
    return icons[type] || "📎";
  };

  // Helper function to get document type label
  const getDocumentTypeLabel = (type) => {
    const labels = {
      certificate: "Certificate",
      qualification: "Qualification",
      experience: "Experience Letter",
      id_proof: "ID Proof",
      other: "Other"
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>No Profile Found</h2>
          <p style={styles.errorMessage}>Please login to view your profile</p>
          <button style={styles.loginBtn} onClick={() => navigate("/teacher-login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileWrapper}>
        <div style={styles.schoolHeader}>
          <h1 style={styles.schoolName}>🏫 PARADISE ISLAMIC PRE-SCHOOL</h1>
          <p style={styles.schoolAddress}>Pullur, Tirur - 676102 | Quality Education with Islamic Values</p>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.coverImage}>
            <div style={styles.coverOverlay}></div>
          </div>

          <div style={styles.photoSection}>
            <div style={styles.photoWrapper}>
              {teacher.image_url ? (
                <img src={teacher.image_url} style={styles.profilePhoto} alt={teacher.name} />
              ) : (
                <div style={styles.profilePhotoPlaceholder}>
                  <span style={styles.placeholderIcon}>👨‍🏫</span>
                </div>
              )}
            </div>
          </div>

          <div style={styles.nameSection}>
            <h1 style={styles.teacherName}>{teacher.name}</h1>
            <div style={styles.badgeContainer}>
              <span style={styles.badgeSubject}>
                📚 {teacher.subject || "Not set"}
              </span>
              <span style={styles.badgeCourse}>
                🏫 {teacher.course_name || "All Classes"}
              </span>
            </div>
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>👤</span>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
              </div>
              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>📞</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Phone Number</span>
                    <span style={styles.infoValue}>{teacher.phone || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>📧</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Email Address</span>
                    <span style={styles.infoValue}>{teacher.email || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🎂</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Date of Birth</span>
                    <span style={styles.infoValue}>{teacher.dob || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🩸</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Blood Group</span>
                    <span style={styles.infoValue}>{teacher.blood_group || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>⚥</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Gender</span>
                    <span style={styles.infoValue}>{teacher.gender || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>🎓</span>
                <h3 style={styles.sectionTitle}>Professional Information</h3>
              </div>
              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>📚</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Subject</span>
                    <span style={styles.infoValue}>{teacher.subject || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🏫</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Course / Class</span>
                    <span style={styles.infoValue}>{teacher.course_name || "All Classes"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🎓</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Qualification</span>
                    <span style={styles.infoValue}>{teacher.qualification || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>📊</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Experience</span>
                    <span style={styles.infoValue}>{teacher.experience || "Not provided"}</span>
                  </div>
                </div>
                {teacher.teaching_level && (
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>🎯</div>
                    <div style={styles.infoContent}>
                      <span style={styles.infoLabel}>Teaching Level</span>
                      <span style={styles.infoValue}>{teacher.teaching_level}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {teacher.career_details && (
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>📋</span>
                  <h3 style={styles.sectionTitle}>Career Details</h3>
                </div>
                <div style={styles.detailsContent}>
                  <p style={styles.detailsText}>{teacher.career_details}</p>
                </div>
              </div>
            )}

            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📍</span>
                <h3 style={styles.sectionTitle}>Address</h3>
              </div>
              <div style={styles.addressContent}>
                <div style={styles.addressIcon}>🏠</div>
                <p style={styles.addressText}>{teacher.address || "Not provided"}</p>
              </div>
            </div>

            {teacher.salary > 0 && (
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>💰</span>
                  <h3 style={styles.sectionTitle}>Salary Information</h3>
                </div>
                <div style={styles.infoList}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>💵</div>
                    <div style={styles.infoContent}>
                      <span style={styles.infoLabel}>Monthly Salary</span>
                      <span style={styles.infoValue}>₹{teacher.salary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section - NEW */}
            {documents && documents.length > 0 && (
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>📎</span>
                  <h3 style={styles.sectionTitle}>Documents & Certificates ({documents.length})</h3>
                </div>
                <div style={styles.documentsGrid}>
                  {documents.map((doc, index) => (
                    <div key={index} style={styles.documentCard}>
                      <div style={styles.documentIcon}>{getDocumentIcon(doc.document_type)}</div>
                      <div style={styles.documentInfo}>
                        <div style={styles.documentTitle}>{doc.title}</div>
                        <div style={styles.documentType}>{getDocumentTypeLabel(doc.document_type)}</div>
                        <div style={styles.documentDate}>
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.documentViewBtn}
                      >
                        📄 View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {teacher.details && (
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionIcon}>📝</span>
                  <h3 style={styles.sectionTitle}>Additional Information</h3>
                </div>
                <div style={styles.detailsContent}>
                  <p style={styles.detailsText}>{teacher.details}</p>
                </div>
              </div>
            )}
          </div>

          <div style={styles.actionButtons}>
            <button style={styles.dashboardBtn} onClick={() => navigate("/teacher")}>
              📊 Go to Dashboard
            </button>
            <button style={styles.logoutBtn} onClick={() => {
              localStorage.removeItem("teacher");
              navigate("/teacher-login");
            }}>
              🚪 Logout
            </button>
          </div>

          <div style={styles.footer}>
            <p>© 2026 Paradise Islamic Pre-School | All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e8f0ea 100%)",
    padding: "30px 20px",
  },
  profileWrapper: { 
    maxWidth: "1000px", 
    margin: "0 auto" 
  },
  schoolHeader: { 
    textAlign: "center", 
    marginBottom: "25px", 
    padding: "20px", 
    background: "linear-gradient(135deg, #085322, #2e5c3a)", 
    borderRadius: "16px", 
    border: "1px solid #d4af37" 
  },
  schoolName: { 
    fontSize: "clamp(20px, 4vw, 26px)", 
    fontWeight: "bold", 
    color: "#d4af37", 
    margin: 0 
  },
  schoolAddress: { 
    color: "#e0e0e0", 
    fontSize: "12px", 
    marginTop: "8px" 
  },
  profileCard: { 
    background: "white", 
    borderRadius: "24px", 
    overflow: "hidden", 
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)" 
  },
  coverImage: { 
    height: "100px", 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    position: "relative" 
  },
  coverOverlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: "linear-gradient(135deg, rgba(26,71,42,0.7), rgba(46,92,58,0.7))" 
  },
  photoSection: { 
    textAlign: "center", 
    marginTop: "-50px", 
    position: "relative", 
    zIndex: 2 
  },
  photoWrapper: { 
    display: "inline-block", 
    padding: "3px", 
    background: "white", 
    borderRadius: "50%", 
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)" 
  },
  profilePhoto: { 
    width: "90px", 
    height: "90px", 
    borderRadius: "50%", 
    objectFit: "cover", 
    border: "3px solid white" 
  },
  profilePhotoPlaceholder: { 
    width: "90px", 
    height: "90px", 
    borderRadius: "50%", 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    border: "3px solid white" 
  },
  placeholderIcon: { 
    fontSize: "40px", 
    color: "white" 
  },
  nameSection: { 
    textAlign: "center", 
    padding: "15px 20px 10px" 
  },
  teacherName: { 
    fontSize: "clamp(22px, 4vw, 28px)", 
    fontWeight: "bold", 
    color: "#1a472a", 
    margin: "0 0 8px 0" 
  },
  badgeContainer: { 
    display: "flex", 
    gap: "10px", 
    justifyContent: "center", 
    flexWrap: "wrap" 
  },
  badgeSubject: { 
    background: "#e8f0e8", 
    color: "#1a472a", 
    padding: "5px 14px", 
    borderRadius: "20px", 
    fontSize: "12px", 
    fontWeight: "500" 
  },
  badgeCourse: { 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    color: "white", 
    padding: "5px 14px", 
    borderRadius: "20px", 
    fontSize: "12px", 
    fontWeight: "500" 
  },
  detailsGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(2, 1fr)", 
    gap: "18px", 
    padding: "20px 24px" 
  },
  sectionCard: { 
    background: "#f8faf8", 
    borderRadius: "16px", 
    padding: "16px", 
    border: "1px solid #e0e8e0" 
  },
  sectionHeader: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    marginBottom: "14px", 
    paddingBottom: "10px", 
    borderBottom: "1px solid #e0e8e0" 
  },
  sectionIcon: { 
    fontSize: "20px" 
  },
  sectionTitle: { 
    fontSize: "15px", 
    fontWeight: "600", 
    color: "#1a472a", 
    margin: 0 
  },
  infoList: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "10px" 
  },
  infoItem: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    padding: "4px 0" 
  },
  infoIcon: { 
    fontSize: "16px", 
    minWidth: "28px", 
    color: "#1a472a" 
  },
  infoContent: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    gap: "2px" 
  },
  infoLabel: { 
    fontSize: "10px", 
    color: "#8b9a8b", 
    textTransform: "uppercase", 
    letterSpacing: "0.5px" 
  },
  infoValue: { 
    fontSize: "13px", 
    color: "#2c3e50", 
    fontWeight: "500" 
  },
  addressContent: { 
    display: "flex", 
    alignItems: "flex-start", 
    gap: "10px", 
    padding: "4px 0" 
  },
  addressIcon: { 
    fontSize: "16px", 
    minWidth: "28px", 
    color: "#1a472a" 
  },
  addressText: { 
    flex: 1, 
    fontSize: "13px", 
    color: "#4a5568", 
    lineHeight: "1.5", 
    margin: 0 
  },
  detailsContent: { 
    padding: "4px 0" 
  },
  detailsText: { 
    fontSize: "13px", 
    color: "#4a5568", 
    lineHeight: "1.6", 
    margin: 0 
  },
  // New styles for documents
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
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e0e8e0",
    transition: "all 0.2s",
    cursor: "pointer",
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
    marginBottom: "4px",
  },
  documentType: {
    fontSize: "10px",
    color: "#64748b",
    textTransform: "capitalize",
    marginBottom: "2px",
  },
  documentDate: {
    fontSize: "9px",
    color: "#94a3b8",
  },
  documentViewBtn: {
    padding: "6px 12px",
    background: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  actionButtons: { 
    display: "flex", 
    gap: "15px", 
    justifyContent: "center", 
    padding: "16px 24px 24px", 
    borderTop: "1px solid #e0e8e0" 
  },
  dashboardBtn: { 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    color: "white", 
    border: "none", 
    padding: "10px 28px", 
    borderRadius: "30px", 
    fontSize: "13px", 
    fontWeight: "600", 
    cursor: "pointer", 
    transition: "all 0.2s",
    "&:hover": { 
      transform: "translateY(-1px)", 
      boxShadow: "0 4px 12px rgba(26,71,42,0.3)" 
    } 
  },
  logoutBtn: { 
    background: "white", 
    color: "#1a472a", 
    border: "2px solid #1a472a", 
    padding: "10px 28px", 
    borderRadius: "30px", 
    fontSize: "13px", 
    fontWeight: "600", 
    cursor: "pointer", 
    transition: "all 0.2s",
    "&:hover": { 
      transform: "translateY(-1px)", 
      background: "#f0f5f0" 
    } 
  },
  footer: { 
    textAlign: "center", 
    padding: "14px", 
    background: "#f8faf8", 
    borderTop: "1px solid #e0e8e0", 
    fontSize: "11px", 
    color: "#8b9a8b" 
  },
  loadingContainer: { 
    minHeight: "100vh", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    background: "linear-gradient(135deg, #f5f7fa, #e8f0ea)" 
  },
  loadingSpinner: { 
    width: "40px", 
    height: "40px", 
    border: "3px solid rgba(26,71,42,0.2)", 
    borderTopColor: "#1a472a", 
    borderRadius: "50%", 
    animation: "spin 1s linear infinite" 
  },
  loadingText: { 
    marginTop: "12px", 
    color: "#1a472a", 
    fontSize: "14px" 
  },
  errorCard: { 
    background: "white", 
    borderRadius: "20px", 
    padding: "40px", 
    textAlign: "center", 
    maxWidth: "400px", 
    margin: "0 auto" 
  },
  errorIcon: { 
    fontSize: "50px", 
    marginBottom: "15px" 
  },
  errorTitle: { 
    fontSize: "22px", 
    color: "#333", 
    marginBottom: "8px" 
  },
  errorMessage: { 
    color: "#666", 
    marginBottom: "20px", 
    fontSize: "14px" 
  },
  loginBtn: { 
    background: "linear-gradient(135deg, #348283, #0e8995)", 
    color: "white", 
    border: "none", 
    padding: "10px 28px", 
    borderRadius: "30px", 
    fontSize: "13px", 
    fontWeight: "600", 
    cursor: "pointer" 
  },
};

export default TeacherProfile;