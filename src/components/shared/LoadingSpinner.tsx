export const LoadingSpinner = () => {
  console.log('LoadingSpinner rendered - route transition in progress');
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-gold"></div>
    </div>
  );
};