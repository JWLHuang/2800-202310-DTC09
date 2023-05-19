const footerLinks = [
    { name: 'About Us', link: '/about' },
    { name: 'Contact Us', link: '/contact' },
    { name: 'Privacy Policy', link: '/privacy' },
    { name: 'Terms & Conditions', link: '/terms' }
]

const socialLinks = [
    { name: 'bi bi-facebook h1 text-light p-2', link: '#' },
    { name: 'Twitter', link: '#' },
    { name: 'bi bi-instagram h1 text-light p-2', link: '#' },
    { name: 'bi bi-twitter h1 text-light p-2', link: '#' }
]

const mobileLinks = [
    { name: 'Home', icon: 'bi bi-house-door-fill', link: '/' },
    { name: 'Map', icon: 'bi bi-map-fill', link: '/map' },
    { name: 'Plan', icon: 'bi bi-calendar-fill', link: '/filterRestaurants' },
]

module.exports = { footerLinks: footerLinks, socialLinks: socialLinks, mobileLinks: mobileLinks }
