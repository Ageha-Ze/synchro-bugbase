import { Layers, Bug, Info, CheckCircle } from 'lucide-react'

export default function DashboardStats({ stats }: { stats: any }) {
  const { projects, totalBugs, openBugs, closedBugs } = stats

  const card = (icon: any, title: string, value: number, desc: string) => (
    <div className="flex flex-col border rounded-xl bg-white p-4 w-full shadow-sm">
      <div className="flex items-center gap-2 text-gray-700 mb-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <span className="text-5xl font-bold">{value}</span>
      <span className="text-xs text-gray-500 mt-2">{desc}</span>
    </div>
  )

  return (
    <div className="grid grid-cols-4 gap-4">
      {card(<Layers className="w-4 h-4" />, 'Total Projects', projects, 'Active project workspaces')}
      {card(<Bug className="w-4 h-4" />, 'Total Bugs', totalBugs, 'All bug reports')}
      {card(<Info className="w-4 h-4" />, 'Open Bugs', openBugs, 'Requiring attention')}
      {card(<CheckCircle className="w-4 h-4" />, 'Closed Bugs', closedBugs, 'Resolved issues')}
    </div>
  )
}
