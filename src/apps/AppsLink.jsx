import { useAppsRouter } from './appsRouter.js';

export function AppsLink({ href, onClick, children, ...rest }) {
  const { navigate } = useAppsRouter();

  const handleClick = (event) => {
    if (onClick) onClick(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      rest.target === '_blank'
    ) return;
    if (typeof navigate === 'function') {
      event.preventDefault();
      navigate(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
