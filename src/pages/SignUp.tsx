import { useLocation } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";

const SignUp = () => {
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan;

  return <AuthForm selectedPlan={selectedPlan} />;
};

export default SignUp;