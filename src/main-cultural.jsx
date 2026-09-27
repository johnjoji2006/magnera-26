import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RealmPage from "./pages/RealmPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RealmPage realm="cultural" />
  </StrictMode>
);
