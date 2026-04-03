# Frontend — ระบบการลาอิเล็กทรอนิกส์

## เทคโนโลยี

- **React 18** + **Vite** — UI framework & build tool
- **React Router DOM 7** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client (w/ interceptor: auto-token, 401 redirect)
- **React Hook Form** + **Zod** — Form handling & validation
- **Lucide React** — Icon library
- **React Hot Toast** — Toast notifications
- **React Big Calendar** — Leave calendar view
- **Supabase Realtime** — Real-time notification & data updates
- **date-fns** — Date utilities
- **jsPDF** + **html2canvas** + **xlsx** — Export to PDF/Excel

## โครงสร้าง

```
src/
├── api/              # API service files (axios instances + interceptor)
├── components/
│   ├── common/       # Shared (ThaiDatePicker, Pagination, ConfirmDialog,
│   │                 #   NotificationBell, ErrorBoundary, DateEditModal,
│   │                 #   PartialApprovalDetailModal)
│   ├── dashboard/    # Dashboard widgets (DashboardCalendar, stats cards)
│   ├── layout/       # Layout (Sidebar, Header, MainLayout)
│   ├── leave/        # Leave-specific (CalendarPicker, CancelLeaveModal,
│   │                 #   ActingPersonSelect, LeaveFormPDF, CancelLeaveFormPDF,
│   │                 #   PrintCancelLeaveForm, Timeline)
│   └── ui/           # Base UI elements
├── contexts/
│   ├── AuthContext.jsx     # Auth state management
│   └── RealtimeContext.jsx # Supabase Realtime subscriptions
├── pages/
│   ├── admin/        # AdminDashboard, UserManagement, RegistrationManagement,
│   │                 #   LeaveReports, ApprovalHistory, CancelRequests, CancelHistory
│   ├── auth/         # Login, Register, ForgotPassword, ResetPassword
│   ├── centralOffice/# Staff & Head: Dashboard, History, CancelRequests
│   ├── delegation/   # DelegationPage (โอนสิทธิ์การอนุมัติ)
│   ├── director/     # Dashboard, ApprovalHistory, CancelRequests
│   ├── user/         # CreateLeave, MyLeaves, LeaveDetail, LeaveHistory,
│   │                 #   LeaveCalendar, MyReport, ActingRequests, Settings
│   └── DashboardPage.jsx  # Main user dashboard
├── routes/           # Route definitions & guards (ProtectedRoute)
├── utils/
│   ├── thaiHolidays.js    # วันหยุดราชการไทย (15 วัน/ปี + วันหยุดจันทรคติ 2025-2032)
│   ├── reportExport.js    # Export to Excel (XLSX) & PDF
│   ├── validation.js      # Zod schemas
│   ├── formatDate.js      # Thai Buddhist Era date formatting
│   ├── departmentMapping.js # 11 กลุ่มงาน (EN→TH)
│   └── nameUtils.js       # Thai title/name utilities
├── App.jsx           # Root component
└── main.jsx          # Entry point
```

## การรันงาน

```bash
# ติดตั้ง dependencies
npm install

# Development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

สร้างไฟล์ `.env`:
```env
VITE_API_URL=http://localhost:3000
```
