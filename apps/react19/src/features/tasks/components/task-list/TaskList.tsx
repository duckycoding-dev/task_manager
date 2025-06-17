import type { Task } from '@task-manager/backend/tasks';
import classes from './task-list.module.css';
import { TaskCard } from '../task-card/TaskCard';

interface TaskListProps extends React.HTMLAttributes<HTMLUListElement> {
  tasks: Task[];
}

export function TaskList({ tasks, title, className, ...props }: TaskListProps) {
  return (
    <ul
      {...props}
      title={title ?? 'task list'}
      className={`${classes['task-list']} ${className ?? ''}`}
    >
      {tasks.map((task) => (
        <li key={task.id} className={classes['task-item']}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}
