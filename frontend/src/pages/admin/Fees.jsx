import { useEffect, useState } from "react";

function Fees() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [feeTotalEdit, setFeeTotalEdit] = useState("");
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const [showSuccess, setShowSuccess] = useState("");
  const [showError, setShowError] = useState("");
  const [errors, setErrors] = useState({});

  const API = "http://127.0.0.1:8000/api/";

  // FIX: Style injection with cleanup
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } button:hover { transform: translateY(-2px); transition: transform 0.2s; } button:active { transform: translateY(0); } .table-row:hover { background: #f8fafc; }`;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  // FIX 1: Safe fetch with array validation
  const fetchAllData = () => {
    Promise.all([
      fetch(API + "students/").then(r => r.json()),
      fetch(API + "courses/").then(r => r.json()),
      fetch(API + "fees/").then(r => r.json()),
      fetch(API + "payments/").then(r => r.json()),
    ]).then(([s, c, f, p]) => {
      // Safe array assignment
      setStudents(Array.isArray(s) ? s : []);
      setCourses(Array.isArray(c) ? c : []);
      setFees(Array.isArray(f) ? f : []);
      setPayments(Array.isArray(p) ? p : []);
    }).catch(err => {
      console.error("Fetch error:", err);
      setShowError("Failed to load data. Please refresh the page.");
      setTimeout(() => setShowError(""), 3000);
    });
  };

  const getStudent = (id) => students.find((s) => s.id === id);
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id == courseId);
    return course ? course.name : "Unknown";
  };

  const getPaid = (feeId) =>
    payments
      .filter((p) => p.fees === feeId)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleSelectStudent = (idStr) => {
    setSelectedStudentId(idStr);
    const id = Number(idStr);
    const student = students.find(s => s.id === id);
    setSelectedStudent(student);
    const fee = fees.find((f) => f.student === id);
    if (fee) {
      setSelectedFee(fee);
      setFeeTotalEdit(fee.total_amount);
    } else {
      setSelectedFee(null);
      setFeeTotalEdit("");
    }
    setErrors({});
  };

  // FIX 2: Improved validation with negative amount check
  const validatePayment = () => {
    const newErrors = {};
    if (!selectedStudentId) newErrors.student = "Please select a student";
    if (!paymentAmount) newErrors.amount = "Please enter payment amount";
    else if (Number(paymentAmount) <= 0) newErrors.amount = "Amount must be greater than 0";
    else if (isNaN(Number(paymentAmount))) newErrors.amount = "Please enter a valid number";
    
    const fee = fees.find((f) => f.student === Number(selectedStudentId));
    if (fee && paymentAmount) {
      const paid = getPaid(fee.id);
      const balance = fee.total_amount - paid;
      if (Number(paymentAmount) > balance) {
        newErrors.amount = `Amount exceeds balance (Remaining: ₹${balance.toLocaleString()})`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFeeTotal = () => {
    const newErrors = {};
    if (!feeTotalEdit) newErrors.total = "Please enter total amount";
    else if (Number(feeTotalEdit) <= 0) newErrors.total = "Total must be greater than 0";
    else if (isNaN(Number(feeTotalEdit))) newErrors.total = "Please enter a valid number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FIX 3: Improved addPayment with better error handling
  const addPayment = async () => {
    if (!validatePayment()) return;

    const fee = fees.find((f) => f.student === Number(selectedStudentId));
    if (!fee) {
      setShowError("No fee record found for this student");
      setTimeout(() => setShowError(""), 2500);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API + "payments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fees: fee.id,
          amount: Number(paymentAmount),
          remarks: paymentRemarks || `Payment for ${selectedStudent?.name}`,
        }),
      });

      const data = await response.json();
      
      // Better response handling
      if (response.ok && data) {
        setShowSuccess(`✅ Payment of ₹${Number(paymentAmount).toLocaleString()} added successfully`);
        
        // Refresh data
        const [feesRes, paymentsRes] = await Promise.all([
          fetch(API + "fees/").then(r => r.json()),
          fetch(API + "payments/").then(r => r.json()),
        ]);
        setFees(Array.isArray(feesRes) ? feesRes : []);
        setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);
        
        const updatedFee = feesRes?.find((x) => x.id === fee.id);
        setSelectedFee(updatedFee || fee);
        
        // Store receipt data with safe checks
        const totalPaid = (paymentsRes || [])
          .filter(p => p.fees === fee.id)
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        setReceiptData({
          ...data,
          student: selectedStudent,
          fee: updatedFee || fee,
          total_paid: totalPaid,
          remaining: ((updatedFee || fee).total_amount || 0) - totalPaid,
        });
        setShowReceiptModal(true);
        
        setPaymentAmount("");
        setPaymentRemarks("");
        setErrors({});
        setTimeout(() => setShowSuccess(""), 3000);
      } else {
        setShowError(data?.error || data?.message || "Error adding payment");
        setTimeout(() => setShowError(""), 2500);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setShowError("Network error. Please check your connection.");
      setTimeout(() => setShowError(""), 2500);
    } finally {
      setLoading(false);
    }
  };

  // FIX 4: Safe fee update with validation
  const updateFeeTotal = async () => {
    if (!validateFeeTotal()) return;
    if (!selectedFee) {
      setShowError("No fee record selected");
      setTimeout(() => setShowError(""), 2500);
      return;
    }

    const total = Number(feeTotalEdit);
    if (total <= 0) {
      setShowError("Total fee must be greater than 0");
      setTimeout(() => setShowError(""), 2500);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API + `fees/${selectedFee.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_amount: total }),
      });
      const data = await response.json();
      
      if (response.ok && data) {
        setShowSuccess(`✅ Total fee updated to ₹${total.toLocaleString()}`);
        const newFees = fees.map((f) => (f.id === selectedFee.id ? data : f));
        setFees(newFees);
        setSelectedFee(data);
        setErrors({});
        setTimeout(() => setShowSuccess(""), 2500);
      } else {
        setShowError(data?.error || "Error updating fee");
        setTimeout(() => setShowError(""), 2500);
      }
    } catch (err) {
      console.error("Update error:", err);
      setShowError("Network error occurred");
      setTimeout(() => setShowError(""), 2500);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeIST = (dateString) => {
    if (!dateString) return "Invalid date";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
    return formatDateTimeIST(dateString);
  };

  const printPaymentReceipt = (payment, student, fee) => {
    const totalPaid = payments
      .filter(p => p.fees === fee.id && new Date(p.date) <= new Date(payment.date))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const remaining = (fee.total_amount || 0) - totalPaid;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - Paradise Islamic Pre-School</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
          .receipt { max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
          .receipt-header { background: linear-gradient(135deg, #1a472a 0%, #2e5c3a 100%); color: white; padding: 30px; text-align: center; }
          .school-name { font-size: 28px; font-weight: bold; }
          .receipt-title { font-size: 24px; margin-top: 15px; }
          .receipt-body { padding: 30px; }
          .student-info { background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; }
          .info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 15px; }
          .info-label { font-weight: 600; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f0f0f0; padding: 12px; text-align: left; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; }
          .amount-row { margin-top: 20px; padding-top: 15px; border-top: 2px solid #ddd; }
          .amount-item { display: flex; justify-content: space-between; padding: 8px 0; }
          .amount-total { font-weight: bold; font-size: 18px; color: #1a472a; border-top: 2px solid #d4af37; margin-top: 10px; padding-top: 10px; }
          .signature { margin-top: 30px; display: flex; justify-content: space-between; }
          .receipt-footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { padding: 0; background: white; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <div class="school-name">🏫 PARADISE ISLAMIC PRE-SCHOOL</div>
            <div class="receipt-title">💰 PAYMENT RECEIPT</div>
          </div>
          <div class="receipt-body">
            <div class="student-info">
              <h3>Student Information</h3>
              <div class="info-grid">
                <div class="info-label">Student Name:</div><div>${student?.name || ''}</div>
                <div class="info-label">Admission No:</div><div>${student?.admission_no || ''}</div>
                <div class="info-label">Course/Class:</div><div>${getCourseName(student?.course) || ''}</div>
              </div>
            </div>
            <h3>Payment Details</h3>
            <table>
              <thead><tr><th>Receipt No</th><th>Date & Time</th><th>Amount (₹)</th><th>Remarks</th></tr></thead>
              <tbody>
                <tr>
                  <td>#${payment.id}</td>
                  <td>${formatDateTimeIST(payment.date)}</td>
                  <td><strong>₹${(payment.amount || 0).toLocaleString()}</strong></td>
                  <td>${payment.remarks || 'Fee Payment'}</td>
                </tr>
              </tbody>
            </table>
            <div class="amount-row">
              <div class="amount-item"><strong>Total Fee:</strong> <span>₹${(fee.total_amount || 0).toLocaleString()}</span></div>
              <div class="amount-item"><strong>Previous Paid:</strong> <span>₹${((totalPaid - (payment.amount || 0)) || 0).toLocaleString()}</span></div>
              <div class="amount-item"><strong>Current Payment:</strong> <span>₹${(payment.amount || 0).toLocaleString()}</span></div>
              <div class="amount-item amount-total"><strong>Total Paid:</strong> <span>₹${(totalPaid || 0).toLocaleString()}</span></div>
              <div class="amount-item"><strong>Remaining Balance:</strong> <span>₹${(remaining || 0).toLocaleString()}</span></div>
            </div>
            <div class="signature">
              <div>_____________________<br/>Student/Parent Signature</div>
              <div>_____________________<br/>Authorized Signatory</div>
            </div>
          </div>
          <div class="receipt-footer">
            <p>This is a computer-generated receipt. Thank you for your payment!</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const uniqueCourses = Array.from(
    new Set(students.map((s) => s.course_name))
  ).filter(Boolean);

  // FIX 5: CORRECTED STATUS FILTERING - THIS IS THE MAIN FIX
  const filteredFees = fees.filter((f) => {
    const student = getStudent(f.student);
    if (!student) return false;

    const matchSearch = student.name?.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter ? student.course_name === courseFilter : true;
    
    // FIX: Handle status filtering properly for "Pending" status
    let matchStatus = true;
    if (statusFilter === "Paid") {
      matchStatus = f.status === "Paid";
    } else if (statusFilter === "Pending") {
      // Include both "Pending" and "Partial" for pending filter
      // Since both indicate money is still owed
      matchStatus = f.status === "Pending" || f.status === "Partial";
    }
    
    return matchSearch && matchStatus && matchCourse;
  });

  const totalCollected = filteredFees.reduce((sum, f) => sum + getPaid(f.id), 0);
  const totalBalance = filteredFees.reduce((sum, f) => sum + (f.total_amount - getPaid(f.id)), 0);
  const fullyPaidCount = filteredFees.filter(f => f.status === "Paid").length;
  const pendingCount = filteredFees.filter(f => f.status === "Pending" || f.status === "Partial").length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>💰 Fee Management System</h2>
          <p style={styles.headerSubtitle}>Track student fees, manage payments, and generate receipts</p>
        </div>
      </div>

      {showSuccess && <div style={styles.toastSuccess}>{showSuccess}</div>}
      {showError && <div style={styles.toastError}>{showError}</div>}

      {showReceiptModal && receiptData && (
        <div style={styles.modalOverlay} onClick={() => setShowReceiptModal(false)}>
          <div style={styles.receiptModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.receiptModalHeader}>
              <h3>🧾 Payment Receipt</h3>
              <button style={styles.modalCloseBtn} onClick={() => setShowReceiptModal(false)}>✖</button>
            </div>
            <div style={styles.receiptPreview}>
              <div style={styles.receiptCard}>
                <div style={styles.receiptSchoolHeader}>
                  <h4>🏫 PARADISE ISLAMIC PRE-SCHOOL</h4>
                  <p>Pullur, Tirur - 676102</p>
                </div>
                <div style={styles.receiptContent}>
                  <p><strong>Receipt No:</strong> #{receiptData.id}</p>
                  <p><strong>Date:</strong> {formatDateTimeIST(receiptData.date)}</p>
                  <p><strong>Student:</strong> {receiptData.student?.name}</p>
                  <p><strong>Admission No:</strong> {receiptData.student?.admission_no}</p>
                  <p><strong>Amount Paid:</strong> <span style={{color: "#22c55e", fontSize: "20px", fontWeight: "bold"}}>₹{(receiptData.amount || 0).toLocaleString()}</span></p>
                  <p><strong>Remarks:</strong> {receiptData.remarks || "Fee Payment"}</p>
                  <div style={styles.receiptBalance}>
                    <span>Total Paid: ₹{(receiptData.total_paid || 0).toLocaleString()}</span>
                    <span>Balance: ₹{(receiptData.remaining || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.receiptModalFooter}>
              <button style={styles.printBtn} onClick={() => {
                printPaymentReceipt(receiptData, receiptData.student, receiptData.fee);
                setShowReceiptModal(false);
              }}>🖨️ Print Receipt</button>
              <button style={styles.closeBtn} onClick={() => setShowReceiptModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.mainGrid}>
        <div style={styles.leftPanel}>
          <div style={styles.filtersCard}>
            <div style={styles.filtersRow}>
              <div style={styles.filterGroup}>
                <span style={styles.filterIcon}>🔍</span>
                <input
                  style={styles.input}
                  placeholder="Search by student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">📊 All Status</option>
                <option value="Paid">✅ Fully Paid</option>
                <option value="Pending">⏳ Pending / Partial</option>
              </select>
              <select style={styles.select} value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                <option value="">🏫 All Classes</option>
                {uniqueCourses.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>

          <div style={styles.summaryRow}>
            <div style={styles.summaryCard}><div style={styles.summaryIcon}>👨‍🎓</div><div style={styles.summaryContent}><div style={styles.summaryLabel}>Total Students</div><div style={styles.summaryValue}>{filteredFees.length}</div></div></div>
            <div style={styles.summaryCard}><div style={styles.summaryIcon}>✅</div><div style={styles.summaryContent}><div style={styles.summaryLabel}>Fully Paid</div><div style={styles.summaryValue}>{fullyPaidCount}</div></div></div>
            <div style={styles.summaryCard}><div style={styles.summaryIcon}>⏳</div><div style={styles.summaryContent}><div style={styles.summaryLabel}>Pending</div><div style={styles.summaryValue}>{pendingCount}</div></div></div>
            <div style={styles.summaryCard}><div style={styles.summaryIcon}>💰</div><div style={styles.summaryContent}><div style={styles.summaryLabel}>Total Collected</div><div style={styles.summaryValue}>₹{totalCollected.toLocaleString()}</div></div></div>
            <div style={styles.summaryCard}><div style={styles.summaryIcon}>⚠️</div><div style={styles.summaryContent}><div style={styles.summaryLabel}>Total Balance Pending</div><div style={styles.summaryValuePending}>₹{totalBalance.toLocaleString()}</div></div></div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableHeader}><h3 style={styles.tableTitle}>📋 Fee Records</h3><span style={styles.tableCount}>{filteredFees.length} records</span></div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr style={styles.tableHeadRow}><th style={styles.th}>Student</th><th style={styles.th}>Class</th><th style={styles.th}>Total</th><th style={styles.th}>Paid</th><th style={styles.th}>Balance</th><th style={styles.th}>Status</th></tr></thead>
                <tbody>
                  {filteredFees.map((f) => {
                    const student = getStudent(f.student);
                    const paid = getPaid(f.id);
                    const balance = (f.total_amount || 0) - paid;
                    const paidPercent = f.total_amount > 0 ? (paid / f.total_amount) * 100 : 0;
                    return (
                      <tr key={f.id} style={selectedFee && selectedFee.id === f.id ? styles.rowActive : styles.tableRow} onClick={() => { setSelectedStudentId(String(f.student)); setSelectedStudent(student); setSelectedFee(f); setFeeTotalEdit(f.total_amount); setErrors({}); }}>
                        <td style={styles.td}><div style={styles.studentCell}>{student?.image_url ? (<img src={student.image_url} style={styles.studentImage} alt={student.name} />) : (<div style={styles.studentAvatarFallback}>{student?.name?.charAt(0)}</div>)}{student?.name}<div style={styles.studentId}>#{student?.admission_no}</div></div></td>
                        <td style={styles.td}><span style={styles.classBadge}>{student?.course_name || "-"}</span></td>
                        <td style={styles.td}>₹{(f.total_amount || 0).toLocaleString()}</td>
                        <td style={styles.td}>₹{paid.toLocaleString()}</td>
                        <td style={styles.td}><span style={balance === 0 ? styles.balancePaid : styles.balancePending}>₹{balance.toLocaleString()}</span></td>
                        <td style={styles.td}><span style={f.status === "Paid" ? styles.statusPaid : styles.statusPending}>{f.status === "Paid" ? "✅ Paid" : f.status === "Partial" ? "⚠️ Partial" : "⏳ Pending"}</span>{f.status !== "Paid" && (<div style={styles.progressBar}><div style={{...styles.progressFill, width: `${paidPercent}%`}} /></div>)}</td>
                      </tr>
                    );
                  })}
                  {filteredFees.length === 0 && (<tr><td colSpan="6" style={styles.emptyRow}><div style={styles.emptyIcon}>📭</div><div>No fee records found</div></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.panelHeader}><h3 style={styles.panelTitle}>💰 Fee Details</h3><p style={styles.panelSubtitle}>Manage fee structure and track payments</p></div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Student</label>
            <select style={{...styles.select, borderColor: errors.student ? "#dc3545" : "#e2e8f0"}} value={selectedStudentId} onChange={(e) => handleSelectStudent(e.target.value)}>
              <option value="">-- Choose a student --</option>
              {students.map((s) => (<option key={s.id} value={s.id}>{s.name} - {s.admission_no} ({s.course_name})</option>))}
            </select>
            {errors.student && <span style={styles.errorText}>{errors.student}</span>}
          </div>

          {selectedFee && selectedStudent ? (
            <>
              <div style={styles.studentInfoCard}>
                <div style={styles.studentInfoHeader}>
                  <div style={styles.studentInfoAvatar}>
                    {selectedStudent.image_url ? (<img src={selectedStudent.image_url} style={styles.studentInfoImg} alt={selectedStudent.name} />) : (<span style={styles.studentInfoAvatarText}>{selectedStudent.name?.charAt(0)}</span>)}
                  </div>
                  <div style={styles.studentInfoContent}><h4 style={styles.studentInfoName}>{selectedStudent.name}</h4><p style={styles.studentInfoDetails}>📚 {selectedStudent.course_name} • 🆔 {selectedStudent.admission_no}</p></div>
                </div>
              </div>

              <div style={styles.feeSummaryCard}>
                <div style={styles.feeSummaryRow}>
                  <div style={styles.feeSummaryItem}><div style={styles.feeSummaryLabel}>Total Fee</div><div style={styles.feeSummaryValue}>₹{(selectedFee.total_amount || 0).toLocaleString()}</div></div>
                  <div style={styles.feeSummaryItem}><div style={styles.feeSummaryLabel}>Amount Paid</div><div style={styles.feeSummaryValuePaid}>₹{getPaid(selectedFee.id).toLocaleString()}</div></div>
                  <div style={styles.feeSummaryItem}><div style={styles.feeSummaryLabel}>Remaining Balance</div><div style={getPaid(selectedFee.id) === selectedFee.total_amount ? styles.feeSummaryValuePaid : styles.feeSummaryValuePending}>₹{((selectedFee.total_amount || 0) - getPaid(selectedFee.id)).toLocaleString()}</div></div>
                </div>
                <div style={selectedFee.status === "Paid" ? styles.statusBadgePaid : styles.statusBadgePending}>
                  {selectedFee.status === "Paid" ? "🎉 Fully Paid" : selectedFee.status === "Partial" ? `⚠️ Partial Payment: ₹${((selectedFee.total_amount || 0) - getPaid(selectedFee.id)).toLocaleString()} remaining` : `⏳ Pending: ₹${((selectedFee.total_amount || 0) - getPaid(selectedFee.id)).toLocaleString()} remaining`}
                </div>
              </div>

              <div style={styles.formCard}>
                <label style={styles.label}>Update Total Fee Amount</label>
                <div style={styles.inputGroup}><span style={styles.inputGroupPrefix}>₹</span><input style={{...styles.input, ...styles.inputGroupField, borderColor: errors.total ? "#dc3545" : "#e2e8f0"}} type="number" min="1" placeholder="Enter total amount" value={feeTotalEdit} onChange={(e) => setFeeTotalEdit(e.target.value)} /><button style={styles.secondaryBtn} onClick={updateFeeTotal} disabled={loading}>Update</button></div>
                {errors.total && <span style={styles.errorText}>{errors.total}</span>}
              </div>

              <div style={styles.formCard}>
                <label style={styles.label}>Add New Payment</label>
                <div style={styles.inputGroup}><span style={styles.inputGroupPrefix}>₹</span><input style={{...styles.input, ...styles.inputGroupField, borderColor: errors.amount ? "#dc3545" : "#e2e8f0"}} type="number" min="1" placeholder="Enter payment amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} /><button style={styles.primaryBtn} onClick={addPayment} disabled={loading}>{loading ? "Processing..." : "+ Add Payment"}</button></div>
                <input style={{...styles.input, marginTop: "10px", width: "100%"}} type="text" placeholder="Remarks (optional)" value={paymentRemarks} onChange={(e) => setPaymentRemarks(e.target.value)} />
                {errors.amount && <span style={styles.errorText}>{errors.amount}</span>}
                <div style={styles.paymentHint}>💡 Payment will be recorded with backend timestamp (IST)</div>
              </div>

              <div style={styles.historyCard}>
                <div style={styles.historyHeader}><h4 style={styles.historyTitle}>📜 Payment History</h4><span style={styles.historyCount}>{payments.filter((p) => p.fees === selectedFee.id).length} transactions</span></div>
                <div style={styles.historyList}>
                  {payments.filter((p) => p.fees === selectedFee.id).sort((a, b) => new Date(b.date) - new Date(a.date)).map((p) => (
                    <div key={p.id} style={styles.historyItem}>
                      <div style={styles.historyItemLeft}>
                        <div style={styles.historyIcon}>💰</div>
                        <div>
                          <div style={styles.historyDate}>{formatDateTimeIST(p.date)}</div>
                          <div style={styles.historyTime}>{getRelativeTime(p.date)}</div>
                        </div>
                      </div>
                      <div style={styles.historyAmount}>+ ₹{(p.amount || 0).toLocaleString()}</div>
                      <button style={styles.receiptHistoryBtn} onClick={() => printPaymentReceipt(p, selectedStudent, selectedFee)}>🧾 Receipt</button>
                    </div>
                  ))}
                  {payments.filter((p) => p.fees === selectedFee.id).length === 0 && (<div style={styles.emptyHistory}><span>💸</span><p>No payments recorded yet</p><small>Add a payment to see it here</small></div>)}
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}><div style={styles.emptyStateIcon}>📌</div><h4 style={styles.emptyStateTitle}>No Student Selected</h4><p style={styles.emptyStateText}>Select a student from the dropdown or click on any row in the table to view and manage fee details.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "24px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", minHeight: "calc(100vh - 70px)", boxSizing: "border-box" },
  header: { marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" },
  headerTitle: { fontSize: "28px", fontWeight: "700", margin: 0, background: "linear-gradient(135deg, #1e293b 0%, #2d3a4e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px" },
  headerSubtitle: { marginTop: "6px", fontSize: "14px", color: "#64748b" },
  toastSuccess: { position: "fixed", top: "20px", right: "20px", padding: "12px 20px", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(34,197,94,0.2)", fontSize: "14px", fontWeight: "500", zIndex: 1000, animation: "slideIn 0.3s ease" },
  toastError: { position: "fixed", top: "20px", right: "20px", padding: "12px 20px", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(239,68,68,0.2)", fontSize: "14px", fontWeight: "500", zIndex: 1000, animation: "slideIn 0.3s ease" },
  mainGrid: { display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)", gap: "24px" },
  leftPanel: { display: "flex", flexDirection: "column", gap: "20px" },
  filtersCard: { background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  filtersRow: { display: "flex", gap: "12px", flexWrap: "wrap" },
  filterGroup: { flex: 1, display: "flex", alignItems: "center", background: "#f8fafc", borderRadius: "12px", padding: "0 12px", border: "1px solid #e2e8f0" },
  filterIcon: { fontSize: "16px", marginRight: "8px", color: "#94a3b8" },
  input: { flex: 1, padding: "10px 0", border: "none", background: "transparent", fontSize: "14px", outline: "none" },
  select: { padding: "10px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", background: "white", cursor: "pointer", outline: "none" },
  summaryRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  summaryCard: { background: "white", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  summaryIcon: { fontSize: "32px" }, summaryContent: { flex: 1 }, summaryLabel: { fontSize: "12px", color: "#64748b", fontWeight: "500" }, summaryValue: { fontSize: "24px", fontWeight: "700", color: "#1e293b" }, summaryValuePending: { fontSize: "24px", fontWeight: "700", color: "#f97316" },
  tableCard: { background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  tableHeader: { padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  tableTitle: { fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0 }, tableCount: { fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px" },
  tableWrapper: { overflowX: "auto" }, table: { width: "100%", borderCollapse: "collapse" }, tableHeadRow: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  tableRow: { cursor: "pointer", transition: "background 0.2s", borderBottom: "1px solid #f1f5f9", "&:hover": { background: "#f8fafc" } },
  rowActive: { background: "linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)", borderLeft: "3px solid #22c55e" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#334155" },
  studentCell: { display: "flex", alignItems: "center", gap: "12px" },
  studentImage: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" },
  studentAvatarFallback: { width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "16px" },
  studentId: { fontSize: "11px", color: "#94a3b8" },
  classBadge: { background: "#eef2ff", color: "#4f46e5", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", display: "inline-block" },
  balancePaid: { color: "#22c55e", fontWeight: "600" }, balancePending: { color: "#f97316", fontWeight: "600" },
  statusPaid: { display: "inline-block", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#dcfce7", color: "#166534" },
  statusPending: { display: "inline-block", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#ffedd5", color: "#9a3412" },
  progressBar: { marginTop: "6px", height: "4px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)", borderRadius: "4px", transition: "width 0.3s" },
  emptyRow: { textAlign: "center", padding: "48px", color: "#94a3b8" }, emptyIcon: { fontSize: "48px", marginBottom: "12px" },
  rightPanel: { background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 25px rgba(0,0,0,0.08)", position: "sticky", top: "20px" },
  panelHeader: { marginBottom: "24px", borderBottom: "2px solid #f1f5f9", paddingBottom: "16px" },
  panelTitle: { fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 }, panelSubtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  formGroup: { marginBottom: "20px" }, label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" },
  errorText: { display: "block", fontSize: "12px", color: "#dc2626", marginTop: "6px" },
  studentInfoCard: { background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: "16px", padding: "16px", marginBottom: "20px" },
  studentInfoHeader: { display: "flex", alignItems: "center", gap: "12px" },
  studentInfoAvatar: { width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  studentInfoImg: { width: "100%", height: "100%", objectFit: "cover" },
  studentInfoAvatarText: { fontSize: "24px", fontWeight: "600", color: "white" },
  studentInfoContent: { flex: 1 }, studentInfoName: { fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: 0 },
  studentInfoDetails: { fontSize: "12px", color: "#64748b", margin: "4px 0 0" },
  feeSummaryCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px", marginBottom: "20px" },
  feeSummaryRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" },
  feeSummaryItem: { textAlign: "center" }, feeSummaryLabel: { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  feeSummaryValue: { fontSize: "18px", fontWeight: "700", color: "#1e293b", marginTop: "4px" },
  feeSummaryValuePaid: { fontSize: "18px", fontWeight: "700", color: "#22c55e", marginTop: "4px" },
  feeSummaryValuePending: { fontSize: "18px", fontWeight: "700", color: "#f97316", marginTop: "4px" },
  statusBadgePaid: { textAlign: "center", padding: "10px", borderRadius: "12px", background: "#dcfce7", color: "#166534", fontSize: "13px", fontWeight: "600" },
  statusBadgePending: { textAlign: "center", padding: "10px", borderRadius: "12px", background: "#ffedd5", color: "#9a3412", fontSize: "13px", fontWeight: "600" },
  formCard: { marginBottom: "20px" }, inputGroup: { display: "flex", alignItems: "center", gap: "8px" },
  inputGroupPrefix: { background: "#f1f5f9", padding: "10px 12px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", color: "#475569" },
  inputGroupField: { flex: 1 }, primaryBtn: { padding: "10px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }, "&:disabled": { opacity: 0.6, cursor: "not-allowed", transform: "none" } },
  secondaryBtn: { padding: "10px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", color: "#475569", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", "&:hover": { background: "#f8fafc", transform: "translateY(-1px)" }, "&:disabled": { opacity: 0.6, cursor: "not-allowed" } },
  paymentHint: { fontSize: "11px", color: "#94a3b8", marginTop: "8px", fontStyle: "italic" },
  historyCard: { marginTop: "20px", borderTop: "2px solid #f1f5f9", paddingTop: "20px" },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  historyTitle: { fontSize: "14px", fontWeight: "600", color: "#1e293b", margin: 0 },
  historyCount: { fontSize: "11px", color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px" },
  historyList: { maxHeight: "280px", overflowY: "auto" },
  historyItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f8fafc", borderRadius: "12px", marginBottom: "8px", gap: "8px", flexWrap: "wrap" },
  historyItemLeft: { display: "flex", alignItems: "center", gap: "10px", flex: 1 }, historyIcon: { fontSize: "20px" },
  historyDate: { fontSize: "12px", fontWeight: "500", color: "#334155" }, historyTime: { fontSize: "10px", color: "#94a3b8" },
  historyAmount: { fontSize: "14px", fontWeight: "700", color: "#22c55e", minWidth: "80px" },
  receiptHistoryBtn: { padding: "4px 10px", background: "#d4af37", color: "#1a472a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "500", whiteSpace: "nowrap" },
  emptyHistory: { textAlign: "center", padding: "32px", color: "#94a3b8" },
  emptyState: { textAlign: "center", padding: "48px 24px" }, emptyStateIcon: { fontSize: "64px", marginBottom: "16px" },
  emptyStateTitle: { fontSize: "18px", fontWeight: "600", color: "#475569", marginBottom: "8px" }, emptyStateText: { fontSize: "13px", color: "#94a3b8" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  receiptModal: { background: "white", borderRadius: "20px", maxWidth: "500px", width: "90%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" },
  receiptModalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #e2e8f0" },
  modalCloseBtn: { background: "#dc3545", color: "white", border: "none", width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", fontSize: "16px" },
  receiptPreview: { padding: "20px" }, receiptCard: { background: "#f8fafc", borderRadius: "12px", padding: "20px" },
  receiptSchoolHeader: { textAlign: "center", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #d4af37", h4: { color: "#1a472a", marginBottom: "5px" }, p: { fontSize: "11px", color: "#666" } },
  receiptContent: { p: { marginBottom: "10px", fontSize: "14px" } }, receiptBalance: { marginTop: "15px", paddingTop: "10px", borderTop: "1px dashed #ddd", display: "flex", justifyContent: "space-between", fontWeight: "bold" },
  receiptModalFooter: { padding: "20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px", justifyContent: "flex-end" },
  printBtn: { padding: "8px 16px", background: "#1a472a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  closeBtn: { padding: "8px 16px", background: "#6c757d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
};

export default Fees;