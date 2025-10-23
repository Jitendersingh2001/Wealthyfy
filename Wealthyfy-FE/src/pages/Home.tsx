// pages/Home.tsx
import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
// import { keycloakService } from "@/services/keycloak";
import { useAuth } from "@/hooks/use-auth";

function HomePage() {
  const auth = useAuth();
  return (
    <div className="relative w-full">
      <Navbar01
        navigationLinks={[]}
        signInText="Log In"
        ctaText="Sign Up"
        onSignInClick={auth.login}
        onCtaClick={auth.register}
      />
    </div>
  );
}

export default HomePage;
