import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import CompleteProfile from "@/pages/CompleteProfile";
import type { Theme } from "@/components/theme-provider";

function App() {
  const storedTheme = localStorage.getItem("vite-ui-theme");
  const validTheme: Theme = (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system") 
    ? storedTheme 
    : "system";

  return (
    <ThemeProvider defaultTheme={validTheme} storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
              </Routes>
              <Toaster />
            </Router>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;