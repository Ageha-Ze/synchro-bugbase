import { FolderKanban } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
  return (
  <div className="mt-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 border border-blue-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Quick Actions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Get started with your bug tracking</p>
      </div>
    </div>

    <Link
      href="/projects"
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all duration-200 shadow-sm w-fit"
    >
      <FolderKanban className="w-4 h-4" />
      View Projects
    </Link>
  </div>
)
}