import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

function TeacherLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // Check screen size for responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear any existing session on mount
  useEffect(() => {
    localStorage.removeItem("admin");
    localStorage.removeItem("username");
    localStorage.removeItem("admin_user_id");
    localStorage.removeItem("student");
  }, []);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setError("");
    setShowSuccess("");
    
    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/teacher-login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle different HTTP status codes
      if (res.status === 401) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      if (res.status === 404) {
        setError("Teacher account not found. Please check your email.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(`Server error (${res.status}). Please try again later.`);
        setLoading(false);
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        setError("Invalid server response. Please try again.");
        setLoading(false);
        return;
      }

      if (data.success) {
        // Clear any existing sessions
        localStorage.removeItem("admin");
        localStorage.removeItem("username");
        localStorage.removeItem("admin_user_id");
        localStorage.removeItem("student");
        
        // Store teacher data with all necessary fields
        const teacherData = {
          teacher_id: data.teacher_id || data.id,
          id: data.teacher_id || data.id,
          name: data.name,
          email: data.email,
          course: data.course,
          course_name: data.course_name,
          subject: data.subject,
          last_login: data.last_login || new Date().toISOString(),
          success: true
        };
        
        localStorage.setItem("teacher", JSON.stringify(teacherData));
        
        setShowSuccess("Login successful! Redirecting to dashboard...");
        
        // Show success message before redirect
        setTimeout(() => {
          navigate("/teacher", { replace: true });
        }, 1500);
      } else {
        const errorMsg = data.message || "Invalid email or password";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Cannot connect to server. Please make sure Django is running on port 8000");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic styles based on mobile state
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #f5f7fb 0%, #e8edf5 100%)",
      padding: isMobile ? "16px" : "20px",
      position: "relative",
      overflow: "hidden",
    },
    bgDecoration1: {
      position: "absolute",
      top: "-100px",
      right: "-100px",
      width: "300px",
      height: "300px",
      background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
      borderRadius: "50%",
      animation: "float 20s ease-in-out infinite",
    },
    bgDecoration2: {
      position: "absolute",
      bottom: "-150px",
      left: "-150px",
      width: "400px",
      height: "400px",
      background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
      borderRadius: "50%",
      animation: "float 15s ease-in-out infinite reverse",
    },
    bgDecoration3: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "500px",
      height: "500px",
      background: "radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 70%)",
      borderRadius: "50%",
      pointerEvents: "none",
    },
    box: {
      background: "white",
      borderRadius: "28px",
      padding: isMobile ? "28px" : "40px",
      width: "100%",
      maxWidth: isMobile ? "360px" : "420px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
      position: "relative",
      zIndex: 1,
    },
    logoSection: {
      textAlign: "center",
      marginBottom: "32px",
    },
    logoIcon: {
      fontSize: isMobile ? "44px" : "52px",
      marginBottom: "12px",
      display: "inline-block",
      animation: "bounce 2s ease-in-out infinite",
    },
    title: {
      fontSize: isMobile ? "24px" : "28px",
      fontWeight: "700",
      color: "#1e293b",
      margin: "0 0 8px 0",
    },
    subtitle: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#334155",
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
    },
    input: {
      width: "100%",
      padding: isMobile ? "12px 12px 12px 40px" : "14px 14px 14px 44px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: isMobile ? "14px" : "15px",
      outline: "none",
      transition: "all 0.2s",
      backgroundColor: "#fafbfc",
    },
    passwordToggle: {
      position: "absolute",
      right: "14px",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "18px",
      color: "#94a3b8",
      padding: "4px",
    },
    successBox: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 14px",
      background: "#f0fdf4",
      borderRadius: "10px",
      border: "1px solid #bbf7d0",
    },
    successText: {
      margin: 0,
      fontSize: "13px",
      color: "#166534",
      flex: 1,
    },
    errorBox: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 14px",
      background: "#fef2f2",
      borderRadius: "10px",
      border: "1px solid #fecaca",
    },
    errorText: {
      margin: 0,
      fontSize: "13px",
      color: "#dc2626",
      flex: 1,
    },
    btn: {
      padding: isMobile ? "12px" : "14px",
      background: "#22c55e",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: isMobile ? "14px" : "15px",
      transition: "all 0.2s",
      marginTop: "8px",
      opacity: loading ? 0.7 : 1,
      cursor: loading ? "not-allowed" : "pointer",
    },
    footer: {
      marginTop: "24px",
      textAlign: "center",
      borderTop: "1px solid #e2e8f0",
      paddingTop: "20px",
    },
    footerText: {
      fontSize: "12px",
      color: "#64748b",
      margin: "0 0 4px 0",
      fontWeight: "500",
    },
    footerSmall: {
      fontSize: "10px",
      color: "#94a3b8",
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      {/* Background Decoration */}
      <div style={styles.bgDecoration1}></div>
      <div style={styles.bgDecoration2}></div>
      <div style={styles.bgDecoration3}></div>
      
      <div style={styles.box}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>👨‍🏫</div>
          <h2 style={styles.title}>Teacher Login</h2>
          <p style={styles.subtitle}>Access your teaching dashboard</p>
        </div>

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📧</span>
              <input
                type="email"
                placeholder="Enter your email"
                style={styles.input}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                style={styles.input}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {showSuccess && (
            <div style={styles.successBox}>
              <span>✅</span>
              <p style={styles.successText}>{showSuccess}</p>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            style={styles.btn} 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span>⏳ Logging in...</span>
            ) : (
              <span>Login →</span>
            )}
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            🏫 Paradise Islamic Pre-School
          </p>
          <p style={styles.footerSmall}>
            Pullur, Tirur - 676102
          </p>
        </div>
      </div>

      {/* Add animations */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, -20px) rotate(5deg); }
          50% { transform: translate(-10px, 15px) rotate(-3deg); }
          75% { transform: translate(20px, 10px) rotate(2deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        input:focus {
          border-color: #22c55e;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
        }
        
        button:active {
          transform: scale(0.98);
        }
        
        @media (max-width: 768px) {
          .teacher-login-box {
            padding: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default TeacherLogin;