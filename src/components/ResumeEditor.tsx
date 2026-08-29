"use client";

import React, { useState } from "react";
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
      value={value}
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
}

const TextArea = ({ label, value, onChangeText, rows = 4, placeholder, section, onFocusSection }: TextAreaProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-400">{label}</label>
    <textarea
      value={value}
      placeholder={placeholder}
      onFocus={() => section && onFocusSection && onFocusSection(section)}
      onChange={(e) => onChangeText(e.target.value)}
      rows={rows}
      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-[#06b6d4] transition-all duration-200 resize-y"
    />
  </div>
);

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
      <TextArea onFocusSection={handleFocus} section="summary" label="Professional Summary" placeholder="e.g. Experienced Software Engineer specializing in scalable cloud applications, distributed systems, and modern web architecture..." value={data.summary} onChangeText={(v) => updateData({ summary: v })} rows={4} />
    </div>
  );

  const renderExperience = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Work Experience</h3>
        <button
          onClick={() => {
            const newExp: ExperienceItem = {
              title: "New Role",
              company: "Company",
              location: "City, State",
              start_date: "Month Year",
              end_date: "Present",
              bullets: ["Key achievement or responsibility..."]
            };
            updateData({ experience: [...(data.experience || []), newExp] });
          }}
          className="px-3 py-1.5 rounded-lg bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <i className="fa-solid fa-plus text-xs" />
          <span>Add Role</span>
        </button>
      </div>

      {(data.experience || []).map((exp, i) => (
        <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative group">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-sm font-bold text-[#06b6d4]">Role {i + 1}</h4>
            <button
              onClick={() => {
                const newExp = (data.experience || []).filter((_, idx) => idx !== i);
                updateData({ experience: newExp });
              }}
              className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1"
              title="Delete Role"
            >
              <i className="fa-solid fa-trash-can text-xs" />
              <span>Remove</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input onFocusSection={handleFocus} section="experience" label="Job Title" placeholder="e.g. Senior Software Engineer" value={exp.title} onChangeText={(v) => {
              const newExp = [...data.experience];
              newExp[i] = { ...exp, title: v };
              updateData({ experience: newExp });
            }} />
            <Input onFocusSection={handleFocus} section="experience" label="Company" placeholder="e.g. Tech Corp" value={exp.company} onChangeText={(v) => {
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
          <TextArea onFocusSection={handleFocus} section="experience" label="Bullets (one per line)" placeholder={"Led development of core cloud services, improving platform reliability by 35%.\nCollaborated with cross-functional engineering teams to deploy microservices architecture."} value={(exp.bullets || []).join('\n')} onChangeText={(v) => {
            const newExp = [...data.experience];
            newExp[i] = { ...exp, bullets: v.split('\n') };
            updateData({ experience: newExp });
          }} rows={4} />
        </div>
      ))}
    </div>
  );

  const renderSkillsCerts = () => (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Skills</h3>
          <button
            onClick={() => {
              const newSkill: SkillCategory = { category: "New Category", items: ["Skill 1", "Skill 2"] };
              updateData({ skills: [...(data.skills || []), newSkill] });
            }}
            className="px-3 py-1.5 rounded-lg bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Skill Category</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.skills || []).map((skill, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4">
                <Input onFocusSection={handleFocus} section="skills" label="Category" value={skill.category} onChangeText={(v) => {
                  const newSkills = [...data.skills];
                  newSkills[i] = { ...skill, category: v };
                  updateData({ skills: newSkills });
                }} />
              </div>
              <div className="md:col-span-7">
                <Input onFocusSection={handleFocus} section="skills" label="Items (comma-separated)" value={(skill.items || []).join(', ')} onChangeText={(v) => {
                  const newSkills = [...data.skills];
                  newSkills[i] = { ...skill, items: v.split(',').map(s => s.trim()) };
                  updateData({ skills: newSkills });
                }} />
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
              const newCert: CertificationItem = { name: "Certification Name", issuer: "Issuer", year: "2024" };
              updateData({ certifications: [...(data.certifications || []), newCert] });
            }}
            className="px-3 py-1.5 rounded-lg bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Certification</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.certifications || []).map((cert, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4">
                <Input onFocusSection={handleFocus} section="certifications" label="Name" placeholder="e.g. AWS Certified Solutions Architect" value={cert.name} onChangeText={(v) => {
                  const newCerts = [...data.certifications];
                  newCerts[i] = { ...cert, name: v };
                  updateData({ certifications: newCerts });
                }} />
              </div>
              <div className="md:col-span-4">
                <Input onFocusSection={handleFocus} section="certifications" label="Issuer" placeholder="e.g. Amazon Web Services" value={cert.issuer} onChangeText={(v) => {
                  const newCerts = [...data.certifications];
                  newCerts[i] = { ...cert, issuer: v };
                  updateData({ certifications: newCerts });
                }} />
              </div>
              <div className="md:col-span-3">
                <Input onFocusSection={handleFocus} section="certifications" label="Year" placeholder="e.g. 2024" value={cert.year} onChangeText={(v) => {
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
          <h3 className="text-lg font-semibold text-white">Education</h3>
          <button
            onClick={() => {
              const newEdu: EducationItem = { degree: "Degree / Diploma", institution: "University Name", location: "City, State", graduation: "2024", notes: "" };
              updateData({ education: [...(data.education || []), newEdu] });
            }}
            className="px-3 py-1.5 rounded-lg bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Education</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.education || []).map((edu, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-[#06b6d4]">Education {i + 1}</h4>
                <button
                  onClick={() => {
                    const newEdu = (data.education || []).filter((_, idx) => idx !== i);
                    updateData({ education: newEdu });
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                >
                  <i className="fa-solid fa-trash-can text-xs" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input onFocusSection={handleFocus} section="education" label="Degree" placeholder="e.g. B.S. in Computer Science" value={edu.degree} onChangeText={(v) => {
                  const newEdu = [...data.education];
                  newEdu[i] = { ...edu, degree: v };
                  updateData({ education: newEdu });
                }} />
                <Input onFocusSection={handleFocus} section="education" label="Institution" placeholder="e.g. State University" value={edu.institution} onChangeText={(v) => {
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
                <Input onFocusSection={handleFocus} section="education" label="Notes/GPA" placeholder="e.g. GPA: 3.8 / 4.0" value={edu.notes || ''} onChangeText={(v) => {
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
          <h3 className="text-lg font-semibold text-white">Projects</h3>
          <button
            onClick={() => {
              const newProj: ProjectItem = { name: "Project Name", description: "Brief description...", tech: ["React", "Node.js"], url: "" };
              updateData({ projects: [...(data.projects || []), newProj] });
            }}
            className="px-3 py-1.5 rounded-lg bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 border border-[#06b6d4]/40 text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <i className="fa-solid fa-plus text-xs" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(data.projects || []).map((proj, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-[#06b6d4]">Project {i + 1}</h4>
                <button
                  onClick={() => {
                    const newProj = (data.projects || []).filter((_, idx) => idx !== i);
                    updateData({ projects: newProj });
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-1"
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
                <Input onFocusSection={handleFocus} section="projects" label="URL" placeholder="e.g. https://google.com" value={proj.url || ''} onChangeText={(v) => {
                  const newProj = [...data.projects];
                  newProj[i] = { ...proj, url: v };
                  updateData({ projects: newProj });
                }} />
              </div>
              <Input onFocusSection={handleFocus} section="projects" label="Tech (comma-separated)" placeholder="e.g. Python, Docker, Kubernetes, Next.js" value={(proj.tech || []).join(', ')} onChangeText={(v) => {
                const newProj = [...data.projects];
                newProj[i] = { ...proj, tech: v.split(',').map(s => s.trim()) };
                updateData({ projects: newProj });
              }} />
              <TextArea onFocusSection={handleFocus} section="projects" label="Description" placeholder="e.g. Engineered an automated cloud gateway to route high-volume traffic across containerized microservices." value={proj.description} onChangeText={(v) => {
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
