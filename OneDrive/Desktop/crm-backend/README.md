# CRM / SRM Backend System

A production-ready corporate CRM/SRM backend built with **NestJS**, **PostgreSQL**, and **TypeORM**.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| PostgreSQL | Database |
| TypeORM | ORM & QueryBuilder |
| JWT + Passport | Authentication |
| Swagger | API Documentation |
| Helmet | Security headers |
| class-validator | Input validation |
| bcrypt | Password hashing |

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** or **yarn**

---

## Installation

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd crm-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=crm_srm_db

JWT_SECRET=your-super-secret-key-change-this

SUPER_ADMIN_EMAIL=superadmin@company.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123
```

### 3. Create database

```bash
psql -U postgres -c "CREATE DATABASE crm_srm_db;"
```

---

## Running the App

### Development mode (auto-sync schema)

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

---

## Database Migrations

> Note: In development, `synchronize: true` is set so schema auto-syncs.  
> For production, use migrations:

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/InitialSchema

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

---

## Seeding

Seed the database with the default **Super Admin** and sample departments:

```bash
npm run seed
```

Default Super Admin credentials after seeding:
- **Email:** `superadmin@company.com`
- **Password:** `SuperAdmin@123`

---

## Swagger API Documentation

After starting the server, open:

```
http://localhost:3000/api/docs
```

**How to authenticate in Swagger:**
1. Call `POST /api/v1/auth/login` with Super Admin credentials
2. Copy the `accessToken` from the response
3. Click the **Authorize** button (top right)
4. Enter: `Bearer <your_token>`
5. All protected endpoints are now accessible

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/register` | Super Admin | Register new user |
| GET | `/api/v1/auth/me` | All authenticated | Current user |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/users` | Super Admin | Create user |
| GET | `/api/v1/users` | Super Admin, Admin | List users (paginated) |
| GET | `/api/v1/users/me` | All | Own profile |
| GET | `/api/v1/users/statistics` | Super Admin | User stats |
| GET | `/api/v1/users/:id` | Super Admin, Admin | Get user |
| PATCH | `/api/v1/users/:id` | Super Admin, Admin | Update user |
| PATCH | `/api/v1/users/:id/role` | Super Admin | Assign role |
| PATCH | `/api/v1/users/:id/toggle-active` | Super Admin | Block/activate |
| DELETE | `/api/v1/users/:id` | Super Admin | Delete user |

### Departments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/departments` | Admin+ | Create department |
| GET | `/api/v1/departments` | Admin+ | List departments |
| GET | `/api/v1/departments/:id` | Admin+ | Get with employees |
| PATCH | `/api/v1/departments/:id` | Admin+ | Update |
| DELETE | `/api/v1/departments/:id` | Super Admin | Delete |
| POST | `/api/v1/departments/:id/employees` | Admin+ | Assign employee |
| DELETE | `/api/v1/departments/:id/employees/:userId` | Admin+ | Remove employee |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/tasks` | Admin+ | Create task |
| GET | `/api/v1/tasks` | All* | List tasks |
| GET | `/api/v1/tasks/statistics` | Admin+ | Task stats |
| GET | `/api/v1/tasks/:id` | All* | Get task |
| PATCH | `/api/v1/tasks/:id` | Admin+ | Update task |
| PATCH | `/api/v1/tasks/:id/status` | All* | Update status |
| DELETE | `/api/v1/tasks/:id` | Admin+ | Delete task |

> *Employees can only see/update their own assigned tasks

### Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/reports/dashboard` | Admin+ | Dashboard stats |
| GET | `/api/v1/reports/activity` | Admin+ | Activity log |
| GET | `/api/v1/reports/departments/:id` | Admin+ | Dept report |

---

## Query Parameters

All list endpoints support:

```
GET /api/v1/users?page=1&limit=10&search=john&sortBy=createdAt&sortOrder=DESC
```

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `search` | string | Full-text search |
| `sortBy` | string | Field to sort by |
| `sortOrder` | ASC/DESC | Sort direction |
| `role` | Role | Filter by role (users) |
| `status` | TaskStatus | Filter by status (tasks) |
| `priority` | TaskPriority | Filter by priority (tasks) |
| `departmentId` | UUID | Filter by department |
| `isActive` | boolean | Filter by active status |

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... },
  "statusCode": 201
}
```

### Paginated List
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["email must be an email"],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/users"
}
```

---

## Roles & Permissions

| Action | SUPER_ADMIN | ADMIN | EMPLOYEE |
|---|---|---|---|
| Create users | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ |
| Block/activate users | ✅ | ❌ | ❌ |
| View all users | ✅ | ✅ | ❌ |
| Manage departments | ✅ | ✅ | ❌ |
| Create/edit tasks | ✅ | ✅ | ❌ |
| View all tasks | ✅ | ✅ | own only |
| Update task status | ✅ | ✅ | own only |
| View reports | ✅ | ✅ | ❌ |
| View own profile | ✅ | ✅ | ✅ |

---

## Security Features

- **JWT Authentication** — stateless token-based auth
- **bcrypt** — passwords hashed with salt rounds 10
- **Helmet** — sets secure HTTP headers
- **Rate Limiting** — 100 requests per 60 seconds per IP
- **CORS** — configurable, restricted in production
- **Role-Based Access Control** — enforced at controller level
- **Global Validation** — all inputs validated via class-validator
- **Global Exception Filter** — consistent error responses

---

## Project Structure

```
src/
├── auth/                    # JWT authentication
│   ├── dto/
│   ├── strategies/          # Passport JWT strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                   # User management
│   ├── dto/
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── departments/             # Department management
│   ├── dto/
│   ├── entities/
│   └── ...
├── tasks/                   # Task management
│   ├── dto/
│   ├── entities/
│   └── ...
├── reports/                 # Reporting & analytics
│   └── ...
├── common/                  # Shared utilities
│   ├── decorators/          # @CurrentUser, @Roles
│   ├── filters/             # GlobalExceptionFilter
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── interceptors/        # LoggingInterceptor
│   ├── enums/               # Role, TaskStatus, TaskPriority
│   ├── dto/                 # PaginationQueryDto
│   └── interfaces/          # ApiResponse, PaginatedResponse
├── config/                  # App, DB, JWT configs
├── database/
│   ├── migrations/
│   ├── seeders/             # Super admin seeder
│   ├── data-source.ts
│   └── database.module.ts
├── app.module.ts
└── main.ts
```
