# Seyat Khani Portal

## Live Demo
- Frontend: https://seyat-kahani-portal.vercel.app
- Backend API: https://seyat-kahani-portal-production.up.railway.app

## Project Overview
Seyat Khani Portal is a healthcare platform that combines a modern multi-page frontend with a secure Node.js/Express backend. The project supports patient and doctor authentication, role-based dashboard access, protected admin operations, and appointment management backed by MongoDB.

## Latest Updates
The project has moved beyond the initial mock-up stage and is now connected to production-hosted services:

- The frontend is deployed on Vercel and uses the live Railway backend for authentication and API calls.
- The backend is hosted on Railway with CORS configured for the live frontend and local development ports.
- The signup, login, and role-based redirect flows are fully connected between the frontend and backend.
- Patient and doctor dashboards are wired to protected API routes.
- Appointment booking, listing, status changes, and cancellation APIs are implemented and active.
- Doctor list and user-management endpoints are already available in the backend.
- Security measures include JWT protection, role checks, rate limiting, input validation, and MongoDB safeguards.

## Current Development Status

### Completed
- Responsive healthcare frontend with pages for home, about, login, sign-up, patient dashboard, doctor dashboard, appointments, health vault, medical records, and patient directory.
- Shared JavaScript for login and signup flows, form validation, password visibility toggling, token handling, role-based redirects, and dashboard interactions.
- Reusable healthcare styling system with branded colors, typography, and responsive UI components.
- Express.js backend using ES modules with environment-based configuration and middleware.
- MongoDB connection through Mongoose and environment variables.
- User schema with name, unique lowercase email, hashed password, role, and timestamps.
- Patient signup with duplicate-email checks and bcrypt hashing.
- Login flow with bcrypt verification and JWT issuance.
- Protected middleware for JWT verification and role-based authorization.
- Doctor/admin endpoints for listing users and deleting accounts.
- Appointment booking and management APIs for patient and doctor workflows.
- Doctor directory endpoint for viewing available physicians.
- User self-service endpoints for updating profile information and changing passwords.
- Seed script for creating initial doctor accounts.
- Development workflow using Nodemon.
- Live deployment setup for frontend and backend services.

### In Progress / Planned
- Full CRUD for medical records, vault files, notifications, and profile/settings modules.
- Improved analytics, dashboard summaries, and personalized patient/doctor data views.
- Refresh-token/session management and password reset workflows.
- Email verification and notification services.
- Automated testing and API documentation.
- Production-grade security hardening and deployment tuning.

## Vision
Build a scalable digital healthcare portal that streamlines patient access, doctor interactions, appointment scheduling, and secure health data management.

## Functional Requirements
- Navigation between portal pages.
- Responsive, accessible forms with client-side validation.
- Patient registration and login.
- Doctor login and secure JWT-based authentication.
- Role-aware redirects and dashboard access.
- Protected doctor/admin user management operations.
- MongoDB-backed persistence for users and appointments.
- API integration for authentication, doctor lookup, and appointment workflows.

## Non-functional Requirements
- Responsive UI.
- Maintainable and modular architecture.
- Secure password storage through bcrypt hashing.
- Environment-based configuration for database and JWT secrets.
- CORS and rate limiting for production safety.

## Project Structure
```text
assests/photos/       Frontend image and branding assets
Backend/              Node.js/Express API
  app.js               Express app and middleware configuration
  index.js             Server startup and database connection
  package.json         Backend scripts and dependencies
  src/
    config/            MongoDB connection setup
    controllers/       Auth, user, and appointment handlers
    middlewares/       JWT and role-based authorization
    models/            Mongoose schemas
    routes/            Auth, admin, doctor, user, and appointment routes
    script/            Database seed scripts
Frontend/
  CSS/                 Page-specific stylesheets
  HTML/                Frontend pages
  JS/                  Shared frontend logic and API integration
README.md             Project documentation
```

## Frontend Pages
- `index.html` - Landing page
- `about.html` - About page
- `login.html` - Patient/doctor login
- `sign-up.html` - Patient registration
- `patient-dashboard.html` - Patient dashboard
- `doctor-dashboard.html` - Doctor dashboard
- `appointment.html` - Appointment page
- `health-vault.html` - Health vault page
- `medical-records.html` - Medical records page
- `patient-directory.html` - Patient directory page

## Backend API
Production API base:
- https://seyat-kahani-portal-production.up.railway.app/api

Local development base:
- http://localhost:3000/api

### Authentication and User Management
| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/signup` | Create a patient account |
| `POST` | `/auth/login` | Verify credentials and return a JWT |
| `GET` | `/admin/Users` | List users for an authorized doctor |
| `DELETE` | `/admin/Users/:id` | Delete a user for an authorized doctor |
| `GET` | `/doctors` | View all doctors |
| `PATCH` | `/users/me` | Update logged-in user's profile |
| `PATCH` | `/users/me/password` | Update logged-in user's password |
| `DELETE` | `/users/me` | Delete logged-in user's account |

### Appointment API
| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/appointments` | Book an appointment |
| `GET` | `/appointments/my` | Get logged-in user's appointments |
| `GET` | `/appointments/:id` | Get a single appointment |
| `PATCH` | `/appointments/:id/status` | Update appointment status |
| `DELETE` | `/appointments/:id` | Cancel a pending appointment |

Protected routes require an `Authorization: Bearer <token>` header.

## Backend Tech Stack
- Node.js
- Express.js
- Mongoose / MongoDB
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- CORS
- Helmet
- Express Rate Limit
- dotenv
- Nodemon

## Environment Configuration
Create a `Backend/.env` file with values similar to the following:

```env
PORT=5000
MONGODB_URI=000000000000000000
JWT_SECRET_KEY=000000000000000
```

## Installation and Development
```bash
cd Backend
npm install
npm run dev
```

The backend can run locally on the configured port, and the frontend is configured to call the deployed production backend by default.

To seed the initial doctor accounts:

```bash
cd Backend
node src/script/createAdmin.js
```

## Design System

### Colors
The project uses a green, healthcare-focused palette with warm accent tones for buttons and highlights.

### Fonts
Typography is standardized across pages using Google Fonts, with Open Sans for general text and Roboto for headings and emphasis.

## Current Status by Phase
| Phase | Status |
|---|---|
| Planning | ✅ Completed |
| UI/UX Design | ✅ Completed |
| Frontend Layout | ✅ Completed |
| Responsive Polish | ✅ Mostly complete |
| Backend (Node/Express) | ✅ Core implementation complete |
| Database (MongoDB/Mongoose) | ✅ User and appointment data implemented |
| Authentication | ✅ Signup, login, and JWT auth complete |
| API Integration | ✅ Core flows implemented |
| Testing | ⏳ Pending |
| Deployment | ✅ Live frontend + backend deployed |

## User Flow
Landing → Login/Register → Dashboard → Feature Pages → Appointments → Logout

## Coding Standards
- Modular folders
- Semantic HTML
- Reusable CSS and JavaScript
- RESTful API design
- Environment-based configuration
- Role-based access enforcement

## Future Improvements
- Complete admin panel workflows and expanded RBAC rules
- Medical records and vault file upload handling
- Notification and email systems
- More advanced dashboard analytics
- User profile/settings pages
- Automated integration tests and API documentation
- Additional security hardening and monitoring
