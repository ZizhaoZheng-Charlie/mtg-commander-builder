function LoadingOverlay({ loading }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-bg-primary/90 backdrop-blur-md flex flex-col justify-center items-center z-[9999]">
      <div className="w-[60px] h-[60px] border-4 border-white/10 border-t-magic-blue rounded-full animate-spin"></div>
      <p className="mt-4 text-text-primary text-lg">Loading...</p>
    </div>
  );
}

export default LoadingOverlay;
