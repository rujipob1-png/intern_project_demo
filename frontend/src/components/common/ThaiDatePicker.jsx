import { useState, useRef, useEffect, useCallback } from 'react';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export const ThaiDatePicker = ({ value, onChange, className = '', disabled = false, placeholder = 'เลือกวันที่' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const thaiYear = year + 543;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // วันสุดท้ายของเดือนก่อน — ใช้โชว์วันเทาๆ ข้างหน้า
  const prevMonthDays = new Date(year, month, 0).getDate();

  const navigate = useCallback((dir) => {
    if (viewMode === 'days') {
      setViewDate(new Date(year, month + dir, 1));
    } else if (viewMode === 'months') {
      setViewDate(new Date(year + dir, month, 1));
    } else {
      setViewDate(new Date(year + dir * 12, month, 1));
    }
  }, [viewMode, year, month]);

  const selectDate = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange({ target: { value: `${year}-${m}-${d}` } });
    setIsOpen(false);
    setViewMode('days');
  };

  const selectMonth = (m) => {
    setViewDate(new Date(year, m, 1));
    setViewMode('days');
  };

  const selectYear = (y) => {
    setViewDate(new Date(y, month, 1));
    setViewMode('months');
  };

  const isSelected = (day) => {
    if (!value) return false;
    const s = new Date(value);
    return s.getFullYear() === year && s.getMonth() === month && s.getDate() === day;
  };

  const isToday = (day) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
  };

  const displayValue = value
    ? (() => {
      const d = new Date(value);
      return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
    })()
    : '';

  // Calendar grid — 6 rows × 7 cols
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: prevMonthDays - firstDayOfWeek + 1 + i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, outside: false });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, outside: true });
  }

  // Year grid — 12 years centered around current
  const startYear = year - 5;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const headerLabel = viewMode === 'days'
    ? `${THAI_MONTHS[month]} ${thaiYear}`
    : viewMode === 'months'
      ? `${thaiYear}`
      : `${(startYear + 543)} - ${(startYear + 11 + 543)}`;

  const handleHeaderClick = () => {
    if (viewMode === 'days') setViewMode('months');
    else if (viewMode === 'months') setViewMode('years');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div
        onClick={() => { if (!disabled) { setIsOpen(!isOpen); setViewMode('days'); } }}
        className={`flex items-center justify-between cursor-pointer ${className || 'w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm'} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white hover:border-slate-400 transition-colors'}`}
      >
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-900 hover:bg-slate-200 transition-all active:scale-90 text-lg"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={handleHeaderClick}
              className="px-3 py-1 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-200 transition-colors"
            >
              {headerLabel}
            </button>

            <button
              type="button"
              onClick={() => navigate(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-900 hover:bg-slate-200 transition-all active:scale-90 text-lg"
            >
              ›
            </button>
          </div>

          {/* === Days View === */}
          {viewMode === 'days' && (
            <>
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((d, i) => (
                  <div
                    key={d}
                    className={`text-center text-[11px] font-semibold py-1.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((cell, i) => {
                  const colIdx = i % 7;
                  const isSun = colIdx === 0;
                  const isSat = colIdx === 6;

                  if (cell.outside) {
                    return (
                      <div key={i} className="flex items-center justify-center">
                        <span className="w-9 h-9 flex items-center justify-center text-[13px] text-slate-300">
                          {cell.day}
                        </span>
                      </div>
                    );
                  }

                  const selected = isSelected(cell.day);
                  const today = isToday(cell.day);

                  return (
                    <div key={i} className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => selectDate(cell.day)}
                        className={`w-9 h-9 rounded-xl text-[13px] font-medium flex items-center justify-center transition-all duration-150
                          ${selected
                            ? 'bg-slate-800 text-white shadow-md shadow-slate-300'
                            : today
                              ? 'ring-2 ring-slate-400 text-slate-800 font-bold bg-slate-50'
                              : isSun
                                ? 'text-red-500 hover:bg-red-50'
                                : isSat
                                  ? 'text-blue-500 hover:bg-blue-50'
                                  : 'text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        {cell.day}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* === Months View === */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {THAI_MONTHS_SHORT.map((m, i) => {
                const today = new Date();
                const isCurrent = today.getFullYear() === year && today.getMonth() === i;
                const isActive = month === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectMonth(i)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-slate-800 text-white shadow-md shadow-slate-300'
                        : isCurrent
                          ? 'ring-2 ring-slate-400 text-slate-700 bg-slate-50'
                          : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                      }
                    `}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* === Years View === */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {years.map((y) => {
                const today = new Date();
                const isCurrent = today.getFullYear() === y;
                const isActive = year === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => selectYear(y)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-slate-800 text-white shadow-md shadow-slate-300'
                        : isCurrent
                          ? 'ring-2 ring-slate-400 text-slate-700 bg-slate-50'
                          : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                      }
                    `}
                  >
                    {y + 543}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onChange({ target: { value: '' } }); setIsOpen(false); setViewMode('days'); }}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              ล้าง
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const m = String(today.getMonth() + 1).padStart(2, '0');
                const d = String(today.getDate()).padStart(2, '0');
                onChange({ target: { value: `${today.getFullYear()}-${m}-${d}` } });
                setViewDate(today);
                setIsOpen(false);
                setViewMode('days');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              วันนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
