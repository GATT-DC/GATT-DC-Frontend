// Perfil completo de un miembro de la junta: se ve al tocar su tarjeta en
// The gatt Board. Solo los miembros con perfil abren esta vista.

// Logo de una organizacion o universidad, en /public. Si falta, se muestra la
// inicial del nombre en un circulo.
export type ProfileLogo = { src: string; width: number; height: number };

export type MemberProfile = {
  // Cargo dentro de GATT (p. ej. "Board Chair").
  title: string;
  // Cargo actual fuera de GATT.
  position: string;
  // `caption` va bajo el nombre (por defecto "current role").
  organization: { name: string; caption?: string; logo?: ProfileLogo };
  email?: string;
  background: string[];
  expertise: string[];
  education: { school: string; degrees: string[]; logo?: ProfileLogo }[];
  beyondTheOffice?: string;
  moreAbout?: string;
};

// Por nombre del miembro (el mismo de BoardOverlay).
export const BOARD_PROFILES: Record<string, MemberProfile> = {
  "Alexa Burr": {
    title: "Board Chair",
    position: "Senior Vice President, Strategic Growth & Membership",
    organization: { name: "NEMA" },
    background: [
      "Alexa Burr is the Senior Vice President of Strategic Growth & Membership at NEMA, where she leads membership growth, strategic partnerships, and new revenue initiatives, including the Make It American™ certification program.",
      "Previously, she held leadership roles at the American Petroleum Institute (API) and the American Chemistry Council (ACC), focusing on international trade, industry standards, regulatory policy, and sustainability. Her experience includes representing U.S. industry interests in global forums such as the United Nations, WTO, OECD, and APEC.",
    ],
    expertise: [
      "International Trade & Regulatory Policy",
      "Global Policy & Advocacy",
      "Strategic Growth & Partnerships",
      "Industry Standards & Sustainability",
    ],
    education: [
      {
        school: "Georgetown University",
        degrees: [
          "M.S. in Biological Threat Agents and Emerging Infectious Diseases",
          "B.S. in Biology of Global Health",
        ],
      },
    ],
    beyondTheOffice:
      "Outside of her professional career, Alexa volunteers as an Emergency Medical Technician (EMT) in the Washington, DC area, supporting her local community.",
    // En el mockup "More About Alexa" repite el texto de "Beyond the Office":
    // falta el texto definitivo.
    moreAbout:
      "Outside of her professional career, Alexa volunteers as an Emergency Medical Technician (EMT) in the Washington, DC area, supporting her local community.",
  },

  "Ryan Migeed": {
    title: "Director of Financial Affairs",
    position: "Associate, International Trade & Trade Remedies",
    organization: { name: "Mayer Brown" },
    background: [
      "Ryan Migeed is an Associate at Mayer Brown in Washington, DC, where he advises clients on international trade matters with a focus on antidumping and countervailing duty proceedings before the U.S. Department of Commerce and the U.S. International Trade Commission, as well as customs matters before U.S. Customs and Border Protection. He also counsels clients on tariffs under Section 232, Section 301 and IEEPA, forced labor allegations, U.S. investment and production incentives, and trade policy.",
      "Previously, Ryan was an associate in the International Trade practice at Morris, Manning & Martin, and interned at the U.S. Department of State (Office of the Legal Adviser) and the U.S. Department of Justice (Office of Foreign Litigation). Through the Dean Acheson Legal Stage Program, he served as a stagiaire in the chambers of Judge Ulf Öberg at the General Court of the Court of Justice of the European Union, working on antidumping and restrictive measures cases. He is admitted in DC and New York and before the U.S. Court of International Trade.",
    ],
    expertise: [
      "Trade Remedies (AD/CVD)",
      "Customs & Tariffs (§232 · §301 · IEEPA)",
      "Forced Labor Compliance",
      "International Law & Trade Policy",
    ],
    education: [
      {
        school: "The George Washington University Law School",
        degrees: [
          "J.D., with honors · Thurgood Marshall Scholar",
          "Symposium Editor, The George Washington International Law Review",
        ],
      },
      { school: "American University", degrees: ["B.A., magna cum laude"] },
    ],
    beyondTheOffice:
      "A published writer on international trade and international law, Ryan has contributed to Just Security and The Washington Diplomat, and has served as a Deputy Co-Chair of Foreign Policy for America’s NextGen Initiative, which supports the next generation of foreign policy leaders.",
    moreAbout:
      "His scholarship uses the tools of international law to resolve conflict — from Arctic environmental disputes and botnets to trade-based solutions for post-conflict economies — with articles in the Michigan Journal of International Law, the George Washington International Law Review and the Ocean and Coastal Law Journal.",
  },

  "Jordan Strickler": {
    title: "Director of External Relations",
    position: "Senior Manager, Global & Low Carbon Strategy",
    organization: { name: "American Petroleum Institute" },
    background: [
      "Jordan Strickler is the Senior Manager of Global & Low Carbon Strategy at the American Petroleum Institute (API), where he oversees API’s low carbon standardization portfolio and manages international relations with governments and the private sector to promote good regulatory practices, trade, and energy safety and sustainability.",
      "Prior to joining API, he worked at the American National Standards Institute (ANSI) on international policy, executing standards and trade programs with global partners.",
    ],
    expertise: [
      "Low Carbon Standardization",
      "International Standards & Trade",
      "Good Regulatory Practices",
      "Government & Stakeholder Relations",
    ],
    education: [
      {
        school: "University of Miami",
        degrees: ["M.A. in Latin American Studies", "B.A. in Latin American Studies"],
      },
      { school: "Project Management Professional (PMP)", degrees: ["Certification"] },
    ],
    // "Beyond the Office" aun no tiene texto.
    moreAbout:
      "With a background in Latin American studies and experience at both ANSI and API, Jordan brings a perspective that connects international standards, regulatory cooperation and trade across the Americas and beyond.",
  },

  "Santiago Gomez": {
    title: "Director of Event Planning",
    position: "Associate, International Trade & Tax",
    organization: { name: "Steptoe LLP" },
    background: [
      "Dr. Santiago Gomez is an associate with Steptoe LLP. He has over a decade of experience advising private and sovereign clients on a wide range of trade and tax matters, including AD/CVD proceedings, the use of Double Tax Treaties and Free Trade Agreements, and U.S. trade-related authorities (§221, §232, §301, §321, UFLPA, EAPA, among others).",
      "Previously, as Head of Congressional Affairs at the Embassy of Colombia, he actively engaged with U.S. congressional committees. At the Embassy’s Trade Office, he also provided trade and tax counsel, addressing complex legal issues across various sectors.",
    ],
    expertise: [
      "Trade Remedies & U.S. Trade Authorities",
      "International Tax & Tax Treaties",
      "Free Trade Agreements",
      "Congressional & Government Affairs",
    ],
    // Falta la universidad y los demas titulos.
    education: [
      {
        school: "Doctorate",
        degrees: [
          "Dissertation on effective tax management practices for multinational enterprises under the OECD’s Pillar One and Pillar Two frameworks",
        ],
      },
    ],
    beyondTheOffice:
      "Santiago is a Loretta Collins Argrett Fellow of the American Bar Association. He currently serves as Vice Chair of the Outreach and Inclusion Committee and as a liaison for the Tax Policy and Simplification Committee.",
    moreAbout:
      "His scholarly contributions to international taxation include a book on multinational enterprise tax planning under the OECD’s Multilateral Instrument (MLI). On the GATT DC Board, he helps guide the organization’s strategy, financial governance and academic programming, and leads partnerships with organizations such as CITBA, WIIT, NFTC and WITA.",
  },

  "Thomas Abrams": {
    title: "Senior Advisor to the Board",
    position: "Attorney, International Business & Regulatory Law",
    organization: { name: "New York Bar", caption: "admitted attorney" },
    background: [
      "Thomas Abrams is a New York attorney with professional experience in international business law, regulatory matters, and standards-setting activities, along with a strong background in fiscal compliance and managing budgets.",
      "His career has taken him abroad to work in Europe and Asia, giving him first-hand experience with cross-border business and regulatory environments.",
    ],
    expertise: [
      "International Business Law",
      "Regulatory Matters",
      "Standards-Setting",
      "Fiscal Compliance & Budget Management",
    ],
    // Educacion y "More About" aun no tienen texto.
    education: [],
    beyondTheOffice:
      "Thomas is happy to be back in Washington, DC after working abroad in Europe and Asia, and looks forward to making new friends and expanding his professional network.",
  },

  "Zachary Simmons": {
    title: "Senior Advisor to the Board",
    position: "Senior Corporate Counsel for Imports",
    organization: { name: "Northrop Grumman" },
    background: [
      "Zachary Simmons is Senior Corporate Counsel for Imports at Northrop Grumman Corporation. Previously, he served as an attorney in the Office of Chief Counsel, Trade and Finance Division, at U.S. Customs and Border Protection, where he advised agency components on trade and customs matters and was agency counsel in defensive litigation before the U.S. Court of International Trade (CIT) and the U.S. Court of Appeals for the Federal Circuit (CAFC).",
      "Before CBP, Zachary was a senior associate at Steptoe LLP, focusing on trade remedy litigation before the U.S. Department of Commerce and the U.S. International Trade Commission, related appeals before the CIT and CAFC, customs matters and trade policy. Earlier, he served as an attorney in Commerce’s Office of Chief Counsel for Trade Enforcement and Compliance — advising on AD/CVD investigations and reviews and representing the agency before the CIT, CAFC and WTO — and as an attorney fellow in the Office of General Counsel at the Office of the U.S. Trade Representative, working on trade policy, legislation and WTO dispute settlement.",
    ],
    expertise: [
      "Customs & Import Compliance",
      "Trade Remedies (AD/CVD)",
      "CIT & Federal Circuit Litigation",
      "WTO Disputes & Trade Policy",
    ],
    education: [
      {
        school: "UCLA School of Law",
        degrees: ["J.D. · Editor-in-Chief, UCLA Pacific Basin Law Journal"],
      },
      { school: "University of California, Berkeley", degrees: ["B.A."] },
    ],
    beyondTheOffice:
      "Zachary served as Chair of GATT DC from 2018 to 2025, helping grow the organization into a leading community for Washington’s international trade professionals, before becoming Senior Advisor to its Board of Directors.",
    moreAbout:
      "Having worked across USTR, the Department of Commerce, CBP, private practice and industry, Zachary brings a rare 360-degree view of U.S. trade law — from policy and negotiation to enforcement, litigation and corporate compliance.",
  },
};
