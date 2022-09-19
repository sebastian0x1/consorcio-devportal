import { Navigate, Outlet } from 'react-router-dom'

export default function PrivateRouter({isAdmin}) {
    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return isAdmin ? <Outlet /> : <Navigate to="/apis" />
}