import React from 'react';
import {
    Header,
    HeaderMenuButton,
    HeaderMenuItem,
    HeaderName,
    HeaderNavigation,
    SideNav,
    SideNavItems,
} from '@carbon/react';

type Props = {
    children: React.ReactNode;
};

export const MainLayout = (props: Props) => {
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <>
            <Header>
                <HeaderMenuButton
                    isActive={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                />
                <HeaderName prefix='Yukako'></HeaderName>
                <HeaderNavigation>
                    <HeaderMenuItem href='/'>Home</HeaderMenuItem>
                    <HeaderMenuItem href='/about'>About</HeaderMenuItem>
                    <HeaderMenuItem href='/contact'>Contact</HeaderMenuItem>
                </HeaderNavigation>
                <SideNav expanded={menuOpen} isPersistent={false}>
                    <SideNavItems>
                        <HeaderMenuItem href='/'>Home</HeaderMenuItem>
                        <HeaderMenuItem href='/about'>About</HeaderMenuItem>
                        <HeaderMenuItem href='/contact'>Contact</HeaderMenuItem>
                    </SideNavItems>
                </SideNav>
            </Header>
            <main>{props.children}</main>
        </>
    );
};
