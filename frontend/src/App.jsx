import { useState } from "react";
import Scanner from "./Scanner";
import History from "./History";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("scanner");
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const triggerHistoryRefresh = () => setHistoryRefresh(n => n + 1);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">CyberGuard<span className="logo-accent">XAI</span></span>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${page === "scanner" ? "active" : ""}`}
              onClick={() => setPage("scanner")}
            >
              Scanner
            </button>
            <button
              className={`nav-btn ${page === "history" ? "active" : ""}`}
              onClick={() => setPage("history")}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {page === "scanner" && <Scanner onScanComplete={triggerHistoryRefresh} />}
        {page === "history" && <History refresh={historyRefresh} />}
      </main>

      <footer className="footer">
        <span>CyberGuard XAI — Adversarial ML Research Tool</span>
      </footer>
    </div>
  );
}
