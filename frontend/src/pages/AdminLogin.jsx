import { useState, useEffect } from "react";
import bgImage from "../assets/admin.jpeg";
import logo from "../assets/lgo.jpeg";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 Animation
  useEffect(() => {
    const card = document.getElementById("login-card");
    if (card) {
      card.style.opacity = 0;
      card.style.transform = "translateY(40px)";

      setTimeout(() => {
        card.style.transition = "0.6s ease";
        card.style.opacity = 1;
        card.style.transform = "translateY(0)";
      }, 100);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();

        localStorage.setItem("admin", "true");
        localStorage.setItem("username", data.username || "");
        if (data.user_id != null) {
          localStorage.setItem("admin_user_id", String(data.user_id));
        }

        alert("Login Success ✅");
        window.location.href = "/admin-dashboard";
      } else {
        let msg = "Invalid credentials";
        try {
          const err = await res.json();
          if (err.message) msg = err.message;
        } catch {
          /* ignore */
        }
        alert(msg);
      }
    } catch (error) {
      alert("Server error ❌");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* 🔥 Overlay */}
        <div style={styles.overlay}></div>

        {/* 🔥 Login Card */}
        <div style={styles.card} id="login-card">

          {/* ✅ LOGO */}
          <div style={styles.logoContainer}>
            <img src={logo} alt="logo" style={styles.logo} />
          </div>

          <h2 style={styles.title}>Admin Login</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          {/* 🔐 Password */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <span
              style={styles.eye}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>

        </div>
      </div>
    </div>
  );
}

const styles = {
  // ✅ FULL PAGE STRUCTURE
  wrapper: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },

  // ✅ BACKGROUND SECTION (AUTO HEIGHT)
  container: {
    position: "relative",
    flex: 1, // 🔥 fills space between navbar & footer
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  },

  // 🔥 DARK OVERLAY
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(5px)",
    zIndex: 1
  },

  // 🔥 GLASS CARD
  card: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.08)",
    padding: "35px",
    borderRadius: "20px",
    width: "320px",
    textAlign: "center",
    backdropFilter: "blur(15px)",
    boxShadow: "0 0 25px rgba(34,197,94,0.4)",
    border: "1px solid rgba(255,255,255,0.2)"
  },

  // ✅ LOGO
  logoContainer: {
    marginBottom: "15px"
  },

  logo: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(255,255,255,0.6)",
    boxShadow: "0 0 15px rgba(34,197,94,0.6)"
  },

  title: {
    marginBottom: "20px",
    color: "#fff",
    fontWeight: "600"
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.15)",
    color: "#fff"
  },

  eye: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer"
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  }
};

export default AdminLogin;