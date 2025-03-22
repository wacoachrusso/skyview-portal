
export function AppLoadingSpinner() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-luxury-dark">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-brand-purple/30 to-brand-gold/30 rounded-full blur-xl opacity-50 animate-pulse-subtle" />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent relative" />
      </div>
    </div>
  );
}
