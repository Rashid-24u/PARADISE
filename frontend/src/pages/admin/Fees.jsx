import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Fees() {
  const navigate = useNavigate();
  const formRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);

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
  const [messageType, setMessageType] = useState("success");

  const API_FEES = "http://127.0.0.1:8000/api/fees/";
  const API_STUDENTS = "http://127.0.0.1:8000/api/students/";

  // Check screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FETCH
  const fetchData = async () => {
    try {
      const f = await fetch(API_FEES);
      const fData = await f.json();
      setFees(fData);

      const s = await fetch(API_STUDENTS);
      const sData = await s.json();
      setStudents(sData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // AUTO MESSAGE
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const usedStudentIds = fees.map((f) => f.student);

  // VALIDATION FUNCTIONS
  const validateStudent = (studentId) => {
    if (!studentId) {
      return "Student is required";
    }
    return null;
  };

  const validateTotal = (total) => {
    if (!total || total === "") {
      return "Total amount is required";
    }
    const numTotal = Number(total);
    if (isNaN(numTotal) || numTotal <= 0) {
      return "Total amount must be a positive number";
    }
    return null;
  };

  const validatePaid = (paid, total) => {
    if (!paid || paid === "") {
      return null; // Paid is optional (defaults to 0)
    }
    const numPaid = Number(paid);
    const numTotal = Number(total);
    if (isNaN(numPaid) || numPaid < 0) {
      return "Paid amount must be a positive number";
    }
    if (numPaid > numTotal) {
      return "Paid amount cannot exceed total amount";
    }
    return null;
  };

  const validateForm = () => {
    const studentError = validateStudent(form.student);
    if (studentError) {
      setMessage(studentError);
      setMessageType("error");
      return false;
    }

    const totalError = validateTotal(form.total);
    if (totalError) {
      setMessage(totalError);
      setMessageType("error");
      return false;
    }

    const paidError = validatePaid(form.paid, form.total);
    if (paidError) {
      setMessage(paidError);
      setMessageType("error");
      return false;
    }

    return true;
  };

  // ADD / UPDATE
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const totalAmount = Number(form.total);
    const paidAmount = Number(form.paid) || 0;
    const status = paidAmount >= totalAmount ? "Paid" : "Pending";

    const payload = {
      student: form.student,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      status,
    };

    try {
      if (editingId) {
        await fetch(API_FEES + editingId + "/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("✅ Fees updated successfully");
        setMessageType("success");
        setEditingId(null);
      } else {
        await fetch(API_FEES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setMessage("✅ Fees added successfully");
        setMessageType("success");
      }

      setForm({ student: "", total: "", paid: "" });
      fetchData();
    } catch (error) {
      setMessage("❌ Error saving fees");
      setMessageType("error");
    }
  };

  // DELETE
  const handleDelete = async (id, studentName) => {
    const confirmDelete = window.confirm(
      `Are you sure to delete fees record for "${studentName}"?`
    );
    if (!confirmDelete) return;

    try {
      await fetch(API_FEES + id + "/", { method: "DELETE" });
      setMessage(`🗑️ Fees record deleted successfully`);
      setMessageType("success");
      fetchData();
    } catch (error) {
      setMessage("❌ Error deleting fees record");
      setMessageType("error");
    }
  };

  // EDIT
  const handleEdit = (f) => {
    setForm({
      student: f.student,
      total: f.total_amount,
      paid: f.paid_amount,
    });
    setEditingId(f.id);
    
    // scroll + highlight
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
      formRef.current.style.boxShadow = "0 0 0 3px #10b981";
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.style.boxShadow = "";
        }
      }, 1500);
    }
  };

  const getStudent = (id) => students.find((s) => s.id === id);

  const filtered = fees.filter((f) => {
    const studentData = getStudent(f.student);
    if (!studentData) return false;

    const nameMatch = studentData?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const statusMatch = statusFilter ? f.status === statusFilter : true;

    const classMatch = classFilter
      ? studentData?.student_class
          ?.toLowerCase()
          .includes(classFilter.toLowerCase())
      : true;

    return nameMatch && statusMatch && classMatch;
  });

  // CLASS WISE SUMMARY CALCULATIONS
  const getClassWiseSummary = () => {
    const summary = {};
    
    fees.forEach((fee) => {
      const student = getStudent(fee.student);
      if (!student) return;
      
      const className = student.student_class;
      if (!summary[className]) {
        summary[className] = {
          totalStudents: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalBalance: 0,
          paidCount: 0,
          pendingCount: 0
        };
      }
      
      summary[className].totalStudents++;
      summary[className].totalAmount += fee.total_amount;
      summary[className].totalPaid += fee.paid_amount;
      summary[className].totalBalance += (fee.total_amount - fee.paid_amount);
      
      if (fee.status === "Paid") {
        summary[className].paidCount++;
      } else {
        summary[className].pendingCount++;
      }
    });
    
    return summary;
  };

  const classSummary = getClassWiseSummary();

  // OVERALL SUMMARY
  const overallSummary = {
    totalStudents: fees.length,
    totalAmount: fees.reduce((sum, fee) => sum + fee.total_amount, 0),
    totalPaid: fees.reduce((sum, fee) => sum + fee.paid_amount, 0),
    totalBalance: fees.reduce((sum, fee) => sum + (fee.total_amount - fee.paid_amount), 0),
    paidCount: fees.filter(f => f.status === "Paid").length,
    pendingCount: fees.filter(f => f.status === "Pending").length
  };

  // Format class name for display
  const formatClassName = (className) => {
    if (className === "PREKG") return "Pre KG";
    return className;
  };

  return (
    <div style={styles.container}>
      {/* BACK BUTTON */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate("/admin-dashboard")}>
          ⬅ {isMobile ? "Back" : "Back to Dashboard"}
        </button>
      </div>

      <h2 style={styles.title}>Fees Management</h2>

      {/* MESSAGE */}
      {message && (
        <div style={{...styles.message, ...(messageType === "error" ? styles.errorMessage : {})}}>
          {message}
        </div>
      )}

      {/* FORM */}
      <div style={styles.form} ref={formRef}>
        <div style={styles.inputGroup}>
          <select
            style={styles.input}
            value={form.student}
            onChange={(e) => setForm({ ...form, student: e.target.value })}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
          >
            <option value="">Select Student *</option>
            {students
              .filter(
                (s) =>
                  !usedStudentIds.includes(s.id) ||
                  s.id === Number(form.student)
              )
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatClassName(s.student_class)})
                </option>
              ))}
          </select>
          {!form.student && (
            <span style={styles.errorText}>Please select a student</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Total Amount *"
            type="number"
            value={form.total}
            onChange={(e) => setForm({ ...form, total: e.target.value })}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => {
              e.target.style.border = "1px solid #d1d5db";
              const error = validateTotal(form.total);
              if (error && form.total) {
                setMessage(error);
                setMessageType("error");
              }
            }}
          />
          {form.total && validateTotal(form.total) && (
            <span style={styles.errorText}>{validateTotal(form.total)}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Paid Amount"
            type="number"
            value={form.paid}
            onChange={(e) => setForm({ ...form, paid: e.target.value })}
            onFocus={(e) => (e.target.style.border = "2px solid #10b981")}
            onBlur={(e) => {
              e.target.style.border = "1px solid #d1d5db";
              const error = validatePaid(form.paid, form.total);
              if (error && form.paid) {
                setMessage(error);
                setMessageType("error");
              }
            }}
          />
          {form.paid && validatePaid(form.paid, form.total) && (
            <span style={styles.errorText}>{validatePaid(form.paid, form.total)}</span>
          )}
        </div>

        <button style={styles.addBtn} onClick={handleSubmit}>
          {editingId ? "✏️ Update Fees" : "➕ Add Fees"}
        </button>
        
        {editingId && (
          <button 
            style={styles.cancelBtn}
            onClick={() => {
              setEditingId(null);
              setForm({ student: "", total: "", paid: "" });
            }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* OVERALL SUMMARY CARDS */}
      <div style={styles.summaryContainer}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div style={styles.summaryInfo}>
            <div style={styles.summaryLabel}>Total Students</div>
            <div style={styles.summaryValue}>{overallSummary.totalStudents}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💰</div>
          <div style={styles.summaryInfo}>
            <div style={styles.summaryLabel}>Total Amount</div>
            <div style={styles.summaryValue}>₹{overallSummary.totalAmount.toLocaleString()}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>✅</div>
          <div style={styles.summaryInfo}>
            <div style={styles.summaryLabel}>Total Paid</div>
            <div style={styles.summaryValue}>₹{overallSummary.totalPaid.toLocaleString()}</div>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>⚖️</div>
          <div style={styles.summaryInfo}>
            <div style={styles.summaryLabel}>Total Balance</div>
            <div style={styles.summaryValue}>₹{overallSummary.totalBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* CLASS WISE SUMMARY */}
      {Object.keys(classSummary).length > 0 && (
        <div style={styles.classSummaryContainer}>
          <h3 style={styles.sectionTitle}>Class Wise Summary</h3>
          <div style={styles.classGrid}>
            {Object.entries(classSummary).map(([className, data]) => (
              <div key={className} style={styles.classCard}>
                <div style={styles.classCardHeader}>{formatClassName(className)}</div>
                <div style={styles.classCardBody}>
                  <div style={styles.classStat}>
                    <span>👨‍🎓 Students:</span>
                    <strong>{data.totalStudents}</strong>
                  </div>
                  <div style={styles.classStat}>
                    <span>💰 Total:</span>
                    <strong>₹{data.totalAmount.toLocaleString()}</strong>
                  </div>
                  <div style={styles.classStat}>
                    <span>✅ Paid:</span>
                    <strong>₹{data.totalPaid.toLocaleString()}</strong>
                  </div>
                  <div style={styles.classStat}>
                    <span>⚖️ Balance:</span>
                    <strong style={{color: data.totalBalance > 0 ? "#dc2626" : "#10b981"}}>
                      ₹{data.totalBalance.toLocaleString()}
                    </strong>
                  </div>
                  <div style={styles.classProgress}>
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressFill,
                          width: `${(data.totalPaid / data.totalAmount) * 100}%`
                        }}
                      />
                    </div>
                    <div style={styles.progressText}>
                      {((data.totalPaid / data.totalAmount) * 100).toFixed(1)}% Paid
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div style={isMobile ? styles.filterBoxMobile : styles.filterBox}>
        <input
          style={styles.input}
          placeholder="🔍 Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select
          style={styles.input}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <input
          style={styles.input}
          placeholder="📚 Filter by class..."
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        />
      </div>

      {/* TABLE / MOBILE CARDS */}
      <div style={styles.tableWrapper}>
        {isMobile ? (
          // Mobile Card View
          <div style={styles.mobileCardContainer}>
            {filtered.map((f) => {
              const student = getStudent(f.student);
              if (!student) return null;
              const balance = f.total_amount - f.paid_amount;
              
              return (
                <div
                  key={f.id}
                  style={styles.mobileCard}
                  onClick={() => setSelectedFee(f)}
                >
                  <div style={styles.mobileCardHeader}>
                    <div style={styles.mobileCardAvatar}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.mobileCardInfo}>
                      <h3 style={styles.mobileCardName}>{student.name}</h3>
                      <span style={styles.mobileCardClass}>{formatClassName(student.student_class)}</span>
                    </div>
                  </div>
                  
                  <div style={styles.mobileCardDetails}>
                    <div style={styles.mobileDetailRow}>
                      <span>💰 Total:</span>
                      <strong>₹{f.total_amount.toLocaleString()}</strong>
                    </div>
                    <div style={styles.mobileDetailRow}>
                      <span>✅ Paid:</span>
                      <strong>₹{f.paid_amount.toLocaleString()}</strong>
                    </div>
                    <div style={styles.mobileDetailRow}>
                      <span>⚖️ Balance:</span>
                      <strong style={{color: balance > 0 ? "#dc2626" : "#10b981"}}>
                        ₹{balance.toLocaleString()}
                      </strong>
                    </div>
                    <div style={styles.mobileDetailRow}>
                      <span>📌 Status:</span>
                      <span style={{
                        ...styles.statusBadge,
                        background: f.status === "Paid" ? "#dcfce7" : "#fee2e2",
                        color: f.status === "Paid" ? "#166534" : "#991b1b"
                      }}>
                        {f.status}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.mobileCardActions}>
                    <button
                      style={styles.mobileEditBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(f);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.mobileDeleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(f.id, student.name);
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={styles.noResults}>No fees records found</div>
            )}
          </div>
        ) : (
          // Desktop Table View
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Class</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Paid</th>
                <th style={styles.th}>Balance</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
               </tr>
            </thead>
            <tbody>
              {filtered.map((f, index) => {
                const student = getStudent(f.student);
                if (!student) return null;
                const balance = f.total_amount - f.paid_amount;
                
                return (
                  <tr
                    key={f.id}
                    style={{
                      ...styles.row,
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                    onClick={() => setSelectedFee(f)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#ffffff" : "#f9fafb";
                    }}
                  >
                    <td style={styles.td}>
                      <span style={styles.studentName}>{student.name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.classBadge}>{formatClassName(student.student_class)}</span>
                    </td>
                    <td style={styles.td}>₹{f.total_amount.toLocaleString()}</td>
                    <td style={styles.td}>₹{f.paid_amount.toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{color: balance > 0 ? "#dc2626" : "#10b981", fontWeight: "600"}}>
                        ₹{balance.toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: f.status === "Paid" ? "#dcfce7" : "#fee2e2",
                        color: f.status === "Paid" ? "#166534" : "#991b1b"
                      }}>
                        {f.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.editBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(f);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(f.id, student.name);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!isMobile && filtered.length === 0 && (
          <div style={styles.noResults}>No fees records found</div>
        )}
      </div>

      {/* FEE DETAIL CARD MODAL */}
      {selectedFee && (
        <div style={styles.overlay} onClick={() => setSelectedFee(null)}>
          <div style={isMobile ? styles.cardMobile : styles.card} onClick={(e) => e.stopPropagation()}>
            <button style={styles.cardClose} onClick={() => setSelectedFee(null)}>
              ✕
            </button>
            
            {(() => {
              const student = getStudent(selectedFee.student);
              if (!student) return null;
              const balance = selectedFee.total_amount - selectedFee.paid_amount;
              
              return (
                <>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardAvatar}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={styles.cardName}>{student.name}</h2>
                    <div style={styles.cardClass}>{formatClassName(student.student_class)}</div>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                      <div style={styles.infoIcon}>💰</div>
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Total Amount</div>
                        <div style={styles.infoValue}>₹{selectedFee.total_amount.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div style={styles.infoRow}>
                      <div style={styles.infoIcon}>✅</div>
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Paid Amount</div>
                        <div style={styles.infoValue}>₹{selectedFee.paid_amount.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div style={styles.infoRow}>
                      <div style={styles.infoIcon}>⚖️</div>
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Balance</div>
                        <div style={styles.infoValue} styles={{color: balance > 0 ? "#dc2626" : "#10b981"}}>
                          ₹{balance.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.infoRow}>
                      <div style={styles.infoIcon}>📌</div>
                      <div style={styles.infoContent}>
                        <div style={styles.infoLabel}>Status</div>
                        <div style={styles.infoValue}>
                          <span style={{
                            ...styles.statusBadge,
                            background: selectedFee.status === "Paid" ? "#dcfce7" : "#fee2e2",
                            color: selectedFee.status === "Paid" ? "#166534" : "#991b1b",
                            padding: "4px 12px"
                          }}>
                            {selectedFee.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <button
                      style={styles.cardEditBtn}
                      onClick={() => {
                        handleEdit(selectedFee);
                        setSelectedFee(null);
                      }}
                    >
                      ✏️ Edit Fees
                    </button>
                    <button
                      style={styles.cardDeleteBtn}
                      onClick={() => {
                        handleDelete(selectedFee.id, student.name);
                        setSelectedFee(null);
                      }}
                    >
                      🗑️ Delete Record
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "15px",
    maxWidth: "1200px",
    margin: "auto",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  topBar: {
    marginBottom: "15px",
  },

  backBtn: {
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    WebkitTapHighlightColor: "transparent",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "clamp(24px, 6vw, 32px)",
    fontWeight: "700",
    background: "linear-gradient(135deg, #065f46, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  message: {
    background: "#dcfce7",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "center",
    color: "#065f46",
    fontWeight: "500",
    border: "1px solid #a7f3d0",
    fontSize: "14px",
  },

  errorMessage: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
  },

  errorText: {
    fontSize: "12px",
    color: "#dc2626",
    marginTop: "4px",
    display: "block",
  },

  form: {
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    maxWidth: "700px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    border: "1px solid #e5e7eb",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "16px",
    transition: "all 0.2s",
    outline: "none",
    fontFamily: "inherit",
    WebkitAppearance: "none",
  },

  addBtn: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
    WebkitTapHighlightColor: "transparent",
  },

  cancelBtn: {
    background: "#6b7280",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  },

  // Summary Cards
  summaryContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  summaryCard: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  summaryIcon: {
    fontSize: "32px",
  },

  summaryInfo: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: "12px",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },

  summaryValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#065f46",
  },

  // Class Summary
  classSummaryContainer: {
    marginBottom: "25px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "15px",
  },

  classGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "15px",
  },

  classCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },

  classCardHeader: {
    background: "linear-gradient(135deg, #065f46, #10b981)",
    color: "white",
    padding: "12px 16px",
    fontWeight: "600",
    fontSize: "16px",
  },

  classCardBody: {
    padding: "16px",
  },

  classStat: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  classProgress: {
    marginTop: "12px",
  },

  progressBar: {
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    height: "8px",
  },

  progressFill: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    height: "100%",
    transition: "width 0.3s ease",
  },

  progressText: {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "6px",
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    marginBottom: "20px",
  },

  filterBoxMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    background: "white",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "inherit",
    minWidth: "800px",
  },

  tableHeader: {
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    borderBottom: "2px solid #e2e8f0",
  },

  th: {
    padding: "14px 12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  row: {
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderBottom: "1px solid #f1f5f9",
  },

  td: {
    padding: "12px 12px",
    verticalAlign: "middle",
  },

  studentName: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "14px",
  },

  classBadge: {
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#1e40af",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block",
  },

  statusBadge: {
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    display: "inline-block",
  },

  editBtn: {
    background: "#3b82f6",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    marginRight: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  },

  deleteBtn: {
    background: "#ef4444",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  },

  // Mobile Card Styles
  mobileCardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
  },

  mobileCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
    WebkitTapHighlightColor: "transparent",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  mobileCardAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #065f46, #10b981)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "white",
  },

  mobileCardInfo: {
    flex: 1,
  },

  mobileCardName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
    marginBottom: "4px",
  },

  mobileCardClass: {
    fontSize: "12px",
    background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#1e40af",
    padding: "2px 10px",
    borderRadius: "20px",
    display: "inline-block",
  },

  mobileCardDetails: {
    marginBottom: "12px",
    paddingTop: "8px",
    borderTop: "1px solid #f1f5f9",
  },

  mobileDetailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: "14px",
  },

  mobileCardActions: {
    display: "flex",
    gap: "10px",
  },

  mobileEditBtn: {
    flex: 1,
    background: "#3b82f6",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },

  mobileDeleteBtn: {
    flex: 1,
    background: "#ef4444",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },

  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "14px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "16px",
  },

  card: {
    position: "relative",
    background: "white",
    borderRadius: "24px",
    width: "380px",
    maxWidth: "100%",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },

  cardMobile: {
    position: "relative",
    background: "white",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "95%",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },

  cardClose: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "#f1f5f9",
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    WebkitTapHighlightColor: "transparent",
  },

  cardHeader: {
    background: "linear-gradient(135deg, #065f46, #10b981)",
    padding: "30px 20px 20px",
    textAlign: "center",
    color: "white",
  },

  cardAvatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "600",
    margin: "0 auto 16px",
    border: "4px solid white",
    color: "white",
  },

  cardName: {
    fontSize: "clamp(20px, 5vw, 24px)",
    fontWeight: "700",
    marginBottom: "8px",
    color: "white",
  },

  cardClass: {
    fontSize: "14px",
    background: "rgba(255,255,255,0.2)",
    display: "inline-block",
    padding: "4px 16px",
    borderRadius: "20px",
    fontWeight: "500",
  },

  cardBody: {
    padding: "20px",
    background: "white",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  infoIcon: {
    fontSize: "28px",
    width: "48px",
    textAlign: "center",
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },

  infoValue: {
    fontSize: "clamp(16px, 4vw, 18px)",
    fontWeight: "600",
    color: "#0f172a",
    wordBreak: "break-word",
  },

  cardFooter: {
    padding: "16px 20px 20px",
    display: "flex",
    gap: "12px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },

  cardEditBtn: {
    flex: 1,
    padding: "12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    WebkitTapHighlightColor: "transparent",
  },

  cardDeleteBtn: {
    flex: 1,
    padding: "12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
    WebkitTapHighlightColor: "transparent",
  },
};

export default Fees;