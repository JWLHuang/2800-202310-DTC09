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
        name: 'Find A Restaurant',
        link: '/filterRestaurants',
        icon: 'bi bi-search'
    },
    {
        name: 'Restaurant Map',
        link: '/map',
        icon: 'bi bi-map-fill'
    },
    {
        name: 'My Profile',
        link: '/profile',
        icon: 'bi bi-person-fill'
    },
    {
        name: 'My Reviews',
        link: '/myReviews',
        icon: 'bi bi-chat-left-fill'
    },
    {
        name: 'My History',
        link: '/history',
        icon: 'bi bi-clock-history'
    },
    {
        name: 'Contact Us',
        link: '/contact',
        icon: 'bi bi-telephone-fill'
    },
    {
        name: 'About Us',
        link: '/about',
        icon: 'bi bi-info-circle-fill'
    },
    {
        name: 'Sign Out',
        link: '/logout',
        icon: 'bi bi-box-arrow-left'
    },


]

module.exports = { beforeLoginNav: beforeLogin, afterLoginNav: afterLogin }