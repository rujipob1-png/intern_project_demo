# 🏛️ ระบบการลาอิเล็กทรอนิกส์สำหรับข้าราชการ

## 📌 ภาพรวมโปรเจค

ระบบการลาอิเล็กทรอนิกส์สำหรับข้าราชการ พัฒนาขึ้นเพื่อรองรับกระบวนการยื่นคำขอลา การอนุมัติแบบ 4 ระดับ การยกเลิก และการติดตามสถานะการลา ออกแบบตามระเบียบการลาของข้าราชการไทย พร้อมระบบ Role-Based Access Control (RBAC) รองรับ 5 บทบาท

## 🚀 เริ่มต้นใช้งาน

### ความต้องการของระบบ
- Node.js 18+
- PostgreSQL (ผ่าน Supabase)
- npm

### การติดตั้ง

1. **Clone repository**
```bash
git clone https://github.com/rujipob1-png/intern_project.git
cd intern_project
```

2. **ติดตั้ง Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **ตั้งค่า Environment Variables**

สร้างไฟล์ `.env` ใน `backend/`:
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

สร้างไฟล์ `.env` ใน `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

4. **ตั้งค่า Database**
```bash
# รัน SQL scripts ใน Supabase SQL Editor ตามลำดับ:
# 1. database/schema.sql
# 2. database/NEW_PROJECT_SETUP.sql
# 3. database/storage_setup.sql
# 4. database/seed_real_data.sql
```

5. **รันโปรเจค**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

6. **เข้าใช้งาน**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs (Swagger): http://localhost:3000/api-docs

---

## 🎯 คุณสมบัติหลัก

### � Authentication & บัญชีผู้ใช้
- Login ด้วยรหัสตำแหน่ง (Employee Code) + รหัสผ่าน (JWT Token)
- ลืมรหัสผ่าน — ส่งลิงก์ Reset ผ่านอีเมล
- เปลี่ยนรหัสผ่าน
- โปรไฟล์ผู้ใช้ — อัปโหลด/ลบรูปโปรไฟล์ (Base64 → Supabase Storage)
- ตั้งค่าการรับอีเมลแจ้งเตือน (เปิด/ปิด)
- ลงทะเบียนพนักงานใหม่ผ่านหน้าเว็บ (รอ Admin อนุมัติ)

### 📝 การยื่นคำขอลา
- รองรับการลา 9 ประเภทตามระเบียบราชการ
- เลือกวันที่ลาต่อเนื่องหรือไม่ต่อเนื่อง (Non-contiguous dates)
- แนบเอกสารประกอบ (PDF, JPG, PNG สูงสุด 5 ไฟล์ ไม่เกิน 5MB/ไฟล์)
- ออกเลขที่คำขออัตโนมัติ (LV-YYYYMM-XXXX)
- ระบุผู้ปฏิบัติหน้าที่แทน (เลือกจากเจ้าหน้าที่ระดับเดียวกัน)
- ระบุข้อมูลติดต่อระหว่างลา
- ดูประวัติการลา + รายละเอียด + Timeline การอนุมัติ
- รายงานสถิติการลาส่วนบุคคล (MyReportPage)

### 🔄 กระบวนการอนุมัติ 4 ระดับ
```
ผู้ยื่นคำขอ → ผอ.กลุ่มงาน (Level 1) → พนักงานกองกลาง (Level 2)
    → หัวหน้ากองกลาง (Level 3) → ผอ.สำนัก/Admin (Level 4 - Final)
    → อนุมัติสำเร็จ → หักวันลาอัตโนมัติ (Atomic Balance Deduction)
```
- อนุมัติบางส่วน (Partial Approval) ได้ที่ระดับ หัวหน้ากองกลาง และ Admin
- ปฏิเสธได้ทุกระดับ พร้อมระบุเหตุผล
- แต่ละระดับมีหน้าประวัติการอนุมัติ (Approval History)

### ❌ การยกเลิกคำขอลา
- ยกเลิกได้ทั้งคำขอที่รออนุมัติและอนุมัติแล้ว
- ผ่านกระบวนการอนุมัติ 4 ระดับเช่นเดียวกัน
  - `pending_cancel` → `cancel_level1` → `cancel_level2` → `cancel_level3` → `cancelled`
- คืนวันลาอัตโนมัติเมื่อยกเลิกสำเร็จ
- พิมพ์ใบยกเลิกการลา (PDF)

### 🤝 ผู้ปฏิบัติหน้าที่แทน (Acting Person)
- เลือกผู้ปฏิบัติหน้าที่แทนจากเจ้าหน้าที่ระดับเดียวกัน
- ระบบส่งคำขอให้ผู้ถูกเลือกยืนยัน
- อนุมัติ/ปฏิเสธคำขอรับมอบหมาย
- แจ้งเตือนเมื่อได้รับคำขอ

### 📋 โอนสิทธิ์การอนุมัติ (Approval Delegation)
- ผู้อนุมัติสามารถมอบหมายสิทธิ์การอนุมัติให้ผู้อื่นชั่วคราว
- กำหนดช่วงวันที่ + เหตุผล
- ยกเลิกการมอบหมายได้
- Admin ดูการมอบหมายทั้งหมดในระบบ

### 📊 แดชบอร์ดและรายงาน
- แสดงสิทธิ์การลาคงเหลือแบบ Real-time
- ปฏิทินการลาแบบเต็มหน้า + Mini Calendar บนแดชบอร์ด
- วันหยุดราชการไทย 15 วัน/ปี คำนวณอัตโนมัติ (รวมวันหยุดชดเชย + วันหยุดจันทรคติ 2025-2032)
- รายงานสถิติ 4 แบบ: สรุปรวม / แยกหน่วยงาน / รายบุคคล / สิทธิ์คงเหลือ
- ส่งออก Excel (XLSX) และ PDF
- รายงานเข้าถึงได้ตั้งแต่ระดับ Director ขึ้นไป

### 🖨️ พิมพ์เอกสาร (PDF Generation)
- พิมพ์ใบลา (LeaveFormPDF)
- พิมพ์ใบยกเลิกการลา (CancelLeaveFormPDF)

### 🔔 ระบบแจ้งเตือน
- แจ้งเตือนในระบบ (In-App Notification) พร้อม Badge นับจำนวน
- อีเมลอัตโนมัติ (คำขอใหม่, อนุมัติ, ปฏิเสธ, มอบหมายงานแทน, Reset รหัสผ่าน)
- ตั้งค่าเปิด/ปิดการรับอีเมลรายบุคคล
- เตือนคำขอรออนุมัติค้าง (ทุกวัน 08:00)
- ลบแจ้งเตือนเก่าอัตโนมัติ (เกิน 90 วัน)
- Supabase Realtime — อัปเดตแจ้งเตือนทันทีโดยไม่ต้อง Refresh

### 👤 ระบบลงทะเบียนพนักงานใหม่
- ลงทะเบียนผ่านหน้าเว็บ (Public)
- Admin ดู / อนุมัติ / ปฏิเสธ / ลบคำขอลงทะเบียน
- อนุมัติแล้วสร้างบัญชีผู้ใช้อัตโนมัติ

### 🗃️ จัดการผู้ใช้ (Admin)
- ดูรายชื่อผู้ใช้ทั้งหมด + CRUD
- Reset รหัสผ่านผู้ใช้
- ปรับสิทธิ์วันลาคงเหลือ (Leave Balance Adjustment)
- ลบผู้ใช้ 3 โหมด: Deactivate / Archive / ลบถาวร
- เปิดใช้งานผู้ใช้ที่ถูก Deactivate
- จัดการผู้ใช้ที่ถูก Archive (ดูประวัติ, ลบถาวร)

### 📅 ยกยอดวันลาพักผ่อน (Vacation Carryover)
- ยกยอดอัตโนมัติทุกวันที่ 1 ตุลาคม (ปีงบประมาณใหม่)
- อายุราชการ < 10 ปี → สะสมได้ไม่เกิน 20 วัน
- อายุราชการ ≥ 10 ปี → สะสมได้ไม่เกิน 30 วัน
- ยกยอดรายบุคคลหรือทั้งระบบ
- Reset สิทธิ์ลาป่วย/ลากิจ ประจำปี

### 📝 Audit Logs
- บันทึกทุกการกระทำสำคัญ (login, สร้างคำขอลา, อนุมัติ, ปฏิเสธ, แก้ไขผู้ใช้ ฯลฯ)
- เก็บข้อมูลเก่า/ใหม่ (JSONB), IP Address, User Agent
- Admin เรียกดูได้

---

## 👥 5 บทบาทในระบบ

| Role | ตำแหน่ง | สิทธิ์หลัก |
|------|---------|-----------|
| **User** | ข้าราชการ/เจ้าหน้าที่ | ยื่นลา, ยกเลิกลา, ดูประวัติ, ดูสิทธิ์คงเหลือ, ตั้งค่าโปรไฟล์, รายงานส่วนตัว |
| **Director** | ผอ.กลุ่มงาน | อนุมัติ/ปฏิเสธ Level 1, ดูคำขอบุคลากรในสังกัด, ประวัติอนุมัติ, รายงาน |
| **Central Office Staff** | เจ้าหน้าที่กองกลาง | ตรวจสอบเอกสาร, อนุมัติ Level 2, ประวัติอนุมัติ |
| **Central Office Head** | หัวหน้ากองกลาง | อนุมัติ Level 3, Partial Approval, ประวัติอนุมัติ |
| **Admin** | ผอ.สำนัก | อนุมัติ Final + Partial, จัดการผู้ใช้, Archive, Carryover, รายงาน, Audit logs |

---

## 📝 ประเภทการลา (9 ประเภท)

| ประเภท | Code | สิทธิ์/ปี | ต้องแนบเอกสาร | ได้รับเงินเดือน |
|--------|------|-----------|---------------|---------------|
| ลาป่วย | SICK | 60 วัน | เกิน 3 วัน ต้องมีใบรับรองแพทย์ | ✅ |
| ลากิจส่วนตัว | PERSONAL | 45 วัน | ❌ | ✅ |
| ลาพักผ่อน | VACATION | 10 วัน (สะสมได้ตามเกณฑ์) | ❌ | ✅ |
| ลาคลอดบุตร | MATERNITY | 90 วัน | ✅ | ✅ |
| ลาช่วยภรรยาคลอดบุตร | PATERNITY | 15 วัน | ✅ | ✅ |
| ลาประกอบพิธีฮัจย์ | HAJJ | ไม่จำกัด | ✅ | ✅ |
| ลาอุปสมบท | ORDINATION | ไม่จำกัด | ✅ | ✅ |
| ลาเข้ารับการตรวจเลือก | MILITARY | ไม่จำกัด | ✅ | ❌ |
| ลาอื่นๆ | OTHER | ไม่จำกัด | - | ✅ |

---

## 🗂️ โครงสร้างโปรเจค

```
spoon_intern/
├── database/                  # Database Schema และ SQL Scripts (20 ไฟล์)
│   ├── schema.sql            # Schema หลัก
│   ├── NEW_PROJECT_SETUP.sql # Setup สำหรับโปรเจคใหม่
│   ├── seed_real_data.sql    # ข้อมูลตัวอย่าง
│   ├── storage_setup.sql     # ตั้งค่า Supabase Storage
│   ├── performance_indexes.sql
│   └── ...                   # Migration scripts
│
├── backend/                   # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Configuration (supabase, email, logger, swagger)
│   │   ├── controllers/      # Route controllers (9 controllers)
│   │   ├── middlewares/      # Auth, role, rate-limit, validation
│   │   ├── routes/           # API routes (12 route files)
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── __tests__/            # Test files (Jest)
│   └── package.json
│
├── frontend/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # React components (common, dashboard, layout, leave, ui)
│   │   ├── pages/            # Pages (admin, auth, centralOffice, delegation, director, user)
│   │   ├── api/              # API service files
│   │   ├── contexts/         # React Context (Auth, Realtime)
│   │   ├── routes/           # Route definitions
│   │   └── utils/            # Utility functions & constants
│   └── package.json
│
├── docs/                      # เอกสารประกอบ
│   ├── API.md                # API Documentation
│   ├── USER_GUIDE.md         # คู่มือใช้งาน
│   └── คู่มือระบบการลาอิเล็กทรอนิกส์.md
│
├── ecosystem.config.js        # PM2 Deployment config
├── DEPLOYMENT.md              # คู่มือ Deploy
└── README.md                 # ไฟล์นี้
```

---

## 🛠️ เทคโนโลยีที่ใช้

### Database
- **Supabase** (PostgreSQL) — Row Level Security, Real-time, Storage

### Backend
- **Node.js** + **Express.js** — REST API
- **@supabase/supabase-js** — Database client
- **JWT** + **bcryptjs** — Authentication & password hashing
- **Nodemailer** — Email notifications (SMTP/Gmail)
- **Helmet** + **CORS** + **express-rate-limit** — Security
- **Winston** — Structured logging (file + console)
- **Multer** — File upload
- **node-cron** — Scheduled tasks (carryover, reminders, cleanup)
- **compression** — Gzip response compression
- **Swagger (swagger-jsdoc + swagger-ui-express)** — API documentation
- **Jest** + **Supertest** — Testing
- **PM2** — Process management & deployment

### Frontend
- **React 18** + **Vite** — UI framework & build tool
- **React Router DOM 7** — Routing
- **Tailwind CSS** — Styling
- **Axios** — HTTP client (w/ interceptor: auto-token, 401 redirect)
- **React Hook Form** + **Zod** — Form handling & validation
- **Lucide React** — Icons
- **React Hot Toast** — Toast notifications
- **React Big Calendar** — Leave calendar view
- **date-fns** — Date utilities
- **jsPDF** + **html2canvas** + **xlsx** — Export to PDF/Excel
- **Supabase Realtime** — Real-time notification & data updates

---

## 📡 API Routes

| หมวด | Prefix | คำอธิบาย |
|------|--------|---------|
| Auth | `/auth` | Login, Logout, Change password, Forgot/Reset password, Profile, Profile image |
| Leave | `/api/leaves` | CRUD คำขอลา, ดูสิทธิ์, ยกเลิก, ปฏิทิน |
| Director | `/api/director` | อนุมัติ Level 1, ประวัติ, ยกเลิกการลา |
| Central Office | `/api/central-office` | อนุมัติ Level 2 & 3 (Staff & Head), Partial approval |
| Admin | `/api/admin` | อนุมัติ Final, จัดการผู้ใช้, Archive, Carryover, Audit logs |
| Notification | `/api/notifications` | แจ้งเตือน, Mark as read, Cleanup, Reminders |
| Acting | `/api/acting` | ผู้ปฏิบัติหน้าที่แทน, อนุมัติคำขอ |
| Delegation | `/api/delegation` | โอนสิทธิ์การอนุมัติ (สร้าง, ยกเลิก, ดู) |
| Registration | `/api/registration` | ลงทะเบียนพนักงานใหม่ (สาธารณะ + Admin จัดการ) |
| Reports | `/api/reports` | รายงาน 4 แบบ (สรุป, หน่วยงาน, รายบุคคล, สิทธิ์คงเหลือ) |
| Upload | `/api/upload` | อัปโหลด/ดู/ลบเอกสารแนบ |
| Health | `/health` | Health check (DB latency, memory) |

---

## 🔒 ความปลอดภัย

- JWT Token-based Authentication
- Password hashing (bcryptjs)
- CSRF Protection (Origin check)
- XSS Sanitization (Request body)
- Rate Limiting:
  - Login: 10 requests / 15 นาที (ต่อ employee+IP)
  - API ทั่วไป: 100/min (production), 500/min (dev)
  - Sensitive actions: 30/min
  - Password change: 3/hr
  - File upload: 10 / 15 นาที
- Helmet (HTTP Security Headers — XSS, Clickjacking, CSP)
- CORS Configuration
- Row Level Security (Supabase RLS)
- Input validation (express-validator + Zod)
- Atomic Balance Deduction (Row locking ป้องกัน Race condition)
- In-memory Cache Middleware (TTL + eviction)
- Gzip Compression

---

## 📋 สถานะการพัฒนา

### ✅ Phase 1: Database Design
- [x] Schema 4-level approval + cancellation workflow
- [x] 20 SQL scripts (tables, migrations, indexes, seed data)
- [x] RLS Policies + Supabase Storage

### ✅ Phase 2: Backend Development
- [x] Authentication (JWT + bcrypt + Forgot/Reset password)
- [x] Leave CRUD + Balance calculation (Atomic deduction)
- [x] 4-level approval (Director → Central Staff → Central Head → Admin)
- [x] Cancellation workflow (4-level เช่นกัน)
- [x] Partial approval (Central Office Head + Admin)
- [x] Email notifications (Nodemailer + เปิด/ปิดรายบุคคล)
- [x] File upload (Supabase Storage, max 5 files/request)
- [x] Registration system (Public register + Admin approve/reject)
- [x] Acting person management (คำขอ + อนุมัติ)
- [x] Approval delegation (โอนสิทธิ์การอนุมัติชั่วคราว)
- [x] Vacation carryover (ยกยอดอัตโนมัติ 1 ต.ค.)
- [x] Archived users management
- [x] Audit logs (ทุกการกระทำ + IP + User Agent)
- [x] Reports (4 แบบ) + Export
- [x] Scheduled tasks (Cron: carryover, reminders, cleanup)
- [x] Swagger API docs
- [x] Security (Helmet, CSRF, XSS, Rate limiting, Cache, Compression)

### ✅ Phase 3: Frontend Development
- [x] Login + Registration + Forgot/Reset password
- [x] User Dashboard (สิทธิ์คงเหลือ, ปฏิทิน, คำขอล่าสุด, แจ้งเตือน)
- [x] สร้างคำขอลา (เลือกวันไม่ต่อเนื่อง, แนบเอกสาร, ผู้ปฏิบัติแทน)
- [x] รายการคำขอลา + รายละเอียด + Timeline อนุมัติ
- [x] ยกเลิกคำขอลา (แบบฟอร์มพร้อมเหตุผล + พิมพ์ PDF)
- [x] Director / Central Office / Admin Dashboard + ประวัติอนุมัติ
- [x] การอนุมัติ + Partial approval (Central Head + Admin)
- [x] จัดการผู้ใช้ (CRUD, Reset password, Archive, ปรับสิทธิ์วันลา)
- [x] รายงานการลา 4 แบบ + Export Excel/PDF
- [x] ระบบแจ้งเตือน (In-app + Badge + Realtime)
- [x] ลงทะเบียนพนักงานใหม่ (Admin จัดการ)
- [x] คำขอปฏิบัติหน้าที่แทน (Acting requests)
- [x] โอนสิทธิ์การอนุมัติ (Delegation page)
- [x] ยกยอดวันลาพักผ่อน (Vacation carryover)
- [x] ตั้งค่าโปรไฟล์ (รูปภาพ, รหัสผ่าน, อีเมล)
- [x] ปฏิทินการลา (Calendar full page + Thai holidays)
- [x] พิมพ์ใบลา / ใบยกเลิกการลา (PDF)
- [x] Supabase Realtime subscriptions
- [x] Responsive Design

### ✅ Phase 4: Documentation & Deployment
- [x] API Documentation (Swagger)
- [x] User Guide
- [x] คู่มือระบบการลาอิเล็กทรอนิกส์
- [x] PM2 ecosystem config
- [x] Deployment guide

---

## ⏰ Scheduled Tasks (Cron Jobs)

| งาน | กำหนดเวลา | รายละเอียด |
|-----|----------|------------|
| ยกยอดวันลาพักผ่อน | 1 ตุลาคม 00:01 | คำนวณ carryover ตามอายุราชการ |
| Reset สิทธิ์ลาป่วย/ลากิจ | 1 ตุลาคม 00:01 | ลาป่วย=60, ลากิจ=15 |
| เตือนคำขอรออนุมัติ | ทุกวัน 08:00 | แจ้งผู้อนุมัติที่มีคำขอค้าง |
| ลบแจ้งเตือนเก่า | ทุก 24 ชม. + Server start | ลบที่อ่านแล้วเกิน 90 วัน |
| ตรวจสอบ Carryover ตกหล่น | Server start | รันหากพลาดวันที่ 1 ต.ค. |

---

## 🏢 หน่วยงาน (11 กลุ่มงาน)

`กอก.` `กยส.` `กทส.` `กตป.` `กสส.` `กคฐ.` `กปส.` `กกม.` `สลก.` `ตสน.` `กพร.`

---

## 📞 ติดต่อ / ช่วยเหลือ

- `docs/API.md` — API Documentation
- `docs/USER_GUIDE.md` — คู่มือใช้งาน
- `docs/คู่มือระบบการลาอิเล็กทรอนิกส์.md` — คู่มือฉบับเต็ม
- Swagger UI: http://localhost:3000/api-docs

---

## 📄 License

MIT License — ระบบนี้พัฒนาขึ้นเพื่อใช้ภายในองค์กรและการศึกษา

---

**Last Updated**: 17 มีนาคม 2026
