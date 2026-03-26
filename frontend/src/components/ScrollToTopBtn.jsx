import { useEffect, useState } from "react";

function ScrollToTopBtn() {
  const [show, setShow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show button when scroll down
  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {show && (
        <button
          onClick={scrollTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...styles.btn,
            transform: isHovered
              ? "scale(1.15) translateY(-5px)"
              : "scale(1)",
            boxShadow: isHovered
              ? "0 8px 25px rgba(245, 158, 11, 0.5)"
              : "0 4px 20px rgba(0,0,0,0.25)",
          }}
          aria-label="Scroll to top"
        >
          <span style={styles.icon}>⬆️</span>
        </button>
      )}
    </>
  );
}

const styles = {
  btn: {
    position: "fixed",
    bottom: "30px",
    right: "25px",
    zIndex: 1000,
    background: "linear-gradient(135deg, #cde7f0, #52a4a7)",
    color: "#065f46",
    border: "none",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    animation: "fadeInUp 0.4s ease-out",
    backdropFilter: "blur(5px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  },

  icon: {
    fontSize: "14px",
    display: "block",
  },
};

// Add CSS animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .scroll-btn {
        bottom: 20px !important;
        right: 20px !important;
      }
    }

    @media (max-width: 480px) {
      .scroll-btn {
        bottom: 15px !important;
        right: 15px !important;
      }
    }
  `;

  if (!document.head.querySelector("#scroll-btn-styles")) {
    styleSheet.id = "scroll-btn-styles";
    document.head.appendChild(styleSheet);
  }
}

export default ScrollToTopBtn;