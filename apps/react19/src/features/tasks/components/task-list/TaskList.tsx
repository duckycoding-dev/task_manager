import type { Task } from '@task-manager/backend/tasks';
import { cn } from '@task-manager/utils';

import { TaskCard } from '../task-card/TaskCard';

interface TaskListProps extends React.HTMLAttributes<HTMLUListElement> {
  tasks: Task[];
}

export function TaskList({ tasks, title, className, ...props }: TaskListProps) {
  return (
    <ul
      {...props}
      title={title ?? 'task list'}
      className={cn('list flex flex-col gap-4', className)}
    >
      {tasks.map((task) => (
        <li key={task.id} className={'list-none'}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}
