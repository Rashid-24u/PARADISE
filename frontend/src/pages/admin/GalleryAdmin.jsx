import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function GalleryAdmin() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isUploading, setIsUploading] = useState(false);

  const API = "http://127.0.0.1:8000/api/gallery/";

  // Check screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch images
  const fetchImages = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Auto hide message
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Validate image
  const validateImage = (file) => {
    if (!file) {
      return "Please select an image";
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Only JPG, PNG, GIF, and WEBP images are allowed";
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const error = validateImage(selectedFile);
    if (error) {
      setMessage(error);
      setMessageType("error");
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMessage("");
  };

  // Upload image
  const uploadImage = async () => {
    const error = validateImage(file);
    if (error) {
      setMessage(error);
      setMessageType("error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      await fetch(API, {
        method: "POST",
        body: formData,
      });
      
      setMessage("✅ Image uploaded successfully");
      setMessageType("success");
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchImages();
    } catch (error) {
      setMessage("❌ Error uploading image");
      setMessageType("error");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete image
  const deleteImage = async (id, imageIndex) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this image?");
    if (!confirmDelete) return;

    try {
      await fetch(API + id + "/", {
        method: "DELETE",
      });
      setMessage("🗑️ Image deleted successfully");
      setMessageType("success");
      
      // Close modal if the deleted image is currently viewed
      if (selectedImage === imageIndex) {
        setSelectedImage(null);
      }
      
      fetchImages();
    } catch (error) {
      setMessage("❌ Error deleting image");
      setMessageType("error");
    }
  };

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage !== null) {
        if (e.key === "ArrowLeft") {
          setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        } else if (e.key === "ArrowRight") {
          setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        } else if (e.key === "Escape") {
          setSelectedImage(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, images.length]);

  return (
    <div style={styles.container}>
      {/* BACK BUTTON */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate("/admin-dashboard")}>
          ⬅ {isMobile ? "Back" : "Back to Dashboard"}
        </button>
      </div>

      <h2 style={styles.title}>Gallery Management</h2>

      {/* MESSAGE */}
      {message && (
        <div style={{...styles.message, ...(messageType === "error" ? styles.errorMessage : {})}}>
          {message}
        </div>
      )}

      {/* UPLOAD SECTION */}
      <div style={styles.uploadCard}>
        <h3 style={styles.sectionTitle}>Upload New Image</h3>
        
        <div style={styles.uploadArea}>
          {preview ? (
            <div style={styles.previewContainer}>
              <img src={preview} style={styles.previewImage} alt="Preview" />
              <button
                style={styles.removePreview}
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
              <div style={styles.uploadIcon}>📸</div>
              <p style={styles.uploadText}>Click to select an image</p>
              <p style={styles.uploadHint}>JPG, PNG, GIF, WEBP (Max 5MB)</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={styles.hiddenInput}
          />
          
          {file && (
            <button
              style={styles.uploadBtn}
              onClick={uploadImage}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "📤 Upload Image"}
            </button>
          )}
        </div>
      </div>

      {/* GALLERY GRID */}
      <div style={styles.gallerySection}>
        <div style={styles.galleryHeader}>
          <h3 style={styles.sectionTitle}>
            Gallery Images ({images.length})
          </h3>
          {images.length > 0 && (
            <span style={styles.imageCount}>
              {images.length} {images.length === 1 ? "image" : "images"}
            </span>
          )}
        </div>

        {images.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🖼️</div>
            <p style={styles.emptyText}>No images in gallery yet</p>
            <p style={styles.emptyHint}>Upload your first image to get started</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {images.map((img, index) => (
              <div key={img.id} style={styles.card}>
                <div style={styles.imageWrapper}>
                  <img
                    src={img.image}
                    alt={`Gallery ${index + 1}`}
                    style={styles.image}
                    onClick={() => setSelectedImage(index)}
                    loading="lazy"
                  />
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteImage(img.id, index)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULLSCREEN MODAL */}
      {selectedImage !== null && images[selectedImage] && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <button
            style={styles.modalClose}
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          
          <button
            style={{...styles.modalNav, ...styles.modalPrev}}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            }}
          >
            ‹
          </button>
          
          <img
            src={images[selectedImage].image}
            style={styles.modalImg}
            alt="Full size"
          />
          
          <button
            style={{...styles.modalNav, ...styles.modalNext}}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            }}
          >
            ›
          </button>
          
          <div style={styles.modalInfo}>
            <span>
              {selectedImage + 1} / {images.length}
            </span>
            <button
              style={styles.modalDelete}
              onClick={(e) => {
                e.stopPropagation();
                deleteImage(images[selectedImage].id, selectedImage);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "15px",
    maxWidth: "1200px",
    margin: "auto",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  topBar: {
    marginBottom: "15px",
  },

  backBtn: {
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    WebkitTapHighlightColor: "transparent",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "clamp(24px, 6vw, 32px)",
    fontWeight: "700",
    background: "linear-gradient(135deg, #065f46, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  message: {
    background: "#dcfce7",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "center",
    color: "#065f46",
    fontWeight: "500",
    border: "1px solid #a7f3d0",
    fontSize: "14px",
  },

  errorMessage: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
  },

  uploadCard: {
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginBottom: "30px",
    border: "1px solid #e5e7eb",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "15px",
  },

  uploadArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },

  uploadPlaceholder: {
    width: "100%",
    maxWidth: "400px",
    height: "200px",
    border: "2px dashed #d1d5db",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#f9fafb",
  },

  uploadIcon: {
    fontSize: "48px",
    marginBottom: "10px",
  },

  uploadText: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "5px",
  },

  uploadHint: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  previewContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
  },

  previewImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "2px solid #10b981",
  },

  removePreview: {
    position: "absolute",
    top: "-10px",
    right: "-10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
  },

  hiddenInput: {
    display: "none",
  },

  uploadBtn: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
    WebkitTapHighlightColor: "transparent",
  },

  gallerySection: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  galleryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },

  imageCount: {
    fontSize: "13px",
    color: "#6b7280",
    background: "#f3f4f6",
    padding: "4px 12px",
    borderRadius: "20px",
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },

  emptyText: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "8px",
  },

  emptyHint: {
    fontSize: "13px",
    color: "#9ca3af",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },

  imageWrapper: {
    position: "relative",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    transition: "transform 0.3s",
    display: "block",
  },

  deleteBtn: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s",
    opacity: 0.9,
    WebkitTapHighlightColor: "transparent",
  },

  // Modal Styles
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.95)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    cursor: "pointer",
  },

  modalClose: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    zIndex: 10,
    WebkitTapHighlightColor: "transparent",
  },

  modalNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    zIndex: 10,
    WebkitTapHighlightColor: "transparent",
  },

  modalPrev: {
    left: "20px",
  },

  modalNext: {
    right: "20px",
  },

  modalImg: {
    maxWidth: "90%",
    maxHeight: "85%",
    objectFit: "contain",
    borderRadius: "8px",
  },

  modalInfo: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    zIndex: 10,
  },

  modalDelete: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "4px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    WebkitTapHighlightColor: "transparent",
  },
};

export default GalleryAdmin;