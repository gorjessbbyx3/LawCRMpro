// UTBMS (Uniform Task-Based Management System) Activity Codes
// Standard legal billing codes used across the legal industry

export const UTBMS_CODES = {
  // L100 - Legal Research & Analysis
  L110: {
    code: "L110",
    name: "Legal Research",
    description: "Research case law, statutes, regulations, and secondary sources"
  },
  L120: {
    code: "L120",
    name: "Document Preparation/Review",
    description: "Draft, review, and revise legal documents including pleadings, contracts, and correspondence"
  },
  L130: {
    code: "L130",
    name: "Factual Investigation",
    description: "Investigate facts, interview witnesses, review documents"
  },
  L140: {
    code: "L140",
    name: "Analysis/Strategy",
    description: "Analyze legal issues, develop case strategy, evaluate options"
  },

  // L200 - Discovery
  L210: {
    code: "L210",
    name: "Discovery - Document Review",
    description: "Review and analyze documents produced in discovery"
  },
  L220: {
    code: "L220",
    name: "Discovery - Depositions",
    description: "Prepare for, attend, and summarize depositions"
  },
  L230: {
    code: "L230",
    name: "Discovery - Interrogatories",
    description: "Draft and respond to interrogatories"
  },
  L240: {
    code: "L240",
    name: "Discovery - Other",
    description: "Other discovery activities including RFPs, RFAs"
  },

  // L300 - Court Proceedings
  L310: {
    code: "L310",
    name: "Court Appearances",
    description: "Attend hearings, trials, and other court proceedings"
  },
  L320: {
    code: "L320",
    name: "Trial Preparation",
    description: "Prepare for trial including witness prep, exhibit preparation"
  },
  L330: {
    code: "L330",
    name: "Motions",
    description: "Prepare, file, and argue motions"
  },

  // L400 - Negotiations & ADR
  L410: {
    code: "L410",
    name: "Negotiations",
    description: "Negotiate settlements, contracts, and agreements"
  },
  L420: {
    code: "L420",
    name: "Mediation/Arbitration",
    description: "Participate in mediation, arbitration, or other ADR"
  },

  // L500 - Client Relations
  L510: {
    code: "L510",
    name: "Client Communication",
    description: "Telephone calls, emails, meetings with client"
  },
  L520: {
    code: "L520",
    name: "Client Counseling",
    description: "Provide legal advice and counseling to client"
  },

  // L600 - Administrative
  L610: {
    code: "L610",
    name: "Administrative",
    description: "File management, billing, calendar management"
  },
  L620: {
    code: "L620",
    name: "Travel",
    description: "Travel time related to case"
  },

  // Hawaii-Specific
  HI_L621: {
    code: "HI_L621",
    name: "Inter-Island Travel",
    description: "Travel between Hawaiian islands for case-related matters"
  }
};

export type UtbmsCode = keyof typeof UTBMS_CODES;

export const UTBMS_CATEGORIES = {
  research: ["L110", "L130", "L140"],
  documents: ["L120"],
  discovery: ["L210", "L220", "L230", "L240"],
  court: ["L310", "L320", "L330"],
  negotiation: ["L410", "L420"],
  client: ["L510", "L520"],
  administrative: ["L610", "L620", "HI_L621"]
};

// Default activity templates with UTBMS codes
export const DEFAULT_ACTIVITY_TEMPLATES = [
  {
    name: "Client Phone Call",
    activityType: "client_call",
    utbmsCode: "L510",
    description: "Telephone conference with client regarding {{case_matter}}",
    defaultDuration: 15,
    defaultRate: "300.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Legal Research",
    activityType: "legal_research",
    utbmsCode: "L110",
    description: "Research {{legal_issue}}",
    defaultDuration: 60,
    defaultRate: "300.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Document Drafting",
    activityType: "document_drafting",
    utbmsCode: "L120",
    description: "Draft {{document_type}}",
    defaultDuration: 120,
    defaultRate: "300.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Court Appearance",
    activityType: "court_appearance",
    utbmsCode: "L310",
    description: "Appear in {{court_name}} for {{matter}}",
    defaultDuration: 180,
    defaultRate: "400.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Document Review",
    activityType: "document_review",
    utbmsCode: "L120",
    description: "Review {{document_type}}",
    defaultDuration: 30,
    defaultRate: "300.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Client Meeting",
    activityType: "client_meeting",
    utbmsCode: "L510",
    description: "In-person meeting with client regarding {{case_matter}}",
    defaultDuration: 60,
    defaultRate: "350.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Deposition",
    activityType: "deposition",
    utbmsCode: "L220",
    description: "Deposition of {{witness_name}}",
    defaultDuration: 240,
    defaultRate: "400.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Settlement Negotiation",
    activityType: "negotiation",
    utbmsCode: "L410",
    description: "Negotiate settlement terms with opposing counsel",
    defaultDuration: 90,
    defaultRate: "350.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Inter-Island Travel",
    activityType: "travel",
    utbmsCode: "HI_L621",
    description: "Travel from {{departure_island}} to {{arrival_island}} for {{purpose}}",
    defaultDuration: 180,
    defaultRate: "250.00",
    isBillable: true,
    isShared: true
  },
  {
    name: "Email Correspondence",
    activityType: "correspondence",
    utbmsCode: "L510",
    description: "Email correspondence with {{recipient}} regarding {{subject}}",
    defaultDuration: 6,
    defaultRate: "300.00",
    isBillable: true,
    isShared: true
  }
];

// Time rounding utilities
export const TIME_ROUNDING = {
  SIX_MINUTE: 6,  // 0.1 hour - Legal industry standard
  FIFTEEN_MINUTE: 15,
  THIRTY_MINUTE: 30
};

export function roundToIncrement(minutes: number, increment: number = TIME_ROUNDING.SIX_MINUTE): number {
  if (minutes <= 0) return 0;
  return Math.ceil(minutes / increment) * increment;
}

export function minutesToDecimalHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

export function calculateBillableAmount(minutes: number, hourlyRate: number, roundingIncrement: number = TIME_ROUNDING.SIX_MINUTE): number {
  const roundedMinutes = roundToIncrement(minutes, roundingIncrement);
  const hours = minutesToDecimalHours(roundedMinutes);
  return Math.round(hours * hourlyRate * 100) / 100;
}
