import { Link } from '@tanstack/react-router';
import classes from './HolyGrailLayout.module.css';

type HolyGrailLayoutProps = React.HTMLAttributes<'div'>;

export function HolyGrailLayout(props: HolyGrailLayoutProps) {
  return (
    <main className={classes['main-content']}>
      <Link to='/'>Home</Link>
      <hr className={classes.hr} />
      {props.children}
    </main>
  );
}
