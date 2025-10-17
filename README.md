<p align="center">
  <img src="/public/favicon.svg" width="50" alt="Logo" />
</p>
<h1 align="center">Personal Portfolio</h1>

[![Site preview](/public/site-preview.png)](https://me.mashiro.best)

## Project Introduction

This is my personal portfolio website, showcasing my projects and skills. The site features:

- Interactive 3D background animations
- Responsive design for all devices
- Project showcases with detailed case studies
- Contact form integration
- Dark/Light theme support

## My Customizations & Contributions

I've made several enhancements to make this portfolio more maintainable:

- Enhanced configuration structure for easier setup
- Integrated EmailJS for modern contact form functionality
- Streamlined environment variable management
- Simplified deployment configuration

## Tech Stack

Built with modern web technologies:

- [React Router](https://reactrouter.com/) - Declarative routing for React
- [Three.js](https://threejs.org/) - 3D graphics library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- Cloudflare Pages for hosting

## Installation & Development

Requires:

- Node.js `19.9.0` or higher
- npm `9.6.3` or higher

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook
npm run dev:storybook

# format codebase
npm run format

# Lint (oxlint first, then ESLint with Google TS config)
npm run lint

# Autofix lint issues
npm run lint:ox:fix
npm run lint:eslint:fix
```

## Deployment

Deploy to Cloudflare Pages:

```bash
npm run deploy
```

## Environment Setup

1. Copy .dev.vars.example to .dev.vars
2. Configure your environment variables
3. Add the same variables to Cloudflare Dashboard for production

## Credits

This portfolio is based on the original design by Hamish Williams . While I've made substantial customizations, the core design concept and structure were created by him.

## License & Usage

While this code is open source, please:

- Credit the original designer (Hamish Williams) if using the design largely unmodified
- Make the theme and components your own through modifications
- Do not present the included projects as your own work

## FAQs

How do I change the DisplacementSphere colors?

Edit the fragment shader as detailed in the original issue .

How do I set up the contact form?

The contact form uses EmailJS for email functionality:

1. Create an account at EmailJS
2. Set up an email template and service
3. Copy .dev.vars.example to .dev.vars
4. Fill in your EmailJS credentials:
   - SERVICE_ID: Your EmailJS service ID
   - TEMPLATE_ID: Your email template ID
   - USER_ID: Your EmailJS user ID
   - ACCESSTOKEN: Your EmailJS access token
5. Add these same variables to your Cloudflare Pages environment variables for production
