function Courses() {
  return (
    <div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Our Courses</h1>
        <p style={styles.subtitle}>
          Quality Education with Islamic Values
        </p>
      </div>

      {/* COURSES */}
      <div style={styles.container}>

        {courses.map((course, index) => (
          <div
            key={index}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow =
                "0 15px 35px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(0,0,0,0.08)";
            }}
          >

            <div style={styles.icon}>{course.icon}</div>

            <h2 style={styles.heading}>{course.title}</h2>

            {course.list ? (
              <ul style={styles.list}>
                {course.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p style={styles.text}>{course.text}</p>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}

const courses = [
  {
    icon: "🎒",
    title: "Pre School",
    subtitle: "Early Learning Foundation",
    text: "PreKG, LKG, UKG with activity-based learning and child development focus."
  },
  {
    icon: "📘",
    title: "Primary (CBSE)",
    subtitle: "Strong Academic Base",
    text: "Grade 1 – 5 with CBSE syllabus, concept-based learning and skill development."
  },
  {
    icon: "🕌",
    title: "Islamic Programs",
    subtitle: "Moral & Spiritual Education",
    text: "Thibiyan (3 Year) and Sibsor (2 Year) including Quran basics and Islamic values."
  },
  {
    icon: "🌟",
    title: "Extra Programs",
    subtitle: "Skill Development Activities",
    list: [
      "Public Speaking",
      "Swimming",
      "Art & Craft",
      "Chess",
      "Abacus",
      "Tuition"
    ]
  }
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
    fontSize: "16px",
    marginTop: "10px",
    color: "#e5e7eb"
  },

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    padding: "60px 20px",
    maxWidth: "1200px",
    margin: "auto"
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "0.3s",
    cursor: "pointer",
    minHeight: "220px"
  },

  icon: {
    fontSize: "35px",
    marginBottom: "10px"
  },

  heading: {
    color: "#065f46",
    marginBottom: "10px",
    fontSize: "20px"
  },

  text: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.6"
  },

  list: {
    paddingLeft: "0",
    listStyle: "none",
    color: "#374151",
    lineHeight: "1.8"
  }
};

export default Courses;