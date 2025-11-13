export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 animate-fadeInUp transition-colors duration-300">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-4 border-4 border-indigo-300 dark:border-indigo-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin transition-colors duration-300"></div>
        <p className="text-gray-500 dark:text-gray-300 text-sm font-medium animate-pulse transition-colors duration-300">
          Loading Reports...
        </p>
      </div>
    </div>
  );
}
