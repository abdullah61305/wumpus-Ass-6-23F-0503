'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Zap, Wind, Skull, CheckCircle2, RotateCcw } from 'lucide-react';

// ===== KNOWLEDGE BASE CLASS =====
class KnowledgeBase {
  constructor() {
    this.clauses = new Set();
    this.inferenceSteps = 0;
  }

  tell(newClauses) {
    for (const clause of newClauses) {
      const sortedClause = Array.from(new Set(clause)).sort();
      this.clauses.add(JSON.stringify(sortedClause));
    }
  }

  ask(query) {
    this.inferenceSteps = 0;
    const negatedQuery = query.startsWith('~') ? query.slice(1) : `~${query}`;
    const workingClauses = Array.from(this.clauses).map(c => JSON.parse(c));
    workingClauses.push([negatedQuery]);
    const querySet = new Set(this.clauses);
    querySet.add(JSON.stringify([negatedQuery]));

    let loopCount = 0;
    const MAX_STEPS = 40;

    while (loopCount < MAX_STEPS) {
      loopCount++;
      const currentSize = workingClauses.length;
      const newClauses = [];
      const maxChecks = Math.min(currentSize, 80);

      for (let i = 0; i < maxChecks; i++) {
        for (let j = i + 1; j < maxChecks; j++) {
          this.inferenceSteps++;
          const resolvents = this.resolve(workingClauses[i], workingClauses[j]);
          for (const resolvent of resolvents) {
            if (resolvent.length === 0) return true;
            const resStr = JSON.stringify(resolvent);
            if (!querySet.has(resStr)) {
              newClauses.push(resolvent);
              querySet.add(resStr);
            }
          }
        }
      }
      if (newClauses.length === 0) return false;
      workingClauses.push(...newClauses);
    }
    return false;
  }

  resolve(c1, c2) {
    const resolvents = [];
    for (const lit1 of c1) {
      const negLit1 = lit1.startsWith('~') ? lit1.slice(1) : `~${lit1}`;
      if (c2.includes(negLit1)) {
        const newC = [...c1.filter(l => l !== lit1), ...c2.filter(l => l !== negLit1)];
        const uniqueC = Array.from(new Set(newC)).sort();
        let isTautology = false;
        for (const lit of uniqueC) {
          const n = lit.startsWith('~') ? lit.slice(1) : `~${lit}`;
          if (uniqueC.includes(n)) {
            isTautology = true;
            break;
          }
        }
        if (!isTautology) resolvents.push(uniqueC);
      }
    }
    return resolvents;
  }
}

// ===== MAIN COMPONENT =====
export default function WumpusAgent() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [agentX, setAgentX] = useState(0);
  const [agentY, setAgentY] = useState(0);
  const [grid, setGrid] = useState([]);
  const [kb, setKb] = useState(null);
  const [cellStates, setCellStates] = useState({});
  const [inferenceSteps, setInferenceSteps] = useState(0);
  const [activePercepts, setActivePercepts] = useState([]);
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [initialized, setInitialized] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'gameOver', 'survived'
  const [gameOverReason, setGameOverReason] = useState('');

  // Initialize episode
  const initializeEpisode = () => {
    const newKb = new KnowledgeBase();
    const newGrid = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill({ pit: false, wumpus: false }));

    // Place pits (15% chance per cell except [0,0])
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (x === 0 && y === 0) continue; // [0,0] is safe
        const hasPit = Math.random() < 0.15;
        newGrid[y][x] = { ...newGrid[y][x], pit: hasPit };
      }
    }

    // Place exactly one Wumpus (not at [0,0])
    let wumpusPlaced = false;
    while (!wumpusPlaced) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (!(x === 0 && y === 0)) {
        newGrid[y][x] = { ...newGrid[y][x], wumpus: true };
        wumpusPlaced = true;
      }
    }

    setGrid(newGrid);
    setKb(newKb);
    setAgentX(0);
    setAgentY(0);
    setCellStates({});
    setVisitedCells(new Set(['0,0']));
    setGameState('playing');
    setGameOverReason('');
    setInitialized(true);

    // Process starting cell [0,0]
    processCell(newKb, newGrid, 0, 0, {});
  };

  // Process cell and update KB
  const processCell = (kbInstance, currentGrid, x, y, currentCellStates) => {
    const cellKey = `${x},${y}`;
    const newStates = { ...currentCellStates };

    // Detect percepts
    const percepts = [];
    const adjacentCells = getAdjacentCells(x, y);

    // Check for breeze (pit adjacent)
    const hasBreeze = adjacentCells.some(([ax, ay]) => currentGrid[ay][ax].pit);
    if (hasBreeze) percepts.push('Breeze');

    // Check for stench (wumpus adjacent)
    const hasStench = adjacentCells.some(([ax, ay]) => currentGrid[ay][ax].wumpus);
    if (hasStench) percepts.push('Stench');

    // Add percept rules to KB
    const breezeLiterals = adjacentCells.map(([ax, ay]) => `P_${ax}_${ay}`);
    const stenchLiterals = adjacentCells.map(([ax, ay]) => `W_${ax}_${ay}`);

    // Add rules for this cell (Breeze/Stench biconditional)
    if (breezeLiterals.length > 0) {
      // B_{x,y} => (P_adj1 v P_adj2 ...) converted to CNF
      const breezeClauses = convertBreezeToCNF(x, y, breezeLiterals, hasBreeze);
      kbInstance.tell(breezeClauses);
    }

    if (stenchLiterals.length > 0) {
      // S_{x,y} => (W_adj1 v W_adj2 ...) converted to CNF
      const stenchClauses = convertStenchToCNF(x, y, stenchLiterals, hasStench);
      kbInstance.tell(stenchClauses);
    }

    // Tell KB the actual percepts
    if (hasBreeze) {
      kbInstance.tell([[`B_${x}_${y}`]]);
    } else {
      kbInstance.tell([[`~B_${x}_${y}`]]);
    }

    if (hasStench) {
      kbInstance.tell([[`S_${x}_${y}`]]);
    } else {
      kbInstance.tell([[`~S_${x}_${y}`]]);
    }

    // Update cell state and infer safety
    newStates[cellKey] = { percepts, visited: true };

    // Check adjacent cells for safety
    let totalSteps = kbInstance.inferenceSteps;
    for (const [ax, ay] of adjacentCells) {
      const adjKey = `${ax},${ay}`;
      const safeQuery = `~P_${ax}_${ay}`;
      const noWumpusQuery = `~W_${ax}_${ay}`;

      kbInstance.ask(safeQuery);
      const stepsAfterPit = kbInstance.inferenceSteps;
      kbInstance.ask(noWumpusQuery);
      const stepsAfterWumpus = kbInstance.inferenceSteps;

      totalSteps = stepsAfterWumpus;

      const isPitSafe = kbInstance.ask(safeQuery);
      const isWumpusSafe = kbInstance.ask(noWumpusQuery);

      if (isPitSafe && isWumpusSafe) {
        newStates[adjKey] = { ...newStates[adjKey], safe: true };
      }
    }

    setInferenceSteps(totalSteps);
    setCellStates(newStates);
    setActivePercepts(percepts);
  };

  // Convert breeze rule to CNF
  const convertBreezeToCNF = (x, y, pitLiterals, hasBreeze) => {
    const clauses = [];
    if (hasBreeze) {
      // B_{x,y} is true, so at least one pit is adjacent: (P_adj1 v P_adj2 ...)
      clauses.push(pitLiterals);
    } else {
      // B_{x,y} is false, so no pits are adjacent: (~P_adj1 v ~P_adj2 ...)
      clauses.push(pitLiterals.map(p => `~${p}`));
    }
    return clauses;
  };

  // Convert stench rule to CNF
  const convertStenchToCNF = (x, y, wumpusLiterals, hasStench) => {
    const clauses = [];
    if (hasStench) {
      // S_{x,y} is true, so at least one wumpus is adjacent: (W_adj1 v W_adj2 ...)
      clauses.push(wumpusLiterals);
    } else {
      // S_{x,y} is false, so no wumpus is adjacent: (~W_adj1 v ~W_adj2 ...)
      clauses.push(wumpusLiterals.map(w => `~${w}`));
    }
    return clauses;
  };

  // Get adjacent cells within bounds
  const getAdjacentCells = (x, y) => {
    const adjacent = [];
    const directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        adjacent.push([nx, ny]);
      }
    }
    return adjacent;
  };

  // Handle agent movement
  const moveAgent = (dx, dy) => {
    if (!initialized || !kb || gameState !== 'playing') return;

    const newX = agentX + dx;
    const newY = agentY + dy;

    if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
      // Collision detection - check if target cell has pit or wumpus
      const targetCell = grid[newY][newX];
      if (targetCell.pit) {
        setAgentX(newX);
        setAgentY(newY);
        setGameState('gameOver');
        setGameOverReason('Pit');
        return;
      }
      if (targetCell.wumpus) {
        setAgentX(newX);
        setAgentY(newY);
        setGameState('gameOver');
        setGameOverReason('Wumpus');
        return;
      }

      setAgentX(newX);
      setAgentY(newY);

      const cellKey = `${newX},${newY}`;
      if (!visitedCells.has(cellKey)) {
        const newVisited = new Set(visitedCells);
        newVisited.add(cellKey);
        setVisitedCells(newVisited);
        processCell(kb, grid, newX, newY, cellStates);

        // Check if all safe cells have been visited (optional win condition)
        const totalSafeCells = rows * cols - 1; // Total cells minus starting cell
        let hazardCount = 0;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (grid[y][x].pit || grid[y][x].wumpus) hazardCount++;
          }
        }
        const safeCellCount = totalSafeCells - hazardCount;
        if (newVisited.size === safeCellCount) {
          setGameState('survived');
        }
      } else {
        const percepts = cellStates[cellKey]?.percepts || [];
        setActivePercepts(percepts);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!initialized) return;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveAgent(0, -1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveAgent(0, 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveAgent(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveAgent(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initialized, agentX, agentY, cellStates, kb, grid]);

  // Get cell styling
  const getCellStyle = (x, y) => {
    const cellKey = `${x},${y}`;
    const cellState = cellStates[cellKey];
    const isAgent = agentX === x && agentY === y;
    const isVisited = visitedCells.has(cellKey);

    if (isAgent) {
      return 'border-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50';
    }

    if (!isVisited) {
      return 'border border-white/10 bg-zinc-800/50';
    }

    // Check actual hazards
    if (grid[y] && grid[y][x]) {
      const { pit, wumpus } = grid[y][x];
      if (pit) return 'border border-red-500 bg-red-500/20';
      if (wumpus) return 'border border-red-500 bg-red-500/20';
    }

    // Inferred safety
    if (cellState?.safe) {
      return 'border border-green-500 bg-green-500/20';
    }

    // Visited but not determined
    if (cellState?.visited) {
      return 'border border-amber-500 bg-amber-500/10';
    }

    return 'border border-white/10 bg-zinc-800/50';
  };

  const renderGrid = () => {
    if (grid.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-white/50">Click "Initialize Episode" to start</p>
        </div>
      );
    }

    return (
      <div
        className="gap-2 p-4 rounded-lg border border-white/10 bg-zinc-900/50 inline-block"
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isAgent = agentX === x && agentY === y;
            return (
              <div
                key={`${x}-${y}`}
                className={`w-16 h-16 rounded flex items-center justify-center text-xs font-mono transition-all ${getCellStyle(x, y)}`}
              >
                <div className="flex flex-col gap-1 items-center justify-center">
                  {isAgent ? (
                    <div className="w-4 h-4 rounded-full bg-blue-400 glow-blue animate-pulse" />
                  ) : cell.pit ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : cell.wumpus ? (
                    <Skull className="w-5 h-5 text-red-500" />
                  ) : cellStates[`${x},${y}`]?.safe ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : cellStates[`${x},${y}`]?.visited ? (
                    <span className="text-amber-500">?</span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      {/* HEADER */}
      <header className="border-b border-white/10 pb-4 mb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              Wumpus <span className="text-blue-400">Logic Agent</span>
            </h1>
            <button
              onClick={initializeEpisode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Initialize Episode
            </button>
          </div>

          {/* CONTROLS */}
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60">Rows:</label>
              <input
                type="number"
                min="3"
                max="8"
                value={rows}
                onChange={(e) => setRows(Math.max(3, Math.min(8, parseInt(e.target.value) || 3)))}
                className="w-16 px-2 py-1 bg-zinc-800 border border-white/10 rounded text-white hover:bg-zinc-700 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60">Columns:</label>
              <input
                type="number"
                min="3"
                max="8"
                value={cols}
                onChange={(e) => setCols(Math.max(3, Math.min(8, parseInt(e.target.value) || 3)))}
                className="w-16 px-2 py-1 bg-zinc-800 border border-white/10 rounded text-white hover:bg-zinc-700 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            {initialized && (
              <div className="text-sm text-white/60">
                Agent at <span className="text-blue-400 font-mono">[{agentX},{agentY}]</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* CENTER - GRID VISUALIZER */}
        <div className="flex justify-center">
          <div className="flex flex-col gap-4">
            {renderGrid()}
            {initialized && (
              <div className="text-center text-sm text-white/60">
                Use arrow keys to navigate the agent
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR - METRICS DASHBOARD */}
        <div className="flex flex-col gap-4">
          {/* Inference Steps */}
          <div className="border border-white/10 rounded-lg p-4 bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-sm">Inference Steps</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{inferenceSteps}</div>
            <p className="text-xs text-white/40 mt-1">Total resolution steps</p>
          </div>

          {/* Active Percepts */}
          <div className="border border-white/10 rounded-lg p-4 bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-3">
              <Wind className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm">Active Percepts</h3>
            </div>

            <div className="flex flex-col gap-2">
              {activePercepts.length === 0 ? (
                <div className="text-sm text-white/40 py-2">None</div>
              ) : (
                activePercepts.map((percept) => (
                  <div
                    key={percept}
                    className={`px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
                      percept === 'Breeze'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {percept}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cell Statistics */}
          <div className="border border-white/10 rounded-lg p-4 bg-zinc-900/50">
            <h3 className="font-semibold text-sm mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Visited Cells:</span>
                <span className="font-mono text-white">{visitedCells.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Cells:</span>
                <span className="font-mono text-white">{rows * cols}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Safe Cells:</span>
                <span className="font-mono text-green-400">
                  {Object.values(cellStates).filter(s => s.safe).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">KB Clauses:</span>
                <span className="font-mono text-blue-400">{kb?.clauses.size || 0}</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="border border-white/10 rounded-lg p-4 bg-zinc-900/50">
            <h3 className="font-semibold text-sm mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500/50 border border-blue-500" />
                <span className="text-white/70">Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/50 border border-green-500" />
                <span className="text-white/70">Safe (Inferred)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/50 border border-red-500" />
                <span className="text-white/70">Pit/Wumpus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500/50 border border-amber-500" />
                <span className="text-white/70">Unknown</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GAME OVER / SURVIVED MODAL */}
      {(gameState === 'gameOver' || gameState === 'survived') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/20 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            {gameState === 'gameOver' ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  {gameOverReason === 'Pit' ? (
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                  ) : (
                    <Skull className="w-12 h-12 text-red-500" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-center mb-2 text-white">Game Over</h2>
                <p className="text-center text-white/70 mb-6">
                  You hit a <span className="font-semibold text-red-400">{gameOverReason}</span> and the simulation ended.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2 text-white">Simulation Complete</h2>
                <p className="text-center text-white/70 mb-6">
                  You survived and visited all safe cells!
                </p>
              </>
            )}

            <button
              onClick={() => {
                setGameState('playing');
                initializeEpisode();
              }}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart Episode
            </button>
          </div>
        </div>
      )}

      {/* CSS for glow effect */}
      <style jsx>{`
        @keyframes glow-blue {
          0%, 100% {
            box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.8);
          }
        }
        .glow-blue {
          animation: glow-blue 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
