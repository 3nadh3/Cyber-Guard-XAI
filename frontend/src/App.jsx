import { useState } from "react";
import Scanner from "./Scanner";
import History from "./History";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("scanner");
  
  // Local Session State for History
  const [history, setHistory] = useState([]);
  const [loadedEmail, setLoadedEmail] = useState(null);

  // Receives a specific scanId to update existing sessions
  const handleScanComplete = (data, text, scanId) => {
    setHistory(prev => {
      // Remove previous version of this exact scan session
      const filteredHistory = prev.filter(item => item.id !== scanId);
      
      const newItem = {
        id: scanId,
        prediction: data.prediction,
        risk_score: data.risk_score,
        email_preview: text.substring(0, 120) + "...",
        text: text,
        timestamp: new Date().toISOString()
      };
      
      // Push newly updated scan to the very top of history
      return [newItem, ...filteredHistory];
    });
  };

  const loadFromHistory = (item) => {
    setLoadedEmail(item);
    setPage("scanner");
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => setHistory([]);

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
        {page === "scanner" && (
          <Scanner 
            onScanComplete={handleScanComplete} 
            loadedEmail={loadedEmail}
            clearLoadedEmail={() => setLoadedEmail(null)}
          />
        )}
        {page === "history" && (
          <History 
            history={history}
            onClear={clearHistory}
            onDelete={deleteHistoryItem}
            onLoad={loadFromHistory}
          />
        )}
      </main>

      <footer className="footer">
        <span>CyberGuard XAI — Adversarial ML Research Tool</span>
      </footer>
    </div>
  );
}
