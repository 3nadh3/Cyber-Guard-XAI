import React from "react";

export default function History({ history, onClear, onDelete, onLoad }) {
  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h2 className="history-title">Scan History</h2>
          <p className="history-sub">
            {history.length} scan{history.length !== 1 ? "s" : ""} recorded in this session
          </p>
        </div>
        {history.length > 0 && (
          <button className="clear-btn" onClick={onClear}>Clear All</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <p>No scans yet. Run an analysis first.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className={`history-item ${item.prediction === 1 ? "item-phish" : "item-safe"}`}>
              
              <div className="history-item-header">
                <div className="item-status">
                  <span className="item-dot" />
                  <span className="item-verdict">
                    {item.prediction === 1 ? "PHISHING MAIL" : "LEGITIMATE EMAIL"}
                  </span>
                </div>
                
                <div className="history-actions">
                  <button className="history-use-btn" onClick={() => onLoad(item)}>
                    Load & Edit
                  </button>
                  <button className="history-del-btn" onClick={() => onDelete(item.id)} title="Delete item">
                    ✕
                  </button>
                </div>
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
