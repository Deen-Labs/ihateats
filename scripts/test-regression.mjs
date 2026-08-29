import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

const TEST_CASES = [
  {
    name: "1. DevOps Multi-Project Candidate (Strict 1-Page Weighting)",
    targetPages: 1,
    rawText: `Syed Aamair Shareef Ahmed
Hyderabad, Telangana, India | +91 8977238842

Founding DevOps Engineer at Deen-Labs.tech (Jan 2024 - Present)
- Directed end-to-end cloud architecture, software development, and IT infrastructure.
- Architected highly available AWS infrastructure and Docker clusters.

Multimedia Designer & IT Executive at Zubair Graphics (2022 - 2024)
- Directed multimedia design and video production pipelines using Adobe Premiere Pro.

Projects:
1. ShadowPlane (Agentic CI/CD Gateway): Engineered open-source DevOps substrate for AI agents.
2. Deen AI App (RAG Pipeline Application): Built AI assistant with Gemini API.
3. ResumeLabs (AI-Powered ATS Resume Builder): Architected interactive platform with LaTeX PDF generation.
4. Custom Bare-Metal NAS Deployment: Architected home NAS server on Linux OS.
5. System-Level Network Firewall: Engineered native Android Kotlin VPN bridge.
6. Route Analysis System (Expogen 2.0): Designed and presented complex technical architecture.

Education: B.Tech in CS (AI & ML) at Shadan College (Expected 2028)`,
    assertions: (data) => {
      if (!data.name.includes("Syed Aamair")) throw new Error("Name mismatch");
      if (data.projects.length > 4) throw new Error(`Project weighting failed: Expected <=4 projects for 1-Page mode, got ${data.projects.length}`);
      if (!data.analysis?.ats_score_after || data.analysis.ats_score_after < 90) throw new Error(`ATS score after (${data.analysis?.ats_score_after}) is below 90 target`);
      console.log(`   ✓ Selected ${data.projects.length} top-weighted projects out of 6.`);
    }
  },
  {
    name: "2. Conversational Raw Text Candidate",
    targetPages: 1,
    rawText: "Hey my name is Rahul Sharma from Bangalore India (phone +91 9876543210). I've been working at Flipkart as a Senior Frontend Developer for 3 years building React and Next.js microfrontends. Before that I was a Junior Dev at Wipro for 2 years doing JavaScript.",
    assertions: (data) => {
      if (!data.name.includes("Rahul")) throw new Error("Name mismatch");
      if (data.experience.length < 2) throw new Error("Failed to extract both work roles");
      if (!data.phone.includes("+91 9876543210")) throw new Error("Phone number country code altered");
      if (!data.analysis?.ats_score_after || data.analysis.ats_score_after < 90) throw new Error(`ATS score after (${data.analysis?.ats_score_after}) is below 90 target`);
      console.log(`   ✓ Extracted ${data.experience.length} experience roles and phone number.`);
    }
  },
  {
    name: "3. Job Description Matcher (Tailored Keyword Injection)",
    targetPages: 1,
    jobDescription: "Senior Cloud Engineer requiring Terraform, Kubernetes, AWS EKS, Ansible, CI/CD, and Python.",
    rawText: "DevOps specialist with 4 years experience deploying cloud infrastructure on AWS.",
    assertions: (data) => {
      const allText = JSON.stringify(data).toLowerCase();
      const matched = ["aws", "terraform", "kubernetes"].filter(k => allText.includes(k));
      if (matched.length < 2) throw new Error("Job description keywords were not injected into resume");
      if (!data.analysis?.ats_score_after || data.analysis.ats_score_after < 90) throw new Error(`ATS score after (${data.analysis?.ats_score_after}) is below 90 target`);
      console.log(`   ✓ Matched target job keywords: ${matched.join(", ")}`);
    }
  },
  {
    name: "4. Executive Candidate (2-Page Mode Expansion)",
    targetPages: 2,
    rawText: `Executive Engineering Leader
10+ years experience leading engineering teams across AWS, Kubernetes, Microservices, and AI Infrastructure.
Projects: Project A, Project B, Project C, Project D, Project E`,
    assertions: (data) => {
      if (data.projects.length < 3) throw new Error("2-Page mode truncated projects unnecessarily");
      if (!data.analysis?.ats_score_after || data.analysis.ats_score_after < 90) throw new Error(`ATS score after (${data.analysis?.ats_score_after}) is below 90 target`);
      console.log(`   ✓ Expanded executive format with ${data.projects.length} projects.`);
    }
  }
];

async function runRegressionTests() {
  console.log("\n=======================================================");
  console.log(" 🚀 RESUMELABS AUTOMATED REGRESSION TEST SUITE ");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    console.log(`▶ Running Test: ${tc.name}`);
    const start = Date.now();

    try {
      const res = await fetch(`${BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: tc.rawText,
          jobDescription: tc.jobDescription,
          targetPages: tc.targetPages
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      tc.assertions(data);

      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`   ✅ PASSED (${elapsed}s) — ATS Score: ${data.analysis?.ats_score_after || 'N/A'}/100\n`);
      passed++;
    } catch (err) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.error(`   ❌ FAILED (${elapsed}s): ${err.message}\n`);
      failed++;
    }

    // Pacing delay between test cases to prevent free-tier RPM rate limits
    await new Promise(r => setTimeout(r, 2500));
  }

  console.log("=======================================================");
  console.log(` SUMMARY: ${passed} Passed | ${failed} Failed | Total: ${TEST_CASES.length}`);
  console.log("=======================================================\n");

  if (failed > 0) process.exit(1);
}

runRegressionTests();
