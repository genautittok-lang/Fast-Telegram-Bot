// Shared check logic for both bot and web API
// Uses real free APIs where possible

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

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
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
  
  switch (type) {
    case "ip":
      return await checkIP(value, timestamp);
    case "wallet":
      return await checkWallet(value, timestamp);
    case "phone":
      return await checkPhone(value, timestamp);
    case "email":
      return await checkEmail(value, timestamp);
    case "domain":
      return await checkDomain(value, timestamp);
    case "url":
      return await checkURL(value, timestamp);
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

async function checkIP(value: string, timestamp: Date): Promise<CheckResult> {
  let ipData: any = null;
  let riskScore = 20;
  const findings: string[] = [];
  
  try {
    // Real API call to ip-api.com (free, no key needed)
    const response = await fetchWithTimeout(`http://ip-api.com/json/${value}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query`);
    ipData = await response.json();
    
    if (ipData.status === "success") {
      // Calculate risk based on real data
      if (ipData.proxy) {
        riskScore += 30;
        findings.push("IP використовує proxy/VPN сервіс");
      }
      if (ipData.hosting) {
        riskScore += 20;
        findings.push("IP належить до хостинг-провайдера (можливий бот)");
      }
      
      // Check for suspicious ISPs
      const suspiciousIsps = ["digital ocean", "amazon", "google cloud", "azure", "vultr", "linode", "ovh"];
      if (suspiciousIsps.some(isp => ipData.isp?.toLowerCase().includes(isp) || ipData.org?.toLowerCase().includes(isp))) {
        riskScore += 15;
        findings.push("IP належить до cloud-провайдера");
      }
      
      if (findings.length === 0) {
        findings.push("Звичайна IP-адреса без підозрілих ознак");
      }
    } else {
      findings.push("Не вдалося отримати інформацію про IP");
      riskScore = 50;
    }
  } catch (error) {
    findings.push("Помилка при перевірці IP (таймаут або недоступний сервіс)");
    riskScore = 30;
  }
  
  const riskLevel = getRiskLevel(riskScore);
  
  return {
    type: "ip",
    target: value,
    riskScore,
    riskLevel,
    summary: `IP ${value} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: ipData?.status === "success" ? {
      country: ipData.country || "Unknown",
      countryCode: ipData.countryCode || "??",
      city: ipData.city || "Unknown",
      region: ipData.regionName || "Unknown",
      isp: ipData.isp || "Unknown",
      organization: ipData.org || "Unknown",
      asn: ipData.as || "Unknown",
      timezone: ipData.timezone || "Unknown",
      coordinates: ipData.lat && ipData.lon ? `${ipData.lat}, ${ipData.lon}` : "Unknown",
      isProxy: ipData.proxy || false,
      isHosting: ipData.hosting || false,
    } : {
      error: ipData?.message || "API unavailable",
    },
    findings,
    sources: ["ip-api.com (Real-time)"],
    timestamp,
  };
}

async function checkWallet(value: string, timestamp: Date): Promise<CheckResult> {
  let riskScore = 15;
  const findings: string[] = [];
  let walletData: any = {};
  
  // Basic wallet validation and pattern analysis
  const address = value.toLowerCase();
  
  // Check for known suspicious patterns
  const knownMixers = ["0x722122df12d4e14e13ac3b6895a86e84145b6967"]; // Tornado Cash example
  if (knownMixers.some(m => address.includes(m.toLowerCase()))) {
    riskScore += 60;
    findings.push("КРИТИЧНО: Адреса пов'язана з mixer-сервісом");
  }
  
  // Address age and format analysis
  if (address.length === 42 && address.startsWith("0x")) {
    findings.push("Валідна Ethereum-адреса");
    walletData.chain = "Ethereum/EVM";
    walletData.addressFormat = "Valid";
    
    // Check address checksum (basic validation)
    const hasUpperCase = /[A-F]/.test(value.slice(2));
    if (hasUpperCase) {
      findings.push("Адреса з checksumом (більш безпечна)");
      walletData.checksumValid = true;
    } else {
      walletData.checksumValid = false;
    }
  }
  
  // Check for contract-like patterns
  if (address.endsWith("0000") || address.includes("dead")) {
    riskScore += 20;
    findings.push("Можлива контрактна або burn-адреса");
  }
  
  if (findings.length <= 2) {
    findings.push("Базова перевірка пройшла успішно");
  }
  
  // Note: For full wallet analysis, Etherscan API key would be needed
  walletData.note = "Для детального аналізу транзакцій потрібен Etherscan API";
  
  const riskLevel = getRiskLevel(riskScore);
  
  return {
    type: "wallet",
    target: value,
    riskScore,
    riskLevel,
    summary: `Гаманець ${value.substring(0, 10)}... має ${riskLevel.toUpperCase()} рівень ризику`,
    details: walletData,
    findings,
    sources: ["Локальний аналіз адреси"],
    timestamp,
  };
}

async function checkPhone(value: string, timestamp: Date): Promise<CheckResult> {
  let riskScore = 15;
  const findings: string[] = [];
  const phoneData: any = {};
  
  // Clean phone number
  const cleanNumber = value.replace(/[\s\-\(\)]/g, '');
  
  // Detect country code
  const countryCodes: Record<string, { country: string; carriers: string[] }> = {
    "+380": { country: "Україна", carriers: ["Kyivstar", "Vodafone", "lifecell"] },
    "+38": { country: "Україна", carriers: ["Kyivstar", "Vodafone", "lifecell"] },
    "+1": { country: "США/Канада", carriers: ["AT&T", "Verizon", "T-Mobile"] },
    "+44": { country: "Великобританія", carriers: ["EE", "O2", "Vodafone UK"] },
    "+49": { country: "Німеччина", carriers: ["Telekom", "Vodafone DE", "O2 DE"] },
    "+48": { country: "Польща", carriers: ["Orange", "Play", "Plus"] },
  };
  
  let detectedCountry = "Невідома";
  let detectedCode = "";
  
  for (const [code, info] of Object.entries(countryCodes)) {
    if (cleanNumber.startsWith(code)) {
      detectedCountry = info.country;
      detectedCode = code;
      phoneData.possibleCarriers = info.carriers;
      break;
    }
  }
  
  phoneData.country = detectedCountry;
  phoneData.countryCode = detectedCode || "Unknown";
  phoneData.format = cleanNumber.startsWith("+") ? "International" : "Local";
  
  // Length validation
  if (cleanNumber.length < 10) {
    riskScore += 30;
    findings.push("Номер занадто короткий - можливо невалідний");
  } else if (cleanNumber.length > 15) {
    riskScore += 20;
    findings.push("Номер занадто довгий");
  } else {
    findings.push("Формат номера валідний");
  }
  
  // Check for suspicious patterns
  if (/^(\+?0{5,})/.test(cleanNumber)) {
    riskScore += 40;
    findings.push("Підозрілий паттерн - можливий фейковий номер");
  }
  
  // Check for VOIP indicators (basic heuristic)
  const voipPrefixes = ["050", "063", "073", "093"]; // Example VOIP prefixes
  if (voipPrefixes.some(p => cleanNumber.includes(p) && cleanNumber.startsWith("+380"))) {
    phoneData.type = "Mobile";
  } else {
    phoneData.type = "Unknown";
  }
  
  if (findings.length === 1) {
    findings.push("Базова перевірка пройшла успішно");
  }
  
  phoneData.note = "Для повної перевірки потрібен NumVerify API";
  
  const riskLevel = getRiskLevel(riskScore);
  
  return {
    type: "phone",
    target: value,
    riskScore,
    riskLevel,
    summary: `Номер ${value} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: phoneData,
    findings,
    sources: ["Локальний аналіз формату"],
    timestamp,
  };
}

async function checkEmail(value: string, timestamp: Date): Promise<CheckResult> {
  let riskScore = 15;
  const findings: string[] = [];
  const emailData: any = {};
  
  const parts = value.split('@');
  if (parts.length !== 2) {
    return {
      type: "email",
      target: value,
      riskScore: 80,
      riskLevel: "high",
      summary: `Email ${value} - невалідний формат`,
      details: { error: "Invalid email format" },
      findings: ["Невалідний формат email"],
      sources: ["Локальний аналіз"],
      timestamp,
    };
  }
  
  const [localPart, domain] = parts;
  emailData.domain = domain;
  emailData.localPart = localPart;
  
  // Check domain type
  const freeProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "mail.ru", "ukr.net", "i.ua"];
  const disposableProviders = ["tempmail.com", "guerrillamail.com", "10minutemail.com", "throwaway.email", "temp-mail.org"];
  
  if (freeProviders.includes(domain.toLowerCase())) {
    emailData.domainType = "Free Provider";
    findings.push(`Безкоштовний email-провайдер (${domain})`);
  } else if (disposableProviders.some(d => domain.toLowerCase().includes(d))) {
    riskScore += 50;
    emailData.domainType = "Disposable";
    findings.push("УВАГА: Одноразовий email-сервіс");
  } else {
    emailData.domainType = "Custom Domain";
    findings.push("Власний домен");
  }
  
  // Check for suspicious patterns in local part
  if (/^\d+$/.test(localPart)) {
    riskScore += 15;
    findings.push("Тільки цифри в адресі - можливий автогенерований");
  }
  
  if (localPart.length < 3) {
    riskScore += 10;
    findings.push("Дуже коротка адреса");
  }
  
  // Check for common spam patterns
  const spamPatterns = ["noreply", "no-reply", "donotreply", "spam", "test", "admin@"];
  if (spamPatterns.some(p => value.toLowerCase().includes(p))) {
    riskScore += 20;
    findings.push("Системна або тестова адреса");
  }
  
  emailData.formatValid = true;
  emailData.note = "Для перевірки витоків потрібен HaveIBeenPwned API";
  
  if (findings.length === 1) {
    findings.push("Базова перевірка пройшла успішно");
  }
  
  const riskLevel = getRiskLevel(riskScore);
  
  return {
    type: "email",
    target: value,
    riskScore,
    riskLevel,
    summary: `Email ${value} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: emailData,
    findings,
    sources: ["Локальний аналіз формату та домену"],
    timestamp,
  };
}

async function checkDomain(value: string, timestamp: Date): Promise<CheckResult> {
  let riskScore = 15;
  const findings: string[] = [];
  const domainData: any = {};
  
  // Clean domain
  const domain = value.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  domainData.cleanDomain = domain;
  
  // Check TLD
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  domainData.tld = tld;
  
  // Suspicious TLDs
  const suspiciousTlds = ["tk", "ml", "ga", "cf", "gq", "xyz", "top", "work", "click", "loan"];
  const trustedTlds = ["com", "org", "net", "edu", "gov", "ua", "uk", "de", "eu"];
  
  if (suspiciousTlds.includes(tld)) {
    riskScore += 30;
    findings.push(`Підозрілий TLD (.${tld}) - часто використовується для фішингу`);
  } else if (trustedTlds.includes(tld)) {
    findings.push(`Надійний TLD (.${tld})`);
  }
  
  // Check domain length and characters
  if (domain.length > 50) {
    riskScore += 20;
    findings.push("Занадто довгий домен - підозріло");
  }
  
  if (/\d{5,}/.test(domain)) {
    riskScore += 25;
    findings.push("Багато цифр в домені - можливий автогенерований");
  }
  
  // Check for typosquatting patterns
  const popularBrands = ["google", "facebook", "apple", "microsoft", "amazon", "paypal", "netflix"];
  for (const brand of popularBrands) {
    if (domain.includes(brand) && !domain.endsWith(`.${brand}.com`) && domain !== `${brand}.com`) {
      riskScore += 40;
      findings.push(`УВАГА: Можливий typosquatting (${brand})`);
      break;
    }
  }
  
  // Check for suspicious subdomains
  if (parts.length > 3) {
    riskScore += 15;
    findings.push("Багато субдоменів - може бути підозрілим");
  }
  
  // Hyphen check
  if ((domain.match(/-/g) || []).length > 2) {
    riskScore += 15;
    findings.push("Багато дефісів в домені");
  }
  
  if (findings.length === 1) {
    findings.push("Базова перевірка пройшла успішно");
  }
  
  domainData.partsCount = parts.length;
  domainData.note = "Для WHOIS даних потрібен відповідний API";
  
  const riskLevel = getRiskLevel(riskScore);
  
  return {
    type: "domain",
    target: value,
    riskScore,
    riskLevel,
    summary: `Домен ${domain} має ${riskLevel.toUpperCase()} рівень ризику`,
    details: domainData,
    findings,
    sources: ["Локальний аналіз доменного імені"],
    timestamp,
  };
}

async function checkURL(value: string, timestamp: Date): Promise<CheckResult> {
  let riskScore = 15;
  const findings: string[] = [];
  const urlData: any = {};
  
  try {
    const urlObj = new URL(value);
    urlData.domain = urlObj.hostname;
    urlData.protocol = urlObj.protocol;
    urlData.path = urlObj.pathname;
    urlData.hasParams = urlObj.search.length > 0;
    
    // Check protocol
    if (urlObj.protocol === "http:") {
      riskScore += 25;
      findings.push("Незахищене з'єднання (HTTP без SSL)");
    } else {
      findings.push("Захищене з'єднання (HTTPS)");
    }
    
    // Check for URL shorteners
    const shorteners = ["bit.ly", "t.co", "goo.gl", "tinyurl.com", "ow.ly", "is.gd", "buff.ly"];
    if (shorteners.some(s => urlObj.hostname.includes(s))) {
      riskScore += 30;
      urlData.isShortener = true;
      findings.push("URL-скорочувач - може приховувати справжній адрес");
    }
    
    // Check for suspicious patterns in path
    const suspiciousPatterns = [".exe", ".zip", ".rar", ".php?", "download", "login", "signin", "account", "verify", "secure"];
    for (const pattern of suspiciousPatterns) {
      if (value.toLowerCase().includes(pattern)) {
        riskScore += 15;
        findings.push(`Підозрілий паттерн в URL: "${pattern}"`);
        break;
      }
    }
    
    // Check for IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(urlObj.hostname)) {
      riskScore += 35;
      findings.push("URL використовує IP замість домену - підозріло");
    }
    
    // Check for excessive subdomains
    const subdomains = urlObj.hostname.split('.').length - 2;
    if (subdomains > 2) {
      riskScore += 15;
      findings.push(`Багато субдоменів (${subdomains}) - може бути фішингом`);
    }
    
    // Check for suspicious query params
    if (urlObj.search.includes("redirect") || urlObj.search.includes("url=") || urlObj.search.includes("goto")) {
      riskScore += 20;
      findings.push("URL містить redirect-параметри");
    }
    
    // Check domain against known malicious patterns
    const maliciousPatterns = ["login-", "-verify", "-secure", "account-", "update-"];
    if (maliciousPatterns.some(p => urlObj.hostname.includes(p))) {
      riskScore += 30;
      findings.push("Домен містить типові фішингові паттерни");
    }
    
    urlData.note = "Для повного сканування потрібен VirusTotal API";
    
    if (findings.length === 1) {
      findings.push("Базова перевірка пройшла успішно");
    }
    
    const riskLevel = getRiskLevel(riskScore);
    
    return {
      type: "url",
      target: value,
      riskScore,
      riskLevel,
      summary: `URL ${value.substring(0, 40)}... має ${riskLevel.toUpperCase()} рівень ризику`,
      details: urlData,
      findings,
      sources: ["Локальний аналіз URL"],
      timestamp,
    };
  } catch {
    return {
      type: "url",
      target: value,
      riskScore: 60,
      riskLevel: "high",
      summary: `URL ${value.substring(0, 40)}... - невалідний формат`,
      details: { error: "Invalid URL format" },
      findings: ["Невалідний формат URL"],
      sources: ["Локальний аналіз"],
      timestamp,
    };
  }
}
