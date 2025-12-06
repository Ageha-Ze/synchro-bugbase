import { FolderKanban } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
  return (
  <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-600">Get started with your bug tracking</p>
      </div>
    </div>

    <Link
      href="/projects"
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors w-fit"
    >
      <FolderKanban className="w-4 h-4" />
      View Projects
    </Link>
  </div>
)
}
