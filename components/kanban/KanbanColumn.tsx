import { Bug } from "@/types";


interface Props {
  title: string;
  bugs: Bug[];
}

export const KanbanColumn = ({ title, bugs }: Props) => {
  return (
    <div className="border rounded p-2 bg-gray-50">
      <h3 className="font-semibold mb-2">{title}</h3>
      {bugs.map(bug => (
        <div key={bug.id} className="mb-2 p-2 bg-white rounded shadow">
          <strong>{bug.title}</strong>
          <div className="text-sm text-gray-500">{bug.severity} / {bug.priority}</div>
        </div>
      ))}
    </div>
  );
};
