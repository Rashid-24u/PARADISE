import hero from "../assets/bg1.jpeg";


function Home() {
  return (
    <div>

      {/* HERO (POSTER FULL VIEW) */}
      <section style={styles.hero}>
        <img src={hero} alt="school" style={styles.img} />
      </section>

      {/* FLOATING BUTTONS */}
      <div style={styles.floating}>

        <a href="tel:919072000006" style={styles.callBtn}>
          📞
        </a>

        <a
          href="https://wa.me/919072000006"
          target="_blank"
          rel="noreferrer"
          style={styles.whatsappBtn}
        >
          💬
        </a>

      </div>

      {/* COURSES */}
      <section style={styles.section}>
        <h2 style={styles.heading}>Our Courses</h2>

        <div style={styles.cards}>
          
          {courses.map((item, index) => (
            <div
              key={index}
              style={styles.card}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform =
                  "translateY(-10px) scale(1.03)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform =
                  "translateY(0) scale(1)")
              }
            >
              <div style={styles.cardIcon}>{item.icon}</div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardText}>{item.desc}</p>
            </div>
          ))}

        </div>
      </section>

    </div>
  );
}

const courses = [
  {
    icon: "🎒",
    title: "Pre School",
    desc: "PreKG, LKG, UKG with activity-based learning"
  },
  {
    icon: "📘",
    title: "Primary (CBSE)",
    desc: "Grade 1 – 5 with strong academic foundation"
  },
  {
    icon: "🕌",
    title: "Islamic Programs",
    desc: "Quran, values & moral education programs"
  }
];

const styles = {

  hero: {
    height: "90vh",
    overflow: "hidden"
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  // 🔥 FLOATING BUTTONS
  floating: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    zIndex: 999
  },

  callBtn: {
    background: "#065f46",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "22px",
    textDecoration: "none",
    boxShadow: "0 6px 15px rgba(0,0,0,0.3)"
  },

  whatsappBtn: {
    background: "#25D366",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "22px",
    textDecoration: "none",
    boxShadow: "0 6px 15px rgba(0,0,0,0.3)"
  },

  section: {
    padding: "80px 20px",
    textAlign: "center",
    background: "#f8fafc"
  },

  heading: {
    fontSize: "34px",
    marginBottom: "30px",
    color: "#064e3b"
  },

  cards: {
    display: "flex",
    justifyContent: "center",
    gap: "25px",
    flexWrap: "wrap"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    width: "260px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "0.3s",
    cursor: "pointer"
  },

  cardIcon: {
    fontSize: "30px",
    marginBottom: "10px"
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#065f46"
  },

  cardText: {
    fontSize: "14px",
    color: "#374151",
    marginTop: "8px"
  }
};

export default Home;