const beforeLogin = [
    {
        name: 'Home',
        link: '/',
        icon: 'bi bi-house-door-fill'
    },
    {
        name: 'About',
        link: '/about',
        icon: 'bi bi-info-circle-fill'
    },
    {
        name: 'Contact',
        link: '/contact',
        icon: 'bi bi-telephone-fill'
    },
    {
        name: 'Login',
        link: '/login',
        icon: 'bi bi-box-arrow-in-right'
    },
    {
        name: 'Register',
        link: '/signup',
        icon: 'bi bi-person-plus-fill'
    }
]

const afterLogin = [
    {
        name: 'Home',
        link: '/',
        icon: 'bi bi-house-door-fill'
    },
    {
        name: 'My Profile',
        link: '/profile',
        icon: 'bi bi-person-fill'
    },
    {
        name: 'My Reviews',
        link: '/reviews',
        icon: 'bi bi-chat-left-fill'
    },
    {
        name: 'Settings',
        link: '/settings',
        icon: 'bi bi-gear-fill'
    },
    {
        name: 'Sign Out',
        link: '/logout',
        icon: 'bi bi-box-arrow-right'
    },
    {
        name: 'Contact Us',
        link: '/contact',
        icon: 'bi bi-telephone-fill'
    }


]

module.exports = { beforeLoginNav: beforeLogin, afterLoginNav: afterLogin }