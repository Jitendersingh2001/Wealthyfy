import { Routes, Route } from "react-router-dom";
import { appRoutes } from "@/routes/appRoutes";

function App() {
  return (
    <Routes>
      {appRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}

export default App;
