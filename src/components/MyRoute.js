const MyRoute = ({ path, children }) => {
    return window.location.pathname === path ? children : null
}

export default MyRoute;