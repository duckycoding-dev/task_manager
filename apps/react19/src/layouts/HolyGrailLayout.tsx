import { Link } from '@tanstack/react-router';

type HolyGrailLayoutProps = React.HTMLAttributes<'div'>;

export function HolyGrailLayout(props: HolyGrailLayoutProps) {
  return (
    <main>
      <div className='p-2 flex gap-2'>
        <Link to='/' className='[&.active]:font-bold'>
          Home
        </Link>{' '}
      </div>
      <hr />
      <h1>Pathless layout</h1>
      {props.children}
    </main>
  );
}
