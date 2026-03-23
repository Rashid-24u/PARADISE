function Footer() {
  return (
    <footer style={styles.footer}>
      
      <div style={styles.content}>
        <h2 style={styles.logo}>Paradise Islamic School</h2>

        <p style={styles.tagline}>
          Learn Today, Lead Tomorrow
        </p>
      </div>

      <div style={styles.bottom}>
        © 2026 Paradise Islamic School | All Rights Reserved
      </div>

    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(90deg, #0c3b2e, #14532d)",
    color: "white",
    marginTop: "50px"
  },

  content: {
    textAlign: "center",
    padding: "30px 20px"
  },

  logo: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold"
  },

  tagline: {
    marginTop: "5px",
    fontSize: "14px",
    color: "#d1d5db"
  },

  bottom: {
    textAlign: "center",
    padding: "12px",
    fontSize: "13px",
    borderTop: "1px solid rgba(255,255,255,0.2)"
  }
};

export default Footer;