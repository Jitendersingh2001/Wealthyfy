// pages/Home.tsx
import { useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

function HomePage() {
  const auth = useAuth();
  const { theme, setTheme } = useTheme();

  // Force light theme on home page and store original theme
  useEffect(() => {
    // Store the current theme as the user's preference if it's not already light
    if (theme !== "light") {
      // Store the original theme preference in a separate key
      localStorage.setItem("user-theme-preference", theme);
      setTheme("light");
    }
  }, [theme, setTheme]);

  return (
    <div className="relative w-full">
      <Navbar
        signInText="Log In"
        ctaText="Sign Up"
        onSignInClick={auth.login}
        onCtaClick={auth.register}
      />
    </div>
  );
}

export default HomePage;
