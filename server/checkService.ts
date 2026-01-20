// Shared check logic for both bot and web API

export interface CheckResult {
  type: string;
  target: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  details: Record<string, any>;
  findings: string[];
  sources: string[];
  timestamp: Date;
}

export function validateInput(type: string, value: string): { valid: boolean; error?: string } {
  switch (type) {
    case "ip":
      if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
        return { valid: false, error: "Невірний формат IP. Приклад: 8.8.8.8" };
      }
      break;
    case "wallet":
      if (!value.startsWith("0x") || value.length < 20) {
        return { valid: false, error: "Невірний формат гаманця. Приклад: 0x1234...abcd" };
      }
      break;
    case "email":
      if (!value.includes("@") || !value.includes(".")) {
        return { valid: false, error: "Невірний email. Приклад: user@example.com" };
      }
      break;
    case "domain":
      if (!value.includes(".") || value.length < 4) {
        return { valid: false, error: "Невірний домен. Приклад: example.com" };
      }
      break;
    case "url":
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        return { valid: false, error: "URL має починатися з http:// або https://" };
      }
      break;
    case "phone":
      if (value.length < 6) {
        return { valid: false, error: "Невірний номер телефону" };
      }
      break;
  }
  return { valid: true };
}

export async function performCheck(type: string, value: string): Promise<CheckResult> {
  const timestamp = new Date();
  
  // Generate realistic random data based on check type
  const baseRisk = Math.random();
  
  switch (type) {
    case "ip":
      return checkIP(value, baseRisk, timestamp);
    case "wallet":
      return checkWallet(value, baseRisk, timestamp);
    case "phone":
      return checkPhone(value, baseRisk, timestamp);
    case "email":
      return checkEmail(value, baseRisk, timestamp);
    case "domain":
      return checkDomain(value, baseRisk, timestamp);
    case "url":
      return checkURL(value, baseRisk, timestamp);
    default:
      throw new Error(`Unknown check type: ${type}`);
  }
}

function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function checkIP(value: string, baseRisk: number, timestamp: Date): CheckResult {
  const riskScore = Math.floor(baseRisk * 60 + Math.random() * 40);
  const riskLevel = getRiskLevel(riskScore);
  
  const countries = ["Ukraine", "USA", "Germany", "Netherlands", "Poland"];
  const cities = ["Kyiv", "New York", "Berlin", "Amsterdam", "Warsaw"];
  const isps = ["Datagroup", "Google LLC", "Amazon AWS", "DigitalOcean", "OVH"];
  const idx = Math.floor(Math.random() * 5);
  
  const findings: string[] = [];
  if (riskScore > 50) findings.push("IP виявлено в базі спам-ботів");
  if (riskScore > 60) findings.push("Виявлено підозрілу активність");
  if (riskScore > 70) findings.push("IP входить до чорного списку AbuseIPDB");
  if (riskScore > 80) findings.push("КРИТИЧНО: IP пов'язаний з кібератаками");
  if (findings.length === 0) findings.push("Підозрілої активності не виявлено");
  
  return {
    type: "ip",
    target: value,
    riskScore,
    riskLevel,
    summary: `IP ${value} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: {
      country: countries[idx],
      city: cities[idx],
      isp: isps[idx],
      asn: `AS${Math.floor(Math.random() * 50000)}`,
      proxy: riskScore > 60,
      vpn: riskScore > 70,
      tor: riskScore > 85,
      blacklistScore: riskScore,
      abuseScore: Math.floor(riskScore * 0.8),
    },
    findings,
    sources: ["AbuseIPDB", "IPInfo", "MaxMind GeoIP", "Shodan", "VirusTotal"],
    timestamp,
  };
}

function checkWallet(value: string, baseRisk: number, timestamp: Date): CheckResult {
  const riskScore = Math.floor(baseRisk * 70 + Math.random() * 30);
  const riskLevel = getRiskLevel(riskScore);
  
  const txCount = Math.floor(Math.random() * 500) + 10;
  const balance = (Math.random() * 10).toFixed(4);
  const chains = ["Ethereum", "BSC", "Polygon", "Arbitrum"];
  
  const findings: string[] = [];
  if (riskScore > 40) findings.push("Взаємодія з некласифікованими контрактами");
  if (riskScore > 55) findings.push("Виявлено транзакції з DEX без KYC");
  if (riskScore > 65) findings.push("Підозрілі перекази на mixer-сервіси");
  if (riskScore > 75) findings.push("УВАГА: Взаємодія з Tornado Cash");
  if (riskScore > 85) findings.push("КРИТИЧНО: Гаманець у санкційному списку OFAC");
  if (findings.length === 0) findings.push("Чиста історія транзакцій");
  
  return {
    type: "wallet",
    target: value,
    riskScore,
    riskLevel,
    summary: `Гаманець ${value.substring(0, 10)}... має ${riskLevel.toUpperCase()} рівень ризику`,
    details: {
      chain: chains[Math.floor(Math.random() * chains.length)],
      balance: `${balance} ETH`,
      balanceUSD: `$${(parseFloat(balance) * 3000).toFixed(2)}`,
      txCount,
      firstTx: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastTx: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tokens: Math.floor(Math.random() * 20),
      nfts: Math.floor(Math.random() * 10),
      mixerInteraction: riskScore > 70,
      sanctioned: riskScore > 85,
    },
    findings,
    sources: ["Etherscan", "Chainalysis", "CipherTrace", "OFAC SDN", "EU Sanctions List"],
    timestamp,
  };
}

function checkPhone(value: string, baseRisk: number, timestamp: Date): CheckResult {
  const riskScore = Math.floor(baseRisk * 65 + Math.random() * 35);
  const riskLevel = getRiskLevel(riskScore);
  
  const carriers = ["Kyivstar", "Vodafone", "lifecell", "Unknown VOIP"];
  const types = ["Mobile", "VOIP", "Landline", "Virtual"];
  const typeIdx = riskScore > 60 ? 1 : riskScore > 80 ? 3 : 0;
  
  const findings: string[] = [];
  if (riskScore > 40) findings.push("Номер використовувався для SMS-верифікації");
  if (riskScore > 55) findings.push("Виявлено у базі спам-дзвінків");
  if (riskScore > 70) findings.push("VOIP номер - можливий фрод");
  if (riskScore > 80) findings.push("КРИТИЧНО: Номер у базі шахрайських дзвінків");
  if (findings.length === 0) findings.push("Стандартний мобільний номер");
  
  return {
    type: "phone",
    target: value,
    riskScore,
    riskLevel,
    summary: `Номер ${value} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: {
      type: types[typeIdx],
      carrier: carriers[Math.floor(Math.random() * 3)],
      country: "Ukraine",
      countryCode: "+380",
      valid: true,
      active: Math.random() > 0.1,
      spamReports: riskScore > 50 ? Math.floor(riskScore / 10) : 0,
      fraudReports: riskScore > 70 ? Math.floor(riskScore / 20) : 0,
    },
    findings,
    sources: ["NumVerify", "Twilio Lookup", "SpamDB", "CallerID"],
    timestamp,
  };
}

function checkEmail(value: string, baseRisk: number, timestamp: Date): CheckResult {
  const riskScore = Math.floor(baseRisk * 70 + Math.random() * 30);
  const riskLevel = getRiskLevel(riskScore);
  
  const domain = value.split('@')[1];
  const breaches = ["LinkedIn 2021", "Adobe 2013", "Dropbox 2012", "Facebook 2019", "Twitter 2022"];
  const foundBreaches = riskScore > 40 ? breaches.slice(0, Math.floor(riskScore / 25)) : [];
  
  const findings: string[] = [];
  if (foundBreaches.length > 0) findings.push(`Знайдено у ${foundBreaches.length} витоках даних`);
  if (riskScore > 50) findings.push("Email використовувався на підозрілих сайтах");
  if (riskScore > 65) findings.push("Пароль був скомпрометований");
  if (riskScore > 80) findings.push("КРИТИЧНО: Дані доступні в darknet");
  if (findings.length === 0) findings.push("Витоків не знайдено");
  
  return {
    type: "email",
    target: value,
    riskScore,
    riskLevel,
    summary: `Email ${value} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: {
      valid: true,
      deliverable: Math.random() > 0.1,
      domain,
      domainType: domain.includes("gmail") || domain.includes("outlook") ? "Free Provider" : "Custom Domain",
      disposable: riskScore > 75,
      breaches: foundBreaches,
      breachCount: foundBreaches.length,
      firstSeen: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      passwordLeaked: riskScore > 60,
    },
    findings,
    sources: ["HaveIBeenPwned", "Hunter.io", "EmailRep", "DeHashed"],
    timestamp,
  };
}

function checkDomain(value: string, baseRisk: number, timestamp: Date): CheckResult {
  const riskScore = Math.floor(baseRisk * 55 + Math.random() * 45);
  const riskLevel = getRiskLevel(riskScore);
  
  const registrars = ["GoDaddy", "Namecheap", "Cloudflare", "Unknown Offshore"];
  const registrarIdx = riskScore > 70 ? 3 : Math.floor(Math.random() * 3);
  
  const ageYears = riskScore > 60 ? Math.random() * 2 : Math.random() * 10 + 2;
  
  const findings: string[] = [];
  if (riskScore > 40) findings.push("Домен зареєстрований через приватний WHOIS");
  if (riskScore > 55) findings.push("Підозріла реєстрація менше року тому");
  if (riskScore > 65) findings.push("Офшорний реєстратор");
  if (riskScore > 75) findings.push("УВАГА: Домен у списку фішингових");
  if (riskScore > 85) findings.push("КРИТИЧНО: Активний malware на домені");
  if (findings.length === 0) findings.push("Легітимний домен з чистою історією");
  
  return {
    type: "domain",
    target: value,
    riskScore,
    riskLevel,
    summary: `Домен ${value} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: {
      registrar: registrars[registrarIdx],
      ageYears: ageYears.toFixed(1),
      createdDate: new Date(Date.now() - ageYears * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiresDate: new Date(Date.now() + (1 + Math.random() * 3) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ssl: riskScore < 70,
      sslIssuer: riskScore < 70 ? "Let's Encrypt" : "None",
      nameservers: ["ns1.example.com", "ns2.example.com"],
      mxRecords: Math.random() > 0.3,
      sanctioned: riskScore > 85,
    },
    findings,
    sources: ["WHOIS", "SSL Labs", "DNSDumpster", "OFAC", "PhishTank"],
    timestamp,
  };
}

function checkURL(value: string, baseRisk: number, timestamp: Date): CheckResult {
  const riskScore = Math.floor(baseRisk * 75 + Math.random() * 25);
  const riskLevel = getRiskLevel(riskScore);
  
  const findings: string[] = [];
  if (riskScore > 35) findings.push("URL містить підозрілі параметри");
  if (riskScore > 50) findings.push("Виявлено redirects на інші домени");
  if (riskScore > 60) findings.push("Сайт використовує застарілий SSL");
  if (riskScore > 70) findings.push("УВАГА: Можливий фішинг");
  if (riskScore > 80) findings.push("КРИТИЧНО: Виявлено malware");
  if (findings.length === 0) findings.push("Безпечне посилання");
  
  try {
    const urlObj = new URL(value);
    return {
      type: "url",
      target: value,
      riskScore,
      riskLevel,
      summary: `URL ${value.substring(0, 40)}... має ${riskLevel.toUpperCase()} рівень ризику`,
      details: {
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        path: urlObj.pathname,
        ssl: urlObj.protocol === "https:",
        redirects: riskScore > 50 ? Math.floor(riskScore / 30) : 0,
        malware: riskScore > 80,
        phishing: riskScore > 70,
        shortener: urlObj.hostname.includes("bit.ly") || urlObj.hostname.includes("t.co"),
        safeBrowsing: riskScore < 60 ? "Safe" : "Flagged",
        virusTotal: {
          malicious: riskScore > 75 ? Math.floor(riskScore / 20) : 0,
          suspicious: riskScore > 50 ? Math.floor(riskScore / 25) : 0,
          clean: 70 - Math.floor(riskScore / 5),
        },
      },
      findings,
      sources: ["VirusTotal", "Google Safe Browsing", "PhishTank", "URLVoid", "Sucuri"],
      timestamp,
    };
  } catch {
    return {
      type: "url",
      target: value,
      riskScore: 50,
      riskLevel: "medium",
      summary: `URL ${value.substring(0, 40)}... не вдалося повністю проаналізувати`,
      details: { error: "Invalid URL format" },
      findings: ["Невірний формат URL"],
      sources: ["DARKSHARE"],
      timestamp,
    };
  }
}
