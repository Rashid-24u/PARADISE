import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

function StudentLogin() {
  const [form, setForm] = useState({
    admission_no: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    const payload = {
      admission_no: form.admission_no.trim(),
      password: form.password,
    };

    if (!payload.admission_no || !payload.password) {
      setError("Enter admission number and password.");
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
          admission_no: payload.admission_no,
          password: payload.password,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("Server returned an invalid response. Is the API running?");
        return;
      }

      if (data.success) {
        localStorage.removeItem("admin");
        localStorage.removeItem("username");
        localStorage.removeItem("admin_user_id");
        localStorage.removeItem("teacher");
        localStorage.setItem("student", JSON.stringify(data));
        navigate("/student", { replace: true });
        return;
      }

      const msg =
        data.message ||
        (res.status === 404 ? "User not found" : "Invalid credentials");
      setError(msg);
    } catch (err) {
      setError("Cannot reach server. Check that Django is running on port 8000.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>👨‍🎓 Student Login</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            name="admission_no"
            autoComplete="username"
            placeholder="Admission number"
            style={styles.input}
            value={form.admission_no}
            onChange={(e) =>
              setForm({ ...form, admission_no: e.target.value })
            }
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            style={styles.input}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {error ? (
            <p style={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
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
    background: "#1e293b",
    padding: "20px",
    boxSizing: "border-box",
  },
  box: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "360px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  btn: {
    padding: "12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  error: {
    margin: 0,
    color: "#b91c1c",
    fontSize: "14px",
  },
};

export default StudentLogin;
