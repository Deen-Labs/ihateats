"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeData, ExperienceItem, SkillCategory, CertificationItem, EducationItem, ProjectItem } from "@/lib/schema";

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onFocusSection?: (section: string) => void;
}

const TABS = ["Contact & Info", "Experience", "Skills & Certs", "Projects & Education"];

interface InputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  type?: string;
  placeholder?: string;
  section?: string;
  onFocusSection?: (section: string) => void;
}

const Input = ({ label, value, onChangeText, type = "text", placeholder, section, onFocusSection }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-400">{label}</label>
    <input
      type={type}
      value={value || ""}
      placeholder={placeholder}
      onFocus={() => section && onFocusSection && onFocusSection(section)}
      onChange={(e) => onChangeText(e.target.value)}
      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-[#06b6d4] transition-all duration-200"
    />
  </div>
);

interface TextAreaProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  rows?: number;
  placeholder?: string;
  section?: string;
  onFocusSection?: (section: string) => void;
  helperText?: string;
}

const TextArea = ({ label, value, onChangeText, rows = 4, placeholder, section, onFocusSection, helperText }: TextAreaProps) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-slate-400">{label}</label>
      {helperText && <span className="text-[11px] text-slate-500">{helperText}</span>}
    </div>
    <textarea
      value={value || ""}
      placeholder={placeholder}
      onFocus={() => section && onFocusSection && onFocusSection(section)}
      onChange={(e) => onChangeText(e.target.value)}
      rows={rows}
      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-[#06b6d4] transition-all duration-200 resize-y"
    />
  </div>
);

/**
 * Custom Input for comma-separated items (e.g. Skills / Tech stack)
 * Maintains local string state so editing from the middle or typing spaces/commas never jumps cursor!
 */
function CommaSeparatedInput({
  label,
  items,
  onChangeItems,
  placeholder,
  section,
  onFocusSection,
}: {
  label: string;
  items: string[];
  onChangeItems: (items: string[]) => void;
  placeholder?: string;
  section?: string;
  onFocusSection?: (section: string) => void;
}) {
  const initialString = (items || []).join(", ");
  const [text, setText] = useState(initialString);

  // Sync if external items array changes completely (e.g. sample load or AI regenerate)
  useEffect(() => {
    const currentJoined = (items || []).join(", ");
    if (currentJoined !== text.split(",").map(s => s.trim()).filter(Boolean).join(", ")) {
      setText(currentJoined);
    }
  }, [items]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    // Parse into items array cleanly
    const parsed = val.split(",").map((s) => s.trim()).filter(Boolean);
    onChangeItems(parsed);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-400">{label}</label>
      <input
        type="text"
        value={text}
        placeholder={placeholder}
        onFocus={() => section && onFocusSection && onFocusSection(section)}
        onChange={handleChange}
        className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-[#06b6d4] transition-all duration-200"
      />
    </div>
  );
}

export default function ResumeEditor({ data, onChange, onFocusSection }: ResumeEditorProps) {
  const [activeTab, setActiveTab] = useState(0);

  const updateData = (updates: Partial<ResumeData>) => {
    onChange({ ...data, ...updates });
  };

  const handleFocus = (section: string) => {
    if (onFocusSection) onFocusSection(section);
  };

  const renderContactInfo = () => (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input onFocusSection={handleFocus} section="contact" label="Full Name" placeholder="e.g. John Doe" value={data.name} onChangeText={(v) => updateData({ name: v })} />
        <Input onFocusSection={handleFocus} section="contact" label="Email" type="email" placeholder="e.g. john.doe@example.com" value={data.email} onChangeText={(v) => updateData({ email: v })} />
        <Input onFocusSection={handleFocus} section="contact" label="Phone" placeholder="e.g. +1 (555) 019-2834" value={data.phone} onChangeText={(v) => updateData({ phone: v })} />
        <Input onFocusSection={handleFocus} section="contact" label="Location" placeholder="e.g. San Francisco, CA" value={data.location} onChangeText={(v) => updateData({ location: v })} />
        <Input onFocusSection={handleFocus} section="contact" label="LinkedIn URL" placeholder="e.g. https://linkedin.com" value={data.linkedin} onChangeText={(v) => updateData({ linkedin: v })} />
        <Input onFocusSection={handleFocus} section="contact" label="GitHub URL" placeholder="e.g. https://github.com" value={data.github} onChangeText={(v) => updateData({ github: v })} />
      </div>
      <TextArea
        onFocusSection={handleFocus}
        section="summary"
        label="Professional Summary"
        placeholder="e.g. Senior Cloud & DevOps Architect with 8+ years of experience engineering high-availability infrastructure..."
        value={data.summary}
        onChangeText={(v) => updateData({ summary: v })}
        rows={4}
        helperText={`${(data.summary || "").length} characters · ~${(data.summary || "").split(/\s+/).filter(Boolean).length} words`}
      />
    </div>
  );

  const renderExperience = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Work Experience</h3>
          <p className="text-xs text-slate-400">Edit titles, dates, and individual achievement bullet points seamlessly.</p>
        </div>
        <button
          onClick={() => {
            const newExp: ExperienceItem = {
              title: "New Role",
              company: "Company Name",
              location: "City, State",
              start_date: "Month Year",
              end_date: "Present",
              bullets: ["Engineered scalable cloud architecture improving system uptime by 35%."],
            };
            updateData({ experience: [...(data.experience || []), newExp] });
          }}
          className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-[#7c3aed]/20 hover:from-[#06b6d4]/30 hover:to-[#7c3aed]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Add Work Role</span>
        </button>
      </div>

      {(data.experience || []).map((exp, i) => (
        <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative group">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#06b6d4]">Role #{i + 1}</h4>
              {exp.company && <span className="text-xs text-slate-400 font-medium">— {exp.company}</span>}
            </div>
            <button
              onClick={() => {
                const newExp = (data.experience || []).filter((_, idx) => idx !== i);
                updateData({ experience: newExp });
              }}
              className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-semibold"
              title="Delete Role"
            >
              <i className="fa-solid fa-trash-can text-xs" />
              <span>Remove Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input onFocusSection={handleFocus} section="experience" label="Job Title" placeholder="e.g. Senior DevOps Architect" value={exp.title} onChangeText={(v) => {
              const newExp = [...data.experience];
              newExp[i] = { ...exp, title: v };
              updateData({ experience: newExp });
            }} />
            <Input onFocusSection={handleFocus} section="experience" label="Company Name" placeholder="e.g. Tech Corp" value={exp.company} onChangeText={(v) => {
              const newExp = [...data.experience];
              newExp[i] = { ...exp, company: v };
              updateData({ experience: newExp });
            }} />
            <Input onFocusSection={handleFocus} section="experience" label="Location" placeholder="e.g. San Francisco, CA" value={exp.location} onChangeText={(v) => {
              const newExp = [...data.experience];
              newExp[i] = { ...exp, location: v };
              updateData({ experience: newExp });
            }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input onFocusSection={handleFocus} section="experience" label="Start Date" placeholder="e.g. Jan 2022" value={exp.start_date} onChangeText={(v) => {
              const newExp = [...data.experience];
              newExp[i] = { ...exp, start_date: v };
              updateData({ experience: newExp });
            }} />
            <Input onFocusSection={handleFocus} section="experience" label="End Date" placeholder="e.g. Present" value={exp.end_date} onChangeText={(v) => {
              const newExp = [...data.experience];
              newExp[i] = { ...exp, end_date: v };
              updateData({ experience: newExp });
            }} />
          </div>

          {/* Bullet Points Section with individual inputs so middle editing never jumps cursor */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Key Accomplishments & Bullet Points ({exp.bullets?.length || 0})
              </label>
              <button
                onClick={() => {
                  const newBullets = [...(exp.bullets || []), "New achievement bullet point..."];
                  const newExp = [...data.experience];
                  newExp[i] = { ...exp, bullets: newBullets };
                  updateData({ experience: newExp });
                }}
                className="text-[11px] font-bold text-[#06b6d4] hover:text-[#38bdf8] flex items-center gap-1"
              >
                <i className="fa-solid fa-plus text-[10px]" />
                <span>Add Bullet</span>
              </button>
            </div>

            {(exp.bullets || []).map((bullet, bIdx) => (
              <div key={bIdx} className="flex items-center gap-2">
                <span className="text-slate-500 text-xs font-bold w-4 text-right select-none">{bIdx + 1}.</span>
                <input
                  type="text"
                  value={bullet}
                  placeholder={`Bullet #${bIdx + 1} (e.g. Spearheaded microservices migration...)`}
                  onFocus={() => handleFocus("experience")}
                  onChange={(e) => {
                    const newBullets = [...(exp.bullets || [])];
                    newBullets[bIdx] = e.target.value;
                    const newExp = [...data.experience];
                    newExp[i] = { ...exp, bullets: newBullets };
                    updateData({ experience: newExp });
                  }}
                  className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-[#06b6d4] transition-all"
                />
                <button
                  onClick={() => {
                    const newBullets = (exp.bullets || []).filter((_, idx) => idx !== bIdx);
                    const newExp = [...data.experience];
                    newExp[i] = { ...exp, bullets: newBullets };
                    updateData({ experience: newExp });
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 transition-colors"
                  title="Remove Bullet"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkillsCerts = () => (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Technical Skills</h3>
            <p className="text-xs text-slate-400">Categorize your skills into logical groups (e.g. Cloud & DevOps, Programming, Databases).</p>
          </div>
          <button
            onClick={() => {
              const newSkill: SkillCategory = { category: "Cloud & Infrastructure", items: ["AWS", "Docker", "Kubernetes"] };
              updateData({ skills: [...(data.skills || []), newSkill] });
            }}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-[#7c3aed]/20 hover:from-[#06b6d4]/30 hover:to-[#7c3aed]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.skills || []).map((skill, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4">
                <Input onFocusSection={handleFocus} section="skills" label="Category Name" value={skill.category} onChangeText={(v) => {
                  const newSkills = [...data.skills];
                  newSkills[i] = { ...skill, category: v };
                  updateData({ skills: newSkills });
                }} />
              </div>
              <div className="md:col-span-7">
                <CommaSeparatedInput
                  label="Skills (comma-separated)"
                  placeholder="e.g. Python, Go, Docker, Kubernetes, Terraform"
                  items={skill.items || []}
                  section="skills"
                  onFocusSection={handleFocus}
                  onChangeItems={(newItems) => {
                    const newSkills = [...data.skills];
                    newSkills[i] = { ...skill, items: newItems };
                    updateData({ skills: newSkills });
                  }}
                />
              </div>
              <div className="md:col-span-1 flex justify-end pt-5">
                <button
                  onClick={() => {
                    const newSkills = (data.skills || []).filter((_, idx) => idx !== i);
                    updateData({ skills: newSkills });
                  }}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded hover:bg-rose-500/10 transition-colors"
                  title="Delete Category"
                >
                  <i className="fa-solid fa-trash-can text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-white/5" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Certifications</h3>
          <button
            onClick={() => {
              const newCert: CertificationItem = { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2024" };
              updateData({ certifications: [...(data.certifications || []), newCert] });
            }}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-[#7c3aed]/20 hover:from-[#06b6d4]/30 hover:to-[#7c3aed]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Certification</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.certifications || []).map((cert, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4">
                <Input onFocusSection={handleFocus} section="certifications" label="Certification Name" placeholder="e.g. CKA: Certified Kubernetes Administrator" value={cert.name} onChangeText={(v) => {
                  const newCerts = [...data.certifications];
                  newCerts[i] = { ...cert, name: v };
                  updateData({ certifications: newCerts });
                }} />
              </div>
              <div className="md:col-span-4">
                <Input onFocusSection={handleFocus} section="certifications" label="Issuing Organization" placeholder="e.g. CNCF / Linux Foundation" value={cert.issuer} onChangeText={(v) => {
                  const newCerts = [...data.certifications];
                  newCerts[i] = { ...cert, issuer: v };
                  updateData({ certifications: newCerts });
                }} />
              </div>
              <div className="md:col-span-3">
                <Input onFocusSection={handleFocus} section="certifications" label="Year Received" placeholder="e.g. 2024" value={cert.year} onChangeText={(v) => {
                  const newCerts = [...data.certifications];
                  newCerts[i] = { ...cert, year: v };
                  updateData({ certifications: newCerts });
                }} />
              </div>
              <div className="md:col-span-1 flex justify-end pt-5">
                <button
                  onClick={() => {
                    const newCerts = (data.certifications || []).filter((_, idx) => idx !== i);
                    updateData({ certifications: newCerts });
                  }}
                  className="text-slate-500 hover:text-rose-400 p-2 rounded hover:bg-rose-500/10 transition-colors"
                  title="Delete Certification"
                >
                  <i className="fa-solid fa-trash-can text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProjectsEdu = () => (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Education & Degrees</h3>
          <button
            onClick={() => {
              const newEdu: EducationItem = { degree: "Bachelor of Science in Computer Science", institution: "University Name", location: "City, State", graduation: "2022", notes: "GPA: 3.8 / 4.0" };
              updateData({ education: [...(data.education || []), newEdu] });
            }}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-[#7c3aed]/20 hover:from-[#06b6d4]/30 hover:to-[#7c3aed]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Education</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.education || []).map((edu, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-[#06b6d4]">Education #{i + 1}</h4>
                <button
                  onClick={() => {
                    const newEdu = (data.education || []).filter((_, idx) => idx !== i);
                    updateData({ education: newEdu });
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-semibold"
                >
                  <i className="fa-solid fa-trash-can text-xs" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input onFocusSection={handleFocus} section="education" label="Degree / Program" placeholder="e.g. B.S. in Computer Science" value={edu.degree} onChangeText={(v) => {
                  const newEdu = [...data.education];
                  newEdu[i] = { ...edu, degree: v };
                  updateData({ education: newEdu });
                }} />
                <Input onFocusSection={handleFocus} section="education" label="Institution / University" placeholder="e.g. State University" value={edu.institution} onChangeText={(v) => {
                  const newEdu = [...data.education];
                  newEdu[i] = { ...edu, institution: v };
                  updateData({ education: newEdu });
                }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input onFocusSection={handleFocus} section="education" label="Location" placeholder="e.g. San Francisco, CA" value={edu.location} onChangeText={(v) => {
                  const newEdu = [...data.education];
                  newEdu[i] = { ...edu, location: v };
                  updateData({ education: newEdu });
                }} />
                <Input onFocusSection={handleFocus} section="education" label="Graduation Year" placeholder="e.g. 2022" value={edu.graduation} onChangeText={(v) => {
                  const newEdu = [...data.education];
                  newEdu[i] = { ...edu, graduation: v };
                  updateData({ education: newEdu });
                }} />
                <Input onFocusSection={handleFocus} section="education" label="Notes / Honors / GPA" placeholder="e.g. Magna Cum Laude · GPA 3.9" value={edu.notes || ""} onChangeText={(v) => {
                  const newEdu = [...data.education];
                  newEdu[i] = { ...edu, notes: v };
                  updateData({ education: newEdu });
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-white/5" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">High-Impact Projects</h3>
          <button
            onClick={() => {
              const newProj: ProjectItem = { name: "Project Name", description: "Architected real-time stream processing platform...", tech: ["Go", "Kafka", "Docker"], url: "https://github.com" };
              updateData({ projects: [...(data.projects || []), newProj] });
            }}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-[#7c3aed]/20 hover:from-[#06b6d4]/30 hover:to-[#7c3aed]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.projects || []).map((proj, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-[#06b6d4]">Project #{i + 1}</h4>
                <button
                  onClick={() => {
                    const newProj = (data.projects || []).filter((_, idx) => idx !== i);
                    updateData({ projects: newProj });
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-semibold"
                >
                  <i className="fa-solid fa-trash-can text-xs" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input onFocusSection={handleFocus} section="projects" label="Project Name" placeholder="e.g. Distributed Cloud Gateway" value={proj.name} onChangeText={(v) => {
                  const newProj = [...data.projects];
                  newProj[i] = { ...proj, name: v };
                  updateData({ projects: newProj });
                }} />
                <Input onFocusSection={handleFocus} section="projects" label="Project / Demo URL" placeholder="e.g. https://github.com/username/project" value={proj.url || ""} onChangeText={(v) => {
                  const newProj = [...data.projects];
                  newProj[i] = { ...proj, url: v };
                  updateData({ projects: newProj });
                }} />
              </div>

              <CommaSeparatedInput
                label="Tech Stack Used (comma-separated)"
                placeholder="e.g. React, TypeScript, Node.js, Docker, AWS"
                items={proj.tech || []}
                section="projects"
                onFocusSection={handleFocus}
                onChangeItems={(newTech) => {
                  const newProj = [...data.projects];
                  newProj[i] = { ...proj, tech: newTech };
                  updateData({ projects: newProj });
                }}
              />

              <TextArea onFocusSection={handleFocus} section="projects" label="Description & Technical Details" placeholder="e.g. Engineered an automated cloud gateway to route high-volume traffic across containerized microservices." value={proj.description} onChangeText={(v) => {
                const newProj = [...data.projects];
                newProj[i] = { ...proj, description: v };
                updateData({ projects: newProj });
              }} rows={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#12121a]/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="flex flex-wrap gap-2 p-4 border-b border-white/10 bg-black/20">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(idx);
              const sections = ["contact", "experience", "skills", "projects"];
              handleFocus(sections[idx]);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === idx
                ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 0 && renderContactInfo()}
            {activeTab === 1 && renderExperience()}
            {activeTab === 2 && renderSkillsCerts()}
            {activeTab === 3 && renderProjectsEdu()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
