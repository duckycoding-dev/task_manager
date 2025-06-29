import { Fragment } from 'react/jsx-runtime';
import { Navbar } from '../features/navigation/navbar/Navbar';
import { Header } from '../features/ui/header/Header';

type HolyGrailLayoutProps = React.HTMLAttributes<'div'>;

export function HolyGrailLayout(props: HolyGrailLayoutProps) {
  return (
    <Fragment>
      <Header className={'[grid-area:header]'}>
        <Navbar />
      </Header>
      <main
        className={'[grid-area:main-content] overflow-auto px-4 py-8 md:px-8'}
      >
        {props.children}
      </main>
    </Fragment>
  );
}
