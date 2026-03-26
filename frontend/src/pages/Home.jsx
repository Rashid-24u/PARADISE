import { useEffect, useRef, useState } from "react";
import hero from "../assets/bg1.jpeg";
import aboutImage from "../assets/img1.jpeg";
import learningImage from "../assets/img2.jpeg";

function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const cardsRef = useRef([]);
  const statsRef = useRef([]);

  useEffect(() => {
    setIsVisible(true);

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    statsRef.current.forEach((stat) => {
      if (stat) observer.observe(stat);
    });

    return () => observer.disconnect();
  }, []);

  // Split text into letters for animation
  const phrase1 = "A Pleasant Life";
  const phrase2 = "Begins Here...";

  const programs = [
    {
      icon: "👶",
      title: "Pre-KG",
      desc: "Basic learning & social skills",
      age: "2.5 - 3.5 Years",
      color: "#f59e0b"
    },
    {
      icon: "🧒",
      title: "LKG",
      desc: "Foundation skills & creativity",
      age: "3.5 - 4.5 Years",
      color: "#10b981"
    },
    {
      icon: "🧑‍🎓",
      title: "UKG",
      desc: "School readiness & confidence building",
      age: "4.5 - 5.5 Years",
      color: "#8b5cf6"
    },
    {
      icon: "📚",
      title: "Primary (CBSE)",
      desc: "Grade 1 – 5 with strong academic foundation & holistic development",
      age: "5.5 - 10 Years",
      color: "#3b82f6"
    }
  ];

  const values = [
    { icon: "❤️", name: "Trust" },
    { icon: "🤝", name: "Care" },
    { icon: "💖", name: "Love" },
    { icon: "🚀", name: "Empowerment" }
  ];

  const highlights = [
    { value: "30+", label: "Centers" },
    { value: "60+", label: "Teachers" },
    { value: "500+", label: "Students" },
    { value: "2024", label: "Established" }
  ];

  const learningMethods = [
    "Games & activities",
    "Storytelling",
    "Creative arts",
    "Group interaction",
    "Activity-based learning",
    "Playful exploration"
  ];

  return (
    <div className="home-container">
      {/* HERO SECTION - 3D Moving Letter Animation */}
      <section className="hero-section">
        <div className="hero-overlay">
          <img src={hero} alt="Paradise Islamic Pre-School" className="hero-image" />
          <div className="hero-gradient"></div>
        </div>

        <div className="hero-content">
          <div className={`hero-text-wrapper ${isVisible ? "animate-in" : ""}`}>
            <div className="floating-elements">
              <span className="floating-star">✨</span>
              <span className="floating-star2">🌟</span>
              <span className="floating-star3">💫</span>
            </div>
            <div className="quote-container">
              <div className="quote-icon">"</div>
              
              {/* 3D Moving Letter Animation Title */}
              <h1 className="hero-title">
                <div className="animated-title">
                  <div className="title-line-3d">
                    {phrase1.split("").map((char, index) => (
                      <span 
                        key={`char1-${index}`} 
                        className="animated-letter"
                        style={{ 
                          animationDelay: `${index * 0.05}s`,
                          display: char === " " ? "inline-block" : "inline-block",
                          width: char === " " ? "0.3em" : "auto"
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </div>
                  <div className="title-line-3d gradient-text">
                    {phrase2.split("").map((char, index) => (
                      <span 
                        key={`char2-${index}`} 
                        className="animated-letter gradient-letter"
                        style={{ 
                          animationDelay: `${(phrase1.length + index) * 0.05}s`,
                          display: char === " " ? "inline-block" : "inline-block",
                          width: char === " " ? "0.3em" : "auto"
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </div>
                </div>
              </h1>
              
              <div className="hero-quote">
                <p className="quote-text">
                  Where young hearts bloom with love, knowledge, and faith
                </p>
                <p className="quote-subtext">
                  Nurturing tomorrow's leaders with Islamic values and academic excellence
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="mouse"></div>
        </div>
      </section>

      {/* Rest of the sections remain the same... */}
      {/* ABOUT SECTION */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <div className="section-tag">🌿 About Us</div>
              <h2 className="section-title">Welcome to Paradise Islamic Pre-School</h2>
              <p className="about-text">
                Paradise Islamic Pre-School is a center of excellence in early childhood education,
                dedicated to shaping young minds through a balanced blend of academic learning and moral values.
              </p>
              <p className="about-text">
                Established in 2024, Paradise has grown rapidly with multiple centers, experienced teachers,
                and hundreds of happy students.
              </p>
              <p className="about-text highlight">
                We believe every child is unique and deserves the right environment to explore, learn, and succeed.
              </p>
              <div className="about-stats">
                {highlights.map((item, index) => (
                  <div key={index} className="about-stat">
                    <div className="about-stat-value">{item.value}</div>
                    <div className="about-stat-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-image">
              <img
                src={aboutImage}
                alt="Paradise Islamic Pre-School Campus"
                className="about-image-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION SECTION */}
      <section className="vision-mission-section">
        <div className="container">
          <div className="vm-grid">
            <div className="vision-card">
              <div className="vm-icon">👁️</div>
              <h3>Our Vision</h3>
              <p>
                Our vision is to create better human beings and future leaders by nurturing children in a holistic way.
                We focus not only on academic excellence but also on:
              </p>
              <ul className="vm-list">
                <li>Physical development</li>
                <li>Cognitive growth</li>
                <li>Emotional well-being</li>
                <li>Social skills</li>
              </ul>
              <p className="vm-footer">We aim to build confident, motivated, and responsible individuals for tomorrow.</p>
            </div>
            <div className="mission-card">
              <div className="vm-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                Our mission is to bring out the best in every child by identifying their talents and nurturing their abilities.
                We achieve this through:
              </p>
              <ul className="vm-list">
                <li>Activity-based learning</li>
                <li>Playful exploration</li>
                <li>Interactive teaching methods</li>
              </ul>
              <p className="vm-footer">We provide opportunities for children to: Learn • Imagine • Experiment • Discover the world around them</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Paradise?</h2>
            <div className="title-divider"></div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Child-centered learning approach</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safe & caring environment</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👩‍🏫</div>
              <h3>Qualified and trained teachers</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Activity-based education</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🕌</div>
              <h3>Focus on moral & Islamic values</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Strong foundation for future learning</h3>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Holistic brain development</h3>
              <p className="feature-desc">Enhancing cognitive, emotional & social skills</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Personality development programs</h3>
              <p className="feature-desc">Building confidence, communication & leadership</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section id="programs" className="programs-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🎓 Our Programs</h2>
            <div className="title-divider"></div>
            <p className="section-subtitle">
              We offer structured early education programs designed for different age groups
            </p>
          </div>

          <div className="programs-grid">
            {programs.map((program, index) => (
              <div
                key={index}
                className="program-card"
                ref={el => cardsRef.current[index] = el}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="program-icon" style={{ background: `linear-gradient(135deg, ${program.color}, ${program.color}dd)` }}>
                  {program.icon}
                </div>
                <h3 className="program-title">{program.title}</h3>
                <p className="program-desc">{program.desc}</p>
                <div className="program-age">{program.age}</div>
                <div className="card-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING APPROACH SECTION */}
      <section className="learning-section">
        <div className="container">
          <div className="learning-grid">
            <div className="learning-content">
              <div className="section-tag">🌈 Learning Through Fun</div>
              <h2 className="section-title">Learning is never so fun</h2>
              <p className="learning-text">
                At Paradise, learning is never boring! We use engaging methods that help children
                enjoy learning while developing essential life skills.
              </p>
              <div className="learning-methods">
                {learningMethods.map((method, index) => (
                  <span key={index} className="method-tag">{method}</span>
                ))}
              </div>
              <div className="tagline-badge">✨ "Where learning meets happiness" ✨</div>
            </div>
            <div className="learning-image">
              <img
                src={learningImage}
                alt="Kids learning and having fun"
                className="learning-image-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">❤️ Our Core Values</h2>
            <div className="title-divider"></div>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-name">{value.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BONUS TAGLINES */}
      <section className="taglines-section">
        <div className="container">
          <div className="taglines-wrapper">
            <div className="tagline">"Learning is never so fun"</div>
            <div className="tagline">"Walk into the future with confidence"</div>
            <div className="tagline">"Building strong foundations for life"</div>
            <div className="tagline">"Where learning meets happiness"</div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contact" className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Give Your Child the Best Start</h2>
            <p className="cta-text">
              Join Paradise Islamic Pre-School and give your child a strong foundation for a bright future.
            </p>
            <div className="cta-buttons">
              <a href="tel:919072000006" className="btn-primary cta-call">
                📞 Call Now
              </a>
              <a
                href="https://wa.me/919072000006"
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp"
              >
                💬 WhatsApp Inquiry
              </a>
              <a href="#programs" className="btn-secondary">
                📌 Enroll Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx="true">{`
        /* Global Styles */
        .home-container {
          font-family: 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow-x: hidden;
          background: linear-gradient(135deg, #fefaf0 0%, #fefcf5 100%);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          height: 100vh;
          min-height: 700px;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.85) saturate(1.1);
          transform: scale(1.02);
          animation: subtleZoom 20s ease-in-out infinite alternate;
        }

        .hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(6,95,70,0.2) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 0 20px;
        }

        .hero-text-wrapper {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.9s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          max-width: 900px;
          position: relative;
        }

        .hero-text-wrapper.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* 3D Moving Letter Animation */
        .animated-title {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .title-line-3d {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0;
        }

        .animated-letter {
          display: inline-block;
          font-size: clamp(2rem, 8vw, 4.5rem);
          font-weight: 800;
          color: white;
          text-shadow: 0 8px 25px rgba(0,0,0,0.5), 0 2px 5px rgba(0,0,0,0.3);
          animation: letterFloat 1s ease-out forwards;
          transform-origin: center;
          opacity: 0;
          transform: translateY(30px) rotateX(-15deg);
          will-change: transform, opacity;
        }

        .gradient-letter {
          background: linear-gradient(135deg, #FFF8E7, #FFE6B0, #F9D56E, #FFD966);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: none;
        }

        @keyframes letterFloat {
          0% {
            opacity: 0;
            transform: translateY(40px) rotateX(-30deg) scale(0.8);
          }
          40% {
            opacity: 0.7;
            transform: translateY(-8px) rotateX(8deg) scale(1.05);
          }
          70% {
            transform: translateY(4px) rotateX(-3deg) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg) scale(1);
          }
        }

        /* Floating Animation Elements */
        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .floating-star {
          position: absolute;
          font-size: 24px;
          top: -50px;
          left: 10%;
          animation: floatStar 6s ease-in-out infinite;
          opacity: 0.7;
        }

        .floating-star2 {
          position: absolute;
          font-size: 32px;
          bottom: -30px;
          right: 15%;
          animation: floatStar 8s ease-in-out infinite reverse;
          opacity: 0.6;
        }

        .floating-star3 {
          position: absolute;
          font-size: 28px;
          top: 20%;
          right: 5%;
          animation: floatStar 7s ease-in-out infinite;
          opacity: 0.8;
        }

        /* Quote Container */
        .quote-container {
          position: relative;
          padding: 30px;
        }

        .quote-icon {
          font-size: 80px;
          color: rgba(255, 215, 0, 0.3);
          position: absolute;
          top: -30px;
          left: -20px;
          font-family: serif;
          animation: fadeInOut 3s ease-in-out infinite;
        }

        .hero-title {
          margin-bottom: 1.5rem;
          line-height: 1.2;
          position: relative;
          z-index: 1;
        }

        .hero-quote {
          margin-top: 30px;
          animation: fadeInUp 1s ease-out 0.3s backwards;
        }

        .quote-text {
          font-size: clamp(1.1rem, 3.5vw, 1.6rem);
          color: rgba(255,255,245,0.98);
          font-weight: 500;
          line-height: 1.5;
          text-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2);
          letter-spacing: 0.5px;
          margin-bottom: 15px;
          font-style: italic;
        }

        .quote-subtext {
          font-size: clamp(0.9rem, 2.5vw, 1.1rem);
          color: rgba(255,255,240,0.92);
          font-weight: 400;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          letter-spacing: 0.3px;
        }

        /* Scroll Indicator */
        .scroll-indicator {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }

        .mouse {
          width: 30px;
          height: 50px;
          border: 2px solid rgba(255,255,200,0.8);
          border-radius: 25px;
          position: relative;
          animation: float 2s infinite ease;
        }

        .mouse::before {
          content: '';
          width: 4px;
          height: 10px;
          background: white;
          border-radius: 2px;
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          animation: pulse 1.5s infinite;
        }

        /* Container */
        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Section Header */
        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .section-tag {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b20, #fbbf2420);
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          color: #f59e0b;
          margin-bottom: 15px;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          color: #064e3b;
          margin-bottom: 15px;
        }

        .title-divider {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b, #10b981);
          margin: 0 auto;
          border-radius: 4px;
        }

        .section-subtitle {
          color: #4b5563;
          font-size: 1rem;
          max-width: 600px;
          margin: 15px auto 0;
        }

        /* About Section */
        .about-section {
          padding: 80px 0;
          background: white;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }

        .about-content {
          animation: fadeInUp 0.6s ease-out;
        }

        .about-text {
          color: #4b5563;
          line-height: 1.7;
          margin-bottom: 18px;
          font-size: 1rem;
        }

        .about-text.highlight {
          font-weight: 600;
          color: #065f46;
          background: #f0fdf4;
          padding: 15px;
          border-radius: 12px;
          border-left: 4px solid #f59e0b;
        }

        .about-stats {
          display: flex;
          gap: 30px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .about-stat {
          text-align: center;
        }

        .about-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #f59e0b;
        }

        .about-stat-label {
          font-size: 12px;
          color: #6b7280;
        }

        .about-image {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-radius: 30px;
          height: 400px;
          overflow: hidden;
          animation: float 4s ease-in-out infinite;
        }

        .about-image-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .about-image:hover .about-image-img {
          transform: scale(1.05);
        }

        /* Vision & Mission Section */
        .vision-mission-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #fefaf0, #fef9e6);
        }

        .vm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .vision-card, .mission-card {
          background: white;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }

        .vision-card:hover, .mission-card:hover {
          transform: translateY(-8px);
        }

        .vm-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .vision-card h3, .mission-card h3 {
          font-size: 28px;
          color: #065f46;
          margin-bottom: 20px;
        }

        .vision-card p, .mission-card p {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .vm-list {
          list-style: none;
          padding: 0;
          margin: 15px 0;
        }

        .vm-list li {
          padding: 8px 0;
          color: #374151;
          position: relative;
          padding-left: 25px;
        }

        .vm-list li::before {
          content: "✨";
          position: absolute;
          left: 0;
          color: #f59e0b;
        }

        .vm-footer {
          font-style: italic;
          color: #f59e0b;
          font-weight: 500;
          margin-top: 15px;
        }

        /* Why Choose Section */
        .why-choose-section {
          padding: 80px 0;
          background: white;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }

        .feature-card {
          background: linear-gradient(135deg, #fefaf0, #fff);
          padding: 28px;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s;
          border: 1px solid #f0e9db;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px -12px rgba(0,0,0,0.1);
          border-color: #f59e0b;
        }

        .feature-icon {
          font-size: 36px;
          margin-bottom: 15px;
        }

        .feature-card h3 {
          font-size: 18px;
          color: #065f46;
          font-weight: 600;
        }
        
        .feature-desc {
          font-size: 13px;
          color: #6b7280;
          margin-top: 8px;
        }

        /* Programs Section */
        .programs-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #fefaf0, #fef9e6);
        }

        .programs-grid {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .program-card {
          background: white;
          border-radius: 28px;
          padding: 35px 25px;
          width: 280px;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.6s ease-out forwards;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
        }

        .program-card:hover {
          transform: translateY(-15px) scale(1.02);
          box-shadow: 0 30px 40px -15px rgba(0,0,0,0.2);
        }

        .program-icon {
          font-size: 52px;
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s;
        }

        .program-card:hover .program-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .program-title {
          font-size: 22px;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 12px;
        }

        .program-desc {
          font-size: 14px;
          line-height: 1.5;
          color: #4b5563;
          margin-bottom: 12px;
        }

        .program-age {
          font-size: 12px;
          color: #f59e0b;
          font-weight: 600;
          background: #fef3c7;
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .card-hover-effect {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #f59e0b, #10b981);
          transform: scaleX(0);
          transition: transform 0.4s;
        }

        .program-card:hover .card-hover-effect {
          transform: scaleX(1);
        }

        /* Learning Section */
        .learning-section {
          padding: 80px 0;
          background: white;
        }

        .learning-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }

        .learning-content {
          animation: fadeInUp 0.6s ease-out;
        }

        .learning-text {
          color: #4b5563;
          line-height: 1.7;
          margin: 20px 0;
          font-size: 1.05rem;
        }

        .learning-methods {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 25px 0;
        }

        .method-tag {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #065f46;
        }

        .tagline-badge {
          background: linear-gradient(135deg, #065f46, #047857);
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          display: inline-block;
          font-weight: 600;
          margin-top: 20px;
        }

        .learning-image {
          background: linear-gradient(135deg, #fde68a, #fcd34d);
          border-radius: 30px;
          height: 400px;
          overflow: hidden;
          animation: float 4s ease-in-out infinite;
        }

        .learning-image-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .learning-image:hover .learning-image-img {
          transform: scale(1.05);
        }

        /* Values Section */
        .values-section {
          padding: 80px 0;
          background: white;
        }

        .values-grid {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .value-card {
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, #fefaf0, #fff);
          border-radius: 20px;
          width: 180px;
          transition: all 0.3s;
        }

        .value-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px -12px rgba(0,0,0,0.1);
        }

        .value-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .value-name {
          font-size: 18px;
          font-weight: 600;
          color: #065f46;
        }

        /* Taglines Section */
        .taglines-section {
          padding: 60px 0;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .taglines-wrapper {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .tagline {
          font-size: clamp(1rem, 3vw, 1.2rem);
          font-weight: 600;
          color: #065f46;
          padding: 10px 20px;
          background: white;
          border-radius: 50px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #064e3b, #065f46);
          padding: 80px 0;
          text-align: center;
        }

        .cta-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          font-weight: 800;
          color: white;
          margin-bottom: 20px;
        }

        .cta-text {
          color: rgba(255,255,240,0.9);
          margin-bottom: 35px;
          font-size: 1.1rem;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          display: inline-block;
          padding: 14px 36px;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.4s ease;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(105deg, #f59e0b, #d97706);
          color: white;
          box-shadow: 0 15px 30px -12px rgba(0,0,0,0.4);
        }

        .btn-primary:hover {
          transform: translateY(-5px) scale(1.03);
          box-shadow: 0 25px 35px -12px rgba(245, 158, 11, 0.5);
        }

        .btn-secondary {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-5px);
        }

        .btn-whatsapp {
          display: inline-block;
          background: #25D366;
          padding: 14px 36px;
          border-radius: 50px;
          color: white;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s;
        }

        .btn-whatsapp:hover {
          background: #1da15f;
          transform: translateY(-3px);
        }

        .cta-call {
          background: linear-gradient(105deg, #f59e0b, #d97706);
        }

        /* Animations */
        @keyframes subtleZoom {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        @keyframes floatStar {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(10deg); }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
          50% { opacity: 0.5; transform: translateX(-50%) translateY(5px); }
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

        /* Responsive Design */
        @media (max-width: 968px) {
          .about-grid, .vm-grid, .learning-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          
          .about-image, .learning-image {
            order: -1;
            height: 300px;
          }
          
          .vm-grid {
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }
          
          .animated-letter {
            font-size: clamp(1.5rem, 6vw, 2.5rem);
          }
          
          .programs-grid {
            gap: 20px;
          }
          
          .program-card {
            width: 100%;
            max-width: 320px;
            padding: 25px 20px;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .values-grid {
            gap: 20px;
          }
          
          .value-card {
            width: 150px;
            padding: 20px;
          }
          
          .floating-star, .floating-star2, .floating-star3 {
            display: none;
          }
          
          .quote-icon {
            font-size: 50px;
            top: -20px;
            left: -10px;
          }
          
          .vision-card, .mission-card {
            padding: 30px 20px;
          }
          
          .vision-card h3, .mission-card h3 {
            font-size: 24px;
          }

          .about-section, .vision-mission-section, .programs-section,
          .learning-section, .values-section, .cta-section {
            padding: 60px 0;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .quote-text {
            font-size: 1rem;
          }

          .quote-subtext {
            font-size: 0.85rem;
          }

          .cta-buttons {
            gap: 12px;
          }

          .btn-primary, .btn-secondary, .btn-whatsapp {
            padding: 10px 24px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .about-section, .vision-mission-section, .programs-section,
          .learning-section, .values-section, .cta-section {
            padding: 40px 0;
          }
          
          .section-title {
            font-size: 1.4rem;
          }
          
          .tagline {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
          
          .animated-letter {
            font-size: clamp(1.2rem, 5vw, 1.8rem);
          }
          
          .quote-text {
            font-size: 0.9rem;
          }

          .program-card {
            padding: 20px 15px;
          }

          .program-icon {
            width: 70px;
            height: 70px;
            font-size: 36px;
          }

          .program-title {
            font-size: 18px;
          }

          .program-desc {
            font-size: 12px;
          }

          .value-card {
            width: 120px;
            padding: 15px;
          }

          .value-icon {
            font-size: 32px;
          }

          .value-name {
            font-size: 14px;
          }

          .feature-card {
            padding: 20px;
          }

          .feature-card h3 {
            font-size: 16px;
          }

          .vision-card, .mission-card {
            padding: 20px;
          }

          .vision-card h3, .mission-card h3 {
            font-size: 20px;
          }

          .vm-list li {
            font-size: 14px;
          }
        }

        @media (max-width: 360px) {
          .animated-letter {
            font-size: clamp(1rem, 4.5vw, 1.5rem);
          }

          .quote-text {
            font-size: 0.8rem;
          }

          .cta-title {
            font-size: 1.3rem;
          }

          .cta-text {
            font-size: 0.9rem;
          }

          .btn-primary, .btn-secondary, .btn-whatsapp {
            padding: 8px 18px;
            font-size: 12px;
          }

          .tagline {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;