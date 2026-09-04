# Seyat Khani Portal

## Project Overview
A healthcare portal with a multi-page frontend and a Node.js/Express backend. The current implementation includes patient and doctor authentication, MongoDB persistence, protected doctor routes, dashboards, and healthcare feature pages.

## Current Development Status

### Completed
- Responsive HTML/CSS frontend with 10 pages: home, about, login, sign-up, patient dashboard, doctor dashboard, appointments, health vault, medical records, and patient directory.
- Shared frontend JavaScript for login and registration requests, client-side validation, password visibility controls, authentication state storage, logout, date/progress interactions, tabs, pagination states, and small UI interactions.
- Shared visual assets, healthcare imagery, branding, responsive layouts, Google Fonts, accessible labels, and inline server-error areas in the authentication forms.
- Node.js backend using Express with ES modules.
- CORS and JSON request-body parsing.
- MongoDB connection through Mongoose using environment variables.
- User model with name, unique lowercase email, hashed password, role, and timestamps.
- Patient signup with duplicate-email detection and bcrypt password hashing.
- Login with bcrypt password verification and JWT creation containing user ID and role.
- JWT protection middleware and role-authorization middleware.
- Doctor administration endpoints for listing users without passwords and deleting users.
- Seed script for creating initial doctor accounts.
- Backend development workflow using Nodemon.

### In Progress or Planned
- Connect appointment booking, health vault, medical records, and patient-directory screens to backend APIs.
- Add complete CRUD APIs for appointments, records, vault files, notifications, and profile/settings data.
- Add refresh-token/session management, password reset, email verification, and production-grade validation/rate limiting.
- Complete role-based access control and doctor/patient dashboard authorization.
- Add automated tests, API documentation, deployment configuration, and production security hardening.

## Vision
Build a scalable healthcare portal with authentication, dashboards, medical records, appointments, and modular architecture.

## Functional Requirements
- Navigation between portal pages.
- Responsive forms with client-side validation.
- Patient account registration and login.
- Doctor login and JWT-based authentication.
- Role-aware dashboard redirects.
- Protected doctor user-management operations.
- MongoDB-backed user persistence.
- API integration for implemented authentication flows.

## Non-functional Requirements
- Responsive.
- Maintainable and modular.
- Accessible form labels and status messages.
- Secure password storage through bcrypt hashing.
- Environment-based configuration for database and JWT settings.

## UI Hierarchy
Home
- Authentication
- Patient Dashboard
- Doctor Dashboard
- Feature Pages
- Profile/Settings (planned)
- Footer

## Project Structure
```
assests/photos/       Frontend images and branding assets
Backend/              Node.js/Express API
	app.js              Express app and route registration
	index.js            Database connection and server startup
	package.json        Backend scripts and dependencies
	src/config/         MongoDB connection
	src/controllers/    Authentication handlers
	src/middlewares/    JWT and role authorization
	src/models/         Mongoose models
	src/routes/         Authentication and admin routes
	src/script/         Database seed scripts
CSS/                  Page-specific and shared stylesheets
HTML/                 10 frontend pages
JS/app.js             Shared frontend behavior and API calls
README.md             Project documentation
```

## Pages
- `index.html` - Landing page
- `about.html` - About page
- `login.html` - Patient/doctor login
- `sign-up.html` - Patient registration
- `patient-dashboard.html` - Patient dashboard
- `doctor-dashboard.html` - Doctor dashboard
- `appointment.html` - Appointment page
- `Health-vault.html` - Health vault page
- `medical-records.html` - Medical records page
- `patient-directory.html` - Patient directory page

## Backend API

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/signup` | Create a patient account |
| `POST` | `/auth/login` | Verify credentials and return a JWT |
| `GET` | `/admin/Users` | List users for an authorized doctor |
| `DELETE` | `/admin/Users/:id` | Delete a user for an authorized doctor |

The admin endpoints require an `Authorization: Bearer <token>` header. The current middleware implementation expects the lowercase `bearer` prefix, and the admin route currently checks `doctor` while user records store `Doctor`; this authorization mismatch remains to be fixed.

## Backend Tech Stack
- Node.js
- Express.js
- Mongoose/MongoDB
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- CORS
- dotenv
- Nodemon for development

## Environment Configuration
Create `Backend/.env` with the required local values:

```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET_KEY=your-secret-key
```

Do not commit `.env` or expose database credentials and JWT secrets. The backend currently listens on port `3000` because its startup code hard-codes that value; the port configuration should be corrected before relying on `PORT`.

## Installation and Development
```bash
cd Backend
npm install
npm run dev
```

The API is then available at `http://localhost:3000`. Open `HTML/index.html` through a frontend static server or VS Code Live Server. The frontend authentication code currently calls `http://localhost:3000/api/auth`.

To seed the initial doctor accounts, run the seed script from the `Backend` directory after configuring MongoDB:

```bash
node src/script/createAdmin.js
```

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

## Planned API Expansion
- Appointments and bookings
- Medical records and health-vault files
- Notifications
- Profile and settings
- Dashboard data
- Upload handling (Multer or equivalent)

## Development Phases

| Phase | Status |
|---|---|
| Planning | ✅ Completed |
| UI/UX Design | ✅ Completed |
| Frontend Layout | ✅ Completed |
| Responsive Polish | 🟡 Partial |
| Backend (Node/Express) | 🟡 Initial implementation |
| Database (MongoDB/Mongoose) | 🟡 User data implemented |
| Authentication | 🟡 Signup/login implemented |
| API Integration | 🟡 Authentication flows implemented |
| Testing | ⏳ Pending |
| Deployment | ⏳ Pending |

The project is beyond the initial frontend-only phase. Authentication and user administration are implemented, while feature-page APIs, testing, deployment, and production hardening remain.

## User Flow
Landing → Login/Register → Dashboard → Feature Pages → Profile/Settings → Logout

## Coding Standards
- Modular folders
- Semantic HTML
- Reusable CSS/JS
- RESTful APIs
- Environment variables

## Future Improvements
- Complete admin panel workflows and RBAC.
- Add email notifications and verification.
- Add analytics and PWA support.