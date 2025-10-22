// pages/Home.tsx
import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";

function HomePage() {
  return (
    <div className="relative w-full">
      <Navbar01
        navigationLinks={[]}
        signInText="Log In"
        ctaText="Sign Up"
        onSignInClick={() => console.log("Sign In clicked")}
        onCtaClick={() => console.log("CTA clicked")}
      />
    </div>
  );
}

export default HomePage;
