import { Routes, Route } from "react-router-dom";
import { appRoutes } from "@/routes/appRoutes";
import { Toaster } from "@/components/ui/toaster/sonner";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </>
  );
}

export default App;
