import { ResumeData } from "./schema";

export function escapeLatex(text?: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash ")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function escapeLatexUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/([%#&_])/g, "\\$1");
}

export function generateLatexSource(data: ResumeData): string {
  const name = escapeLatex(data.name || "Candidate Name");
  const phone = escapeLatex(data.phone || "");
  const email = escapeLatex(data.email || "");
  const location = escapeLatex(data.location || "");
  const linkedin = escapeLatex(data.linkedin || "");
  const github = escapeLatex(data.github || "");

  // Build contact items array
  const contacts: string[] = [];
  if (phone) contacts.push(phone);
  if (email) contacts.push(`\\href{mailto:${escapeLatexUrl(data.email)}}{\\underline{${email}}}`);
  if (linkedin) {
    const displayLinkedin = data.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "");
    contacts.push(`\\href{${escapeLatexUrl(data.linkedin)}}{\\underline{linkedin.com/in/${escapeLatex(displayLinkedin)}}}`);
  }
  if (github) {
    const displayGithub = data.github.replace(/^https?:\/\/(www\.)?github\.com\//, "");
    contacts.push(`\\href{${escapeLatexUrl(data.github)}}{\\underline{github.com/${escapeLatex(displayGithub)}}}`);
  }
  if (location) contacts.push(location);

  const contactLine = contacts.join(" $|$ ");

  let latex = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small ${contactLine}
\\end{center}
`;

  // Summary
  if (data.summary && data.summary.trim()) {
    latex += `
%-----------SUMMARY-----------
\\section{Professional Summary}
\\small{${escapeLatex(data.summary.trim())}}
\\vspace{-5pt}
`;
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    latex += `
%-----------PROGRAMMING SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
`;
    data.skills.forEach((cat, idx) => {
      const catName = escapeLatex(cat.category);
      const items = (cat.items || []).map(escapeLatex).join(", ");
      latex += `     \\textbf{${catName}}{: ${items}} ${idx < data.skills.length - 1 ? "\\\\" : ""}\n`;
    });
    latex += `    }}
\\end{itemize}
`;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    latex += `
%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart
`;
    data.experience.forEach((exp) => {
      const title = escapeLatex(exp.title);
      const dates = escapeLatex(`${exp.start_date} -- ${exp.end_date}`);
      const company = escapeLatex(exp.company);
      const loc = escapeLatex(exp.location);

      latex += `  \\resumeSubheading
      {${title}}{${dates}}
      {${company}}{${loc}}
      \\resumeItemListStart
`;
      (exp.bullets || []).forEach((bullet) => {
        latex += `        \\resumeItem{${escapeLatex(bullet)}}\n`;
      });
      latex += `      \\resumeItemListEnd\n\n`;
    });
    latex += `\\resumeSubHeadingListEnd\n`;
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    latex += `
%-----------PROJECTS-----------
\\section{Projects}
\\resumeSubHeadingListStart
`;
    data.projects.forEach((proj) => {
      const projName = escapeLatex(proj.name);
      const tech = (proj.tech || []).map(escapeLatex).join(", ");
      const headingLeft = tech ? `\\textbf{${projName}} $|$ \\emph{${tech}}` : `\\textbf{${projName}}`;
      const urlText = proj.url ? `\\href{${escapeLatexUrl(proj.url)}}{\\underline{${escapeLatex(proj.url)}}}` : "";

      latex += `  \\resumeProjectHeading
      {${headingLeft}}{${urlText}}
      \\resumeItemListStart
        \\resumeItem{${escapeLatex(proj.description)}}
      \\resumeItemListEnd
`;
    });
    latex += `\\resumeSubHeadingListEnd\n`;
  }

  // Education
  if (data.education && data.education.length > 0) {
    latex += `
%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
`;
    data.education.forEach((edu) => {
      const inst = escapeLatex(edu.institution);
      const grad = escapeLatex(edu.graduation);
      const deg = escapeLatex(edu.degree);
      const loc = escapeLatex(edu.location);

      latex += `  \\resumeSubheading
      {${inst}}{${grad}}
      {${deg}}{${loc}}
`;
      if (edu.notes && edu.notes.trim()) {
        latex += `      \\resumeItemListStart
        \\resumeItem{${escapeLatex(edu.notes.trim())}}
      \\resumeItemListEnd
`;
      }
    });
    latex += `\\resumeSubHeadingListEnd\n`;
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    latex += `
%-----------CERTIFICATIONS-----------
\\section{Certifications}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
`;
    data.certifications.forEach((cert, idx) => {
      const name = escapeLatex(cert.name);
      const issuer = escapeLatex(cert.issuer);
      const year = escapeLatex(cert.year);
      latex += `     \\textbf{${name}} -- ${issuer} (${year})${idx < data.certifications.length - 1 ? " \\\\" : ""}\n`;
    });
    latex += `    }}
\\end{itemize}
`;
  }

  latex += `
\\end{document}
`;

  return latex;
}
