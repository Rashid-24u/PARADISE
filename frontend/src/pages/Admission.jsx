import bg from "../assets/bg1.jpeg";

function Admission() {
  return (
    <div>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.overlay}>
          <h1 style={styles.title}>Admission Open 2026</h1>

          <p style={styles.subtitle}>
            "A better future starts with the right education"
          </p>

          <p style={styles.highlight}>
            Limited Seats • Enroll Now
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>

        {/* QUOTE */}
        <div style={styles.quoteBox}>
          <p style={styles.quote}>
            ✨ "Every child is unique. Give them the best environment to grow,
            learn and succeed."
          </p>
        </div>

        {/* DESCRIPTION */}
        <p style={styles.text}>
          Admissions are now open for the academic year 2026.  
          At Paradise Islamic School, we combine modern education with strong values,
          ensuring your child grows academically and morally.
        </p>

        {/* PHONE NUMBERS */}
        <div style={styles.phoneBox}>

          {phones.map((num, i) => (
            <a
              key={i}
              href={`tel:${num}`}
              style={styles.phone}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#ecfdf5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              📞 +91 {num.slice(2,5)} {num.slice(5,8)} {num.slice(8)}
            </a>
          ))}

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

      </div>

    </div>
  );
}

const phones = [
  "919072000006",
  "917736152643",
  "918089647380",
  "918547247851"
];

const styles = {

  hero: {
    height: "65vh",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative"
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7))",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "white",
    padding: "20px"
  },

  title: {
    fontSize: "clamp(28px, 6vw, 50px)",
    fontWeight: "800",
    textShadow: "0 5px 20px rgba(0,0,0,0.7)"
  },

  subtitle: {
    marginTop: "10px",
    fontSize: "clamp(14px, 3.5vw, 18px)",
    color: "#e5e7eb"
  },

  highlight: {
    marginTop: "10px",
    background: "#facc15",
    color: "black",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600"
  },

  container: {
    textAlign: "center",
    padding: "40px 15px",
    maxWidth: "800px",
    margin: "auto"
  },

  quoteBox: {
    background: "#ecfdf5",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
  },

  quote: {
    fontStyle: "italic",
    color: "#065f46",
    fontWeight: "500",
    fontSize: "14px"
  },

  text: {
    fontSize: "15px",
    color: "#374151",
    marginBottom: "25px",
    lineHeight: "1.7"
  },

  phoneBox: {
    marginBottom: "25px",
    background: "transparent"
  },

  phone: {
    display: "block",
    margin: "8px 0",
    fontWeight: "500",
    color: "#374151",
    textDecoration: "none",
    fontSize: "15px",
    padding: "6px 10px",
    borderRadius: "6px",
    transition: "0.2s"
  },

  btnGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
    width: "100%"
  },

  callBtn: {
    flex: "1 1 200px",
    maxWidth: "250px",
    textAlign: "center",
    padding: "14px",
    borderRadius: "30px",
    background: "#065f46",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(0,0,0,0.25)"
  },

  whatsappBtn: {
    flex: "1 1 200px",
    maxWidth: "250px",
    textAlign: "center",
    padding: "14px",
    borderRadius: "30px",
    background: "#facc15",
    color: "black",
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 6px 15px rgba(0,0,0,0.25)"
  }
};

export default Admission;