import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Bot, ArrowLeft, Sparkles, CheckCircle, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: any) => void;
    };
    onTelegramAuth?: (user: any) => void;
  }
}

export default function Login() {
  const telegramRef = useRef<HTMLDivElement>(null);
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
      return;
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    window.onTelegramAuth = async (telegramUser: any) => {
      try {
        await login(telegramUser);
        toast({
          title: "Успішний вхід",
          description: `Ласкаво просимо, ${telegramUser.first_name || telegramUser.username}!`,
        });
        setLocation("/dashboard");
      } catch (err) {
        toast({
          title: "Помилка входу",
          description: "Не вдалося увійти через Telegram",
          variant: "destructive",
        });
      }
    };

    if (telegramRef.current && !telegramRef.current.hasChildNodes()) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", "DARKSHAREN1_BOT");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "8");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      script.async = true;
      telegramRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [login, setLocation, toast]);

  const features = [
    { icon: Shield, title: "Повний захист", desc: "Аналіз загроз в реальному часі" },
    { icon: Globe, title: "6+ модулів", desc: "IP, Wallet, Email, Phone, Domain, URL" },
    { icon: Zap, title: "Миттєва перевірка", desc: "Результат за секунди" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 xl:p-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/">
              <Button variant="ghost" className="mb-8" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                На головну
              </Button>
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">DARKSHARE</h1>
                <p className="text-sm text-muted-foreground">Risk Intelligence Platform</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-display font-bold mb-6 leading-tight">
              Захистіть себе від{" "}
              <span className="text-primary">кіберзагроз</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-lg">
              Професійний інструмент для перевірки ризиків. Миттєвий аналіз IP-адрес, 
              криптогаманців, email та інших цифрових об'єктів.
            </p>

            <div className="space-y-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-8">
              <Link href="/">
                <Button variant="ghost" className="mb-4" data-testid="button-back-home-mobile">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  На головну
                </Button>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-2xl font-display font-bold">DARKSHARE</span>
              </div>
            </div>

            <Card className="bg-card/80 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Lock className="w-9 h-9 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold">Вхід в акаунт</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Авторизуйтесь через Telegram для доступу до панелі
                </p>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Єдиний акаунт</p>
                      <p className="text-xs text-muted-foreground">
                        Telegram бот + Web панель
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 dark:bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-white/10 dark:bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">15 безкоштовних перевірок</p>
                      <p className="text-xs text-muted-foreground">
                        Щодня оновлюється ліміт
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">Авторизація</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div 
                    ref={telegramRef} 
                    className="telegram-login-container"
                    data-testid="telegram-login-widget"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Натисніть кнопку для входу через Telegram
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-security-tls">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Безпечне з'єднання TLS 1.3</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-security-privacy">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Дані не передаються третім особам</span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">
                    Ще не маєте акаунту?{" "}
                    <a 
                      href="https://t.me/DARKSHAREN1_BOT" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                      data-testid="link-telegram-bot"
                    >
                      Почніть з бота
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Входячи, ви погоджуєтесь з{" "}
              <a href="#" className="text-primary cursor-pointer hover:underline" data-testid="link-terms">Умовами використання</a>
              {" "}та{" "}
              <a href="#" className="text-primary cursor-pointer hover:underline" data-testid="link-privacy">Політикою конфіденційності</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
