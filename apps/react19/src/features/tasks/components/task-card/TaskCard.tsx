import type { Task } from '@task-manager/backend/tasks';
import { cn } from '@task-manager/utils';

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  task: Task;
}

export function TaskCard({ task, className, ...props }: TaskCardProps) {
  return (
    <div className={cn('card card-border p-4', className)} {...props}>
      <a href={`/tasks/${task.id}`}>{task.title}</a>
    </div>
  );
}
