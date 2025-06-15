import classes from './HolyGrailLayout.module.css';

type HolyGrailLayoutProps = React.HTMLAttributes<'div'>;

export function HolyGrailLayout(props: HolyGrailLayoutProps) {
  return <main className={classes['main-content']}>{props.children}</main>;
}
