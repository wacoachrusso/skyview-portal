import React from "react";
import { Link } from "react-router-dom";

interface AuthFooterProps {
  isPrivacyPolicyEnable?: boolean;
  bottomText: string;
  bottomLinkText: string;
  bottomLinkTo: string;
}
const AuthFooter: React.FC<AuthFooterProps> = ({
  isPrivacyPolicyEnable,
  bottomText,
  bottomLinkText,
  bottomLinkTo,
}) => {
  return (
    <div className="text-center mt-4 text-xs text-gray-400">
      {isPrivacyPolicyEnable && (
        <>
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="text-brand-gold hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy-policy"
            className="text-brand-gold hover:underline"
          >
            Privacy Policy
          </Link>
        </>
      )}
      <div className="mt-1 text-sm">
        {bottomText}{" "}
        <Link
          to={bottomLinkTo}
          className="text-brand-gold underline underline-offset-4 hover:text-brand-gold/80"
        >
          {bottomLinkText}
        </Link>
      </div>
    </div>
  );
};

export default AuthFooter;
