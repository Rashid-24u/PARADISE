import { useEffect, useState } from "react";

function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const API = "http://127.0.0.1:8000/api/gallery/";

  const fetchImages = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setImages(data);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // UPLOAD
  const uploadImage = async () => {
    if (!file) return alert("Select image");

    const formData = new FormData();
    formData.append("image", file);

    await fetch(API, {
      method: "POST",
      body: formData,
    });

    setFile(null);
    fetchImages();
  };

  // DELETE
  const deleteImage = async (id) => {
    await fetch(API + id + "/", {
      method: "DELETE",
    });

    fetchImages();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gallery Management</h2>

      {/* UPLOAD */}
      <div style={styles.upload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button style={styles.btn} onClick={uploadImage}>
          Upload Image
        </button>
      </div>

      {/* IMAGES */}
      <div style={styles.grid}>
        {images.map((img, index) => (
          <div key={img.id} style={styles.card}>

            <img
              src={img.image}
              alt="gallery"
              style={styles.image}
              onClick={() => setSelectedImage(index)}
            />

            <button
              style={styles.delete}
              onClick={() => deleteImage(img.id)}
            >
              Delete
            </button>

          </div>
        ))}
      </div>

      {/* MODAL VIEW */}
      {selectedImage !== null && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <img
            src={images[selectedImage].image}
            style={styles.modalImg}
            alt="full"
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1100px",
    margin: "auto"
  },

  title: {
    textAlign: "center",
    color: "#065f46",
    marginBottom: "20px"
  },

  upload: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
    flexWrap: "wrap"
  },

  btn: {
    background: "#065f46",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  },

  card: {
    background: "white",
    padding: "10px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    textAlign: "center"
  },

  // 🔥 IMPORTANT FIX (NO STRETCH)
  image: {
    width: "100%",
    height: "200px",
    objectFit: "contain",   // ✅ FIX
    background: "#f3f4f6",
    borderRadius: "10px",
    cursor: "pointer"
  },

  delete: {
    marginTop: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "6px"
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
    zIndex: 9999
  },

  modalImg: {
    maxWidth: "90%",
    maxHeight: "85%",
    borderRadius: "10px"
  }
};

export default GalleryAdmin;