import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Navbar from "./components/Navbar";
import EventCard from "./components/EventCard";
import Footer from "./components/Footer";
import FilterBar from "./components/FilterBar";

const events = [
  { id: 1, title: "Coding Competition", desc: "Solve algorithmic problems under time pressure", category: "Tech", seats: 2 },
  { id: 2, title: "Gaming Tournament", desc: "Compete in multiplayer games", category: "Sports", seats: 1 },
  { id: 3, title: "Singing Competition", desc: "Showcase your vocal talent", category: "Arts", seats: 3 },
  { id: 4, title: "Hackathon", desc: "Build a project in 24 hours", category: "Tech", seats: 2 },
  { id: 5, title: "Debate Competition", desc: "Argue and persuade on trending topics", category: "Arts", seats: 1 },
{ id: 4, title: "Hackathon", desc: "Build a project in 24 hours", category: "Games", seats: 2 },
];

function App() {
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  

  const handleRegister = (title) => {
    setTotalRegistrations((prev) => prev + 1);
    setRegisteredEvents((prev) => [...prev, title]);
  };

  // Filter + search + sort by seats ascending (bonus)
  const filteredEvents = events
    .filter((event) =>
      (activeFilter === "All" || event.category === activeFilter) &&
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.seats - b.seats);

  const allEventsFull = events.every((e) => e.seats === 0);

  return (
    <>
      <Navbar totalRegistrations={totalRegistrations} />

      <Container className="py-5">

        {/* Hero Header */}
        <div className="text-center mb-5">
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            color: "#e8f4ff",
            letterSpacing: "4px",
            marginBottom: "8px",
          }}>
            EVENT PORTAL
          </h1>
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            color: "#7a8fa6",
            fontSize: "1rem",
            letterSpacing: "3px",
          }}>
            REGISTER · COMPETE · EXCEL
          </p>
          <div style={{
            width: "80px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #00ffc8, transparent)",
            margin: "16px auto 0",
          }} />
        </div>

        {/* Registration Summary Panel */}
        <div style={{
          background: "rgba(8,16,30,0.8)",
          border: "1px solid rgba(0,255,200,0.2)",
          borderRadius: "8px",
          padding: "20px 24px",
          marginBottom: "40px",
          boxShadow: "0 0 30px rgba(0,255,200,0.05)",
        }}>
          <h4 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.85rem",
            color: "#7a8fa6",
            letterSpacing: "2px",
            marginBottom: registeredEvents.length > 0 ? "16px" : "0",
          }}>
            TOTAL REGISTRATIONS:{" "}
            <span style={{ color: "#00ffc8", textShadow: "0 0 10px #00ffc8" }}>
              {totalRegistrations}
            </span>
          </h4>

          {registeredEvents.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {registeredEvents.map((title, index) => (
                <span key={index} style={{
                  background: "rgba(0,255,200,0.07)",
                  border: "1px solid rgba(0,255,200,0.3)",
                  color: "#00ffc8",
                  borderRadius: "3px",
                  padding: "3px 12px",
                  fontSize: "0.8rem",
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: "1px",
                }}>
                  ✓ {title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* All Full Alert - Bonus */}
        {allEventsFull && (
          <div style={{
            background: "rgba(255,61,61,0.08)",
            border: "1px solid rgba(255,61,61,0.4)",
            borderRadius: "6px",
            padding: "16px",
            textAlign: "center",
            marginBottom: "30px",
            color: "#ff3d3d",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.85rem",
            letterSpacing: "2px",
            textShadow: "0 0 10px #ff3d3d",
          }}>
            ✕ ALL EVENTS ARE FULL
          </div>
        )}

        {/* Filter & Search */}
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Event Cards */}
        {filteredEvents.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px",
            color: "#3a4f63",
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.85rem",
            letterSpacing: "2px",
          }}>
            NO EVENTS FOUND
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredEvents.map((event) => (
              <Col key={event.id}>
                <EventCard
                  title={event.title}
                  desc={event.desc}
                  category={event.category}
                  seats={event.seats}
                  onRegister={handleRegister}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Footer />
    </>
  );
}

export default App;
