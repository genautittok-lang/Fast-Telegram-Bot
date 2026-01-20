import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Bot, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/">
          <Button variant="ghost" className="mb-4" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            На головну
          </Button>
        </Link>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">Вхід в DARKSHARE</CardTitle>
            <CardDescription className="text-muted-foreground">
              Увійдіть через Telegram для доступу до панелі управління
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-background/50 rounded-lg p-4 border border-border/30">
              <div className="flex items-start gap-3 mb-4">
                <Bot className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Єдиний акаунт</p>
                  <p className="text-xs text-muted-foreground">
                    Ваш акаунт з Telegram бота автоматично працює на сайті
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Безпека</p>
                  <p className="text-xs text-muted-foreground">
                    Всі дані захищені шифруванням
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div 
                ref={telegramRef} 
                className="telegram-login-container"
                data-testid="telegram-login-widget"
              />
              <p className="text-xs text-muted-foreground text-center">
                Натисніть кнопку вище, щоб увійти через Telegram
              </p>
            </div>

            <div className="text-center pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Ще не маєте акаунту?{" "}
                <a 
                  href="https://t.me/DARKSHAREN1_BOT" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-testid="link-telegram-bot"
                >
                  Почніть з Telegram бота
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
