import React from 'react';
import { Menu, Image, Dropdown, MenuItem } from 'semantic-ui-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { connect } from "react-redux";

import MenuLink from './MenuLink'
import { logout } from '../services/self';

function NavBar({
    email,
    isAdmin,
    isADUser
}) {
    const navigate = useNavigate();
    const handleLogout = () => logout()
    const handleChangePassword = () => {
        navigate(`/changepassword/${email}` )
    }
        
    return (
        <>
        <Menu inverted borderless attached style={{ flex: '0 0 auto' }} stackable>
            <MenuLink to={null}>
                <Image size='mini' src='/custom-content/nav-logo.png' style={{ paddingRight: '10px' }} />
                Consorcio Seguros
            </MenuLink>
            <MenuLink to='/apis'>APIs</MenuLink>
            <Menu.Menu position='right'>
                {isAdmin && <MenuLink to='/config'>Configuración</MenuLink>}
                {isADUser ?
                    <>
                        <MenuItem>{email}</MenuItem>
                        <MenuLink onClick={handleLogout}>Salir</MenuLink>                                        
                    </>
                    :
                    <MenuLink>
                        <Dropdown text={email}>
                            <Dropdown.Menu>                            
                                <Dropdown.Item text='Cambiar Contraseña'onClick={handleChangePassword} />
                                <Dropdown.Item text='Salir' onClick={handleLogout} />
                            </Dropdown.Menu>
                        </Dropdown>
                    </MenuLink> 
                }
            </Menu.Menu>
        </Menu>
        <Outlet/>
        </>
    );
}


function mapState(state){
    return {
        email: state.auth.email,
        isAdmin: state.auth.isAdmin,
        isADUser: state.auth.isADUser,
    }
}

const NavBarWrapped = connect(
  mapState,
  null
)(NavBar);

export default NavBarWrapped
