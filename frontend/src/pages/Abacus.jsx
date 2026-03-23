import abacusImg from "../assets/abacusbg1.jpeg";

function Abacus() {
  return (
    <div>

      {/* HERO */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Mastermind Abacus</h1>
        <p style={styles.subtitle}>
          Boost Your Child's Brain Power & Calculation Speed
        </p>
      </div>

      {/* IMAGE */}
      <div style={styles.imageSection}>
        <img src={abacusImg} alt="abacus" style={styles.img} />
      </div>

      {/* BENEFITS */}
      <div style={styles.container}>

        <h2 style={styles.heading}>Why Choose Abacus?</h2>

        <div style={styles.cards}>
          {benefits.map((item, index) => (
            <div key={index} style={styles.card}>
              {item}
            </div>
          ))}
        </div>

      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2>Enroll Now</h2>

        <div style={styles.btnGroup}>
          <a href="tel:919072000006" style={styles.callBtn}>
            📞 Call Now
          </a>

          <a href="https://wa.me/919072000006" style={styles.whatsappBtn}>
            💬 WhatsApp
          </a>
        </div>
      </div>

    </div>
  );
}

const benefits = [
  "🧠 Improves Brain Development",
  "⚡ Faster Calculation Skills",
  "🎯 Better Concentration",
  "💡 Improves Memory Power",
  "🚀 Boosts Confidence",
  "📚 Enhances Academic Performance"
];

const styles = {

  hero: {
    textAlign: "center",
    padding: "80px 20px",
    background: "linear-gradient(135deg, #0F766E, #22C55E)", // ✅ fixed
    color: "white"
  },

  title: {
    fontSize: "42px",
    fontWeight: "800",
    letterSpacing: "1px"
  },

  subtitle: {
    fontSize: "18px",
    marginTop: "10px",
    opacity: 0.9
  },

  imageSection: {
    display: "flex",
    justifyContent: "center",
    marginTop: "-40px" // 🔥 slight overlap effect
  },

  img: {
    width: "90%",
    maxWidth: "550px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
  },

  container: {
    padding: "60px 20px",
    textAlign: "center",
    background: "#F8FAFC" // light bg
  },

  heading: {
    fontSize: "30px",
    marginBottom: "30px",
    color: "#0F766E" // ✅ theme color
  },

  cards: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center"
  },

  card: {
    background: "white",
    padding: "20px",
    width: "250px",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    transition: "0.3s"
  },

  cta: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#0F172A",
    color: "white"
  },

  btnGroup: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap"
  },

  callBtn: {
    background: "#0F766E",
    padding: "12px 25px",
    borderRadius: "30px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  },

  whatsappBtn: {
    background: "#F59E0B",
    padding: "12px 25px",
    borderRadius: "30px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  }
};

export default Abacus;