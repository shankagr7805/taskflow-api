
# TaskFlow API

> A full-stack task management application built with **Node.js**, **Express.js**, **Sequelize**, **MySQL**, **JWT Authentication**, and a lightweight **Vanilla JavaScript** frontend.

TaskFlow demonstrates secure authentication, role-based authorization, task management, Swagger API documentation, optional Redis caching, and Docker support. The project can be run either locally or entirely with Docker.

---

## Features

- JWT Authentication & Authorization
- bcrypt Password Hashing
- Role-Based Access Control (Admin/User)
- User Registration & Login
- CRUD Operations for Tasks
- Admin Dashboard
- Swagger / OpenAPI Documentation
- Postman Collection
- Express Validator
- Centralized Error Handling
- Optional Redis Caching
- Docker & Docker Compose Support

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | Node.js, Express.js, Sequelize |
| Database | MySQL 8 |
| Cache | Redis (Optional) |
| Authentication | JWT, bcrypt |
| Validation | express-validator |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Documentation | Swagger, OpenAPI, Postman |
| DevOps | Docker, Docker Compose |

---

## Project Structure

```text
taskflow-api/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── docs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
├── postman/
├── docker-compose.yml
├── SCALABILITY.md
└── README.md
```

---

## Architecture

```text
Browser
   │
   ▼
Vanilla JS Frontend
   │
   ▼
Express REST API
   │
 ┌─┴─────────┐
 ▼           ▼
MySQL   Redis (Optional)
```

---

# Local Development

## 1. Start MySQL & Redis

```bash
docker compose up -d mysql redis
```

| Service | Port |
|---------|------|
| MySQL | 3310 |
| Redis | 6383 |

## 2. Install Backend

```bash
cd backend
npm install
cp .env.example .env
```

## 3. Configure Environment

```env
PORT=5001
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
ADMIN_SIGNUP_CODE=letmein-admin

DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3310
DB_NAME=taskflow
DB_USER=root
DB_PASSWORD=taskflow_dev_pass

REDIS_URL=
CLIENT_ORIGIN=http://127.0.0.1:5500
```

## 4. Start Backend

```bash
npm start
```

Swagger:

- Local: http://localhost:5001/api-docs

---

## Seed Demo Data

```bash
npm run seed
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskflow.dev | admin1234 |
| User | user@taskflow.dev | user1234 |

---

## Frontend

```bash
cd frontend
python3 -m http.server 5500 --bind 127.0.0.1
```

Open:

http://127.0.0.1:5500

The frontend is designed to use the Docker backend (port 5000) when available and otherwise connect to the locally running backend (port 5001).

---

# Docker

Run everything:

```bash
docker compose up --build
```

| Service | Host Port |
|---------|-----------|
| API | 5000 |
| MySQL | 3310 |
| Redis | 6383 |

Stop:

```bash
docker compose down
```

Reset volumes:

```bash
docker compose down -v
```

Seed:

```bash
docker compose exec api npm run seed
```

---

# Redis Caching

Redis is **optional**.

- Enabled only when `REDIS_URL` is configured.
- Uses **ioredis**.
- Automatically falls back to MySQL if Redis is unavailable.
- Cache failures never interrupt API requests.
- Default cache TTL: **30 seconds**.
- Supports cache invalidation after task updates.

---

# API Documentation

Swagger

- Local: http://localhost:5001/api-docs
- Docker: http://localhost:5000/api-docs

Postman Collection:

```text
postman/TaskFlow-API.postman_collection.json
```

---

# API Endpoints

| Method | Endpoint | Access |
|---------|----------|--------|
| POST | /api/v1/auth/register | Public |
| POST | /api/v1/auth/login | Public |
| GET | /api/v1/auth/me | User |
| POST | /api/v1/tasks | User |
| GET | /api/v1/tasks | User |
| GET | /api/v1/tasks/:id | Owner/Admin |
| PUT | /api/v1/tasks/:id | Owner/Admin |
| DELETE | /api/v1/tasks/:id | Owner/Admin |
| GET | /api/v1/admin/users | Admin |
| PATCH | /api/v1/admin/users/:id/role | Admin |

---

# Security

- JWT Authentication
- bcrypt password hashing
- Helmet security headers
- CORS protection
- Request validation
- Role-based authorization
- SQL injection protection via Sequelize

---

# Scalability

- Stateless JWT authentication
- Optional Redis caching
- Docker containerization
- Horizontal scaling ready
- Database indexing

See `SCALABILITY.md` for details.

---

# Future Improvements

- Refresh Tokens
- Email Verification
- Password Reset
- Search & Pagination
- File Attachments
- CI/CD
- Unit & Integration Tests
- Kubernetes Deployment

---

# Screenshots

```text
screenshots/
├── login.png
├── dashboard.png
└── admin-dashboard.png
```

---

# Author

**Shankar Kumar**

B.Tech CSE, IIIT Bhopal

GitHub: https://github.com/<your-username>

LinkedIn: https://linkedin.com/in/<your-profile>

---

# License

Developed for educational purposes and internship evaluation.
