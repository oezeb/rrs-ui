import React from 'react';
import { 
    useLocation,
    NavigateProps, LinkProps, To, NavigateOptions,
    useNavigate as useReactRouterNavigate, 
    Navigate as ReactRouterNavigate, 
    Link as ReactRouterLink, 
} from 'react-router-dom';

function useNavigate() {
  const navigate = useReactRouterNavigate();
  const location = useLocation();

  return (to: To, options?: NavigateOptions | undefined) => (
    navigate(to, {
        ...options,
        state: {
            ...options?.state,
            from: location.pathname
        }})
    );
}

function Navigate(props: NavigateProps) {
  const location = useLocation();

    const data = {
        ...props,
        state: {
            ...props.state,
            from: location.pathname
        }
    };

  return <ReactRouterNavigate {...data} />;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
    const location = useLocation();

    const data = {
        ...props,
        state: {
            ...props.state,
            from: location.pathname
        }
    };

    return <ReactRouterLink {...data} ref={ref} />;
});


export { useNavigate, Navigate, Link };
