import React, { useState } from "react";

const categoryConfig = {
  Tech:   { color: "#0096ff", glow: "rgba(0,150,255,0.4)",   icon: "💻", bg: "rgba(0,150,255,0.07)"   },
  Sports: { color: "#ffbe00", glow: "rgba(255,190,0,0.4)",   icon: "🏆", bg: "rgba(255,190,0,0.07)"   },
  Arts:   { color: "#ff5fa0", glow: "rgba(255,95,160,0.4)",  icon: "🎨", bg: "rgba(255,95,160,0.07)"  },
};

function EventCard({ title, desc, category, seats, onRegister }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [seatsLeft, setSeatsLeft] = useState(seats);
  const [pulse, setPulse] = useState(false);

  const cfg = categoryConfig[category] || categoryConfig.Tech;
  const isFull = seatsLeft === 0;

  const handleRegister = () => {
    if (isRegistered || isFull) return;
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
    setIsRegistered(true);
    setSeatsLeft((prev) => prev - 1);
    onRegister(title);
  };

  const borderColor = isRegistered ? "#00ffc8" : isFull ? "#ff3d3d" : cfg.color;
  const glowColor   = isRegistered ? "rgba(0,255,200,0.25)" : isFull ? "rgba(255,61,61,0.2)" : cfg.glow;

  return (
    <div style={{
      background: "rgba(8,16,30,0.9)",
      border: `1px solid ${borderColor}`,
      borderRadius: "8px",
      padding: "24px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      boxShadow: `0 0 20px ${glowColor}, inset 0 0 30px rgba(0,0,0,0.3)`,
      transition: "all 0.3s ease",
      transform: pulse ? "scale(0.98)" : "scale(1)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent line */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
      }} />

      {/* Category badge */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span style={{
          background: cfg.bg,
          border: `1px solid ${cfg.color}`,
          color: cfg.color,
          borderRadius: "3px",
          padding: "2px 10px",
          fontSize: "0.75rem",
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "1px",
          textShadow: `0 0 8px ${cfg.color}`,
        }}>
          {cfg.icon} {category.toUpperCase()}
        </span>

        <span style={{
          color: isFull ? "#ff3d3d" : "#00ffc8",
          fontSize: "0.8rem",
          fontFamily: "'Orbitron', sans-serif",
          textShadow: isFull ? "0 0 8px #ff3d3d" : "0 0 8px #00ffc8",
        }}>
          {isFull ? "FULL" : `${seatsLeft} SEATS`}
        </span>
      </div>

      {/* Title */}
      <h5 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        color: "#e8f4ff",
        fontSize: "1rem",
        marginBottom: "10px",
        lineHeight: 1.4,
        textShadow: `0 0 10px ${borderColor}40`,
      }}>
        {title}
      </h5>

      {/* Description */}
      <p style={{
        color: "#7a8fa6",
        fontSize: "0.9rem",
        lineHeight: 1.6,
        flexGrow: 1,
        marginBottom: "20px",
        fontFamily: "'Rajdhani', sans-serif",
      }}>
        {desc}
      </p>

      {/* Seat bar */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "2px",
          height: "4px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${(seatsLeft / seats) * 100}%`,
            background: isFull ? "#ff3d3d" : isRegistered ? "#00ffc8" : cfg.color,
            boxShadow: `0 0 6px ${borderColor}`,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={isRegistered || isFull}
        style={{
          background: isRegistered
            ? "rgba(0,255,200,0.1)"
            : isFull
            ? "rgba(255,61,61,0.1)"
            : `rgba(${category === "Tech" ? "0,150,255" : category === "Sports" ? "255,190,0" : "255,95,160"},0.1)`,
          border: `1px solid ${borderColor}`,
          color: borderColor,
          borderRadius: "4px",
          padding: "10px",
          width: "100%",
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.8rem",
          letterSpacing: "2px",
          fontWeight: 700,
          cursor: isRegistered || isFull ? "not-allowed" : "pointer",
          textShadow: `0 0 8px ${borderColor}`,
          boxShadow: isRegistered || isFull ? "none" : `0 0 15px ${glowColor}`,
          transition: "all 0.2s ease",
          opacity: isRegistered || isFull ? 0.7 : 1,
        }}
      >
        {isRegistered ? "✓ REGISTERED" : isFull ? "✕ FULL" : "REGISTER →"}
      </button>
    </div>
  );
}

export default EventCard;
