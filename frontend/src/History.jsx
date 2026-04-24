import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function History({ refresh }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/history`);
      const data = await res.json();
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    await fetch(`${API}/history`, { method: "DELETE" });
    setHistory([]);
  };

  useEffect(() => {
    fetchHistory();
  }, [refresh]);

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h2 className="history-title">Scan History</h2>
          <p className="history-sub">{history.length} scan{history.length !== 1 ? "s" : ""} recorded this session</p>
        </div>
        {history.length > 0 && (
          <button className="clear-btn" onClick={clearHistory}>Clear All</button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <p>No scans yet. Run an analysis first.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className={`history-item ${item.prediction === 1 ? "item-phish" : "item-safe"}`}>
              <div className="item-status">
                <span className="item-dot" />
                <span className="item-verdict">
                  {item.prediction === 1 ? "PHISHING MAIL" : "LEGITIMATE EMAIL"}
                </span>
              </div>
              <div className="item-preview">{item.email_preview}</div>
              <div className="item-meta">
                <span className="item-risk">% of Phishing: {Math.round(item.risk_score * 100)}%</span>
                <span className="item-time">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
