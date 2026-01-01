import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Globe, 
  Wallet, 
  FileText, 
  Activity, 
  Zap, 
  Terminal,
  Lock,
  ChevronRight
} from "lucide-react";
import { useStats } from "@/hooks/use-stats";
import { TerminalText } from "@/components/TerminalText";
import { StatusBadge } from "@/components/StatusBadge";
import { FeatureCard } from "@/components/FeatureCard";
import { StatCard } from "@/components/StatCard";

export default function Home() {
  const { data: stats } = useStats();
  
  const features = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Blockchain Analytics",
      description: "Deep dive into wallet histories, transaction volumes, and risk scoring across multiple chains."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "IP & Network Intel",
      description: "Real-time GEO location, ISP data, and blacklist checks to identify suspicious connections."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Detailed Reports",
      description: "Generate professional PDF reports with evidence timestamps, risk verdicts, and QR verification."
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Active Monitoring",
      description: "Set up 24/7 watchdogs for wallets, IPs, or domains. Get instant alerts on status changes."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy First",
      description: "Zero data storage policy for checks. We process public data and discard it immediately."
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "API Integration",
      description: "Powerful developer API for integrating risk checks directly into your own infrastructure."
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(10,10,10,0.9),rgba(10,10,10,0.95)),url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 w-full border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">DARKSHARE <span className="text-primary">v4.0</span></span>
          </div>
          <StatusBadge status="online" />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow relative z-10">
        <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-muted-foreground mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <TerminalText text="System v4.0.1 initialized..." speed={50} />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
              Advanced Risk Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50 text-glow">
                Zero Compromise
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The ultimate Telegram bot for digital risk assessment. Check wallets, IPs, domains, and leaks instantly. 
              Generate comprehensive PDF reports and set up real-time monitoring.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://t.me/darkshare_bot" 
                target="_blank" 
                rel="noreferrer"
                className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg flex items-center gap-2 overflow-hidden transition-transform hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Zap className="w-5 h-5 fill-current" />
                <span>Launch Bot</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {stats ? stats.totalUsers.toLocaleString() : '---'} active users
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
            <StatCard label="Total Users" value={stats?.totalUsers.toLocaleString() ?? '10,000+'} delay={0.2} />
            <StatCard label="Active Monitors" value={stats?.activeWatches.toLocaleString() ?? '2,500+'} delay={0.3} />
            <StatCard label="Uptime" value="99.9%" delay={0.4} />
            <StatCard label="Threats Blocked" value="1.2M" prefix="~" delay={0.5} />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-black/20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-3xl font-bold font-display">Modular Intelligence</h2>
              <p className="text-muted-foreground">Everything you need to stay safe in the digital dark forest.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <FeatureCard 
                  key={idx}
                  {...feature}
                  delay={0.1 * idx}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Live Terminal Demo Section */}
        <section className="py-24 max-w-5xl mx-auto px-4">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0c0c0c] shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="flex-1 text-center font-mono text-xs text-muted-foreground opacity-50">darkshare_cli — v4.0</div>
            </div>
            <div className="p-6 font-mono text-sm space-y-4 h-[400px] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0c0c0c] z-10 pointer-events-none" />
              
              <div className="text-green-500/50 mb-2">➜ ~ ./darkshare scan 0x1234...5678</div>
              <div className="space-y-1 text-muted-foreground">
                <TerminalText text="[INIT] Connecting to blockchain nodes..." delay={500} speed={20} cursor={false} />
                <br />
                <TerminalText text="[INFO] Target: Wallet (ETH Mainnet)" delay={1500} speed={20} cursor={false} />
                <br />
                <TerminalText text="[SCAN] Analyzing transaction history (154 txs found)..." delay={2500} speed={30} cursor={false} />
                <br />
                <TerminalText text="[WARN] Interaction with Tornado Cash detected (Block #1234567)" delay={4500} speed={20} className="text-yellow-500" cursor={false} />
                <br />
                <TerminalText text="[SCAN] Checking blacklist databases..." delay={6000} speed={20} cursor={false} />
                <br />
                <TerminalText text="[OK] No sanctions found (OFAC/EU)" delay={7500} speed={20} className="text-green-500" cursor={false} />
                <br />
                <TerminalText text="[DONE] Risk Score: MEDIUM (45/100). Report generated." delay={9000} speed={30} className="text-primary font-bold" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-display font-bold">DARKSHARE</span>
          </div>
          
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            © 2024 DARKSHARE INT.
          </div>
        </div>
      </footer>
    </div>
  );
}
