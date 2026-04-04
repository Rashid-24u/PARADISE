import { useEffect, useState } from "react";

function ExtraActivitiesAdmin() {
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", fee_amount: "", is_active: true });
  const [editId, setEditId] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [showSuccess, setShowSuccess] = useState("");
  const [showError, setShowError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [lastPayment, setLastPayment] = useState(null);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState(null);
  const [detailsClassFilter, setDetailsClassFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const API = "http://127.0.0.1:8000/api/";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actsRes, studsRes, crsRes, regsRes, paysRes] = await Promise.all([
        fetch(API + "extra-activities/"),
        fetch(API + "students/"),
        fetch(API + "courses/"),
        fetch(API + "student-activities/"),
        fetch(API + "activity-payments/"),
      ]);

      const acts = await actsRes.json();
      const studs = await studsRes.json();
      const crs = await crsRes.json();
      const regs = await regsRes.json();
      const pays = await paysRes.json();

      const paymentsByRegistration = {};
      pays.forEach(pay => {
        if (!paymentsByRegistration[pay.registration]) {
          paymentsByRegistration[pay.registration] = [];
        }
        paymentsByRegistration[pay.registration].push(pay);
      });

      const enrichedRegistrations = regs.map(reg => {
        const regPayments = paymentsByRegistration[reg.id] || [];
        const totalPaid = regPayments.reduce((sum, p) => sum + p.amount, 0);
        const balance = reg.total_fee - totalPaid;
        
        return {
          ...reg,
          payments: regPayments,
          total_paid: totalPaid,
          balance: balance,
          status: balance === 0 ? "Completed" : "Active"
        };
      });

      const enrichedActivities = acts.map(act => {
        const activityRegistrations = enrichedRegistrations.filter(reg => reg.activity === act.id);
        const totalRegistered = activityRegistrations.length;
        const totalCollected = activityRegistrations.reduce((sum, reg) => sum + reg.total_paid, 0);
        const pendingAmount = activityRegistrations.reduce((sum, reg) => sum + reg.balance, 0);
        
        return {
          ...act,
          registrations: activityRegistrations,
          total_registered: totalRegistered,
          total_collected: totalCollected,
          pending_amount: pendingAmount
        };
      });

      setActivities(enrichedActivities);
      setStudents(studs);
      setCourses(crs);
    } catch (error) {
      console.error("Error fetching data:", error);
      setShowError("Failed to fetch data. Please check your connection.");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.fee_amount) {
      setShowError("Please fill all required fields");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    setLoading(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? API + `extra-activities/${editId}/` : API + "extra-activities/";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          fee_amount: parseInt(form.fee_amount),
          is_active: form.is_active,
        }),
      });

      if (res.ok) {
        setShowSuccess(editId ? "Activity updated successfully!" : "Activity added successfully!");
        setTimeout(() => setShowSuccess(""), 3000);
        setForm({ name: "", description: "", fee_amount: "", is_active: true });
        setEditId(null);
        await fetchData();
      } else {
        const error = await res.json();
        setShowError(error.message || "Error saving activity");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      setShowError("Network error. Please try again.");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async () => {
    if (!selectedActivity || !selectedStudent) {
      setShowError("Please select both activity and student");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const alreadyRegistered = activities
      .find(a => a.id === selectedActivity.id)
      ?.registrations?.some(reg => reg.student === parseInt(selectedStudent));

    if (alreadyRegistered) {
      setShowError(`❌ Student is already registered for ${selectedActivity.name}`);
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API + "student-activities/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: parseInt(selectedStudent),
          activity: selectedActivity.id,
          total_fee: selectedActivity.fee_amount,
          paid_amount: 0,
          status: "Active",
        }),
      });

      if (res.ok) {
        const student = students.find(s => s.id === parseInt(selectedStudent));
        setShowSuccess(`✅ ${student?.name} successfully registered for ${selectedActivity.name}!`);
        setTimeout(() => setShowSuccess(""), 3000);
        setSelectedStudent("");
        setSearchStudent("");
        setSelectedCourseFilter("");
        setShowModal(false);
        await fetchData();
      } else {
        const error = await res.json();
        setShowError(error.detail || "Registration failed");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      setShowError("Network error. Please try again.");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityPayment = async () => {
    if (!selectedRegistration || !paymentAmount) {
      setShowError("Please enter payment amount");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const amount = parseInt(paymentAmount);
    if (amount <= 0) {
      setShowError("Please enter a valid amount");
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    if (amount > selectedRegistration.balance) {
      setShowError(`Amount cannot exceed pending balance of ₹${selectedRegistration.balance.toLocaleString()}`);
      setTimeout(() => setShowError(""), 3000);
      return;
    }

    const confirmMessage = `💵 Payment Confirmation\n\n` +
      `Student: ${getStudentName(selectedRegistration.student)}\n` +
      `Activity: ${getActivityName(selectedRegistration.activity)}\n` +
      `Payment Amount: ₹${amount.toLocaleString()}\n` +
      `Remarks: ${paymentRemarks || "Activity fee payment"}\n\n` +
      `Are you sure you want to make this payment?`;

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await fetch(API + "activity-payments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration: selectedRegistration.id,
          amount: amount,
          remarks: paymentRemarks || "Activity fee payment",
        }),
      });

      const data = await res.json();

      if (res.ok && data) {
        setLastPayment({
          ...data,
          student_name: getStudentName(selectedRegistration.student),
          activity_name: getActivityName(selectedRegistration.activity),
          admission_no: getStudentAdmissionNo(selectedRegistration.student),
          course_name: getStudentCourse(selectedRegistration.student),
          total_fee: selectedRegistration.total_fee,
          previous_paid: selectedRegistration.total_paid,
          new_total_paid: selectedRegistration.total_paid + amount,
          balance: selectedRegistration.balance - amount
        });
        
        setShowSuccess(`✅ Payment of ₹${amount.toLocaleString()} recorded successfully!`);
        setTimeout(() => setShowSuccess(""), 3000);
        setPaymentAmount("");
        setPaymentRemarks("");
        setShowPaymentModal(false);
        
        await fetchData();
        
        // Show receipt modal
        setShowReceiptModal(true);
      } else {
        setShowError(data?.error || data?.message || "Payment failed");
        setTimeout(() => setShowError(""), 3000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setShowError("Network error. Please try again.");
      setTimeout(() => setShowError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    if (window.confirm("Are you sure you want to remove this student from the activity?")) {
      setLoading(true);
      try {
        const res = await fetch(API + `student-activities/${registrationId}/`, {
          method: "DELETE",
        });

        if (res.ok) {
          setShowSuccess("Student removed from activity successfully!");
          setTimeout(() => setShowSuccess(""), 3000);
          await fetchData();
        } else {
          setShowError("Failed to remove student");
          setTimeout(() => setShowError(""), 3000);
        }
      } catch (err) {
        setShowError("Network error. Please try again.");
        setTimeout(() => setShowError(""), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrintReceipt = () => {
    if (!lastPayment) return;
    
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .receipt-container {
            max-width: 500px;
            width: 100%;
            margin: 0 auto;
            animation: fadeIn 0.3s ease;
          }
          .receipt-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 35px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .receipt-header {
            background: linear-gradient(135deg, #1a472a, #2d5a3a);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .receipt-header h1 {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .receipt-header p {
            font-size: 12px;
            opacity: 0.9;
          }
          .receipt-body {
            padding: 24px;
          }
          .receipt-title {
            text-align: center;
            margin-bottom: 24px;
          }
          .receipt-title h2 {
            color: #1a472a;
            font-size: 20px;
            margin-bottom: 4px;
          }
          .receipt-title span {
            font-size: 12px;
            color: #64748b;
          }
          .info-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 13px;
          }
          .info-label {
            color: #64748b;
            font-weight: 500;
          }
          .info-value {
            color: #1e293b;
            font-weight: 600;
          }
          .amount-section {
            background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .amount-label {
            font-size: 12px;
            color: #2e7d32;
            margin-bottom: 8px;
          }
          .amount-value {
            font-size: 32px;
            font-weight: 700;
            color: #1b5e20;
          }
          .payment-details {
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            margin-bottom: 20px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 10px;
            color: #94a3b8;
          }
          .status-badge {
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .receipt-card {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-card">
            <div class="receipt-header">
              <h1>🏫 School Management System</h1>
              <p>Extra Activity Fee Receipt</p>
            </div>
            <div class="receipt-body">
              <div class="receipt-title">
                <h2>💵 Payment Receipt</h2>
                <span>Receipt No: ${lastPayment.receipt_no || 'ACT' + lastPayment.id}</span>
              </div>
              
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Student Name:</span>
                  <span class="info-value">${lastPayment.student_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Admission No:</span>
                  <span class="info-value">${lastPayment.admission_no}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Class:</span>
                  <span class="info-value">${lastPayment.course_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Activity:</span>
                  <span class="info-value">${lastPayment.activity_name}</span>
                </div>
              </div>
              
              <div class="amount-section">
                <div class="amount-label">Payment Amount</div>
                <div class="amount-value">₹${lastPayment.amount?.toLocaleString()}</div>
              </div>
              
              <div class="payment-details">
                <div class="detail-row">
                  <span>Payment Date:</span>
                  <strong>${new Date(lastPayment.date).toLocaleString()}</strong>
                </div>
                <div class="detail-row">
                  <span>Remarks:</span>
                  <strong>${lastPayment.remarks || "Activity Fee Payment"}</strong>
                </div>
                <div class="detail-row">
                  <span>Total Fee:</span>
                  <strong>₹${lastPayment.total_fee?.toLocaleString()}</strong>
                </div>
                <div class="detail-row">
                  <span>Previous Paid:</span>
                  <strong>₹${lastPayment.previous_paid?.toLocaleString()}</strong>
                </div>
                <div class="detail-row">
                  <span>Total Paid:</span>
                  <strong style="color: #22c55e;">₹${lastPayment.new_total_paid?.toLocaleString()}</strong>
                </div>
                <div class="detail-row">
                  <span>Remaining Balance:</span>
                  <strong style="color: ${lastPayment.balance > 0 ? '#f97316' : '#22c55e'};">₹${lastPayment.balance?.toLocaleString()}</strong>
                </div>
              </div>
              
              <div style="text-align: center; margin: 16px 0;">
                <span class="status-badge">✓ Payment Successful</span>
              </div>
              
              <div class="footer">
                <p>This is a computer generated receipt. No signature required.</p>
                <p>Thank you for your payment!</p>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : "Unknown";
  };

  const getStudentAdmissionNo = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.admission_no : "N/A";
  };

  const getStudentCourse = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return "Unknown";
    const course = courses.find(c => c.id === student.course);
    return course ? course.name : "Unknown";
  };

  const getStudentCourseId = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.course : null;
  };

  const getActivityName = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : "Unknown";
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : "Unknown";
  };

  // Filter students by class and search for registration modal
  const filteredStudents = students.filter(student => {
    const matchesCourse = !selectedCourseFilter || student.course === parseInt(selectedCourseFilter);
    const matchesSearch = !searchStudent || 
      student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student.admission_no.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  // Get filtered registrations based on class filter
  const getFilteredRegistrations = (activity) => {
    if (!activity || !activity.registrations) return [];
    
    if (!detailsClassFilter) {
      return activity.registrations;
    }
    
    return activity.registrations.filter(reg => {
      const studentCourseId = getStudentCourseId(reg.student);
      return studentCourseId === parseInt(detailsClassFilter);
    });
  };

  // Get filtered stats for summary cards
  const getFilteredStats = (activity) => {
    const filteredRegs = getFilteredRegistrations(activity);
    return {
      totalRegistered: filteredRegs.length,
      totalCollected: filteredRegs.reduce((sum, reg) => sum + (reg.total_paid || 0), 0),
      totalPending: filteredRegs.reduce((sum, reg) => sum + (reg.balance || 0), 0)
    };
  };

  // Print Report - ONLY TABLE with proper alignment
  const handlePrintReport = (activity) => {
    const filteredRegs = getFilteredRegistrations(activity);
    const filteredStats = getFilteredStats(activity);
    const printWindow = window.open('', '_blank');
    
    const registrationsTable = filteredRegs.map(reg => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: left;">${getStudentName(reg.student)}</td>
        <td style="padding: 12px; text-align: center;">${getStudentAdmissionNo(reg.student)}</td>
        <td style="padding: 12px; text-align: center;">${getStudentCourse(reg.student)}</td>
        <td style="padding: 12px; text-align: right;">₹${reg.total_fee.toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; color: #10b981;">₹${(reg.total_paid || 0).toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; color: #ef4444;">₹${(reg.balance || 0).toLocaleString()}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="background: ${reg.balance === 0 ? '#dcfce7' : '#fed7aa'}; color: ${reg.balance === 0 ? '#166534' : '#9b2c1d'}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
            ${reg.balance === 0 ? 'Paid' : 'Pending'}
          </span>
        </td>
       </tr>
    `).join('') || '<tr><td colspan="7" style="padding: 40px; text-align: center;">No students registered</td></tr>';

    const filterText = detailsClassFilter 
      ? ` (Filtered by: ${getCourseName(parseInt(detailsClassFilter))})`
      : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activity.name} - Student Report${filterText}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: white;
            padding: 40px;
          }
          .print-container {
            max-width: 1200px;
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
            font-size: 13px;
          }
          .filter-badge {
            display: inline-block;
            background: #e0e7ff;
            color: #3730a3;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 8px;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .summary-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-value {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
          }
          .table-title {
            font-size: 18px;
            font-weight: 600;
            margin: 24px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #22c55e;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .data-table th {
            background: #f1f5f9;
            padding: 14px 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
          }
          .data-table th:nth-child(4),
          .data-table th:nth-child(5),
          .data-table th:nth-child(6) {
            text-align: right;
          }
          .data-table th:nth-child(2),
          .data-table th:nth-child(3),
          .data-table th:nth-child(7) {
            text-align: center;
          }
          .data-table td {
            padding: 12px;
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
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>🎯 ${activity.name} - Student Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            ${detailsClassFilter ? `<div class="filter-badge">📚 Class: ${getCourseName(parseInt(detailsClassFilter))}</div>` : ''}
          </div>
          
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-label">Total Registered</div>
              <div class="summary-value">${filteredStats.totalRegistered}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Collected</div>
              <div class="summary-value">₹${filteredStats.totalCollected.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Pending Amount</div>
              <div class="summary-value">₹${filteredStats.totalPending.toLocaleString()}</div>
            </div>
          </div>
          
          <div class="table-title">📋 Registered Students List</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Admission No</th>
                <th>Class</th>
                <th>Total Fee (₹)</th>
                <th>Paid (₹)</th>
                <th>Pending (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${registrationsTable}
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
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const filteredActivities = activities.filter(a =>
    a.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  // Styles
  const styles = {
    container: {
      padding: isMobile ? "16px" : "32px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%)",
      minHeight: "calc(100vh - 70px)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 70px)",
      background: "#f5f7fb",
    },
    loadingSpinner: {
      width: "50px",
      height: "50px",
      border: "3px solid #e2e8f0",
      borderTopColor: "#22c55e",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isMobile ? "24px" : "32px",
      flexWrap: "wrap",
      gap: "16px",
    },
    title: {
      fontSize: isMobile ? "24px" : "32px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #1e293b, #2d3a4a)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
    },
    subtitle: {
      fontSize: "13px",
      color: "#64748b",
      marginTop: "8px",
    },
    statsBadge: {
      background: "white",
      padding: isMobile ? "8px 16px" : "12px 24px",
      borderRadius: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      textAlign: "center",
    },
    statsCount: {
      display: "block",
      fontSize: isMobile ? "22px" : "28px",
      fontWeight: "700",
      color: "#22c55e",
    },
    statsLabel: {
      fontSize: "11px",
      color: "#64748b",
    },
    toastSuccess: {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      padding: isMobile ? "10px 16px" : "14px 24px",
      borderRadius: "12px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      fontWeight: "500",
      fontSize: isMobile ? "12px" : "14px",
    },
    toastError: {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      padding: isMobile ? "10px 16px" : "14px 24px",
      borderRadius: "12px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      fontWeight: "500",
      fontSize: isMobile ? "12px" : "14px",
    },
    formCard: {
      background: "white",
      borderRadius: "24px",
      padding: isMobile ? "20px" : "28px",
      marginBottom: "28px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      border: "1px solid rgba(226, 232, 240, 0.6)",
    },
    formTitle: {
      margin: "0 0 20px 0",
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: "600",
      color: "#1e293b",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
    },
    formField: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    formFieldFull: {
      gridColumn: isMobile ? "1" : "1 / -1",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#334155",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    input: {
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
      fontFamily: "inherit",
    },
    textarea: {
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit",
    },
    select: {
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      background: "white",
      outline: "none",
      cursor: "pointer",
    },
    formActions: {
      marginTop: "24px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    },
    submitBtn: {
      padding: isMobile ? "10px 20px" : "12px 28px",
      background: "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      transition: "all 0.2s",
    },
    cancelBtn: {
      padding: isMobile ? "10px 20px" : "12px 28px",
      background: "#f1f5f9",
      color: "#475569",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "14px",
    },
    filterBar: {
      marginBottom: "24px",
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
    },
    searchWrapper: {
      display: "flex",
      alignItems: "center",
      background: "white",
      borderRadius: "16px",
      padding: "0 16px",
      border: "1px solid #e2e8f0",
      flex: 1,
      minWidth: isMobile ? "100%" : "250px",
    },
    searchIcon: {
      fontSize: "18px",
      color: "#94a3b8",
    },
    searchInput: {
      flex: 1,
      padding: "12px 12px",
      border: "none",
      outline: "none",
      fontSize: "14px",
      background: "transparent",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(380px, 1fr))",
      gap: "24px",
    },
    emptyState: {
      textAlign: "center",
      padding: isMobile ? "40px" : "60px",
      background: "white",
      borderRadius: "24px",
      color: "#94a3b8",
      fontSize: "14px",
    },
    emptyStateSmall: {
      textAlign: "center",
      padding: "40px",
      color: "#94a3b8",
    },
    registerNowBtn: {
      marginTop: "16px",
      padding: "10px 24px",
      background: "#22c55e",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "500",
    },
    activityCard: {
      background: "white",
      borderRadius: "20px",
      padding: isMobile ? "20px" : "24px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      border: "1px solid #f1f5f9",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      flexWrap: "wrap",
      gap: "8px",
    },
    cardTitle: {
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: "700",
      color: "#1e293b",
      margin: 0,
    },
    activeBadge: {
      background: "#dcfce7",
      color: "#166534",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
    },
    inactiveBadge: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
    },
    cardDescription: {
      fontSize: "13px",
      color: "#64748b",
      marginBottom: "16px",
      lineHeight: "1.5",
    },
    cardFee: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#22c55e",
      marginBottom: "16px",
      padding: "8px 0",
      borderTop: "1px solid #f1f5f9",
      borderBottom: "1px solid #f1f5f9",
    },
    cardStats: {
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      paddingTop: "12px",
      marginBottom: "20px",
    },
    stat: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      span: { fontSize: "10px", color: "#94a3b8", fontWeight: "500" },
      strong: { fontSize: isMobile ? "16px" : "18px", fontWeight: "700", color: "#1e293b" },
    },
    cardActions: {
      display: "flex",
      gap: "10px",
    },
    editBtn: {
      flex: 1,
      padding: "10px",
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },
    registerBtn: {
      flex: 1,
      padding: "10px",
      background: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },
    viewDetailsBtn: {
      flex: 1,
      padding: "10px",
      background: "#8b5cf6",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
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
      borderRadius: "28px",
      width: isMobile ? "95%" : "550px",
      maxWidth: "550px",
      maxHeight: "90vh",
      overflow: "auto",
    },
    modalContentLarge: {
      background: "white",
      borderRadius: "28px",
      width: isMobile ? "95%" : "95%",
      maxWidth: "1400px",
      maxHeight: "90vh",
      overflow: "auto",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: isMobile ? "16px 20px" : "24px 28px",
      borderBottom: "1px solid #e2e8f0",
    },
    modalClose: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#94a3b8",
    },
    modalBody: {
      padding: isMobile ? "16px 20px" : "24px 28px",
    },
    modalFooter: {
      padding: isMobile ? "16px 20px" : "20px 28px",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    },
    infoBox: {
      marginTop: "20px",
      padding: "16px",
      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
      borderRadius: "16px",
    },
    confirmBtn: {
      padding: isMobile ? "10px 20px" : "12px 28px",
      background: "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
    },
    summaryCards: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "28px",
    },
    summaryCard: {
      background: "linear-gradient(135deg, #f8fafc, #ffffff)",
      padding: "20px",
      borderRadius: "20px",
      textAlign: "center",
      border: "1px solid #e2e8f0",
    },
    summaryTitle: {
      fontSize: "11px",
      color: "#64748b",
      marginBottom: "8px",
      textTransform: "uppercase",
      fontWeight: "600",
    },
    summaryValue: {
      fontSize: isMobile ? "22px" : "28px",
      fontWeight: "700",
      color: "#1e293b",
    },
    filterSection: {
      marginBottom: "24px",
      padding: "16px",
      background: "#f8fafc",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
    },
    filterRow: {
      display: "flex",
      gap: "16px",
      alignItems: "flex-end",
      flexWrap: "wrap",
    },
    filterGroup: {
      flex: 1,
      minWidth: isMobile ? "100%" : "250px",
    },
    clearFilterBtn: {
      padding: "8px 16px",
      background: "#64748b",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },
    tableWrapper: {
      overflowX: "auto",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      minWidth: "800px",
    },
    th: {
      textAlign: "left",
      padding: "14px 16px",
      background: "#f8fafc",
      borderBottom: "2px solid #e2e8f0",
      fontWeight: "600",
      color: "#334155",
    },
    td: {
      padding: "12px 16px",
      borderBottom: "1px solid #e2e8f0",
      color: "#475569",
    },
    paidBadge: {
      background: "#dcfce7",
      color: "#166534",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      display: "inline-block",
    },
    pendingBadge: {
      background: "#fed7aa",
      color: "#9b2c1d",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      display: "inline-block",
    },
    paidAmount: {
      color: "#10b981",
      fontWeight: "600",
    },
    pendingAmount: {
      color: "#ef4444",
      fontWeight: "600",
    },
    actionButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    payBtn: {
      padding: "6px 12px",
      background: "#22c55e",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "600",
    },
    deleteRegBtn: {
      padding: "6px 12px",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "600",
    },
    printReportBtn: {
      padding: "8px 16px",
      background: "#8b5cf6",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      marginBottom: "16px",
      marginRight: "12px",
    },
    paymentInfo: {
      background: "#f8fafc",
      padding: "16px",
      borderRadius: "16px",
      marginBottom: "20px",
    },
    receiptModal: {
      background: "white",
      borderRadius: "28px",
      width: isMobile ? "95%" : "550px",
      maxWidth: "550px",
      maxHeight: "90vh",
      overflow: "auto",
    },
    receiptHeader: {
      background: "linear-gradient(135deg, #1a472a, #2d5a3a)",
      color: "white",
      padding: "20px",
      textAlign: "center",
    },
    receiptBody: {
      padding: "24px",
    },
    receiptActions: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      padding: "20px",
      borderTop: "1px solid #e2e8f0",
    },
    printReceiptBtn: {
      flex: 1,
      padding: "12px",
      background: "#8b5cf6",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
    },
    closeReceiptBtn: {
      flex: 1,
      padding: "12px",
      background: "#64748b",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  if (loading && activities.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🎯 Extra Activities Management</h2>
          <p style={styles.subtitle}>Manage Abacus, Chess, and other co-curricular activities</p>
        </div>
        <div style={styles.statsBadge}>
          <span style={styles.statsCount}>{activities.length}</span>
          <span style={styles.statsLabel}>Total Activities</span>
        </div>
      </div>

      {showSuccess && <div style={styles.toastSuccess}>{showSuccess}</div>}
      {showError && <div style={styles.toastError}>{showError}</div>}

      {/* Add/Edit Activity Form */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>{editId ? "✏️ Edit Activity" : "➕ Add New Activity"}</h3>
        <div style={styles.formGrid}>
          <div style={styles.formField}>
            <label style={styles.label}>Activity Name *</label>
            <input
              style={styles.input}
              placeholder="e.g., Abacus, Chess, Drawing"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div style={styles.formField}>
            <label style={styles.label}>Fee Amount (₹) *</label>
            <input
              type="number"
              style={styles.input}
              placeholder="Enter fee amount"
              value={form.fee_amount}
              onChange={e => setForm({ ...form, fee_amount: e.target.value })}
            />
          </div>
          <div style={styles.formFieldFull}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              rows="2"
              placeholder="Activity description..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={styles.formField}>
            <label style={styles.label}>Status</label>
            <select
              style={styles.select}
              value={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.value === "true" })}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        <div style={styles.formActions}>
          {editId && (
            <button style={styles.cancelBtn} onClick={() => { 
              setEditId(null); 
              setForm({ name: "", description: "", fee_amount: "", is_active: true }); 
            }}>
              Cancel
            </button>
          )}
          <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : (editId ? "Update Activity" : "Add Activity")}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search activities by name..."
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
          />
        </div>
      </div>

      {/* Activities Grid */}
      <div style={styles.grid}>
        {filteredActivities.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No activities found. Create your first activity above!</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} style={styles.activityCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{activity.name}</h3>
                <span style={activity.is_active ? styles.activeBadge : styles.inactiveBadge}>
                  {activity.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p style={styles.cardDescription}>{activity.description || "No description provided"}</p>
              <div style={styles.cardFee}>
                <span>💰 Fee: ₹{activity.fee_amount.toLocaleString()}</span>
              </div>
              <div style={styles.cardStats}>
                <div style={styles.stat}>
                  <span>👨‍🎓 Registered</span>
                  <strong>{activity.total_registered || 0}</strong>
                </div>
                <div style={styles.stat}>
                  <span>💰 Collected</span>
                  <strong>₹{(activity.total_collected || 0).toLocaleString()}</strong>
                </div>
                <div style={styles.stat}>
                  <span>📊 Pending</span>
                  <strong>₹{(activity.pending_amount || 0).toLocaleString()}</strong>
                </div>
              </div>
              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => {
                  setEditId(activity.id);
                  setForm({
                    name: activity.name,
                    description: activity.description || "",
                    fee_amount: activity.fee_amount,
                    is_active: activity.is_active,
                  });
                }}>
                  ✏️ Edit
                </button>
                <button style={styles.registerBtn} onClick={() => {
                  setSelectedActivity(activity);
                  setShowModal(true);
                }}>
                  ➕ Register
                </button>
                <button style={styles.viewDetailsBtn} onClick={() => {
                  setSelectedActivityForDetails(activity);
                  setDetailsClassFilter("");
                }}>
                  📋 Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Registration Modal */}
      {showModal && selectedActivity && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>📝 Register Student for {selectedActivity.name}</h3>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>✖</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formField}>
                <label style={styles.label}>Filter by Class</label>
                <select
                  style={styles.select}
                  value={selectedCourseFilter}
                  onChange={e => setSelectedCourseFilter(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Search Student</label>
                <input
                  style={styles.input}
                  placeholder="Search by name or admission number..."
                  value={searchStudent}
                  onChange={e => setSearchStudent(e.target.value)}
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Select Student *</label>
                <select
                  style={styles.select}
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                >
                  <option value="">-- Choose Student --</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.admission_no} ({getCourseName(s.course)})
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.infoBox}>
                <p style={{ margin: "8px 0" }}>💰 Activity Fee: <strong>₹{selectedActivity.fee_amount.toLocaleString()}</strong></p>
                <p style={{ margin: "8px 0" }}>📅 Registration will be recorded with current date and time</p>
                <p style={{ margin: "8px 0" }}>✅ Student will be added to the activity roster</p>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.confirmBtn} onClick={handleRegisterStudent} disabled={loading}>
                {loading ? "Registering..." : "Register Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {selectedActivityForDetails && (
        <div style={styles.modalOverlay} onClick={() => setSelectedActivityForDetails(null)}>
          <div style={styles.modalContentLarge} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>📊 {selectedActivityForDetails.name} - Activity Report</h3>
              <button style={styles.modalClose} onClick={() => setSelectedActivityForDetails(null)}>✖</button>
            </div>
            <div style={styles.modalBody}>
              {/* Filter Section */}
              <div style={styles.filterSection}>
                <div style={styles.filterRow}>
                  <div style={styles.filterGroup}>
                    <label style={styles.label}>Filter by Class</label>
                    <select
                      style={styles.select}
                      value={detailsClassFilter}
                      onChange={e => setDetailsClassFilter(e.target.value)}
                    >
                      <option value="">All Classes</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.filterGroup}>
                    <label style={styles.label}>&nbsp;</label>
                    <button 
                      style={styles.clearFilterBtn}
                      onClick={() => setDetailsClassFilter("")}
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Cards (Filtered) */}
              {(() => {
                const filteredStats = getFilteredStats(selectedActivityForDetails);
                return (
                  <div style={styles.summaryCards}>
                    <div style={styles.summaryCard}>
                      <div style={styles.summaryTitle}>Total Registered</div>
                      <div style={styles.summaryValue}>{filteredStats.totalRegistered}</div>
                    </div>
                    <div style={styles.summaryCard}>
                      <div style={styles.summaryTitle}>Total Collected</div>
                      <div style={styles.summaryValue}>₹{filteredStats.totalCollected.toLocaleString()}</div>
                    </div>
                    <div style={styles.summaryCard}>
                      <div style={styles.summaryTitle}>Pending Amount</div>
                      <div style={styles.summaryValue}>₹{filteredStats.totalPending.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Print Button */}
              <div>
                <button 
                  style={styles.printReportBtn}
                  onClick={() => handlePrintReport(selectedActivityForDetails)}
                >
                  🖨️ Print Report
                </button>
              </div>

              {/* Registered Students Table (Filtered) */}
              {(() => {
                const filteredRegs = getFilteredRegistrations(selectedActivityForDetails);
                return filteredRegs.length > 0 ? (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Student Name</th>
                          <th style={styles.th}>Admission No</th>
                          <th style={styles.th}>Class</th>
                          <th style={styles.th}>Total Fee</th>
                          <th style={styles.th}>Paid</th>
                          <th style={styles.th}>Pending</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegs.map(reg => (
                          <tr key={reg.id}>
                            <td style={styles.td}><strong>{getStudentName(reg.student)}</strong></td>
                            <td style={styles.td}>{getStudentAdmissionNo(reg.student)}</td>
                            <td style={styles.td}>{getStudentCourse(reg.student)}</td>
                            <td style={styles.td}>₹{reg.total_fee.toLocaleString()}</td>
                            <td style={{...styles.td, ...styles.paidAmount}}>₹{(reg.total_paid || 0).toLocaleString()}</td>
                            <td style={styles.td}>
                              <span style={reg.balance > 0 ? styles.pendingAmount : styles.paidAmount}>
                                ₹{(reg.balance || 0).toLocaleString()}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={reg.balance === 0 ? styles.paidBadge : styles.pendingBadge}>
                                {reg.balance === 0 ? "✅ Paid" : "⏳ Pending"}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actionButtons}>
                                {reg.balance > 0 && (
                                  <button
                                    style={styles.payBtn}
                                    onClick={() => {
                                      setSelectedRegistration(reg);
                                      setShowPaymentModal(true);
                                    }}
                                  >
                                    💰 Pay
                                  </button>
                                )}
                                <button
                                  style={styles.deleteRegBtn}
                                  onClick={() => handleDeleteRegistration(reg.id)}
                                >
                                  🗑️ Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyStateSmall}>
                    <p>No students registered for this activity {detailsClassFilter ? `in ${getCourseName(parseInt(detailsClassFilter))}` : ''}.</p>
                    <button 
                      style={styles.registerNowBtn}
                      onClick={() => {
                        setSelectedActivity(selectedActivityForDetails);
                        setShowModal(true);
                      }}
                    >
                      Register First Student
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRegistration && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>💵 Record Payment</h3>
              <button style={styles.modalClose} onClick={() => setShowPaymentModal(false)}>✖</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.paymentInfo}>
                <p style={{ margin: "8px 0" }}><strong>Student:</strong> {getStudentName(selectedRegistration.student)}</p>
                <p style={{ margin: "8px 0" }}><strong>Activity:</strong> {getActivityName(selectedRegistration.activity)}</p>
                <p style={{ margin: "8px 0" }}><strong>Total Fee:</strong> ₹{selectedRegistration.total_fee.toLocaleString()}</p>
                <p style={{ margin: "8px 0" }}><strong>Already Paid:</strong> ₹{(selectedRegistration.total_paid || 0).toLocaleString()}</p>
                <p style={{ margin: "8px 0" }}><strong>Pending Balance:</strong> <span style={{color: '#ef4444', fontWeight: 'bold'}}>₹{(selectedRegistration.balance || 0).toLocaleString()}</span></p>
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Payment Amount (₹) *</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  max={selectedRegistration.balance}
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Remarks</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Payment remarks (optional)"
                  value={paymentRemarks}
                  onChange={e => setPaymentRemarks(e.target.value)}
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button style={styles.confirmBtn} onClick={handleActivityPayment} disabled={loading}>
                {loading ? "Processing..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && lastPayment && (
        <div style={styles.modalOverlay} onClick={() => setShowReceiptModal(false)}>
          <div style={styles.receiptModal} onClick={e => e.stopPropagation()}>
            <div style={styles.receiptHeader}>
              <h3 style={{ margin: 0 }}>🏫 Payment Receipt</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.9 }}>Extra Activity Fee Receipt</p>
            </div>
            <div style={styles.receiptBody}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Receipt No: {lastPayment.receipt_no || 'ACT' + lastPayment.id}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Date: {new Date(lastPayment.date).toLocaleString()}</div>
              </div>
              
              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Student Name:</span>
                  <strong>{lastPayment.student_name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Admission No:</span>
                  <strong>{lastPayment.admission_no}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Class:</span>
                  <strong>{lastPayment.course_name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>Activity:</span>
                  <strong>{lastPayment.activity_name}</strong>
                </div>
              </div>
              
              <div style={{ background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)", borderRadius: "12px", padding: "20px", textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "#2e7d32", marginBottom: "8px" }}>Payment Amount</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#1b5e20" }}>₹{lastPayment.amount?.toLocaleString()}</div>
              </div>
              
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span>Total Fee:</span>
                  <strong>₹{lastPayment.total_fee?.toLocaleString()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span>Previous Paid:</span>
                  <strong>₹{lastPayment.previous_paid?.toLocaleString()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span>Total Paid:</span>
                  <strong style={{ color: "#22c55e" }}>₹{lastPayment.new_total_paid?.toLocaleString()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span>Remaining Balance:</span>
                  <strong style={{ color: lastPayment.balance > 0 ? "#f97316" : "#22c55e" }}>₹{lastPayment.balance?.toLocaleString()}</strong>
                </div>
                {lastPayment.remarks && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", fontSize: "13px" }}>
                    <span>Remarks:</span>
                    <strong>{lastPayment.remarks}</strong>
                  </div>
                )}
              </div>
              
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <span style={{ background: "#22c55e", color: "white", padding: "4px 16px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                  ✓ Payment Successful
                </span>
              </div>
            </div>
            <div style={styles.receiptActions}>
              <button style={styles.printReceiptBtn} onClick={handlePrintReceipt}>🖨️ Print Receipt</button>
              <button style={styles.closeReceiptBtn} onClick={() => setShowReceiptModal(false)}>Close</button>
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
  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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
  input:focus, select:focus, textarea:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default ExtraActivitiesAdmin;