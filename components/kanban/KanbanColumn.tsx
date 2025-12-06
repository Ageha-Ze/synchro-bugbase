import { Bug } from "@/lib/bugs";


interface Props {
  title: string;
  bugs: Bug[];
}

export const KanbanColumn = ({ title, bugs }: Props) => {
  return (
    <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
      {bugs.map(bug => (
        <div key={bug.id} className="mb-2 p-2 bg-white dark:bg-gray-700 rounded shadow">
          <strong className="text-gray-900 dark:text-gray-100">{bug.title}</strong>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {bug.severity || 'N/A'} / {bug.priority || 'N/A'}
          </div>
        </div>
      ))}
    </div>
  );
};