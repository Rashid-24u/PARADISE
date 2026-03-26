import { useEffect, useState } from "react";

function Notice() {
  const [notices, setNotices] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/notices/")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .sort((a, b) => b.is_important - a.is_important);

        setNotices(sorted);
        setIsLoading(false);
      })
      .catch((err) => {
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
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes pulseImportant {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
        }
        50% {
          box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
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
      
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
    `;
    
    if (!document.head.querySelector('#notice-animations')) {
      styleSheet.id = 'notice-animations';
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // cleanup
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <div className="notice-page">

      {/* HEADER */}
      <div style={styles.header}>
        <h1 className="golden-shine-title" style={styles.title}>Notice Board</h1>
        <p style={styles.subtitle}>Latest Updates & Announcements 🔔</p>
      </div>

      <div style={styles.container}>
        {isLoading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.loader}></div>
            <p style={styles.loadingText}>Loading notices...</p>
          </div>
        ) : notices.length > 0 ? (
          notices.map((n, index) => (
            <div
              key={n.id}
              className="notice-card"
              style={{
                ...styles.card,
                ...(n.is_important ? styles.importantCard : {}),
              }}
            >
              {/* IMAGE SECTION - FULL SIZE WITHIN CARD */}
              {n.image_url && (
                <div style={styles.imageSection}>
                  <div style={styles.imageWrapper}>
                    <img
                      src={n.image_url}
                      alt={n.title}
                      style={styles.image}
                    />
                    <div 
                      className="image-overlay" 
                      onClick={() => setSelectedImage(n.image_url)}
                    >
                      <span className="zoom-icon">🔍</span>
                      <span className="zoom-text">Click to view full size</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.content}>
                <div style={styles.dateWrapper}>
                  <span style={styles.dateIcon}>📅</span>
                  <span style={styles.date}>
                    {new Date(n.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div style={styles.titleWrapper}>
                  <h3 style={styles.noticeTitle}>
                    {n.title}
                  </h3>
                  {n.is_important && (
                    <span style={styles.badge}>
                      <span style={styles.badgeIcon}>⚠️</span> Important
                    </span>
                  )}
                </div>

                <p style={styles.noticeContent}>{n.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>📢</div>
            <p style={styles.emptyTitle}>No notices available</p>
            <p style={styles.emptySub}>Check back later for important updates</p>
          </div>
        )}
      </div>

      {/* MODAL - FULL SIZE IMAGE VIEW */}
      {selectedImage && (
        <div style={styles.modal} onClick={() => setSelectedImage(null)}>
          <span style={styles.closeBtn} onClick={() => setSelectedImage(null)}>✖</span>
          <div style={styles.modalContent}>
            <img 
              src={selectedImage} 
              alt="Notice full view" 
              style={styles.modalImg} 
            />
          </div>
          <div style={styles.modalCaption}>
            Click anywhere or press ESC to close
          </div>
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
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        
        .notice-card {
          animation: slideInLeft 0.5s ease-out forwards;
          opacity: 0;
          transform: translateX(-30px);
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(6, 95, 70, 0.9), rgba(6, 95, 70, 0.8));
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 16px;
          backdrop-filter: blur(4px);
        }
        
        .image-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }
        
        .image-wrapper:hover .image-overlay {
          opacity: 1;
        }
        
        .image-wrapper:hover img {
          transform: scale(1.05);
        }
        
        .zoom-icon {
          font-size: 40px;
          color: white;
          animation: zoomIn 0.3s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .zoom-text {
          font-size: 14px;
          color: white;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        
        @media (max-width: 768px) {
          .golden-shine-title {
            animation: goldenShine 8s linear infinite;
          }
          
          .zoom-icon {
            font-size: 32px;
          }
          
          .zoom-text {
            font-size: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .zoom-icon {
            font-size: 28px;
          }
          
          .zoom-text {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  header: {
    textAlign: "center",
    padding: "clamp(50px, 10vw, 70px) 20px",
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    position: "relative",
    overflow: "hidden",
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

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "clamp(40px, 6vw, 60px) 20px",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(30px, 5vw, 40px)",
  },

  loaderContainer: {
    textAlign: "center",
    padding: "60px",
  },

  loader: {
    width: "50px",
    height: "50px",
    border: "4px solid #ecfdf5",
    borderTop: "4px solid #f59e0b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },

  loadingText: {
    marginTop: "20px",
    color: "#065f46",
    fontSize: "16px",
  },

  card: {
    background: "white",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 15px 35px -12px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    border: "1px solid rgba(6, 95, 70, 0.1)",
  },

  importantCard: {
    borderLeft: "5px solid #ef4444",
    boxShadow: "0 15px 35px -12px rgba(239, 68, 68, 0.15)",
  },

  imageSection: {
    padding: "20px 20px 0 20px",
  },

  imageWrapper: {
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  image: {
    width: "100%",
    height: "auto",
    maxHeight: "500px",
    objectFit: "contain",
    display: "block",
    transition: "transform 0.5s ease",
    background: "#f8fafc",
  },

  content: {
    padding: "clamp(20px, 4vw, 30px)",
  },

  dateWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },

  dateIcon: {
    fontSize: "14px",
  },

  date: {
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    padding: "6px 16px",
    borderRadius: "30px",
    fontSize: "clamp(11px, 2vw, 12px)",
    fontWeight: "600",
    color: "#065f46",
    display: "inline-block",
  },

  titleWrapper: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "15px",
  },

  noticeTitle: {
    fontSize: "clamp(18px, 3.5vw, 22px)",
    fontWeight: "700",
    color: "#065f46",
    margin: 0,
    flex: 1,
    lineHeight: 1.3,
  },

  badge: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    fontSize: "clamp(10px, 2vw, 11px)",
    padding: "5px 14px",
    borderRadius: "30px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    animation: "pulseImportant 2s infinite",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
  },

  badgeIcon: {
    fontSize: "10px",
  },

  noticeContent: {
    fontSize: "clamp(14px, 2.5vw, 15px)",
    color: "#4b5563",
    lineHeight: "1.7",
    marginTop: "8px",
  },

  emptyContainer: {
    textAlign: "center",
    padding: "clamp(60px, 10vw, 100px) 20px",
  },

  emptyIcon: {
    fontSize: "80px",
    marginBottom: "20px",
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: "clamp(20px, 4vw, 24px)",
    fontWeight: "600",
    color: "#065f46",
    marginBottom: "10px",
  },

  emptySub: {
    fontSize: "clamp(14px, 2.5vw, 15px)",
    color: "#6b7280",
  },

  // MODAL - FULL SIZE IMAGE
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.95)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    cursor: "pointer",
    animation: "fadeInUp 0.3s ease",
  },

  modalContent: {
    maxWidth: "95vw",
    maxHeight: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  closeBtn: {
    position: "absolute",
    top: "clamp(20px, 5vw, 30px)",
    right: "clamp(20px, 5vw, 30px)",
    color: "white",
    fontSize: "clamp(28px, 5vw, 36px)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    zIndex: 10000,
    background: "rgba(0,0,0,0.5)",
    width: "clamp(45px, 8vw, 55px)",
    height: "clamp(45px, 8vw, 55px)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(5px)",
  },

  modalImg: {
    maxWidth: "95vw",
    maxHeight: "90vh",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: "12px",
    animation: "zoomIn 0.3s ease",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },

  modalCaption: {
    position: "absolute",
    bottom: "clamp(20px, 5vw, 30px)",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.7)",
    fontSize: "clamp(11px, 2vw, 13px)",
    background: "rgba(0,0,0,0.6)",
    padding: "8px 20px",
    borderRadius: "30px",
    pointerEvents: "none",
    backdropFilter: "blur(5px)",
    whiteSpace: "nowrap",
  },
};

// Add global animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulseImportant {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
      }
      50% {
        box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
      }
    }
    
    /* Card hover effects */
    .notice-page .notice-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 25px 45px -15px rgba(0,0,0,0.2);
    }
    
    .notice-page .close-btn:hover {
      transform: scale(1.1);
      background: rgba(255,255,255,0.3);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .notice-page .container {
        padding: 30px 16px;
        gap: 25px;
      }
      
      .notice-page .content {
        padding: 20px;
      }
      
      .notice-page .title-wrapper {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .notice-page .close-btn {
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        font-size: 24px;
      }
      
      .notice-page .modal-img {
        max-width: 98vw;
        max-height: 85vh;
      }
      
      .notice-page .modal-caption {
        white-space: nowrap;
        font-size: 10px;
        padding: 6px 16px;
      }
      
      .notice-page .image-section {
        padding: 16px 16px 0 16px;
      }
    }
    
    @media (max-width: 480px) {
      .notice-page .container {
        padding: 20px 12px;
        gap: 20px;
      }
      
      .notice-page .content {
        padding: 16px;
      }
      
      .notice-page .date {
        font-size: 10px;
        padding: 4px 12px;
      }
      
      .notice-page .notice-title {
        font-size: 16px;
      }
      
      .notice-page .notice-content {
        font-size: 13px;
      }
      
      .notice-page .badge {
        font-size: 9px;
        padding: 3px 10px;
      }
      
      .notice-page .image-section {
        padding: 12px 12px 0 12px;
      }
      
      .notice-page .modal-img {
        max-width: 98vw;
        max-height: 80vh;
      }
      
      .notice-page .modal-caption {
        font-size: 9px;
        padding: 5px 12px;
        bottom: 15px;
      }
      
      .notice-page .zoom-icon {
        font-size: 28px;
      }
      
      .notice-page .zoom-text {
        font-size: 10px;
      }
    }
  `;
  
  if (!document.head.querySelector('#notice-styles')) {
    styleSheet.id = 'notice-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Notice;