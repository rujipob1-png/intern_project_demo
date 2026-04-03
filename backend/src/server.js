import app from './app.js';
import { testConnection } from './config/supabase.js';
import { startFiscalYearScheduler, checkAndProcessCarryoverIfNeeded } from './services/fiscalYearScheduler.js';
import { autoCleanupNotifications, sendPendingApprovalReminders } from './controllers/notification.controller.js';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

// ============================
// Validate required env vars
// ============================
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('Please check your .env file.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

// Test Supabase connection before starting server
const startServer = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to Supabase. Please check your credentials.');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('🚀 Leave Management API Server');
      console.log('========================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`💾 Database: Supabase (Connected)`);
      console.log('========================================\n');
      console.log('📚 Available endpoints:');
      console.log('   GET  /                      - Health check');
      console.log('   POST /api/auth/login        - Login');
      console.log('   GET  /api/auth/profile      - Get profile');
      console.log('   PUT  /api/auth/change-password - Change password');
      console.log('   POST /api/leaves            - Create leave request');
      console.log('   GET  /api/leaves            - Get my leaves');
      console.log('   GET  /api/leaves/balance    - Get leave balance');
      console.log('   GET  /api/leaves/:id        - Get leave details');
      console.log('   PUT  /api/leaves/:id/cancel - Cancel leave');
      console.log('========================================\n');
      
      // เริ่มต้น Fiscal Year Scheduler
      startFiscalYearScheduler();
      
      // ตรวจสอบและยกยอดวันลาถ้าจำเป็น (กรณี server restart หลังวันที่ 1 ต.ค.)
      checkAndProcessCarryoverIfNeeded();

      // Auto-cleanup: ลบแจ้งเตือนเก่าที่อ่านแล้ว (>90 วัน) เมื่อ server เริ่มต้น
      autoCleanupNotifications();

      // ตั้ง interval ล้าง notifications ทุก 24 ชม.
      setInterval(autoCleanupNotifications, 24 * 60 * 60 * 1000);

      // แจ้งเตือนใบลาค้างอนุมัติ ทุกวัน 08:00 น.
      cron.schedule('0 8 * * *', () => {
        console.log('[Cron] ส่งแจ้งเตือนใบลาค้างอนุมัติ...');
        sendPendingApprovalReminders();
      }, { timezone: 'Asia/Bangkok' });
      console.log('⏰ Pending approval reminder scheduled daily at 08:00');
    });

    // ============================
    // Graceful Shutdown
    // ============================
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed. All in-flight requests completed.');
        process.exit(0);
      });
      // Force exit หลัง 10 วินาที ถ้ายังปิดไม่สำเร็จ
      setTimeout(() => {
        console.error('❌ Forced shutdown — could not close connections in time.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
