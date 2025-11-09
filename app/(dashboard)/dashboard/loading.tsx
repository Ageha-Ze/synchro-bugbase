export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fadeInUp">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-4 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
