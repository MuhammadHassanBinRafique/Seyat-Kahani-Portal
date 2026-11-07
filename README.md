


# Seyat Kahani Portal

Seyat Kahani Portal is a healthcare web application that connects patients and
doctors through authenticated dashboards, appointment scheduling, medical
records, and a private Health Vault for patient documents.

The project is a multi-page vanilla frontend backed by an Express API and
MongoDB. It can run locally as a Node.js application and is structured for
serverless deployment.

## Features

### Authentication and account management

- Patient sign-up and email/password login.
- Google sign-in with server-side ID-token verification.
- Email verification with resend support.
- Forgot-password and one-time password-reset flows.
- Short-lived JWT sessions with token-version revocation.
- Separate patient and doctor roles with server-side authorization.
- Profile retrieval, name updates, profile-picture upload/removal, and
  password changes.
- Patient account deletion with soft-delete behavior.
- Authentication and failed-login rate limiting.

### Patient workflows

- Patient dashboard and profile information.
- Doctor directory and doctor selection.
- Appointment booking, viewing, and cancellation.
- Medical-record viewing.
- Health profile management, including blood type, allergies, and chronic
  conditions.
- Health Vault PDF upload, categorization, sharing with an eligible doctor,
  soft deletion, restoration, secure file access, and activity history.

### Doctor workflows

- Doctor dashboard and assigned-patient directory.
- Appointment review and status changes: pending, confirmed, cancelled, and
  completed.
- Appointment hide and undo-hide actions.
- Medical-record creation, viewing, and deletion for authorized patients.
- Access to Health Vault documents shared by patients.
- Doctor-side patient account management through protected admin routes.

### Security and reliability

- Password hashing with bcryptjs.
- JWT authentication and role-based authorization middleware.
- Helmet security headers and restricted CORS.
- Redis-backed rate limiting when configured, with a local in-memory fallback.
- AES-256-GCM field encryption for medical-record text and sensitive health
  profile fields.
- Private object storage for Health Vault PDFs; files are streamed through an
  authenticated API route.
- Image and PDF upload type validation with file-size limits.
- Audit logs for Health Vault create, view, delete, and restore actions.
- MongoDB ObjectId validation and centralized API error handling.
- Unique active doctor/date/time appointment index to prevent double booking.
- Request IDs and structured server logging support.

## Technology stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Google Identity Services
- Google Fonts

### Backend

- Node.js with ES modules
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- Google Authentication Library
- Helmet and CORS
- express-rate-limit with optional Redis storage
- Multer for memory-buffered uploads
- Nodemailer for verification and password-reset email
- Vercel Blob for profile pictures and private Health Vault files
- dotenv for local configuration
- Nodemon for development

## Repository structure

.
├── Backend/
│   ├── app.js                         Express app, middleware, routes, and static files
│   ├── constants.js                   Shared backend constants
│   ├── index.js                       Local server entry point
│   ├── package.json                   Scripts and dependencies
│   ├── package-lock.json               Locked dependency versions
│   ├── .env.example                    Configuration template without secrets
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  MongoDB connection
│   │   ├── controllers/
│   │   │   ├── appointmentController.js
│   │   │   ├── authController.js
│   │   │   ├── emailAuthController.js
│   │   │   ├── googleAuthController.js
│   │   │   ├── healthDocumentController.js
│   │   │   ├── medicalRecordController.js
│   │   │   ├── patientController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── uploadMiddleware.js
│   │   ├── models/
│   │   │   ├── appointment.model.js
│   │   │   ├── auditLog.model.js
│   │   │   ├── healthDocument.model.js
│   │   │   ├── medicalRecord.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── adminRoute.js
│   │   │   ├── appointmentRoute.js
│   │   │   ├── authRoute.js
│   │   │   ├── doctorRoute.js
│   │   │   ├── healthDocumentRoute.js
│   │   │   ├── medicalRecordRoute.js
│   │   │   ├── pageRoute.js
│   │   │   ├── patientRoute.js
│   │   │   └── userRoute.js
│   │   ├── script/
│   │   │   ├── createAdmin.js
│   │   │   ├── migrate.js
│   │   │   └── verifyExistingUsers.js
│   │   └── utils/
│   │       ├── AppError.js
│   │       ├── dnsConfig.js
│   │       ├── emailTemplates.js
│   │       ├── fieldCrypto.js
│   │       ├── googleAuth.js
│   │       ├── logger.js
│   │       ├── mailer.js
│   │       ├── softDeleteUser.js
│   │       └── tokens.js
│   └── tests/
│       ├── dnsConfig.test.js
│       ├── emailVerificationRules.test.js
│       ├── errorHandling.test.js
│       └── vaultPlaceholders.test.js
├── Frontend/
│   ├── CSS/
│   │   ├── appointment.css
│   │   ├── doctor-dashboard.css
│   │   ├── forgot-password.css
│   │   ├── health-vault.css
│   │   ├── medical-record.css
│   │   ├── patient-directory.css
│   │   ├── patient.css
│   │   ├── signup.css
│   │   ├── style.css
│   │   └── verify-email.css
│   ├── HTML/
│   │   ├── about.html
│   │   ├── appointment.html
│   │   ├── doctor-dashboard.html
│   │   ├── forgot-password.html
│   │   ├── health-vault.html
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── medical-records.html
│   │   ├── patient-dashboard.html
│   │   ├── patient-directory.html
│   │   ├── sign-up.html
│   │   └── verify-email.html
│   └── JS/
│       └── app.js
├── assests/
│   └── photos/
│       ├── doctor1.jpg
│       ├── doctor2.jpg
│       ├── doctor3.jpg
│       ├── favicon.png
│       ├── login-bg-photo.png
│       ├── logo.png
│       ├── patient-portal.png
│       ├── screen1.png
│       ├── sehat_kahani_patient_log_in.png
│       ├── sehat_kahani_patient_sign_up.png
│       └── signup-visual-img.jpg
├── vercel.json                        Clean page URL rewrites
└── README.md                          Project documentation
```

The `assests` spelling is retained to match the existing repository layout.
`Backend/node_modules` is a local dependency directory and is not part of the
project source tree.

## Frontend pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page |
| `about.html` | About the portal |
| `login.html` | Patient, doctor, and Google sign-in |
| `sign-up.html` | Patient registration |
| `verify-email.html` | Email verification and resend flow |
| `forgot-password.html` | Password reset request and completion |
| `patient-dashboard.html` | Patient overview |
| `doctor-dashboard.html` | Doctor overview |
| `appointment.html` | Appointment browsing and management |
| `medical-records.html` | Medical-record display |
| `health-vault.html` | Health profile and private document management |
| `patient-directory.html` | Doctor-facing patient directory |

Clean page paths are mapped in both `Backend/src/routes/pageRoute.js` and
`vercel.json`. Legacy `/Frontend/HTML/*.html` links redirect to their clean
paths when served by the backend.

## API surface

All API routes are mounted below `/api`. Protected routes require a bearer JWT
in the `Authorization` header and enforce ownership or role checks in the
backend.

| Route group | Main operations |
|---|---|
| `/api/auth` | Sign-up, login, Google login, email verification, password reset, logout |
| `/api/doctors` | Patient-only doctor directory |
| `/api/users` | Current profile, password, picture, health profile, and patient account actions |
| `/api/appointments` | Book, list, view, cancel, update status, hide, and restore |
| `/api/medical-records` | Create, list, view, and delete records |
| `/api/health-documents` | Upload, list, share, download, delete, restore, and activity |
| `/api/patients` | Doctor-only assigned-patient directory |
| `/api/admin` | Doctor-authorized patient account administration |

### Upload rules

- Profile pictures use the multipart field `picture`, accept JPG/PNG/WEBP,
  and are limited to 2 MB.
- Health Vault files use the multipart field `document`, accept PDF files,
  and are limited to 4 MB.
- Uploads are buffered in memory and sent to object storage; local disk
  storage is not required.

## Data model

- **User:** identity, role, authentication provider, verification state,
  profile picture, soft-delete state, health profile, and token version.
- **Appointment:** patient, doctor, date, time, reason, status, active state,
  and doctor-side deletion metadata.
- **MedicalRecord:** patient, doctor, optional appointment, encrypted diagnosis,
  notes, prescription, and soft-delete timestamp.
- **HealthDocument:** patient, category, optional shared doctor, original file
  name, private object-storage path, size, and soft-delete timestamp.
- **AuditLog:** actor, action, record type, record ID, and timestamps.

Health Vault categories are `lab`, `prescription`, `imaging`, and
`vaccination`. Sensitive medical text is encrypted before persistence and
decrypted only when authorized data is returned.

## Local development

### Prerequisites

- Current Node.js LTS release.
- npm.
- MongoDB database available to the backend.
- Optional Redis instance for shared rate-limit storage.
- Optional SMTP provider for real verification and password-reset email.
- Optional Google OAuth credentials for Google sign-in.
- Optional object-storage credentials for profile pictures and Health Vault
  documents.

### Configure the backend

1. Open a terminal in `Backend`.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to a local `.env` file.
4. Fill the local file from your private configuration source. Do not commit
   `.env`, credentials, tokens, database connection strings, or deployed
   service URLs.
5. Configure the frontend API settings privately for the backend instance you
   are running. Do not publish those values in documentation or screenshots.

The configuration template includes database, application, security/encryption,
object storage, email, OAuth, DNS troubleshooting, and initial-doctor
settings. Empty or missing optional integrations have development-safe
behavior, but production deployments must provide every value required by the
enabled workflow.

### Run the backend

From `Backend`:

```bash
npm run dev
```

For a non-watching start:

```bash
npm start
```

The server uses the configured port and defaults to port `3000` when no port
is provided.

### Serve the frontend

The frontend is static and requires no frontend package installation. Serve
the repository through a local static-file server instead of opening HTML
files directly with `file://`, so clean routes, styles, assets, and API calls
behave consistently.

## Database and maintenance scripts

Run these commands from `Backend` with a private configuration file and an
explicitly selected development or maintenance database:

```bash
npm run migrate
npm run verify-existing
```

- `migrate` backfills token and appointment fields, repairs legacy account
  state, removes conflicting appointment indexes, deactivates duplicate
  active slots, creates the unique slot index, and encrypts older medical
  records.
- `verify-existing` marks accounts created before email verification existed
  as verified. Review the target database before running it.

The repository also contains `src/script/createAdmin.js` for creating the
configured initial doctor accounts. Use only private local or explicitly
selected maintenance configuration; never put real account values in source,
seed data, documentation, or commits.

## Testing

Run the backend test suite from `Backend`:

```bash
npm test
```

The tests cover DNS configuration parsing, email-verification rules, error
responses, and Health Vault placeholder behavior. Tests are designed to avoid
real email delivery and should not receive production credentials.

## Security and contribution guidelines

- Keep all environment files, credentials, tokens, database URLs, private
  storage tokens, and deployed backend URLs out of Git and documentation.
- Use a strong private encryption key for `MEDICAL_DATA_KEY`; changing it
  without a planned data-key rotation makes existing encrypted data
  unreadable.
- Enforce authorization in the backend; frontend visibility is not a security
  boundary.
- Do not use shared or production credentials in maintenance scripts.
- Validate ownership and role boundaries when adding routes or controllers.
- Run `npm test` and the relevant local development commands before submitting
  changes.
- Preserve the existing separation between frontend pages/styles/scripts and
  backend routes/controllers/models/middleware.