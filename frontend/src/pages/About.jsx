import { useEffect, useState } from "react";
import aboutImg from "../assets/aboutbg.jpeg";

function About() {
  const [teachers, setTeachers] = useState([]);

  // 🔥 FETCH TEACHERS
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/teachers/")
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="about-page">

      {/* HERO */}
      <div style={styles.hero}>
        <img src={aboutImg} alt="about" style={styles.img} />
        <div style={styles.overlay}>
          <h1 className="golden-shine-title" style={styles.title}>About Us</h1>
          <p style={styles.subtitle}>Paradise Islamic Pre-School - Pullur, Tirur</p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>

        {/* SCHOOL DESCRIPTION - UPDATED WITH ACCURATE INFO */}
        <div style={styles.card}>
          <h2 className="golden-shine-heading" style={styles.heading}>✨ Welcome to Paradise Islamic Pre-School</h2>
          
          <p style={styles.text}>
            <strong>Paradise Islamic Pre-School, Pullur, Tirur</strong> is a proud branch of the <strong>Paradise Islamic School Network</strong>, 
            established and operated by the <strong>Khiller Hajji Memorial Educational and Charitable Society</strong>. 
            Located in the serene and culturally rich surroundings of Pullur, Tirur, our school is dedicated to providing 
            high-quality early childhood education rooted in strong Islamic values and modern teaching methodologies.
          </p>

          <p style={styles.text}>
            At Paradise Islamic Pre-School, we believe that the foundation of a child's future is built during their early years. 
            Our institution focuses on the holistic development of young minds—combining academic excellence with moral and ethical 
            values to nurture confident, responsible, and compassionate individuals.
          </p>

          <p style={styles.text}>
            As part of the Khiller Hajji Memorial Educational and Charitable Society, we are committed to serving the community 
            by providing a nurturing, safe, and inspiring environment where children can explore, learn, and grow. Our society 
            has been working tirelessly to promote education and charitable activities, and this school is a testament to that vision.
          </p>

          <p style={styles.text}>
            With a supportive and stimulating learning environment, Paradise Islamic Pre-School encourages young learners to 
            discover their potential, develop essential life skills, and build a strong foundation for their future academic journey.
          </p>
        </div>

        {/* MISSION & VISION */}
        <div style={styles.grid}>
          <div style={styles.box}>
            <h3 className="golden-shine-sub" style={styles.subHeading}>🎯 Our Mission</h3>
            <p style={styles.text}>
              To provide a nurturing, Islamic-centered early childhood education that fosters academic excellence, 
              moral values, and personal growth. We aim to empower young minds with knowledge, skills, and confidence 
              to become future leaders while staying rooted in Islamic principles.
            </p>
          </div>
          <div style={styles.box}>
            <h3 className="golden-shine-sub" style={styles.subHeading}>🌟 Our Vision</h3>
            <p style={styles.text}>
              To build a generation of knowledgeable, ethical, and responsible individuals who contribute positively 
              to society, lead with integrity, and uphold Islamic values in their daily lives.
            </p>
          </div>
        </div>

        {/* SOCIETY INFORMATION */}
        <div style={styles.societyCard}>
          <h3 className="golden-shine-sub" style={styles.subHeading}>🤝 About Khiller Hajji Memorial Educational and Charitable Society</h3>
          <p style={styles.text}>
            The <strong>Khiller Hajji Memorial Educational and Charitable Society</strong> is a non-profit organization 
            dedicated to promoting education and community welfare. Named in honor of Khiller Hajji, the society has been 
            actively involved in establishing educational institutions that provide quality education with a strong emphasis 
            on moral and Islamic values.
          </p>
          <p style={styles.text}>
            Through initiatives like <strong>Paradise Islamic Pre-School</strong>, the society aims to create a lasting 
            impact on the community by nurturing young minds and preparing them for a bright future.
          </p>
        </div>

        {/* TEACHERS SECTION */}
        <div style={styles.teacherSection}>
          <h2 className="golden-shine-heading" style={styles.heading}>👩‍🏫 Our Dedicated Teachers</h2>
          <p style={styles.text}>
            Our team of qualified and passionate educators are committed to providing the best learning experience for your child.
          </p>
          <div style={styles.teacherGrid}>
            {teachers.length > 0 ? (
              teachers.map((t) => (
                <div key={t.id} style={styles.teacherCard}>
                  {t.image_url && (
                    <img
                      src={t.image_url}
                      alt={t.name}
                      style={styles.teacherImg}
                    />
                  )}
                  <p style={styles.teacherName}>{t.name}</p>
                </div>
              ))
            ) : (
              <p style={styles.noTeachers}>Loading teachers...</p>
            )}
          </div>
        </div>

      </div>

      {/* Add CSS animations */}
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

        /* Golden Shine Title */
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

        /* Golden Shine Heading */
        .golden-shine-heading {
          background: linear-gradient(
            90deg,
            #065f46,
            #f59e0b,
            #facc15,
            #fbbf24,
            #f59e0b,
            #065f46
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: goldenShine 8s linear infinite;
          display: inline-block;
        }

        /* Golden Shine Subheading */
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

        /* Hover effect - speed up animation */
        .golden-shine-title:hover,
        .golden-shine-heading:hover,
        .golden-shine-sub:hover {
          animation: goldenShine 2s linear infinite;
          cursor: pointer;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .golden-shine-title {
            animation: goldenShine 8s linear infinite;
          }
          .golden-shine-heading {
            animation: goldenShine 10s linear infinite;
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
    height: "60vh",
    minHeight: "400px",
    overflow: "hidden",
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "brightness(0.7)",
    transform: "scale(1.02)",
    animation: "subtleZoom 20s ease-in-out infinite alternate",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    background: "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(6,95,70,0.6) 100%)",
    textAlign: "center",
    padding: "20px",
  },

  title: {
    fontSize: "clamp(32px, 6vw, 56px)",
    fontWeight: "800",
    marginBottom: "15px",
    textShadow: "0 4px 15px rgba(0,0,0,0.3)",
  },

  subtitle: {
    fontSize: "clamp(16px, 3vw, 22px)",
    marginTop: "10px",
    fontWeight: "500",
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
    color: "#facc15",
  },

  container: {
    padding: "60px 24px",
    maxWidth: "1200px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #fefaf0 0%, #fefcf5 100%)",
  },

  card: {
    background: "white",
    padding: "clamp(25px, 4vw, 40px)",
    borderRadius: "24px",
    marginBottom: "30px",
    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  societyCard: {
    background: "white",
    padding: "clamp(20px, 3vw, 30px)",
    borderRadius: "20px",
    marginBottom: "30px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease",
  },

  heading: {
    color: "#065f46",
    marginBottom: "20px",
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: "700",
    display: "inline-block",
  },

  subHeading: {
    marginBottom: "12px",
    fontSize: "clamp(18px, 3vw, 22px)",
    fontWeight: "600",
    display: "inline-block",
  },

  text: {
    color: "#374151",
    fontSize: "clamp(14px, 2.5vw, 16px)",
    lineHeight: "1.7",
    marginBottom: "15px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginBottom: "30px",
  },

  box: {
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    padding: "clamp(20px, 3vw, 30px)",
    borderRadius: "20px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },

  // 👨‍🏫 TEACHERS
  teacherSection: {
    marginTop: "40px",
  },

  teacherGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "25px",
    marginTop: "30px",
  },

  teacherCard: {
    textAlign: "center",
    background: "white",
    padding: "20px 15px",
    borderRadius: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },

  teacherImg: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "15px",
    border: "3px solid #facc15",
    transition: "transform 0.3s ease",
  },

  teacherName: {
    fontWeight: "600",
    color: "#065f46",
    fontSize: "clamp(13px, 2.5vw, 15px)",
    marginTop: "8px",
  },

  noTeachers: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    padding: "40px",
  },
};

// Add global animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes subtleZoom {
      0% {
        transform: scale(1.02);
      }
      100% {
        transform: scale(1.1);
      }
    }
    
    /* Card hover effects */
    .about-page .card:hover,
    .about-page .society-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 45px -12px rgba(0,0,0,0.15);
    }
    
    .about-page .box:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
    }
    
    .about-page .teacher-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 30px -12px rgba(0,0,0,0.15);
    }
    
    .about-page .teacher-card:hover .teacher-img {
      transform: scale(1.05);
      border-color: #f59e0b;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .about-page .teacher-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
      }
      
      .about-page .teacher-img {
        width: 80px;
        height: 80px;
      }
    }
    
    @media (max-width: 480px) {
      .about-page .container {
        padding: 40px 16px;
      }
      
      .about-page .teacher-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
      }
      
      .about-page .teacher-img {
        width: 70px;
        height: 70px;
      }
      
      .about-page .teacher-card {
        padding: 15px 10px;
      }
      
      .about-page .teacher-name {
        font-size: 12px;
      }
    }
  `;
  
  if (!document.head.querySelector('#about-styles')) {
    styleSheet.id = 'about-styles';
    document.head.appendChild(styleSheet);
  }
}

export default About;