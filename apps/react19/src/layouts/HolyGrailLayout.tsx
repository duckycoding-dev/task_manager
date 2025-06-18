import { Fragment } from 'react/jsx-runtime';
import { Navbar } from '../features/navigation/navbar/Navbar';
import classes from './HolyGrailLayout.module.css';
import { Header } from '../features/ui/header/Header';

type HolyGrailLayoutProps = React.HTMLAttributes<'div'>;

export function HolyGrailLayout(props: HolyGrailLayoutProps) {
  return (
    <Fragment>
      <Header className={classes['header']}>
        <Navbar title={'main navigation'} />
      </Header>
      <main className={classes['main-content']}>{props.children}</main>
    </Fragment>
  );
}
