# Kainat Tutorials

An original, responsive public website for Kainat Tutorials. The visual direction takes broad inspiration from minimalist editorial web design; no Magic Portfolio code, assets or components are copied.

## Current build

- Responsive landing page for Mathematics tutoring and learning resources
- Online and offline learning options
- Program sections for live classes, one-to-one tuition, group tuition and recorded courses
- School-level and board information
- Learning approach, resource overview, FAQs and enquiry form
- Mobile navigation and accessible form feedback
- Basic SEO metadata and reduced-motion support

## Free static hosting

This first release is a static website and can be hosted on Cloudflare Pages using the free `*.pages.dev` subdomain.

1. Open Cloudflare Dashboard → Workers & Pages.
2. Select Create → Pages → Connect to Git.
3. Select `azzysocialhub/kainat-tutorials`.
4. Production branch: `main`.
5. Framework preset: None.
6. Build command: leave blank.
7. Build output directory: `/` (repository root).
8. Save and deploy.

The site is plain HTML, CSS and JavaScript; no build step or paid package is required.

## Configure enquiries

Edit `site-config.js` and set `whatsappNumber` to the official WhatsApp Business number in international digits-only format, e.g. India country code + number. The enquiry form then prepares a WhatsApp message. Until this is configured, the form displays a clear setup message rather than pretending to submit.

## Before public launch

- Replace the temporary text-based brand mark with the official Kainat Tutorials logo.
- Confirm official phone/WhatsApp details and offline centre address (if public).
- Confirm class availability, board coverage, timings, teacher profile and course catalogue.
- Add a privacy notice and guardian/parent contact process before collecting student information.
- Test the live site on mobile and desktop.

## Planned next phases

1. Supabase-backed enquiry storage and student authentication.
2. Admin-managed courses, study materials and student dashboard.
3. Secure payment checkout and server-side payment verification before granting course access.

Do not store API secrets in browser JavaScript. Payment unlocks must be verified on a trusted server or secure backend function; a frontend success redirect alone is not proof of payment.

## Licence

This is an original Kainat Tutorials implementation. Third-party fonts are loaded from Google Fonts; their own licences and service terms apply.