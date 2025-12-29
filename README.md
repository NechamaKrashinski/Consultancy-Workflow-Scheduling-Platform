# 🚀 Consultancy Workflow & Scheduling Platform


### 🌟 Project Overview

A full-stack, enterprise-grade application engineered to manage the complete lifecycle of B2B appointments between Clients, Consultants, and Admins. This platform utilizes a **Role-Based Access Control (RBAC)** system and a **State-Driven Workflow** to ensure secure and efficient service delivery.

---

### ✨ Key Features

* **Role-Based Access Control (RBAC):** Implementation of secure access separation for three distinct user roles: Client, Consultant, and Administrator.
* **State-Driven Workflow:** Logic designed to manage the appointment lifecycle (Request, Pending, Confirmed, Rejected), requiring dual approval for status changes.
* **Dynamic Filtering:** Advanced client-side filtering capabilities, allowing users to search and sort consultants by expertise (Taxonomy) and real-time availability.
* **Secure API:** Robust RESTful API built with **Node.js** and **Express**, secured using **JWT** authentication and **Bcrypt** for password hashing.
* **Admin Management:** Dedicated dashboard allowing administrators to onboard new consultants and dynamically link them to specific service areas.

---

### 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React, Redux (Global State Management), React Router |
| **Backend** | Node.js, Express, JWT, Bcrypt |
| **Database** | SQL (Managed by Sequelize ORM) |
| **Architecture** | RESTful APIs, OOP Principles, Normalized SQL Design (1:N, N:M) |

---

## 🧰 Utility scripts (development)

This repository includes a couple of small helper scripts used during development and testing. They are optional and intended for local use only.

- `npm run check-db` — Run a quick database health check that lists services, consultants, business hours and meetings using `check_database.js`.
- `npm run add-sample-data` — Insert sample services, a sample consultant, consultant-service links and business hours into a local SQLite database using `add_sample_data.js`.

Notes:
- These scripts assume a local SQLite file (default `database.sqlite`) unless you've modified the connection in the scripts.
- Never commit real database files or `.env` files containing secrets. A `.gitignore` is included to ignore `database.sqlite`, `node_modules/`, and common env files.
- If you don't want these scripts in the main repository, you can move them to a `scripts/` folder or remove them; they are provided to make local testing and demoing easier.

How to run (Windows PowerShell):

```powershell
npm install
npm run check-db
npm run add-sample-data
```

