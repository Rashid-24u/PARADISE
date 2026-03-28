import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TeacherProfile() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("teacher"));

    if (stored?.teacher_id) {
      axios
        .get(`http://127.0.0.1:8000/api/teachers/${stored.teacher_id}/`)
        .then((res) => {
          setTeacher(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

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
      {/* Background Decoration */}
      <div style={styles.bgDecoration1}></div>
      <div style={styles.bgDecoration2}></div>
      <div style={styles.bgDecoration3}></div>

      <div style={styles.profileWrapper}>
        {/* School Header */}
        <div style={styles.schoolHeader}>
          <h1 style={styles.schoolName}>🏫 PARADISE ISLAMIC PRE-SCHOOL</h1>
          <p style={styles.schoolAddress}>Pullur, Tirur - 676102 | Quality Education with Islamic Values</p>
        </div>

        {/* Main Profile Card */}
        <div style={styles.profileCard}>
          {/* Cover Image */}
          <div style={styles.coverImage}>
            <div style={styles.coverOverlay}></div>
          </div>

          {/* Profile Photo */}
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

          {/* Teacher Name & Basic Info */}
          <div style={styles.nameSection}>
            <h1 style={styles.teacherName}>{teacher.name}</h1>
            <div style={styles.badgeContainer}>
              <span style={styles.badgeSubject}>
                📚 {teacher.subject_name || teacher.subject || "Not set"}
              </span>
              <span style={styles.badgeCourse}>{teacher.course_name}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={styles.detailsGrid}>
            {/* Personal Information Section */}
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

            {/* Professional Information Section */}
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
                    <span style={styles.infoValue}>
                      {teacher.subject_name || teacher.subject || "Not provided"}
                    </span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🏫</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Course / Class</span>
                    <span style={styles.infoValue}>{teacher.course_name || "Not provided"}</span>
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
                    <span style={styles.infoValue}>{teacher.experience || "Not provided"} years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📍</span>
                <h3 style={styles.sectionTitle}>Address</h3>
              </div>
              <div style={styles.addressContent}>
                <div style={styles.infoIcon}>🏠</div>
                <p style={styles.addressText}>{teacher.address || "Not provided"}</p>
              </div>
            </div>

            {/* Additional Details Section */}
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

          {/* Action Buttons */}
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

          {/* Footer */}
          <div style={styles.footer}>
            <p>© 2024 Paradise Islamic Pre-School | All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    padding: "40px 20px",
    position: "relative",
    overflowX: "hidden",
  },
  bgDecoration1: {
    position: "absolute",
    top: "-100px",
    right: "-100px",
    width: "300px",
    height: "300px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  bgDecoration2: {
    position: "absolute",
    bottom: "-150px",
    left: "-150px",
    width: "400px",
    height: "400px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  bgDecoration3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  profileWrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  schoolHeader: {
    textAlign: "center",
    marginBottom: "30px",
    padding: "20px",
    background: "linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%)",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: "1px solid #d4af37",
  },
  schoolName: {
    fontSize: "clamp(20px, 4vw, 28px)",
    fontWeight: "bold",
    color: "#d4af37",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    letterSpacing: "1px",
    margin: 0,
  },
  schoolAddress: {
    color: "#f0f0f0",
    fontSize: "clamp(11px, 3vw, 13px)",
    marginTop: "8px",
    opacity: 0.9,
  },
  profileCard: {
    background: "white",
    borderRadius: "30px",
    overflow: "hidden",
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    position: "relative",
  },
  coverImage: {
    height: "150px",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    position: "relative",
  },
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(255,107,107,0.8) 0%, rgba(238,90,36,0.8) 100%)",
  },
  photoSection: {
    textAlign: "center",
    marginTop: "-60px",
    position: "relative",
    zIndex: 2,
  },
  photoWrapper: {
    display: "inline-block",
    padding: "4px",
    background: "white",
    borderRadius: "50%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  profilePhoto: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid white",
  },
  profilePhotoPlaceholder: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid white",
  },
  placeholderIcon: {
    fontSize: "50px",
    color: "white",
  },
  nameSection: {
    textAlign: "center",
    padding: "20px 20px 10px",
  },
  teacherName: {
    fontSize: "clamp(24px, 5vw, 32px)",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: "0 0 10px 0",
  },
  badgeContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  badgeSubject: {
    background: "#ffe6e6",
    color: "#ff6b6b",
    padding: "5px 15px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  badgeCourse: {
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    color: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px 25px",
  },
  sectionCard: {
    background: "#f8f9fa",
    borderRadius: "20px",
    padding: "20px",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #e0e0e0",
  },
  sectionIcon: {
    fontSize: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
  },
  infoIcon: {
    fontSize: "20px",
    minWidth: "35px",
    color: "#ff6b6b",
  },
  infoContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  infoLabel: {
    fontSize: "11px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "15px",
    color: "#333",
    fontWeight: "500",
  },
  addressContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "8px 0",
  },
  addressText: {
    flex: 1,
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5",
    margin: 0,
  },
  detailsContent: {
    padding: "8px 0",
  },
  detailsText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    margin: 0,
  },
  actionButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    padding: "20px 25px 30px",
    borderTop: "1px solid #eee",
    marginTop: "10px",
  },
  dashboardBtn: {
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 12px rgba(255,107,107,0.3)",
  },
  logoutBtn: {
    background: "white",
    color: "#dc3545",
    border: "2px solid #dc3545",
    padding: "12px 30px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  footer: {
    textAlign: "center",
    padding: "20px",
    background: "#f8f9fa",
    borderTop: "1px solid #eee",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTopColor: "#d4af37",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "15px",
    color: "white",
    fontSize: "16px",
  },
  errorCard: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    maxWidth: "400px",
    margin: "0 auto",
  },
  errorIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },
  errorTitle: {
    fontSize: "24px",
    color: "#333",
    marginBottom: "10px",
  },
  errorMessage: {
    color: "#666",
    marginBottom: "20px",
  },
  loginBtn: {
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

// Add animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  button:hover {
    transform: translateY(-2px);
    transition: transform 0.2s;
  }
  
  button:active {
    transform: translateY(0);
  }
  
  .section-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default TeacherProfile;