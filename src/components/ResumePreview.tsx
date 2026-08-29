import React, { useState } from "react";
import { ResumeData } from "@/lib/schema";
import { Mail, MapPin, Phone, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
  activeSection?: string;
}

export default function ResumePreview({ data, activeSection }: ResumePreviewProps) {
  const [zoom, setZoom] = useState<number>(85);
  const [density, setDensity] = useState<"compact" | "standard">("compact");
  const [paperFormat, setPaperFormat] = useState<"A4" | "Letter">("A4");

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 130));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(85);

  return (
    <div className="flex flex-col w-full h-full">
      {/* Zoom & Format Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12121a]/90 backdrop-blur-md border-b border-white/10 text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Zoom:</span>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-cyan-400 font-bold min-w-[35px] text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Paper Size & Fit Density Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format Selector */}
          <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setPaperFormat("A4")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                paperFormat === "A4"
                  ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="A4 Standard (Global / International)"
            >
              A4 Global
            </button>
            <button
              onClick={() => setPaperFormat("Letter")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                paperFormat === "Letter"
                  ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="US Letter Standard (US / Canada)"
            >
              US Letter
            </button>
          </div>

          {/* Density Selector */}
          <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setDensity("compact")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                density === "compact"
                  ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Strict 1-Page Layout (9.8pt)"
            >
              <i className="fa-solid fa-compress text-[10px] mr-1" />
              Strict 1-Page
            </button>
            <button
              onClick={() => setDensity("standard")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                density === "standard"
                  ? "bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Standard Layout (11pt)"
            >
              Standard
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[75, 85, 100].map((level) => (
            <button
              key={level}
              onClick={() => setZoom(level)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                zoom === level ? "bg-[#06b6d4] text-black font-bold" : "bg-white/5 hover:bg-white/10 text-slate-400"
              }`}
            >
              {level}%
            </button>
          ))}
          <button
            onClick={handleResetZoom}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-1"
            title="Fit Preview"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Scaled Preview Canvas */}
      <div className="w-full h-full overflow-auto bg-[#0a0a0f] p-4 md:p-8 flex justify-center custom-scrollbar">
        <div 
          className="transition-transform duration-200 ease-out origin-top"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div 
            id="resume-print-target"
            className="bg-white text-black shadow-2xl shrink-0 transition-all duration-300"
            style={{
              width: paperFormat === "A4" ? "210mm" : "8.5in",
              minHeight: paperFormat === "A4" ? "297mm" : "11in",
              padding: density === "compact" ? "0.32in" : "0.5in",
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              lineHeight: density === "compact" ? "1.10" : "1.25",
              fontSize: density === "compact" ? "9.2pt" : "11pt"
            }}
          >
            {/* Header */}
            <div className={`text-center p-1 rounded transition-all duration-300 ${density === 'compact' ? 'mb-1.5' : 'mb-3'} ${activeSection === 'contact' ? 'ring-2 ring-[#06b6d4] bg-cyan-50/30' : ''}`}>
              <h1 className="text-3xl font-bold uppercase mb-1" style={{ fontVariant: "small-caps" }}>{data.name}</h1>
              <div className="flex flex-wrap justify-center items-center gap-2 text-sm">
                {data.email && (
                  <a href={`mailto:${data.email}`} className="hover:underline flex items-center gap-1">
                    <Mail size={12} /> {data.email}
                  </a>
                )}
                {data.phone && (
                  <>
                    <span>|</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {data.phone}</span>
                  </>
                )}
                {data.location && (
                  <>
                    <span>|</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {data.location}</span>
                  </>
                )}
                {data.linkedin && (
                  <>
                    <span>|</span>
                    <a href={data.linkedin} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                      <i className="fa-brands fa-linkedin text-[12px]" /> {data.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                    </a>
                  </>
                )}
                {data.github && (
                  <>
                    <span>|</span>
                    <a href={data.github} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                      <i className="fa-brands fa-github text-[12px]" /> {data.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            {data.summary && (
              <div className={`p-1 rounded transition-all duration-300 ${density === 'compact' ? 'mb-1.5' : 'mb-3'} ${activeSection === 'summary' ? 'ring-2 ring-[#06b6d4] bg-cyan-50/30' : ''}`}>
                <h2 className="resume-section-header text-lg font-bold uppercase border-b border-black mb-1" style={{ fontVariant: "small-caps" }}>Professional Summary</h2>
                <p className="text-justify">{data.summary}</p>
              </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className={`p-1 rounded transition-all duration-300 ${density === 'compact' ? 'mb-1.5' : 'mb-3'} ${activeSection === 'skills' ? 'ring-2 ring-[#06b6d4] bg-cyan-50/30' : ''}`}>
                <h2 className="resume-section-header text-lg font-bold uppercase border-b border-black mb-1" style={{ fontVariant: "small-caps" }}>Skills</h2>
                <div className="flex flex-col gap-0.5">
                  {data.skills.map((skillCat, idx) => (
                    <div key={idx} className="resume-section-item break-inside-avoid flex items-baseline">
                      <span className="font-bold w-44 shrink-0 text-left">• {skillCat.category}:</span>
                      <span className="flex-1 text-left">{(skillCat.items || []).join(", ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <div className={`p-1 rounded transition-all duration-300 ${density === 'compact' ? 'mb-1.5' : 'mb-3'} ${activeSection === 'experience' ? 'ring-2 ring-[#06b6d4] bg-cyan-50/30' : ''}`}>
                <h2 className="resume-section-header text-lg font-bold uppercase border-b border-black mb-1" style={{ fontVariant: "small-caps" }}>Experience</h2>
                <div className={`flex flex-col ${density === 'compact' ? 'gap-1.5' : 'gap-2.5'}`}>
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="resume-experience-item break-inside-avoid">
                      <div className="flex justify-between items-baseline font-bold">
                        <span>{exp.title}</span>
                        <span className="font-normal">{exp.start_date} - {exp.end_date}</span>
                      </div>
                      <div className="flex justify-between items-baseline italic mb-0.5">
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      <ul className="list-disc pl-5 flex flex-col gap-0.5 text-justify">
                        {(exp.bullets || []).map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div className={`p-1 rounded transition-all duration-300 ${density === 'compact' ? 'mb-1.5' : 'mb-3'} ${activeSection === 'projects' ? 'ring-2 ring-[#06b6d4] bg-cyan-50/30' : ''}`}>
                <h2 className="resume-section-header text-lg font-bold uppercase border-b border-black mb-1" style={{ fontVariant: "small-caps" }}>Projects</h2>
                <div className={`flex flex-col ${density === 'compact' ? 'gap-1.5' : 'gap-2.5'}`}>
                  {data.projects.map((proj, idx) => (
                    <div key={idx} className="resume-project-item break-inside-avoid">
                      <div className="font-bold">
                        {proj.name}
                        {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="font-normal ml-2 hover:underline text-blue-700">[{proj.url}]</a>}
                      </div>
                      <p className="text-justify my-0.5">{proj.description}</p>
                      {proj.tech && proj.tech.length > 0 && (
                        <p><span className="font-bold italic">Technologies:</span> {(proj.tech || []).join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <div className={`p-1 rounded transition-all duration-300 ${density === 'compact' ? 'mb-1.5' : 'mb-3'} ${activeSection === 'education' ? 'ring-2 ring-[#06b6d4] bg-cyan-50/30' : ''}`}>
                <h2 className="resume-section-header text-lg font-bold uppercase border-b border-black mb-1" style={{ fontVariant: "small-caps" }}>Education</h2>
                <div className="flex flex-col gap-1.5">
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="resume-education-item break-inside-avoid">
                      <div className="flex justify-between items-baseline font-bold">
                        <span>{edu.institution}</span>
                        <span className="font-normal">{edu.graduation}</span>
                      </div>
                      <div className="flex justify-between items-baseline italic mb-0.5">
                        <span>{edu.degree}</span>
                        <span>{edu.location}</span>
                      </div>
                      {edu.notes && <p className="italic">{edu.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <div className={`p-1 rounded transition-all duration-300 ${density === 'compact' ? 'mb-1.5' : 'mb-3'} ${activeSection === 'certifications' ? 'ring-2 ring-[#06b6d4] bg-cyan-50/30' : ''}`}>
                <h2 className="resume-section-header text-lg font-bold uppercase border-b border-black mb-1" style={{ fontVariant: "small-caps" }}>Certifications</h2>
                <div className="flex flex-col gap-1">
                  {data.certifications.map((cert, idx) => (
                    <div key={idx} className="resume-section-item break-inside-avoid">
                      <span className="font-bold">{cert.name}</span> &mdash; {cert.issuer} ({cert.year})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-print-target, #resume-print-target * {
            visibility: visible;
          }
          #resume-print-target {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            box-shadow: none !important;
            padding: 0.5in !important;
            margin: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
