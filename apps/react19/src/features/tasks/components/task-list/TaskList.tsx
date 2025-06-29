import type { Task } from '@task-manager/backend/tasks';
import { TaskCard } from '../task-card/TaskCard';
import { cn } from '@task-manager/utils';

interface TaskListProps extends React.HTMLAttributes<HTMLUListElement> {
  tasks: Task[];
}

export function TaskList({ tasks, title, className, ...props }: TaskListProps) {
  return (
    <ul
      {...props}
      title={title ?? 'task list'}
      className={cn('flex flex-col gap-4', className)}
    >
      {tasks.map((task) => (
        <li
          key={task.id}
          className={'list-none p-2 border border-secondary border-r-4'}
        >
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}
