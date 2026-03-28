import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("student"));

    if (stored?.student_id) {
      axios
        .get(`http://127.0.0.1:8000/api/students/${stored.student_id}/`)
        .then((res) => {
          setStudent(res.data);
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

  if (!student) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>No Profile Found</h2>
          <p style={styles.errorMessage}>Please login to view your profile</p>
          <button style={styles.loginBtn} onClick={() => navigate("/student-login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Animated Background Elements */}
      <div style={styles.bgOrb1}></div>
      <div style={styles.bgOrb2}></div>
      <div style={styles.bgOrb3}></div>
      <div style={styles.gridPattern}></div>

      <div style={styles.profileWrapper}>
        {/* School Header with Glow Effect */}
        <div style={styles.schoolHeader}>
          <div style={styles.headerGlow}></div>
          <h1 style={styles.schoolName}>
            <span style={styles.schoolIcon}>🏫</span> PARADISE ISLAMIC PRE-SCHOOL
          </h1>
          <p style={styles.schoolAddress}>Pullur, Tirur - 676102 | Quality Education with Islamic Values</p>
          <div style={styles.motto}>"Empowering Minds, Nurturing Souls"</div>
        </div>

        {/* Main Profile Card with Glassmorphism */}
        <div style={styles.profileCard}>
          {/* Cover Image with Wave Effect */}
          <div style={styles.coverImage}>
            <div style={styles.coverOverlay}></div>
            <div style={styles.wavePattern}></div>
          </div>

          {/* Profile Photo with Glow Ring */}
          <div style={styles.photoSection}>
            <div style={styles.photoWrapper}>
              <div style={styles.photoRing}></div>
              {student.image_url ? (
                <img src={student.image_url} style={styles.profilePhoto} alt={student.name} />
              ) : (
                <div style={styles.profilePhotoPlaceholder}>
                  <span style={styles.placeholderIcon}>👨‍🎓</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Name & Basic Info with Animation */}
          <div style={styles.nameSection}>
            <h1 style={styles.studentName}>{student.name}</h1>
            <div style={styles.badgeContainer}>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>🎫</span>
                {student.admission_no}
              </div>
              <div style={styles.badgeCourse}>
                <span style={styles.badgeIcon}>📚</span>
                {student.course_name}
              </div>
            </div>
          </div>

          {/* Details Grid - No Scroll, Full Height Optimized */}
          <div style={styles.detailsGrid}>
            {/* Personal Information Section */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconBg}>👤</div>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
              </div>
              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>📞</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Phone Number</span>
                    <span style={styles.infoValue}>{student.phone || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>📧</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Email Address</span>
                    <span style={styles.infoValue}>{student.email || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🎂</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Date of Birth</span>
                    <span style={styles.infoValue}>{student.dob || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🩸</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Blood Group</span>
                    <span style={styles.infoValue}>{student.blood_group || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>⚥</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Gender</span>
                    <span style={styles.infoValue}>{student.gender || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Information Section */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconBg}>👨‍👩‍👧</div>
                <h3 style={styles.sectionTitle}>Parent Information</h3>
              </div>
              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>👨‍👩</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Parent Name</span>
                    <span style={styles.infoValue}>{student.parent_name || "Not provided"}</span>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>📱</div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Parent Phone</span>
                    <span style={styles.infoValue}>{student.parent_phone || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconBg}>📍</div>
                <h3 style={styles.sectionTitle}>Address</h3>
              </div>
              <div style={styles.addressContent}>
                <div style={styles.addressIcon}>🏠</div>
                <p style={styles.addressText}>{student.address || "Not provided"}</p>
              </div>
            </div>

            {/* Additional Details Section */}
            {student.details && (
              <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIconBg}>📝</div>
                  <h3 style={styles.sectionTitle}>Additional Information</h3>
                </div>
                <div style={styles.detailsContent}>
                  <p style={styles.detailsText}>{student.details}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons with Hover Effects */}
          <div style={styles.actionButtons}>
            <button style={styles.dashboardBtn} onClick={() => navigate("/student")}>
              <span>📊</span> Go to Dashboard
            </button>
            <button style={styles.logoutBtn} onClick={() => {
              localStorage.removeItem("student");
              navigate("/student-login");
            }}>
              <span>🚪</span> Logout
            </button>
          </div>

          {/* Footer */}
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bgOrb1: {
    position: "absolute",
    top: "-200px",
    right: "-200px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 20s ease-in-out infinite",
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "absolute",
    bottom: "-150px",
    left: "-150px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 15s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  bgOrb3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "800px",
    height: "800px",
    background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  gridPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
    pointerEvents: "none",
  },
  profileWrapper: {
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  schoolHeader: {
    textAlign: "center",
    marginBottom: "25px",
    padding: "25px",
    background: "linear-gradient(135deg, rgba(26,71,42,0.95) 0%, rgba(46,92,58,0.95) 100%)",
    borderRadius: "30px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(212,175,55,0.5)",
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  headerGlow: {
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)",
    animation: "rotate 20s linear infinite",
  },
  schoolName: {
    fontSize: "clamp(20px, 4vw, 28px)",
    fontWeight: "bold",
    color: "#d4af37",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    letterSpacing: "1px",
    margin: 0,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  schoolIcon: {
    fontSize: "32px",
  },
  schoolAddress: {
    color: "#f0f0f0",
    fontSize: "clamp(11px, 3vw, 13px)",
    marginTop: "8px",
    opacity: 0.9,
    position: "relative",
  },
  motto: {
    color: "#d4af37",
    fontSize: "12px",
    marginTop: "8px",
    fontStyle: "italic",
    position: "relative",
  },
  profileCard: {
    background: "rgba(255,255,255,0.98)",
    borderRadius: "40px",
    overflow: "hidden",
    boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
    position: "relative",
  },
  coverImage: {
    height: "140px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    position: "relative",
    overflow: "hidden",
  },
  coverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(102,126,234,0.7) 0%, rgba(118,75,162,0.7) 100%)",
  },
  wavePattern: {
    position: "absolute",
    bottom: "-2px",
    left: 0,
    right: 0,
    height: "40px",
    background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1440 320\"><path fill=\"white\" fill-opacity=\"1\" d=\"M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\"></path></svg>')",
    backgroundSize: "cover",
    pointerEvents: "none",
  },
  photoSection: {
    textAlign: "center",
    marginTop: "-70px",
    position: "relative",
    zIndex: 2,
  },
  photoWrapper: {
    display: "inline-block",
    position: "relative",
  },
  photoRing: {
    position: "absolute",
    top: "-5px",
    left: "-5px",
    right: "-5px",
    bottom: "-5px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d4af37, #f59e0b)",
    animation: "pulseRing 2s ease-in-out infinite",
  },
  profilePhoto: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid white",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  profilePhotoPlaceholder: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid white",
    position: "relative",
    zIndex: 1,
  },
  placeholderIcon: {
    fontSize: "55px",
    color: "white",
  },
  nameSection: {
    textAlign: "center",
    padding: "15px 20px 10px",
  },
  studentName: {
    fontSize: "clamp(26px, 5vw, 34px)",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #1e293b, #667eea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 12px 0",
  },
  badgeContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  badge: {
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    color: "#475569",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  badgeCourse: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 4px 10px rgba(102,126,234,0.3)",
  },
  badgeIcon: {
    fontSize: "12px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    padding: "20px 25px",
  },
  sectionCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "20px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid rgba(102,126,234,0.1)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    paddingBottom: "12px",
    borderBottom: "2px solid #eef2ff",
  },
  sectionIconBg: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #667eea15, #764ba215)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
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
    padding: "6px 0",
  },
  infoIcon: {
    fontSize: "20px",
    minWidth: "35px",
    color: "#667eea",
  },
  infoContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  infoLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: "500",
  },
  addressContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "6px 0",
  },
  addressIcon: {
    fontSize: "20px",
    minWidth: "35px",
    color: "#667eea",
  },
  addressText: {
    flex: 1,
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.5",
    margin: 0,
  },
  detailsContent: {
    padding: "6px 0",
  },
  detailsText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    margin: 0,
  },
  actionButtons: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    padding: "20px 25px 25px",
    borderTop: "1px solid #eef2ff",
  },
  dashboardBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(102,126,234,0.5)",
    },
  },
  logoutBtn: {
    background: "white",
    color: "#ef4444",
    border: "2px solid #ef4444",
    padding: "12px 28px",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 15px rgba(239,68,68,0.2)",
      background: "#fff5f5",
    },
  },
  footer: {
    textAlign: "center",
    padding: "15px",
    background: "#f8fafc",
    borderTop: "1px solid #eef2ff",
    fontSize: "11px",
    color: "#94a3b8",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) rotate(0deg);
    }
    33% {
      transform: translate(30px, -30px) rotate(120deg);
    }
    66% {
      transform: translate(-20px, 20px) rotate(240deg);
    }
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes pulseRing {
    0%, 100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
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
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default Profile;