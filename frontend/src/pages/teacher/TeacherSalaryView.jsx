import { useEffect, useState } from "react";

function TeacherSalaryView() {
  const [teacher, setTeacher] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const API = "http://127.0.0.1:8000/api/";

  // FIX 1: Safe localStorage parsing
  useEffect(() => {
    const raw = localStorage.getItem("teacher");
    let stored = null;
    
    try {
      stored = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Error parsing teacher data:", error);
      stored = null;
    }
    
    if (stored?.teacher_id) {
      fetchTeacherData(stored.teacher_id);
    } else {
      setLoading(false);
    }
  }, []);

  // FIX 2: Safe API fetch with status checks
  const fetchTeacherData = async (teacherId) => {
    try {
      setLoading(true);
      const [teacherRes, salaryRes] = await Promise.all([
        fetch(`${API}teachers/${teacherId}/`),
        fetch(`${API}teachers/${teacherId}/salary_details/`),
      ]);

      // FIX: Check API response status
      if (!teacherRes.ok || !salaryRes.ok) {
        throw new Error("API request failed");
      }

      const teacher = await teacherRes.json();
      const salary = await salaryRes.json();

      // Safe assignment with fallbacks
      setTeacher(teacher || null);
      setSalaryData(salary || null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setTeacher(null);
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  // FIX: Style injection with cleanup
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading salary details...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💰 Salary Details</h2>
        <p style={styles.subtitle}>View your salary information and payment history</p>
      </div>

      {teacher && (
        <div style={styles.teacherCard}>
          <div style={styles.teacherAvatar}>
            {teacher.image_url ? (
              <img src={teacher.image_url} style={styles.avatar} alt={teacher.name} />
            ) : (
              <div style={styles.avatarPlaceholder}>👨‍🏫</div>
            )}
          </div>
          <div style={styles.teacherInfo}>
            <h3>{teacher.name}</h3>
            <p>📚 {teacher.subject || "Not set"} | 🏫 {teacher.course_name || "All Classes"}</p>
            <p>📧 {teacher.email}</p>
            {teacher.last_login && (
              <p style={styles.lastLogin}>Last Login: {formatDateTime(teacher.last_login)}</p>
            )}
          </div>
        </div>
      )}

      {salaryData && (
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💰</div>
            <div style={styles.summaryContent}>
              <span style={styles.summaryLabel}>Monthly Salary</span>
              <strong style={styles.summaryValue}>₹{salaryData.current_salary?.toLocaleString() || 0}</strong>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>✅</div>
            <div style={styles.summaryContent}>
              <span style={styles.summaryLabel}>Total Paid</span>
              <strong style={styles.summaryValuePaid}>₹{salaryData.total_paid?.toLocaleString() || 0}</strong>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>⚠️</div>
            <div style={styles.summaryContent}>
              <span style={styles.summaryLabel}>Total Pending</span>
              <strong style={styles.summaryValuePending}>₹{salaryData.total_pending?.toLocaleString() || 0}</strong>
            </div>
          </div>
        </div>
      )}

      {/* FIX 3: Safe array check */}
      {Array.isArray(salaryData?.salary_records) && salaryData.salary_records.length > 0 && (
        <div style={styles.recordsCard}>
          <h3 style={styles.sectionTitle}>📊 Salary Records</h3>
          <div style={styles.recordsList}>
            {salaryData.salary_records.map(record => {
              const total = record.total_salary || 0;
              const paid = record.paid_amount || 0;
              const pending = total - paid;
              // FIX 4: Prevent NaN in progress bar
              const paidPercent = total > 0 ? (paid / total) * 100 : 0;
              
              return (
                <div key={record.id} style={styles.recordItem}>
                  <div style={styles.recordHeader}>
                    <h4>{record.month} {record.year}</h4>
                    <span style={
                      record.status === "Paid" ? styles.statusPaid : 
                      record.status === "Partial" ? styles.statusPartial : styles.statusPending
                    }>
                      {record.status === "Paid" ? "✅ Paid" : 
                       record.status === "Partial" ? "⏳ Partial" : "⏰ Pending"}
                    </span>
                  </div>
                  <div style={styles.recordDetails}>
                    <div style={styles.recordAmounts}>
                      <div><span>Total:</span> <strong>₹{total.toLocaleString()}</strong></div>
                      <div><span>Paid:</span> <strong>₹{paid.toLocaleString()}</strong></div>
                      <div><span>Pending:</span> <strong style={pending > 0 ? { color: "#f97316" } : { color: "#22c55e" }}>
                        ₹{pending.toLocaleString()}
                      </strong></div>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${paidPercent}%` }} />
                    </div>
                    {/* FIX 5: Safe array check for payments */}
                    {Array.isArray(record.payments) && record.payments.length > 0 && (
                      <div style={styles.paymentsList}>
                        <strong>Payment History:</strong>
                        {record.payments.map(p => (
                          <div key={p.id} style={styles.paymentItem}>
                            <span>{formatDateTime(p.date)}</span>
                            <span>₹{p.amount?.toLocaleString() || 0}</span>
                            <span>{p.remarks || "Salary Payment"}</span>
                            <button 
                              style={styles.receiptBtn}
                              onClick={() => {
                                setSelectedPayment(p);
                                setShowReceiptModal(true);
                              }}
                            >
                              🧾 Receipt
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(!Array.isArray(salaryData?.salary_records) || salaryData.salary_records.length === 0) && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p>No salary records found</p>
        </div>
      )}

      {showReceiptModal && selectedPayment && (
        <div style={styles.modalOverlay} onClick={() => setShowReceiptModal(false)}>
          <div style={styles.receiptModal} onClick={e => e.stopPropagation()}>
            <div style={styles.receiptHeader}>
              <h3>🧾 Salary Payment Receipt</h3>
              <button style={styles.closeBtn} onClick={() => setShowReceiptModal(false)}>✖</button>
            </div>
            <div style={styles.receiptBody}>
              <div style={styles.receiptSchool}>
                <h4>🏫 PARADISE ISLAMIC PRE-SCHOOL</h4>
                <p>Pullur, Tirur - 676102</p>
              </div>
              <div style={styles.receiptInfo}>
                <p><strong>Receipt No:</strong> {selectedPayment.receipt_no}</p>
                <p><strong>Date:</strong> {formatDateTime(selectedPayment.date)}</p>
                <p><strong>Teacher:</strong> {teacher?.name}</p>
                <p><strong>Amount:</strong> <span style={styles.receiptAmount}>₹{selectedPayment.amount?.toLocaleString() || 0}</span></p>
                <p><strong>Remarks:</strong> {selectedPayment.remarks || "Salary Payment"}</p>
              </div>
            </div>
            <div style={styles.receiptFooter}>
              <button style={styles.printBtn} onClick={() => window.print()}>🖨️ Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "24px", background: "#f5f7fb", minHeight: "calc(100vh - 70px)" },
  header: { marginBottom: "24px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 },
  subtitle: { fontSize: "14px", color: "#64748b", marginTop: "6px" },
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px" },
  spinner: { width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 1s linear infinite" },
  teacherCard: { background: "white", borderRadius: "20px", padding: "20px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  teacherAvatar: { width: "80px", height: "80px" },
  avatar: { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: { width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "white" },
  teacherInfo: { flex: 1, h3: { margin: "0 0 4px 0", fontSize: "20px", color: "#1e293b" }, p: { margin: "2px 0", fontSize: "13px", color: "#64748b" } },
  lastLogin: { fontSize: "11px", color: "#94a3b8", marginTop: "6px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  summaryCard: { background: "white", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  summaryIcon: { fontSize: "32px" },
  summaryContent: { display: "flex", flexDirection: "column" },
  summaryLabel: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" },
  summaryValue: { fontSize: "20px", fontWeight: "700", color: "#1e293b" },
  summaryValuePaid: { fontSize: "20px", fontWeight: "700", color: "#22c55e" },
  summaryValuePending: { fontSize: "20px", fontWeight: "700", color: "#f97316" },
  recordsCard: { background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  sectionTitle: { fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0", paddingBottom: "12px", borderBottom: "2px solid #e2e8f0" },
  recordsList: { display: "flex", flexDirection: "column", gap: "16px" },
  recordItem: { padding: "16px", background: "#f8fafc", borderRadius: "12px" },
  recordHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", h4: { margin: 0, fontSize: "16px", color: "#1e293b" } },
  statusPaid: { padding: "4px 12px", background: "#dcfce7", color: "#166534", borderRadius: "20px", fontSize: "11px", fontWeight: "500" },
  statusPartial: { padding: "4px 12px", background: "#ffedd5", color: "#9a3412", borderRadius: "20px", fontSize: "11px", fontWeight: "500" },
  statusPending: { padding: "4px 12px", background: "#fee2e2", color: "#991b1b", borderRadius: "20px", fontSize: "11px", fontWeight: "500" },
  recordDetails: { marginTop: "8px" },
  recordAmounts: { display: "flex", gap: "24px", marginBottom: "12px", fontSize: "13px", span: { color: "#64748b" } },
  progressBar: { height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden", marginBottom: "16px" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: "4px", transition: "width 0.3s" },
  paymentsList: { marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", strong: { fontSize: "12px", display: "block", marginBottom: "8px" } },
  paymentItem: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", padding: "6px 0", color: "#64748b", gap: "8px", flexWrap: "wrap" },
  receiptBtn: { padding: "2px 8px", background: "#d4af37", color: "#1a472a", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px" },
  emptyState: { textAlign: "center", padding: "48px", background: "white", borderRadius: "20px" },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  receiptModal: { background: "white", borderRadius: "20px", width: "450px", maxWidth: "90%", maxHeight: "90vh", overflow: "auto" },
  receiptHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #e2e8f0", h3: { margin: 0 } },
  receiptBody: { padding: "20px" },
  receiptSchool: { textAlign: "center", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #d4af37", h4: { color: "#1a472a", marginBottom: "4px" }, p: { fontSize: "11px", color: "#666" } },
  receiptInfo: { p: { margin: "8px 0", fontSize: "13px" } },
  receiptAmount: { fontSize: "18px", fontWeight: "bold", color: "#22c55e" },
  receiptFooter: { padding: "16px 20px", borderTop: "1px solid #e2e8f0", textAlign: "center" },
  printBtn: { padding: "8px 20px", background: "#1a472a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" },
};

export default TeacherSalaryView;