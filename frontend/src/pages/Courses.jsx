import { useEffect } from "react";

function Courses() {
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
    `;
    
    if (!document.head.querySelector('#courses-animations')) {
      styleSheet.id = 'courses-animations';
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // cleanup
    };
  }, []);

  const courses = [
    {
      icon: "👶",
      title: "Pre-KG",
      subtitle: "Early Learning Foundation",
      age: "2.5 - 3.5 Years",
      duration: "1 Year",
      description: "Introduction to school environment through play-based learning, social skills development, and basic concepts."
    },
    {
      icon: "🧒",
      title: "LKG",
      subtitle: "Foundation Skills",
      age: "3.5 - 4.5 Years",
      duration: "1 Year",
      description: "Building foundational literacy and numeracy skills through interactive activities, creative expression, and group learning."
    },
    {
      icon: "🧑‍🎓",
      title: "UKG",
      subtitle: "School Readiness",
      age: "4.5 - 5.5 Years",
      duration: "1 Year",
      description: "Preparing children for formal schooling with advanced concepts, critical thinking, and confidence building."
    },
    {
      icon: "📚",
      title: "Primary (CBSE)",
      subtitle: "Strong Academic Foundation",
      age: "5.5 - 10 Years",
      duration: "Grade 1 – 5",
      description: "Comprehensive CBSE curriculum with focus on conceptual understanding, skill development, and holistic education."
    },
    {
      icon: "🌙",
      title: "Thibshore",
      subtitle: "Basic Level - Islamic Foundation",
      duration: "2 Years",
      target: "Pre-KG, LKG, UKG",
      description: "An early learning program designed for young children to begin their Islamic education journey.",
      features: [
        "Arabic alphabet recognition",
        "Basic Qur'an reading (Qaida)",
        "Simple duas and Islamic habits",
        "Fun, activity-based learning"
      ]
    },
    {
      icon: "🕌",
      title: "Thibyaan",
      subtitle: "Advanced Level - Islamic Excellence",
      duration: "3 Years",
      target: "After completing basic learning",
      description: "A higher-level program for students who have completed basic learning.",
      features: [
        "Advanced Qur'an reading (Tajweed)",
        "Arabic language understanding",
        "Memorization (Hifz basics)",
        "Confidence in recitation"
      ]
    },
    {
      icon: "🌟",
      title: "Extra Programs",
      subtitle: "Skill Development Activities",
      activities: [
        "Public Speaking",
        "Swimming",
        "Art & Craft",
        "Chess",
        "Abacus",
        "Tuition"
      ]
    }
  ];

  return (
    <div className="courses-page">

      {/* HEADER */}
      <div style={styles.header}>
        <h1 className="golden-shine-title" style={styles.title}>Our Courses</h1>
        <p style={styles.subtitle}>
          Quality Education with Islamic Values
        </p>
      </div>

      {/* COURSES */}
      <div style={styles.container}>
        {courses.map((course, index) => (
          <div
            key={index}
            className="course-card"
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
            }}
          >
            <div style={styles.iconWrapper}>
              <div style={styles.icon}>{course.icon}</div>
            </div>

            <h2 style={styles.heading}>{course.title}</h2>
            <p style={styles.subheading}>{course.subtitle}</p>

            {course.age && (
              <div style={styles.ageBadge}>
                <span style={styles.ageIcon}>👧</span> {course.age}
              </div>
            )}

            {course.duration && (
              <div style={styles.durationBadge}>
                <span style={styles.durationIcon}>⏱️</span> {course.duration}
              </div>
            )}

            {course.target && (
              <div style={styles.targetBadge}>
                <span style={styles.targetIcon}>🎯</span> {course.target}
              </div>
            )}

            {course.description && (
              <p style={styles.text}>{course.description}</p>
            )}

            {course.features && (
              <div style={styles.featuresContainer}>
                <div style={styles.featuresList}>
                  {course.features.map((feature, i) => (
                    <span key={i} style={styles.featureItem}>
                      <span style={styles.featureBullet}>✨</span> {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {course.activities && (
              <div style={styles.activitiesContainer}>
                <div style={styles.activitiesGrid}>
                  {course.activities.map((activity, i) => (
                    <span key={i} style={styles.activityTag}>{activity}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADDITIONAL INFO SECTION */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h3 className="golden-shine-sub" style={styles.infoHeading}>🎯 Why Choose Our Programs?</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>✅</span>
              <span>Activity-based learning</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>✅</span>
              <span>Qualified & trained teachers</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>✅</span>
              <span>Safe & caring environment</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>✅</span>
              <span>Focus on Islamic values</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>✅</span>
              <span>Holistic development approach</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>✅</span>
              <span>Regular parent-teacher interaction</span>
            </div>
          </div>
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
            #10b981,
            #fbbf24,
            #f59e0b,
            #065f46
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: goldenShine 7s linear infinite;
          display: inline-block;
        }
        
        .course-card {
          animation: fadeInUp 0.5s ease-out;
          animation-fill-mode: backwards;
        }
        
        .course-card:nth-child(1) { animation-delay: 0.1s; }
        .course-card:nth-child(2) { animation-delay: 0.2s; }
        .course-card:nth-child(3) { animation-delay: 0.3s; }
        .course-card:nth-child(4) { animation-delay: 0.4s; }
        .course-card:nth-child(5) { animation-delay: 0.5s; }
        .course-card:nth-child(6) { animation-delay: 0.6s; }
        .course-card:nth-child(7) { animation-delay: 0.7s; }
        
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
    fontSize: "clamp(14px, 3vw, 18px)",
    marginTop: "10px",
    color: "#d1fae5",
  },

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "clamp(20px, 3vw, 30px)",
    padding: "clamp(40px, 6vw, 60px) 20px",
    maxWidth: "1300px",
    margin: "0 auto",
  },

  card: {
    background: "white",
    padding: "clamp(25px, 4vw, 35px)",
    borderRadius: "24px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "1px solid rgba(6, 95, 70, 0.1)",
  },

  iconWrapper: {
    marginBottom: "15px",
  },

  icon: {
    fontSize: "clamp(42px, 7vw, 52px)",
    marginBottom: "10px",
    display: "inline-block",
    transition: "transform 0.3s ease",
  },

  heading: {
    color: "#065f46",
    marginBottom: "8px",
    fontSize: "clamp(20px, 3.5vw, 24px)",
    fontWeight: "700",
  },

  subheading: {
    color: "#f59e0b",
    fontSize: "clamp(12px, 2.2vw, 14px)",
    marginBottom: "15px",
    fontWeight: "500",
  },

  ageBadge: {
    background: "#ecfdf5",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "clamp(12px, 2vw, 13px)",
    color: "#065f46",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },

  durationBadge: {
    background: "#fef3c7",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "clamp(12px, 2vw, 13px)",
    color: "#f59e0b",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },

  targetBadge: {
    background: "#e0e7ff",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "clamp(12px, 2vw, 13px)",
    color: "#4338ca",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },

  ageIcon: {
    fontSize: "14px",
  },

  durationIcon: {
    fontSize: "14px",
  },

  targetIcon: {
    fontSize: "14px",
  },

  text: {
    color: "#374151",
    fontSize: "clamp(13px, 2.2vw, 14px)",
    lineHeight: "1.6",
    marginTop: "10px",
  },

  featuresContainer: {
    marginTop: "15px",
    width: "100%",
  },

  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "left",
  },

  featureItem: {
    fontSize: "clamp(12px, 2vw, 13px)",
    color: "#4b5563",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
  },

  featureBullet: {
    fontSize: "12px",
    color: "#f59e0b",
  },

  activitiesContainer: {
    marginTop: "15px",
    width: "100%",
  },

  activitiesGrid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
  },

  activityTag: {
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "clamp(11px, 2vw, 12px)",
    color: "#065f46",
    fontWeight: "500",
  },

  // Info Section
  infoSection: {
    padding: "clamp(40px, 6vw, 60px) 20px",
    background: "linear-gradient(135deg, #fefaf0, #fefcf5)",
  },

  infoCard: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "white",
    padding: "clamp(30px, 5vw, 45px)",
    borderRadius: "28px",
    textAlign: "center",
    boxShadow: "0 15px 35px -12px rgba(0,0,0,0.1)",
  },

  infoHeading: {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: "700",
    marginBottom: "25px",
    display: "inline-block",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    textAlign: "left",
  },

  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "#fefaf0",
    borderRadius: "12px",
    fontSize: "clamp(13px, 2.2vw, 14px)",
    color: "#374151",
    transition: "transform 0.2s ease",
  },

  infoIcon: {
    fontSize: "18px",
    color: "#f59e0b",
  },
};

// Add hover effects and responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .courses-page .course-card:hover .course-icon {
      transform: scale(1.1) rotate(5deg);
    }
    
    .courses-page .info-item:hover {
      transform: translateX(5px);
      background: #ecfdf5;
    }
    
    @media (max-width: 768px) {
      .courses-page .container {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }
      
      .courses-page .info-grid {
        grid-template-columns: 1fr;
      }
      
      .courses-page .course-card {
        min-height: 280px;
        padding: 20px;
      }
      
      .courses-page .features-list {
        text-align: center;
      }
      
      .courses-page .feature-item {
        justify-content: center;
      }
    }
    
    @media (max-width: 480px) {
      .courses-page .container {
        padding: 30px 16px;
      }
      
      .courses-page .course-card {
        padding: 20px 15px;
      }
      
      .courses-page .info-card {
        padding: 20px;
      }
      
      .courses-page .activities-grid {
        gap: 6px;
      }
      
      .courses-page .activity-tag {
        padding: 4px 10px;
        font-size: 10px;
      }
      
      .courses-page .feature-item {
        font-size: 11px;
      }
    }
  `;
  
  if (!document.head.querySelector('#courses-styles')) {
    styleSheet.id = 'courses-styles';
    document.head.appendChild(styleSheet);
  }
}

export default Courses;