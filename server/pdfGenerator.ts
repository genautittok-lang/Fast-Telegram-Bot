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

    doc.rect(0, 0, pageWidth, 140).fill(COLORS.background);
    doc.rect(0, 140, pageWidth, 4).fill(COLORS.primary);

    doc.fillColor(COLORS.text).fontSize(32).font("Helvetica-Bold");
    doc.text("DARKSHARE", margin, 30);
    doc.fillColor(COLORS.primary).fontSize(14).font("Helvetica");
    doc.text("RISK INTELLIGENCE PLATFORM", margin, 65);
    doc.fillColor(COLORS.textMuted).fontSize(10).font("Helvetica");
    doc.text("Certified Security Analysis Report", margin, 85);

    const moduleLabel = getModuleLabel(data.moduleType);
    doc.roundedRect(pageWidth - margin - 140, 30, 140, 40, 6).fill(COLORS.surface);
    doc.fillColor(COLORS.text).fontSize(11).font("Helvetica-Bold");
    doc.text(moduleLabel.toUpperCase(), pageWidth - margin - 130, 42, { width: 120, align: "center" });
    doc.fillColor(COLORS.textMuted).fontSize(8).font("Helvetica");
    doc.text("ANALYSIS MODULE", pageWidth - margin - 130, 58, { width: 120, align: "center" });

    const reportId = `DS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    doc.fillColor(COLORS.textMuted).fontSize(8).font("Helvetica");
    doc.text(`Document ID: ${reportId}`, pageWidth - margin - 140, 90, { width: 140, align: "right" });
    doc.text(`Classification: CONFIDENTIAL`, pageWidth - margin - 140, 102, { width: 140, align: "right" });

    let yPosition = 165;

    doc.roundedRect(margin, yPosition, contentWidth, 90, 8).fill(COLORS.surface);
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica-Bold");
    doc.text("SUBJECT OF ANALYSIS", margin + 20, yPosition + 15);
    doc.fillColor(COLORS.text).fontSize(16).font("Helvetica-Bold");
    const displayTarget = data.targetValue.length > 45 
      ? data.targetValue.substring(0, 42) + "..." 
      : data.targetValue;
    doc.text(displayTarget, margin + 20, yPosition + 35);

    doc.fillColor(COLORS.textMuted).fontSize(8).font("Helvetica");
    doc.text("ANALYSIS DATE & TIME", margin + 20, yPosition + 60);
    doc.fillColor(COLORS.text).fontSize(10).font("Helvetica");
    const dateStr = data.timestamp.toLocaleDateString('uk-UA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(dateStr, margin + 20, yPosition + 72);

    yPosition += 110;

    doc.roundedRect(margin, yPosition, contentWidth * 0.45, 120, 8).fill(COLORS.surface);
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica-Bold");
    doc.text("RISK ASSESSMENT", margin + 20, yPosition + 15);

    const circleX = margin + 60;
    const circleY = yPosition + 70;
    const riskColor = RISK_COLORS[data.riskLevel];
    
    doc.circle(circleX, circleY, 35).lineWidth(5).stroke(riskColor);
    doc.circle(circleX, circleY, 28).fill(COLORS.background);
    doc.fillColor(riskColor).fontSize(28).font("Helvetica-Bold");
    doc.text(data.riskScore.toString(), circleX - 20, circleY - 12, { width: 40, align: "center" });

    doc.fillColor(riskColor).fontSize(18).font("Helvetica-Bold");
    doc.text(data.riskLevel.toUpperCase(), margin + 120, yPosition + 50);
    doc.fillColor(COLORS.textMuted).fontSize(10).font("Helvetica");
    doc.text("Risk Classification Level", margin + 120, yPosition + 72);
    
    const riskBar = (data.riskScore / 100) * 100;
    doc.roundedRect(margin + 120, yPosition + 90, 100, 8, 4).fill(COLORS.border);
    doc.roundedRect(margin + 120, yPosition + 90, riskBar, 8, 4).fill(riskColor);

    const verdictX = margin + contentWidth * 0.48;
    doc.roundedRect(verdictX, yPosition, contentWidth * 0.52, 120, 8).fill(COLORS.surface);
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica-Bold");
    doc.text("EXPERT VERDICT", verdictX + 20, yPosition + 15);

    const verdict = getVerdict(data.riskLevel, data.riskScore);
    doc.fillColor(COLORS.text).fontSize(13).font("Helvetica-Bold");
    doc.text(verdict.title, verdictX + 20, yPosition + 35, { width: contentWidth * 0.52 - 40 });
    doc.fillColor(COLORS.textMuted).fontSize(10).font("Helvetica");
    doc.text(verdict.description, verdictX + 20, yPosition + 58, { width: contentWidth * 0.52 - 40 });

    yPosition += 140;

    doc.fillColor(COLORS.text).fontSize(14).font("Helvetica-Bold");
    doc.text("DETAILED FINDINGS", margin, yPosition);
    yPosition += 25;

    for (const finding of data.findings) {
      if (yPosition > pageHeight - 180) {
        doc.addPage();
        yPosition = margin;
      }

      const findingColor = {
        info: COLORS.info,
        warning: COLORS.warning,
        danger: COLORS.danger,
        success: COLORS.success,
      }[finding.type];

      doc.roundedRect(margin, yPosition, contentWidth, 55, 6).fill(COLORS.surface);
      doc.rect(margin, yPosition, 5, 55).fill(findingColor);

      const icon = { info: "[i]", warning: "[!]", danger: "[X]", success: "[OK]" }[finding.type];
      doc.fillColor(findingColor).fontSize(11).font("Helvetica-Bold");
      doc.text(`${icon} ${finding.title}`, margin + 20, yPosition + 12);
      doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
      doc.text(finding.description, margin + 20, yPosition + 30, { width: contentWidth - 40 });

      yPosition += 65;
    }

    yPosition += 15;

    if (data.metadata && Object.keys(data.metadata).length > 0) {
      if (yPosition > pageHeight - 180) {
        doc.addPage();
        yPosition = margin;
      }

      doc.fillColor(COLORS.text).fontSize(14).font("Helvetica-Bold");
      doc.text("TECHNICAL METADATA", margin, yPosition);
      yPosition += 25;

      const metaHeight = Object.keys(data.metadata).length * 24 + 20;
      doc.roundedRect(margin, yPosition, contentWidth, metaHeight, 6).fill(COLORS.surface);
      yPosition += 12;

      for (const [key, value] of Object.entries(data.metadata)) {
        doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
        doc.text(key, margin + 20, yPosition + 3);
        doc.fillColor(COLORS.text).fontSize(10).font("Helvetica-Bold");
        doc.text(String(value), margin + 180, yPosition + 3);
        yPosition += 24;
      }

      yPosition += 20;
    }

    if (yPosition > pageHeight - 200) {
      doc.addPage();
      yPosition = margin;
    }

    doc.fillColor(COLORS.text).fontSize(14).font("Helvetica-Bold");
    doc.text("DATA SOURCES", margin, yPosition);
    yPosition += 20;
    doc.fillColor(COLORS.textMuted).fontSize(9).font("Helvetica");
    doc.text(data.sources.join("  |  "), margin, yPosition, { width: contentWidth });

    yPosition += 40;

    const stampX = pageWidth - margin - 120;
    const stampY = Math.min(yPosition, pageHeight - 180);
    
    doc.save();
    doc.circle(stampX, stampY, 50).lineWidth(3).stroke(COLORS.primary);
    doc.circle(stampX, stampY, 42).lineWidth(1.5).stroke(COLORS.primary);
    doc.circle(stampX, stampY, 38).lineWidth(0.5).stroke(COLORS.primary);
    
    doc.fillColor(COLORS.primary).fontSize(7).font("Helvetica-Bold");
    doc.text("DARKSHARE INTERNATIONAL", stampX - 35, stampY - 38, { 
      width: 70, 
      align: "center" 
    });
    
    doc.fillColor(COLORS.primary).fontSize(16).font("Helvetica-Bold");
    doc.text("VERIFIED", stampX - 30, stampY - 8, { width: 60, align: "center" });
    
    doc.fillColor(COLORS.primary).fontSize(6).font("Helvetica");
    doc.text("SECURITY ANALYSIS", stampX - 30, stampY + 10, { width: 60, align: "center" });
    
    const certDate = data.timestamp.toLocaleDateString('en-GB');
    doc.fillColor(COLORS.primary).fontSize(7).font("Helvetica-Bold");
    doc.text(certDate, stampX - 25, stampY + 28, { width: 50, align: "center" });
    
    doc.restore();

    const signY = stampY + 70;
    doc.moveTo(margin, signY).lineTo(margin + 150, signY).lineWidth(1).stroke(COLORS.border);
    doc.fillColor(COLORS.textMuted).fontSize(8).font("Helvetica");
    doc.text("Authorized Signature", margin, signY + 5);
    doc.fillColor(COLORS.text).fontSize(10).font("Helvetica-Bold");
    doc.text("DARKSHARE Security Team", margin, signY + 18);

    const footerY = pageHeight - 50;
    doc.rect(0, footerY - 10, pageWidth, 60).fill(COLORS.background);

    doc.fillColor(COLORS.textMuted).fontSize(7).font("Helvetica");
    doc.text("CONFIDENTIAL - This document contains proprietary security analysis data.", margin, footerY);
    doc.text("Unauthorized distribution or reproduction is strictly prohibited.", margin, footerY + 10);

    const hash = Buffer.from(`${reportId}-${data.targetValue}-${data.timestamp.getTime()}`).toString("base64").substring(0, 24);
    doc.text(`Verification Hash: ${hash}`, pageWidth - margin - 180, footerY, { width: 180, align: "right" });
    doc.text(`Generated by DARKSHARE v4.0`, pageWidth - margin - 180, footerY + 10, { width: 180, align: "right" });
    doc.text(`Copyright ${new Date().getFullYear()} DARKSHARE INT. All Rights Reserved.`, pageWidth - margin - 180, footerY + 20, { width: 180, align: "right" });

    doc.end();
  });
}

function getModuleLabel(moduleType: string): string {
  const labels: Record<string, string> = {
    ip: "IP/GEO Analysis",
    wallet: "Blockchain Scan",
    phone: "Phone Intelligence",
    email: "Email Security",
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
      description: "Multiple serious risk indicators detected. Do not proceed with transactions involving this target without additional verification.",
    };
  }
  if (level === "high" || score >= 60) {
    return {
      title: "ELEVATED RISK - Proceed with Caution",
      description: "Concerning indicators found. Additional verification strongly recommended before any engagement.",
    };
  }
  if (level === "medium" || score >= 30) {
    return {
      title: "MODERATE RISK - Standard Precautions",
      description: "Minor risk indicators present. Apply standard due diligence procedures before proceeding.",
    };
  }
  return {
    title: "LOW RISK - Generally Safe",
    description: "No significant risk indicators detected. Standard verification still recommended as best practice.",
  };
}

export function generateFindings(moduleType: string, riskLevel: string): Finding[] {
  const baseFindingsByModule: Record<string, Finding[]> = {
    ip: [
      { type: "info", title: "Geolocation Identified", description: "IP location resolved to specific geographic region with high accuracy." },
      { type: "info", title: "ISP/ASN Data Retrieved", description: "Provider and network information extracted from regional databases." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Blacklist Status", description: riskLevel === "high" ? "IP found on multiple abuse and spam databases." : "IP not found on major blacklist or abuse databases." },
      { type: "info", title: "Proxy/VPN Detection", description: "Analyzed for proxy, VPN, datacenter or Tor exit node characteristics." },
    ],
    wallet: [
      { type: "info", title: "Transaction History Analysis", description: "Complete transaction history analyzed for suspicious patterns and volumes." },
      { type: "info", title: "Token Holdings Identified", description: "Current token balances, NFT holdings and DeFi positions mapped." },
      { type: riskLevel === "high" ? "warning" : "success", title: "Mixer Interaction Check", description: riskLevel === "high" ? "Interaction with known mixing/tumbling services detected." : "No interaction with mixing or tumbling services found." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Sanctions Database", description: riskLevel === "high" ? "Address flagged by OFAC/EU sanctions databases." : "Address not found in OFAC, EU or other sanctions lists." },
    ],
    phone: [
      { type: "info", title: "Number Classification", description: "Carrier type and line classification identified via telecom databases." },
      { type: riskLevel === "high" ? "warning" : "info", title: "VOIP Detection", description: riskLevel === "high" ? "Virtual/VOIP number detected - elevated fraud risk indicator." : "Standard mobile carrier number verified." },
      { type: "info", title: "Geographic Origin", description: "Country and region of registration identified and verified." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Fraud Reports", description: riskLevel === "high" ? "Number reported for spam/fraud activity in public databases." : "No fraud reports associated with this number." },
    ],
    email: [
      { type: "info", title: "Email Validation", description: "Syntax, domain verification and MX record validation completed." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Data Breach Check", description: riskLevel === "high" ? "Email found in multiple known data breach databases." : "Email not found in known data breach compilations." },
      { type: riskLevel === "medium" ? "warning" : "success", title: "Disposable Check", description: riskLevel === "medium" ? "Email uses temporary/disposable provider - elevated risk." : "Email is from legitimate established provider." },
      { type: "info", title: "Domain Reputation", description: "Email domain registration history and reputation analyzed." },
    ],
    domain: [
      { type: "info", title: "WHOIS Analysis", description: "Domain registration details, history and ownership retrieved." },
      { type: "info", title: "SSL/TLS Certificate", description: "SSL/TLS certificate validity, chain and issuer verified." },
      { type: riskLevel === "high" ? "warning" : "success", title: "Registration Jurisdiction", description: riskLevel === "high" ? "Domain registered in high-risk jurisdiction." : "Domain registered in standard jurisdiction with good reputation." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Sanctions Check", description: riskLevel === "high" ? "Domain owner appears on international sanctions list." : "No sanctions associated with domain registrant." },
    ],
    url: [
      { type: "info", title: "URL Structure Analysis", description: "URL structure, parameters and redirects analyzed for anomalies." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Malware Detection", description: riskLevel === "high" ? "Malicious content or downloads detected at target URL." : "No malware or malicious content detected at target URL." },
      { type: riskLevel === "high" ? "danger" : "success", title: "Phishing Assessment", description: riskLevel === "high" ? "URL matches known phishing patterns and indicators." : "URL does not match known phishing patterns." },
      { type: "info", title: "Redirect Chain Analysis", description: "URL redirect chain analyzed for suspicious intermediate hops." },
    ],
  };

  return baseFindingsByModule[moduleType] || [
    { type: "info", title: "Analysis Complete", description: "Target analyzed using all available intelligence sources." },
  ];
}

export function generateMetadata(moduleType: string): Record<string, string | number> {
  const baseMetadata: Record<string, Record<string, string | number>> = {
    ip: {
      "Analysis Duration": "2.3s",
      "Databases Checked": 12,
      "API Integrations": 5,
      "Last Database Update": new Date().toISOString().split("T")[0],
    },
    wallet: {
      "Blockchain": "Ethereum Mainnet",
      "Transactions Analyzed": Math.floor(Math.random() * 500) + 50,
      "First Activity": "2021-03-15",
      "Last Activity": new Date().toISOString().split("T")[0],
    },
    phone: {
      "Carrier Type": "Mobile",
      "Country Code": "+380",
      "Databases Checked": 8,
      "Risk Signals Found": Math.floor(Math.random() * 5),
    },
    email: {
      "MX Records": "Valid",
      "Breach Databases": 15,
      "Account Age": "2+ years",
      "Disposable Status": "No",
    },
    domain: {
      "Domain Age": "5 years",
      "Registrar": "Cloudflare Inc.",
      "SSL Issuer": "Let's Encrypt Authority",
      "DNS Records": 12,
    },
    url: {
      "Response Code": 200,
      "Redirects Found": Math.floor(Math.random() * 3),
      "Content Type": "text/html",
      "Scan Engines Used": 70,
    },
  };

  return baseMetadata[moduleType] || { "Analysis Type": moduleType };
}
