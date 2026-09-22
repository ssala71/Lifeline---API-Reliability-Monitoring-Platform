# Lifeline

Lifeline is a full-stack application monitoring platform for small development teams and open-source projects. It checks whether registered websites and APIs are responding normally, records their performance, identifies outages, and notifies developers when a service goes down or recovers.

> **Project status:** Backend configuration, SQLite setup, and core database models are complete. API routes, monitoring, dashboard, and notification features are in development.

## Problem

Small development teams may not know that an application is slow or unavailable until users report the problem. Lifeline provides a simple way to monitor services, understand incidents, and respond quickly.

## MVP Goals

The first version of Lifeline will allow a user to:

* Add a service URL to monitor
* Set a check interval and timeout limit
* Measure response time and HTTP status codes
* Classify services as `UNKNOWN`, `HEALTHY`, `DEGRADED`, or `DOWN`
* Store health-check history
* Create and resolve incidents
* View service health from a dashboard
* Receive a Slack or Discord notification when a service goes down or recovers

## How It Works

```text
User adds a service
        ↓
FastAPI saves its settings in SQLite
        ↓
The scheduler checks the service
        ↓
Lifeline records status and response time
        ↓
The dashboard displays the result
        ↓
An alert is sent when the service changes state
```

Lifeline will initially monitor health endpoints or simple API URLs. It will not perform penetration testing or send destructive requests.

## Status Rules

| Status     | Meaning                                                         |
| ---------- | --------------------------------------------------------------- |
| `UNKNOWN`  | The service has not been checked yet.                           |
| `HEALTHY`  | The service responded successfully within the time limit.       |
| `DEGRADED` | The service responded but was slower than the configured limit. |
| `DOWN`     | The service failed repeatedly or timed out.                     |

When a `DOWN` service responds successfully again, Lifeline will return it to `HEALTHY`, close the incident, calculate the downtime, and send a recovery notification.

## Technology Stack

* **Frontend:** React, TypeScript, Vite
* **Backend:** Python, FastAPI
* **Database:** SQLite
* **Database tools:** SQLAlchemy
* **HTTP checks:** HTTPX
* **Background checks:** APScheduler or an equivalent scheduler
* **Notifications:** Slack or Discord webhook
* **Testing:** Pytest and frontend tests
* **Development environment:** Python virtual environment
* **Version control:** Git and GitHub

## Repository Structure

```text
lifeline/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── jobs/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── mocks/
│   └── package.json
├── docs/
│   └── api-contract.md
├── .gitignore
└── README.md
```

The local SQLite database is created at:

```text
backend/lifeline.db
```

This file should remain excluded from GitHub because it is generated locally.

## Team Members

| Role               | Team member    |
| ------------------ | -------------- |
| Backend developer  | Samuel Salazar |
| Frontend developer | Thet Paing Htoo |

## Task Assignments

### Person A — Samuel Salazar

**Role: Backend developer**

#### Backend Setup

From the repository root:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`. Set `DISCORD_WEBHOOK_URL` in `backend/.env` to
enable Discord down and recovery notifications. Keep webhook credentials out
of Git and rotate any webhook that has been exposed publicly.

Run the backend test suite from `backend` with:

```powershell
pytest
```

#### Initial Setup

* [x] Create the FastAPI project
* [x] Create the Python virtual environment
* [x] Add environment-variable settings
* [x] Add CORS for the React development server
* [x] Add basic error handling
* [x] Confirm the `/`, `/health`, and `/docs` endpoints work

#### Database

* [x] Install SQLAlchemy
* [x] Create the SQLite database engine and session dependency
* [x] Create the `Service` model
* [x] Create the `HealthCheck` model
* [x] Create the `Incident` model
* [x] Initialize the SQLite database tables

Database migrations are not required for the first prototype. SQLite tables are initialized with SQLAlchemy when the backend starts.

#### API Routes

* [x] Create `POST /api/services`
* [x] Create `GET /api/services`
* [x] Create `GET /api/services/{id}`
* [x] Create `PATCH /api/services/{id}`
* [x] Create `DELETE /api/services/{id}`
* [x] Create `POST /api/services/{id}/check`
* [x] Create `GET /api/services/{id}/history`
* [x] Create `GET /api/incidents`

#### Monitoring Engine

- [x] Create the HTTP health-check service using HTTPX
- [x] Measure response time
- [x] Record HTTP status codes
- [x] Handle timeouts and connection errors
- [x] Create the status enum
- [x] Implement `HEALTHY`, `DEGRADED`, and `DOWN` rules
- [x] Track consecutive failures
- [x] Create incidents when a service goes down
- [x] Close incidents when a service recovers
- [x] Calculate downtime

#### Background Work and Alerts

* [x] Create the scheduled-check job
* [x] Check only services that are enabled and due for a check
* [x] Prevent duplicate alerts for the same incident
* [x] Connect a Slack or Discord webhook
* [x] Send a down notification
* [x] Send a recovery notification

#### Backend Quality

* [x] Test successful responses
* [x] Test slow responses
* [x] Test timeouts
* [x] Test repeated failures
* [x] Test recovery behavior
* [x] Test incident creation and resolution
* [x] Document backend setup instructions

### Person B — ____________________

**Role: Frontend developer**

#### Initial Setup

* [x] Create the React and Vite frontend
* [x] Create the initial page layout
* [x] Create the frontend API service file
* [x] Add frontend environment-variable support

#### Service Management Interface

* [x] Create the add-service form
* [x] Add fields for service name and URL
* [x] Add fields for interval, timeout, and slow-response limits
* [x] Add input validation
* [x] Display the list of monitored services
* [x] Add enable, disable, and delete actions

#### Dashboard

* [x] Create healthy, degraded, down, and unknown status cards
* [x] Display the last checked time
* [x] Display response time
* [x] Display HTTP status code
* [x] Display total service counters
* [x] Display recent incidents
* [x] Display active incidents
* [x] Add response-time charts
* [x] Add service history views
* [x] Display downtime duration after recovery

#### Frontend Quality

* [x] Connect the dashboard to the FastAPI routes
* [x] Add loading states
* [x] Add backend error messages
* [x] Add empty-state messages
* [x] Make the dashboard readable on different screen sizes
* [x] Test adding and deleting services
* [x] Test each service status display
* [x] Document frontend setup instructions

## API Contract

The backend and frontend should agree on request and response formats before implementation. The shared contract will be maintained in `docs/api-contract.md`.

### Example Service Request

`check_interval` and `timeout` are measured in seconds. `slow_threshold` is measured in milliseconds.

```json
{
  "name": "Student API",
  "url": "https://example.com/health",
  "check_interval": 60,
  "timeout": 10,
  "slow_threshold": 1000,
  "failure_threshold": 3,
  "enabled": true
}
```

### Example Health-Check Response

```json
{
  "service_id": 1,
  "status": "HEALTHY",
  "status_code": 200,
  "response_time_ms": 142,
  "checked_at": "2026-09-21T12:00:00Z"
}
```

## Local Development

### Start the SQLite Database

SQLite is file-based, so no database server or Docker command is required. The database file is created automatically when the backend starts.

```text
backend/lifeline.db
```

### Start the Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
fastapi dev app\main.py
```

The backend will be available at:

* API: `http://127.0.0.1:8000`
* Interactive documentation: `http://127.0.0.1:8000/docs`

### Start the Frontend

In a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Development Milestones

### Milestone 1: Backend Foundation

* FastAPI starts successfully
* SQLite connection works
* A service can be stored and retrieved

### Milestone 2: First Complete Workflow

* A user adds a URL
* The backend checks it manually
* The result is saved
* The frontend displays the result

### Milestone 3: Automatic Monitoring

* Scheduled checks work
* Status changes are detected
* Incidents are created and resolved

### Milestone 4: Alerts and Polish

* Notifications are sent
* Charts and counters work
* Tests pass
* The project is ready for demonstration

## Definition of Done

Lifeline is ready for the class demonstration when:

* A user can add a service from the frontend.
* The backend can check the service and record its result.
* The dashboard displays its current status and history.
* A failed service becomes `DOWN` after the configured threshold.
* A recovery closes the incident and calculates downtime.
* A Slack or Discord notification is sent for failure and recovery.
* The project has tests, setup instructions, and a working demo.

## Future Improvements

These features are outside the first MVP but could be added later:

* User accounts and authentication
* GitHub issue creation for outages
* Multiple notification channels
* Live dashboard updates with WebSockets
* Public status pages
* Custom request headers and expected response bodies
* Cloud deployment
* Database migrations with Alembic
