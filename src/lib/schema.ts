import { z } from "zod";

export const SkillCategorySchema = z.object({
  category: z.string().describe("Category of skills, e.g., 'Languages', 'Frameworks'."),
  items: z.array(z.string()).describe("List of skills within this category."),
});

export const ExperienceItemSchema = z.object({
  title: z.string().describe("Job title."),
  company: z.string().describe("Company or organization name."),
  location: z.string().describe("City and country/state."),
  start_date: z.string().describe("Start date, format: Mon YYYY."),
  end_date: z.string().describe("End date, format: Mon YYYY or 'Present'."),
  bullets: z.array(z.string()).describe("List of strong, quantified achievement bullet points starting with an action verb."),
});

export const EducationItemSchema = z.object({
  degree: z.string().describe("Name of the degree, e.g., 'B.Sc. Computer Science'."),
  institution: z.string().describe("University or school name."),
  location: z.string().describe("City and country/state."),
  graduation: z.string().describe("Graduation year."),
  notes: z.string().optional().default("").describe("GPA, honors, or key achievements."),
});

export const CertificationItemSchema = z.object({
  name: z.string().describe("Name of the certification."),
  issuer: z.string().describe("Issuing organization."),
  year: z.string().describe("Year of completion."),
});

export const ProjectItemSchema = z.object({
  name: z.string().describe("Project name."),
  description: z.string().describe("One-line description of the project."),
  tech: z.array(z.string()).describe("Key technologies used."),
  url: z.string().optional().default("").describe("Repository or project URL."),
});

export const AnalysisDetailsSchema = z.object({
  ats_score_before: z.number().describe("ATS score of raw input, from 0 to 100."),
  ats_score_after: z.number().describe("ATS score of revised resume, from 0 to 100."),
  weak_phrases_upgraded: z.number().describe("Count of weak phrases/verbs upgraded."),
  achievements_quantified: z.number().describe("Count of bullet points quantified with metrics."),
  action_verbs_count: z.number().describe("Count of strong action verbs introduced."),
  key_improvements: z.array(z.string()).describe("List of key improvements made by the AI (max 5 items)."),
  missing_info: z.array(z.string()).describe("Details that were missing from input which would improve ATS score."),
  job_match_score: z.number().optional().describe("Match percentage against target job description (0-100%)."),
  matched_keywords: z.array(z.string()).optional().describe("Top keywords successfully matched from target job posting."),
  missing_target_keywords: z.array(z.string()).optional().describe("High-value target job keywords candidate should consider adding."),
});

export const ResumeSchema = z.object({
  name: z.string().describe("Candidate's full name."),
  email: z.string().describe("Professional email address."),
  phone: z.string().describe("Phone number."),
  linkedin: z.string().describe("LinkedIn profile link or username."),
  github: z.string().describe("GitHub profile link or username."),
  location: z.string().describe("Current city and country/state."),
  summary: z.string().describe("2-3 sentence professional summary summarizing experience and key value."),
  skills: z.array(SkillCategorySchema).describe("Grouped list of technical/professional skills."),
  experience: z.array(ExperienceItemSchema).describe("List of work experience history."),
  education: z.array(EducationItemSchema).describe("List of academic history."),
  certifications: z.array(CertificationItemSchema).describe("List of relevant professional certifications."),
  projects: z.array(ProjectItemSchema).describe("List of representative engineering or personal projects."),
  analysis: AnalysisDetailsSchema.describe("ATS score comparison, verb statistics, and textual improvement logs."),
});

export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type CertificationItem = z.infer<typeof CertificationItemSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type AnalysisDetails = z.infer<typeof AnalysisDetailsSchema>;
export type ResumeData = z.infer<typeof ResumeSchema>;

export interface HistoryEntry {
  timestamp: string;
  name: string;
  ats_before: number;
  ats_after: number;
  raw_input: string;
  snippet: string;
  resume_data: ResumeData;
}
