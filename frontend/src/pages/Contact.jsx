function Contact() {
  return (
    <div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>
          Get in touch with us for admissions & details
        </p>
      </div>

      {/* CONTACT SECTION */}
      <div style={styles.container}>

        {/* LOCATION */}
        <div style={styles.card}>
          <h2 style={styles.heading}>📍 Location</h2>

          <p style={styles.text}>
            BHS Madrassa <br />
            Pullur, Tirur
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

      {/* 🔥 EMBEDDED MAP (UPDATED LOCATION) */}
      <div style={styles.mapSection}>
        <iframe
          title="map"
          src="https://maps.google.com/maps?q=BHS%20Madrassa%20Pullur%20Tirur&t=&z=15&ie=UTF8&iwloc=&output=embed"
          style={styles.map}
        ></iframe>
      </div>

    </div>
  );
}

const phones = [
  "917736152643",
  "918089647380",
  "918547247851"
];

const styles = {

  header: {
    textAlign: "center",
    padding: "70px 20px",
    background: "linear-gradient(135deg, #0F766E, #22C55E)",
    color: "white"
  },

  title: {
    fontSize: "42px",
    fontWeight: "800"
  },

  subtitle: {
    marginTop: "10px",
    color: "#e5e7eb"
  },

  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "25px",
    justifyContent: "center",
    padding: "50px 20px"
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    width: "280px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  },

  heading: {
    color: "#065f46",
    marginBottom: "12px"
  },

  text: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.6"
  },

  link: {
    display: "block",
    margin: "8px 0",
    color: "#111827",
    textDecoration: "none",
    fontWeight: "500"
  },

  // 🔥 NEW BUTTON
  mapBtn: {
    display: "inline-block",
    marginTop: "12px",
    padding: "10px 18px",
    borderRadius: "20px",
    background: "#facc15",
    color: "black",
    textDecoration: "none",
    fontWeight: "bold"
  },

  whatsappBtn: {
    background: "#25D366",
    padding: "12px 22px",
    borderRadius: "30px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
    marginTop: "12px",
    boxShadow: "0 5px 15px rgba(37,211,102,0.5)"
  },

  mapSection: {
    marginTop: "30px",
    padding: "0 20px 40px"
  },

  map: {
    width: "100%",
    height: "320px",
    border: "none",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
  }
};

export default Contact;