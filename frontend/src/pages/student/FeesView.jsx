import { useEffect, useState } from "react";

function StudentFeesView() {
  const [student, setStudent] = useState(null);
  const [feesData, setFeesData] = useState(null);
  const [activitiesData, setActivitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const API = "http://127.0.0.1:8000/api/";

  // FIX 1: Correct student ID fetch
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("student"));
    if (stored?.student_id) {
      fetchStudentData(stored.student_id);
    } else {
      setLoading(false);
    }
  }, []);

  // FIX 2: Safe fetch with null/undefined checks
  const fetchStudentData = async (studentId) => {
    try {
      setLoading(true);
      const [studentRes, feesRes, activitiesRes] = await Promise.all([
        fetch(`${API}students/${studentId}/`),
        fetch(`${API}students/${studentId}/fees_details/`),
        fetch(`${API}students/${studentId}/activity_details/`),
      ]);

      const student = await studentRes.json();
      const fees = await feesRes.json();
      const activities = await activitiesRes.json();

      // FIX 3: Safe data assignment with fallbacks
      setStudent(student || null);
      setFeesData(fees || null);
      setActivitiesData(Array.isArray(activities) ? activities : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setStudent(null);
      setFeesData(null);
      setActivitiesData([]);
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

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDateTime(dateString);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading fee details...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💰 Fee Management</h2>
        <p style={styles.subtitle}>View your fee details and payment history</p>
      </div>

      {/* Student Info Card */}
      {student && (
        <div style={styles.studentCard}>
          <div style={styles.studentAvatar}>
            {student.image_url ? (
              <img src={student.image_url} style={styles.avatar} alt={student.name} />
            ) : (
              <div style={styles.avatarPlaceholder}>🎓</div>
            )}
          </div>
          <div style={styles.studentInfo}>
            <h3>{student.name}</h3>
            <p>Admission No: {student.admission_no}</p>
            <p>Course: {student.course_name}</p>
            {student.last_login && (
              <p style={styles.lastLogin}>Last Login: {formatDateTime(student.last_login)}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Fee Summary - FIX 4: Safe check with optional chaining */}
      {feesData && (
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💰</div>
            <div style={styles.summaryContent}>
              <span style={styles.summaryLabel}>Total Fee</span>
              <strong style={styles.summaryValue}>₹{feesData.total_fees?.toLocaleString() || 0}</strong>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>✅</div>
            <div style={styles.summaryContent}>
              <span style={styles.summaryLabel}>Amount Paid</span>
              <strong style={styles.summaryValuePaid}>₹{feesData.total_paid?.toLocaleString() || 0}</strong>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>⚠️</div>
            <div style={styles.summaryContent}>
              <span style={styles.summaryLabel}>Pending Balance</span>
              <strong style={feesData.pending_balance > 0 ? styles.summaryValuePending : styles.summaryValuePaid}>
                ₹{feesData.pending_balance?.toLocaleString() || 0}
              </strong>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>📊</div>
            <div style={styles.summaryContent}>
              <span style={styles.summaryLabel}>Status</span>
              <strong style={feesData.status === "Paid" ? styles.statusPaid : styles.statusPending}>
                {feesData.status === "Paid" ? "✅ Fully Paid" : "⏳ Pending"}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Payment History - FIX 5: Safe check for payments array */}
      {feesData && feesData.payments && feesData.payments.length > 0 && (
        <div style={styles.historyCard}>
          <h3 style={styles.sectionTitle}>📜 Payment History</h3>
          <div style={styles.historyList}>
            {feesData.payments.map(payment => (
              <div key={payment.id} style={styles.historyItem}>
                <div style={styles.historyLeft}>
                  <div style={styles.historyIcon}>💸</div>
                  <div>
                    <div style={styles.historyDate}>{formatDateTime(payment.date)}</div>
                    <div style={styles.historyTime}>{getRelativeTime(payment.date)}</div>
                    {payment.remarks && <div style={styles.historyRemarks}>{payment.remarks}</div>}
                  </div>
                </div>
                <div style={styles.historyRight}>
                  <div style={styles.historyAmount}>+ ₹{payment.amount?.toLocaleString() || 0}</div>
                  <div style={styles.historyReceipt}>Receipt: {payment.receipt_no}</div>
                  <button 
                    style={styles.receiptBtn}
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowReceiptModal(true);
                    }}
                  >
                    🧾 View Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra Activities Section - FIX 6: Safe check for activities */}
      {activitiesData && activitiesData.length > 0 && (
        <div style={styles.activitiesCard}>
          <h3 style={styles.sectionTitle}>🎯 Extra Activities</h3>
          {activitiesData.map((activity, idx) => (
            <div key={idx} style={styles.activityItem}>
              <div style={styles.activityHeader}>
                <h4>{activity.activity}</h4>
                <span style={activity.status === "Completed" ? styles.statusPaid : styles.statusPending}>
                  {activity.status}
                </span>
              </div>
              <div style={styles.activityDetails}>
                <div style={styles.activityFee}>
                  <span>Total Fee: ₹{activity.total_fee?.toLocaleString() || 0}</span>
                  <span>Paid: ₹{activity.paid_amount?.toLocaleString() || 0}</span>
                  <span>Pending: ₹{activity.pending?.toLocaleString() || 0}</span>
                </div>
                <div style={styles.activityDate}>
                  Registered: {formatDateTime(activity.registered_at)}
                </div>
                {activity.payments && activity.payments.length > 0 && (
                  <div style={styles.activityPayments}>
                    <strong>Payment History:</strong>
                    {activity.payments.map(p => (
                      <div key={p.id} style={styles.activityPayment}>
                        <span>{formatDateTime(p.date)}</span>
                        <span>₹{p.amount?.toLocaleString() || 0}</span>
                        <span>{p.remarks}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - FIX 7: Safe check for no data */}
      {(!feesData?.payments || feesData.payments.length === 0) && activitiesData.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p>No payment records found</p>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && student && (
        <div style={styles.modalOverlay} onClick={() => setShowReceiptModal(false)}>
          <div style={styles.receiptModal} onClick={e => e.stopPropagation()}>
            <div style={styles.receiptHeader}>
              <h3>🧾 Payment Receipt</h3>
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
                <p><strong>Student:</strong> {student?.name}</p>
                <p><strong>Admission No:</strong> {student?.admission_no}</p>
                <p><strong>Amount:</strong> <span style={styles.receiptAmount}>₹{selectedPayment.amount?.toLocaleString() || 0}</span></p>
                <p><strong>Remarks:</strong> {selectedPayment.remarks || "Fee Payment"}</p>
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
  container: {
    padding: "24px",
    background: "#f5f7fb",
    minHeight: "calc(100vh - 70px)",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "6px",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#22c55e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  studentCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  studentAvatar: {
    width: "80px",
    height: "80px",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    color: "white",
  },
  studentInfo: {
    flex: 1,
    h3: { margin: "0 0 4px 0", fontSize: "20px", color: "#1e293b" },
    p: { margin: "2px 0", fontSize: "13px", color: "#64748b" },
  },
  lastLogin: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "6px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  summaryIcon: {
    fontSize: "32px",
  },
  summaryContent: {
    display: "flex",
    flexDirection: "column",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
  },
  summaryValuePaid: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#22c55e",
  },
  summaryValuePending: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#f97316",
  },
  statusPaid: {
    display: "inline-block",
    padding: "4px 12px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusPending: {
    display: "inline-block",
    padding: "4px 12px",
    background: "#ffedd5",
    color: "#9a3412",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  historyCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 16px 0",
    paddingBottom: "12px",
    borderBottom: "2px solid #e2e8f0",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  historyLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  historyIcon: {
    fontSize: "24px",
  },
  historyDate: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1e293b",
  },
  historyTime: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  historyRemarks: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  historyRight: {
    textAlign: "right",
  },
  historyAmount: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#22c55e",
  },
  historyReceipt: {
    fontSize: "10px",
    color: "#94a3b8",
  },
  receiptBtn: {
    marginTop: "4px",
    padding: "4px 12px",
    background: "#d4af37",
    color: "#1a472a",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "500",
  },
  activitiesCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  activityItem: {
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "12px",
  },
  activityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    h4: { margin: 0, fontSize: "16px", color: "#1e293b" },
  },
  activityDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  activityFee: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    span: { color: "#475569" },
  },
  activityDate: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  activityPayments: {
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid #e2e8f0",
    strong: { fontSize: "12px", display: "block", marginBottom: "6px" },
  },
  activityPayment: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    padding: "4px 0",
    color: "#64748b",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px",
    background: "white",
    borderRadius: "20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  receiptModal: {
    background: "white",
    borderRadius: "20px",
    width: "450px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  receiptHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    h3: { margin: 0 },
  },
  receiptBody: {
    padding: "20px",
  },
  receiptSchool: {
    textAlign: "center",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #d4af37",
    h4: { color: "#1a472a", marginBottom: "4px" },
    p: { fontSize: "11px", color: "#666" },
  },
  receiptInfo: {
    p: { margin: "8px 0", fontSize: "13px" },
  },
  receiptAmount: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#22c55e",
  },
  receiptFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
  },
  printBtn: {
    padding: "8px 20px",
    background: "#1a472a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#94a3b8",
  },
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default StudentFeesView;