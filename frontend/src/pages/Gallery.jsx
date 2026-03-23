import { useEffect, useState } from "react";

import img1 from "../assets/bg1.jpeg";
import img2 from "../assets/abacusbg.jpeg";
import img3 from "../assets/abacusbg1.jpeg";
import img4 from "../assets/gallery2.jpeg";
import img5 from "../assets/gallery1.jpeg";
import img6 from "../assets/gallery4.jpeg";

function Gallery() {
  const [apiImages, setApiImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/gallery/")
      .then(res => res.json())
      .then(data => setApiImages(data))
      .catch(err => console.log(err));
  }, []);

  const allImages = [
    ...staticImages,
    ...apiImages.map(item => `http://127.0.0.1:8000${item.image}`)
  ];

  return (
    <div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gallery</h1>
        <p style={styles.subtitle}>Moments from Our School</p>
      </div>

      {/* IMAGES */}
      <div style={styles.container}>
        {allImages.map((img, index) => (
          <div key={index} style={styles.card}>
            <img
              src={img}
              alt="gallery"
              style={styles.img}
              onClick={() => setSelectedImage(index)} // 🔥 CLICK OPEN
            />
          </div>
        ))}
      </div>

      {/* 🔥 MODAL VIEW */}
      {selectedImage !== null && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>

          <span style={styles.close}>✖</span>

          <img
            src={allImages[selectedImage]}
            alt="full"
            style={styles.modalImg}
          />

          {/* 🔥 PREV */}
          <button
            style={styles.prev}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(
                selectedImage === 0 ? allImages.length - 1 : selectedImage - 1
              );
            }}
          >
            ⬅
          </button>

          {/* 🔥 NEXT */}
          <button
            style={styles.next}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(
                selectedImage === allImages.length - 1 ? 0 : selectedImage + 1
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

const staticImages = [img1, img2, img3, img4, img5, img6];

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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "auto"
  },

  card: {
    overflow: "hidden",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
  },

  img: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    cursor: "pointer",
    transition: "0.3s"
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
    maxHeight: "80%",
    borderRadius: "10px"
  },

  close: {
    position: "absolute",
    top: "20px",
    right: "30px",
    color: "white",
    fontSize: "30px",
    cursor: "pointer"
  },

  prev: {
    position: "absolute",
    left: "20px",
    top: "50%",
    fontSize: "30px",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer"
  },

  next: {
    position: "absolute",
    right: "20px",
    top: "50%",
    fontSize: "30px",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer"
  }
};

export default Gallery;