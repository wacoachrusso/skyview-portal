export function WelcomeMessage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <img 
          src="/lovable-uploads/017a86c8-ed21-4240-9134-bef047180bf2.png" 
          alt="SkyGuide Logo" 
          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
        />
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Welcome to Ask SkyGuide</h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto">
            Ask me anything about your contract and I'll help you understand it better.
          </p>
        </div>
      </div>
    </div>
  );
}