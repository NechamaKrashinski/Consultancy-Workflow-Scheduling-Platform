# 🚀 Business Consulting Platform - Frontend

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**Modern, responsive frontend for business consulting management**

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [🛠️ Development](#️-development) • [📱 Screenshots](#-screenshots)

</div>

---

## 📋 Overview

A modern, responsive **React** application built with **TypeScript** and **Tailwind CSS** for managing business consulting services. This professional frontend provides an intuitive interface for consultants and clients to manage appointments, services, and profiles.

This project was bootstrapped using the BOLT starter/boilerplate (Bolt.new) which provides common infrastructure and conventions for rapid development.

### 🎯 User Types
- **👨‍💼 Business Consultants** - Manage services, appointments, and client relationships
- **👥 Clients** - Book consultations, view schedules, and manage profiles
- **⚡ Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## ✨ Features

### 🎨 **Modern UI/UX**
- **Tailwind CSS** for consistent, beautiful design
- **Responsive Design** that works on all devices
- **Lucide React Icons** for beautiful iconography
- **Intuitive Navigation** with clear user flows
- **Loading States** and smooth transitions

### 🔐 **Authentication & Security**
- **JWT Token Management** with secure storage
- **Protected Routes** for authenticated users
- **Role-based Access Control** (Client/Consultant views)
- **Secure API Communication** with error handling

### 📅 **Appointment Management**
- **Meeting Booking System** for scheduling appointments
- **Real-time Availability** checking
- **Meeting Status** tracking (booked, available, pending, confirmed)
- **Client and Manager Dashboards** for appointment management

### 👤 **Profile Management**
- **User Authentication** with login/register
- **Role-based Profiles** (Client/Manager)
- **Consultant Management** with service linking
- **Meeting History** and status tracking

### 🎯 **Service Management**
- **Service Catalog** management
- **Consultant-Service** associations
- **Service Creation** and editing
- **Dynamic Service** display and booking

### 📱 **Responsive Experience**
- **Mobile-First** design approach
- **Touch-Friendly** interface
- **Cross-browser** compatibility
- **Optimized Performance** for all devices

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | React | ^18.3.1 |
| **Language** | TypeScript | ^5.5.3 |
| **Build Tool** | Vite | ^5.4.2 |
| **Styling** | Tailwind CSS | ^3.4.1 |
| **State Management** | Redux Toolkit | ^2.8.2 |
| **HTTP Client** | Axios | ^1.10.0 |
| **Routing** | React Router | ^6.22.0 |
| **Icons** | Lucide React | ^0.344.0 |
| **UI Components** | React Select | ^5.10.1 |
| **Starter / Boilerplate** | BOLT | (project-specific) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Backend API** running (see backend README)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/BusinessConsulting-Frontend.git
   cd BusinessConsulting-Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   ```bash
   # Navigate to http://localhost:5173
   ```

### 📦 Dependencies Installation (Detailed)

```bash
# Core React Dependencies
npm install react react-dom react-router-dom

# State Management
npm install @reduxjs/toolkit react-redux

# UI & Styling
npm install lucide-react react-select

# HTTP Client
npm install axios

# Development Dependencies
npm install --save-dev @types/react @types/react-dom
npm install --save-dev typescript @vitejs/plugin-react
npm install --save-dev tailwindcss postcss autoprefixer
npm install --save-dev eslint eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install --save-dev @eslint/js globals typescript-eslint
npm install --save-dev vite

# All Production Dependencies in one command:
npm install react react-dom react-router-dom @reduxjs/toolkit react-redux lucide-react react-select axios

# All Development Dependencies in one command:
npm install --save-dev @types/react @types/react-dom typescript @vitejs/plugin-react tailwindcss postcss autoprefixer eslint eslint-plugin-react-hooks eslint-plugin-react-refresh @eslint/js globals typescript-eslint vite
```

---

## 🔧 Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=Business Consulting Platform
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### 🎨 Tailwind CSS Setup

If starting from scratch, configure Tailwind CSS:

```bash
# Initialize Tailwind
npx tailwindcss init -p

# Update tailwind.config.js
{
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}

# Add to src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint (defined in package.json)

# Notes
# - The package.json for this project defines: "dev", "build", "lint", and "preview" scripts.
# - If you want type checking, testing or additional helper scripts (type-check, test, lint:fix, etc.), add them to package.json and install the required dev dependencies (for example jest, @types/jest, ts-node, or tsc).
```

### 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProtectedRoute.tsx
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
│   └── redux.ts        # Redux typed hooks
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── client/         # Client-specific pages
│   └── manager/        # Consultant-specific pages
├── services/           # API service layer
│   └── api.ts         # Axios configuration
├── store/              # Redux store configuration
│   ├── index.ts
│   └── slices/        # Redux slices
├── types/              # TypeScript type definitions
│   └── index.ts
└── styles/             # Global styles
    └── index.css
```

---

## 🎨 UI Components

### 🔧 **Component Library**
- **Button** - Various styles and states
- **Input** - Form inputs with validation  
- **Loading Indicators** - For async operations
- **Icons** - Lucide React icon set
- **Forms** - Login, registration, and booking forms

### 📱 **Page Components**
- **LoginPage** - Authentication interface
- **ClientDashboard** - Client appointment management
- **ManagerDashboard** - Consultant service management
- **BookingPage** - Appointment booking interface
- **MyMeetingsPage** - Meeting history and status
- **ServicesPage** - Service catalog management
- **MeetingsPage** - Meeting management for consultants
- **ConsultantService** - Service linking interface

---

## 🔄 State Management

### Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;                    // User authentication
  businessConsultant: ConsultantState; // Business consultant data
  consultantService: ServiceLinkState; // Service-consultant associations  
  meetings: MeetingState;             // Meeting management
  services: ServiceState;             // Service catalog
}
```

### 🔐 Authentication Flow

```typescript
// Login process
dispatch(loginUser({ email, password }))
  .unwrap()
  .then((response) => {
    // Store token
    localStorage.setItem('token', response.token);
    // Redirect to dashboard
    navigate('/dashboard');
  })
  .catch((error) => {
    // Handle error
    setError(error.message);
  });
```

---

## 📱 Responsive Design

### 🎯 Breakpoints (Tailwind CSS)

| Screen Size | Breakpoint | Usage |
|-------------|------------|--------|
| **Mobile** | `sm: 640px` | Phone layouts |
| **Tablet** | `md: 768px` | Tablet layouts |
| **Laptop** | `lg: 1024px` | Small desktop |
| **Desktop** | `xl: 1280px` | Large desktop |
| **4K** | `2xl: 1536px` | Extra large screens |

### 📐 Layout Examples

```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  
// Responsive navigation
<nav className="flex flex-col md:flex-row items-center">

// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
```

---

## 🔌 API Integration

### 🌐 Service Layer

```typescript
// API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 📡 Example API Calls

```typescript
// Authentication
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post('/login', credentials),
  
  register: (userData: RegisterData) => 
    api.post('/login/register', userData),
};

// Appointments
export const appointmentAPI = {
  getAppointments: () => api.get('/meetings'),
  createAppointment: (data: AppointmentData) => 
    api.post('/meetings', data),
};
```

---

## 🎨 Styling Guide

### 🎯 **Tailwind CSS Classes**

```css
/* Common patterns */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors;
}

.card {
  @apply bg-white shadow-md rounded-lg p-6 border border-gray-200;
}

.input-field {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
}
```

### 🌈 **Color Palette**

```css
/* Primary colors */
--primary: #3B82F6;      /* Blue */
--primary-dark: #1D4ED8;
--secondary: #10B981;     /* Green */
--accent: #F59E0B;       /* Amber */

/* Neutral colors */
--gray-50: #F9FAFB;
--gray-900: #111827;
```

---

## 🧪 Testing

### Testing Structure

```bash
src/
├── __tests__/          # Test files
│   ├── components/     # Component tests
│   ├── pages/         # Page tests
│   └── utils/         # Utility tests
├── __mocks__/          # Mock files
└── setupTests.ts       # Test configuration
```

### Example Tests

```typescript
// Component test
describe('LoginPage', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});

// API test
describe('authAPI', () => {
  it('should login successfully', async () => {
    const response = await authAPI.login({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(response.data.success).toBe(true);
  });
});
```

---

## 🚀 Deployment

### 🏗️ Build Process

```bash
# Production build
npm run build

# Build output
dist/
├── assets/           # Compiled CSS/JS
├── index.html       # Main HTML file
└── ...             # Static assets
```

### ☁️ Deployment Platforms

| Platform | Command | Notes |
|----------|---------|-------|
| **Vercel** | `vercel --prod` | Zero-config deployment |
| **Netlify** | `netlify deploy --prod --dir=dist` | Drag & drop or CLI |
| **GitHub Pages** | `npm run deploy` | Static hosting |
| **Railway** | Connect GitHub repo | Auto-deployment |

### 🔧 Environment-specific Builds

```bash
# Development
VITE_API_BASE_URL=http://localhost:3000 npm run build

# Staging
VITE_API_BASE_URL=https://api-staging.example.com npm run build

# Production
VITE_API_BASE_URL=https://api.example.com npm run build
```

---

## 📈 Performance Optimization

### ⚡ **Optimization Techniques**
- **Code Splitting** with React.lazy()
- **Bundle Analysis** with vite-bundle-analyzer
- **Image Optimization** with proper formats
- **Lazy Loading** for non-critical components
- **Memoization** with React.memo and useMemo

### 📊 **Performance Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 500KB gzipped

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📝 **Code Standards**
- Use **TypeScript** for type safety
- Follow **React Hooks** patterns
- Use **Tailwind CSS** for styling
- Write **unit tests** for components
- Follow **ESLint** configuration

---

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache
rm -rf node_modules .vite
npm install

# Type checking
npm run type-check
```

#### API Connection Issues
```bash
# Check environment variables
echo $VITE_API_BASE_URL

# Test API endpoint
curl http://localhost:3000/health
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for beautiful styling
- Redux Toolkit for state management
- Vite for lightning-fast builds
- Bolt.new
- All open-source contributors

---

<div align="center">

**⭐ Star this repository if it helped you! ⭐**

Made with ❤️ and ⚡ for modern web development

</div>
