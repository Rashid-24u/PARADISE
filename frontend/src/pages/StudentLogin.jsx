import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://127.0.0.1:8000/api";

function StudentLogin() {
  const [form, setForm] = useState({
    admission_no: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    const admission_no = form.admission_no.trim();
    const password = form.password;

    if (!admission_no || !password) {
      toast.error("Please enter admission number and password 🎒");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/student-login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          admission_no,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Invalid server response");
      }

      if (data.success) {
        localStorage.clear();

        const studentData = {
          student_id: data.student_id || data.id,
          name: data.name,
          admission_no: data.admission_no,
          course: data.course,
          course_name: data.course_name,
        };

        localStorage.setItem("student", JSON.stringify(studentData));

        toast.success("🎉 Welcome back! Redirecting to your dashboard...");

        setTimeout(() => {
          navigate("/student", { replace: true });
        }, 1000);

      } else {
        const errorMsg = data.message || "Oops! Wrong admission number or password 😕";
        setError(errorMsg);
        toast.error(errorMsg);
      }

    } catch (err) {
      console.error("Login error:", err);

      const errorMsg = "Cannot connect to server. Please check your connection 🌐";

      setError(errorMsg);
      toast.error(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(10px, -15px) rotate(5deg); }
        50% { transform: translate(-8px, 10px) rotate(-3deg); }
        75% { transform: translate(12px, 5px) rotate(2deg); }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(5deg); }
        75% { transform: rotate(-5deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .student-login-box {
        animation: slideIn 0.5s ease-out;
      }
      
      .student-login-input:focus {
        border-color: #f59e0b !important;
        box-shadow: 0 0 0 3px rgba(245,158,11,0.1) !important;
      }
      
      .student-login-btn {
        position: relative;
        overflow: hidden;
      }
      
      .student-login-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }
      
      .student-login-btn:active::before {
        width: 300px;
        height: 300px;
      }
      
      @media (max-width: 768px) {
        .student-login-box {
          padding: 28px 24px !important;
          max-width: 360px !important;
        }
        .student-login-title {
          font-size: 26px !important;
        }
        .student-login-logo-icon {
          font-size: 55px !important;
        }
        .student-login-input {
          padding: 12px 12px 12px 42px !important;
          font-size: 14px !important;
        }
        .student-login-btn {
          padding: 12px !important;
          font-size: 16px !important;
        }
      }
      
      @media (max-width: 480px) {
        .student-login-box {
          padding: 24px 20px !important;
        }
        .student-login-title {
          font-size: 24px !important;
        }
        .student-login-subtitle {
          font-size: 13px !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div style={styles.container}>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        style={{ top: "20px", right: "20px" }}
      />
      
      {/* Cute Background Decorations */}
      <div style={styles.star1}>⭐</div>
      <div style={styles.star2}>🌟</div>
      <div style={styles.star3}>✨</div>
      <div style={styles.star4}>⭐</div>
      <div style={styles.star5}>🌟</div>
      
      <div style={styles.cloud1}>☁️</div>
      <div style={styles.cloud2}>☁️</div>
      <div style={styles.cloud3}>☁️</div>
      
      <div style={styles.bgOrb1}></div>
      <div style={styles.bgOrb2}></div>
      <div style={styles.bgOrb3}></div>
      
      <div style={styles.character1}>🐼</div>
      <div style={styles.character2}>🐧</div>
      <div style={styles.character3}>🦊</div>
      
      <div style={styles.box} className="student-login-box">
        <div style={styles.logoSection}>
          <div style={styles.logoWrapper}>
            <div style={styles.logoIcon}>🎓</div>
            <div style={styles.logoRing}></div>
          </div>
          <h2 style={styles.title} className="student-login-title">
            Welcome Back! 👋
          </h2>
          <p style={styles.subtitle} className="student-login-subtitle">
            Let's learn and have fun together! 🎨
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🎫</span>
              Admission Number
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🆔</span>
              <input
                type="text"
                name="admission_no"
                autoComplete="username"
                placeholder="Enter your admission number"
                style={styles.input}
                className="student-login-input"
                value={form.admission_no}
                onChange={(e) => setForm({ ...form, admission_no: e.target.value })}
                disabled={loading}
              />
              {form.admission_no && <span style={styles.inputCheck}>✓</span>}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🔐</span>
              Password
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your secret password"
                style={styles.input}
                className="student-login-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "🐵"}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>😕</span>
              <p>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            style={styles.btn} 
            className="student-login-btn"
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner}></span>
                Logging in...
              </span>
            ) : (
              <span>
                Let's Go! 🚀
                <span style={styles.btnArrow}>→</span>
              </span>
            )}
          </button>
        </form>

        <div style={styles.footerNote}>
          <p>⭐ Need help? Ask your teacher! ⭐</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  star1: {
    position: "absolute",
    top: "10%",
    left: "5%",
    fontSize: "30px",
    animation: "float 8s ease-in-out infinite",
    opacity: 0.7,
  },
  star2: {
    position: "absolute",
    top: "15%",
    right: "8%",
    fontSize: "25px",
    animation: "float 10s ease-in-out infinite reverse",
    opacity: 0.6,
  },
  star3: {
    position: "absolute",
    bottom: "20%",
    left: "10%",
    fontSize: "35px",
    animation: "float 9s ease-in-out infinite",
    opacity: 0.5,
  },
  star4: {
    position: "absolute",
    bottom: "30%",
    right: "12%",
    fontSize: "28px",
    animation: "float 7s ease-in-out infinite reverse",
    opacity: 0.6,
  },
  star5: {
    position: "absolute",
    top: "40%",
    left: "20%",
    fontSize: "20px",
    animation: "float 11s ease-in-out infinite",
    opacity: 0.4,
  },
  cloud1: {
    position: "absolute",
    top: "5%",
    left: "-50px",
    fontSize: "60px",
    opacity: 0.3,
    animation: "float 20s ease-in-out infinite",
  },
  cloud2: {
    position: "absolute",
    bottom: "10%",
    right: "-30px",
    fontSize: "80px",
    opacity: 0.25,
    animation: "float 18s ease-in-out infinite reverse",
  },
  cloud3: {
    position: "absolute",
    top: "30%",
    right: "15%",
    fontSize: "50px",
    opacity: 0.2,
    animation: "float 22s ease-in-out infinite",
  },
  bgOrb1: {
    position: "absolute",
    top: "-150px",
    right: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 25s ease-in-out infinite",
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "absolute",
    bottom: "-150px",
    left: "-100px",
    width: "350px",
    height: "350px",
    background: "radial-gradient(circle, rgba(255,105,180,0.12) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 20s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  bgOrb3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(135,206,250,0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  character1: {
    position: "absolute",
    bottom: "15%",
    left: "5%",
    fontSize: "70px",
    animation: "bounce 3s ease-in-out infinite",
    filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.2))",
  },
  character2: {
    position: "absolute",
    top: "20%",
    right: "3%",
    fontSize: "60px",
    animation: "bounce 3.5s ease-in-out infinite 0.5s",
    filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.2))",
  },
  character3: {
    position: "absolute",
    bottom: "30%",
    right: "8%",
    fontSize: "55px",
    animation: "bounce 4s ease-in-out infinite 1s",
    filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.2))",
  },
  box: {
    background: "white",
    borderRadius: "48px",
    padding: "45px 40px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
    position: "relative",
    zIndex: 10,
    border: "2px solid rgba(255,215,0,0.3)",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "35px",
  },
  logoWrapper: {
    position: "relative",
    display: "inline-block",
    marginBottom: "15px",
  },
  logoIcon: {
    fontSize: "65px",
    display: "inline-block",
    animation: "wiggle 3s ease-in-out infinite",
    filter: "drop-shadow(0 8px 15px rgba(0,0,0,0.15))",
  },
  logoRing: {
    position: "absolute",
    top: "-8px",
    left: "-8px",
    right: "-8px",
    bottom: "-8px",
    borderRadius: "50%",
    border: "2px dashed #f59e0b",
    animation: "pulse 2s ease-in-out infinite",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  labelIcon: {
    fontSize: "16px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "18px",
    color: "#94a3b8",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 44px",
    borderRadius: "20px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#fafbfc",
    "&:focus": {
      borderColor: "#f59e0b",
      backgroundColor: "white",
      boxShadow: "0 0 0 4px rgba(245,158,11,0.1)",
    },
  },
  inputCheck: {
    position: "absolute",
    right: "14px",
    color: "#10b981",
    fontSize: "18px",
    fontWeight: "bold",
  },
  passwordToggle: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    padding: "4px",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    borderRadius: "16px",
    border: "1px solid #fecaca",
    "& p": {
      margin: 0,
      fontSize: "13px",
      color: "#dc2626",
      fontWeight: "500",
    },
  },
  errorIcon: {
    fontSize: "20px",
  },
  btn: {
    padding: "15px",
    background: "linear-gradient(135deg, #11eaea 0%, #168ff9 100%)",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    transition: "all 0.3s ease",
    marginTop: "8px",
    boxShadow: "0 8px 20px rgba(245,158,11,0.3)",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 25px rgba(245,158,11,0.4)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
    "&:disabled": {
      opacity: 0.7,
      cursor: "not-allowed",
      transform: "none",
    },
  },
  btnArrow: {
    display: "inline-block",
    marginLeft: "8px",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "translateX(5px)",
    },
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  footerNote: {
    textAlign: "center",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "2px dashed #e2e8f0",
    "& p": {
      margin: 0,
      fontSize: "12px",
      color: "#94a3b8",
      fontWeight: "500",
    },
  },
};

// Add spin animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default StudentLogin;