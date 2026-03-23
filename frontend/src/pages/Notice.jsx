import { useEffect, useState } from "react";

// 🔥 STATIC IMAGES
import img1 from "../assets/adm1.jpeg";
import img2 from "../assets/abacus11.jpeg";

function Notice() {
  const [apiNotices, setApiNotices] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🔌 FETCH FROM BACKEND
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/notices/")
      .then(res => res.json())
      .then(data => setApiNotices(data))
      .catch(err => console.log(err));
  }, []);

  // 🔥 STATIC DATA
  const staticNotices = [
    {
      date: "Mar 25",
      title: "Admission Open 2026",
      desc: "Admissions are now open. Contact us today.",
      image: img1,
      isImportant: true
    },
    {
      date: "Apr 01",
      title: "New Academic Year",
      desc: "Classes will begin soon.",
      image: null,
      isImportant: false
    },
    {
      date: "Apr 10",
      title: "Abacus Batch Starting",
      desc: "New batch starts this month.",
      image: img2,
      isImportant: false
    }
  ];

  // 🔥 MERGE STATIC + API
  const allNotices = [
    ...staticNotices,
    ...apiNotices.map(item => ({
      date: new Date(item.created_at).toDateString(),
      title: item.title,
      desc: item.content,
      image: item.image
        ? `http://127.0.0.1:8000${item.image}`
        : null,
      isImportant: item.is_important || false
    }))
  ];

  return (
    <div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Notice Board</h1>
        <p style={styles.subtitle}>Latest Updates & Announcements</p>
      </div>

      {/* NOTICES */}
      <div style={styles.container}>
        {allNotices.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.card,
              ...(item.isImportant ? styles.importantCard : {})
            }}
          >

            {/* IMAGE */}
            {item.image && (
              <img
                src={item.image}
                alt="notice"
                style={styles.image}
                onClick={() => setSelectedImage(item.image)}
              />
            )}

            {/* CONTENT */}
            <div style={styles.content}>
              <div style={styles.dateBox}>{item.date}</div>

              <h3 style={styles.noticeTitle}>
                {item.title}
                {item.isImportant && (
                  <span style={styles.badge}>Important</span>
                )}
              </h3>

              <p style={styles.text}>{item.desc}</p>
            </div>

          </div>
        ))}
      </div>

      {/* 🔥 MODAL IMAGE VIEW */}
      {selectedImage && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="full" style={styles.modalImg} />
        </div>
      )}

    </div>
  );
}

const styles = {

  header: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #0F766E, #22C55E)",
    color: "white"
  },

  title: {
    fontSize: "40px",
    fontWeight: "800"
  },

  subtitle: {
    marginTop: "10px",
    color: "#d1d5db"
  },

  container: {
    maxWidth: "900px",
    margin: "auto",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },

  card: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    overflow: "hidden",
    padding: "10px" // 🔥 poster spacing
  },

  importantCard: {
    border: "2px solid #facc15"
  },

  // 🔥 IMAGE FIXED (NO CROP)
  image: {
    width: "100%",
    height: "auto",
    maxHeight: "500px",
    objectFit: "contain",
    background: "#f3f4f6",
    borderRadius: "8px",
    cursor: "pointer"
  },

  content: {
    padding: "10px"
  },

  dateBox: {
    background: "#facc15",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    display: "inline-block",
    marginBottom: "8px",
    fontWeight: "bold"
  },

  noticeTitle: {
    margin: "5px 0",
    color: "#065f46",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  badge: {
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    padding: "3px 6px",
    borderRadius: "5px"
  },

  text: {
    fontSize: "14px",
    color: "#374151"
  },

  // 🔥 MODAL
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  modalImg: {
    maxWidth: "90%",
    maxHeight: "85%",
    borderRadius: "10px"
  }
};

export default Notice;