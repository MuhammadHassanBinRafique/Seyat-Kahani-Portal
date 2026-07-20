# Seyat Khani Portal

## Project Overview
A web portal project with a frontend implementation and a planned Node.js/Express backend.

## Vision
Build a scalable portal with authentication, dashboards, and modular architecture.

## Features
- Responsive UI
- Multi-page navigation
- Reusable assets/components
- Ready for backend integration

## Functional Requirements
- Navigation between pages
- Forms and validation
- Authentication (planned)
- CRUD operations (planned)
- API integration (planned)

## Non-functional Requirements
- Responsive
- Maintainable
- Accessible
- Performance optimized

## UI Hierarchy
Home
- Authentication
- Dashboard
- Feature Pages
- Settings/Profile
- Footer

## Project Structure
```
Seyat Khani Portal/assests/
Seyat Khani Portal/assests/photos/
Seyat Khani Portal/assests/photos/doctor1.jpg
Seyat Khani Portal/assests/photos/doctor2.jpg
Seyat Khani Portal/assests/photos/doctor3.jpg
Seyat Khani Portal/assests/photos/login-bg-photo.png
Seyat Khani Portal/assests/photos/logo.png
Seyat Khani Portal/assests/photos/screen1.png
Seyat Khani Portal/assests/photos/sehat_kahani_patient_log_in.png
Seyat Khani Portal/assests/photos/sehat_kahani_patient_sign_up.png
Seyat Khani Portal/assests/photos/signup-visual-img.jpg
Seyat Khani Portal/CSS/
Seyat Khani Portal/CSS/appointment.css
Seyat Khani Portal/CSS/doctor-dashboard.css
Seyat Khani Portal/CSS/Health-vault.css
Seyat Khani Portal/CSS/medical-record.css
Seyat Khani Portal/CSS/patient.css
Seyat Khani Portal/CSS/patient-directory.css
Seyat Khani Portal/CSS/signup.css
Seyat Khani Portal/CSS/style.css
Seyat Khani Portal/HTML/
Seyat Khani Portal/HTML/appointment.html
Seyat Khani Portal/HTML/doctor-dashboard.html
Seyat Khani Portal/HTML/Health-vault.html
Seyat Khani Portal/HTML/index.html
Seyat Khani Portal/HTML/login.html
Seyat Khani Portal/HTML/medical-records.html
Seyat Khani Portal/HTML/patient-dashboard.html
Seyat Khani Portal/HTML/patient-directory.html
Seyat Khani Portal/HTML/sign-up.html
Seyat Khani Portal/JS/
Seyat Khani Portal/JS/app.js
Seyat Khani Portal/package.json
Seyat Khani Portal/package-lock.json
Seyat Khani Portal/server.js
```

## Total Pages
Detected HTML pages: **9**

- appointment.html
- doctor-dashboard.html
- Health-vault.html
- index.html
- login.html
- medical-records.html
- patient-dashboard.html
- patient-directory.html
- sign-up.html

## Design System

### Colors
#022019, #072019, #181c1b, #1c1c18, #24312b, #2C3E38, #2c4239, #324f46, #3f5a50, #40634f, #414845, #42644B, #4a675d, #4b645a, #4e6e58, #516a60, #5C8D89, #5c8d89, #6f7c74, #727975, #7FB685, #7fb685, #8C6D1F, #93000a, #9CADAF, #9cb19d, #9fb6a5, #B3261E, #D8E2DC, #D9E9DC, #E76F51, #E9C46A, #F1E6D2, #F9DEDC, #FAF9F6, #a9821f, #aecdc1, #b4c8b8, #ba1a1a, #c1c8c4, #c4e4d7, #c6b69f, #c9eadd, #cdbda7, #cde9dd, #d9cec2, #d9e4da, #dbe7de, #dce8df, #dfe3e0, #e0e3e1, #e5e2db, #e9c46a, #eceeed, #eef3ef, #f1efe8, #f1f4f2, #f2f5f0, #f5f0e8, #f6efdf, #f6f3ed, #f7f6f2, #f7f7f2, #f7faf8, #f8f8f4, #f9f3ea, #f9f6f0, #fbf6f1, #fbf8f3, #fbfbf8, #ffdad6, #fff, #fffdf8, #ffffff

### Fonts
Typography was standardized project-wide onto two Google Fonts, loaded via
`<link>` tags (with `preconnect` and `display=swap`) in every HTML page's
`<head>`, and exposed as CSS variables (`--font-primary`, `--font-secondary`)
in each stylesheet's `:root` block.

**Primary Font — Open Sans**
Used for body copy, paragraphs, forms, labels, inputs, tables, navigation,
sidebar, footer, cards, buttons, dropdowns, lists, modals, and general UI text.

**Secondary Font — Roboto**
Used for headings (H1–H6), hero titles, dashboard statistics, important
numbers, and major section titles.

| Element | Font | Weight |
|---|---|---|
| H1 / H2 | Roboto | 700 |
| H3 / H4 / H5 | Roboto | 600 |
| H6 | Roboto | 500 |
| Body / Small text | Open Sans | 400 |
| Buttons / Navigation / Labels / Badges | Open Sans | 600 |
| Table Headers | Roboto | 600 |
| Table Body / Inputs / Cards / Sidebar / Footer | Open Sans | 400 |

All previous font stacks (Arial, Helvetica, Georgia, Times New Roman,
Trebuchet MS, Courier New, -apple-system/Segoe UI system stacks) have been
replaced. `font-family: inherit` declarations were left as-is since they
correctly inherit the new fonts from their parent elements.

## Frontend Tech Stack
- HTML5
- CSS3
- JavaScript

## Planned Backend
- Node.js
- Express.js
- REST API
- MongoDB
- JWT Authentication
- bcrypt
- Multer
- dotenv

## Suggested Database
Users, Roles, Services, Bookings, Notifications, Settings.

## API Modules
- Auth
- Users
- Dashboard
- Content
- Uploads

## Development Phases

| Phase | Status |
|---|---|
| Planning | ✅ Completed |
| UI/UX Design | ✅ Completed |
| Frontend Layout | ✅ Completed |
| Responsive Polish | 🟡 Partial |
| Backend (Node/Express) | ⏳ Pending |
| Database | ⏳ Pending |
| Authentication | ⏳ Pending |
| API Integration | ⏳ Pending |
| Testing | ⏳ Pending |
| Deployment | ⏳ Pending |

Completed: **3/10** (estimated from uploaded frontend).

## User Flow
Landing → Login/Register → Dashboard → Feature Pages → Profile/Settings → Logout

## Coding Standards
- Modular folders
- Semantic HTML
- Reusable CSS/JS
- RESTful APIs
- Environment variables

## Local Preview Server
`server.js` is a minimal, zero-dependency static file server (built with Node's
built-in `http`/`fs` modules only). It serves the existing HTML/CSS/JS/assets
as-is so the frontend can be previewed at `http://localhost:3000/` without
opening files directly in the browser. It is **not** the planned Express/REST
backend described below — no routes, database, or authentication logic exist
yet. `package.json` currently has no dependencies; it only wires up the
`dev`/`start` scripts to run this preview server.

## Installation
```bash
npm install
npm run dev
```
Then open `http://localhost:3000/` to preview the frontend.

## Future Improvements
- Admin panel
- RBAC
- Email notifications
- Analytics
- PWA