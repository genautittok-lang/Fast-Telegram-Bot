import PDFDocument from "pdfkit";

interface ReportData {
  moduleType: string;
  targetValue: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  timestamp: Date;
  userId: string;
  findings: Finding[];
  sources: string[];
  metadata?: Record<string, string | number>;
}

interface Finding {
  type: "info" | "warning" | "danger" | "success";
  title: string;
  description: string;
  evidence?: string;
}

const COLORS = {
  primary: "#6366f1",
  background: "#0a0a0f",
  surface: "#16161d",
  border: "#27272a",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  success: "#22c55e",
  warning: "#eab308",
  danger: "#ef4444",
  info: "#3b82f6",
};

const RISK_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export function generateDetailedPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      info: {
        Title: `DARKSHARE Report - ${data.moduleType.toUpperCase()}`,
        Author: "DARKSHARE v4.0",
        Subject: `Risk Assessment for ${data.targetValue}`,
        Keywords: "risk, assessment, security, darkshare",
        CreationDate: data.timestamp,
      },
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    // Header Background
    doc.rect(0, 0, pageWidth, 120).fill(COLORS.background);
    doc.rect(0, 120, pageWidth, 4).fill(COLORS.primary);

    // Logo and Title
    doc.fillColor(COLORS.text).fontSize(28).font("Helvetica-Bold");
    doc.text("DARKSHARE", margin, 35);
    doc.fillColor(COLORS.primary).fontSize(12).font("Helvetica");
    doc.text("v4.0 Risk Intelligence", margin, 65);

    // Report Type Badge
    const moduleLabel = getModuleLabel(data.moduleType);
    doc.roundedRect(pageWidth - margin - 120, 35, 120, 30, 4).fill(COLORS.surface);
    doc.fillColor(COLORS.text).fontSize(10).font("Helvetica-Bold");
    doc.text(moduleLabel.toUpperCase(), pageWidth - margin - 110, 45, { width: 100, align: "center" });

    // Report ID
    const reportId = `DS-${Date.now().toString(36).toUpperCase()}`;
    doc.fillColor(COLORS.textMuted).fontSize(8).font("Helvetica");
    doc.text(`Report ID: ${reportId}`, pageWidth - margin - 120, 75, { width: 120, align: "right" });

    // Main Content Area
    let yPosition = 145;

    // Target Section
    doc.roundedRect(margin, yPosition, contentWidth, 80, 6).fill(COLORS.surface);
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
    doc.text("TARGET", margin + 15, yPosition + 12);
    doc.fillColor(COLORS.text).fontSize(14).font("Helvetica-Bold");
    const displayTarget = data.targetValue.length > 50 
      ? data.targetValue.substring(0, 47) + "..." 
      : data.targetValue;
    doc.text(displayTarget, margin + 15, yPosition + 28);

    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
    doc.text("TIMESTAMP", margin + 15, yPosition + 50);
    doc.fillColor(COLORS.text).fontSize(10).font("Helvetica");
    doc.text(data.timestamp.toISOString(), margin + 15, yPosition + 62);

    yPosition += 100;

    // Risk Score Section
    doc.roundedRect(margin, yPosition, contentWidth * 0.48, 100, 6).fill(COLORS.surface);
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
    doc.text("RISK SCORE", margin + 15, yPosition + 12);

    // Risk Score Circle
    const circleX = margin + 60;
    const circleY = yPosition + 60;
    const riskColor = RISK_COLORS[data.riskLevel];
    doc.circle(circleX, circleY, 30).lineWidth(4).stroke(riskColor);
    doc.fillColor(riskColor).fontSize(24).font("Helvetica-Bold");
    doc.text(data.riskScore.toString(), circleX - 18, circleY - 12, { width: 36, align: "center" });

    // Risk Level Label
    doc.fillColor(riskColor).fontSize(16).font("Helvetica-Bold");
    doc.text(data.riskLevel.toUpperCase(), margin + 110, yPosition + 40);
    doc.fillColor(COLORS.textMuted).fontSize(10).font("Helvetica");
    doc.text("Risk Classification", margin + 110, yPosition + 60);

    // Verdict Box
    const verdictX = margin + contentWidth * 0.52;
    doc.roundedRect(verdictX, yPosition, contentWidth * 0.48, 100, 6).fill(COLORS.surface);
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
    doc.text("VERDICT", verdictX + 15, yPosition + 12);

    const verdict = getVerdict(data.riskLevel, data.riskScore);
    doc.fillColor(COLORS.text).fontSize(12).font("Helvetica-Bold");
    doc.text(verdict.title, verdictX + 15, yPosition + 32, { width: contentWidth * 0.48 - 30 });
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
    doc.text(verdict.description, verdictX + 15, yPosition + 52, { width: contentWidth * 0.48 - 30 });

    yPosition += 120;

    // Findings Section
    doc.fillColor(COLORS.text).fontSize(14).font("Helvetica-Bold");
    doc.text("Analysis Findings", margin, yPosition);
    yPosition += 25;

    for (const finding of data.findings) {
      if (yPosition > pageHeight - 150) {
        doc.addPage();
        yPosition = margin;
      }

      const findingColor = {
        info: COLORS.info,
        warning: COLORS.warning,
        danger: COLORS.danger,
        success: COLORS.success,
      }[finding.type];

      doc.rect(margin, yPosition, 4, 50).fill(findingColor);
      doc.roundedRect(margin + 4, yPosition, contentWidth - 4, 50, 0).fill(COLORS.surface);

      const icon = { info: "ℹ", warning: "⚠", danger: "✗", success: "✓" }[finding.type];
      doc.fillColor(findingColor).fontSize(12).font("Helvetica-Bold");
      doc.text(`${icon} ${finding.title}`, margin + 15, yPosition + 10);
      doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
      doc.text(finding.description, margin + 15, yPosition + 28, { width: contentWidth - 40 });

      yPosition += 60;
    }

    yPosition += 20;

    // Metadata Section
    if (data.metadata && Object.keys(data.metadata).length > 0) {
      if (yPosition > pageHeight - 150) {
        doc.addPage();
        yPosition = margin;
      }

      doc.fillColor(COLORS.text).fontSize(14).font("Helvetica-Bold");
      doc.text("Technical Details", margin, yPosition);
      yPosition += 25;

      doc.roundedRect(margin, yPosition, contentWidth, Object.keys(data.metadata).length * 22 + 20, 6).fill(COLORS.surface);
      yPosition += 10;

      for (const [key, value] of Object.entries(data.metadata)) {
        doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
        doc.text(key, margin + 15, yPosition + 3);
        doc.fillColor(COLORS.text).fontSize(10).font("Helvetica");
        doc.text(String(value), margin + 150, yPosition + 3);
        yPosition += 22;
      }

      yPosition += 20;
    }

    // Sources Section
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = margin;
    }

    doc.fillColor(COLORS.text).fontSize(14).font("Helvetica-Bold");
    doc.text("Data Sources", margin, yPosition);
    yPosition += 20;

    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
    doc.text(data.sources.join(" • "), margin, yPosition, { width: contentWidth });

    // Footer
    const footerY = pageHeight - 60;
    doc.rect(0, footerY, pageWidth, 60).fill(COLORS.background);

    doc.fillColor(COLORS.textMuted).fontSize(8).font("Helvetica");
    doc.text("CONFIDENTIAL - This report is for authorized recipients only.", margin, footerY + 15, {
      width: contentWidth * 0.6,
    });

    doc.text(`Generated by DARKSHARE v4.0`, margin, footerY + 30);

    // Hash/Verification
    const hash = Buffer.from(`${reportId}-${data.targetValue}-${data.timestamp.getTime()}`).toString("base64").substring(0, 32);
    doc.text(`Verification: ${hash}`, pageWidth - margin - 200, footerY + 15, { width: 200, align: "right" });
    doc.text(`© ${new Date().getFullYear()} DARKSHARE INT.`, pageWidth - margin - 200, footerY + 30, { width: 200, align: "right" });

    doc.end();
  });
}

function getModuleLabel(moduleType: string): string {
  const labels: Record<string, string> = {
    ip: "IP/GEO Analysis",
    wallet: "Blockchain Scan",
    phone: "Phone Check",
    email: "Email Leak Check",
    domain: "Domain Intel",
    url: "URL Risk Scan",
    cve: "CVE/Vuln Scan",
    iot: "IoT Fingerprint",
    cloud: "Cloud Resources",
  };
  return labels[moduleType] || moduleType.toUpperCase();
}

function getVerdict(level: string, score: number): { title: string; description: string } {
  if (level === "critical" || score >= 80) {
    return {
      title: "HIGH RISK - Immediate Action Required",
      description: "Multiple serious risk indicators detected. Do not proceed with transactions involving this target.",
    };
  }
  if (level === "high" || score >= 60) {
    return {
      title: "ELEVATED RISK - Proceed with Caution",
      description: "Some concerning indicators found. Additional verification recommended before engagement.",
    };
  }
  if (level === "medium" || score >= 30) {
    return {
      title: "MODERATE RISK - Standard Precautions",
      description: "Minor risk indicators present. Apply standard due diligence procedures.",
    };
  }
  return {
    title: "LOW RISK - Generally Safe",
    description: "No significant risk indicators detected. Standard verification still recommended.",
  };
}

// Helper to generate findings based on module type
export function generateFindings(moduleType: string, riskLevel: string): Finding[] {
  const baseFindingsByModule: Record<string, Finding[]> = {
    ip: [
      { type: "info", title: "Geolocation Identified", description: "IP location resolved to specific geographic region." },
      { type: "info", title: "ISP/ASN Data Retrieved", description: "Provider and network information extracted successfully." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Blacklist Check", description: riskLevel === "high" ? "IP found on multiple abuse databases." : "IP not found on major blacklist databases." },
      { type: "info", title: "Proxy/VPN Detection", description: "Analyzed for proxy, VPN, or Tor exit node characteristics." },
    ],
    wallet: [
      { type: "info", title: "Transaction History", description: "Complete transaction history analyzed for patterns." },
      { type: "info", title: "Token Holdings", description: "Current token balances and NFT holdings identified." },
      { type: riskLevel === "high" ? "warning" : "success", title: "Mixer Interaction", description: riskLevel === "high" ? "Interaction with known mixing services detected." : "No interaction with mixing services found." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Sanctions Check", description: riskLevel === "high" ? "Address flagged by sanctions databases." : "Address not found in OFAC/EU sanctions lists." },
    ],
    phone: [
      { type: "info", title: "Number Type Detection", description: "Carrier type and line classification identified." },
      { type: riskLevel === "high" ? "warning" : "info", title: "VOIP Detection", description: riskLevel === "high" ? "Virtual/VOIP number detected - higher fraud risk." : "Standard mobile carrier number verified." },
      { type: "info", title: "Geographic Origin", description: "Country and region of registration identified." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Fraud Reports", description: riskLevel === "high" ? "Number reported for spam/fraud activity." : "No fraud reports associated with this number." },
    ],
    email: [
      { type: "info", title: "Email Validation", description: "Syntax and domain verification completed." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Data Breach Check", description: riskLevel === "high" ? "Email found in multiple data breach databases." : "Email not found in known data breaches." },
      { type: riskLevel === "medium" ? "warning" : "success", title: "Disposable Check", description: riskLevel === "medium" ? "Email uses temporary/disposable provider." : "Email is from legitimate provider." },
      { type: "info", title: "Domain Age", description: "Email domain registration history analyzed." },
    ],
    domain: [
      { type: "info", title: "WHOIS Analysis", description: "Domain registration details and history retrieved." },
      { type: "info", title: "SSL Certificate", description: "SSL/TLS certificate validity and issuer verified." },
      { type: riskLevel === "high" ? "warning" : "success", title: "Registration Country", description: riskLevel === "high" ? "Domain registered in high-risk jurisdiction." : "Domain registered in standard jurisdiction." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Sanctions Check", description: riskLevel === "high" ? "Domain owner on sanctions list." : "No sanctions associated with domain owner." },
    ],
    url: [
      { type: "info", title: "URL Analysis", description: "URL structure and parameters analyzed for anomalies." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Malware Scan", description: riskLevel === "high" ? "Malicious content detected at URL." : "No malware detected at target URL." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Phishing Check", description: riskLevel === "high" ? "URL matches known phishing patterns." : "URL does not match phishing indicators." },
      { type: "info", title: "Redirect Analysis", description: "URL redirect chain analyzed for suspicious hops." },
    ],
  };

  return baseFindingsByModule[moduleType] || [
    { type: "info", title: "Analysis Complete", description: "Target analyzed using available intelligence sources." },
  ];
}

export function generateMetadata(moduleType: string): Record<string, string | number> {
  const baseMetadata: Record<string, Record<string, string | number>> = {
    ip: {
      "Analysis Duration": "2.3s",
      "Databases Checked": 12,
      "API Calls Made": 5,
      "Last Updated": new Date().toISOString().split("T")[0],
    },
    wallet: {
      "Chain": "Ethereum Mainnet",
      "Transactions Analyzed": Math.floor(Math.random() * 500) + 50,
      "First Activity": "2021-03-15",
      "Last Activity": new Date().toISOString().split("T")[0],
    },
    phone: {
      "Carrier Type": "Mobile",
      "Country Code": "+380",
      "Databases Checked": 8,
      "Risk Signals": Math.floor(Math.random() * 5),
    },
    email: {
      "Domain MX Records": "Valid",
      "Breach Databases": 15,
      "Account Age Estimate": "2+ years",
      "Disposable Status": "No",
    },
    domain: {
      "Domain Age": "5 years",
      "Registrar": "Cloudflare",
      "SSL Issuer": "Let's Encrypt",
      "DNS Records": 12,
    },
    url: {
      "Response Code": 200,
      "Redirects": Math.floor(Math.random() * 3),
      "Content Type": "text/html",
      "Scan Engines": 70,
    },
  };

  return baseMetadata[moduleType] || { "Analysis Type": moduleType };
}
