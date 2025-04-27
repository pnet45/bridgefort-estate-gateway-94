
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TooltipProvider } from "@/components/ui/tooltip"

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <App />
  </TooltipProvider>
);
