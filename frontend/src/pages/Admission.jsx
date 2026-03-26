import { useEffect } from "react";
import bg from "../assets/bg1.jpeg";

function Admission() {
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
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
    `;
    
    if (!document.head.querySelector('#admission-animations')) {
      styleSheet.id = 'admission-animations';
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // cleanup
    };
  }, []);

  const phones = [
    "919072000006",
    "917736152643",
    "918089647380",
    "918547247851"
  ];

  const benefits = [
    "🎓 Quality Education with Islamic Values",
    "🏫 Safe & Nurturing Environment",
    "👩‍🏫 Experienced & Trained Teachers",
    "📚 Activity-Based Learning",
    "🕌 Islamic & Moral Education",
    "🎯 Holistic Child Development",
    "📊 Regular Parent-Teacher Interaction",
    "🏆 Extra-curricular Activities"
  ];

  return (
    <div className="admission-page">

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.overlay}>
          <h1 className="golden-shine-title" style={styles.title}>Admission Open 2026</h1>
          <p style={styles.subtitle}>
            "A better future starts with the right education"
          </p>
          <div style={styles.highlightWrapper}>
            <p style={styles.highlight}>
              🎯 Limited Seats • Enroll Now 🎯
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>

        {/* QUOTE */}
        <div style={styles.quoteBox}>
          <p style={styles.quote}>
            ✨ "Every child is unique. Give them the best environment to grow, learn and succeed." ✨
          </p>
        </div>

        {/* DESCRIPTION */}
        <p style={styles.text}>
          Admissions are now open for the academic year 2026.  
          At <strong>Paradise Islamic Pre-School, Pullur, Tirur</strong>, we combine modern education with strong Islamic values,
          ensuring your child grows academically, morally, and spiritually.
        </p>

        {/* BENEFITS SECTION */}
        <div style={styles.benefitsSection}>
          <h3 className="golden-shine-sub" style={styles.benefitsTitle}>✨ Why Choose Paradise? ✨</h3>
          <div style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} style={styles.benefitItem}>
                <span style={styles.benefitIcon}>✅</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PHONE NUMBERS */}
        <div style={styles.phoneBox}>
          <h3 style={styles.contactTitle}>📞 Contact Us for Admission</h3>
          <div style={styles.phonesGrid}>
            {phones.map((num, i) => (
              <a
                key={i}
                href={`tel:${num}`}
                style={styles.phone}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ecfdf5";
                  e.currentTarget.style.transform = "translateX(5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                📞 +91 {num.slice(2,5)} {num.slice(5,8)} {num.slice(8)}
              </a>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div style={styles.btnGroup}>
          <a href="tel:919072000006" style={styles.callBtn}>
            📞 Call Now
          </a>
          <a
            href="https://wa.me/919072000006"
            target="_blank"
            rel="noreferrer"
            style={styles.whatsappBtn}
          >
            💬 WhatsApp
          </a>
        </div>

        {/* VISIT INFO */}
        <div style={styles.visitInfo}>
          <p style={styles.visitText}>
            🏫 Visit us at: BHS Madrassa, Pullur, Tirur, Malappuram District, Kerala
          </p>
          <p style={styles.visitText}>
            🕐 Office Hours: Monday - Saturday | 9:00 AM - 5:00 PM
          </p>
        </div>

      </div>

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
        
        .golden-shine-sub {
          background: linear-gradient(
            90deg,
            #065f46,
            #f59e0b,
            #facc15,
            #fbbf24,
            #065f46
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: goldenShine 7s linear infinite;
          display: inline-block;
        }
        
        .admission-page .quote-box,
        .admission-page .benefits-section,
        .admission-page .phone-box,
        .admission-page .btn-group,
        .admission-page .visit-info {
          animation: fadeInUp 0.6s ease-out;
        }
        
        @media (max-width: 768px) {
          .golden-shine-title {
            animation: goldenShine 8s linear infinite;
          }
          .golden-shine-sub {
            animation: goldenShine 9s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  hero: {
    height: "clamp(450px, 65vh, 550px)",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(6,95,70,0.7) 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "white",
    padding: "20px",
  },

  title: {
    fontSize: "clamp(32px, 6vw, 52px)",
    fontWeight: "800",
    textShadow: "0 5px 20px rgba(0,0,0,0.5)",
    marginBottom: "15px",
  },

  subtitle: {
    marginTop: "10px",
    fontSize: "clamp(16px, 3.5vw, 20px)",
    color: "#f0fdf4",
    fontStyle: "italic",
  },

  highlightWrapper: {
    marginTop: "20px",
  },

  highlight: {
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    color: "#065f46",
    padding: "8px 20px",
    borderRadius: "40px",
    fontSize: "clamp(12px, 2.5vw, 14px)",
    fontWeight: "700",
    display: "inline-block",
    boxShadow: "0 4px 15px rgba(250, 204, 21, 0.3)",
    animation: "pulse 2s infinite",
  },

  container: {
    textAlign: "center",
    padding: "clamp(40px, 6vw, 60px) 20px",
    maxWidth: "1000px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #fefaf0, #fefcf5)",
  },

  quoteBox: {
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    padding: "clamp(20px, 4vw, 30px)",
    borderRadius: "24px",
    marginBottom: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    border: "1px solid rgba(6,95,70,0.1)",
  },

  quote: {
    fontStyle: "italic",
    color: "#065f46",
    fontWeight: "600",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    lineHeight: "1.6",
  },

  text: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    color: "#374151",
    marginBottom: "35px",
    lineHeight: "1.7",
    textAlign: "center",
  },

  benefitsSection: {
    background: "white",
    padding: "clamp(25px, 4vw, 35px)",
    borderRadius: "24px",
    marginBottom: "35px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  benefitsTitle: {
    fontSize: "clamp(20px, 3.5vw, 24px)",
    fontWeight: "700",
    marginBottom: "25px",
    display: "inline-block",
  },

  benefitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "12px",
    textAlign: "left",
  },

  benefitItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 15px",
    background: "#fefaf0",
    borderRadius: "12px",
    fontSize: "clamp(13px, 2.2vw, 14px)",
    color: "#374151",
    transition: "all 0.3s ease",
  },

  benefitIcon: {
    fontSize: "18px",
    color: "#f59e0b",
  },

  phoneBox: {
    marginBottom: "35px",
    background: "white",
    padding: "clamp(25px, 4vw, 35px)",
    borderRadius: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  contactTitle: {
    fontSize: "clamp(18px, 3vw, 20px)",
    fontWeight: "700",
    color: "#065f46",
    marginBottom: "20px",
  },

  phonesGrid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  phone: {
    display: "inline-block",
    margin: "5px 0",
    fontWeight: "600",
    color: "#065f46",
    textDecoration: "none",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    padding: "10px 20px",
    borderRadius: "40px",
    transition: "all 0.3s ease",
    background: "transparent",
    width: "auto",
    minWidth: "220px",
  },

  btnGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "clamp(15px, 3vw, 25px)",
    flexWrap: "wrap",
    width: "100%",
    marginBottom: "35px",
  },

  callBtn: {
    flex: "1 1 200px",
    maxWidth: "250px",
    textAlign: "center",
    padding: "clamp(12px, 2.5vw, 14px)",
    borderRadius: "50px",
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    boxShadow: "0 8px 20px rgba(6, 95, 70, 0.3)",
    transition: "all 0.3s ease",
  },

  whatsappBtn: {
    flex: "1 1 200px",
    maxWidth: "250px",
    textAlign: "center",
    padding: "clamp(12px, 2.5vw, 14px)",
    borderRadius: "50px",
    background: "linear-gradient(135deg, #25D366, #1da15f)",
    color: "white",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    boxShadow: "0 8px 20px rgba(37, 211, 102, 0.3)",
    transition: "all 0.3s ease",
  },

  visitInfo: {
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    padding: "clamp(20px, 3vw, 25px)",
    borderRadius: "20px",
    marginTop: "20px",
  },

  visitText: {
    fontSize: "clamp(12px, 2.2vw, 14px)",
    color: "#065f46",
    margin: "8px 0",
    fontWeight: "500",
  },
};

// Add hover effects and responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .admission-page .benefit-item:hover {
      transform: translateX(8px);
      background: #ecfdf5;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .admission-page .call-btn:hover,
    .admission-page .whatsapp-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 25px rgba(0,0,0,0.2);
    }
    
    .admission-page .phone:hover {
      background: #ecfdf5 !important;
      transform: translateX(8px) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    @media (max-width: 768px) {
      .admission-page .benefits-grid {
        grid-template-columns: 1fr;
      }
      
      .admission-page .btn-group {
        flex-direction: column;
        align-items: center;
      }
      
      .admission-page .call-btn,
      .admission-page .whatsapp-btn {
        max-width: 280px;
        width: 100%;
      }
      
      .admission-page .phones-grid {
        width: 100%;
      }
      
      .admission-page .phone {
        width: 100%;
        max-width: 280px;
        text-align: center;
      }
    }
    
    @media (max-width: 480px) {
      .admission-page .container {
        padding: 30px 16px;
      }
      
      .admission-page .benefits-section,
      .admission-page .phone-box {
        padding: 20px;
      }
      
      .admission-page .benefit-item {
        padding: 8px 12px;
        font-size: 12px;
      }
      
      .admission-page .visit-text {
        font-size: 11px;
      }
      
      .admission-page .quote {
        font-size: 13px;
      }
    }
  `;
  
  if (!document.head.querySelector('#admission-styles')) {
    styleSheet.id = 'admission-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Admission;