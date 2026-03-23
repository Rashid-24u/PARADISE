import aboutImg from "../assets/aboutbg.jpeg";

function About() {
  return (
    <div>

      {/* HERO SECTION */}
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

        {/* ENGLISH */}
        <div style={styles.card}>
          <h2 style={styles.heading}>Our Dream for Kids</h2>

          <p style={styles.text}>
            At Paradise Islamic School, our mission is to nurture young minds into confident, responsible, and capable individuals.
          </p>

          <p style={styles.text}>
            We focus on the overall development of children including physical, cognitive, emotional, and social growth.
          </p>

          <p style={styles.text}>
            Through activity-based learning and value-based education, we prepare children to face the future with confidence.
          </p>
        </div>

    

        {/* VISION + MISSION */}
        <div style={styles.grid}>

          <div style={styles.box}>
            <h3 style={styles.subHeading}>Our Vision</h3>
            <p style={styles.text}>
              To create better human beings and future leaders with strong values and lifelong learning.
            </p>
          </div>

          <div style={styles.box}>
            <h3 style={styles.subHeading}>Our Mission</h3>
            <p style={styles.text}>
              To provide a strong foundation through creativity, skills, and activity-based learning.
            </p>
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
    objectFit: "cover",
    filter: "brightness(95%)"
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
    background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6))"
  },

  title: {
    fontSize: "40px",
    fontWeight: "800"
  },

  subtitle: {
    fontSize: "18px",
    marginTop: "10px"
  },

  container: {
    padding: "50px 20px",
    maxWidth: "1000px",
    margin: "auto"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
  },

  heading: {
    color: "#065f46",
    marginBottom: "10px"
  },

  subHeading: {
    color: "#0c3b2e"
  },

  text: {
    color: "#374151",
    fontSize: "15px",
    marginBottom: "10px",
    lineHeight: "1.6"
  },

  grid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap"
  },

  box: {
    flex: "1",
    minWidth: "250px",
    background: "#ecfdf5",
    padding: "20px",
    borderRadius: "12px"
  }

};

export default About;