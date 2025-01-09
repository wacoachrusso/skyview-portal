interface PendingSignup {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
  plan: string;
  assistantId?: string | null;
}

export const storePendingSignup = (signupData: PendingSignup) => {
  console.log('Storing pending signup data for:', signupData.email);
  localStorage.setItem('pendingSignup', JSON.stringify(signupData));
};

export const clearPendingSignup = () => {
  console.log('Clearing pending signup data');
  localStorage.removeItem('pendingSignup');
};