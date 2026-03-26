import { useEffect } from "react";

function Contact() {
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
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
    `;
    
    if (!document.head.querySelector('#contact-animations')) {
      styleSheet.id = 'contact-animations';
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // cleanup
    };
  }, []);

  const phones = [
    "917736152643",
    "918089647380",
    "918547247851"
  ];

  const branchInfo = {
    name: "Paradise Islamic Pre-School",
    location: "Pullur, Tirur",
    address: "BHS Madrassa, Pullur, Tirur, Malappuram District, Kerala",
    operatedBy: "Khiller Hajji Memorial Educational and Charitable Society",
    established: "2025",
    network: "Paradise Islamic School Network"
  };

  return (
    <div className="contact-page">

      {/* HEADER */}
      <div style={styles.header}>
        <h1 className="golden-shine-title" style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>
          Get in touch with us for admissions & details
        </p>
      </div>

      {/* BRANCH INFORMATION SECTION - NEW */}
      <div style={styles.branchSection}>
        <div className="branch-card" style={styles.branchCard}>
          <h2 className="golden-shine-sub" style={styles.branchHeading}>🏫 Our Branch</h2>
          <div style={styles.branchDetails}>
            <div style={styles.branchItem}>
              <span style={styles.branchIcon}>📍</span>
              <div>
                <strong>Location:</strong> {branchInfo.location}
                <br />
                <span style={styles.branchAddress}>{branchInfo.address}</span>
              </div>
            </div>
            <div style={styles.branchItem}>
              <span style={styles.branchIcon}>🏢</span>
              <div>
                <strong>Operated By:</strong> {branchInfo.operatedBy}
              </div>
            </div>
            <div style={styles.branchItem}>
              <span style={styles.branchIcon}>🌐</span>
              <div>
                <strong>Part of:</strong> {branchInfo.network}
              </div>
            </div>
            <div style={styles.branchItem}>
              <span style={styles.branchIcon}>📅</span>
              <div>
                <strong>Established:</strong> {branchInfo.established}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div style={styles.container}>

        {/* LOCATION */}
        <div style={styles.card}>
          <h2 style={styles.heading}>📍 Location</h2>
          <p style={styles.text}>
            {branchInfo.address}
          </p>
          {/* 🔥 CLICKABLE MAP LINK */}
          <a
            href="https://maps.app.goo.gl/FujCNsQXmWJZnhr46"
            target="_blank"
            rel="noreferrer"
            style={styles.mapBtn}
          >
            View on Google Maps
          </a>
        </div>

        {/* PHONE */}
        <div style={styles.card}>
          <h2 style={styles.heading}>📞 Call Us</h2>
          {phones.map((num, i) => (
            <a key={i} href={`tel:${num}`} style={styles.link}>
              📞 +91 {num.slice(2,5)} {num.slice(5,8)} {num.slice(8)}
            </a>
          ))}
        </div>

        {/* WHATSAPP */}
        <div style={styles.card}>
          <h2 style={styles.heading}>💬 WhatsApp</h2>
          <a
            href="https://wa.me/919072000006"
            target="_blank"
            rel="noreferrer"
            style={styles.whatsappBtn}
          >
            Chat on WhatsApp
          </a>
        </div>

      </div>

      {/* 🔥 EMBEDDED MAP */}
      <div style={styles.mapSection}>
        <iframe
          title="map"
          src="https://maps.google.com/maps?q=BHS%20Madrassa%20Pullur%20Tirur&t=&z=15&ie=UTF8&iwloc=&output=embed"
          style={styles.map}
        ></iframe>
      </div>

      <style jsx="true">{`
        /* Golden Shine Animation */
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

        .branch-card {
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
    fontSize: "clamp(14px, 3vw, 18px)",
  },

  // Branch Section
  branchSection: {
    padding: "40px 20px 0 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  branchCard: {
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    padding: "clamp(25px, 4vw, 35px)",
    borderRadius: "24px",
    boxShadow: "0 15px 35px -12px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },

  branchHeading: {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: "700",
    marginBottom: "20px",
    display: "inline-block",
  },

  branchDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  branchItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    color: "#374151",
    lineHeight: "1.5",
  },

  branchIcon: {
    fontSize: "20px",
    minWidth: "30px",
  },

  branchAddress: {
    fontSize: "clamp(13px, 2.2vw, 14px)",
    color: "#6b7280",
  },

  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "clamp(20px, 3vw, 30px)",
    justifyContent: "center",
    padding: "50px 20px",
    maxWidth: "1300px",
    margin: "0 auto",
  },

  card: {
    background: "white",
    padding: "clamp(25px, 4vw, 35px)",
    borderRadius: "20px",
    width: "clamp(280px, 30vw, 320px)",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    animation: "fadeInUp 0.5s ease-out",
  },

  heading: {
    color: "#065f46",
    marginBottom: "15px",
    fontSize: "clamp(20px, 3.5vw, 24px)",
    fontWeight: "700",
  },

  text: {
    color: "#374151",
    fontSize: "clamp(14px, 2.5vw, 15px)",
    lineHeight: "1.6",
    marginBottom: "15px",
  },

  link: {
    display: "block",
    margin: "10px 0",
    color: "#065f46",
    textDecoration: "none",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "10px",
    transition: "all 0.3s ease",
    fontSize: "clamp(14px, 2.5vw, 15px)",
  },

  mapBtn: {
    display: "inline-block",
    marginTop: "12px",
    padding: "10px 20px",
    borderRadius: "30px",
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    color: "#065f46",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "clamp(12px, 2.2vw, 14px)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
  },

  whatsappBtn: {
    background: "linear-gradient(135deg, #25D366, #1da15f)",
    padding: "12px 24px",
    borderRadius: "40px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
    marginTop: "12px",
    boxShadow: "0 5px 20px rgba(37, 211, 102, 0.4)",
    transition: "all 0.3s ease",
    fontSize: "clamp(14px, 2.5vw, 15px)",
  },

  mapSection: {
    marginTop: "20px",
    padding: "0 20px 50px",
    maxWidth: "1300px",
    margin: "0 auto",
  },

  map: {
    width: "100%",
    height: "clamp(300px, 40vh, 400px)",
    border: "none",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
};

// Add hover effects and responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    /* Card hover effects */
    .contact-page .card:hover,
    .contact-page .branch-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
    }
    
    .contact-page .map-btn:hover,
    .contact-page .whatsapp-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    
    .contact-page .link:hover {
      background: rgba(6, 95, 70, 0.1);
      transform: translateX(5px);
    }
    
    /* Responsive grid adjustments */
    @media (max-width: 768px) {
      .contact-page .container {
        gap: 20px;
        padding: 40px 16px;
      }
      
      .contact-page .card {
        width: 100%;
        max-width: 350px;
      }
      
      .contact-page .branch-card {
        margin: 0 10px;
      }
      
      .contact-page .branch-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }
      
      .contact-page .branch-icon {
        font-size: 24px;
      }
    }
    
    @media (max-width: 480px) {
      .contact-page .header {
        padding: 40px 16px;
      }
      
      .contact-page .branch-section {
        padding: 30px 16px 0 16px;
      }
      
      .contact-page .branch-card {
        padding: 20px;
      }
      
      .contact-page .branch-details {
        gap: 12px;
      }
      
      .contact-page .branch-item {
        font-size: 13px;
      }
      
      .contact-page .branch-address {
        font-size: 12px;
      }
      
      .contact-page .map-section {
        padding: 0 16px 40px;
      }
      
      .contact-page .map {
        height: 250px;
        border-radius: 16px;
      }
    }
    
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
  `;
  
  if (!document.head.querySelector('#contact-styles')) {
    styleSheet.id = 'contact-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Contact;