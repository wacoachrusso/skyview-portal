const AuthDivider = () => {
  return (
    <div className="flex items-center gap-3 text-gray-400 text-sm my-2">
      <hr className="flex-grow border-t border-white/10" />
      <span className="text-xs">OR</span>
      <hr className="flex-grow border-t border-white/10" />
    </div>
  );
};

export default AuthDivider;
