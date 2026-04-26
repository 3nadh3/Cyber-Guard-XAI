import { useState, useRef, useCallback, useEffect } from "react";
import { PHISHING_KEYWORDS, PHISHING_KEYWORDS_MAP } from "./keywords.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── 16 Expanded Example Emails (08Phishing, 08 Legitimate) ─────────────────
const EXAMPLES = {
  phishing: [
    {
      label: "Bank account suspended",
      preview: "Your account has been temporarily suspended...",
      text: `Subject: Urgent: Your Account Has Been Suspended\n\nDear Valued Customer,\n\nWe have detected unusual activity on your bank account. For your security, your account has been temporarily suspended.\n\nPlease verify your account information immediately to restore full access. If you do not confirm your details within 24 hours, your account may be permanently closed.\n\nClick the link below to validate your identity:\nhttp://secure-bank-verify-login.com/confirm?user=restore\n\nPlease provide your account number, password, and date of birth to complete the verification process.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\nCustomer Security Team\nSecure National Bank`,
    },
    {
      label: "Prize winner scam",
      preview: "Congratulations! You have been selected as a winner...",
      text: `Subject: Congratulations! You Have Won $5,000\n\nDear Winner,\n\nCongratulations! You have been selected as a lucky winner of our monthly prize draw. You have won $5,000 cash.\n\nTo claim your free prize, you must act now. This offer expires in 48 hours. Click the link below to confirm your details and receive your funds immediately:\n\nhttp://prize-claim-winner-free.com/claim?id=829371\n\nPlease provide your full name, address, credit card number, and social security number to process your payment.\n\nHurry — limited time offer. Do not miss this opportunity!\n\nBest regards,\nPrize Notification Team`,
    },
    {
      label: "IT password expiry",
      preview: "Your password will expire in 24 hours...",
      text: `Subject: Action Required: Your Password Expires in 24 Hours\n\nDear User,\n\nYour company email password will expire in 24 hours. Failure to update your password immediately will result in your account being locked.\n\nPlease click the link below to update your login credentials urgently:\n\nhttp://company-it-portal-login-update.com/reset\n\nEnter your current username, password, and new password to authorize the update. This is a mandatory security requirement.\n\nIf you do not act within 24 hours, you will lose access to all company systems.\n\nRegards,\nIT Security Department`,
    },
    {
      label: "CEO Wire Transfer Fraud",
      preview: "Are you at your desk? I need a wire transfer...",
      text: `Subject: Urgent Wire Transfer Request\n\nHi,\n\nAre you at your desk right now? I am tied up in a confidential board meeting and cannot take any phone calls.\n\nI need you to process an urgent wire transfer to a new vendor immediately. We need to secure this acquisition before the end of the day. Please confirm you can handle this right now and I will send over the routing instructions and the invoice amount.\n\nKeep this strictly confidential until the merger is announced.\n\nSent from my iPhone\nCEO / Executive Director`,
    },
    {
      label: "Fake Invoice Attached",
      preview: "Your recent payment of $499.99 was processed...",
      text: `Subject: Invoice Receipt - Payment Processed Successfully\n\nDear Customer,\n\nThank you for your recent purchase. Your credit card has been charged $499.99 for the Geek Squad Annual Protection Plan.\n\nIf you did not authorize this purchase or wish to cancel your subscription, please open the attached PDF invoice and click the cancellation link immediately to claim your refund.\n\nYou only have 24 hours to dispute this charge before the funds are permanently transferred.\n\nRegards,\nBilling Department`,
    },
    {
      label: "Cloud Storage Full",
      preview: "Your mailbox has exceeded its storage limit...",
      text: `Subject: ALERT: Mailbox Quota Exceeded\n\nDear User,\n\nYour university mailbox has exceeded its storage limit of 5GB. You will not be able to send or receive any new incoming messages until you upgrade your quota.\n\nTo prevent the loss of important academic emails, please click the secure link below to verify your student credentials and claim your free storage upgrade:\n\nhttp://university-student-storage-upgrade-portal.net/login\n\nFailure to verify your identity within 12 hours will result in the permanent deletion of your oldest emails.\n\nIT Helpdesk`,
    },
    {
      label: "Unusual Login Attempt",
      preview: "We detected a login from Russia. Click here to secure...",
      text: `Subject: SECURITY ALERT: Unusual Sign-In Detected\n\nDear User,\n\nWe detected a new login to your account from an unrecognized device in Moscow, Russia.\n\nIf this was not you, your account may be compromised. You must secure your account immediately to prevent unauthorized transactions.\n\nClick here to report the user and lock your account:\nhttp://security-alert-unusual-login-verification.com/auth\n\nFailure to complete this verification process within 12 hours will result in a permanent suspension for your safety.\n\nSecurity Team`,
    },
    {
      label: "HR Payroll Update",
      preview: "Urgent: Update your direct deposit information...",
      text: `Subject: URGENT: Direct Deposit Information Required\n\nHello,\n\nOur Human Resources payroll system is undergoing a mandatory update. Your current direct deposit details have failed validation for the upcoming pay period.\n\nTo ensure your paycheck is processed on time, you must update your banking information immediately via the secure employee portal below:\n\nhttp://hr-payroll-update-portal-employee.com/login\n\nPlease have your routing number, account number, and SSN ready. If you do not update this by 5:00 PM today, your payment will be delayed by up to 30 days.\n\nHR Department`,
    }
  ],
  legitimate: [
    {
      label: "Research Meeting Follow-up",
      preview: "Notes regarding the NPU Neural Network implementation...",
      text: `Subject: Next Steps: 3-Layered Neural Network on NPU\n\nHi Trinadh,\n\nGreat work on the DRAM contention covert channel presentation yesterday. Seeing it hit 99.8% accuracy was impressive.\n\nFor our next sprint, I want you to focus on the 3-layered Neural Network implementation on the NPU. Please review the MLIR documentation we discussed and let me know if you hit any dead code elimination errors during compilation. We need to explicitly handle the AST nodes to bypass that.\n\nLet's meet on Tuesday at 2 PM to go over the power measurement data.\n\nBest,\nProfessor Liang\nCentral Michigan University`,
    },
    {
      label: "Group Project Sync",
      preview: "Hey guys, when are we meeting to finalize the script...",
      text: `Subject: Re: Presentation Script Finalization\n\nHey team,\n\nJust following up on our presentation for next week. I've finished drafting the section on side-channel monitoring between the CPU and NPU.\n\nHimasri and Jeetender, can you review the slides I added? Buphesh, let me know if you need help debugging the LLVM toolchain stuff before we finalize the report.\n\nLet's jump on a quick Discord call tonight around 8 PM to do a dry run.\n\nThanks,\nTrinadh`,
    },
    {
      label: "Department Chairperson Form",
      preview: "Your academic transfer request has been approved...",
      text: `Subject: Approval: Academic Course Transfer\n\nDear Trinadh,\n\nI am writing to confirm that your academic transfer request has been officially approved and processed by the department.\n\nYour credits for CPS 541 (Modern Databases) and CPS 685 (Pattern Recognition & Data Mining) from Fall 2025 have been successfully applied to your current degree plan.\n\nPlease verify these changes in the student portal and reach out to your academic advisor if you have any questions regarding your upcoming schedule.\n\nSincerely,\nDr. Patrick Kinnicutt\nDepartment Chairperson\nCentral Michigan University`,
    },
    {
      label: "Password Reset (User Initiated)",
      preview: "Here is the link to reset your password...",
      text: `Subject: Reset Your Password\n\nHi Trinadh,\n\nWe received a request to reset the password for your GitHub account. \n\nIf you made this request, please click the button below to choose a new password:\n\nhttps://github.com/password_reset/token=8f92j3k4\n\nThis link will expire in 30 minutes. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.\n\nThanks,\nThe GitHub Security Team`,
    },
    {
      label: "IT Maintenance Notice",
      preview: "Scheduled network downtime this weekend...",
      text: `Subject: Scheduled Network Maintenance - Saturday 2AM\n\nHello everyone,\n\nPlease be advised that the IT department will be performing routine server maintenance this Saturday between 2:00 AM and 5:00 AM EST.\n\nDuring this window, access to the internal grading portal and the main student dashboard may be intermittent or completely unavailable. Email services will not be affected and will remain fully operational.\n\nNo action is required on your part. If you experience any connectivity issues after 6:00 AM Saturday, please submit a standard support ticket.\n\nThank you for your patience,\nCampus IT Operations`,
    },
    {
      label: "Conference Newsletter",
      preview: "Early bird registration is now open for USENIX...",
      text: `Subject: USENIX Security '26 - Early Bird Registration Open\n\nHello Researcher,\n\nWe are excited to announce that early bird registration is now officially open for the USENIX Security Symposium 2026, taking place in August.\n\nRegister before June 15th to secure the discounted academic rate. You can view the preliminary schedule, list of accepted papers, and workshop details on our main website.\n\nIf you require a letter of invitation for visa purposes, please fill out the form linked on the registration page as soon as possible.\n\nWe look forward to seeing you there.\n\nBest,\nUSENIX Organizing Committee`
    },
    {
      label: "Uber Ride Receipt",
      preview: "Your Tuesday morning trip with Uber...",
      text: `Subject: Your Tuesday morning trip with Uber\n\nHere's your receipt for your ride, Trinadh.\n\nTotal: $14.52\n\nTuesday, April 21, 2026\n\nBase Fare: $8.00\nDistance: $4.10\nTime: $2.42\n\nIf you left something behind or need to report an issue with your driver, please visit the help section in the Uber app. \n\nThank you for riding with us.`,
    },
    {
      label: "GitHub Action Failure",
      preview: "Run failed: build and test on main branch...",
      text: `Subject: [GitHub] Run failed: build and test on main branch\n\nRun failed for build and test on main\n\nRepository: trinadh/covert-channel-npu\nWorkflow: Node.js CI\nDuration: 2 minutes and 14 seconds\n\nThe job 'build' failed at step 'Run npm test'. Please check the workflow logs for detailed error output regarding the MERN stack backend integration tests.\n\nYou can view the full run details here:\nhttps://github.com/trinadh/covert-channel-npu/actions/runs/98234\n\nGitHub Actions`,
    }
  ],
};

// ── DOM helpers ─────────────────────────────────────────────────────────────
function getPlainText(el) {
  let t = "";
  function walk(n) {
    if (n.nodeType === Node.TEXT_NODE) { t += n.textContent; return; }
    for (const c of n.childNodes) walk(c);
    if (["DIV","P"].includes(n.nodeName) && n !== el) t += "\n";
  }
  walk(el);
  return t.replace(/\n$/, "");
}

function getCaretOffset(root, range) {
  const pre = range.cloneRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString().length;
}

function restoreCaretOffset(root, offset) {
  function walk(node, rem) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (rem <= node.textContent.length) return { node, offset: rem };
      return { left: rem - node.textContent.length };
    }
    for (const c of node.childNodes) {
      const r = walk(c, rem);
      if (r && r.left === undefined) return r;
      if (r?.left !== undefined) rem = r.left;
    }
    return { left: rem };
  }
  const res = walk(root, offset);
  if (res && res.left === undefined) {
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(res.node, res.offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// ── HTML builder ─────────────────────────────────────────────────────────────
function buildHTML(text, limeMap) {
  if (!text) return "";
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (!limeMap) {
    const sorted = [...PHISHING_KEYWORDS].sort((a, b) => b.length - a.length);
    let out = esc;
    for (const kw of sorted) {
      out = out.replace(new RegExp(`\\b(${kw})\\b`, "gi"),
        `<mark class="live-hl">$1</mark>`);
    }
    return out.replace(/\n/g, "<br/>");
  }

  const tokens = esc.split(/(\s+)/);
  return tokens.map(tok => {
    if (/^\s+$/.test(tok)) return tok.replace(/\n/g, "<br/>");
    const clean = tok.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const score = limeMap[clean];
    const cls =
      score === undefined  ? "tok-neutral" :
      score >  0.02        ? "tok-phish-strong" :
      score >  0.005       ? "tok-phish-mild" :
      score < -0.02        ? "tok-safe-strong" :
      score < -0.005       ? "tok-safe-mild" :
                             "tok-neutral";
    const scoreAttr = score !== undefined ? score.toFixed(4) : "";
    return `<span class="tok ${cls}" data-word="${clean}" data-score="${scoreAttr}">${tok}</span>`;
  }).join("");
}

// ── risk helpers ─────────────────────────────────────────────────────────────
function getRiskLevel(pct) {
  if (pct >= 50) return { color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
  return         { color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
}

// ── Examples Panel ────────────────────────────────────────────────────────────
function ExamplesPanel({ onUse, onClose }) {
  const [tab, setTab] = useState("phishing");

  const handleUse = (text) => {
    onUse(text);
    onClose();
  };

  return (
    <div className="examples-overlay" onClick={onClose}>
      <div className="examples-panel" onClick={e => e.stopPropagation()}>
        <div className="ex-header">
          <div className="ex-title">
            <span className="ex-title-icon">⬡</span>
            Example Emails
          </div>
          <button className="ex-close" onClick={onClose}>✕</button>
        </div>
        <div className="ex-tabs">
          <button
            className={`ex-tab ${tab === "phishing" ? "ex-tab-active ex-tab-phish" : ""}`}
            onClick={() => setTab("phishing")}
          >
            🔴 Phishing Examples (08)
          </button>
          <button
            className={`ex-tab ${tab === "legitimate" ? "ex-tab-active ex-tab-safe" : ""}`}
            onClick={() => setTab("legitimate")}
          >
            🟢 Legitimate Examples (08)
          </button>
        </div>
        <div className="ex-list">
          {EXAMPLES[tab].map((ex, i) => (
            <div key={i} className={`ex-card ${tab === "phishing" ? "ex-card-phish" : "ex-card-safe"}`}>
              <div className="ex-card-header">
                <div>
                  <div className="ex-card-label">{ex.label}</div>
                  <div className="ex-card-preview">{ex.preview}</div>
                </div>
                <div className="ex-card-actions">
                  <button
                    className={`ex-use-btn ${tab === "phishing" ? "ex-use-phish" : "ex-use-safe"}`}
                    onClick={() => handleUse(ex.text)}
                  >
                    Use this email →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function Scanner({ onScanComplete, loadedEmail, clearLoadedEmail }) {
  const [emailText, setEmailText] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [limeMap,   setLimeMap]   = useState(null);
  const [tooltip,   setTooltip]   = useState(null);
  const [error,     setError]     = useState("");
  const [dirty,     setDirty]     = useState(false);
  const [showEx,    setShowEx]    = useState(false);

  // ── Evasion & Details state ────────────────────────────────────────────────
  const [currentScanId,  setCurrentScanId]  = useState(null);
  const [evasions,       setEvasions]       = useState(null);
  const [evasionLoading, setEvasionLoading] = useState(false);
  const [swapped,        setSwapped]        = useState({});
  const [allShownWords,  setAllShownWords]  = useState([]); 
  const [safeDisclaimer, setSafeDisclaimer] = useState(false);
  const [dismissedDisclaimer, setDismissedDisclaimer] = useState(false);
  const [showMoreInfo,   setShowMoreInfo]   = useState(false);

  const editorRef  = useRef(null);
  const composing  = useRef(false);
  const tooltipRef = useRef(null);

  // 🌟 Trigger load when user selects an item from History
  useEffect(() => {
    if (loadedEmail) {
      setCurrentScanId(loadedEmail.id); 
      setResult(null);
      setLimeMap(null);
      setDirty(false);
      setError("");
      setEvasions(null);
      setSwapped({});
      setAllShownWords([]);
      setSafeDisclaimer(false);
      setDismissedDisclaimer(false);
      setShowMoreInfo(false);
      setEmailText(loadedEmail.text);
      if (editorRef.current) {
        editorRef.current.innerHTML = buildHTML(loadedEmail.text, null);
      }
      analyze(loadedEmail.text, loadedEmail.id);
      clearLoadedEmail();
    }
  }, [loadedEmail]);

  // ── handle typing ──────────────────────────────────────────────────────
  const handleInput = useCallback(() => {
    if (composing.current) return;
    const el = editorRef.current;
    if (!el) return;
    const plain = getPlainText(el);
    setEmailText(plain);
    if (result) setDirty(true);
    const sel = window.getSelection();
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    const offset = range ? getCaretOffset(el, range) : 0;
    el.innerHTML = buildHTML(plain, limeMap);
    restoreCaretOffset(el, offset);
  }, [limeMap, result]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const span = e.target.closest(".tok");
    if (!span) { setTooltip(null); return; }
    const scoreStr = span.dataset.score;
    const word     = span.dataset.word;
    if (!word) { setTooltip(null); return; }
    const edRect   = editorRef.current.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    setTooltip({
      x: spanRect.left - edRect.left + spanRect.width / 2,
      y: spanRect.top  - edRect.top  - 12,
      word,
      score: scoreStr !== "" ? parseFloat(scoreStr) : null,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const loadExample = useCallback((text) => {
    setCurrentScanId(null);
    setResult(null);
    setLimeMap(null);
    setDirty(false);
    setError("");
    setEvasions(null);
    setSwapped({});
    setAllShownWords([]);
    setSafeDisclaimer(false);
    setDismissedDisclaimer(false);
    setShowMoreInfo(false);
    setEmailText(text);
    const el = editorRef.current;
    if (el) {
      el.innerHTML = buildHTML(text, null);
    }
  }, []);

  // ── API call ───────────────────────────────────────────────────────────
  const analyze = useCallback(async (overrideText, overrideId) => {
    const body = (overrideText ?? emailText).trim();
    if (!body) return;
    setLoading(true);
    setError("");
    setDirty(false);

    const scanIdToUse = overrideId || currentScanId || Date.now();
    if (!currentScanId && !overrideId) setCurrentScanId(scanIdToUse);

    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: body }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Server error");
      }
      const data = await res.json();
      setResult(data);
      
      if(onScanComplete) onScanComplete(data, body, scanIdToUse);
      
      const map = {};
      for (const { word, score } of data.lime_words) {
        map[word.toLowerCase()] = score;
      }
      setLimeMap(map);
      const displayText = data.cleaned_text || body;
      setEmailText(displayText);
      const el = editorRef.current;
      if (el) el.innerHTML = buildHTML(displayText, map);

      if (data.prediction === 1) {
        fetchEvasions(data, displayText, [], false);
        setSafeDisclaimer(false);
        setDismissedDisclaimer(false);
      } else {
        if (result && result.prediction === 1) {
          setSafeDisclaimer(true);
        } else {
          setEvasions(null);
          setSwapped({});
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [emailText, onScanComplete, result, currentScanId]);

  const reset = useCallback(() => {
    setCurrentScanId(null);
    setResult(null);
    setLimeMap(null);
    setEmailText("");
    setTooltip(null);
    setDirty(false);
    setError("");
    setEvasions(null);
    setSwapped({});
    setAllShownWords([]);
    setSafeDisclaimer(false);
    setDismissedDisclaimer(false);
    setShowMoreInfo(false);
    if (editorRef.current) editorRef.current.innerHTML = "";
  }, []);

  const fetchEvasions = useCallback(async (currentResult, currentEmailText, skipWords, append) => {
    if (!currentResult) return;
    setEvasionLoading(true);
    if (!append) {
      setEvasions(null);
      setSwapped({});
      setAllShownWords([]);
    }
    try {
      const skip = skipWords || [];
      const res = await fetch(`${API}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_text: currentEmailText,
          lime_words: currentResult.lime_words,
          skip_words: skip,
        }),
      });
      if (!res.ok) throw new Error("Suggest endpoint error");
      const data = await res.json();
      if (append) {
        setEvasions(prev => [...(prev || []), ...data]);
      } else {
        setEvasions(data);
      }
      const newWords = data.map(d => d.original);
      setAllShownWords(prev => [...prev, ...newWords]);
    } catch (e) {
      if (!append) setEvasions([]);
    } finally {
      setEvasionLoading(false);
    }
  }, []);

  const loadMoreWords = useCallback(() => {
    if (!result) return;
    fetchEvasions(result, emailText, allShownWords, true);
  }, [result, emailText, allShownWords, fetchEvasions]);

  const swapWord = useCallback((original, replacement) => {
    const el = editorRef.current;
    if (!el) return;
    const pattern = new RegExp("\\b" + original + "\\b", "gi");
    const newText = emailText.replace(pattern, replacement);
    setEmailText(newText);
    setSwapped(prev => ({ ...prev, [original]: replacement }));
    setDirty(true);
    el.innerHTML = buildHTML(newText, limeMap);
  }, [emailText, limeMap]);

  const swapAll = useCallback(() => {
    if (!evasions || evasions.length === 0) return;
    const el = editorRef.current;
    let text = emailText;
    const newSwapped = { ...swapped };
    for (const entry of evasions) {
      if (swapped[entry.original]) continue;
      if (!entry.suggestions || entry.suggestions.length === 0) continue;
      const best = entry.suggestions[0];
      const pattern = new RegExp("\\b" + entry.original + "\\b", "gi");
      text = text.replace(pattern, best.word);
      newSwapped[entry.original] = best.word;
    }
    setEmailText(text);
    setSwapped(newSwapped);
    setDirty(true);
    if (el) el.innerHTML = buildHTML(text, limeMap);
  }, [evasions, swapped, emailText, limeMap]);

  // Calculations
  const hasResult = !!result;
  const isPhish   = result?.prediction === 1;
  const riskPct   = result ? Math.round(result.risk_score * 100) : 0;
  const rl        = getRiskLevel(riskPct);
  const matchedKw = !hasResult ? PHISHING_KEYWORDS.filter(kw => new RegExp(`\\b${kw}\\b`, "i").test(emailText)) : [];

  const topPhish = result?.lime_words ? [...result.lime_words].filter(w => w.score > 0).sort((a,b) => b.score - a.score).slice(0, 10) : [];
  const topSafe = result?.lime_words ? [...result.lime_words].filter(w => w.score < 0).sort((a,b) => a.score - b.score).slice(0, 10) : [];

  function tooltipColor(score) {
    if (score === null) return "#94a3b8";
    if (score >  0.02)  return "#ef4444";
    if (score >  0.005) return "#f97316";
    if (score < -0.02)  return "#22c55e";
    if (score < -0.005) return "#86efac";
    return "#94a3b8";
  }

  function tooltipLabel(score) {
    if (score === null) return "Not scored";
    if (score >  0.02)  return "Strong phishing signal";
    if (score >  0.005) return "Mild phishing signal";
    if (score < -0.02)  return "Strong safe signal";
    if (score < -0.005) return "Mild safe signal";
    return "Neutral";
  }

  return (
    <div className="scanner-page">

      {showEx && (
        <ExamplesPanel
          onUse={loadExample}
          onClose={() => setShowEx(false)}
        />
      )}

      {/* ── Hero ── */}
      <div className="scanner-hero" style={{ marginBottom: hasResult ? 24 : 40 }}>
        <div className="hero-top-row">
          <div className="hero-tag">Explainable AI · Phishing Detection</div>
          <button className="examples-btn" onClick={() => setShowEx(true)}>
            <span className="examples-btn-icon">⬡</span>
            View Examples
          </button>
        </div>
        {!hasResult && (
          <>
            <h1 className="hero-title">
              Analyze any email<br />
              <span className="hero-accent">for threats.</span>
            </h1>
            <p className="hero-sub">
              Paste email text below. Suspicious words light up instantly.
            </p>
          </>
        )}
      </div>

      {/* ── EDITOR PANEL ── */}
      <div className={`input-panel ${hasResult ? "panel-analyzed" : ""}`}>
        <div className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>EMAIL CONTENT</span>
          {hasResult && dirty && <span style={{ color: '#f97316', fontWeight: 'bold' }}>⚠ Edited — Click Re-analyze</span>}
        </div>

        <div className="editor-wrap">
          <div
            ref={editorRef}
            className="live-editor"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            data-placeholder="Paste or type email text here, or click View Examples above..."
            onInput={handleInput}
            onPaste={handlePaste}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={() => { composing.current = false; handleInput(); }}
          />

          {tooltip && (
            <div
              ref={tooltipRef}
              className="word-tooltip"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                "--tip-color": tooltipColor(tooltip.score),
              }}
            >
              <div className="tip-word">"{tooltip.word}"</div>
              {tooltip.score !== null ? (
                <>
                  <div className="tip-score" style={{ color: tooltipColor(tooltip.score) }}>
                    {tooltip.score > 0 ? "+" : ""}{tooltip.score.toFixed(4)}
                  </div>
                  <div className="tip-label">{tooltipLabel(tooltip.score)}</div>
                </>
              ) : (
                <div className="tip-label" style={{ fontSize: "10px", maxWidth: "160px", lineHeight: "1.4" }}>
                  Not scored by model
                </div>
              )}
            </div>
          )}
        </div>

        {!hasResult && matchedKw.length > 0 && (
          <div className="kw-found">
            {matchedKw.map(kw => (
              <span key={kw} className="kw-tag" title={PHISHING_KEYWORDS_MAP[kw]?.message || ""}>{kw}</span>
            ))}
          </div>
        )}

        <div className="input-footer">
          <span className="char-count">{emailText.length} characters</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`scan-btn ${loading ? "loading" : ""}`}
              onClick={() => analyze()}
              disabled={loading || !emailText.trim()}
              style={{ fontSize: '16px', padding: '10px 24px' }}
            >
              {loading
                ? <><span className="spinner" />Analyzing...</>
                : <><span className="btn-icon">▶</span>{hasResult ? "Re-analyze Edits" : "Run Analysis"}</>
              }
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {/* ── VERDICT BANNER ── */}
      {hasResult && (
        <div className={`verdict-banner ${isPhish ? "verdict-phish" : "verdict-safe"}`}>
          <div className="verdict-left" style={{ alignItems: 'center' }}>
            <div className={`verdict-icon-circle ${isPhish ? "circle-phish" : "circle-safe"}`} style={{ width: '60px', height: '60px', fontSize: '32px' }}>
              {isPhish ? "!" : "✓"}
            </div>
            <div>
              <div className="verdict-label" style={{ fontSize: '28px', margin: 0 }}>
                {isPhish ? "Phishing Mail" : "Legitimate Email"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="reset-btn" onClick={reset}>← New scan</button>
          </div>
        </div>
      )}

      {/* 🌟 MORE INFORMATION ACCORDION 🌟 */}
      {hasResult && (
        <>
          <button 
            className={`more-info-toggle ${showMoreInfo ? 'open' : ''}`}
            onClick={() => setShowMoreInfo(!showMoreInfo)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>ℹ️</span> 
              More Information
            </div>
            <span className="more-info-toggle-icon">▼</span>
          </button>

          {showMoreInfo && (
            <div className="more-info-panel">
              <div className="details-grid">
                <div className="details-col">
                  <div className="details-col-title">
                    <span style={{fontSize: '16px'}}>🔴</span> Top 10 Phishing Words
                  </div>
                  {topPhish.length === 0 ? (
                    <div className="tw-row" style={{ color: 'var(--text-dim)', borderLeft: 'none' }}>No phishing signals found.</div>
                  ) : (
                    <div className="tw-list">
                      {topPhish.map((w, idx) => (
                        <div key={w.word + idx} className="tw-row tw-row-phish">
                          <span>"{w.word}"</span>
                          <span>+{w.score.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="details-col">
                  <div className="details-col-title">
                    <span style={{fontSize: '16px'}}>🟢</span> Top 10 Legitimate Words
                  </div>
                  {topSafe.length === 0 ? (
                    <div className="tw-row" style={{ color: 'var(--text-dim)', borderLeft: 'none' }}>No legitimate signals found.</div>
                  ) : (
                    <div className="tw-list">
                      {topSafe.map((w, idx) => (
                        <div key={w.word + idx} className="tw-row tw-row-safe">
                          <span>"{w.word}"</span>
                          <span>{w.score.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="methodology-box">
                <div className="details-col-title" style={{ marginBottom: '20px' }}>
                  <span style={{fontSize: '16px'}}>⚙️</span> How The Model Works
                </div>
                <div className="methodology-grid">
                  <div className="methodology-step">
                    <h4>1. TF-IDF Vectors</h4>
                    <p>The email is passed through a Vectorizer to extract structural and frequency-based features, which are then scored by the primary classification model to output the base Phishing Probability.</p>
                  </div>
                  <div className="methodology-step">
                    <h4>2. LIME Explainability</h4>
                    <p>Local Interpretable Model-Agnostic Explanations (LIME) creates thousands of perturbed variations of your email to mathematically isolate the exact contribution of every single word toward the final prediction.</p>
                  </div>
                  <div className="methodology-step">
                    <h4>3. Adversarial MLM</h4>
                    <p>When high-risk words are found, a Masked Language Model predicts contextually appropriate benign synonyms. Swapping these words executes an evasion attack, bypassing the filter without altering human meaning.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ADVERSARIAL EVASION GUIDE ── */}
      {hasResult && (isPhish || safeDisclaimer) && (
        <div className="evade-panel" style={{ position: 'static', padding: '24px' }}>

          <div className="evade-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 className="evade-panel-title" style={{ fontSize: '20px', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f97316' }}>🛡</span> Adversarial Evasion Guide
              </h2>
              <div className="evade-panel-sub" style={{ fontSize: '13px', marginTop: '4px' }}>
                Follow the AI's suggestions below to swap flagged words and reduce the % of Phishing.
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', fontSize: '16px' }}>
               <span style={{ color: '#94a3b8', marginRight: '8px' }}>% of Phishing:</span>
               <span style={{ color: rl.color, fontWeight: 'bold', fontSize: '20px' }}>{riskPct}%</span>
            </div>
          </div>

          {safeDisclaimer && !dismissedDisclaimer && (
            <div className="evade-safe-disclaimer" style={{ marginBottom: '20px' }}>
              <div className="esd-icon">✓</div>
              <div className="esd-text">
                <strong>Prediction flipped to Legitimate!</strong>
                <p>Further word changes may make the email look unstructured or unnatural. Continue only if needed for research.</p>
              </div>
              <div className="esd-actions">
                <button className="esd-continue" onClick={() => { setDismissedDisclaimer(true); fetchEvasions(result, emailText, allShownWords, false); }}>
                  Continue editing
                </button>
                <button className="esd-stop" onClick={() => { setEvasions(null); setSafeDisclaimer(false); }}>
                  Done
                </button>
              </div>
            </div>
          )}

          {safeDisclaimer && !dismissedDisclaimer ? null : (
          <>
          {evasionLoading && (
            <div className="evade-loading">
              <span className="spinner" />
              Scoring substitutions…
            </div>
          )}

          {!evasionLoading && evasions && evasions.length === 0 && (
            <div className="evade-empty">
              <span style={{ fontSize: 24 }}>◎</span>
              <p>No safe substitutions found for this specific threat pattern.</p>
            </div>
          )}

          {!evasionLoading && evasions && evasions.length > 0 && (
            <div className="evade-panel-body">

              <div className="evade-controls" style={{ marginBottom: '20px' }}>
                <div className="evade-progress-wrap">
                  <div className="evade-progress-label">
                    <span>{Object.keys(swapped).length} of {evasions.length} swapped</span>
                  </div>
                  <div className="evade-progress-track">
                    <div
                      className="evade-progress-fill"
                      style={{ width: ((Object.keys(swapped).length / evasions.length) * 100) + "%" }}
                    />
                  </div>
                </div>
                {Object.keys(swapped).length < evasions.filter(e => e.suggestions && e.suggestions.length > 0).length && (
                  <button className="swap-all-btn" onClick={swapAll} style={{ padding: '10px 16px', fontSize: '14px' }}>
                    ⚡ Swap All Words
                  </button>
                )}
              </div>

              <div className="evade-word-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {evasions.map((entry) => {
                  const isSwapped = !!swapped[entry.original];
                  const chosenWord = swapped[entry.original];
                  const chosenSug = isSwapped ? entry.suggestions.find(s => s.word === chosenWord) : null;
                  const hasSugs = entry.suggestions && entry.suggestions.length > 0;
                  const count = entry.occurrences || 1;
                  return (
                    <div key={entry.original} className={"evade-word-card" + (isSwapped ? " ewc-done" : !hasSugs ? " ewc-no-sub" : "")}>
                      <div className="ewc-header">
                        <div className="ewc-word-group">
                          <span className="ewc-word">"{entry.original}"</span>
                          <span className="ewc-score">+{entry.lime_score.toFixed(4)}</span>
                          {count > 1 && <span className="ewc-count">{count}x</span>}
                        </div>
                        {isSwapped && (
                          <button
                            className="ewc-undo"
                            onClick={() => {
                              const el = editorRef.current;
                              const pat = new RegExp("\\b" + chosenWord + "\\b", "gi");
                              const restored = emailText.replace(pat, entry.original);
                              setEmailText(restored);
                              setSwapped(prev => { const n = {...prev}; delete n[entry.original]; return n; });
                              setDirty(true);
                              if (el) el.innerHTML = buildHTML(restored, limeMap);
                            }}
                          >↩ undo</button>
                        )}
                      </div>

                      {isSwapped && chosenSug && (
                        <div className="ewc-confirm">
                          ✓ <strong>"{chosenWord}"</strong>
                          {count > 1 ? " (all " + count + " replaced)" : ""}
                        </div>
                      )}

                      {!isSwapped && !hasSugs && (
                        <div className="ewc-no-sub-msg">
                          No safe substitute found.
                        </div>
                      )}

                      {!isSwapped && hasSugs && (
                        <div className="ewc-suggestions">
                          {entry.suggestions.slice(0,3).map((s) => (
                            <button
                              key={s.word}
                              className="ewc-sug-btn"
                              onClick={() => swapWord(entry.original, s.word)}
                            >
                              <span className="ewc-sug-word">"{s.word}"</span>
                              <span className="ewc-sug-drop">
                                ⬇ to {Math.round(s.new_risk * 100)}% Phishing
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                className="evade-loadmore-btn"
                onClick={loadMoreWords}
                disabled={evasionLoading}
                style={{ marginTop: '12px' }}
              >
                {evasionLoading ? "Loading..." : "+ Load more words"}
              </button>

            </div>
          )}
          </>
          )}
        </div>
      )}

      {/* 🌟 FLOATING ACTION BAR (Appears on any edit or swap) 🌟 */}
      {hasResult && dirty && (
        <div className="floating-action-bar">
          <div className="fab-text">
            <span>⚠️</span> Un-analyzed edits detected
          </div>
          <button 
            className="fab-btn" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              analyze();
            }} 
            disabled={loading}
          >
            {loading ? "Analyzing..." : "↑ Re-Analyze Now"}
          </button>
        </div>
      )}

    </div>
  );
}
