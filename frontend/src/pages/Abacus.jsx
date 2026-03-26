import { useEffect } from "react";
import abacusImg from "../assets/abacusbg1.jpeg";

function Abacus() {
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
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
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
    `;
    
    if (!document.head.querySelector('#abacus-animations')) {
      styleSheet.id = 'abacus-animations';
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // cleanup
    };
  }, []);

  // Mastermind Abacus Specialities
  const specialities = [
    { 
      icon: "🧠", 
      title: "5X Faster Mental Math Skills", 
      desc: "Mastermind Abacus students can perform calculations 5 times faster with high accuracy, even faster than calculators.",
      color: "#f59e0b"
    },
    { 
      icon: "🧠", 
      title: "Whole Brain Development Program", 
      desc: "Not just math learning — it develops both left & right brain, improving Memory, Concentration, Creativity & Logical thinking.",
      color: "#10b981"
    },
    { 
      icon: "🎮", 
      title: "Play & Learn Method", 
      desc: "Fun-based learning with math games, interactive activities, and engaging exercises. Kids learn without fear of maths and stay interested.",
      color: "#8b5cf6"
    },
    { 
      icon: "💻", 
      title: "Online + Offline Flexible Learning", 
      desc: "Live online classes with virtual abacus & offline classroom training. Learn from anywhere with our first-of-its-kind Live Online Abacus Platform.",
      color: "#3b82f6"
    },
    { 
      icon: "📚", 
      title: "Structured Level-Based Curriculum", 
      desc: "8–10 levels with step-by-step progression from Easy → Advanced learning. Builds strong foundation gradually.",
      color: "#ef4444"
    },
    { 
      icon: "🏆", 
      title: "Competitions & Global Exposure", 
      desc: "State level, National level & International competitions. Boosts confidence & performance.",
      color: "#f97316"
    },
    { 
      icon: "🌍", 
      title: "Global Presence & Trusted Brand", 
      desc: "2000+ centers worldwide with presence in multiple countries. One of the most trusted abacus academies.",
      color: "#06b6d4"
    },
    { 
      icon: "👨‍👩‍👧", 
      title: "Improves Overall Academic Performance", 
      desc: "Not just maths — improves school performance, listening skills, confidence & problem solving ability.",
      color: "#a855f7"
    }
  ];

  const benefits = [
    { icon: "⚡", title: "5X Faster Calculation", desc: "Perform calculations 5 times faster than normal with high accuracy" },
    { icon: "🎯", title: "Better Concentration", desc: "Improves focus and attention span dramatically" },
    { icon: "💡", title: "Enhanced Memory", desc: "Strengthens both short-term & long-term memory" },
    { icon: "🚀", title: "Boosts Confidence", desc: "Builds self-esteem and academic confidence" },
    { icon: "📚", title: "Academic Excellence", desc: "Improves overall school performance across all subjects" },
    { icon: "🎨", title: "Creativity", desc: "Stimulates right brain creativity and imagination" },
    { icon: "🧩", title: "Problem Solving", desc: "Enhances logical thinking and analytical abilities" },
    { icon: "👂", title: "Listening Skills", desc: "Develops active listening and following instructions" }
  ];

  return (
    <div className="abacus-page">

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 className="golden-shine-title" style={styles.title}>
            🧮 Mastermind Abacus
          </h1>
          <p style={styles.subtitle}>
            Unlock Your Child's Brain Power | From Counting to Confidence
          </p>
          <div style={styles.heroBadge}>
            <span>✨ 5X Faster Mental Math ✨</span>
          </div>
          <p style={styles.heroTagline}>Make Math Fun, Fast & Fearless</p>
        </div>
      </div>

      {/* IMAGE */}
      <div style={styles.imageSection}>
        <div style={styles.imageWrapper}>
          <img src={abacusImg} alt="Mastermind Abacus Learning" style={styles.img} />
          <div style={styles.imageOverlay}>
            <span>Master the Art of Mental Math</span>
          </div>
        </div>
      </div>

      {/* MASTERMIND SPECIALITIES SECTION */}
      <div style={styles.specialitiesSection}>
        <div style={styles.sectionHeader}>
          <h2 className="golden-shine-sub" style={styles.heading}>
            🌟 Mastermind Abacus Specialities 🌟
          </h2>
          <div style={styles.divider}></div>
          <p style={styles.subHeading}>
            A globally trusted brain development program that helps children master mental math
          </p>
        </div>

        <div style={styles.specialitiesGrid}>
          {specialities.map((item, index) => (
            <div 
              key={index} 
              className="speciality-card"
              style={{
                ...styles.specialityCard,
                borderTop: `4px solid ${item.color}`,
                animationDelay: `${index * 0.05}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{...styles.specialityIcon, background: `${item.color}20`}}>
                {item.icon}
              </div>
              <h3 style={styles.specialityTitle}>{item.title}</h3>
              <p style={styles.specialityDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KEY BENEFITS SECTION */}
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2 className="golden-shine-sub" style={styles.heading}>
            🎯 Key Benefits of Abacus Training 🎯
          </h2>
          <div style={styles.divider}></div>
          <p style={styles.subHeading}>
            Transform your child's mathematical abilities with our proven abacus program
          </p>
        </div>

        <div style={styles.cards}>
          {benefits.map((item, index) => (
            <div 
              key={index} 
              className="benefit-card"
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 20px 35px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
              }}
            >
              <div style={styles.cardIcon}>{item.icon}</div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRAM DETAILS */}
      <div style={styles.programSection}>
        <div style={styles.programCard}>
          <h2 className="golden-shine-sub" style={styles.programHeading}>
            🎯 Program Highlights
          </h2>
          <div style={styles.programGrid}>
            <div style={styles.programItem}>
              <span>📅</span>
              <div>
                <strong>Duration:</strong> 8-12 Months (8-10 Levels)
              </div>
            </div>
            <div style={styles.programItem}>
              <span>👧</span>
              <div>
                <strong>Age Group:</strong> 5 - 14 Years
              </div>
            </div>
            <div style={styles.programItem}>
              <span>📖</span>
              <div>
                <strong>Class Schedule:</strong> Weekly 2 Classes
              </div>
            </div>
            <div style={styles.programItem}>
              <span>🏆</span>
              <div>
                <strong>Certification:</strong> Level-wise Certificate
              </div>
            </div>
            <div style={styles.programItem}>
              <span>💻</span>
              <div>
                <strong>Mode:</strong> Online & Offline Available
              </div>
            </div>
            <div style={styles.programItem}>
              <span>🌍</span>
              <div>
                <strong>Global:</strong> 2000+ Centers Worldwide
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUOTE SECTION */}
      <div style={styles.quoteSection}>
        <div style={styles.quoteCard}>
          <div style={styles.quoteIcon}>💡</div>
          <p style={styles.quoteText}>
            "Mastermind Abacus is not just about calculations — it's about unlocking your child's full potential. It develops both left & right brain, making learning fun, fast, and fearless!"
          </p>
          <div style={styles.quoteAuthor}>- Mastermind Abacus Team</div>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Unlock Your Child's Brain Power?</h2>
        <p style={styles.ctaText}>
          Limited seats available for the upcoming batch! Enroll now and give your child the gift of mental math mastery.
        </p>
        <div style={styles.btnGroup}>
          <a href="tel:919072000006" style={styles.callBtn}>
            📞 Call Now
          </a>
          <a href="https://wa.me/919072000006" target="_blank" rel="noreferrer" style={styles.whatsappBtn}>
            💬 WhatsApp
          </a>
          <a href="/admission" style={styles.enrollBtn}>
            🎓 Enroll Now
          </a>
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
        
        .speciality-card {
          animation: slideInLeft 0.5s ease-out forwards;
          opacity: 0;
          transform: translateX(-30px);
        }
        
        .benefit-card {
          animation: fadeInUp 0.5s ease-out;
          animation-fill-mode: backwards;
        }
        
        .benefit-card:nth-child(1) { animation-delay: 0.1s; }
        .benefit-card:nth-child(2) { animation-delay: 0.15s; }
        .benefit-card:nth-child(3) { animation-delay: 0.2s; }
        .benefit-card:nth-child(4) { animation-delay: 0.25s; }
        .benefit-card:nth-child(5) { animation-delay: 0.3s; }
        .benefit-card:nth-child(6) { animation-delay: 0.35s; }
        .benefit-card:nth-child(7) { animation-delay: 0.4s; }
        .benefit-card:nth-child(8) { animation-delay: 0.45s; }
        
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
    position: "relative",
    textAlign: "center",
    padding: "clamp(70px, 12vw, 100px) 20px",
    background: "linear-gradient(135deg, #065f46, #047857)",
    color: "white",
    overflow: "hidden",
  },

  heroOverlay: {
    position: "relative",
    zIndex: 2,
  },

  title: {
    fontSize: "clamp(32px, 6vw, 52px)",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "15px",
  },

  subtitle: {
    fontSize: "clamp(16px, 3vw, 20px)",
    marginTop: "10px",
    opacity: 0.95,
    color: "#d1fae5",
  },

  heroBadge: {
    display: "inline-block",
    marginTop: "20px",
    background: "rgba(255,215,0,0.2)",
    padding: "8px 20px",
    borderRadius: "40px",
    fontSize: "clamp(12px, 2.5vw, 14px)",
    fontWeight: "600",
    backdropFilter: "blur(10px)",
  },

  heroTagline: {
    marginTop: "15px",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    color: "#ffd966",
    fontStyle: "italic",
  },

  imageSection: {
    display: "flex",
    justifyContent: "center",
    marginTop: "-40px",
    marginBottom: "20px",
    padding: "0 20px",
  },

  imageWrapper: {
    position: "relative",
    maxWidth: "600px",
    width: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  },

  img: {
    width: "100%",
    height: "auto",
    display: "block",
    transition: "transform 0.5s ease",
  },

  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(6,95,70,0.9))",
    padding: "20px",
    textAlign: "center",
    color: "white",
    fontSize: "clamp(14px, 3vw, 18px)",
    fontWeight: "600",
  },

  specialitiesSection: {
    padding: "clamp(50px, 8vw, 80px) 20px",
    textAlign: "center",
    background: "linear-gradient(135deg, #fefaf0, #fefcf5)",
  },

  container: {
    padding: "clamp(50px, 8vw, 80px) 20px",
    textAlign: "center",
    background: "white",
  },

  sectionHeader: {
    marginBottom: "50px",
  },

  heading: {
    fontSize: "clamp(28px, 5vw, 38px)",
    marginBottom: "15px",
    display: "inline-block",
    fontWeight: "800",
  },

  divider: {
    width: "80px",
    height: "4px",
    background: "linear-gradient(90deg, #f59e0b, #10b981)",
    margin: "20px auto",
    borderRadius: "4px",
  },

  subHeading: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    color: "#4b5563",
    maxWidth: "600px",
    margin: "0 auto",
  },

  specialitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "clamp(25px, 3vw, 35px)",
    justifyContent: "center",
    maxWidth: "1300px",
    margin: "0 auto",
  },

  specialityCard: {
    background: "white",
    padding: "clamp(25px, 4vw, 30px)",
    borderRadius: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    textAlign: "center",
    borderTop: "4px solid #f59e0b",
  },

  specialityIcon: {
    fontSize: "clamp(48px, 7vw, 56px)",
    marginBottom: "15px",
    display: "inline-block",
    padding: "15px",
    borderRadius: "50%",
  },

  specialityTitle: {
    fontSize: "clamp(18px, 3vw, 20px)",
    fontWeight: "700",
    color: "#065f46",
    marginBottom: "12px",
  },

  specialityDesc: {
    fontSize: "clamp(13px, 2.2vw, 14px)",
    color: "#6b7280",
    lineHeight: "1.6",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "clamp(20px, 3vw, 30px)",
    justifyContent: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  card: {
    background: "linear-gradient(135deg, #ffffff, #fefaf0)",
    padding: "clamp(25px, 4vw, 30px)",
    borderRadius: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    textAlign: "center",
  },

  cardIcon: {
    fontSize: "clamp(42px, 7vw, 52px)",
    marginBottom: "15px",
  },

  cardTitle: {
    fontSize: "clamp(18px, 3vw, 20px)",
    fontWeight: "700",
    color: "#065f46",
    marginBottom: "10px",
  },

  cardDesc: {
    fontSize: "clamp(13px, 2.2vw, 14px)",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  programSection: {
    padding: "clamp(40px, 6vw, 60px) 20px",
    background: "#065f46",
  },

  programCard: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "white",
    padding: "clamp(30px, 5vw, 45px)",
    borderRadius: "28px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },

  programHeading: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: "700",
    marginBottom: "25px",
    display: "inline-block",
  },

  programGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  programItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    background: "#fefaf0",
    borderRadius: "15px",
    fontSize: "clamp(13px, 2.2vw, 14px)",
    color: "#374151",
    textAlign: "left",
  },

  quoteSection: {
    padding: "clamp(50px, 8vw, 70px) 20px",
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
  },

  quoteCard: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
    padding: "clamp(30px, 5vw, 40px)",
  },

  quoteIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },

  quoteText: {
    fontSize: "clamp(18px, 3vw, 22px)",
    lineHeight: "1.6",
    color: "#065f46",
    fontStyle: "italic",
    fontWeight: "500",
    marginBottom: "20px",
  },

  quoteAuthor: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    color: "#f59e0b",
    fontWeight: "600",
  },

  cta: {
    textAlign: "center",
    padding: "clamp(50px, 8vw, 70px) 20px",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    color: "white",
  },

  ctaTitle: {
    fontSize: "clamp(24px, 5vw, 32px)",
    fontWeight: "700",
    marginBottom: "15px",
  },

  ctaText: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    color: "#cbd5e1",
    marginBottom: "30px",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  btnGroup: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "clamp(12px, 2vw, 20px)",
    flexWrap: "wrap",
  },

  callBtn: {
    background: "linear-gradient(135deg, #fb923c, #ea580c)",
    padding: "clamp(10px, 2vw, 14px) clamp(20px, 4vw, 30px)",
    borderRadius: "40px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
  },

  whatsappBtn: {
    background: "linear-gradient(135deg, #25D366, #1da15f)",
    padding: "clamp(10px, 2vw, 14px) clamp(20px, 4vw, 30px)",
    borderRadius: "40px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(37, 211, 102, 0.4)",
  },

  enrollBtn: {
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    padding: "clamp(10px, 2vw, 14px) clamp(20px, 4vw, 30px)",
    borderRadius: "40px",
    color: "#065f46",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
  },
};

// Add hover effects and responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .abacus-page .call-btn:hover,
    .abacus-page .whatsapp-btn:hover,
    .abacus-page .enroll-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    
    .abacus-page .image-wrapper:hover img {
      transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
      .abacus-page .program-grid {
        grid-template-columns: 1fr;
      }
      
      .abacus-page .program-item {
        text-align: center;
        justify-content: center;
      }
      
      .abacus-page .specialities-grid {
        grid-template-columns: 1fr;
      }
      
      .abacus-page .cards {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }
    }
    
    @media (max-width: 480px) {
      .abacus-page .specialities-grid,
      .abacus-page .cards {
        grid-template-columns: 1fr;
      }
      
      .abacus-page .image-overlay {
        font-size: 12px;
        padding: 12px;
      }
      
      .abacus-page .btn-group {
        flex-direction: column;
        align-items: center;
      }
      
      .abacus-page .call-btn,
      .abacus-page .whatsapp-btn,
      .abacus-page .enroll-btn {
        width: 80%;
        max-width: 250px;
        text-align: center;
      }
      
      .abacus-page .quote-text {
        font-size: 16px;
      }
    }
  `;
  
  if (!document.head.querySelector('#abacus-styles')) {
    styleSheet.id = 'abacus-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Abacus;