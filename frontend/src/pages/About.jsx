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
    <div>

      {/* HERO */}
      <div style={styles.hero}>
        <img src={aboutImg} alt="about" style={styles.img} />

        <div style={styles.overlay}>
          <h1 style={styles.title}>About Us</h1>
          <p style={styles.subtitle}>
            A Pleasant Life Begins Here
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>

        {/* SCHOOL DESCRIPTION */}
        <div style={styles.card}>
          <h2 style={styles.heading}>About Paradise Islamic School</h2>

          <p style={styles.text}>
            Paradise Islamic School is a prestigious educational institution established and operated by the Khiller Hajji Memorial Educational and Charitable Society. Located in the serene surroundings of Kerala, India, the school is dedicated to delivering high-quality education rooted in strong values and discipline.
          </p>

          <p style={styles.text}>
            At Paradise Islamic School, we believe that education is not just about academics, but about shaping character and nurturing young minds. Our institution focuses on the holistic development of students—combining modern education with moral and ethical values to build confident, responsible individuals.
          </p>

          <p style={styles.text}>
            With a supportive and inspiring learning environment, Paradise Islamic School encourages students to explore their full potential, achieve academic excellence, and grow into future leaders.
          </p>
        </div>

        {/* MISSION & VISION */}
        <div style={styles.grid}>

          <div style={styles.box}>
            <h3 style={styles.subHeading}>🎯 Our Mission</h3>
            <p style={styles.text}>
              To provide a nurturing environment that fosters academic excellence,
              moral values, and personal growth. We aim to empower students with
              knowledge, skills, and confidence to face future challenges.
            </p>
          </div>

          <div style={styles.box}>
            <h3 style={styles.subHeading}>🌟 Our Vision</h3>
            <p style={styles.text}>
              To build a generation of knowledgeable, ethical, and responsible
              individuals who contribute positively to society and lead with
              integrity and compassion.
            </p>
          </div>

        </div>

        {/* TEACHERS SECTION */}
        <div style={styles.teacherSection}>
          <h2 style={styles.heading}>Our Teachers</h2>

          <div style={styles.teacherGrid}>
            {teachers.map((t) => (
              <div key={t.id} style={styles.teacherCard}>
                {t.image_url && (
                  <img
                    src={t.image_url}
                    alt="teacher"
                    style={styles.teacherImg}
                  />
                )}
                <p style={styles.teacherName}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

const styles = {

  hero: {
    position: "relative",
    height: "60vh"
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  overlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7))"
  },

  title: {
    fontSize: "clamp(28px, 6vw, 50px)",
    fontWeight: "800"
  },

  subtitle: {
    fontSize: "clamp(14px, 3vw, 18px)",
    marginTop: "10px"
  },

  container: {
    padding: "50px 20px",
    maxWidth: "1100px",
    margin: "auto"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    marginBottom: "25px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
  },

  heading: {
    color: "#065f46",
    marginBottom: "15px",
    fontSize: "22px"
  },

  subHeading: {
    color: "#065f46",
    marginBottom: "10px"
  },

  text: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.7"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },

  box: {
    background: "#ecfdf5",
    padding: "20px",
    borderRadius: "12px"
  },

  // 👨‍🏫 TEACHERS
  teacherSection: {
    marginTop: "30px"
  },

  teacherGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },

  teacherCard: {
    textAlign: "center",
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
  },

  teacherImg: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px"
  },

  teacherName: {
    fontWeight: "600",
    color: "#065f46",
    fontSize: "14px"
  }

};

export default About;