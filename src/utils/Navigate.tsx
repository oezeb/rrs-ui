/**
 * @module Navigate
 * 
 * This module provides a wrapper for react-router-dom's 
 * Navigate, Link, and useNavigate components.
 * When using these wrapped components, an additional 
 * `from` property is added to the navigation options state.
 * The from property can be utilized to redirect back to the previous page.
 */
import * as React from "react";
import { 
    useLocation,
    NavigateProps, LinkProps, To, NavigateOptions,
    useNavigate as useReactRouterNavigate, 
    Navigate as ReactRouterNavigate, 
    Link as ReactRouterLink, 
} from 'react-router-dom';

function Navigate(props: NavigateProps) {
  const location = useLocation();

    const data = {
        ...props,
        state: { ...props.state, from: location.pathname }
    };

  return <ReactRouterNavigate {...data} />;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
    const location = useLocation();

    const data = {
        ...props,
        state: { ...props.state, from: location.pathname }
    };

    return <ReactRouterLink {...data} ref={ref} />;
});

function useNavigate() {
    const navigate = useReactRouterNavigate();
    const location = useLocation();
  
    return (to: To, options?: NavigateOptions | undefined) => (
        navigate(to, {
            ...options,
            state: { ...options?.state, from: location.pathname }
        })
    );
}

export { useNavigate, Navigate, Link };
