/**
 * Phishing keyword list — baked into the frontend for instant highlighting.
 *
 * Sources:
 *   - Hand-crafted: well-known phishing signal words with curated messages
 *   - SHAP-derived: words from generate_keywords.py that are genuinely phishing-relevant
 *     (Enron corpus artifacts like 'ect', 'enron', 'mmbtu', 'hourahead' are excluded)
 *
 * shap_score: mean SHAP value from generate_keywords.py run on current model.
 *   - Hand-crafted words that were not in the SHAP output have shap_score: null
 *   - Once the dataset is fixed and model is retrained, re-run generate_keywords.py
 *     and update the shap_score values here.
 *
 * HOW TO UPDATE after retraining:
 *   1. Run:  python3 generate_keywords.py   (in /backend)
 *   2. Copy genuinely phishing-relevant shap_score values from keywords.json here
 *   3. Rebuild:  npm run build
 */

const KEYWORDS = {

  // ── Hand-crafted keywords ─────────────────────────────────────────────────
  "verify":        { message: "Requests to verify identity are a classic phishing tactic.",                                shap_score: null  },
  "verification":  { message: "Requests to verify identity are a classic phishing tactic.",                                shap_score: null  },
  "validate":      { message: "Requests to validate identity are a classic phishing tactic.",                              shap_score: null  },
  "validation":    { message: "Requests to validate identity are a classic phishing tactic.",                              shap_score: null  },
  "password":      { message: "Never send or request passwords through email.",                                            shap_score: null  },
  "login":         { message: "Avoid clicking login links in emails — go directly to the official site.",                  shap_score: null  },
  "signin":        { message: "Avoid clicking sign-in links in emails — go directly to the official site.",                shap_score: null  },
  "bank":          { message: "Impersonating banks is one of the most common phishing techniques.",                        shap_score: 0.00389 },
  "banking":       { message: "Impersonating banks is one of the most common phishing techniques.",                        shap_score: null  },
  "urgent":        { message: "Artificial urgency pressures users into acting without thinking.",                          shap_score: null  },
  "immediately":   { message: "Artificial urgency pressures users into acting without thinking.",                          shap_score: null  },
  "click":         { message: "Legitimate organizations rarely ask you to click unverified links.",                        shap_score: null  },
  "account":       { message: "Threats about account suspension are used to create panic.",                                shap_score: 0.00546 },
  "suspended":     { message: "Account suspension threats are used to trick users into panic actions.",                    shap_score: null  },
  "suspension":    { message: "Account suspension threats are used to trick users into panic actions.",                    shap_score: null  },
  "blocked":       { message: "Account blocked threats are used to trick users into panic actions.",                       shap_score: null  },
  "locked":        { message: "Account locked threats are used to trick users into panic actions.",                        shap_score: null  },
  "winner":        { message: "Prize and lottery announcements are almost always scams.",                                  shap_score: null  },
  "winning":       { message: "Prize and lottery announcements are almost always scams.",                                  shap_score: null  },
  "prize":         { message: "Lottery/prize claims are common phishing tactics.",                                         shap_score: null  },
  "prizes":        { message: "Lottery/prize claims are common phishing tactics.",                                         shap_score: null  },
  "free":          { message: "Unsolicited free offers are a red flag for phishing.",                                      shap_score: 0.00783 },
  "confirm":       { message: "Requests to confirm personal details are a phishing red flag.",                             shap_score: null  },
  "confirmation":  { message: "Requests to confirm personal details are a phishing red flag.",                             shap_score: null  },
  "update":        { message: "Forced update requests via email are suspicious.",                                          shap_score: null  },
  "upgrade":       { message: "Forced upgrade requests via email are suspicious.",                                         shap_score: null  },
  "security":      { message: "Fake security alerts are used to scare users into acting fast.",                            shap_score: null  },
  "secure":        { message: "Fake security warnings are used to scare users into acting fast.",                          shap_score: null  },
  "httplink":      { message: "Email contains an insecure HTTP link (no SSL) — legitimate emails use HTTPS.",              shap_score: 0.0   },
  "credit":        { message: "Legitimate services never ask for credit card details via email.",                          shap_score: null  },
  "payment":       { message: "Unexpected payment requests should always be verified through official channels.",          shap_score: null  },
  "payments":      { message: "Unexpected payment requests should always be verified through official channels.",          shap_score: null  },
  "invoice":       { message: "Fake invoices are commonly used to trick users into opening attachments.",                  shap_score: null  },
  "expire":        { message: "Expiry warnings are used to create urgency and pressure quick action.",                     shap_score: null  },
  "expiry":        { message: "Expiry warnings are used to create urgency and pressure quick action.",                     shap_score: null  },
  "expired":       { message: "Expiry warnings are used to create urgency and pressure quick action.",                     shap_score: null  },
  "expiration":    { message: "Expiry warnings are used to create urgency and pressure quick action.",                     shap_score: null  },
  "authorize":     { message: "Requests to authorize actions via email links are suspicious.",                             shap_score: null  },
  "authorization": { message: "Requests to authorize actions via email links are suspicious.",                             shap_score: null  },
  "access":        { message: "Fake account recovery emails are used to steal credentials.",                               shap_score: null  },
  "restore":       { message: "Fake account recovery emails are used to steal credentials.",                               shap_score: null  },
  "recovery":      { message: "Fake account recovery emails are used to steal credentials.",                               shap_score: null  },
  "claim":         { message: "Claim requests are commonly used in prize scam phishing emails.",                           shap_score: null  },
  "claims":        { message: "Claim requests are commonly used in prize scam phishing emails.",                           shap_score: null  },
  "reward":        { message: "Fake reward offers are a common phishing lure.",                                            shap_score: null  },
  "rewards":       { message: "Fake reward offers are a common phishing lure.",                                            shap_score: null  },
  "transfer":      { message: "Wire transfer requests via email are a major fraud red flag.",                              shap_score: null  },
  "wire":          { message: "Wire transfer requests via email are a major fraud red flag.",                              shap_score: null  },
  "alert":         { message: "Fake security alerts are designed to cause panic and rushed decisions.",                    shap_score: null  },
  "alerts":        { message: "Fake security alerts are designed to cause panic and rushed decisions.",                    shap_score: null  },
  "ssn":           { message: "No legitimate organization requests your Social Security Number via email.",                shap_score: null  },
  "limited":       { message: "'Limited time' language is a pressure tactic used in phishing.",                            shap_score: null  },
  "notify":        { message: "Unsolicited notifications asking for action should be treated with caution.",               shap_score: null  },
  "notification":  { message: "Unsolicited notifications asking for action should be treated with caution.",               shap_score: null  },
  "protect":       { message: "Fake protection warnings trick users into clicking malicious links.",                       shap_score: null  },
  "protection":    { message: "Fake protection warnings trick users into clicking malicious links.",                       shap_score: null  },
  "dear":          { message: "Generic greetings like 'Dear Customer' suggest mass phishing campaigns.",                   shap_score: null  },
  "kindly":        { message: "'Kindly' is a common phrasing pattern in phishing emails.",                                 shap_score: null  },

  // ── SHAP-derived keywords (Enron artifacts excluded) ──────────────────────
  // Excluded: ect, enron, mmbtu, hourahead, vince, hou, kaminski, perl, sally,
  //           linguistics, linguistic, language, languages, university, syntax,
  //           papers, references, blackberry, spreadsheet, schedules, april,
  //           july, march, california, revised, word, think, like, best, thanks,
  //           thank, low, work, edu, life
  "site":          { message: "Links to external sites are a common phishing vector — verify before clicking.",            shap_score: 0.00756 },
  "website":       { message: "Links to external websites are a common phishing vector — verify before clicking.",         shap_score: 0.00316 },
  "receive":       { message: "Emails prompting you to receive funds or prizes are often scams.",                          shap_score: 0.00608 },
  "business":      { message: "Fake business proposals are a common phishing and fraud tactic.",                           shap_score: 0.00446 },
  "investment":    { message: "Unsolicited investment offers via email are almost always fraudulent.",                     shap_score: 0.00338 },
  "remove":        { message: "Requests to remove or unsubscribe via a link can lead to phishing sites.",                  shap_score: 0.00335 },
  "attached":      { message: "Unexpected attachments are a primary malware and phishing delivery method.",                shap_score: 0.00364 },
  "risk":          { message: "Fake risk warnings are used to create fear and prompt hasty action.",                       shap_score: 0.00301 },
  "health":        { message: "Unsolicited health offers or warnings via email are a common scam vector.",                 shap_score: 0.00313 },
  "dose":          { message: "Unsolicited medication or health product emails are a common phishing tactic.",             shap_score: 0.00301 },
  "company":       { message: "Impersonating companies is a core phishing technique.",                                     shap_score: 0.00329 },
  "schedule":      { message: "Fake scheduling requests can be used to harvest credentials.",                              shap_score: 0.00324 },

};

// ── Derived exports used by Scanner.jsx ──────────────────────────────────────

/** Array of keyword strings — used for live yellow highlighting in the editor. */
export const PHISHING_KEYWORDS = [...new Set(Object.keys(KEYWORDS))];

/** Full keyword map — used for recommendation messages and shap scores. */
export const PHISHING_KEYWORDS_MAP = KEYWORDS;
