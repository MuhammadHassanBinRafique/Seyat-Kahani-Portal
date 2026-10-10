

# live preview:
                https://seyat-kahani-portal.vercel.app

# Seyat Khani Portal

Seyat Kahani Portal is a healthcare web application for connecting patients
and doctors. It provides authentication, role-based dashboards, appointment
management, patient lookup, and medical-record workflows.

## Features

### Authentication and accounts

- Patient account registration and login.
- Google sign-in through server-side ID-token verification.
- JWT-based authentication for protected operations.
- Role-aware access for patients and doctors.
- Profile retrieval and name updates.
- Password changes for password-based accounts.
- Account deletion, including re-authentication support for Google-only users.
- Rate limiting on authentication requests.

### Patient features

- Patient dashboard and profile information.
- Browse available doctors.
- Book appointments with a doctor.
- View appointment details and personal appointment history.
- Cancel pending appointments.
- View personal medical records.

### Doctor features

- Doctor dashboard and profile information.
- View assigned patients.
- View and manage appointments.
- Confirm, cancel, or complete appointments.
- Hide an appointment and undo that action when supported by the workflow.
- Create medical records for patients.
- Access protected user-management operations.

### Platform and security

- Responsive, multi-page frontend.
- Express API with MongoDB persistence through Mongoose.
- Password hashing with bcrypt.
- JWT and role-based authorization middleware.
- Helmet security headers.
- CORS restrictions.
- Request validation and MongoDB identifier validation.
- Centralized error responses for protected operations.

## Project status

The core authentication, user, doctor, appointment, patient, and medical-record
workflows are implemented. The frontend is connected to the backend through
shared JavaScript helpers and protected requests.

The following areas remain suitable for future work:

- Automated unit, integration, and end-to-end tests.
- API documentation and a generated schema.
- Refresh-token or server-side session management.
- Password reset and email-verification workflows.
- Notifications and email delivery.
- Medical-record attachments and health-vault file handling.
- Expanded analytics, settings, and administrative workflows.
- Additional production monitoring and security hardening.

## Technology stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Google Fonts

### Backend

- Node.js
- Express
- MongoDB and Mongoose
- JSON Web Tokens
- bcryptjs
- Google Authentication Library
- Helmet
- CORS
- Express Rate Limit
- dotenv
- Nodemon for development

## Repository structure

```text
assests/photos/              Images and branding assets
Backend/
  app.js                     Express application and middleware
  index.js                   Local server startup
  package.json               Backend scripts and dependencies
  src/
    config/                  Database connection
    controllers/             Authentication and domain controllers
    middlewares/             JWT and role authorization
    models/                  User, appointment, and medical-record schemas
    routes/                  Authentication and domain routes
    script/                  Local database utilities
    utils/                   Authentication helpers
Frontend/
  CSS/                       Page-specific stylesheets
  HTML/                      Frontend pages
  JS/                        Shared UI and API integration logic
README.md                   Project documentation
```

The `assests` directory name is retained to match the existing repository
layout.

## Frontend pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page |
| `about.html` | About the portal |
| `login.html` | Patient, doctor, and Google sign-in |
| `sign-up.html` | Patient registration |
| `patient-dashboard.html` | Patient overview and actions |
| `doctor-dashboard.html` | Doctor overview and actions |
| `appointment.html` | Appointment browsing and management |
| `health-vault.html` | Health-vault interface |
| `medical-records.html` | Medical-record display |
| `patient-directory.html` | Doctor-facing patient directory |

## Backend capabilities

The backend organizes its API into the following route groups:

- Authentication and Google sign-in.
- Doctor discovery.
- Current-user profile and account management.
- Patient directory access for doctors.
- Appointment creation, retrieval, status changes, cancellation, and
  doctor-side hide/undo actions.
- Medical-record creation and retrieval.
- Doctor-authorized user management.

Protected operations require a valid bearer JWT in the request authorization
header. Do not copy real tokens into source files, documentation, screenshots,
or issue reports.

## Local development

### Prerequisites

- A current Node.js LTS release.
- npm.
- A MongoDB database available to the local backend.
- OAuth configuration if Google sign-in is enabled.

### Backend setup

1. Open a terminal in the `Backend` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file from your private configuration source.
   Do not commit this file. It must contain the database, JWT, server-port,
   and optional Google OAuth settings required by the backend.
4. Start the development server:

   ```bash
   npm run dev
   ```

For a non-watching local start, use:

```bash
npm start
```

The application uses the configured port and falls back to its code-defined
development default when no port is supplied. The frontend's API base settings
must point to the backend instance you are running; keep that value in local
configuration rather than documenting a deployed host here.

### Frontend setup

The frontend is a static set of HTML, CSS, and JavaScript files. Open the
frontend through a local static-file server rather than relying on browser
`file://` behavior. Configure the frontend API base for the local backend
without committing the value if it differs between environments.

For example, any simple static server that is already available in your
development environment can serve the repository's frontend files. No
frontend package installation is required by the current project structure.

### Seed data

The backend includes a script for creating an initial doctor account. Run it
only against a local or explicitly selected development database, and provide
the account values interactively or through your private environment
configuration:

```

Never use shared, real, or production credentials in seed data.

## Request and authorization model

- Public authentication actions create or verify a user session token.
- The frontend stores the token for the active session and sends it only in
  protected requests.
- The backend verifies the token before reading or changing protected data.
- Role middleware limits doctor-only and patient-only operations.
- Users can access their own account and patient data according to the
  controller and route authorization rules.
- Passwords are never stored in plaintext and are excluded from normal user
  list responses.

## Data model overview

- **User:** name, unique lowercase email, hashed password when applicable,
  role, and timestamps.
- **Appointment:** patient, doctor, date, time, reason, status, and optional
  doctor-side deletion metadata.
- **Medical record:** patient, doctor, optional appointment, diagnosis, notes,
  prescription, and timestamps.

Appointments use a doctor/date/time index to help prevent duplicate bookings.
User input is trimmed and bounded where the model defines maximum lengths.

## Design system

The interface uses a green, healthcare-oriented palette with warm accent
colors for actions and highlights. Shared typography uses Open Sans for body
text and Roboto for headings and emphasis. Styles are divided between shared
and page-specific CSS files.

## Development conventions

- Keep frontend concerns in the `Frontend` directory.
- Keep backend routes, controllers, models, and middleware separated.
- Reuse the existing authentication and authorization middleware.
- Use environment-based configuration for all deployment-specific values.
- Never commit environment files, credentials, tokens, or database URLs.
- Validate authorization and ownership in the backend; do not rely on frontend
  visibility alone.
- Run the backend's available development commands before submitting changes.

## Roadmap

- Add automated test coverage for authentication and role boundaries.
- Document the API contract without publishing deployment credentials or hosts.
- Add refresh-token/session lifecycle management.
- Add password reset, email verification, and notifications.
- Expand medical records and health-vault storage.
- Improve accessibility, analytics, monitoring, and operational security.
