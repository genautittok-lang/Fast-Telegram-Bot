import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, 
  Globe, 
  Wallet, 
  Mail, 
  Phone, 
  Link2, 
  Building,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Download,
  Eye,
  X,
  LogOut,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

interface CheckResult {
  type: string;
  target: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  details: Record<string, any>;
  findings: string[];
  sources: string[];
  timestamp: string;
}

const checkTypes = [
  { id: "ip", label: "IP/GEO", icon: Globe, placeholder: "8.8.8.8", description: "Перевірка IP адреси" },
  { id: "wallet", label: "Wallet", icon: Wallet, placeholder: "0x1234...abcd", description: "Аналіз криптогаманця" },
  { id: "email", label: "Email", icon: Mail, placeholder: "user@example.com", description: "Перевірка email на витоки" },
  { id: "phone", label: "Phone", icon: Phone, placeholder: "+380501234567", description: "Аналіз номера телефону" },
  { id: "domain", label: "Domain", icon: Building, placeholder: "example.com", description: "Перевірка домену" },
  { id: "url", label: "URL", icon: Link2, placeholder: "https://example.com/path", description: "Аналіз посилання" },
];

export default function Dashboard() {
  const [selectedType, setSelectedType] = useState("ip");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const checkMutation = useMutation({
    mutationFn: async ({ type, value }: { type: string; value: string }) => {
      const res = await apiRequest("POST", "/api/check", { type, value });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (error: any) => {
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося виконати перевірку",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleCheck = () => {
    // Use inputRef value as fallback for Playwright compatibility
    const value = inputValue.trim() || inputRef.current?.value?.trim() || "";
    if (!value) {
      toast({
        title: "Помилка",
        description: "Введіть значення для перевірки",
        variant: "destructive",
      });
      return;
    }
    checkMutation.mutate({ type: selectedType, value });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500/20 text-red-500 border-red-500/50";
      case "high": return "bg-orange-500/20 text-orange-500 border-orange-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "low": return "bg-green-500/20 text-green-500 border-green-500/50";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="w-5 h-5" />;
      case "medium":
        return <Clock className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const selectedCheck = checkTypes.find(c => c.id === selectedType);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl">DARKSHARE</span>
              <Badge variant="outline" className="text-xs">Dashboard</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history">
              <Button variant="ghost" size="sm" data-testid="button-history">
                <FileText className="w-4 h-4 mr-2" />
                Історія
              </Button>
            </Link>
            <Link href="/monitoring">
              <Button variant="ghost" size="sm" data-testid="button-monitoring">
                <Eye className="w-4 h-4 mr-2" />
                Моніторинг
              </Button>
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">@{user?.username}</span>
                <Badge variant="secondary" className="text-xs">{user?.tier}</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Нова перевірка
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {checkTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setInputValue("");
                        setResult(null);
                      }}
                      className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                        selectedType === type.id
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-muted-foreground hover:text-white"
                      }`}
                      data-testid={`button-check-type-${type.id}`}
                    >
                      <type.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{selectedCheck?.description}</p>
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={selectedCheck?.placeholder}
                      className="bg-white/5 border-white/10 flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                      data-testid="input-check-value"
                    />
                    <Button 
                      onClick={handleCheck} 
                      disabled={checkMutation.isPending}
                      data-testid="button-perform-check"
                    >
                      {checkMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Перевірити
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getRiskIcon(result.riskLevel)}
                          Результат аналізу
                        </CardTitle>
                        <Badge className={`${getRiskColor(result.riskLevel)} border`}>
                          {result.riskLevel.toUpperCase()} - {result.riskScore}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-sm text-muted-foreground mb-1">Ціль</p>
                        <p className="font-mono text-lg break-all">{result.target}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          Знахідки
                        </h4>
                        <div className="space-y-2">
                          {result.findings.map((finding, idx) => (
                            <div 
                              key={idx} 
                              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                                finding.includes("КРИТИЧНО") ? "bg-red-500/10 text-red-400" :
                                finding.includes("УВАГА") ? "bg-orange-500/10 text-orange-400" :
                                finding.includes("не виявлено") || finding.includes("Чиста") || finding.includes("Безпечн") ? "bg-green-500/10 text-green-400" :
                                "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {finding}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-3">Деталі</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(result.details).map(([key, value]) => (
                            <div key={key} className="p-3 rounded-lg bg-white/5 border border-white/5">
                              <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="font-mono text-sm mt-1 break-all">
                                {typeof value === "boolean" ? (value ? "Так" : "Ні") : 
                                 typeof value === "object" ? JSON.stringify(value) : 
                                 String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="text-xs text-muted-foreground">
                          Джерела: {result.sources.join(", ")}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid="button-download-pdf">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" data-testid="button-add-to-monitor">
                            <Eye className="w-4 h-4 mr-2" />
                            Моніторити
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Швидкі дії</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/history" data-testid="link-view-history">
                    <FileText className="w-4 h-4 mr-2" />
                    Переглянути історію
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/monitoring" data-testid="link-view-monitoring">
                    <Eye className="w-4 h-4 mr-2" />
                    Активні монітори
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Підказки</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  <strong className="text-white">IP/GEO:</strong> Перевіряє геолокацію, провайдера та чорні списки.
                </p>
                <p>
                  <strong className="text-white">Wallet:</strong> Аналізує транзакції, взаємодію з mixers та санкції.
                </p>
                <p>
                  <strong className="text-white">Email:</strong> Шукає витоки даних у відомих базах.
                </p>
                <p>
                  <strong className="text-white">URL:</strong> Перевіряє на malware та фішинг.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
