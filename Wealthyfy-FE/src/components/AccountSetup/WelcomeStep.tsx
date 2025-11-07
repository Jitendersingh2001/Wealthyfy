import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/constants/site";
import { ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

function WelcomeStep({ onNext }: WelcomeStepProps) {

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <img 
              src="/favicon.png" 
              alt={SITE_CONFIG.LOGO_ALT}
              className="w-12 h-12 object-contain animate-pulse"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Welcome to {SITE_CONFIG.NAME}
        </CardTitle>
        <CardDescription className="text-base">
          {SITE_CONFIG.TAGLINE}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        <p className="text-muted-foreground leading-relaxed">
          Let's get your account set up in just a few simple steps. 
          We'll help you connect your investments and start managing your wealth smarter.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Quick & Secure Setup</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button
          onClick={onNext}
          className="w-full group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          size="lg"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Get Started
            <ArrowRight 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
            />
          </span>
          <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </Button>
      </CardFooter>
    </div>
  );
}

export default WelcomeStep;
