export function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-16 w-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-white">Welcome to SkyGuide Contract Assistant</h1>
        </div>
        <p className="text-gray-300">
          I'm here to help you understand your union contract. Please ask any questions you have about your contract.
        </p>
      </div>
    </div>
  );
}