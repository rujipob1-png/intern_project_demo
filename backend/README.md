# Backend API — ระบบการลาอิเล็กทรอนิกส์

## เทคโนโลยี

- **Node.js** + **Express.js** — REST API framework
- **@supabase/supabase-js** — Database client (PostgreSQL)
- **JWT** + **bcryptjs** — Authentication & password hashing
- **Nodemailer** — Email notifications (SMTP)
- **Helmet** + **CORS** + **express-rate-limit** — Security
- **express-validator** — Input validation
- **Winston** — Structured logging
- **Multer** — File upload handling
- **Swagger (swagger-jsdoc + swagger-ui-express)** — API documentation
- **node-cron** — Scheduled tasks
- **compression** — Response compression
- **Jest** + **Supertest** — Testing

## โครงสร้าง

```
src/
├── config/
│   ├── constants.js      # Leave types, roles, status constants
│   ├── email.js          # Nodemailer transporter & templates
│   ├── logger.js         # Winston logger config
│   ├── supabase.js       # Supabase client
│   └── swagger.js        # Swagger/OpenAPI config
├── controllers/
│   ├── acting.controller.js       # ผู้ปฏิบัติหน้าที่แทน
│   ├── admin.controller.js        # Admin operations (ผู้ใช้, carryover, archive, audit)
│   ├── auth.controller.js         # Login, forgot/reset password, profile, email settings
│   ├── centralOffice.controller.js# Central Office Staff & Head + partial approval
│   ├── delegation.controller.js   # โอนสิทธิ์การอนุมัติ
│   ├── director.controller.js     # Director approval
│   ├── leave.controller.js        # Leave CRUD, balance, calendar
│   ├── notification.controller.js # Notifications, cleanup, reminders
│   ├── registration.controller.js # ลงทะเบียนพนักงานใหม่
│   ├── reports.controller.js      # รายงาน 4 แบบ
│   └── upload.controller.js       # File upload/download/delete
├── middlewares/
│   ├── auth.middleware.js     # JWT verification
│   ├── cache.middleware.js    # In-memory cache (TTL, eviction)
│   ├── rateLimit.middleware.js# Rate limiting (login, API, sensitive, upload)
│   ├── role.middleware.js     # Role-based access control (5 levels)
│   ├── security.middleware.js # CSRF protection, XSS sanitization
│   ├── upload.middleware.js   # Multer config (5MB, PDF/JPG/PNG)
│   └── validation.middleware.js # Input validation (express-validator)
├── routes/               # 12 route files
│   ├── acting.routes.js
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── centralOffice.routes.js
│   ├── delegation.routes.js
│   ├── director.routes.js
│   ├── health.routes.js
│   ├── leave.routes.js
│   ├── notification.routes.js
│   ├── registration.routes.js
│   ├── reports.routes.js
│   └── upload.routes.js
├── services/
│   └── fiscalYearScheduler.js # Cron: carryover + balance reset (1 ต.ค.)
├── utils/                # Helper functions
├── app.js                # Express app setup (helmet, cors, compression, swagger)
└── server.js             # Server entry (port, cron: reminders, cleanup)
```

## API Endpoints

| Method | Route | คำอธิบาย |
|--------|-------|---------|
| POST | `/auth/login` | เข้าสู่ระบบ |
| POST | `/auth/change-password` | เปลี่ยนรหัสผ่าน |
| POST | `/auth/forgot-password` | ส่งลิงก์ Reset password ทางอีเมล |
| POST | `/auth/reset-password` | Reset password ด้วย token |
| GET | `/auth/profile` | ดูโปรไฟล์ผู้ใช้ |
| PUT | `/auth/profile-image` | อัปโหลดรูปโปรไฟล์ |
| PUT | `/auth/email-settings` | ตั้งค่าการรับอีเมล |
| GET | `/api/leaves` | ดูคำขอลาของตัวเอง |
| POST | `/api/leaves` | ยื่นคำขอลา |
| GET | `/api/leaves/balance` | ดูสิทธิ์การลาคงเหลือ |
| GET | `/api/leaves/calendar` | ปฏิทินการลา |
| POST | `/api/leaves/:id/cancel` | ยกเลิกคำขอลา |
| GET | `/api/director/pending` | คำขอรออนุมัติ (Director) |
| POST | `/api/director/approve/:id` | อนุมัติ Level 1 |
| GET | `/api/central-office/pending` | คำขอรออนุมัติ (Central) |
| POST | `/api/central-office/approve/:id` | อนุมัติ Level 2 & 3 |
| GET | `/api/admin/pending` | คำขอรออนุมัติ (Admin) |
| POST | `/api/admin/approve/:id` | อนุมัติ Final + Partial |
| GET | `/api/admin/users` | จัดการผู้ใช้ |
| POST | `/api/admin/carryover` | ยกยอดวันลาพักผ่อน |
| GET | `/api/admin/audit-logs` | Audit logs |
| GET | `/api/admin/archived-users` | ผู้ใช้ที่ Archive |
| GET | `/api/notifications` | ดูแจ้งเตือน |
| GET | `/api/acting/*` | ผู้ปฏิบัติหน้าที่แทน |
| GET/POST | `/api/delegation/*` | โอนสิทธิ์การอนุมัติ |
| POST | `/api/registration` | ลงทะเบียนพนักงานใหม่ |
| POST | `/api/upload` | อัปโหลดเอกสาร |
| GET | `/api/reports/*` | รายงานสถิติ (4 แบบ) |
| GET | `/health` | Health check (DB latency, memory) |

ดู API ทั้งหมดที่ Swagger UI: http://localhost:3000/api-docs

## การรันงาน

```bash
# ติดตั้ง dependencies
npm install

# Development (port 3000)
npm start

# Production (PM2)
pm2 start ecosystem.config.js
```

## Environment Variables

สร้างไฟล์ `.env`:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

## Testing

```bash
npm test
```
