import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";

function App() {
  return (
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
  );
}

export default App;