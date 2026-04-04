import { useEffect, useState } from "react";

function TeacherSalaryAdmin() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({
    month: "",
    year: new Date().getFullYear(),
    total_salary: "",
    paid_amount: "",
  });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [showSuccess, setShowSuccess] = useState("");
  const [showError, setShowError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = "http://127.0.0.1:8000/api/";

  // Check screen size for responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = () => {
    setLoading(true);
    fetch(API + "teachers/")
      .then(r => r.json())
      .then(data => setTeachers(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Error fetching teachers:", err);
        setTeachers([]);
        setShowError("Failed to fetch teachers");
        setTimeout(() => setShowError(""), 3000);
      })
      .finally(() => setLoading(false));
  };

  const fetchSalaryRecords = (teacherId) => {
    if (!teacherId) return;
    setLoading(true);
    fetch(API + `teacher-salaries/?teacher=${teacherId}`)
      .then(r => r.json())
      .then(data => {
        const records = Array.isArray(data) ? data : [];
        const sorted = records.sort((a, b) => {
          const dateA = new Date(`${a.month} ${a.year}`);
          const dateB = new Date(`${b.month} ${b.year}`);
          return dateB - dateA;
        });
        setSalaryRecords(sorted);
      })
      .catch(err => {
        console.error("Error fetching salary records:", err);
        setSalaryRecords([]);
        setShowError("Failed to fetch salary records");
        setTimeout(() => setShowError(""), 3000);
      })
      .finally(() => setLoading(false));
  };

  const handleSelectTeacher = (teacher) => {
    if (!teacher) return;
    setSelectedTeacher(teacher);
    fetchSalaryRecords(teacher.id);
  };

  const handleAddSalary = async () => {
    if (!form.month || !form.year || !form.total_salary) {
      setShowError("Please fill all required fields");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const totalSalary = parseInt(form.total_salary);
    if (totalSalary <= 0) {
      setShowError("Total salary must be greater than 0");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API + "teacher-salaries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: selectedTeacher.id,
          month: form.month,
          year: parseInt(form.year),
          total_salary: totalSalary,
          paid_amount: form.paid_amount ? parseInt(form.paid_amount) : 0,
        }),
      });

      const data = await res.json();

      if (res.ok && data) {
        setShowSuccess("Salary record added successfully!");
        setTimeout(() => setShowSuccess(""), 3000);
        setForm({ month: "", year: new Date().getFullYear(), total_salary: "", paid_amount: "" });
        fetchSalaryRecords(selectedTeacher.id);
        setShowModal(false);
      } else {
        setShowError(data?.error || data?.message || "Failed to add salary");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      console.error("Add salary error:", err);
      setShowError("Network error");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSalary = async () => {
    if (!selectedRecord || !form.total_salary) {
      setShowError("Please fill all required fields");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const totalSalary = parseInt(form.total_salary);
    if (totalSalary <= 0) {
      setShowError("Total salary must be greater than 0");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    if (totalSalary < (selectedRecord.paid_amount || 0)) {
      setShowError(`Total salary cannot be less than already paid amount (₹${(selectedRecord.paid_amount || 0).toLocaleString()})`);
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API + `teacher-salaries/${selectedRecord.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher: selectedTeacher.id,
          month: form.month,
          year: parseInt(form.year),
          total_salary: totalSalary,
          paid_amount: selectedRecord.paid_amount || 0,
        }),
      });

      const data = await res.json();

      if (res.ok && data) {
        setShowSuccess("Salary record updated successfully!");
        setTimeout(() => setShowSuccess(""), 3000);
        setForm({ month: "", year: new Date().getFullYear(), total_salary: "", paid_amount: "" });
        setSelectedRecord(null);
        fetchSalaryRecords(selectedTeacher.id);
        setShowModal(false);
      } else {
        setShowError(data?.error || data?.message || "Failed to update salary");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      console.error("Edit salary error:", err);
      setShowError("Network error");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSalary = async (record) => {
    if (!window.confirm(`Are you sure you want to delete salary record for ${record.month} ${record.year}? This will also delete all associated payments.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API + `teacher-salaries/${record.id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShowSuccess("Salary record deleted successfully!");
        setTimeout(() => setShowSuccess(""), 3000);
        fetchSalaryRecords(selectedTeacher.id);
      } else {
        setShowError("Failed to delete salary record");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      console.error("Delete salary error:", err);
      setShowError("Network error");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Updated handlePayment with confirmation
  const handlePayment = async () => {
    if (!selectedRecord) {
      setShowError("No salary record selected");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const amount = Number(paymentAmount);
    if (!paymentAmount || amount <= 0) {
      setShowError("Please enter a valid amount greater than 0");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const pending = (selectedRecord.total_salary || 0) - (selectedRecord.paid_amount || 0);
    if (amount > pending) {
      setShowError(`Amount exceeds pending balance (₹${pending.toLocaleString()})`);
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    // 🔥 CONFIRMATION BOX BEFORE PAYMENT
    const confirmMessage = `💵 Payment Confirmation\n\n` +
      `Teacher: ${selectedTeacher?.name}\n` +
      `Month: ${selectedRecord.month} ${selectedRecord.year}\n` +
      `Payment Amount: ₹${amount.toLocaleString()}\n` +
      `Remarks: ${paymentRemarks || "Salary Payment"}\n\n` +
      `Are you sure you want to make this payment?`;

    const isConfirmed = window.confirm(confirmMessage);
    
    if (!isConfirmed) {
      return; // Cancel payment
    }

    setLoading(true);
    try {
      const res = await fetch(API + "teacher-salary-payments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salary: selectedRecord.id,
          amount: amount,
          remarks: paymentRemarks || "Salary payment",
        }),
      });

      const data = await res.json();

      if (res.ok && data) {
        setShowSuccess(`✅ Payment of ₹${amount.toLocaleString()} recorded successfully!`);
        setTimeout(() => setShowSuccess(""), 3000);
        setPaymentAmount("");
        setPaymentRemarks("");
        fetchSalaryRecords(selectedTeacher.id);
        setShowModal(false);
      } else {
        setShowError(data?.error || data?.message || "Payment failed");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setShowError("Network error");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Print Salary Details
  const handlePrintSalary = (record) => {
    const printWindow = window.open('', '_blank');
    const total = record.total_salary || 0;
    const paid = record.paid_amount || 0;
    const pending = total - paid;
    const paidPercent = total > 0 ? (paid / total) * 100 : 0;
    
    const paymentRows = Array.isArray(record.payments) && record.payments.length > 0
      ? record.payments.map(p => `
        <tr>
          <td>${formatDateTime(p.date)}</td>
          <td>₹${p.amount?.toLocaleString() || 0}</td>
          <td>${p.remarks || "Salary Payment"}</td>
          <td>${p.receipt_no || "N/A"}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4" style="text-align: center;">No payments recorded</td></tr>';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Details - ${selectedTeacher?.name} - ${record.month} ${record.year}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 40px;
            background: white;
            color: #1e293b;
          }
          .print-container {
            max-width: 900px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #22c55e;
          }
          .header h1 {
            font-size: 28px;
            color: #1a472a;
            margin-bottom: 8px;
          }
          .header p {
            color: #64748b;
            font-size: 14px;
          }
          .school-name {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 8px;
          }
          .teacher-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
          }
          .teacher-info h3 {
            font-size: 18px;
            margin-bottom: 12px;
            color: #1e293b;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }
          .info-item {
            font-size: 13px;
          }
          .info-label {
            font-weight: 600;
            color: #475569;
          }
          .info-value {
            color: #1e293b;
            margin-top: 4px;
          }
          .salary-summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .summary-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 16px;
            border-radius: 12px;
            text-align: center;
          }
          .summary-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .summary-amount {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
          }
          .summary-amount.paid {
            color: #22c55e;
          }
          .summary-amount.pending {
            color: #f97316;
          }
          .progress-section {
            margin-bottom: 24px;
          }
          .progress-bar {
            background: #e2e8f0;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            margin-top: 8px;
          }
          .progress-fill {
            background: linear-gradient(90deg, #22c55e, #16a34a);
            height: 100%;
            width: ${paidPercent}%;
            border-radius: 6px;
          }
          .progress-text {
            font-size: 12px;
            color: #64748b;
            margin-top: 8px;
            text-align: right;
          }
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .payment-table th {
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
          }
          .payment-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body {
              padding: 20px;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>📄 Salary Statement</h1>
            <p>${record.month} ${record.year}</p>
            <div class="school-name">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="teacher-info">
            <h3>👨‍🏫 Teacher Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${selectedTeacher?.name || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Subject</div>
                <div class="info-value">${selectedTeacher?.subject || "Not set"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Course</div>
                <div class="info-value">${selectedTeacher?.course_name || "All Classes"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${selectedTeacher?.email || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${selectedTeacher?.phone || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Monthly Salary</div>
                <div class="info-value">₹${(selectedTeacher?.salary || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div class="salary-summary">
            <div class="summary-card">
              <div class="summary-label">Total Salary</div>
              <div class="summary-amount">₹${total.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Paid Amount</div>
              <div class="summary-amount paid">₹${paid.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Pending Balance</div>
              <div class="summary-amount pending">₹${pending.toLocaleString()}</div>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <div class="progress-text">${paidPercent.toFixed(1)}% Paid</div>
          </div>
          
          <h3 style="margin: 20px 0 12px 0;">📋 Payment History</h3>
          <table class="payment-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Remarks</th>
                <th>Receipt No.</th>
              </tr>
            </thead>
            <tbody>
              ${paymentRows}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is a computer generated document. No signature required.</p>
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setForm({
      month: record.month,
      year: record.year,
      total_salary: record.total_salary,
      paid_amount: record.paid_amount,
    });
    setModalType("edit");
    setShowModal(true);
  };

  // Styles object without @media queries
  const styles = {
    container: {
      padding: isMobile ? "16px" : "24px",
      background: "#f5f7fb",
      minHeight: "calc(100vh - 70px)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    header: {
      marginBottom: isMobile ? "20px" : "24px",
    },
    title: {
      fontSize: isMobile ? "24px" : "28px",
      fontWeight: "700",
      color: "#1e293b",
      margin: 0,
    },
    subtitle: {
      fontSize: "14px",
      color: "#64748b",
      marginTop: "6px",
    },
    toastSuccess: {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      padding: isMobile ? "10px 16px" : "12px 20px",
      borderRadius: "12px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      fontSize: isMobile ? "13px" : "14px",
      ...(isMobile && {
        top: "auto",
        bottom: "20px",
        right: "20px",
      }),
    },
    toastError: {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      padding: isMobile ? "10px 16px" : "12px 20px",
      borderRadius: "12px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      fontSize: isMobile ? "13px" : "14px",
      ...(isMobile && {
        top: "auto",
        bottom: "20px",
        right: "20px",
      }),
    },
    teacherSelector: {
      marginBottom: "24px",
      maxWidth: isMobile ? "100%" : "400px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      background: "white",
      outline: "none",
      transition: "all 0.2s",
    },
    teacherCard: {
      background: "white",
      borderRadius: "20px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginBottom: "24px",
      flexWrap: "wrap",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      ...(isMobile && {
        flexDirection: "column",
        textAlign: "center",
      }),
    },
    teacherAvatar: {
      width: isMobile ? "70px" : "80px",
      height: isMobile ? "70px" : "80px",
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
      fontSize: isMobile ? "28px" : "32px",
      color: "white",
    },
    teacherInfo: {
      flex: 1,
      ...(isMobile && {
        textAlign: "center",
      }),
    },
    teacherName: {
      margin: "0 0 8px 0",
      fontSize: isMobile ? "18px" : "20px",
      color: "#1e293b",
    },
    teacherText: {
      margin: "4px 0",
      fontSize: "13px",
      color: "#64748b",
    },
    addBtn: {
      padding: isMobile ? "12px" : "10px 20px",
      width: isMobile ? "100%" : "auto",
      background: "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: isMobile ? "14px" : "13px",
      transition: "all 0.2s",
    },
    recordsCard: {
      background: "white",
      borderRadius: "20px",
      padding: isMobile ? "16px" : "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },
    recordsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      flexWrap: "wrap",
      gap: "10px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      margin: 0,
      color: "#1e293b",
    },
    recordCount: {
      background: "#f1f5f9",
      color: "#475569",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
    },
    loadingState: {
      textAlign: "center",
      padding: "48px",
      color: "#94a3b8",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "3px solid #e2e8f0",
      borderTopColor: "#22c55e",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 16px",
    },
    emptyState: {
      textAlign: "center",
      padding: isMobile ? "32px" : "48px",
      color: "#94a3b8",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px",
      opacity: 0.6,
    },
    recordsList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    recordItem: {
      background: "#f8fafc",
      borderRadius: "16px",
      padding: isMobile ? "16px" : "20px",
      transition: "all 0.2s",
    },
    recordHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "16px",
      flexWrap: "wrap",
      gap: "12px",
    },
    recordHeaderLeft: {
      flex: 1,
    },
    recordMonth: {
      margin: "0 0 8px 0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
    },
    recordActions: {
      display: "flex",
      gap: "8px",
    },
    editRecordBtn: {
      padding: "4px 12px",
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    deleteRecordBtn: {
      padding: "4px 12px",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    printRecordBtn: {
      padding: "4px 12px",
      background: "#8b5cf6",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    statusPaid: {
      padding: "4px 12px",
      background: "#dcfce7",
      color: "#166534",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      whiteSpace: "nowrap",
    },
    statusPartial: {
      padding: "4px 12px",
      background: "#ffedd5",
      color: "#9a3412",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      whiteSpace: "nowrap",
    },
    statusPending: {
      padding: "4px 12px",
      background: "#fee2e2",
      color: "#991b1b",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      whiteSpace: "nowrap",
    },
    recordDetails: {
      marginTop: "8px",
    },
    recordAmounts: {
      display: "flex",
      gap: isMobile ? "12px" : "20px",
      marginBottom: "12px",
      flexWrap: "wrap",
    },
    amountCard: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    amountLabel: {
      fontSize: "11px",
      color: "#64748b",
      textTransform: "uppercase",
    },
    amountValue: {
      fontSize: isMobile ? "16px" : "18px",
      fontWeight: "700",
    },
    progressBar: {
      height: "8px",
      background: "#e2e8f0",
      borderRadius: "4px",
      overflow: "hidden",
      marginBottom: "16px",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #22c55e, #16a34a)",
      borderRadius: "4px",
      transition: "width 0.3s",
    },
    paymentHistory: {
      marginTop: "16px",
      paddingTop: "16px",
      borderTop: "1px solid #e2e8f0",
    },
    paymentHistoryTitle: {
      fontSize: "12px",
      display: "block",
      marginBottom: "12px",
      color: "#475569",
    },
    paymentItem: {
      display: "flex",
      gap: "16px",
      fontSize: "12px",
      padding: "8px 0",
      color: "#64748b",
      flexWrap: "wrap",
      alignItems: "center",
      borderBottom: "1px solid #e2e8f0",
      ...(isMobile && {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "6px",
        padding: "12px 0",
      }),
    },
    paymentDate: {
      minWidth: isMobile ? "auto" : "120px",
    },
    paymentAmount: {
      fontWeight: "600",
      color: "#22c55e",
    },
    paymentRemarks: {
      flex: 1,
    },
    paymentReceipt: {
      fontSize: "10px",
      color: "#94a3b8",
    },
    payBtn: {
      marginTop: "16px",
      padding: "10px 20px",
      width: "100%",
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      transition: "all 0.2s",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "white",
      borderRadius: "24px",
      width: isMobile ? "95%" : "500px",
      maxWidth: "500px",
      maxHeight: "90vh",
      overflow: "auto",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: isMobile ? "16px 20px" : "20px 24px",
      borderBottom: "1px solid #e2e8f0",
    },
    modalTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
    },
    modalClose: {
      background: "none",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
      color: "#94a3b8",
    },
    modalBody: {
      padding: isMobile ? "16px 20px" : "24px",
    },
    modalFooter: {
      padding: isMobile ? "12px 20px" : "16px 24px",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
    },
    infoBox: {
      background: "#f8fafc",
      padding: "16px",
      borderRadius: "12px",
      marginBottom: "20px",
    },
    infoText: {
      margin: "8px 0",
      fontSize: "13px",
    },
    cancelBtn: {
      padding: "10px 24px",
      background: "#f1f5f9",
      color: "#475569",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "13px",
    },
    confirmBtn: {
      padding: "10px 24px",
      background: "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
      opacity: loading ? 0.6 : 1,
      cursor: loading ? "not-allowed" : "pointer",
    },
  };

  if (loading && teachers.length === 0) {
    return (
      <div style={styles.loadingState}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💰 Teacher Salary Management</h2>
        <p style={styles.subtitle}>Manage teacher salaries, track payments, and view history</p>
      </div>

      {showSuccess && <div style={styles.toastSuccess}>{showSuccess}</div>}
      {showError && <div style={styles.toastError}>{showError}</div>}

      <div style={styles.teacherSelector}>
        <label style={styles.label}>Select Teacher</label>
        <select
          style={styles.select}
          value={selectedTeacher?.id || ""}
          onChange={e => {
            const teacher = teachers.find(t => t.id === Number(e.target.value));
            handleSelectTeacher(teacher);
          }}
        >
          <option value="">-- Select Teacher --</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} - {t.subject || "Not set"} ({t.course_name || "All Classes"})
            </option>
          ))}
        </select>
      </div>

      {selectedTeacher && (
        <>
          <div style={styles.teacherCard}>
            <div style={styles.teacherAvatar}>
              {selectedTeacher.image_url ? (
                <img src={selectedTeacher.image_url} style={styles.avatar} alt={selectedTeacher.name} />
              ) : (
                <div style={styles.avatarPlaceholder}>👨‍🏫</div>
              )}
            </div>
            <div style={styles.teacherInfo}>
              <h3 style={styles.teacherName}>{selectedTeacher.name}</h3>
              <p style={styles.teacherText}>📚 {selectedTeacher.subject || "Not set"} | 🏫 {selectedTeacher.course_name || "All Classes"}</p>
              <p style={styles.teacherText}>💰 Monthly Salary: <strong>₹{selectedTeacher.salary?.toLocaleString() || 0}</strong></p>
              <p style={styles.teacherText}>📧 {selectedTeacher.email} | 📞 {selectedTeacher.phone || "N/A"}</p>
            </div>
            <button style={styles.addBtn} onClick={() => { setModalType("add"); setShowModal(true); }}>
              {isMobile ? "➕ Add" : "+ Add Salary Record"}
            </button>
          </div>

          <div style={styles.recordsCard}>
            <div style={styles.recordsHeader}>
              <h3 style={styles.sectionTitle}>📊 Salary Records</h3>
              {salaryRecords.length > 0 && (
                <span style={styles.recordCount}>{salaryRecords.length} records</span>
              )}
            </div>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p>Loading salary records...</p>
              </div>
            ) : salaryRecords.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <p>No salary records found. Add one to get started.</p>
              </div>
            ) : (
              <div style={styles.recordsList}>
                {salaryRecords.map(record => {
                  const total = record.total_salary || 0;
                  const paid = record.paid_amount || 0;
                  const pending = total - paid;
                  const paidPercent = total > 0 ? (paid / total) * 100 : 0;
                  
                  return (
                    <div key={record.id} style={styles.recordItem}>
                      <div style={styles.recordHeader}>
                        <div style={styles.recordHeaderLeft}>
                          <h4 style={styles.recordMonth}>{record.month} {record.year}</h4>
                          <div style={styles.recordActions}>
                            <button 
                              style={styles.editRecordBtn}
                              onClick={() => openEditModal(record)}
                            >
                              {isMobile ? "✏️" : "Edit"}
                            </button>
                            <button 
                              style={styles.printRecordBtn}
                              onClick={() => handlePrintSalary(record)}
                            >
                              {isMobile ? "🖨️" : "Print"}
                            </button>
                            <button 
                              style={styles.deleteRecordBtn}
                              onClick={() => handleDeleteSalary(record)}
                            >
                              {isMobile ? "🗑️" : "Delete"}
                            </button>
                          </div>
                        </div>
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
                          <div style={styles.amountCard}>
                            <span style={styles.amountLabel}>Total</span>
                            <strong style={styles.amountValue}>₹{total.toLocaleString()}</strong>
                          </div>
                          <div style={styles.amountCard}>
                            <span style={styles.amountLabel}>Paid</span>
                            <strong style={{...styles.amountValue, color: "#22c55e"}}>₹{paid.toLocaleString()}</strong>
                          </div>
                          <div style={styles.amountCard}>
                            <span style={styles.amountLabel}>Pending</span>
                            <strong style={{...styles.amountValue, color: pending > 0 ? "#f97316" : "#22c55e"}}>
                              ₹{pending.toLocaleString()}
                            </strong>
                          </div>
                        </div>
                        <div style={styles.progressBar}>
                          <div style={{ ...styles.progressFill, width: `${paidPercent}%` }} />
                        </div>
                        
                        {Array.isArray(record.payments) && record.payments.length > 0 && (
                          <div style={styles.paymentHistory}>
                            <strong style={styles.paymentHistoryTitle}>Payment History:</strong>
                            {record.payments.map(p => (
                              <div key={p.id} style={styles.paymentItem}>
                                <div style={styles.paymentDate}>📅 {formatDateTime(p.date)}</div>
                                <div style={styles.paymentAmount}>💰 ₹{p.amount?.toLocaleString() || 0}</div>
                                <div style={styles.paymentRemarks}>📝 {p.remarks || "Salary Payment"}</div>
                                <div style={styles.paymentReceipt}>🧾 {p.receipt_no}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {pending > 0 && (
                          <button 
                            style={styles.payBtn}
                            onClick={() => {
                              setModalType("payment");
                              setSelectedRecord(record);
                              setShowModal(true);
                            }}
                          >
                            {isMobile ? "💳 Pay" : "+ Make Payment"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showModal && selectedTeacher && (
        <div style={styles.modalOverlay} onClick={() => {
          setShowModal(false);
          setSelectedRecord(null);
          setForm({ month: "", year: new Date().getFullYear(), total_salary: "", paid_amount: "" });
          setPaymentAmount("");
          setPaymentRemarks("");
        }}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modalType === "add" && "Add Salary Record"}
                {modalType === "edit" && "✏️ Edit Salary Record"}
                {modalType === "payment" && "💵 Make Payment"}
              </h3>
              <button style={styles.modalClose} onClick={() => {
                setShowModal(false);
                setSelectedRecord(null);
              }}>✖</button>
            </div>
            <div style={styles.modalBody}>
              {(modalType === "add" || modalType === "edit") ? (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Month *</label>
                    <select
                      style={styles.select}
                      value={form.month}
                      onChange={e => setForm({ ...form, month: e.target.value })}
                    >
                      <option value="">Select Month</option>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Year *</label>
                    <select
                      style={styles.select}
                      value={form.year}
                      onChange={e => setForm({ ...form, year: e.target.value })}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Salary *</label>
                    <input
                      type="number"
                      min="1"
                      style={styles.input}
                      placeholder="Enter total salary amount"
                      value={form.total_salary}
                      onChange={e => setForm({ ...form, total_salary: e.target.value })}
                    />
                  </div>
                  {modalType === "add" && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Initial Payment (Optional)</label>
                      <input
                        type="number"
                        min="0"
                        max={form.total_salary}
                        style={styles.input}
                        placeholder="Enter paid amount"
                        value={form.paid_amount}
                        onChange={e => setForm({ ...form, paid_amount: e.target.value })}
                      />
                    </div>
                  )}
                  {modalType === "edit" && (
                    <div style={styles.infoBox}>
                      <p style={styles.infoText}>⚠️ Note: Already paid amount (₹{(selectedRecord?.paid_amount || 0).toLocaleString()}) cannot be changed</p>
                      <p style={styles.infoText}>💰 Already Paid: <strong>₹{(selectedRecord?.paid_amount || 0).toLocaleString()}</strong></p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={styles.infoBox}>
                    <p style={styles.infoText}><strong>Teacher:</strong> {selectedTeacher.name}</p>
                    <p style={styles.infoText}><strong>Month:</strong> {selectedRecord?.month} {selectedRecord?.year}</p>
                    <p style={styles.infoText}><strong>Total Salary:</strong> ₹{selectedRecord?.total_salary?.toLocaleString() || 0}</p>
                    <p style={styles.infoText}><strong>Already Paid:</strong> ₹{selectedRecord?.paid_amount?.toLocaleString() || 0}</p>
                    <p style={styles.infoText}><strong>Pending Balance:</strong> <strong style={{ color: "#f97316", fontSize: "18px" }}>₹{(selectedRecord?.pending_amount || 0).toLocaleString()}</strong></p>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Payment Amount *</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedRecord?.pending_amount || 0}
                      style={styles.input}
                      placeholder="Enter payment amount"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Remarks</label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Payment remarks (optional)"
                      value={paymentRemarks}
                      onChange={e => setPaymentRemarks(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => {
                setShowModal(false);
                setSelectedRecord(null);
              }}>Cancel</button>
              <button 
                style={styles.confirmBtn} 
                onClick={() => {
                  if (modalType === "add") handleAddSalary();
                  else if (modalType === "edit") handleEditSalary();
                  else if (modalType === "payment") handlePayment();
                }}
                disabled={loading}
              >
                {loading ? "Processing..." : (modalType === "add" ? "Add Record" : modalType === "edit" ? "Update Record" : "Make Payment")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add keyframe animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-1px);
    transition: transform 0.2s;
  }
  button:active {
    transform: translateY(0);
  }
  input:focus, select:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default TeacherSalaryAdmin;