import { cn } from '@task-manager/utils';
import { createLink, type LinkComponent } from '@tanstack/react-router';

// followed the example from https://tanstack.com/router/latest/docs/framework/react/guide/custom-link

interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  // Add any additional props you want to pass to the anchor element
}

const BasicLinkComponent = ({ className, ...props }: BasicLinkProps) => {
  return <a {...props} className={cn('link', className)} />;
};

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const StyledLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />;
};
