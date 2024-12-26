import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";

function App() {
  // Get the stored theme or default to system
  const storedTheme = localStorage.getItem("vite-ui-theme") || "system";

  return (
    <ThemeProvider defaultTheme={storedTheme} storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
          <Toaster />
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;