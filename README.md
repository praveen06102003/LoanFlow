# LoanFlow – Loan Lifecycle Management Platform

LoanFlow is a full-stack loan lifecycle management application that simplifies the process of submitting, reviewing, tracking, and managing loan applications.

The platform provides separate experiences for customers and loan officers, with role-based access and a centralized loan management workflow.

## Features

### Authentication & User Management
- Google Sign-In authentication.
- JWT-based authentication for API access.
- Role-based access for Customers and Loan Officers.
- Profile management with editable name and phone number.
- Session-based login and logout.

### Customer Portal
- Customer dashboard with application statistics.
- Submit new loan applications.
- View personal loan application history.
- Track application statuses.
- Update personal profile information.

### Loan Officer Portal
- View all customer loan applications.
- Filter applications by status.
- Review individual loan applications.
- Approve or reject pending applications.
- Provide rejection reasons.
- View application statistics.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Angular 15, TypeScript, HTML, CSS |
| Backend | Python, FastAPI |
| Database | MySQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Authentication | Google OAuth 2.0, JWT |
| API Documentation | Swagger UI (OpenAPI) |

## Architecture

LoanFlow follows a frontend-backend architecture.

```text
                 Customer / Loan Officer
                           |
                           v
                    Angular Frontend
                     (Angular 15)
                           |
                      HTTP / REST
                           |
                           v
                    FastAPI Backend
                           |
              +------------+------------+
              |            |            |
              v            v            v
          Auth Routes  Loan Routes  Profile Routes
              |            |            |
              +------------+------------+
                           |
                           v
                     SQLAlchemy ORM
                           |
                           v
                       MySQL DB
```

## Project Structure

```text
LoanFlow/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   ├── migrations/
│   │   └── versions/
│   │
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   └── loanflow-ui/
│       ├── src/
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
├── infrastructure/
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Python 3.11
- Node.js and npm
- Angular CLI 15
- MySQL Server 8
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/LoanFlow.git
cd LoanFlow
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables, including:

- MySQL database connection URL
- Google OAuth Client ID
- JWT secret key
- JWT configuration

Create the MySQL database and configure the connection in the backend.

Run database migrations:

```bash
alembic upgrade head
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend API:

`http://localhost:8000`

Swagger API documentation:

`http://localhost:8000/docs`

### 3. Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend/loanflow-ui
```

Install dependencies:

```bash
npm install
```

Configure the Google OAuth Client ID and ensure the frontend is configured to communicate with the backend API.

Start the Angular development server:

```bash
npm start
```

Frontend:

`http://localhost:4200`

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/google` | Google authentication |
| GET | `/auth/me` | Retrieve current user profile |
| PATCH | `/auth/me` | Update current user profile |
| GET | `/loans` | Retrieve accessible loan applications |
| POST | `/loans` | Submit a loan application |
| GET | `/loans/filter` | Filter loan applications |
| GET | `/loans/{loan_id}` | Retrieve an individual application |
| PATCH | `/loans/{loan_id}/decision` | Approve or reject an application |

All protected endpoints require a valid JWT access token.

## Loan Application Workflow

1. Customer signs in using Google authentication.
2. Customer submits a loan application.
3. The application is stored with a `PENDING_REVIEW` status.
4. Loan officers view and review submitted applications.
5. The officer approves or rejects the application.
6. Rejection decisions require a reason.
7. Customers can view the updated application status through their dashboard.

## Database

The application uses MySQL with SQLAlchemy for database operations and Alembic for schema migrations.

Core entities:

- **Users:** Authentication, account roles and officer profile information.
- **Customers:** Customer profile information linked to user accounts.
- **Loan Applications:** Loan requests, application statuses and decision details.

## Security

- Google ID token verification during sign-in.
- JWT-based authentication for protected API endpoints.
- Role-based authorization.
- Customer-specific application access.
- Loan officer-only decision operations.
- Email and role fields are read-only through profile updates.

## Future Improvements

Potential future enhancements include:

- Loan repayment tracking.
- EMI calculation.
- Document uploads.
- Loan eligibility assessment.
- Notifications for application status changes.

## License

This project is developed for educational and portfolio purposes.