# MoveInSync: Quick Reference Guide

## 📚 Documentation Files

| Document | Purpose |
|----------|---------|
| **ARCHITECTURE.md** | Complete system architecture, tech stack, database schema, and features |
| **SYSTEM_FLOW.md** | Detailed flow diagrams for authentication, vehicle assignment, data loading, etc. |
| **QUICK_REFERENCE.md** | This file - quick lookup guide |

---

## 🔑 Key Concepts

### Authentication System
- **JWT Tokens**: 8-hour expiration, stored in localStorage
- **Token Structure**: `{ userId, role, iat, exp }`
- **Authorization**: Every protected route requires valid JWT in Authorization header
- **Middleware**: `authMw` extracts token, verifies signature, fetches user data

### Role Hierarchy
```
Super Vendor (Platform Admin)
    ↓
Regional Vendor (Branch Manager)
    ├─ City Vendor
    └─ Local Vendor
    
Drivers (Fleet Staff)
```

### Permission System
- **Role-Based**: Default permissions by role
- **Custom Permissions**: Can be assigned per-user by super vendor
- **Examples**: `manage_drivers`, `view_financials`, `export_reports`

---

## 📊 Data Models

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String (bcrypt),
  firstName: String,
  lastName: String,
  role: Enum,
  region: String (northern|southern|central|eastern|western),
  customPermissions: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle
```javascript
{
  _id: ObjectId,
  registrationNumber: String (unique),
  model: String,
  seatingCapacity: Number,
  fuelType: Enum (petrol|diesel|electric|hybrid),
  region: String,
  rcFile: String (path),
  permitFile: String (path),
  pollutionFile: String (path),
  assigned: Boolean,
  driverId: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### DriverDocument
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  docType: 'license',
  filePath: String (path),
  uploadedAt: Date,
  vehicleId: ObjectId (ref: Vehicle)
}
```

---

## 🚀 Quick API Reference

### Authentication

```bash
# Register
POST /api/auth/register
Body: { email, password, firstName, lastName, role }
Returns: { token, role }

# Login
POST /api/auth/login
Body: { email, password }
Returns: { token, role }

# Get Profile
GET /api/auth/me
Headers: Authorization: Bearer {token}
Returns: User object

# Update Profile
PATCH /api/auth/me
Body: { region }
Returns: Updated User object

# Get Permissions
GET /api/auth/me/permissions
Returns: { permissions: [String] }
```

### Users

```bash
# List All Users (cached 5 min)
GET /api/users
Returns: [User, User, ...]

# Update User Permissions
PATCH /api/users/:userId/permissions
Body: { customPermissions: [String] }
Returns: Updated User object
```

### Vehicles

```bash
# Create Vehicle
POST /api/vehicles
Content-Type: multipart/form-data
Fields: registrationNumber, model, seatingCapacity, fuelType, region, 
        rcFile, permitFile, pollutionFile
Returns: Vehicle object

# List Region Vehicles
GET /api/vehicles
Returns: [Vehicle, Vehicle, ...] (filtered by user's region)

# List All Vehicles
GET /api/vehicles/all
Returns: [Vehicle, Vehicle, ...] (requires super/regional vendor)

# Get Driver's Assigned Vehicles
GET /api/vehicles/my-assigned
Returns: [Vehicle, ...] (driver only)

# Assign Driver to Vehicle
PATCH /api/vehicles/:vehicleId/assign-driver
Body: { driverId }
Returns: Updated Vehicle object

# Unassign Driver
PATCH /api/vehicles/:vehicleId/unassign-driver
Returns: Updated Vehicle object

# Delete Vehicle
DELETE /api/vehicles/:vehicleId
Returns: { msg: "Vehicle deleted" }
```

### Driver Documents

```bash
# Upload License
POST /api/driver-docs
Content-Type: multipart/form-data
Fields: license (file)
Returns: DriverDocument object

# Get My License
GET /api/driver-docs
Returns: DriverDocument object

# Get Regional Drivers' Licenses
GET /api/driver-docs/region
Returns: [{ userId, firstName, lastName, email, filePath, uploadedAt }, ...]
(regional_vendor only)
```

### Region

```bash
# Get Regional Dashboard
GET /api/region/dashboard
Returns: {
  totalDrivers: Number,
  totalVehicles: Number,
  driversAssigned: Number,
  vehiclesAssigned: Number,
  permissions: [String]
}
(regional_vendor only)
```

### Stats

```bash
# Get Super Vendor Stats
GET /api/stats/super
Returns: Platform-wide statistics
(super_vendor only)
```

---

## 🎯 Frontend Routes

### Super Vendor Routes
```
/login                  Login page
/register              Register page
/super                 Main dashboard
/super/users           User management
/super/roles           Role management
/super/permissions     Permission assignment
/super/vehicles        Vehicle fleet management
/super/driver-overview Driver analytics
/super/profile         Account settings
```

### Regional Vendor Routes
```
/login                  Login page
/register              Register page
/regional              Main dashboard
/regional/vehicles     Vehicle inventory
/regional/assign       Assign driver to vehicle
/regional/licenses     View driver licenses
/regional/profile      Account settings
```

### Driver Routes
```
/login                 Login page
/register             Register page
/driver                Dashboard
  - Profile info
  - License upload
  - Assigned vehicles
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong random string
- [ ] Passwords hashed with bcrypt (10 salt rounds)
- [ ] CORS configured with credentials allowed
- [ ] Authorization checks on all protected routes
- [ ] File uploads sanitized and stored securely
- [ ] Database indexes on unique fields
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Audit logging implemented

---

## 🐛 Common Issues & Solutions

### Issue: "NOPERM: Redis token error"
**Solution**: Generate new Redis token with full read/write permissions from Upstash console

### Issue: "MongoDB connection timeout"
**Solution**: Add your IP to MongoDB Atlas IP whitelist

### Issue: "CORS error on requests"
**Solution**: Ensure cors({ origin: true }) is in server.js before routes

### Issue: "Token invalid or expired"
**Solution**: Clear localStorage and login again

### Issue: "File upload not working"
**Solution**: Check multer configuration in backend/src/config/upload.js

### Issue: "User redirected to login after page refresh"
**Solution**: Token in localStorage is being cleared; check AuthContext useEffect

---

## 💾 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster
JWT_SECRET=your_secure_random_string
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
PORT=5005
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5005/api
```

---

## 📁 Project Structure

### Backend
```
backend/
├── .env                    ← Environment variables
├── server.js              ← Express app setup
├── package.json
├── src/
│   ├── config/
│   │   ├── db.js          ← MongoDB connection
│   │   └── upload.js      ← Multer configuration
│   ├── middleware/
│   │   └── auth.js        ← JWT verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── DriverDocument.js
│   │   ├── Permission.js
│   │   └── RolePermission.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── vehicles.js
│   │   ├── driver-docs.js
│   │   ├── region.js
│   │   ├── stats.js
│   │   ├── admin.js
│   │   └── permissions.js
│   └── utils/
│       └── redis.js       ← Cache utilities
└── uploads/               ← Uploaded files
```

### Frontend
```
frontend/
├── .env
├── package.json
├── public/
│   └── index.html
├── src/
│   ├── App.js             ← Route setup
│   ├── index.js
│   ├── api/
│   │   └── axiosClient.js ← HTTP client
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── Modal.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Card.jsx
│   │       ├── Alert.jsx
│   │       ├── Badge.jsx
│   │       └── Loading.jsx
│   ├── context/
│   │   └── AuthContext.jsx ← Global auth state
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── SuperVendorDashBoard.jsx
│   │   ├── RegionalVendorDashBoard.jsx
│   │   ├── DriverDashBoard.jsx
│   │   ├── SuperVendorAllUsers.jsx
│   │   ├── SuperVendorVehicles.jsx
│   │   ├── RegionalVendorVehicles.jsx
│   │   ├── AssignDriverToVehicles.jsx
│   │   └── ... (other pages)
│   └── utils/
│       └── cn.js          ← Utility functions
└── tailwind.config.js
```

---

## 🔄 Request Lifecycle

```
1. Frontend makes API request
   ├─ Axios interceptor adds JWT from localStorage
   ├─ Send HTTP request with Authorization header
   └─ Await response

2. Server receives request
   ├─ CORS middleware checks origin
   ├─ Express parses body/query
   ├─ Auth middleware verifies JWT
   └─ Routes handler processes

3. Route handler executes
   ├─ Validate inputs
   ├─ Query database
   ├─ Update cache if needed
   ├─ Build response
   └─ Send HTTP response

4. Frontend handles response
   ├─ Update React state
   ├─ Re-render components
   ├─ Show success/error message
   └─ Update URL if needed
```

---

## 🧪 Testing Common Flows

### Test 1: User Registration
1. Navigate to /register
2. Fill form: email, password, firstName, lastName, select role
3. Click Register
4. Should redirect to dashboard for that role
5. Verify token stored in localStorage

### Test 2: Vehicle Assignment
1. Login as regional vendor
2. Navigate to /regional/assign
3. Select vehicle and driver
4. Click Assign
5. Verify vehicle shows "assigned" status
6. Verify driver can see vehicle in /driver

### Test 3: License Upload
1. Login as driver
2. Navigate to /driver
3. Upload license file (PDF)
4. Verify license appears in profile
5. Verify regional vendor can see license in /regional/licenses

### Test 4: Permission Assignment
1. Login as super vendor
2. Navigate to /super/users
3. Select a user and toggle permissions
4. Click Save
5. Verify notification shows success
6. Logout and login as that user
7. Verify user can perform permitted actions

---

## 📈 Performance Optimization

### Caching Strategy
- **Redis Cache**: GET /api/users (5 min TTL)
- **Browser Cache**: Static assets (Tailwind, fonts)
- **Database Indexes**: On frequently queried fields (email, region, driverId)
- **Lean Queries**: Use `.lean()` for read-only operations

### Frontend Optimization
- **Code Splitting**: React Router lazy loading
- **Component Memoization**: React.memo for heavy components
- **Image Optimization**: Tailwind CSS classes instead of images
- **Bundle Size**: Tree-shaking unused imports

---

## 🚢 Deployment Steps

1. **Environment Setup**
   - Set production env variables
   - Generate strong JWT_SECRET
   - Configure MongoDB Atlas IP whitelist
   - Set up Redis (Upstash) credentials

2. **Backend Deployment**
   - Build: `npm run build` (if applicable)
   - Deploy to Heroku/Railway/AWS
   - Set NODE_ENV=production
   - Verify API endpoints accessible

3. **Frontend Deployment**
   - Build: `npm run build`
   - Set REACT_APP_API_URL to backend domain
   - Deploy to Vercel/Netlify/AWS
   - Verify routes and API calls

4. **Post-Deployment**
   - Test all user flows
   - Monitor error logs
   - Set up alerts
   - Enable HTTPS

---

## 📞 Support & Troubleshooting

For detailed help, refer to:
- **Architecture**: See `ARCHITECTURE.md`
- **Flows**: See `SYSTEM_FLOW.md`
- **Code**: Check files in `/backend/src` and `/frontend/src`
- **Issues**: Check GitHub repository issues

---

## 📝 Notes

- Always use HTTPS in production
- Regularly backup MongoDB database
- Monitor Redis cache hit rate
- Review logs for error patterns
- Keep dependencies updated
- Test thoroughly before deploying
- Document custom changes
- Maintain API versioning

---

**Last Updated**: November 11, 2024  
**Version**: 1.0.0  
**System**: MoveInSync - Vendor & Driver Management Platform
