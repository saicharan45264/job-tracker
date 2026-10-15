# CareerTrack — Project Architecture & File Directory Guide

This document provides a comprehensive, file-by-file breakdown of the **CareerTrack (JobTracker)** repository. It covers every configuration file, backend service, database model, API route, controller, frontend page, UI component, and state manager.

---

## 📁 Repository Overview

```text
JobTracker/
├── package.json              # Workspace root scripts (dev, seed, install:all, build)
├── package-lock.json         # Workspace dependency lockfile
├── README.md                 # System documentation & feature breakdown
├── postman/                  # Pre-configured API test collection
├── server/                   # Node.js + Express + MongoDB REST API backend
└── client/                   # React 18 + Vite frontend SPA
```

---

## 1. ⚙️ Root Files & Tooling

| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `package.json` | [`package.json`](file:///Users/saicharanboddeti/Downloads/JobTracker/package.json) | Root monorepo/workspace manager. Defines commands like `npm run dev` (runs both backend and frontend via `concurrently`), `npm run install:all`, `npm run seed`, `npm run test`, and `npm run build`. |
| `package-lock.json` | `package-lock.json` | Lockfile for workspace dev tools (e.g. `concurrently`). |
| `.gitignore` | `.gitignore` | Specifies directories and files to exclude from git (e.g. `node_modules/`, `.env`, build artifacts). |
| `README.md` | [`README.md`](file:///Users/saicharanboddeti/Downloads/JobTracker/README.md) | Exhaustive documentation outlining project capabilities, REST endpoints, data models, setup instructions, and architecture. |
| `careertrack.postman_collection.json` | [`postman/careertrack.postman_collection.json`](file:///Users/saicharanboddeti/Downloads/JobTracker/postman/careertrack.postman_collection.json) | Complete, ready-to-import Postman collection with tests for all REST API endpoints (Auth, Applications, Interviews, Companies, Analytics, Notifications). |

---

## 2. 🖥️ Backend Server (`server/`)

The backend is built with **Node.js (ES Modules)**, **Express.js**, and **Mongoose (MongoDB)**.

### 2.1 Server Core & Configuration (`server/src/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `server.js` | [`server/src/server.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/server.js) | Server entrypoint. Connects to MongoDB, starts the HTTP server on port 5000, and manages graceful shutdowns on SIGINT/SIGTERM. |
| `app.js` | [`server/src/app.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/app.js) | Express application setup. Configures security middleware (`helmet`, `cors`, `rateLimit`), request body parsing (`express.json`, `cookieParser`), mounts all API route modules (`/api/*`), and handles global 404 & error boundaries. |
| `config.js` | [`server/src/config/config.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/config/config.js) | Centralized environment variable loader and validation using `dotenv` (ports, Mongo URI, JWT secrets, expiry times). |
| `db.js` | [`server/src/config/db.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/config/db.js) | MongoDB connection manager via Mongoose with auto-reconnection and connection logging. |

### 2.2 Database Models (`server/src/models/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `User.js` | [`server/src/models/User.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/models/User.js) | User schema containing profile credentials (hashed password), customizable preferences (`theme`, `currency: 'INR'`, `defaultView`, `timeZone: 'Asia/Kolkata'`, `dateFormat`). |
| `Application.js` | [`server/src/models/Application.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/models/Application.js) | Job application schema tracking company, role, stage (`Wishlist`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn`), priority, salary range (`INR`), contact info, tags, and dates. |
| `Company.js` | [`server/src/models/Company.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/models/Company.js) | Company directory schema storing company names, domains, websites, industries, Indian headquarters/locations, and user-specific notes. |
| `Interview.js` | [`server/src/models/Interview.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/models/Interview.js) | Interview round tracking schema (date/time, mode, interviewers, preparation checklists, meeting URLs, stage outcomes, and post-interview feedback). |
| `Activity.js` | [`server/src/models/Activity.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/models/Activity.js) | Audit trail/activity log schema recording events (status changes, new interviews, applications created, deleted). |
| `Notification.js` | [`server/src/models/Notification.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/models/Notification.js) | In-app notifications schema for upcoming interview reminders, status updates, and system alerts. |
| `RefreshToken.js` | [`server/src/models/RefreshToken.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/models/RefreshToken.js) | Stores hashed JWT refresh tokens with TTL indexes for automatic token revocation and rotation. |

### 2.3 Controllers / Business Logic (`server/src/controllers/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `auth.controller.js` | [`server/src/controllers/auth.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/auth.controller.js) | User registration, login verification, issuing HTTP-only cookie JWTs, token refresh rotation, and logout. |
| `application.controller.js` | [`server/src/controllers/application.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/application.controller.js) | CRUD operations for job applications, status transitions, search/filtering/pagination, and CSV import/export triggers. |
| `dashboard.controller.js` | [`server/src/controllers/dashboard.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/dashboard.controller.js) | Aggregates summary KPIs, recruitment progression funnel rates, historical monthly submission trends, and upcoming interviews. |
| `interview.controller.js` | [`server/src/controllers/interview.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/interview.controller.js) | Manages interview scheduling, checklist updates, round outcomes, and monthly calendar views. |
| `company.controller.js` | [`server/src/controllers/company.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/company.controller.js) | Manages target companies, updates profiles, and lists applications associated with each company. |
| `analytics.controller.js` | [`server/src/controllers/analytics.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/analytics.controller.js) | High-level analytics pipeline computations: offer conversion rate, time-to-hire, funnel progression, and source distribution. |
| `activity.controller.js` | [`server/src/controllers/activity.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/activity.controller.js) | Fetches global recent activities and application-specific timeline logs. |
| `notification.controller.js` | [`server/src/controllers/notification.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/notification.controller.js) | Returns unread notifications, marks notifications as read, and clears alerts. |
| `settings.controller.js` | [`server/src/controllers/settings.controller.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/controllers/settings.controller.js) | Manages user profile info, password updates, preferences (INR, dark mode, default views), and account deletion. |

### 2.4 API Route Definitions (`server/src/routes/`)
| File | Path | Base Path | Description |
| :--- | :--- | :--- | :--- |
| `auth.routes.js` | [`server/src/routes/auth.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/auth.routes.js) | `/api/auth` | Register, login, refresh token, logout, and get current user profile. |
| `application.routes.js` | [`server/src/routes/application.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/application.routes.js) | `/api/applications` | Applications CRUD, bulk status updates, CSV import, and CSV export. |
| `dashboard.routes.js` | [`server/src/routes/dashboard.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/dashboard.routes.js) | `/api/dashboard` | Dashboard metrics, stage funnels, and trend timelines. |
| `interview.routes.js` | [`server/src/routes/interview.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/interview.routes.js) | `/api/interviews` | Interview scheduling, checklist toggles, round outcomes, and calendar queries. |
| `company.routes.js` | [`server/src/routes/company.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/company.routes.js) | `/api/companies` | Company profiles, directory listing, and linked application queries. |
| `analytics.routes.js` | [`server/src/routes/analytics.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/analytics.routes.js) | `/api/analytics` | Deep metrics, conversion ratios, and source yield analytics. |
| `activity.routes.js` | [`server/src/routes/activity.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/activity.routes.js) | `/api/activities` | Audit trail timeline activities. |
| `notification.routes.js` | [`server/src/routes/notification.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/notification.routes.js) | `/api/notifications` | User notifications and unread alert counters. |
| `settings.routes.js` | [`server/src/routes/settings.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/settings.routes.js) | `/api/settings` | Profile preferences, password changes, and account management. |
| `health.routes.js` | [`server/src/routes/health.routes.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/routes/health.routes.js) | `/api/health` | System health check (database connection status, memory, uptime). |

### 2.5 Middleware (`server/src/middleware/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `authenticate.js` | [`server/src/middleware/authenticate.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/middleware/authenticate.js) | Protects routes via JWT verification (checks `Authorization: Bearer <token>` header and HTTP-only cookie). |
| `validate.js` | [`server/src/middleware/validate.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/middleware/validate.js) | Generic Zod request schema validation middleware and MongoDB ObjectId validator (`validateObjectId`). |
| `errorHandler.js` | [`server/src/middleware/errorHandler.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/middleware/errorHandler.js) | Centralized error handler converting runtime and Mongoose errors into uniform JSON error envelopes. |
| `notFound.js` | [`server/src/middleware/notFound.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/middleware/notFound.js) | 404 handler for unknown API routes. |

### 2.6 Services & Utilities (`server/src/services/` & `server/src/utils/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `csv.service.js` | [`server/src/services/csv.service.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/services/csv.service.js) | Generates CSV export files and parses uploaded CSV files into validated Application database documents. |
| `apiResponse.js` | [`server/src/utils/apiResponse.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/utils/apiResponse.js) | Standard response helpers (`sendSuccess`, `sendError`) for consistent REST response formats. |
| `jwt.js` | [`server/src/utils/jwt.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/utils/jwt.js) | Helper functions for signing, verifying, and decoding access tokens and refresh tokens. |
| `seed.js` | [`server/src/scripts/seed.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/server/src/scripts/seed.js) | Database seeder script. Populates demo user `demo@careertrack.dev`, Indian companies (Google India, Stripe India, Flipkart, etc.), INR salaries, and realistic interview schedules. |

---

## 3. 💻 Frontend Application (`client/`)

The frontend is built with **React 18**, **Vite**, **React Router v6**, and **Bootstrap 5** styled with a curated **Maroon Design System**.

### 3.1 Client Core
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `index.html` | [`client/index.html`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/index.html) | HTML5 entrypoint with Google Fonts (`Plus Jakarta Sans`), responsive meta tags, and maroon favicon. |
| `vite.config.js` | [`client/vite.config.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/vite.config.js) | Vite configuration using `@vitejs/plugin-react` and local proxying for API dev server. |
| `main.jsx` | [`client/src/main.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/main.jsx) | React DOM mounting point rendering `<App />` within `React.StrictMode`. |
| `App.jsx` | [`client/src/App.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/App.jsx) | Application root. Sets up `AuthContext`, `NotificationContext`, `react-hot-toast`, and the main `AppRouter`. |
| `index.css` | [`client/src/index.css`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/index.css) | Core Design System CSS. Defines CSS custom properties (`--primary: #800020` maroon, dark mode tokens, cards, status badges, buttons, kanban board styles, and scrollbars). |

### 3.2 State Management & Contexts (`client/src/context/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `AuthContext.jsx` | [`client/src/context/AuthContext.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/context/AuthContext.jsx) | Global authentication context providing `user`, `login()`, `register()`, `logout()`, `updateUser()`, and session checks. |
| `NotificationContext.jsx` | [`client/src/context/NotificationContext.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/context/NotificationContext.jsx) | Global notifications manager. Polls for alerts, updates unread badge counter in navbar, and marks alerts read/cleared. |

### 3.3 Routing & Navigation (`client/src/routes/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `AppRouter.jsx` | [`client/src/routes/AppRouter.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/routes/AppRouter.jsx) | Configures all React Router routes: public auth pages, protected dashboard routes, and 404 fallbacks. |
| `ProtectedRoute.jsx` | [`client/src/routes/ProtectedRoute.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/routes/ProtectedRoute.jsx) | Route guard checking authentication state; redirects unauthenticated visitors to `/login` with maroon loading states. |

### 3.4 Pages / Views (`client/src/pages/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `Dashboard.jsx` | [`client/src/pages/Dashboard.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Dashboard.jsx) | Main dashboard. Displays StatCards, interactive Recruitment Progression Pipeline with hover tooltips, Monthly Area Charts, Status Donut Charts, and upcoming interviews. |
| `Applications.jsx` | [`client/src/pages/Applications.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Applications.jsx) | Job applications workspace. Supports dual view: **Table View** (searchable, filterable, sortable, paginated) and **Kanban View** (drag-and-drop / column status transitions), plus CSV import/export. |
| `ApplicationDetails.jsx` | [`client/src/pages/ApplicationDetails.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/ApplicationDetails.jsx) | Detailed view for an application: salary in INR, interview timeline, recruiter contacts, notes, and activity audit history. |
| `Interviews.jsx` | [`client/src/pages/Interviews.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Interviews.jsx) | Interview management page featuring an **interactive monthly calendar grid**, upcoming interview list, and round editor. |
| `Companies.jsx` | [`client/src/pages/Companies.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Companies.jsx) | Directory of target companies, Indian branch locations, job count per company, and company creation/editing modal. |
| `Analytics.jsx` | [`client/src/pages/Analytics.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Analytics.jsx) | Deep analytics page with Recharts: Time-to-offer calculations, funnel conversion graphs, interview yields, and application source yield charts. |
| `Settings.jsx` | [`client/src/pages/Settings.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Settings.jsx) | User settings: profile information, preferred currency (`INR`), timezone (`Asia/Kolkata`), date format, and password changes. |
| `Login.jsx` | [`client/src/pages/Login.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Login.jsx) | Sign-in page with quick 1-click Demo credentials auto-fill button, validation, and maroon branding. |
| `Register.jsx` | [`client/src/pages/Register.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/Register.jsx) | New user registration page with password confirmation and input validation. |
| `NotFound.jsx` | [`client/src/pages/NotFound.jsx`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/pages/NotFound.jsx) | Polished 404 error page with navigation link to return to Dashboard. |

### 3.5 Components (`client/src/components/`)
- **Layout (`client/src/components/layout/`):**
  - `Navbar.jsx`: Sticky header with global search, notifications popover with unread counter, theme toggle, and maroon user profile dropdown.
  - `Sidebar.jsx`: Collapsible navigation sidebar featuring the BriefcaseBusiness maroon brand emblem, active route indicators, and mobile drawer.
- **Applications (`client/src/components/applications/`):**
  - `ApplicationFormModal.jsx`: Comprehensive modal form for creating/updating applications (defaults to INR currency, job details, and Indian locations).
  - `ApplicationTable.jsx`: High-performance data table with sorting headers, status badges, priority badges, and action dropdowns.
  - `KanbanBoard.jsx`: Visual column-based pipeline board with status stage drag/reorder capabilities.
  - `KanbanCard.jsx`: Individual cards inside the Kanban columns showing company, role, interview count, and quick actions.
  - `CsvModal.jsx`: Modal for uploading CSV files or exporting application data.
- **Interviews (`client/src/components/interviews/`):**
  - `InterviewModal.jsx`: Modal form for scheduling interview rounds, assigning interviewers, and managing preparation checklist items.
- **Companies (`client/src/components/companies/`):**
  - `CompanyModal.jsx`: Modal form for adding and editing company directory profiles.
- **Common / Reusable UI (`client/src/components/common/`):**
  - `StatCard.jsx`: Metric display card with icon, title, count value, and colored badge styling.
  - `StatusBadge.jsx`: Pill badge displaying stage status with distinct, maroon-harmonious color coding.
  - `PriorityBadge.jsx`: Pill badge displaying priority (`High`, `Medium`, `Low`).
  - `ConfirmationModal.jsx`: Reusable modal for destructive delete confirmations.
  - `EmptyState.jsx`: Clean empty placeholder with iconography and call-to-action button when lists are empty.
  - `LoadingSkeleton.jsx`: Smooth pulse-skeleton loader for cards and tables while API requests are pending.

### 3.6 API Client Modules (`client/src/api/`)
| File | Path | Description & Purpose |
| :--- | :--- | :--- |
| `axios.js` | [`client/src/api/axios.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/axios.js) | Central Axios instance configured with base URL, auto-attaching Bearer token headers, and intercepting 401 errors for token refresh. |
| `auth.api.js` | [`client/src/api/auth.api.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/auth.api.js) | Frontend calls for `/api/auth` (login, register, logout, getMe). |
| `applications.api.js` | [`client/src/api/applications.api.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/applications.api.js) | Frontend calls for `/api/applications` (list, getById, create, update, delete, updateStatus, CSV import/export). |
| `dashboard.api.js` | [`client/src/api/dashboard.api.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/dashboard.api.js) | Frontend calls for `/api/dashboard` (summary, recent applications, upcoming interviews, trends). |
| `interviews.api.js` | [`client/src/api/interviews.api.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/interviews.api.js) | Frontend calls for `/api/interviews` (getInterviews, create, update, delete, checklist, calendar). |
| `companies.api.js` | [`client/src/api/companies.api.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/companies.api.js) | Frontend calls for `/api/companies` (list, create, update, delete). |
| `analytics.api.js` | [`client/src/api/analytics.api.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/analytics.api.js) | Frontend calls for `/api/analytics` (overview, funnel, timeline, sources, statuses). |
| `notifications.api.js` | [`client/src/api/notifications.api.js`](file:///Users/saicharanboddeti/Downloads/JobTracker/client/src/api/notifications.api.js) | Frontend calls for `/api/notifications` (getNotifications, markRead, markAllRead, delete). |

---

## 4. 🗄️ Database Architecture Summary

The MongoDB database (`careertrack`) contains 7 collections:
1. `users`: Credentials, theme preferences, currency (`INR`), timezone (`Asia/Kolkata`).
2. `applications`: All job application records with salary ranges, status, tags, and dates.
3. `companies`: Target company directory with headquarters and locations in India.
4. `interviews`: Scheduled rounds, meeting links, preparation checklists, outcomes.
5. `activities`: Audit log entries for all pipeline changes.
6. `notifications`: In-app alert queue for upcoming interviews and application updates.
7. `refreshtokens`: Secure refresh token store with TTL index expiration.
