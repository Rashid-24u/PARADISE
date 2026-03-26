import { useEffect, useState } from "react";

function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/gallery/")
      .then(res => res.json())
      .then(data => {
        setImages(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  // Add animations
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes goldenShine {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    
    if (!document.head.querySelector('#gallery-animations')) {
      styleSheet.id = 'gallery-animations';
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // cleanup
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage !== null) {
        if (e.key === 'ArrowLeft') {
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'Escape') {
          setSelectedImage(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, images]);

  const handlePrev = () => {
    setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
  };

  const handleNext = () => {
    setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
  };

  return (
    <div className="gallery-page">

      {/* HERO */}
      <div style={styles.header}>
        <h1 className="golden-shine-title" style={styles.title}>Gallery</h1>
        <p style={styles.subtitle}>
          Capturing Beautiful Moments of Paradise Islamic Pre-School
        </p>
      </div>

      {/* GRID */}
      <div style={styles.container}>
        {isLoading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.loader}></div>
            <p style={styles.loadingText}>Loading memories...</p>
          </div>
        ) : images.length > 0 ? (
          images.map((img, index) => (
            <div 
              key={img.id} 
              style={styles.card}
              className="gallery-card"
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={img.image}
                alt={`Gallery ${index + 1}`}
                style={styles.img}
              />
              <div className="card-overlay">
                <span className="view-icon">🔍</span>
                <span className="view-text">View</span>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyContainer}>
            <p style={styles.empty}>📸 No images uploaded yet</p>
            <p style={styles.emptySub}>Check back soon for beautiful memories!</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedImage !== null && images.length > 0 && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <span style={styles.close} onClick={() => setSelectedImage(null)}>✖</span>
          
          <div style={styles.modalContent}>
            <img
              src={images[selectedImage].image}
              alt="Full size"
              style={styles.modalImg}
            />
            
            {/* Image Counter */}
            <div style={styles.counter}>
              {selectedImage + 1} / {images.length}
            </div>
          </div>

          {/* PREV BUTTON */}
          <button
            style={styles.prev}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.4)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            ❮
          </button>

          {/* NEXT BUTTON */}
          <button
            style={styles.next}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.4)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            ❯
          </button>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes goldenShine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .golden-shine-title {
          background: linear-gradient(
            90deg,
            #ffffff,
            #fbbf24,
            #f59e0b,
            #facc15,
            #ffd966,
            #fbbf24,
            #ffffff
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: goldenShine 6s linear infinite;
          display: inline-block;
        }
        
        .gallery-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        
        .gallery-card .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(6, 95, 70, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          color: white;
        }
        
        .gallery-card:hover .card-overlay {
          opacity: 1;
        }
        
        .gallery-card .view-icon {
          font-size: 32px;
          margin-bottom: 8px;
          animation: slideIn 0.3s ease;
        }
        
        .gallery-card .view-text {
          font-size: 14px;
          font-weight: 500;
        }
        
        .gallery-card img {
          transition: transform 0.5s ease;
        }
        
        .gallery-card:hover img {
          transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
          .golden-shine-title {
            animation: goldenShine 8s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  // 🔥 HEADER
  header: {
    textAlign: "center",
    padding: "clamp(50px, 10vw, 70px) 20px",
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
  },

  title: {
    fontSize: "clamp(32px, 6vw, 48px)",
    fontWeight: "800",
    marginBottom: "10px",
  },

  subtitle: {
    marginTop: "10px",
    color: "#d1fae5",
    fontSize: "clamp(14px, 3vw, 16px)",
  },

  // 🔥 GRID
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "clamp(20px, 3vw, 25px)",
    padding: "clamp(40px, 6vw, 60px) 20px",
    maxWidth: "1300px",
    margin: "0 auto",
    minHeight: "400px",
  },

  // 🔥 CARD
  card: {
    borderRadius: "16px",
    overflow: "hidden",
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    aspectRatio: "1 / 1",
    cursor: "pointer",
    position: "relative",
    animation: "fadeInUp 0.5s ease-out",
  },

  // 🔥 IMAGE
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },

  loaderContainer: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "60px",
  },

  loader: {
    width: "50px",
    height: "50px",
    border: "4px solid #ecfdf5",
    borderTop: "4px solid #f59e0b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "20px",
    color: "#065f46",
    fontSize: "16px",
  },

  emptyContainer: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px",
  },

  empty: {
    fontSize: "clamp(16px, 4vw, 20px)",
    color: "#065f46",
    fontWeight: "600",
    marginBottom: "10px",
  },

  emptySub: {
    fontSize: "clamp(13px, 2.5vw, 14px)",
    color: "#6b7280",
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
    zIndex: 9999,
    animation: "fadeInUp 0.3s ease",
  },

  modalContent: {
    position: "relative",
    maxWidth: "90%",
    maxHeight: "90%",
  },

  modalImg: {
    maxWidth: "90vw",
    maxHeight: "85vh",
    borderRadius: "12px",
    objectFit: "contain",
    animation: "zoomIn 0.3s ease",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  },

  counter: {
    position: "absolute",
    bottom: "-40px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },

  close: {
    position: "absolute",
    top: "20px",
    right: "30px",
    color: "white",
    fontSize: "clamp(28px, 5vw, 36px)",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    zIndex: 10000,
    background: "rgba(0,0,0,0.5)",
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  prev: {
    position: "absolute",
    left: "clamp(10px, 3vw, 30px)",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "clamp(24px, 4vw, 32px)",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    width: "clamp(45px, 6vw, 55px)",
    height: "clamp(45px, 6vw, 55px)",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(5px)",
  },

  next: {
    position: "absolute",
    right: "clamp(10px, 3vw, 30px)",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "clamp(24px, 4vw, 32px)",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    width: "clamp(45px, 6vw, 55px)",
    height: "clamp(45px, 6vw, 55px)",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(5px)",
  },
};

// Add global animations and spin keyframe
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Hover effects */
    .gallery-page .close:hover {
      transform: scale(1.1);
      background: rgba(255,255,255,0.3);
    }
    
    .gallery-page .prev:hover,
    .gallery-page .next:hover {
      transform: translateY(-50%) scale(1.1);
      background: rgba(255,255,255,0.4);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .gallery-page .container {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
        padding: 30px 16px;
      }
      
      .gallery-page .modal-img {
        max-width: 95vw;
        max-height: 80vh;
      }
      
      .gallery-page .counter {
        bottom: -35px;
        font-size: 12px;
        padding: 4px 12px;
      }
      
      .gallery-page .close {
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        font-size: 24px;
      }
    }
    
    @media (max-width: 480px) {
      .gallery-page .container {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
        padding: 20px 12px;
      }
      
      .gallery-page .card {
        border-radius: 12px;
      }
      
      .gallery-page .view-icon {
        font-size: 24px;
      }
      
      .gallery-page .view-text {
        font-size: 11px;
      }
      
      .gallery-page .prev,
      .gallery-page .next {
        width: 35px;
        height: 35px;
        font-size: 18px;
      }
      
      .gallery-page .counter {
        bottom: -30px;
        font-size: 10px;
      }
    }
  `;
  
  if (!document.head.querySelector('#gallery-styles')) {
    styleSheet.id = 'gallery-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Gallery;