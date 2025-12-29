# 🏢 Business Consulting Platform - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**Enterprise-grade RESTful API for business consulting management**

[🚀 Features](#-features) • [📦 Installation](#-installation) • [🛠️ API Documentation](#-api-documentation) • [🔧 Configuration](#-configuration)

</div>

---

## 📋 Overview

Robust, scalable backend API built with **Node.js** and **Express.js** for managing business consulting services. The codebase provides functionality for consultant-client relationship management, appointment scheduling, and service delivery.

This README focuses on how to run and configure the backend. The canonical implementation details (exact package versions and scripts) are in `BusinessConsulting-node/package.json`.

---

## ✨ Features

- JWT authentication and role-based access
- BCrypt password hashing
- Input validation with Joi
- Rate limiting and basic abuse protection
- Sequelize ORM configured for Microsoft SQL Server
- Swagger/OpenAPI documentation
- Robust logging with log4js

---

## 🛠️ Technology Stack (high level)

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (20+) |
| Framework | Express.js |
| Database | Microsoft SQL Server (mssql) |
| ORM | Sequelize |
| Auth | JWT, bcrypt |
| Validation | Joi |
| Logging | log4js |

> Note: For exact package versions see `BusinessConsulting-node/package.json`.

---

## 📦 Installation

### Prerequisites
- Node.js 20+ (recommended)
- Microsoft SQL Server 2019+
- npm or yarn

### Quick Start

1. Clone the repository

```powershell
git clone https://github.com/yourusername/BusinessConsulting-Backend.git
cd BusinessConsulting-Backend
```

2. Install dependencies

```powershell
npm install
# or: npm ci (when running from a clean checkout / CI)
```

3. Environment setup (cross-platform)

```powershell
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (cmd)
copy .env.example .env

# Or create a new .env file and copy the contents of .env.example into it, then edit values as needed.
```

4. Configure the database connection in `.env` (DB_HOST / DB_USER / DB_PASSWORD / DB_NAME / DB_PORT)

5. Start the server

```powershell
# Production (process manager / container)
npm start    # runs `node app.js`

# Development (hot reload)
npm run dev  # runs `nodemon app.js`
```

---

## 🔧 Configuration

Create or edit the `.env` file in the project root. Example values are in `.env.example`.

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
DB_NAME=BusinessConsulting
DB_PORT=1433

# Security
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
JWT_EXPIRATION=7d
```

Security notes:
- Do NOT commit `.env` to source control. Add it to `.gitignore`.
- Use a secrets manager (CI/CD secret store, Vault, etc.) in production for `JWT_SECRET` and DB credentials.
- JWT_SECRET should be long and random (the server enforces a minimum length).

---

## 🗄️ Database

1. Create the database in SQL Server if not present:

```sql
CREATE DATABASE BusinessConsulting;
```

2. The application uses Sequelize; on startup it runs `authenticate()` and `sync()` by default to create/synchronize models. Review models before running in production; consider running migrations instead of `sync({ force: true })` for production environments.

---

## 🛠️ API Documentation

Interactive docs are available when the server is running at:

```
http://localhost:3000/api-docs
```

Endpoint summary (illustrative):

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/login` | POST | User authentication | No |
| `/login/register` | POST | Client registration | No |
| `/login/add-manager` | POST | Consultant registration | Yes |
| `/meetings` | GET/POST | Meeting management | Yes |
| `/services` | GET/POST | Service management | Yes |
| `/business-hours` | GET/POST | Availability management | Yes |
| `/profile` | GET/PUT | Profile management | Yes |

> Note: This table is a convenience summary. For the canonical routes and full request/response schemas, inspect the router files under `BusinessConsulting-node/routers/` (for example `authRouter.js`, `meetingRouter.js`).

### Consultant onboarding (ADMIN ONLY)

Important: This deployment is intended for a private business where only the administrator may add or onboard consultants. There is no public self-registration flow for consultants. The following guidance describes the recommended workflow and API/migration changes to enforce that policy.

- Admin-only creation: Consultants should be created by an admin user (role = `admin`) through an authenticated admin endpoint, for example `POST /admin/consultants`.
- Example create payload (admin):

```json
{
   "first_name": "Jane",
   "last_name": "Doe",
   "email": "jane@example.com",
   "phone": "050-1234567",
   "expertise": ["tax","finance"],
   "services": [1,2],
   "status": "active"
}
```

- Approval workflow (optional): If you prefer an approval step, admins can create consultants with `status: "pending"` and then approve them later. Approve/reject endpoints examples:

   - `GET /admin/consultants?status=pending` — list pending consultants
   - `PATCH /admin/consultants/:id` with body `{ "status": "active" }` — approve
   - `PATCH /admin/consultants/:id` with body `{ "status": "rejected" }` — reject

- Restrict or remove public endpoints: If the codebase exposes an endpoint such as `/login/add-manager` for consultant registration, restrict it to admin role or remove it entirely to prevent public creation.

- Security: All admin endpoints must be protected by authentication and an authorization check (middleware that verifies `req.user.role === 'admin'`). Rate limiting and audit logging should be enabled for these endpoints.

- Model recommendation: Add a `status` field to the BusinessConsultant model (ENUM or VARCHAR) with values like `pending|active|rejected` (or a boolean `is_approved`) so the system can reliably filter only active consultants in public listings.

> Note: After implementing admin-only onboarding, public API routes that return consultants (e.g., `/services` or `/business-consultants`) must filter to `status = 'active'` to avoid exposing unapproved accounts.

---

## 📊 Logging & Monitoring

- Logs are configured via `log4js.json` and written to the `logs/` directory (app, auth, database, errors).
- Logging levels and appenders can be adjusted in `log4js.json`.

---

## 🚀 Deployment

### Docker (example)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Recommendations
- Use a process manager (PM2, systemd) or container orchestrator for production.
- Do not rely on `sync()` in production without careful schema management. Use migrations.

---

## 🔒 Security Features & Notes

- JWT-based authentication (token signing/verification)
- BCrypt password hashing for stored credentials
- Input validation via Joi to reduce injection risk
- express-rate-limit configured for common endpoints

Security caveats:
- Performance/security claims in this README are goals and must be validated with load testing before relying on them in production.

---

## 🧪 Testing

```powershell
# Run unit/integration tests
npm test
```

This project includes a basic Jest configuration; adding more tests (unit + integration with a test database or mocks) is recommended.

---

## 📈 Performance targets

- Response time (target): &lt; 100ms average (depends on hardware and workload)
- Throughput (target): 1000+ requests/min (requires tuning and load-testing)
- Uptime target: 99.9%

> These are targets/goals. They are not measured by the project automatically — run load tests (k6, Artillery, JMeter) to validate in your environment.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow the code style and include tests for new behavior.

---

## 📄 License

MIT — see the `LICENSE` file.

---

## 👨‍💻 Author

Replace with your info before publishing:

- Name: Your Name
- GitHub: @yourusername
- Email: your.email@example.com

---

Made with ❤️ and ☕ for the business consulting community
# 🏢 Business Consulting Platform - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**Enterprise-grade RESTful API for business consulting management**

[🚀 Features](#-features) • [📦 Installation](#-installation) • [🛠️ API Documentation](#️-api-documentation) • [🔧 Configuration](#-configuration)

</div>

---

## 📋 Overview

A robust, scalable backend API built with **Node.js** and **Express.js** for managing business consulting services. This enterprise-grade solution provides comprehensive functionality for consultant-client relationship management, appointment scheduling, and service delivery.

### 🎯 Built For
- **Business Consultants** - Manage clients, services, and appointments
- **Clients** - Book consultations and track progress  
- **Administrators** - Oversee platform operations and analytics

---

## ✨ Features

### 🔐 **Security & Authentication**
- **JWT-based Authentication** with cryptographically secure tokens
- **BCrypt Password Hashing** for maximum security
- **Input Validation** using Joi schemas with Hebrew support
- **Rate Limiting** protection against DDoS and brute force attacks
- **Environment-based Security** configurations

### 👥 **User Management**
- **Multi-role System** (Clients, Consultants, Administrators)
- **Profile Management** with secure data handling
- **Registration & Login** with comprehensive validation

### 📅 **Appointment System**
- **Smart Scheduling** with availability checking
- **Time Slot Management** for consultants
- **Meeting Status Tracking** (Scheduled, Completed, Cancelled)
- **Conflict Prevention** and double-booking protection

### 🎯 **Service Management**
- **Service Catalog** management
- **Consultant-Service Associations**
- **Dynamic Pricing** and availability
- **Service Categories** and descriptions

### 📊 **Enterprise Features**
- **Professional Logging** with log4js (file rotation, compression)
- **API Documentation** with Swagger/OpenAPI
- **Database Transactions** and connection pooling
- **Error Handling** with structured responses
- **Environment Validation** for deployment safety

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 20+ |
| **Framework** | Express.js | ^5.1.0 |
| **Database** | Microsoft SQL Server | 2019+ |
| **ORM** | Sequelize | ^6.37.0 |
| **Authentication** | JWT + BCrypt | Latest |
| **Validation** | Joi | ^18.0.0 |
| **Logging** | log4js | ^6.9.0 |
| **Documentation** | Swagger UI | ^5.0.0 |
| **Security** | express-rate-limit | ^8.0.0 |

---

## 📦 Installation

### Prerequisites
- **Node.js** 20.0.0 or higher
- **Microsoft SQL Server** 2019 or higher
- **npm** or **yarn** package manager

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/BusinessConsulting-Backend.git
   cd BusinessConsulting-Backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Configuration**
   ```bash
   # Create your SQL Server database
   # Update connection details in .env
   ```

5. **Start the Server**
   ```bash
   # Production (current script available)
   npm start
   
   # Note: Development script needs to be added to package.json
      ```bash
      # Linux / macOS
      cp .env.example .env

      # Windows (PowerShell)
      Copy-Item .env.example .env

      # Windows (cmd)
      copy .env.example .env

      # Or create a new .env file and copy the contents of .env.example into it, then edit values as needed
      # Edit .env with your configuration

```bash
# Development tools (recommended)
npm install --save-dev nodemon concurrently

# Manual setup required: Add these scripts to package.json:
# "scripts": {
#   "start": "node app.js",
#   "dev": "nodemon app.js",
#   "test": "echo \"Error: no test specified\" && exit 1"
      # Production
      npm start    # runs `node app.js`

      # Development (hot reload)
      npm run dev  # runs `nodemon app.js` (dev dependency)
```bash
# Core Framework & Database
npm install express sequelize tedious mssql

# Authentication & Security
npm install bcrypt jsonwebtoken joi express-rate-limit

# Documentation & API
npm install swagger-ui-express swagger-jsdoc

# Utilities & Middleware
npm install cors dotenv express-async-handler log4js axios

# All in one command:
npm install express sequelize tedious mssql bcrypt jsonwebtoken joi express-rate-limit swagger-ui-express swagger-jsdoc cors dotenv express-async-handler log4js axios
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=BusinessConsulting
DB_PORT=1433

# Security Configuration
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
JWT_EXPIRATION=7d
```

> Security note: Do not commit your `.env` file or secrets to source control. Use `.gitignore` to exclude `.env` and prefer storing production secrets in a secure secrets manager (CI/CD secret store, Vault, etc.).

> Versions: the package versions listed in this README are recommendations — the authoritative versions used by this project are specified in `BusinessConsulting-node/package.json`.
### 🗄️ Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE BusinessConsulting;
   ```

2. **Run the Application**
   ```bash
   npm start
   # Tables will be created automatically via Sequelize
   ```

---

## 🛠️ API Documentation

### 📚 Interactive Documentation
Access the full API documentation at: `http://localhost:3000/api-docs`

### 🔗 Main Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/login` | POST | User authentication | ❌ |
| `/login/register` | POST | Client registration | ❌ |
| `/login/add-manager` | POST | Consultant registration | ❌ |
| `/meetings` | GET/POST | Meeting management | ✅ |
| `/services` | GET/POST | Service management | ✅ |
| `/business-hours` | GET/POST | Availability management | ✅ |
| `/profile` | GET/PUT | Profile management | ✅ |

### 📝 Request/Response Examples

#### Authentication
```javascript
// POST /login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

// Response
{
  "success": true,
  "message": "התחברות בוצעה בהצלחה",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "loginTime": "2025-01-06T10:30:00Z"
  }
}
```

---

## 📊 Logging & Monitoring

### 📁 Log Files Structure
```
logs/
├── app.log        # General application logs
├── auth.log       # Authentication events
├── database.log   # Database operations
└── errors.log     # Error tracking
```

### 🔍 Log Levels
- **INFO** - General operations
- **WARN** - Warning conditions
- **ERROR** - Error conditions
- **DEBUG** - Detailed debug information

---

## 🚀 Deployment

### 🐳 Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### ☁️ Cloud Deployment
Recommended platforms:
- **Railway** - One-click deployment
- **Render** - Free tier available
- **AWS EC2** - Enterprise scaling
- **Azure App Service** - Microsoft stack

---

## 🔒 Security Features

- ✅ **JWT Authentication** with secure tokens
- ✅ **Password Hashing** using BCrypt
- ✅ **Input Validation** and sanitization
- ✅ **Rate Limiting** protection
- ✅ **CORS** configuration
- ✅ **Environment Validation**
- ✅ **SQL Injection** prevention
- ✅ **XSS Protection**

---

## 🧪 Testing

```bash
# Current status: Basic test setup available
npm test  # Currently shows "Error: no test specified"

# Recommended: Add proper testing framework
npm install --save-dev jest supertest
# Then configure test scripts in package.json
```

---

## 📈 Performance

- **Response Time**: < 100ms average
- **Throughput**: 1000+ requests/minute
- **Uptime**: 99.9% availability target
- **Database**: Connection pooling and query optimization

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Express.js community for the excellent framework
- Sequelize team for the robust ORM
- log4js contributors for professional logging
- All open-source contributors who made this possible

---

<div align="center">

**⭐ Star this repository if it helped you! ⭐**

</div>

