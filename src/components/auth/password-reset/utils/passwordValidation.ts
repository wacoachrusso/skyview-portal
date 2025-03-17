
export const validatePassword = (password: string): { isValid: boolean; requirements: { met: boolean; text: string }[] } => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};:'"|,.<>?/`~]/.test(password);
  const isLongEnough = password.length >= 8;

  return {
    isValid: hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && isLongEnough,
    requirements: [
      { met: hasLowerCase, text: "Include at least one lowercase letter (a-z)" },
      { met: hasUpperCase, text: "Include at least one uppercase letter (A-Z)" },
      { met: hasNumber, text: "Include at least one number (0-9)" },
      { met: hasSpecialChar, text: "Include at least one special character (!@#$%^&*)" },
      { met: isLongEnough, text: "Be at least 8 characters long" }
    ]
  };
};
