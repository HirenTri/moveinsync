# MoveInSync: Vendor & Driver Management System Architecture

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [API Routes & Endpoints](#api-routes--endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Database Schema](#database-schema)
9. [User Roles & Permissions](#user-roles--permissions)
10. [Key Features](#key-features)

---

## System Overview

**MoveInSync** is a full-stack vendor and driver management system designed to manage a hierarchical organizational structure with role-based access control. The system handles:

- **User Registration & Authentication** via JWT tokens
- **Multi-role Support** (Super Vendor, Regional Vendor, Driver)
- **Vehicle Fleet Management** with assignment tracking
- **Driver License Documentation** with file uploads
- **Regional Zone Management** for vendor operations
- **Permission & Role Management** with custom permission assignment
- **Dashboard Analytics** showing metrics and statistics

### Key Objectives
✅ Manage multiple vendors at different hierarchy levels  
✅ Track driver-to-vehicle assignments  
✅ Manage driver licensing documents  
✅ Provide role-based access control  
✅ Generate region-specific dashboards and analytics  

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Login/Register  │  │   Role-Based     │  │  Protected   │  │
│  │     Pages        │  │   Dashboards     │  │   Routes     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│         │                       │                       │       │
│         └───────────┬───────────┴───────────┬──────────┘       │
│                     │                       │                  │
│           ┌─────────▼────────────────────────▼────┐            │
│           │      AuthContext & Token Manager     │            │
│           │  (JWT in localStorage)                │            │
│           └──────────────────┬───────────────────┘            │
│                              │                                 │
│        ┌─────────────────────▼──────────────────────┐          │
│        │     Axios HTTP Client (API Layer)         │          │
│        │  (Auto-adds JWT token to headers)         │          │
│        └──────────────────┬───────────────────────┘           │
└─────────────────────────┼───────────────────────────────────┘
                          │
                   (HTTP/CORS)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                 BACKEND (Express.js)                         │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │         JWT Authentication Middleware                 │ │
│  │  (Verifies token, extracts userId/role/region)        │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│  ┌─────────────┬─────────┼───────────┬──────────────┬─────┐ │
│  │ Auth Routes │ User    │ Vehicle   │ Driver Docs  │Stats│ │
│  │             │ Routes  │ Routes    │ Routes       │Route│ │
│  └─────────────┴─────────┼───────────┴──────────────┴─────┘ │
│                          │                                   │
│         ┌────────────────▼──────────────┐                   │
│         │  MongoDB Database             │                   │
│         │  (Collections: User, Vehicle, │                   │
│         │   DriverDoc, etc.)            │                   │
│         └───────────────────────────────┘                   │
│                                                              │
│         ┌────────────────────────────┐                      │
│         │  Redis Cache (Upstash)     │                      │
│         │  (Optional: Caching users) │                      │
│         └────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React** | UI framework with Hooks |
| **React Router** | Client-side routing |
| **Tailwind CSS** | Responsive styling (Dark theme) |
| **Axios** | HTTP client for API calls |
| **Context API** | State management (Auth) |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database (Atlas) |
| **Mongoose** | MongoDB ODM |
| **JWT** | Token-based authentication |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **CORS** | Cross-origin requests |
| **Upstash Redis** | Distributed caching (optional) |

### Deployment & Tools
| Tool | Purpose |
|------|---------|
| **Node.js** | Runtime environment |
| **npm** | Package manager |
| **Git** | Version control |
| **dotenv** | Environment variables |

---

## Core Components

### Frontend Components

#### 1. **AuthContext** (State Management)
```jsx
// src/context/AuthContext.jsx
// Manages: token, role, user data
// Provides: login(), logout() functions
// Stores: JWT in localStorage
```

**Key Functions:**
- `login(jwt, role)` - Saves token & role to localStorage
- `logout()` - Clears auth data
- Auto-fetches user profile on token change

#### 2. **PrivateRoute** (Route Protection)
```jsx
// src/components/PrivateRoute.jsx
// Checks: token exists & role matches allowed list
// Redirects: to login if not authenticated
// Redirects: to home if role not allowed
```

#### 3. **Sidebar** (Navigation)
```jsx
// src/components/Sidebar.jsx
// Displays: role-based navigation menu
// Shows: profile, logout button
// Highlights: active route with teal gradient
```

#### 4. **Dashboard Pages** (Role-Specific)
- **SuperVendorDashBoard**: Platform-wide metrics
- **RegionalVendorDashBoard**: Branch-level analytics
- **DriverDashBoard**: Personal profile & assignments

#### 5. **Management Pages** (Admin Functions)
- **SuperVendorAllUsers**: User list with permission toggle
- **SuperVendorVehicles**: Vehicle fleet management
- **RegionalVendorVehicles**: Regional vehicle inventory
- **AssignDriverToVehicles**: Driver-vehicle linking

---

### Backend Routes & Controllers

#### 1. **Authentication Routes** (`/api/auth`)
```
POST   /register          Register new user
POST   /login             Login & get JWT
GET    /me                Get current user profile
PATCH  /me                Update user (e.g., region)
GET    /me/permissions    Get user's custom permissions
```

#### 2. **Users Routes** (`/api/users`)
```
GET    /                  List all users (with Redis caching)
PATCH  /:userId/permissions  Update user permissions
```

#### 3. **Vehicles Routes** (`/api/vehicles`)
```
POST   /                  Create vehicle (multipart form-data)
GET    /                  List region-specific vehicles
GET    /all               List all vehicles (super/regional)
GET    /my-assigned       Get driver's assigned vehicles
PATCH  /:vehicleId/assign-driver     Link driver to vehicle
PATCH  /:vehicleId/unassign-driver   Unlink driver
DELETE /:vehicleId        Delete vehicle
```

#### 4. **Driver Documents Routes** (`/api/driver-docs`)
```
GET    /                  Get current driver's license
POST   /                  Upload/replace license file
GET    /region            Get all drivers' docs in region
```

#### 5. **Region Routes** (`/api/region`)
```
GET    /dashboard         Get region metrics & statistics
```

#### 6. **Stats Routes** (`/api/stats`)
```
GET    /super             Get super vendor dashboard stats
```

---

## Authentication & Authorization

### JWT Token Flow

```
1. USER REGISTERS/LOGS IN
   │
   ├─ POST /api/auth/register or /api/auth/login
   └─ Server creates JWT with (userId, role)
         JWT expires in 8 hours
         
2. CLIENT STORES TOKEN
   │
   ├─ localStorage.setItem('token', jwt)
   └─ AuthContext updates

3. CLIENT MAKES REQUEST
   │
   ├─ Axios adds header: Authorization: Bearer {token}
   └─ Server's authMw middleware verifies it

4. SERVER VERIFIES TOKEN
   │
   ├─ Extracts userId from JWT
   ├─ Fetches full user data from DB (role, region)
   ├─ Populates req.user object
   └─ Next middleware continues

5. PROTECTED ROUTE CHECKS ROLE
   │
   ├─ req.user.role matches allowed list?
   ├─ YES: Execute controller
   └─ NO: Return 403 Forbidden
```

### Code Example: Middleware

```javascript
// backend/src/middleware/auth.js
module.exports = async function(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh role & region from DB
    const user = await User.findById(decoded.userId)
      .select('role region customPermissions');
    
    req.user = {
      userId: decoded.userId,
      role: user.role,
      region: user.region,
      customPermissions: user.customPermissions || []
    };
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalid' });
  }
};
```

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
  firstName: String,
  lastName: String,
  role: Enum [
    'super_vendor',
    'regional_vendor', 
    'city_vendor',
    'local_vendor',
    'driver'
  ],
  vendorId: ObjectId (ref: Vendor),
  customPermissions: [String],
  region: Enum ['northern','southern','central','eastern','western'],
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle Collection
```javascript
{
  _id: ObjectId,
  registrationNumber: String (unique),
  model: String,
  seatingCapacity: Number,
  fuelType: Enum ['petrol','diesel','electric','hybrid'],
  region: String,
  rcFile: String (path to /uploads/...),
  permitFile: String,
  pollutionFile: String,
  assigned: Boolean (default: false),
  driverId: ObjectId (ref: User) or null,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### DriverDocument Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  docType: Enum ['license'] (default: 'license'),
  filePath: String (path to /uploads/...),
  uploadedAt: Date,
  vehicleId: ObjectId (ref: Vehicle) or null,
}
```

---

## User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────────┐
│       SUPER VENDOR (Platform Admin)         │
│  - View/manage all users across system      │
│  - View/manage all vehicles                 │
│  - Assign/revoke permissions to users       │
│  - View platform-wide analytics             │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────▼────────┐
          │ REGIONAL VENDOR │
          │  (Branch Mgr)   │
          └────────┬────────┘
                   │
     ┌─────────────┴──────────────┐
     │                            │
┌────▼────────────┐      ┌───────▼────┐
│   CITY VENDOR    │      │   DRIVER   │
│ (Metro Manager)  │      │(Fleet Staff)│
└──────────────────┘      └────────────┘
```

### Permission System

**Custom Permissions** can be assigned to any user via `/api/users/:userId/permissions`

Example custom permissions:
- `view_financials`
- `manage_drivers`
- `export_reports`
- `approve_documents`

```javascript
// Example: Grant permission to regional vendor
await api.patch('/users/userId/permissions', {
  customPermissions: ['manage_drivers', 'view_financials']
});
```

---

## Key Features

### 1. Vehicle Management

**Create Vehicle (with file uploads)**
```
POST /api/vehicles
Content-Type: multipart/form-data

Body:
- registrationNumber: "ABC123"
- model: "Toyota Innova"
- seatingCapacity: 7
- fuelType: "diesel"
- region: "northern"
- rcFile: <file>
- permitFile: <file>
- pollutionFile: <file>

Response: Vehicle object with paths to uploaded files
```

**Assign Driver to Vehicle**
```
PATCH /api/vehicles/:vehicleId/assign-driver

Body: { driverId: "userId" }

Process:
1. Verify driver has uploaded license document
2. Update vehicle.driverId = driverId
3. Update vehicle.assigned = true
4. Link DriverDoc.vehicleId = vehicleId
```

### 2. Driver Documentation

**Upload License**
```
POST /api/driver-docs
Content-Type: multipart/form-data

Body: { license: <file> }

Process:
1. Delete old document if exists
2. Save new file to /uploads
3. Create DriverDocument record
```

**View Regional Drivers & Licenses**
```
GET /api/driver-docs/region

Returns:
[
  {
    userId: "...",
    firstName: "...",
    lastName: "...",
    email: "...",
    filePath: "/uploads/...",
    uploadedAt: "2024-11-11T..."
  }
]

Authorization: regional_vendor only
```

### 3. Regional Zone Management

**Get Regional Dashboard**
```
GET /api/region/dashboard

Returns:
{
  totalDrivers: 45,
  totalVehicles: 12,
  driversAssigned: 10,
  vehiclesAssigned: 9,
  permissions: ["manage_drivers", "view_financials"]
}

Authorization: regional_vendor only
```

### 4. Redis Caching (Optional)

**Users Endpoint with Cache**
```javascript
// GET /api/users with 5-minute cache

const cacheKey = 'users:all';
const cached = await getCache(cacheKey);

if (cached) {
  return res.json(JSON.parse(cached));  // Hit
}

const users = await User.find().select(...);
await setCache(cacheKey, JSON.stringify(users), 300);
res.json(users);  // Miss
```

---

## Data Flow Examples

### Example 1: User Registration & Login

```
FLOW: User Registration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FRONTEND
   └─ User fills registration form
      (email, password, firstName, lastName, role)

2. POST /api/auth/register
   └─ Body: { email, password, firstName, lastName, role }

3. BACKEND Processing
   ├─ Check if user already exists
   ├─ Hash password with bcrypt (10 rounds)
   ├─ Create User document in MongoDB
   └─ Generate JWT: jwt.sign({ userId, role }, SECRET, 8h)

4. RESPONSE to Frontend
   └─ { token: "eyJhbG...", role: "super_vendor" }

5. FRONTEND Storage
   ├─ localStorage.setItem('token', token)
   ├─ localStorage.setItem('role', role)
   └─ AuthContext updates state

6. REDIRECT
   └─ RedirectByRole component sends user to their dashboard
      ├─ super_vendor → /super
      ├─ regional_vendor → /regional
      └─ driver → /driver
```

### Example 2: Vehicle Assignment Process

```
FLOW: Assign Driver to Vehicle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FRONTEND
   └─ Regional Vendor opens "Assign Driver to Vehicle" page
      └─ Fetches list of vehicles & unassigned drivers

2. USER ACTION
   └─ Selects vehicle + driver
      └─ Clicks "Assign" button

3. POST /api/vehicles/:vehicleId/assign-driver
   └─ Body: { driverId: "userId" }

4. BACKEND VALIDATION
   ├─ Find Vehicle by ID
   ├─ Check if driver has uploaded license document
   │  └─ Query DriverDocument.findOne({ userId: driverId })
   │  └─ If not found → return 400 error
   ├─ Update Vehicle
   │  └─ db.vehicles.updateOne(
   │       { _id: vehicleId },
   │       { assigned: true, driverId: driverId }
   │     )
   └─ Update DriverDocument
      └─ doc.vehicleId = vehicleId
         └─ doc.save()

5. RESPONSE
   └─ Return updated Vehicle object

6. FRONTEND UPDATE
   └─ Display success notification
      └─ Refresh vehicle list
         └─ Show vehicle now has "assigned" status

7. DATABASE STATE
   ├─ Vehicle.driverId = driverId ✓
   ├─ Vehicle.assigned = true ✓
   └─ DriverDocument.vehicleId = vehicleId ✓
```

### Example 3: Regional Dashboard Load

```
FLOW: Regional Vendor Loads Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FRONTEND
   └─ RegionalVendorDashboard component mounts
      └─ useEffect → api.get('/region/dashboard')

2. REQUEST
   └─ GET /api/region/dashboard
      └─ Header: Authorization: Bearer {jwt}

3. BACKEND AUTH CHECK
   ├─ authMw middleware intercepts
   ├─ Extracts & verifies JWT
   ├─ Fetches user from DB
   ├─ Extracts region from user.region
   └─ Calls next() with req.user populated

4. CONTROLLER LOGIC
   ├─ Verify role === 'regional_vendor'
   ├─ Get region from req.user.region
   ├─ Count drivers:
   │  └─ User.countDocuments({ role: 'driver', region })
   ├─ Count vehicles:
   │  └─ Vehicle.countDocuments({ region })
   ├─ Count assigned drivers:
   │  └─ Vehicle.distinct('driverId', { region, driverId: $ne null })
   ├─ Count assigned vehicles:
   │  └─ Vehicle.countDocuments({ region, assigned: true })
   └─ Fetch custom permissions:
      └─ User.findById(userId).select('customPermissions')

5. RESPONSE
   └─ {
        totalDrivers: 45,
        totalVehicles: 12,
        driversAssigned: 10,
        vehiclesAssigned: 9,
        permissions: ['manage_drivers']
      }

6. FRONTEND RENDERING
   ├─ Display metric cards with numbers
   ├─ Calculate percentages
   │  └─ Dispatch Rate = (vehiclesAssigned / totalVehicles) × 100
   │  └─ Staff Productivity = (driversAssigned / totalDrivers) × 100
   └─ Render charts/analytics
```

---

## API Request Examples

### 1. Login & Get Token
```bash
curl -X POST http://localhost:5005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "securepass123"
  }'

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "regional_vendor"
}
```

### 2. Get Current User Profile
```bash
curl -X GET http://localhost:5005/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "vendor@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "regional_vendor",
  "region": "northern",
  "customPermissions": ["manage_drivers"]
}
```

### 3. Create Vehicle with Documents
```bash
curl -X POST http://localhost:5005/api/vehicles \
  -H "Authorization: Bearer {token}" \
  -F "registrationNumber=ABC123" \
  -F "model=Toyota Innova" \
  -F "seatingCapacity=7" \
  -F "fuelType=diesel" \
  -F "region=northern" \
  -F "rcFile=@/path/to/rc.pdf" \
  -F "permitFile=@/path/to/permit.pdf" \
  -F "pollutionFile=@/path/to/pollution.pdf"

Response:
{
  "_id": "...",
  "registrationNumber": "ABC123",
  "model": "Toyota Innova",
  "seatingCapacity": 7,
  "fuelType": "diesel",
  "region": "northern",
  "rcFile": "/uploads/rc-abc123.pdf",
  "permitFile": "/uploads/permit-abc123.pdf",
  "pollutionFile": "/uploads/pollution-abc123.pdf",
  "assigned": false,
  "driverId": null,
  "createdAt": "2024-11-11T..."
}
```

### 4. Assign Driver to Vehicle
```bash
curl -X PATCH http://localhost:5005/api/vehicles/vehicleId/assign-driver \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "507f1f77bcf86cd799439012"
  }'

Response:
{
  "_id": "vehicleId",
  "registrationNumber": "ABC123",
  "assigned": true,
  "driverId": "507f1f77bcf86cd799439012"
}
```

### 5. Upload Driver License
```bash
curl -X POST http://localhost:5005/api/driver-docs \
  -H "Authorization: Bearer {token}" \
  -F "license=@/path/to/license.pdf"

Response:
{
  "_id": "...",
  "userId": "507f1f77bcf86cd799439012",
  "docType": "license",
  "filePath": "/uploads/license-driver123.pdf",
  "uploadedAt": "2024-11-11T..."
}
```

### 6. Get Regional Dashboard Stats
```bash
curl -X GET http://localhost:5005/api/region/dashboard \
  -H "Authorization: Bearer {token}"

Response:
{
  "totalDrivers": 45,
  "totalVehicles": 12,
  "driversAssigned": 10,
  "vehiclesAssigned": 9,
  "permissions": ["manage_drivers", "view_financials"]
}
```

---

## Frontend Page Flow

### Super Vendor Path
```
Login → SuperVendorDashBoard
    ├─ /super/users → SuperVendorAllUsers (Manage all users)
    ├─ /super/roles → SuperVendorAllRoles (Role management)
    ├─ /super/permissions → SuperVendorPermissions (Assign permissions)
    ├─ /super/vehicles → SuperVendorVehicles (Fleet management)
    ├─ /super/driver-overview → SuperVendorDriverOverview (Driver analytics)
    └─ /super/profile → SuperVendorProfile (Account settings)
```

### Regional Vendor Path
```
Login → RegionalVendorDashboard
    ├─ /regional/vehicles → RegionalVendorVehicles (My fleet)
    ├─ /regional/assign → AssignDriverToVehicles (Link drivers)
    ├─ /regional/licenses → RegionalVendorViewDrivers (Driver docs)
    └─ /regional/profile → RegionalVendorProfile (Account settings)
```

### Driver Path
```
Login → DriverDashboard
    ├─ Upload/View License (DriverDashBoard component)
    ├─ Select Region
    └─ View Assigned Vehicles
```

---

## Environment Configuration

### Backend `.env`
```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# JWT Secret
JWT_SECRET=your_secure_random_string_here

# Redis Cache (Optional)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_read_write_token

# Server
PORT=5005
```

### Frontend API Configuration
```javascript
// src/api/axiosClient.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5005/api'
});

// Auto-add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Security Features

| Feature | Implementation |
|---------|-----------------|
| **Password Hashing** | bcrypt with 10 salt rounds |
| **Token-Based Auth** | JWT with 8-hour expiration |
| **CORS** | Configured with credentials allowed |
| **Role-Based Access** | Checked at route level via middleware |
| **Custom Permissions** | Flexible per-user assignment |
| **File Upload Security** | Multer with filename sanitization, stored in `/uploads` |
| **Database Indexes** | Unique constraints on email, registration number |

---

## Deployment Checklist

- [ ] Set `MONGO_URI` to Atlas cluster
- [ ] Generate strong `JWT_SECRET`
- [ ] Configure Redis token (read/write permissions required)
- [ ] Set `REACT_APP_API_URL` to backend domain
- [ ] Enable CORS for frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure file upload path permissions
- [ ] Set up SSL/TLS certificates
- [ ] Enable database backups
- [ ] Configure rate limiting on API endpoints

---

## Future Enhancements

1. **Real-time Updates** - Socket.io for live dashboard updates
2. **Payment Integration** - Stripe/Razorpay for vendor subscriptions
3. **SMS/Email Notifications** - Twilio for alerts
4. **Advanced Analytics** - Charts, reports, data export
5. **Mobile App** - React Native or Flutter
6. **Two-Factor Authentication** - TOTP-based 2FA
7. **API Rate Limiting** - Prevent abuse
8. **Audit Logging** - Track all user actions
9. **Document Verification** - AI-powered OCR
10. **GPS Tracking** - Real-time vehicle location

---

## Troubleshooting

### Redis "NOPERM" Error
**Issue**: Redis throws "NOPERM: this user has no permissions to run the 'set' command"
**Solution**: Regenerate Redis token with full read/write permissions from Upstash console

### MongoDB Connection Timeout
**Issue**: "Operation buffering timed out after 10000ms"
**Solution**: Add your IP to MongoDB Atlas IP whitelist

### CORS Error
**Issue**: "No 'Access-Control-Allow-Origin' header is present"
**Solution**: Ensure `cors()` middleware is configured with `origin: true`

### JWT Verification Failed
**Issue**: Token invalid or expired
**Solution**: Clear localStorage and login again; verify `JWT_SECRET` matches

---

## Contact & Support

For questions about this architecture, please refer to:
- Backend: `/backend` directory
- Frontend: `/frontend` directory
- Database Models: `/backend/src/models`
- API Routes: `/backend/src/routes`

**Created**: November 2024  
**System**: MoveInSync Vendor & Driver Management Platform  
**Version**: 1.0.0
