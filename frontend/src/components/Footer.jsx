import { useEffect } from "react";

function Footer() {
  // Add animation keyframes dynamically
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes shine {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulseGlow {
        0%, 100% {
          opacity: 0.6;
        }
        50% {
          opacity: 1;
        }
      }
    `;
    
    if (!document.head.querySelector('#footer-animations')) {
      styleSheet.id = 'footer-animations';
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // Optional: cleanup if needed
    };
  }, []);

  return (
    <footer style={styles.footer}>
      {/* Shining light effect overlay */}
      <div className="shine-overlay" style={styles.shineOverlay}></div>
      
      <div style={styles.container}>
        <div style={styles.content}>
          {/* Animated logo with shine effect */}
          <div className="logo-wrapper" style={styles.logoWrapper}>
            <h2 style={styles.logo}>
              <span className="logo-shine" style={styles.logoShine}>
                Paradise Islamic Pre-School
              </span>
            </h2>
          </div>

          <p style={styles.tagline}>
            Learn Today, Lead Tomorrow
          </p>

          {/* Quick Links */}
          <div style={styles.linksContainer}>
            <div style={styles.linksGroup}>
              <h4 style={styles.linkTitle}>Quick Links</h4>
              <ul style={styles.linkList}>
                <li><a href="/about" style={styles.link}>About Us</a></li>
                <li><a href="/courses" style={styles.link}>Courses</a></li>
                <li><a href="/gallery" style={styles.link}>Gallery</a></li>
                <li><a href="/contact" style={styles.link}>Contact</a></li>
              </ul>
            </div>
            
            <div style={styles.linksGroup}>
              <h4 style={styles.linkTitle}>Contact Info</h4>
              <ul style={styles.linkList}>
                <li style={styles.contactItem}>📞 <a href="tel:919072000006" style={styles.link}>+91 90720 00006</a></li>
                <li style={styles.contactItem}>💬 <a href="https://wa.me/919072000006" target="_blank" rel="noreferrer" style={styles.link}>WhatsApp</a></li>
                <li style={styles.contactItem}>📧 <a href="mailto:info@paradiseislamic.com" style={styles.link}>info@paradiseislamic.com</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © 2026 Paradise Islamic Pre-School | All Rights Reserved
          </p>
          <p style={styles.developer}>
            Designed with ❤️ for young minds
          </p>
        </div>
      </div>

      <style jsx="true">{`
        /* Additional inline styles for shine effect */
        .shine-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            rgba(255, 215, 0, 0.15),
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shine 8s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        
        .logo-shine {
          position: relative;
          display: inline-block;
          background: linear-gradient(
            90deg,
            #ffffff,
            #facc15,
            #ffd966,
            #ffffff
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 5s linear infinite;
        }
        
        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        /* Responsive animations */
        @media (max-width: 768px) {
          .shine-overlay {
            animation: shine 12s ease-in-out infinite;
          }
        }
      `}</style>
    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
    color: "white",
    marginTop: "0",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif",
  },

  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "0 24px",
    position: "relative",
    zIndex: 2,
  },

  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.1), rgba(255,215,0,0.2), rgba(255,215,0,0.1), transparent)",
    backgroundSize: "200% 100%",
    pointerEvents: "none",
    zIndex: 1,
  },

  content: {
    textAlign: "center",
    padding: "50px 20px 40px",
    animation: "fadeInUp 0.6s ease-out",
  },

  logoWrapper: {
    marginBottom: "15px",
  },

  logo: {
    margin: 0,
    fontSize: "clamp(20px, 5vw, 28px)",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    position: "relative",
    display: "inline-block",
  },

  logoShine: {
    background: "linear-gradient(90deg, #ffffff, #facc15, #ffd966, #ffffff)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animation: "shine 5s linear infinite",
  },

  tagline: {
    marginTop: "10px",
    fontSize: "clamp(12px, 3vw, 16px)",
    color: "#d1fae5",
    letterSpacing: "1px",
    fontWeight: "500",
  },

  linksContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "clamp(40px, 8vw, 100px)",
    flexWrap: "wrap",
    marginTop: "40px",
    marginBottom: "30px",
  },

  linksGroup: {
    textAlign: "center",
    minWidth: "160px",
  },

  linkTitle: {
    fontSize: "clamp(14px, 3vw, 18px)",
    fontWeight: "700",
    marginBottom: "15px",
    color: "#facc15",
    position: "relative",
    display: "inline-block",
  },

  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  link: {
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: "clamp(12px, 2.5vw, 14px)",
    transition: "all 0.3s ease",
    display: "inline-block",
    padding: "6px 0",
    position: "relative",
  },

  contactItem: {
    color: "#e2e8f0",
    fontSize: "clamp(12px, 2.5vw, 14px)",
    padding: "6px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  bottom: {
    textAlign: "center",
    padding: "20px 20px 25px",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    marginTop: "10px",
  },

  copyright: {
    fontSize: "clamp(11px, 2.5vw, 13px)",
    margin: "0 0 8px 0",
    color: "#cbd5e1",
  },

  developer: {
    fontSize: "clamp(10px, 2vw, 12px)",
    margin: 0,
    color: "#9ca3af",
  },
};

// Add hover effects styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    /* Link hover effects */
    .footer-link:hover {
      color: #facc15 !important;
      transform: translateX(3px);
    }
    
    .contact-item a:hover {
      color: #facc15 !important;
      transform: translateX(3px);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .footer-links-container {
        gap: 40px !important;
      }
      
      .footer-links-group {
        min-width: 140px !important;
      }
    }
    
    @media (max-width: 480px) {
      .footer-links-container {
        flex-direction: column;
        gap: 30px !important;
        align-items: center;
      }
      
      .footer-links-group {
        width: 100%;
        max-width: 250px;
      }
    }
  `;
  
  if (!document.head.querySelector('#footer-hover-styles')) {
    styleSheet.id = 'footer-hover-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Footer;