import { Fragment } from 'react/jsx-runtime';
import { Navbar } from '../features/navigation/navbar/Navbar';
import classes from './HolyGrailLayout.module.css';

type HolyGrailLayoutProps = React.HTMLAttributes<'div'>;

export function HolyGrailLayout(props: HolyGrailLayoutProps) {
  return (
    <Fragment>
      <header className={classes['header']}>
        <Navbar title={'main navigation'} />
      </header>
      <main className={classes['main-content']}>{props.children}</main>
    </Fragment>
  );
}
