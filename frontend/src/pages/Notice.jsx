import { useEffect, useState } from "react";

function Notice() {
  const [notices, setNotices] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/notices/")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .sort((a, b) => b.is_important - a.is_important);

        setNotices(sorted);
      });
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Notice Board</h1>
        <p style={styles.subtitle}>Latest Updates 🔔</p>
      </div>

      <div style={styles.container}>
        {notices.map((n) => (
          <div
            key={n.id}
            style={{
              ...styles.card,
              ...(n.is_important ? styles.importantCard : {}),
            }}
          >
            {n.image_url && (
              <img
                src={n.image_url}
                style={styles.image}
                onClick={() => setSelectedImage(n.image_url)}
              />
            )}

            <div style={styles.content}>
              <div style={styles.date}>
                {new Date(n.created_at).toLocaleDateString()}
              </div>

              <h3>
                {n.title}
                {n.is_important && (
                  <span style={styles.badge}>Important</span>
                )}
              </h3>

              <p>{n.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedImage && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} style={styles.modalImg} />
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
    color: "white",
  },

  title: { fontSize: "40px", fontWeight: "800" },

  subtitle: { color: "#d1d5db" },

  container: {
    maxWidth: "900px",
    margin: "auto",
    padding: "40px 15px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    background: "white",
    borderRadius: "12px",
    padding: "10px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
  },

  importantCard: {
    border: "2px solid #facc15",
  },

  image: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "contain",
    cursor: "pointer",
    borderRadius: "8px",
  },

  content: { padding: "10px" },

  date: {
    background: "#facc15",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    display: "inline-block",
    marginBottom: "8px",
  },

  badge: {
    background: "#ef4444",
    color: "white",
    fontSize: "10px",
    padding: "3px 6px",
    borderRadius: "5px",
    marginLeft: "8px",
  },

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
  },

  modalImg: {
    maxWidth: "90%",
    maxHeight: "85%",
    borderRadius: "10px",
  },
};

export default Notice;