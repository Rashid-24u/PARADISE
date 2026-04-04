import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TeacherProfile() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Responsive check
  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  // Safe localStorage parsing with cleanup
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
    
    // Style injection with cleanup
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      button { 
        transition: all 0.2s ease; 
        cursor: pointer;
      }
      button:active { transform: translateY(0) !important; }
      
      /* Responsive Styles */
      @media (max-width: 768px) {
        .profile-container {
          padding: 15px !important;
        }
        .details-grid {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
          padding: 12px !important;
        }
        .action-buttons {
          flex-direction: column !important;
          gap: 10px !important;
          padding: 16px !important;
        }
        .dashboard-btn, .logout-btn {
          width: 100% !important;
          justify-content: center !important;
        }
        .profile-photo, .profile-photo-placeholder {
          width: 80px !important;
          height: 80px !important;
        }
        .cover-image {
          height: 80px !important;
        }
        .photo-section {
          margin-top: -40px !important;
        }
        .school-header {
          padding: 15px !important;
        }
        .school-name {
          font-size: 18px !important;
        }
        .documents-grid {
          grid-template-columns: 1fr !important;
        }
        .section-card {
          padding: 14px !important;
        }
        .info-item {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 6px !important;
        }
        .info-icon {
          min-width: auto !important;
        }
      }
      
      @media (min-width: 769px) and (max-width: 1024px) {
        .details-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 16px !important;
        }
        .documents-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
      
      @media (min-width: 1025px) {
        .details-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 20px !important;
        }
        .documents-grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
        }
      }
      
      .document-card:hover {
        transform: translateY(-2px);
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .profile-card {
        animation: fadeIn 0.5s ease-out;
      }
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

        <div style={styles.profileCard} className="profile-card">
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

            {/* Documents Section */}
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
    padding: "clamp(15px, 4vw, 30px) clamp(15px, 4vw, 20px)",
  },
  profileWrapper: { 
    maxWidth: "1200px", 
    margin: "0 auto" 
  },
  schoolHeader: { 
    textAlign: "center", 
    marginBottom: "25px", 
    padding: "clamp(15px, 3vw, 20px)", 
    background: "linear-gradient(135deg, #085322, #2e5c3a)", 
    borderRadius: "16px", 
    border: "1px solid #d4af37",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  schoolName: { 
    fontSize: "clamp(18px, 5vw, 26px)", 
    fontWeight: "bold", 
    color: "#d4af37", 
    margin: 0,
    letterSpacing: "1px"
  },
  schoolAddress: { 
    color: "#e0e0e0", 
    fontSize: "clamp(10px, 3vw, 12px)", 
    marginTop: "8px" 
  },
  profileCard: { 
    background: "white", 
    borderRadius: "24px", 
    overflow: "hidden", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)" 
  },
  coverImage: { 
    height: "clamp(80px, 15vw, 120px)", 
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
    marginTop: "clamp(-40px, -8vw, -50px)", 
    position: "relative", 
    zIndex: 2 
  },
  photoWrapper: { 
    display: "inline-block", 
    padding: "3px", 
    background: "white", 
    borderRadius: "50%", 
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)" 
  },
  profilePhoto: { 
    width: "clamp(80px, 15vw, 100px)", 
    height: "clamp(80px, 15vw, 100px)", 
    borderRadius: "50%", 
    objectFit: "cover", 
    border: "3px solid white" 
  },
  profilePhotoPlaceholder: { 
    width: "clamp(80px, 15vw, 100px)", 
    height: "clamp(80px, 15vw, 100px)", 
    borderRadius: "50%", 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    border: "3px solid white" 
  },
  placeholderIcon: { 
    fontSize: "clamp(35px, 7vw, 45px)", 
    color: "white" 
  },
  nameSection: { 
    textAlign: "center", 
    padding: "clamp(12px, 3vw, 20px) 20px 10px" 
  },
  teacherName: { 
    fontSize: "clamp(22px, 5vw, 32px)", 
    fontWeight: "bold", 
    color: "#1a472a", 
    margin: "0 0 10px 0" 
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
    padding: "6px 16px", 
    borderRadius: "25px", 
    fontSize: "clamp(11px, 3vw, 13px)", 
    fontWeight: "500" 
  },
  badgeCourse: { 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    color: "white", 
    padding: "6px 16px", 
    borderRadius: "25px", 
    fontSize: "clamp(11px, 3vw, 13px)", 
    fontWeight: "500" 
  },
  detailsGrid: { 
    display: "grid", 
    gap: "clamp(12px, 3vw, 20px)", 
    padding: "clamp(12px, 4vw, 24px)" 
  },
  sectionCard: { 
    background: "#f8faf8", 
    borderRadius: "16px", 
    padding: "clamp(14px, 3vw, 20px)", 
    border: "1px solid #e0e8e0",
    transition: "all 0.3s ease"
  },
  sectionHeader: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    marginBottom: "14px", 
    paddingBottom: "10px", 
    borderBottom: "2px solid #d4af37" 
  },
  sectionIcon: { 
    fontSize: "clamp(18px, 4vw, 22px)" 
  },
  sectionTitle: { 
    fontSize: "clamp(14px, 4vw, 16px)", 
    fontWeight: "600", 
    color: "#1a472a", 
    margin: 0 
  },
  infoList: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "12px" 
  },
  infoItem: { 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    padding: "6px 0" 
  },
  infoIcon: { 
    fontSize: "clamp(16px, 4vw, 18px)", 
    minWidth: "32px", 
    color: "#1a472a" 
  },
  infoContent: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    gap: "2px" 
  },
  infoLabel: { 
    fontSize: "clamp(9px, 3vw, 11px)", 
    color: "#8b9a8b", 
    textTransform: "uppercase", 
    letterSpacing: "0.5px" 
  },
  infoValue: { 
    fontSize: "clamp(12px, 4vw, 14px)", 
    color: "#2c3e50", 
    fontWeight: "500" 
  },
  addressContent: { 
    display: "flex", 
    alignItems: "flex-start", 
    gap: "12px", 
    padding: "6px 0" 
  },
  addressIcon: { 
    fontSize: "clamp(16px, 4vw, 18px)", 
    minWidth: "32px", 
    color: "#1a472a" 
  },
  addressText: { 
    flex: 1, 
    fontSize: "clamp(12px, 4vw, 14px)", 
    color: "#4a5568", 
    lineHeight: "1.5", 
    margin: 0 
  },
  detailsContent: { 
    padding: "6px 0" 
  },
  detailsText: { 
    fontSize: "clamp(12px, 4vw, 14px)", 
    color: "#4a5568", 
    lineHeight: "1.6", 
    margin: 0 
  },
  documentsGrid: {
    display: "grid",
    gap: "12px",
  },
  documentCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "clamp(10px, 3vw, 14px)",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e0e8e0",
    transition: "all 0.2s",
  },
  documentIcon: {
    fontSize: "clamp(24px, 6vw, 32px)",
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: "clamp(12px, 4vw, 14px)",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },
  documentType: {
    fontSize: "clamp(9px, 3vw, 11px)",
    color: "#64748b",
    textTransform: "capitalize",
    marginBottom: "2px",
  },
  documentDate: {
    fontSize: "clamp(8px, 2.5vw, 10px)",
    color: "#94a3b8",
  },
  documentViewBtn: {
    padding: "clamp(5px, 2vw, 8px) clamp(10px, 3vw, 14px)",
    background: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "clamp(10px, 3vw, 12px)",
    fontWeight: "500",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  actionButtons: { 
    display: "flex", 
    gap: "clamp(12px, 4vw, 20px)", 
    justifyContent: "center", 
    padding: "clamp(16px, 4vw, 24px)", 
    borderTop: "1px solid #e0e8e0" 
  },
  dashboardBtn: { 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    color: "white", 
    border: "none", 
    padding: "clamp(10px, 3vw, 12px) clamp(20px, 5vw, 32px)", 
    borderRadius: "30px", 
    fontSize: "clamp(12px, 4vw, 14px)", 
    fontWeight: "600", 
    cursor: "pointer", 
    transition: "all 0.2s",
    "&:hover": { 
      transform: "translateY(-2px)", 
      boxShadow: "0 4px 12px rgba(26,71,42,0.3)" 
    } 
  },
  logoutBtn: { 
    background: "white", 
    color: "#1a472a", 
    border: "2px solid #1a472a", 
    padding: "clamp(10px, 3vw, 12px) clamp(20px, 5vw, 32px)", 
    borderRadius: "30px", 
    fontSize: "clamp(12px, 4vw, 14px)", 
    fontWeight: "600", 
    cursor: "pointer", 
    transition: "all 0.2s",
    "&:hover": { 
      transform: "translateY(-2px)", 
      background: "#f0f5f0" 
    } 
  },
  footer: { 
    textAlign: "center", 
    padding: "clamp(12px, 3vw, 16px)", 
    background: "#f8faf8", 
    borderTop: "1px solid #e0e8e0", 
    fontSize: "clamp(10px, 3vw, 12px)", 
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
    padding: "clamp(30px, 8vw, 50px)", 
    textAlign: "center", 
    maxWidth: "90%", 
    width: "400px", 
    margin: "0 auto" 
  },
  errorIcon: { 
    fontSize: "clamp(40px, 10vw, 60px)", 
    marginBottom: "15px" 
  },
  errorTitle: { 
    fontSize: "clamp(20px, 5vw, 24px)", 
    color: "#333", 
    marginBottom: "8px" 
  },
  errorMessage: { 
    color: "#666", 
    marginBottom: "20px", 
    fontSize: "clamp(12px, 4vw, 14px)" 
  },
  loginBtn: { 
    background: "linear-gradient(135deg, #1a472a, #2e5c3a)", 
    color: "white", 
    border: "none", 
    padding: "clamp(10px, 3vw, 12px) clamp(25px, 6vw, 35px)", 
    borderRadius: "30px", 
    fontSize: "clamp(12px, 4vw, 14px)", 
    fontWeight: "600", 
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(26,71,42,0.3)"
    }
  },
};

export default TeacherProfile;