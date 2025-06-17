import type { Task } from '@task-manager/backend/tasks';

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div>
      <a href={`/tasks/${task.id}`}>{task.title}</a>
    </div>
  );
}
