import { useEffect, useState } from "react";

function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/gallery/")
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>

      {/* HERO */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gallery</h1>
        <p style={styles.subtitle}>
          Capturing Beautiful Moments of Our School
        </p>
      </div>

      {/* GRID */}
      <div style={styles.container}>
        {images.map((img, index) => (
          <div key={img.id} style={styles.card}>
            <img
              src={img.image}
              alt="gallery"
              style={styles.img}
              onClick={() => setSelectedImage(index)}
            />
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {images.length === 0 && (
        <p style={styles.empty}>No images uploaded yet</p>
      )}

      {/* MODAL */}
      {selectedImage !== null && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>

          <span style={styles.close}>✖</span>

          <img
            src={images[selectedImage].image}
            alt="full"
            style={styles.modalImg}
          />

          {/* PREV */}
          <button
            style={styles.prev}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(
                selectedImage === 0 ? images.length - 1 : selectedImage - 1
              );
            }}
          >
            ⬅
          </button>

          {/* NEXT */}
          <button
            style={styles.next}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(
                selectedImage === images.length - 1 ? 0 : selectedImage + 1
              );
            }}
          >
            ➡
          </button>

        </div>
      )}
    </div>
  );
}

const styles = {

  // 🔥 HEADER
  header: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #065f46, #16a34a)",
    color: "white"
  },

  title: {
    fontSize: "38px",
    fontWeight: "800",
  },

  subtitle: {
    marginTop: "10px",
    color: "#d1d5db",
    fontSize: "15px"
  },

  // 🔥 GRID
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    padding: "30px 15px",
    maxWidth: "1200px",
    margin: "auto"
  },

  // 🔥 CARD (SQUARE FIX)
  card: {
    borderRadius: "14px",
    overflow: "hidden",
    background: "white",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    aspectRatio: "1 / 1",   // ✅ PERFECT GRID
  },

  // 🔥 IMAGE FIX
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    cursor: "pointer",
    transition: "0.3s",
  },

  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280"
  },

  // 🔥 MODAL
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.95)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  modalImg: {
    maxWidth: "90%",
    maxHeight: "85%",
    borderRadius: "12px"
  },

  close: {
    position: "absolute",
    top: "20px",
    right: "25px",
    color: "white",
    fontSize: "28px",
    cursor: "pointer"
  },

  prev: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "28px",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer"
  },

  next: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "28px",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer"
  }
};

export default Gallery;