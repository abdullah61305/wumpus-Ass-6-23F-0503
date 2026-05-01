import React from "react";

const categories = ["All", "Tech", "Sports", "Arts", "Games"];

const categoryColors = {
  All:    "#00ffc8",
  Tech:   "#0096ff",
  Sports: "#ffbe00",
  Arts:   "#ff5fa0",
};

function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }) {
  return (
    <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center mb-5">
      {/* Filter Buttons */}
      <div className="d-flex gap-2 flex-wrap">
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.7rem",
          color: "#7a8fa6",
          letterSpacing: "2px",
          alignSelf: "center",
          marginRight: "4px",
        }}>
          FILTER:
        </span>
        {categories.map((cat) => {
          const isActive = activeFilter === cat;
          const color = categoryColors[cat];
          return (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              style={{
                background: isActive ? `rgba(${cat === "All" ? "0,255,200" : cat === "Tech" ? "0,150,255" : cat === "Sports" ? "255,190,0" : "255,95,160"},0.12)` : "transparent",
                border: `1px solid ${isActive ? color : "rgba(255,255,255,0.1)"}`,
                color: isActive ? color : "#7a8fa6",
                borderRadius: "3px",
                padding: "5px 14px",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "1px",
                cursor: "pointer",
                textShadow: isActive ? `0 0 8px ${color}` : "none",
                boxShadow: isActive ? `0 0 12px ${color}30` : "none",
                transition: "all 0.2s ease",
              }}
            >
              {cat.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={{ position: "relative", maxWidth: "280px" }}>
        <span style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#7a8fa6",
          fontSize: "0.85rem",
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "4px",
            padding: "7px 36px 7px 34px",
            color: "#c8d6e5",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "0.95rem",
            width: "100%",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "#00ffc8"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#7a8fa6",
              cursor: "pointer",
              fontSize: "0.8rem",
              padding: 0,
            }}
          >✕</button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
