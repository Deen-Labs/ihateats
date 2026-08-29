import { ResumeData } from "./schema";

export const SAMPLE_TECHNICAL_RAW_TEXT =
  "I'm Alex Rivera, a Senior Multi-Cloud & DevOps Architect based in San Francisco, CA. " +
  "Over the past 5+ years, I've engineered high-availability AWS/Azure infrastructure, automated Kubernetes sandboxing gateways, and low-latency RAG AI substrates. " +
  "At CloudLabs Inc (Jan 2024 - Present), I architected multi-region AWS EKS & Docker clusters, streamlining CI/CD pipelines and cutting compute costs by 32%. " +
  "I also spearheaded Zero-Trust network infrastructure maintaining 99.99% system uptime. " +
  "Before that at Apex Systems (2022 - 2024), I engineered automated Terraform IaC modules for 40+ microservices, reducing deployment cycle times from 3 hours to 12 minutes, " +
  "and configured Prometheus & Grafana telemetry pipelines monitoring 1.2M daily RPC requests. " +
  "My key projects include ShadowPlane (Agentic CI/CD Gateway built with Python, Docker, AI Sandboxing) and a RAG Pipeline Substrate (Python, Gemini API, Qdrant, FastAPI). " +
  "I hold a B.S. in Computer Science & Engineering from California State University (2022) and hold AWS Certified Solutions Architect Professional and CKA certifications.";

export const SAMPLE_TECHNICAL_RESUME_DATA: ResumeData = {
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA",
  linkedin: "https://linkedin.com",
  github: "https://github.com",
  summary: "Dynamic Multi-Cloud Architect & DevOps Engineer with 5+ years of experience engineering high-availability AWS/Azure infrastructure, automated Kubernetes sandboxing gateways, and low-latency RAG AI substrates.",
  skills: [
    {
      category: "Cloud & Infrastructure",
      items: ["AWS (EC2, S3, VPC, EKS, RDS)", "Azure", "Terraform", "Ansible", "Docker", "Kubernetes"]
    },
    {
      category: "CI/CD & Automation",
      items: ["GitHub Actions", "Jenkins", "Helm", "ArgoCD", "Prometheus", "Grafana"]
    },
    {
      category: "Programming & AI",
      items: ["Python", "Golang", "Bash", "Next.js", "RAG Pipelines", "AI Sandboxing"]
    },
    {
      category: "Networking & Security",
      items: ["Istio Service Mesh", "VPN", "DNS", "WAF", "SSL/TLS", "Zero Trust Architecture"]
    }
  ],
  experience: [
    {
      title: "Founding DevOps Architect",
      company: "CloudLabs Inc",
      location: "San Francisco, CA",
      start_date: "Jan 2024",
      end_date: "Present",
      bullets: [
        "Architected multi-region AWS EKS & Docker clusters, streamlining CI/CD pipelines and cutting annual compute costs by 32%.",
        "Spearheaded Zero-Trust network infrastructure and live incident response operations maintaining 99.99% system uptime."
      ]
    },
    {
      title: "Senior Infrastructure Engineer",
      company: "Apex Systems",
      location: "San Francisco, CA",
      start_date: "2022",
      end_date: "2024",
      bullets: [
        "Engineered automated Terraform IaC modules for 40+ microservices, reducing deployment cycle times from 3 hours to 12 minutes.",
        "Configured Prometheus & Grafana telemetry pipelines monitoring 1.2M daily RPC requests with zero dropped spans."
      ]
    }
  ],
  projects: [
    {
      name: "ShadowPlane (Agentic CI/CD Gateway)",
      url: "https://github.com",
      tech: ["Python", "Docker", "AI Sandboxing", "CI/CD", "Next.js"],
      description: "Engineered an open-source DevOps substrate and isolated sandboxing gateway to test and validate AI-generated infrastructure code before production deployment."
    },
    {
      name: "RAG Pipeline Substrate",
      url: "https://github.com",
      tech: ["Python", "Gemini API", "Qdrant", "FastAPI", "Docker"],
      description: "Architected a zero-hallucination AI knowledge retrieval pipeline with real-time vector index validation via API integrations."
    }
  ],
  education: [
    {
      degree: "B.S. in Computer Science & Engineering",
      institution: "California State University",
      location: "San Francisco, CA",
      graduation: "2022",
      notes: "GPA: 3.8 / 4.0 · Cloud Systems Specialization"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services (AWS)",
      year: "2025"
    },
    {
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation (CNCF)",
      year: "2024"
    }
  ],
  analysis: {
    ats_score_before: 68,
    ats_score_after: 96,
    weak_phrases_upgraded: 18,
    achievements_quantified: 14,
    action_verbs_count: 24,
    key_improvements: [
      "Quantified technical impact across 100% of experience bullet points (% cost reduction, uptime SLA metrics, deployment speeds).",
      "Structured Skills into an aligned 4-column key-value matrix matching recruiter ATS parsing standards.",
      "Optimized project descriptions with high-relevance architectural keywords (Agentic Sandboxing, Service Mesh, IaC).",
      "Restructured executive summary into a high-density 2-sentence value proposition."
    ],
    missing_info: [
      "Optional: Add link to published open-source whitepapers or repository star badges to increase portfolio authority."
    ]
  }
};
