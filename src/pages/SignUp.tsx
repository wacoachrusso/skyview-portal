import { AuthForm } from "@/components/auth/AuthForm";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const SignUp = () => {
  const location = useLocation();
  const selectedPlan = new URLSearchParams(location.search).get('plan');

  useEffect(() => {
    if (selectedPlan) {
      console.log('Selected plan from URL:', selectedPlan);
      localStorage.setItem('selected_plan', selectedPlan);
    }
  }, [selectedPlan]);

  return <AuthForm />;
};

export default SignUp;