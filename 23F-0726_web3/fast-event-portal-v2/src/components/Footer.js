import React from "react";
import { Container } from "react-bootstrap";

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(0,255,200,0.15)",
      marginTop: "80px",
      padding: "30px 0",
      background: "rgba(5,10,20,0.8)",
    }}>
      <Container className="text-center">
        <p style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.7rem",
          color: "#3a4f63",
          letterSpacing: "2px",
          marginBottom: "4px",
        }}>
          ⚡ FAST FEST 2026
        </p>
        <p style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "0.85rem",
          color: "#3a4f63",
          margin: 0,
        }}>
          National University of Computer & Emerging Sciences — Faisalabad Campus
        </p>
      </Container>
    </footer>
  );
}

export default Footer;
