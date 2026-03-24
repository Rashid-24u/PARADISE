import { useEffect, useState } from "react";

function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    student: "",
    total: "",
    paid: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [message, setMessage] = useState("");

  const API_FEES = "http://127.0.0.1:8000/api/fees/";
  const API_STUDENTS = "http://127.0.0.1:8000/api/students/";

  // 🔥 FETCH
  const fetchData = async () => {
    const f = await fetch(API_FEES);
    const fData = await f.json();
    setFees(fData);

    const s = await fetch(API_STUDENTS);
    const sData = await s.json();
    setStudents(sData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔔 AUTO MESSAGE
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 2000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // 🔥 USED STUDENTS (duplicate avoid)
  const usedStudentIds = fees.map((f) => f.student);

  // 🔥 ADD / UPDATE
  const handleSubmit = async () => {
    if (!form.student || !form.total) {
      setMessage("⚠️ Fill required fields");
      return;
    }

    const status =
      Number(form.paid) >= Number(form.total) ? "Paid" : "Pending";

    const payload = {
      student: form.student,
      total_amount: form.total,
      paid_amount: form.paid || 0,
      status,
    };

    if (editingId) {
      await fetch(API_FEES + editingId + "/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage("✅ Fees updated");
      setEditingId(null);
    } else {
      await fetch(API_FEES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage("✅ Fees added");
    }

    setForm({ student: "", total: "", paid: "" });
    fetchData();
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    await fetch(API_FEES + id + "/", { method: "DELETE" });
    setMessage("🗑️ Deleted");
    fetchData();
  };

  // 🔥 EDIT
  const handleEdit = (f) => {
    setForm({
      student: f.student,
      total: f.total_amount,
      paid: f.paid_amount,
    });
    setEditingId(f.id);
  };

  // 🔍 GET STUDENT
  const getStudent = (id) =>
    students.find((s) => s.id === id);

  // 🔍 FILTER
  const filtered = fees.filter((f) => {
    const studentData = getStudent(f.student);

    const nameMatch = studentData?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const statusMatch = statusFilter
      ? f.status === statusFilter
      : true;

    const classMatch = classFilter
      ? studentData?.student_class
          ?.toLowerCase()
          .includes(classFilter.toLowerCase())
      : true;

    return nameMatch && statusMatch && classMatch;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Fees Management</h2>

      {/* MESSAGE */}
      {message && <div style={styles.message}>{message}</div>}

      {/* FORM */}
      <div style={styles.form}>
        <select
          style={styles.input}
          value={form.student}
          onChange={(e) =>
            setForm({ ...form, student: e.target.value })
          }
        >
          <option value="">Select Student</option>

          {students
            .filter(
              (s) =>
                !usedStudentIds.includes(s.id) ||
                s.id === form.student
            )
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.student_class})
              </option>
            ))}
        </select>

        <input
          style={styles.input}
          placeholder="Total Amount"
          value={form.total}
          onChange={(e) =>
            setForm({ ...form, total: e.target.value })
          }
        />

        <input
          style={styles.input}
          placeholder="Paid Amount"
          value={form.paid}
          onChange={(e) =>
            setForm({ ...form, paid: e.target.value })
          }
        />

        <button style={styles.addBtn} onClick={handleSubmit}>
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* FILTERS */}
      <div style={styles.filterBox}>
        <input
          style={styles.input}
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.input}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <input
          style={styles.input}
          placeholder="Filter class..."
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Class</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Paid</th>
              <th style={styles.th}>Balance</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((f) => {
              const student = getStudent(f.student);
              const balance =
                f.total_amount - f.paid_amount;

              return (
                <tr key={f.id}>
                  <td style={styles.td}>{student?.name}</td>
                  <td style={styles.td}>
                    {student?.student_class}
                  </td>
                  <td style={styles.td}>₹{f.total_amount}</td>
                  <td style={styles.td}>₹{f.paid_amount}</td>
                  <td style={styles.td}>₹{balance}</td>

                  <td
                    style={{
                      ...styles.td,
                      color:
                        f.status === "Paid"
                          ? "green"
                          : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {f.status}
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.edit}
                        onClick={() => handleEdit(f)}
                      >
                        Edit
                      </button>

                      <button
                        style={styles.delete}
                        onClick={() => handleDelete(f.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            No records found
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "auto",
  },

  title: {
    textAlign: "center",
    color: "#065f46",
    marginBottom: "20px",
  },

  message: {
    background: "#dcfce7",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    textAlign: "center",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
    marginBottom: "15px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  addBtn: {
    background: "#065f46",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },

  th: {
    background: "#065f46",
    color: "white",
    padding: "12px",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
  },

  actions: {
    display: "flex",
    gap: "8px",
  },

  edit: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
  },

  delete: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
  },
};

export default Fees;