export interface CourtForm {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
}

export const HAWAII_COURT_FORMS: CourtForm[] = [
  {
    id: "cir-001",
    title: "Civil Complaint Form",
    description: "Form to initiate a civil lawsuit in Circuit Court",
    url: "https://www.courts.state.hi.us/legal_references/download/1CC301.pdf",
    category: "Circuit Court - Civil",
    tags: ["civil", "complaint", "filing"]
  },
  {
    id: "cir-002",
    title: "Answer to Complaint",
    description: "Defendant's response to a civil complaint",
    url: "https://www.courts.state.hi.us/legal_references/download/1CC302.pdf",
    category: "Circuit Court - Civil",
    tags: ["civil", "answer", "response"]
  },
  {
    id: "cir-003",
    title: "Motion for Summary Judgment",
    description: "Request for judgment without trial",
    url: "https://www.courts.state.hi.us/legal_references/download/1CC303.pdf",
    category: "Circuit Court - Civil",
    tags: ["civil", "motion", "summary judgment"]
  },
  {
    id: "cir-004",
    title: "Subpoena",
    description: "Order to appear in court or produce documents",
    url: "https://www.courts.state.hi.us/legal_references/download/1CC304.pdf",
    category: "Circuit Court - Civil",
    tags: ["civil", "subpoena", "discovery"]
  },
  {
    id: "cir-005",
    title: "Request for Production of Documents",
    description: "Discovery request for document production",
    url: "https://www.courts.state.hi.us/legal_references/download/1CC305.pdf",
    category: "Circuit Court - Civil",
    tags: ["civil", "discovery", "documents"]
  },
  {
    id: "cir-006",
    title: "Interrogatories",
    description: "Written questions for discovery",
    url: "https://www.courts.state.hi.us/legal_references/download/1CC306.pdf",
    category: "Circuit Court - Civil",
    tags: ["civil", "discovery", "interrogatories"]
  },
  {
    id: "fam-001",
    title: "Petition for Divorce",
    description: "Form to file for divorce in Family Court",
    url: "https://www.courts.state.hi.us/legal_references/download/1D101.pdf",
    category: "Family Court - Divorce",
    tags: ["family", "divorce", "petition"]
  },
  {
    id: "fam-002",
    title: "Child Custody and Visitation Order",
    description: "Request for child custody determination",
    url: "https://www.courts.state.hi.us/legal_references/download/1D102.pdf",
    category: "Family Court - Divorce",
    tags: ["family", "custody", "children"]
  },
  {
    id: "fam-003",
    title: "Child Support Computation Worksheet",
    description: "Calculate child support obligations",
    url: "https://www.courts.state.hi.us/legal_references/download/1D103.pdf",
    category: "Family Court - Divorce",
    tags: ["family", "child support", "computation"]
  },
  {
    id: "fam-004",
    title: "Temporary Restraining Order (TRO)",
    description: "Request for temporary restraining order",
    url: "https://www.courts.state.hi.us/legal_references/download/1D104.pdf",
    category: "Family Court - Protection Orders",
    tags: ["family", "tro", "protection"]
  },
  {
    id: "fam-005",
    title: "Motion to Modify Child Custody",
    description: "Request to change custody arrangements",
    url: "https://www.courts.state.hi.us/legal_references/download/1D105.pdf",
    category: "Family Court - Divorce",
    tags: ["family", "custody", "modification"]
  },
  {
    id: "fam-006",
    title: "Guardianship Petition",
    description: "Request for legal guardianship of a minor",
    url: "https://www.courts.state.hi.us/legal_references/download/1D106.pdf",
    category: "Family Court - Guardianship",
    tags: ["family", "guardianship", "minor"]
  },
  {
    id: "fam-007",
    title: "Paternity Petition",
    description: "Establish legal paternity",
    url: "https://www.courts.state.hi.us/legal_references/download/1D107.pdf",
    category: "Family Court - Paternity",
    tags: ["family", "paternity", "petition"]
  },
  {
    id: "fam-008",
    title: "Adoption Petition",
    description: "File for adoption in Family Court",
    url: "https://www.courts.state.hi.us/legal_references/download/1D108.pdf",
    category: "Family Court - Adoption",
    tags: ["family", "adoption", "petition"]
  },
  {
    id: "dis-001",
    title: "Small Claims Complaint",
    description: "File a claim under $5,000 in District Court",
    url: "https://www.courts.state.hi.us/legal_references/download/1DC01.pdf",
    category: "District Court - Civil",
    tags: ["district", "small claims", "complaint"]
  },
  {
    id: "dis-002",
    title: "Landlord-Tenant Complaint",
    description: "File eviction or landlord-tenant dispute",
    url: "https://www.courts.state.hi.us/legal_references/download/1DC02.pdf",
    category: "District Court - Civil",
    tags: ["district", "landlord", "tenant", "eviction"]
  },
  {
    id: "dis-003",
    title: "Summary Possession (Eviction)",
    description: "Eviction action for non-payment or breach",
    url: "https://www.courts.state.hi.us/legal_references/download/1DC03.pdf",
    category: "District Court - Civil",
    tags: ["district", "eviction", "possession"]
  },
  {
    id: "dis-004",
    title: "Judgment for Possession",
    description: "Final judgment in eviction case",
    url: "https://www.courts.state.hi.us/legal_references/download/1DC04.pdf",
    category: "District Court - Civil",
    tags: ["district", "judgment", "eviction"]
  },
  {
    id: "dis-005",
    title: "Writ of Possession",
    description: "Order to remove tenant from property",
    url: "https://www.courts.state.hi.us/legal_references/download/1DC05.pdf",
    category: "District Court - Civil",
    tags: ["district", "writ", "eviction"]
  },
  {
    id: "trf-001",
    title: "Traffic Citation Answer",
    description: "Response to traffic citation",
    url: "https://www.courts.state.hi.us/legal_references/download/1DT01.pdf",
    category: "District Court - Traffic",
    tags: ["traffic", "citation", "answer"]
  },
  {
    id: "trf-002",
    title: "Request for Trial by Written Declaration",
    description: "Contest traffic ticket without court appearance",
    url: "https://www.courts.state.hi.us/legal_references/download/1DT02.pdf",
    category: "District Court - Traffic",
    tags: ["traffic", "trial", "written"]
  },
  {
    id: "trf-003",
    title: "Motion to Set Aside Default",
    description: "Request to vacate default judgment in traffic case",
    url: "https://www.courts.state.hi.us/legal_references/download/1DT03.pdf",
    category: "District Court - Traffic",
    tags: ["traffic", "motion", "default"]
  },
  {
    id: "crm-001",
    title: "Criminal Complaint",
    description: "Initiate criminal prosecution in District Court",
    url: "https://www.courts.state.hi.us/legal_references/download/1DCR01.pdf",
    category: "District Court - Criminal",
    tags: ["criminal", "complaint", "prosecution"]
  },
  {
    id: "crm-002",
    title: "Bail Bond Application",
    description: "Apply for release on bail",
    url: "https://www.courts.state.hi.us/legal_references/download/1DCR02.pdf",
    category: "District Court - Criminal",
    tags: ["criminal", "bail", "bond"]
  },
  {
    id: "crm-003",
    title: "Motion to Suppress Evidence",
    description: "Request to exclude evidence from trial",
    url: "https://www.courts.state.hi.us/legal_references/download/1DCR03.pdf",
    category: "District Court - Criminal",
    tags: ["criminal", "motion", "evidence"]
  },
  {
    id: "crm-004",
    title: "Plea Agreement",
    description: "Document plea bargain agreement",
    url: "https://www.courts.state.hi.us/legal_references/download/1DCR04.pdf",
    category: "District Court - Criminal",
    tags: ["criminal", "plea", "agreement"]
  }
];

export const FORM_CATEGORIES = [
  "Circuit Court - Civil",
  "Family Court - Divorce",
  "Family Court - Protection Orders",
  "Family Court - Guardianship",
  "Family Court - Paternity",
  "Family Court - Adoption",
  "District Court - Civil",
  "District Court - Traffic",
  "District Court - Criminal"
];

export function getFormsByCategory(category: string): CourtForm[] {
  return HAWAII_COURT_FORMS.filter(form => form.category === category);
}

export function searchForms(query: string): CourtForm[] {
  const lowerQuery = query.toLowerCase();
  return HAWAII_COURT_FORMS.filter(form =>
    form.title.toLowerCase().includes(lowerQuery) ||
    form.description.toLowerCase().includes(lowerQuery) ||
    form.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
