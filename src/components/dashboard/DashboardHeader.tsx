interface DashboardHeaderProps {
  userEmail: string;
  isLoading: boolean;
  handleSignOut: () => Promise<void>;
  isAdmin?: boolean;
}

export function DashboardHeader({ userEmail, isLoading, handleSignOut, isAdmin }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      <div className="flex items-center">
        <span className="text-sm text-gray-500">{userEmail}</span>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className={`ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-opacity ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </header>
  );
}