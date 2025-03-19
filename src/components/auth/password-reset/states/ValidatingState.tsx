
export const ValidatingState = () => {
  return (
    <>
      <h1 className="text-xl font-semibold text-white mb-4">Validating Reset Link</h1>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
      <p className="mt-4 text-gray-400">Please wait while we verify your reset link...</p>
    </>
  );
};
