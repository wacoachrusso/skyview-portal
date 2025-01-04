export function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white">Welcome to SkyGuide Contract Assistant</h1>
        <p className="text-gray-300 mt-4">
          I'm here to help you understand your union contract. Please ask any questions you have about your contract.
        </p>
      </div>
    </div>
  );
}