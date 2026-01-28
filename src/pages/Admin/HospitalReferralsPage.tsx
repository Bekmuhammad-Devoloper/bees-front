import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

export const HospitalReferralsPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'inProgress' | 'completed'>('inProgress');
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    department: '',
    employee: '',
    priceCategory: '',
    privileged: false,
  });

  const tabs = [
    { name: "Yo'llanmalar", path: '/admin/hospital/referrals', active: true },
    { name: 'Jarayonda', path: '/admin/hospital/referrals' },
    { name: 'Tugallangan', path: '/admin/hospital/referrals' },
    { name: 'Bekor qilingan', path: '/admin/hospital/referrals' },
    { name: 'Tugallangan tekshiruvlar', path: '/admin/hospital/referrals' },
  ];

  const mockData = [
    {
      historyNo: '49-2026',
      patientName: "TAJIDINOV MUHAMMADAMIN XUSNIDIN O'G'LI",
      type: 'Oddiy',
      priceCategory: 'Oddiy',
      department: "Umumiy jarrohlik bo'limi",
      roomNo: '-',
      doctor: 'ISRAILOV KOZIMJON XASANOVICI',
    },
    {
      historyNo: '48-2026',
      patientName: 'YULDASHEVA SOLIHA MIRZOXID QIZI',
      type: 'Oddiy',
      priceCategory: 'Oddiy',
      department: "Gastroenterologiya bo'limi",
      roomNo: '-',
      doctor: 'XAMRAKULOV XOSHIMJON XURBOYEVIC',
    },
    {
      historyNo: '47-2026',
      patientName: "TAJIDINOV MUHAMMADAMIN XUSNIDIN O'G'LI",
      type: 'Oddiy',
      priceCategory: 'Oddiy',
      department: "Umumiy jarrohlik bo'limi",
      roomNo: '-',
      doctor: 'ISRAILOV KOZIMJON XASANOVICI',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveSubTab('inProgress')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeSubTab === 'inProgress'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Jarayonda
          </button>
          <button
            onClick={() => setActiveSubTab('completed')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeSubTab === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tugallangan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Bemorni qidirish"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filters.privileged}
              onChange={(e) => setFilters({ ...filters, privileged: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Imtiyozli yo'llanma
          </label>

          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Filterlar">
            <FunnelIcon className="w-5 h-5" />
          </button>

          <button className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg font-medium">
            Filtrlarni qayta tiklash
          </button>

          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
            <ArrowDownTrayIcon className="w-5 h-5" />
            Excelni yuklab oling
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium">
            <PlusIcon className="w-5 h-5" />
            Bemorni rasmiylashtirish
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            title="Bo'lim"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bo'lim</option>
          </select>

          <select
            title="Xodim"
            value={filters.employee}
            onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Xodim</option>
          </select>

          <select
            title="Narxlar ro'yxati toifasi"
            value={filters.priceCategory}
            onChange={(e) => setFilters({ ...filters, priceCategory: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Narxlar ro'yxati toifasi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Kasallik tarixi №
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Bemorning ism-sharifi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Yo'llanma turi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Narxlar ro'yxati toifasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Bo'lim
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Xona raqami
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Davolovchi shifokor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-4">
                    <span className="text-blue-600 font-medium hover:underline">
                      {item.historyNo}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{item.patientName}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{item.type}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{item.priceCategory}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      🏥 {item.department}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{item.roomNo}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{item.doctor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
