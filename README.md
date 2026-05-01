# Dynamic Wumpus Logic Agent (A.R.C.A.)

A web-based Knowledge-Based Agent that navigates the Wumpus World using Propositional Logic and Resolution Refutation. 

## Features
- **Dynamic Grid:** Configurable matrix sizing with randomized hazard placement.
- **Inference Engine:** Converts percepts (`Breeze`, `Stench`) into Conjunctive Normal Form (CNF) rules.
- **Resolution Refutation:** Automated theorem proving to deduce safe cells (`~P ^ ~W`).
- **Telemetry:** Real-time tracking of inference loop steps and active percept states.

## Tech Stack
- Next.js / React
- Tailwind CSS
