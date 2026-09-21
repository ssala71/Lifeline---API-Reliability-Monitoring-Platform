# Lifeline

Lifeline is a full-stack application monitoring platform for small development teams and open-source projects. It checks whether registered websites and APIs are responding normally, records their performance, identifies outages, and notifies developers when a service goes down or recovers.

> **Project status:** Initial backend configuration complete. Database, monitoring, dashboard, and notification features are in development.

## Problem

Small development teams may not know that an application is slow or unavailable until users report the problem. Lifeline provides a simple way to monitor services, understand incidents, and respond quickly.

## MVP Goals

The first version of Lifeline will allow a user to:

- Add a service URL to monitor
- Set a check interval and timeout limit
- Measure response time and HTTP status codes
- Classify services as `UNKNOWN`, `HEALTHY`, `DEGRADED`, or `DOWN`
- Store health-check history
- Create and resolve incidents
- View service health from a dashboard
- Receive a Slack or Discord notification when a service goes down or recovers

## How It Works

```text
User adds a service
        ↓
FastAPI saves its settings
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

| Status | Meaning |
|---|---|
| `UNKNOWN` | The service has not been checked yet. |
| `HEALTHY` | The service responded successfully within the time limit. |
| `DEGRADED` | The service responded but was slower than the configured limit. |
| `DOWN` | The service failed repeatedly or timed out. |

When a `DOWN` service responds successfully again, Lifeline will return it to `HEALTHY`, close the incident, calculate the downtime, and send a recovery notification.

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL
- **Database tools:** SQLAlchemy and Psycopg
- **HTTP checks:** HTTPX
- **Background checks:** APScheduler or an equivalent scheduler
- **Notifications:** Slack or Discord webhook
- **Testing:** Pytest and frontend tests
- **Development environment:** Docker Compose for PostgreSQL
- **Version control:** Git and GitHub

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
├── compose.yaml
├── .gitignore
└── README.md
```

## Team Members

| Role | Team member |
|---|---|
| Backend developer | Samuel Salazar |
| Frontend developer |  |

## Task Assignments

### Person A — Samuel Salazar

**Role: Backend developer**

#### Initial Setup

- [x] Create the FastAPI project
- [x] Create the Python virtual environment
- [x] Add environment-variable settings
- [x] Add CORS for the React development server
- [x] Add basic error handling
- [x] Confirm the `/`, `/health`, and `/docs` endpoints work

#### Database

- [ ] Start PostgreSQL locally with Docker Compose
- [ ] Install SQLAlchemy and Psycopg
- [ ] Create the database engine and session dependency
- [ ] Create the `Service` model
- [ ] Create the `HealthCheck` model
- [ ] Create the `Incident` model
- [ ] Add database initialization or migrations

#### API Routes

- [ ] Create `POST /api/services`
- [ ] Create `GET /api/services`
- [ ] Create `GET /api/services/{id}`
- [ ] Create `PATCH /api/services/{id}`
- [ ] Create `DELETE /api/services/{id}`
- [ ] Create `POST /api/services/{id}/check`
- [ ] Create `GET /api/services/{id}/history`
- [ ] Create `GET /api/incidents`

#### Monitoring Engine

- [ ] Create the HTTP health-check service using HTTPX
- [ ] Measure response time
- [ ] Record HTTP status codes
- [ ] Handle timeouts and connection errors
- [ ] Create the status enum
- [ ] Implement `HEALTHY`, `DEGRADED`, and `DOWN` rules
- [ ] Track consecutive failures
- [ ] Create incidents when a service goes down
- [ ] Close incidents when a service recovers
- [ ] Calculate downtime

#### Background Work and Alerts

- [ ] Create the scheduled-check job
- [ ] Check only services that are enabled and due for a check
- [ ] Prevent duplicate alerts for the same incident
- [ ] Connect a Slack or Discord webhook
- [ ] Send a down notification
- [ ] Send a recovery notification

#### Backend Quality

- [ ] Test successful responses
- [ ] Test slow responses
- [ ] Test timeouts
- [ ] Test repeated failures
- [ ] Test recovery behavior
- [ ] Test incident creation and resolution
- [ ] Document backend setup instructions

### Person B — ____________________

**Role: Frontend developer**

#### Initial Setup

- [ ] Create the React and Vite frontend
- [ ] Create the initial page layout
- [ ] Create the frontend API service file
- [ ] Add frontend environment-variable support

#### Service Management Interface

- [ ] Create the add-service form
- [ ] Add fields for service name and URL
- [ ] Add fields for interval, timeout, and slow-response limits
- [ ] Add input validation
- [ ] Display the list of monitored services
- [ ] Add enable, disable, and delete actions

#### Dashboard

- [ ] Create healthy, degraded, down, and unknown status cards
- [ ] Display the last checked time
- [ ] Display response time
- [ ] Display HTTP status code
- [ ] Display total service counters
- [ ] Display recent incidents
- [ ] Display active incidents
- [ ] Add response-time charts
- [ ] Add service history views
- [ ] Display downtime duration after recovery

#### Frontend Quality

- [ ] Connect the dashboard to the FastAPI routes
- [ ] Add loading states
- [ ] Add backend error messages
- [ ] Add empty-state messages
- [ ] Make the dashboard readable on different screen sizes
- [ ] Test adding and deleting services
- [ ] Test each service status display
- [ ] Document frontend setup instructions

## API Contract

The backend and frontend should agree on request and response formats before implementation. The shared contract will be maintained in `docs/api-contract.md`.

### Example Service Request

```json
{
  "name": "Student API",
  "url": "https://example.com/health",
  "check_interval_seconds": 60,
  "timeout_milliseconds": 3000,
  "slow_threshold_milliseconds": 1000,
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

### Start PostgreSQL

From the root `lifeline` folder:

```powershell
docker compose up -d
```

### Start the Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
fastapi dev app\main.py
```

The backend will be available at:

- API: `http://127.0.0.1:8000`
- Interactive documentation: `http://127.0.0.1:8000/docs`

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

- FastAPI starts successfully
- PostgreSQL connection works
- A service can be stored and retrieved

### Milestone 2: First Complete Workflow

- A user adds a URL
- The backend checks it manually
- The result is saved
- The frontend displays the result

### Milestone 3: Automatic Monitoring

- Scheduled checks work
- Status changes are detected
- Incidents are created and resolved

### Milestone 4: Alerts and Polish

- Notifications are sent
- Charts and counters work
- Tests pass
- The project is ready for demonstration

## Definition of Done

Lifeline is ready for the class demonstration when:

- A user can add a service from the frontend.
- The backend can check the service and record its result.
- The dashboard displays its current status and history.
- A failed service becomes `DOWN` after the configured threshold.
- A recovery closes the incident and calculates downtime.
- A Slack or Discord notification is sent for failure and recovery.
- The project has tests, setup instructions, and a working demo.

## Future Improvements

These features are outside the first MVP but could be added later:

- User accounts and authentication
- GitHub issue creation for outages
- Multiple notification channels
- Live dashboard updates with WebSockets
- Public status pages
- Custom request headers and expected response bodies
- Cloud deployment
