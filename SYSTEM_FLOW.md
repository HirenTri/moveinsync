# MoveInSync: System Flow Diagrams

## 1. High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │  Login/Register     │  │  Role-Based      │  │   Management Pages │ │
│  │  (/login)           │  │  Dashboards      │  │   (Users, Vehicles,│ │
│  │                     │  │  (/super/*)      │  │    Drivers, etc)   │ │
│  │  - Email/Password   │  │  (/regional/*)   │  │                    │ │
│  │  - Role selection   │  │  (/driver/*)     │  │  - CRUD operations │ │
│  │                     │  │                  │  │  - File uploads    │ │
│  └──────────┬──────────┘  └────────┬─────────┘  └────────┬───────────┘ │
│             │                      │                     │              │
│             └──────────────┬───────┴─────────────────────┘              │
│                            │                                            │
│  ┌─────────────────────────▼──────────────────────────────────────┐    │
│  │         React Router + Context API (Auth State)               │    │
│  │  - AuthContext: { token, role, user, login, logout }          │    │
│  │  - localStorage: stores JWT token                             │    │
│  │  - PrivateRoute: protects routes by role                      │    │
│  └─────────────────────────┬──────────────────────────────────────┘    │
│                            │                                            │
│  ┌─────────────────────────▼──────────────────────────────────────┐    │
│  │         Axios HTTP Client (API Layer)                         │    │
│  │  - Interceptor: auto-adds Authorization header                │    │
│  │  - Baseurl: http://localhost:5005/api                         │    │
│  │  - Methods: get, post, patch, delete                          │    │
│  └─────────────────────────┬──────────────────────────────────────┘    │
│                            │                                            │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
                      (HTTP over CORS)
                             │
┌────────────────────────────▼────────────────────────────────────────────┐
│                       SERVER LAYER (Express.js)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  JWT Authentication Middleware                                │   │
│  │  - Extracts token from Authorization header                   │   │
│  │  - Verifies JWT signature with JWT_SECRET                    │   │
│  │  - Fetches user from DB to get role & region                 │   │
│  │  - Sets req.user = { userId, role, region, permissions }     │   │
│  │  - Passes to next middleware/route handler                   │   │
│  └────────────┬──────────────────────────────────────────────────┘   │
│               │                                                       │
│  ┌────────────▼──────────────────────────────────────────────────┐   │
│  │              ROUTE HANDLERS                                   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  POST   /api/auth/register      → Create user + generate JWT│   │
│  │  POST   /api/auth/login         → Validate creds + JWT      │   │
│  │  GET    /api/auth/me            → Get user profile          │   │
│  │  PATCH  /api/auth/me            → Update user (region, etc) │   │
│  │  GET    /api/auth/me/permissions → Get custom permissions   │   │
│  │                                                              │   │
│  │  GET    /api/users              → List all users (cached)   │   │
│  │  PATCH  /api/users/:id/permissions → Update permissions     │   │
│  │                                                              │   │
│  │  POST   /api/vehicles           → Create vehicle            │   │
│  │  GET    /api/vehicles           → List region vehicles      │   │
│  │  GET    /api/vehicles/all       → List all vehicles         │   │
│  │  PATCH  /api/vehicles/:id/assign-driver → Link driver       │   │
│  │  PATCH  /api/vehicles/:id/unassign-driver → Unlink driver   │   │
│  │  DELETE /api/vehicles/:id       → Delete vehicle            │   │
│  │  GET    /api/vehicles/my-assigned → Driver's vehicles       │   │
│  │                                                              │   │
│  │  POST   /api/driver-docs        → Upload license            │   │
│  │  GET    /api/driver-docs        → Get my license            │   │
│  │  GET    /api/driver-docs/region → List regional drivers     │   │
│  │                                                              │   │
│  │  GET    /api/region/dashboard   → Regional metrics          │   │
│  │  GET    /api/stats/super        → Super vendor stats        │   │
│  │                                                              │   │
│  └────────────┬──────────────────────────────────────────────────┘   │
│               │                                                       │
│  ┌────────────▼──────────────────────────────────────────────────┐   │
│  │              DATABASE OPERATIONS                              │   │
│  │  - Mongoose models query MongoDB                              │   │
│  │  - Models: User, Vehicle, DriverDocument, Permission, etc     │   │
│  │  - Validation: unique indexes, enum checks, required fields   │   │
│  └────────────┬──────────────────────────────────────────────────┘   │
│               │                                                       │
└───────────────┼───────────────────────────────────────────────────────┘
                │
         (TCP Connection)
                │
┌───────────────▼───────────────────────────────────────────────────────┐
│                      DATA PERSISTENCE LAYER                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────┐    ┌───────────────────────────┐   │
│  │  MongoDB (Atlas)           │    │  Redis Cache (Upstash)    │   │
│  │                            │    │                           │   │
│  │  Collections:              │    │  Keys:                    │   │
│  │  - users                   │    │  - users:all (5 min TTL)  │   │
│  │  - vehicles                │    │                           │   │
│  │  - driverdocuments         │    │  Improves performance of  │   │
│  │  - permissions             │    │  GET /api/users endpoint  │   │
│  │  - rolepermissions         │    │                           │   │
│  │                            │    │                           │   │
│  │  Indexes:                  │    │  Usage Pattern:           │   │
│  │  - users.email (unique)    │    │  1. Check cache          │   │
│  │  - vehicles.registrationNo │    │  2. If miss, query DB    │   │
│  │  - vehicles.region         │    │  3. Cache result         │   │
│  │  - vehicles.driverId       │    │  4. Return data          │   │
│  │                            │    │                           │   │
│  └────────────────────────────┘    └───────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flow

```
START: User lands on Login page
       │
       ▼
┌─────────────────────────────────┐
│ User enters credentials         │
│ - email                         │
│ - password                      │
│ - role (registration only)      │
└────────────┬────────────────────┘
             │
        ┌────▼─────────────────────────┐
        │ Choose path                  │
        ├──────────────────────────────┤
        │ [LOGIN]        │  [REGISTER] │
        └────┬────────────────┬────────┘
             │                │
        ┌────▼──────┐    ┌────▼──────────────────┐
        │  POST     │    │  POST                 │
        │  /login   │    │  /register            │
        └────┬──────┘    └────┬───────────────────┘
             │                │
        ┌────▼──────────────────────────────┐
        │  Backend Validation                │
        ├────────────────────────────────────┤
        │  ✓ User exists?                    │
        │  ✓ Password matches (bcrypt)?      │
        │  ✓ Email not already registered?   │
        │  ✓ Role is valid enum?             │
        └────┬───────────────────────────────┘
             │
        ┌────▼──────────────────────┐     ┌──────────────────────┐
        │ Create JWT                │     │ Return Error (401/400)│
        │ Payload:                  │     └──────────────────────┘
        │ {                         │
        │   userId: "...",          │
        │   role: "super_vendor",   │
        │   iat: 1234567890,        │
        │   exp: 1234567890 + 8h    │
        │ }                         │
        │ Sign with JWT_SECRET      │
        └────┬─────────────────────┘
             │
        ┌────▼─────────────────────────────────┐
        │ Response to Frontend                 │
        │ {                                   │
        │   "token": "eyJhbGc...",             │
        │   "role": "super_vendor"             │
        │ }                                   │
        └────┬─────────────────────────────────┘
             │
        ┌────▼──────────────────────────────┐
        │ Frontend: AuthContext.login()      │
        ├─────────────────────────────────┤
        │ localStorage.setItem('token',   │
        │   token)                        │
        │ localStorage.setItem('role',    │
        │   role)                         │
        │ setToken(token)                 │
        │ setRole(role)                   │
        └────┬──────────────────────────────┘
             │
        ┌────▼──────────────────────────────┐
        │ useEffect triggers on token      │
        │ change                          │
        ├─────────────────────────────────┤
        │ api.get('/auth/me')             │
        │  ↓                              │
        │ setUser(response.data)          │
        └────┬──────────────────────────────┘
             │
        ┌────▼──────────────────────────────┐
        │ App.js RedirectByRole             │
        ├─────────────────────────────────┤
        │ if role === "super_vendor"      │
        │   → redirect /super             │
        │ if role === "regional_vendor"   │
        │   → redirect /regional          │
        │ if role === "driver"            │
        │   → redirect /driver            │
        └────┬──────────────────────────────┘
             │
        ┌────▼──────────────────────────────┐
        │ LOGGED IN ✓                       │
        │                                  │
        │ Dashboard loaded with user data  │
        └───────────────────────────────────┘
```

---

## 3. Vehicle Assignment Flow

```
CONTEXT: Regional Vendor wants to assign a Driver to a Vehicle

START
  │
  ▼
┌──────────────────────────────────────┐
│ Regional Vendor navigates to:         │
│ /regional/assign                      │
│ (AssignDriverToVehicles page)        │
└────────┬───────────────────────────────┘
         │
         ▼
    ┌────────────────────────────────────────────┐
    │ Component mounts: useEffect triggers       │
    ├───────────────────────────────────────────┤
    │                                            │
    │ Fetch 1: GET /api/vehicles/all             │
    │ (Get all vehicles in region)               │
    │                                            │
    │ Fetch 2: GET /api/users                    │
    │ (Get all drivers)                          │
    │                                            │
    └────────┬───────────────────────────────────┘
             │
         ┌───▼───────────────────────────────┐
         │ Display:                          │
         │ - Dropdown: Select Vehicle        │
         │ - Dropdown: Select Driver         │
         │ - Button: "Assign"                │
         │ - Button: "Cancel"                │
         └───┬───────────────────────────────┘
             │
         ┌───▼────────────────────────────────────┐
         │ User Action:                           │
         │ 1. Selects vehicle from dropdown       │
         │ 2. Selects driver from dropdown        │
         │ 3. Clicks "Assign" button              │
         └───┬──────────────────────────────────┬─┘
             │                                  │
     ┌───────▼──────────────┐       ┌───────────▼──────┐
     │ Validation Check      │       │ Cancel → Return  │
     ├─────────────────────┤       │ to list          │
     │                     │       └──────────────────┘
     │ ✓ Vehicle selected? │
     │ ✓ Driver selected?  │
     │ ✓ Not the same?     │
     │                     │
     └───┬─────────────────┘
         │
    ┌────▼──────────────────────────────────────────┐
    │ POST /api/vehicles/:vehicleId/assign-driver   │
    │                                               │
    │ Body: {                                       │
    │   driverId: "driver123"                       │
    │ }                                             │
    │                                               │
    │ Headers: {                                    │
    │   Authorization: "Bearer {token}"             │
    │ }                                             │
    └────┬───────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────────┐
    │ BACKEND: authMw middleware                    │
    │                                               │
    │ 1. Extract & verify JWT                       │
    │ 2. Fetch user from DB                         │
    │ 3. Populate req.user                          │
    │ 4. Call next()                                │
    └────┬───────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────────────┐
    │ BACKEND: Route Handler Logic                       │
    │                                                    │
    │ 1. Extract vehicleId from URL param               │
    │ 2. Extract driverId from request body             │
    │                                                    │
    │ 3. VALIDATION:                                    │
    │    - Check if driverId is provided ✓              │
    │    - Check if driver exists in DB ✓               │
    │    - Check if vehicle exists ✓                    │
    │                                                    │
    │ 4. LICENSE VERIFICATION:                          │
    │    Query DriverDocument                           │
    │      .findOne({ userId: driverId })               │
    │                                                    │
    │    If NOT found:                                  │
    │      → Return 400: "Driver has no license"        │
    │      → Stop process                               │
    │                                                    │
    │    If FOUND: Continue ↓                           │
    │                                                    │
    └────┬────────────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ UPDATE VEHICLE                              │
    │                                             │
    │ db.vehicles.findByIdAndUpdate(               │
    │   vehicleId,                                │
    │   {                                         │
    │     assigned: true,                         │
    │     driverId: driverId                      │
    │   },                                        │
    │   { new: true }                             │
    │ )                                           │
    │                                             │
    │ Changes in DB:                              │
    │ Vehicle.assigned = true                     │
    │ Vehicle.driverId = "driver123"              │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ UPDATE DRIVER DOCUMENT                      │
    │                                             │
    │ doc.vehicleId = vehicleId                   │
    │ await doc.save()                            │
    │                                             │
    │ DriverDocument now has link to vehicle      │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────────┐
    │ RESPONSE to Frontend                         │
    │ Status: 200 OK                               │
    │                                              │
    │ Body: {                                      │
    │   _id: "vehicle123",                         │
    │   registrationNumber: "ABC123",              │
    │   assigned: true,                            │
    │   driverId: "driver123",                     │
    │   ...other fields                            │
    │ }                                            │
    └────┬──────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────────┐
    │ FRONTEND: api.post() resolves                │
    │                                              │
    │ Success:                                     │
    │ - Show green notification                   │
    │ - Update UI state                           │
    │ - Refresh vehicle list                      │
    │ - Mark vehicle as "assigned"                │
    │                                              │
    │ OR Error:                                    │
    │ - Show red error notification                │
    │ - Error details to user                      │
    │ - Keep form open for retry                  │
    └────┬──────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────────┐
    │ DATABASE FINAL STATE:                        │
    │                                              │
    │ Vehicle Collection:                          │
    │ {                                            │
    │   _id: "vehicle123",                         │
    │   registrationNumber: "ABC123",              │
    │   assigned: true,  ← CHANGED                │
    │   driverId: "driver123"  ← CHANGED          │
    │ }                                            │
    │                                              │
    │ DriverDocument Collection:                   │
    │ {                                            │
    │   _id: "doc123",                             │
    │   userId: "driver123",                       │
    │   vehicleId: "vehicle123"  ← CHANGED        │
    │ }                                            │
    │                                              │
    │ SUCCESS ✓                                    │
    └────────────────────────────────────────────────┘
```

---

## 4. Regional Dashboard Data Load Flow

```
CONTEXT: Regional Vendor loads their dashboard

START
  │
  ▼
┌────────────────────────────────────────────────┐
│ RegionalVendorDashboard component mounts       │
└────────┬──────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ useEffect hook triggers                │
    │ (runs on component mount)              │
    └────┬───────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ Frontend: api.get('/region/dashboard')      │
    │                                             │
    │ Headers auto-added by Axios interceptor:    │
    │ {                                           │
    │   Authorization: "Bearer eyJhbGc..."        │
    │ }                                           │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ BACKEND: authMw middleware                  │
    │                                             │
    │ 1. header = req.header('Authorization')     │
    │    → "Bearer eyJhbGc..."                    │
    │                                             │
    │ 2. token = header.slice(7)                  │
    │    → "eyJhbGc..."                           │
    │                                             │
    │ 3. jwt.verify(token, JWT_SECRET)            │
    │    → { userId: "vendor123", role: "..." }   │
    │                                             │
    │ 4. User.findById(decoded.userId)            │
    │    .select('role region')                   │
    │    → {                                      │
    │         role: 'regional_vendor',            │
    │         region: 'northern'                  │
    │       }                                     │
    │                                             │
    │ 5. req.user = {                             │
    │      userId: "vendor123",                   │
    │      role: 'regional_vendor',               │
    │      region: 'northern',                    │
    │      customPermissions: [...]               │
    │    }                                        │
    │                                             │
    │ 6. next() → continue                        │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────────┐
    │ BACKEND: Route Handler (GET /dashboard)      │
    │                                              │
    │ 1. Authorization check:                      │
    │    if (req.user.role !== 'regional_vendor')  │
    │      → return 403 Forbidden                  │
    │                                              │
    │ 2. Get region:                               │
    │    region = req.user.region  → 'northern'    │
    │                                              │
    └────┬─────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ DATABASE QUERIES (4 parallel operations)     │
    │                                             │
    │ Query 1: totalDrivers                       │
    │ ┌───────────────────────────────────────┐  │
    │ │ User.countDocuments({                 │  │
    │ │   role: 'driver',                     │  │
    │ │   region: 'northern'                  │  │
    │ │ })                                    │  │
    │ │ Result: 45                            │  │
    │ └───────────────────────────────────────┘  │
    │                                             │
    │ Query 2: totalVehicles                      │
    │ ┌───────────────────────────────────────┐  │
    │ │ Vehicle.countDocuments({              │  │
    │ │   region: 'northern'                  │  │
    │ │ })                                    │  │
    │ │ Result: 12                            │  │
    │ └───────────────────────────────────────┘  │
    │                                             │
    │ Query 3: driversAssigned                    │
    │ ┌───────────────────────────────────────┐  │
    │ │ Vehicle.distinct('driverId', {        │  │
    │ │   region: 'northern',                 │  │
    │ │   driverId: { $ne: null }             │  │
    │ │ })                                    │  │
    │ │ Result: ["driver1","driver2",...] → 10   │
    │ └───────────────────────────────────────┘  │
    │                                             │
    │ Query 4: vehiclesAssigned                   │
    │ ┌───────────────────────────────────────┐  │
    │ │ Vehicle.countDocuments({              │  │
    │ │   region: 'northern',                 │  │
    │ │   assigned: true                      │  │
    │ │ })                                    │  │
    │ │ Result: 9                             │  │
    │ └───────────────────────────────────────┘  │
    │                                             │
    │ Query 5: permissions                        │
    │ ┌───────────────────────────────────────┐  │
    │ │ User.findById(req.user.userId)        │  │
    │ │   .select('customPermissions')        │  │
    │ │ Result: ["manage_drivers"]            │  │
    │ └───────────────────────────────────────┘  │
    │                                             │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ Response to Frontend                        │
    │ Status: 200 OK                              │
    │                                             │
    │ Body: {                                     │
    │   totalDrivers: 45,                         │
    │   totalVehicles: 12,                        │
    │   driversAssigned: 10,                      │
    │   vehiclesAssigned: 9,                      │
    │   permissions: ["manage_drivers"]           │
    │ }                                           │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ FRONTEND: api.get() resolves                │
    │                                             │
    │ setStats(response.data)                     │
    │ State updates:                              │
    │ {                                           │
    │   totalDrivers: 45,                         │
    │   totalVehicles: 12,                        │
    │   driversAssigned: 10,                      │
    │   vehiclesAssigned: 9,                      │
    │   permissions: ["manage_drivers"]           │
    │ }                                           │
    │                                             │
    │ setLoading(false)                           │
    │ Component re-renders                        │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────────┐
    │ FRONTEND: Render Dashboard Metrics              │
    │                                                 │
    │  Card 1: Personnel                             │
    │  ┌─────────────────────────────┐               │
    │  │ 45                          │               │
    │  │ Total Drivers in Branch     │               │
    │  │ Teal Icon                   │               │
    │  └─────────────────────────────┘               │
    │                                                 │
    │  Card 2: Fleet Size                            │
    │  ┌─────────────────────────────┐               │
    │  │ 12                          │               │
    │  │ Total Vehicles              │               │
    │  │ Green Icon                  │               │
    │  └─────────────────────────────┘               │
    │                                                 │
    │  Card 3: Dispatch Rate                         │
    │  ┌─────────────────────────────┐               │
    │  │ 75% (9/12)                  │               │
    │  │ Vehicles Assigned           │               │
    │  │ Green Trend Up              │               │
    │  └─────────────────────────────┘               │
    │                                                 │
    │  Card 4: Staff Productivity                    │
    │  ┌─────────────────────────────┐               │
    │  │ 22% (10/45)                 │               │
    │  │ Drivers Assigned            │               │
    │  │ Yellow Warning              │               │
    │  └─────────────────────────────┘               │
    │                                                 │
    │  + Additional sections:                        │
    │  - Branch Analytics table                      │
    │  - Activity feed                               │
    │  - Status indicators                           │
    │                                                 │
    │  DASHBOARD READY ✓                             │
    └────────────────────────────────────────────────┘
```

---

## 5. File Upload (Driver License) Flow

```
CONTEXT: Driver uploads their license document

START
  │
  ▼
┌────────────────────────────────────────┐
│ DriverDashBoard component renders      │
│ - Shows upload area (dashed border)    │
│ - Input type="file" accept=".pdf"      │
└────────┬─────────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ User selects file from system  │
    │ (e.g., driving_license.pdf)    │
    └────┬───────────────────────────┘
         │
    ┌────▼────────────────────────────────┐
    │ Frontend: onFileChange handler       │
    │                                     │
    │ event.target.files[0]                │
    │ → File object                        │
    │ {                                    │
    │   name: "license.pdf",               │
    │   size: 256000,                      │
    │   type: "application/pdf"            │
    │ }                                    │
    │                                     │
    │ setSelectedFile(file)                │
    │ Display file preview                 │
    └────┬────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ User clicks "Upload License" button   │
    │ (or auto-upload triggered)            │
    └────┬───────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ Frontend: uploadLicense() function         │
    │                                           │
    │ const formData = new FormData()            │
    │ formData.append('license', selectedFile)   │
    │                                           │
    │ api.post('/driver-docs', formData, {       │
    │   headers: {                              │
    │     'Content-Type': 'multipart/form-data' │
    │   }                                       │
    │ })                                        │
    │                                           │
    │ (Axios also adds Authorization header)    │
    └────┬───────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────┐
    │ BACKEND: authMw middleware               │
    │ → Verify token & set req.user            │
    │ → Continue to next middleware            │
    └────┬────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ BACKEND: multer.single('license')         │
    │                                           │
    │ Multer middleware:                        │
    │ 1. Intercepts multipart/form-data         │
    │ 2. Parses form boundaries                 │
    │ 3. Reads file from request                │
    │ 4. Saves to /uploads directory            │
    │ 5. Renames: license-uniqueId.pdf          │
    │ 6. Populates req.file object              │
    │                                           │
    │ req.file = {                              │
    │   fieldname: 'license',                   │
    │   originalname: 'driving_license.pdf',    │
    │   encoding: '7bit',                       │
    │   mimetype: 'application/pdf',            │
    │   size: 256000,                           │
    │   destination: './uploads',               │
    │   filename: 'license-1234567890.pdf',     │
    │   path: './uploads/license-1234567890.pdf'│
    │ }                                         │
    │                                           │
    └────┬──────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ BACKEND: Route Handler Logic                │
    │                                             │
    │ 1. Check if file was uploaded               │
    │    if (!req.file)                           │
    │      → return 400 'No file uploaded'        │
    │                                             │
    │ 2. Check if existing document               │
    │    const existing =                         │
    │      DriverDoc.findOne({                    │
    │        userId: req.user.userId              │
    │      })                                     │
    │                                             │
    │    If FOUND:                                │
    │    - Delete old file from /uploads          │
    │    - Delete old DriverDocument record       │
    │                                             │
    │ 3. Create new DriverDocument record         │
    │    await DriverDocument.create({            │
    │      userId: req.user.userId,               │
    │      docType: 'license',                    │
    │      filePath: '/uploads/license-1234.pdf'  │
    │    })                                       │
    │                                             │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ DATABASE UPDATE                             │
    │                                             │
    │ DriverDocument collection:                  │
    │ {                                           │
    │   _id: "doc123",                            │
    │   userId: "driver456",                      │
    │   docType: "license",                       │
    │   filePath: "/uploads/license-1234.pdf",    │
    │   uploadedAt: "2024-11-11T10:30:00Z",       │
    │   vehicleId: null                           │
    │ }                                           │
    │                                             │
    │ File System:                                │
    │ /uploads/license-1234.pdf ← Saved ✓        │
    │                                             │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ RESPONSE to Frontend                        │
    │ Status: 201 Created                         │
    │                                             │
    │ Body: {                                     │
    │   _id: "doc123",                            │
    │   userId: "driver456",                      │
    │   docType: "license",                       │
    │   filePath: "/uploads/license-1234.pdf",    │
    │   uploadedAt: "2024-11-11T10:30:00Z"        │
    │ }                                           │
    │                                             │
    └────┬────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ FRONTEND: api.post() resolves               │
    │                                             │
    │ setDocumentData(response.data)              │
    │ setUploadMessage('License uploaded!')       │
    │ setSelectedFile(null)                       │
    │ Clear file input                            │
    │ Show success notification                   │
    │                                             │
    │ UPLOAD SUCCESS ✓                            │
    └────────────────────────────────────────────┘
```

---

## 6. Permission Assignment Flow

```
CONTEXT: Super Vendor assigns custom permissions to a user

START: SuperVendorAllUsers page
  │
  ▼
┌──────────────────────────────────────────┐
│ Super Vendor views user list             │
│ - All users displayed in table/cards      │
│ - Each user has available permissions    │
│ - Checkboxes for permission toggling     │
└────────┬───────────────────────────────┘
         │
    ┌────▼────────────────────────────────┐
    │ Super Vendor selects permissions     │
    │ for a specific user                  │
    │                                      │
    │ Example:                             │
    │ User: "Regional Vendor - John"       │
    │ ☑ view_financials                   │
    │ ☑ manage_drivers                    │
    │ ☐ export_reports                    │
    │ ☐ approve_documents                │
    └────┬───────────────────────────────┘
         │
    ┌────▼───────────────────────────────┐
    │ Super Vendor clicks "Save"          │
    │ (for that specific user)            │
    └────┬──────────────────────────────┘
         │
    ┌────▼───────────────────────────────────────────┐
    │ FRONTEND: saveUser(userId) handler             │
    │                                                │
    │ const user = users.find(u => u._id === userId)│
    │ Extract selected permissions from state:       │
    │ user.customPermissions = [                     │
    │   'view_financials',                           │
    │   'manage_drivers'                             │
    │ ]                                              │
    │                                                │
    │ api.patch(                                     │
    │   `/users/${userId}/permissions`,              │
    │   {                                            │
    │     customPermissions: [                       │
    │       'view_financials',                       │
    │       'manage_drivers'                         │
    │     ]                                          │
    │   }                                            │
    │ )                                              │
    └────┬───────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ BACKEND: authMw middleware                │
    │ → Verify JWT & set req.user               │
    │ → Check if requester is super_vendor      │
    └────┬───────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ BACKEND: Route Handler                   │
    │ PATCH /users/:userId/permissions          │
    │                                           │
    │ 1. Authorization:                         │
    │    if (req.user.role !== 'super_vendor')  │
    │      → return 403 Forbidden                │
    │                                           │
    │ 2. Extract permissions from body:         │
    │    const { customPermissions } =          │
    │      req.body                             │
    │    → ['view_financials', 'manage_drivers']│
    │                                           │
    │ 3. Validation:                            │
    │    Verify all permissions are valid       │
    │    enum against allowed list              │
    │                                           │
    │ 4. Update user in DB:                     │
    │    User.findByIdAndUpdate(                │
    │      userId,                              │
    │      { customPermissions: [...] },        │
    │      { new: true }                        │
    │    )                                      │
    │                                           │
    └────┬───────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ DATABASE UPDATE                           │
    │                                           │
    │ User collection:                          │
    │ {                                         │
    │   _id: "user123",                         │
    │   email: "regional@example.com",          │
    │   firstName: "John",                      │
    │   lastName: "Doe",                        │
    │   role: "regional_vendor",                │
    │   customPermissions: [                    │
    │     'view_financials',                    │
    │     'manage_drivers'                      │
    │   ]  ← UPDATED                            │
    │ }                                         │
    │                                           │
    └────┬───────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ RESPONSE to Frontend                      │
    │ Status: 200 OK                            │
    │                                           │
    │ Body: Updated User object                 │
    │                                           │
    └────┬───────────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────────┐
    │ FRONTEND: api.patch() resolves              │
    │                                             │
    │ Show notification:                          │
    │ "✓ Permissions saved for John Doe"          │
    │                                             │
    │ (Or error if failed)                        │
    │ "✗ Failed to save permissions"              │
    │                                             │
    │ Update UI state:                            │
    │ User in list now shows updated permissions │
    │                                             │
    │ Auto-hide notification after 3 seconds      │
    │                                             │
    │ SUCCESS ✓                                   │
    └─────────────────────────────────────────────┘
```

---

## 7. Request-Response Cycle (Detailed)

```
┌──────────────────────────────────────────────────────────────┐
│                     HTTP REQUEST                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  METHOD: GET                                                │
│  URL: http://localhost:5005/api/users                       │
│                                                              │
│  HEADERS:                                                   │
│  {                                                          │
│    "Accept": "application/json",                           │
│    "Accept-Language": "en-US",                             │
│    "Authorization": "Bearer eyJhbGc...",    ← JWT Token    │
│    "Content-Type": "application/json",                     │
│    "Origin": "http://localhost:3000"                       │
│  }                                                          │
│                                                              │
│  BODY: (empty for GET)                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         │
                    (Network)
                         │
┌──────────────────────────────────────────────────────────────┐
│                     CORS CHECK                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Express CORS middleware:                                   │
│  cors({ origin: true, credentials: true })                 │
│                                                              │
│  ✓ Origin allowed (localhost:3000)                         │
│  ✓ Methods allowed (GET, POST, PATCH, DELETE)              │
│  ✓ Credentials allowed (cookies, headers)                  │
│                                                              │
│  Response headers:                                          │
│  {                                                          │
│    "Access-Control-Allow-Origin": "*",                     │
│    "Access-Control-Allow-Methods": "...",                  │
│    "Access-Control-Allow-Headers": "..."                   │
│  }                                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         │
         (Request routed to /api/users)
                         │
┌──────────────────────────────────────────────────────────────┐
│               AUTHENTICATION MIDDLEWARE                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Extract Authorization header                           │
│     header = "Bearer eyJhbGc..."                           │
│     token = "eyJhbGc..."                                   │
│                                                              │
│  2. Verify JWT signature                                   │
│     jwt.verify(token, process.env.JWT_SECRET)              │
│     ✓ Signature valid                                      │
│     ✓ Token not expired                                    │
│                                                              │
│  3. Decode JWT payload                                     │
│     {                                                      │
│       userId: "507f1f77bcf86cd799439011",                  │
│       role: "super_vendor",                                │
│       iat: 1699695600,                                     │
│       exp: 1699723200                                      │
│     }                                                      │
│                                                              │
│  4. Fetch user from database                               │
│     User.findById("507f1f77bcf86cd799439011")              │
│       .select('role region customPermissions')             │
│     → {                                                    │
│       role: 'super_vendor',                                │
│       region: null,                                        │
│       customPermissions: [...]                             │
│     }                                                      │
│                                                              │
│  5. Populate req.user                                      │
│     req.user = {                                           │
│       userId: "507f1f77bcf86cd799439011",                  │
│       role: "super_vendor",                                │
│       region: null,                                        │
│       customPermissions: [...]                             │
│     }                                                      │
│                                                              │
│  6. Call next() → Continue to route handler                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         │
         (Request reaches route handler)
                         │
┌──────────────────────────────────────────────────────────────┐
│           ROUTE HANDLER: GET /api/users                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  router.get('/', authMw, async (req, res) => {             │
│                                                              │
│    // Check Redis cache first                              │
│    const cacheKey = 'users:all';                           │
│    const cached = await getCache(cacheKey);                │
│                                                              │
│    if (cached) {                                           │
│      // Cache HIT → Return immediately                     │
│      return res.json(JSON.parse(cached));                  │
│    }                                                       │
│                                                              │
│    // Cache MISS → Query database                          │
│    const users = await User.find()                         │
│      .select('-passwordHash -__v')                         │
│      .lean()                                               │
│      .sort('-createdAt');                                  │
│                                                              │
│    // Cache the result (5 minute TTL)                      │
│    await setCache(cacheKey, JSON.stringify(users), 300);   │
│                                                              │
│    res.json(users);                                        │
│  });                                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         │
         (Database Query: 5 users found)
                         │
┌──────────────────────────────────────────────────────────────┐
│                  REDIS CACHE UPDATE                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SET users:all = [                                         │
│    {                                                       │
│      _id: "507f...",                                       │
│      email: "vendor1@example.com",                         │
│      firstName: "John",                                    │
│      role: "super_vendor"                                  │
│    },                                                      │
│    ... 4 more users                                        │
│  ]                                                         │
│                                                              │
│  Expiry: 300 seconds (5 minutes)                           │
│                                                              │
│  Next 5 minutes: Cache HIT → No DB query                   │
│  After 5 minutes: Cache MISS → Fresh DB query              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         │
┌──────────────────────────────────────────────────────────────┐
│                   HTTP RESPONSE                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  STATUS: 200 OK                                            │
│                                                              │
│  HEADERS:                                                   │
│  {                                                          │
│    "Content-Type": "application/json",                     │
│    "Content-Length": "1234",                               │
│    "Date": "Mon, 11 Nov 2024 10:30:00 GMT",                │
│    "Access-Control-Allow-Origin": "*"                      │
│  }                                                          │
│                                                              │
│  BODY:                                                      │
│  [                                                         │
│    {                                                       │
│      "_id": "507f1f77bcf86cd799439011",                    │
│      "email": "vendor1@example.com",                       │
│      "firstName": "John",                                  │
│      "lastName": "Doe",                                    │
│      "role": "super_vendor",                               │
│      "customPermissions": [],                              │
│      "createdAt": "2024-11-01T08:00:00Z"                   │
│    },                                                      │
│    ... more users                                          │
│  ]                                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                         │
                    (Network)
                         │
┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND HANDLING                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  api.get('/users')                                         │
│    .then(response => {                                     │
│      console.log('Response:', response.data);              │
│      setUsers(response.data);  // Update React state        │
│      setLoading(false);                                    │
│    })                                                      │
│    .catch(error => {                                       │
│      console.error('Error:', error);                       │
│      setError(error.message);                              │
│    });                                                     │
│                                                              │
│  Component re-renders with user list                       │
│  Display: Table/Cards showing all users                    │
│                                                              │
│  SUCCESS ✓                                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. State Management Flow (React)

```
┌─────────────────────────────────────┐
│      AuthContext (Global State)     │
├─────────────────────────────────────┤
│                                     │
│  State:                             │
│  - token: string | null             │
│  - role: string | null              │
│  - user: User object | null         │
│                                     │
│  localStorage sync:                 │
│  - token → localStorage.token       │
│  - role → localStorage.role         │
│                                     │
│  Functions:                         │
│  - login(jwt, role)                 │
│  - logout()                         │
│                                     │
│  Effects:                           │
│  - useEffect on token change:       │
│    api.get('/auth/me')              │
│    → setUser(response)              │
│                                     │
└────────────┬──────────────────────┘
             │ provides context
             │
    ┌────────▼──────────────┐
    │  Any Component         │
    │  useAuth() hook        │
    │                        │
    │  Get:                  │
    │  - token              │
    │  - role               │
    │  - user               │
    │  - login()            │
    │  - logout()           │
    │                        │
    │  Conditional render:   │
    │  if (!token)           │
    │    → Show login        │
    │  else                  │
    │    → Show dashboard    │
    └────────────────────────┘
```

---

**End of System Flow Diagrams**

Document created: `SYSTEM_FLOW.md`  
Date: November 11, 2024  
Version: 1.0.0
