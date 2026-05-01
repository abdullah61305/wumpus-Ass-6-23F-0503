import React from "react";
import { Container } from "react-bootstrap";

function Navbar({ totalRegistrations }) {
  return (
    <nav style={{
      background: "rgba(5,10,20,0.95)",
      borderBottom: "1px solid rgba(0,255,200,0.3)",
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      padding: "0",
    }}>
      <Container className="d-flex justify-content-between align-items-center py-3">
        <div>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1.4rem",
            fontWeight: 900,
            color: "#00ffc8",
            textShadow: "0 0 20px rgba(0,255,200,0.6), 0 0 40px rgba(0,255,200,0.3)",
            letterSpacing: "2px",
          }}>
            ⚡ FAST FEST
          </span>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1rem",
            color: "#0096ff",
            marginLeft: "8px",
            textShadow: "0 0 15px rgba(0,150,255,0.6)",
          }}>2026</span>
        </div>

        <div style={{
          background: "rgba(0,255,200,0.05)",
          border: "1px solid rgba(0,255,200,0.3)",
          borderRadius: "4px",
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <span style={{ color: "#7a8fa6", fontSize: "0.8rem", fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px" }}>
            REGISTRATIONS
          </span>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#00ffc8",
            textShadow: "0 0 10px rgba(0,255,200,0.8)",
          }}>
            {String(totalRegistrations).padStart(2, "0")}
          </span>
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;
