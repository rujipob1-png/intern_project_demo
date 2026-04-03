/**
 * My Report Page
 * หน้ารายงานการลาของตัวเอง (สำหรับ User ทุก Role)
 * ผู้ใช้สามารถดูสรุป กรองข้อมูล และ export เป็น CSV / Excel ได้
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveAPI } from '../../api/leave.api';
import { exportLeavesToCSV, exportMyLeavesToExcel } from '../../utils/reportExport';
import { formatDate } from '../../utils/formatDate';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyReportPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    dateFrom: '',
    dateTo: '',
    year: String(new Date().getFullYear()),
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLeaves();
    fetchLeaveTypes();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getMyLeaves({ limit: 9999 });
      const allLeaves = response.data?.leaves || response.data || [];
      setLeaves(allLeaves);
    } catch (error) {
      console.error('Error loading leaves:', error);
      toast.error('ไม่สามารถโหลดข้อมูลการลาได้');
    } finally {
      setLoading(false);
    }
  };

  // Available years from data
  const availableYears = useMemo(() => {
    const years = new Set();
    leaves.forEach(l => {
      const y = new Date(l.startDate || l.start_date).getFullYear();
      if (!isNaN(y)) years.add(y);
    });
    return [...years].sort((a, b) => b - a);
  }, [leaves]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveAPI.getLeaveTypes();
      setLeaveTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    let filtered = [...leaves];

    if (filters.status !== 'all') {
      if (filters.status === 'pending_all') {
        filtered = filtered.filter(l => ['pending', 'approved_level1', 'approved_level2', 'approved_level3'].includes(l.status));
      } else {
        filtered = filtered.filter(l => l.status === filters.status);
      }
    }

    if (filters.leaveType !== 'all') {
      filtered = filtered.filter(l => {
        const c = (l.leaveTypeCode || l.leave_types?.type_code || '').toUpperCase();
        return c === filters.leaveType.toUpperCase();
      });
    }

    if (filters.year !== 'all') {
      const y = parseInt(filters.year);
      filtered = filtered.filter(l => new Date(l.startDate || l.start_date).getFullYear() === y);
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom + 'T00:00:00');
      filtered = filtered.filter(l => new Date(l.startDate || l.start_date) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo + 'T23:59:59');
      filtered = filtered.filter(l => new Date(l.endDate || l.end_date) <= to);
    }

    return filtered;
  }, [leaves, filters]);

  // Summary
  const summary = useMemo(() => {
    const approved = filteredLeaves.filter(l => l.status === 'approved_final' || l.status === 'approved').length;
    const pending = filteredLeaves.filter(l =>
      ['pending', 'approved_level1', 'approved_level2', 'approved_level3'].includes(l.status)
    ).length;
    const rejected = filteredLeaves.filter(l => l.status === 'rejected').length;
    const totalDays = filteredLeaves
      .filter(l => l.status === 'approved_final' || l.status === 'approved')
      .reduce((sum, l) => sum + (l.total_days || l.totalDays || 0), 0);

    return { total: filteredLeaves.length, approved, pending, rejected, totalDays };
  }, [filteredLeaves]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ status: 'all', leaveType: 'all', dateFrom: '', dateTo: '', year: String(new Date().getFullYear()) });
  };

  const handleExportCSV = async () => {
    if (filteredLeaves.length === 0) {
      toast.error('ไม่มีข้อมูลให้ดาวน์โหลด');
      return;
    }
    setExporting(true);
    try {
      exportLeavesToCSV(filteredLeaves, 'รายงานการลาของฉัน');
      toast.success('ดาวน์โหลด CSV สำเร็จ');
    } catch {
      toast.error('เกิดข้อผิดพลาดในการ export');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (filteredLeaves.length === 0) {
      toast.error('ไม่มีข้อมูลให้ดาวน์โหลด');
      return;
    }
    setExporting(true);
    try {
      exportMyLeavesToExcel(filteredLeaves, 'รายงานการลาของฉัน');
      toast.success('ดาวน์โหลด Excel สำเร็จ');
    } catch {
      toast.error('เกิดข้อผิดพลาดในการ export');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSingle = (leave) => {
    try {
      const leaveNum = leave.leaveNumber || leave.leave_number || 'leave';
      exportLeavesToCSV([leave], `ใบลา_${leaveNum}`);
      toast.success('ดาวน์โหลดสำเร็จ');
    } catch {
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'รอพิจารณา', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
      approved_level1: { label: 'รอพิจารณา', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
      approved_level2: { label: 'รอพิจารณา', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
      approved_level3: { label: 'รอพิจารณา', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
      approved: { label: 'อนุมัติ', className: 'bg-gray-100 text-gray-700 border-gray-300', icon: CheckCircle },
      approved_final: { label: 'อนุมัติ', className: 'bg-gray-100 text-gray-700 border-gray-300', icon: CheckCircle },
      rejected: { label: 'ไม่อนุมัติ', className: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle },
      cancelled: { label: 'ยกเลิก', className: 'bg-gray-50 text-gray-400 border-gray-200', icon: Ban },
      pending_cancel: { label: 'รอพิจารณายกเลิก', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
      cancel_level1: { label: 'รอพิจารณายกเลิก', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
      cancel_level2: { label: 'รอพิจารณายกเลิก', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
      cancel_level3: { label: 'รอพิจารณายกเลิก', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
    };
    const config = statusConfig[(status || '').toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">รายงานการลาของฉัน</h1>
          <p className="text-gray-500 text-sm mt-1">สรุปข้อมูลการลาและดาวน์โหลดรายงาน</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting || filteredLeaves.length === 0}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting || filteredLeaves.length === 0}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">ทั้งหมด</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{summary.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">อนุมัติ</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{summary.approved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">รอพิจารณา</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{summary.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">ไม่อนุมัติ</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{summary.rejected}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-500">วันลารวม</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{summary.totalDays}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            ตัวกรอง
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> รีเซ็ต
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ปี</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกปี</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y + 543}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">สถานะ</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending_all">รอพิจารณา</option>
              <option value="approved_final">อนุมัติแล้ว</option>
              <option value="rejected">ไม่อนุมัติ</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ประเภทการลา</label>
            <select
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทั้งหมด</option>
              {leaveTypes.map(type => (
                <option key={type.id || type.type_code} value={type.type_code}>{type.type_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ตั้งแต่วันที่</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ถึงวันที่</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-slate-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">เลขที่ใบลา</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ประเภท</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">วันที่</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">จำนวน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">สถานะ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">เหตุผล</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">ดาวน์โหลด</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                      ไม่พบข้อมูลการลาตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave, index) => (
                    <tr key={leave.id || index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {leave.leaveNumber || leave.leave_number || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {leave.leaveType || leave.leave_types?.type_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div>{formatDate(leave.startDate || leave.start_date)}</div>
                        {(leave.startDate || leave.start_date) !== (leave.endDate || leave.end_date) && (
                          <div className="text-xs text-slate-400">
                            ถึง {formatDate(leave.endDate || leave.end_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {leave.totalDays || leave.total_days || 0} วัน
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(leave.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">
                        {leave.reason || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleExportSingle(leave)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                          title="ดาวน์โหลด CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                          CSV
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredLeaves.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
              แสดง {filteredLeaves.length} รายการ
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyReportPage;
