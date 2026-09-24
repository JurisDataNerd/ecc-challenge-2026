import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameWorld } from "./ui/game-world";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameWorld />
  </StrictMode>,
);
