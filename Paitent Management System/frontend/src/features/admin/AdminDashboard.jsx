import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, UserPlus, Settings, ShieldCheck } from 'lucide-react';
import Card from '@/components/Card.jsx';

const StatPill = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const AdminDashboard = () => {
  const laravelUrl = useMemo(() => (import.meta.env.VITE_LARAVEL_URL || 'http://localhost:8000').replace(/\/$/, ''), []);
  const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        // Fetch users list and count roles; patients list for count as fallback
        const [usersRes, patientsRes] = await Promise.all([
          fetch(`${laravelUrl}/api/admin/users`, { credentials: 'include', headers: { Accept: 'application/json' } }),
          fetch(`${laravelUrl}/api/admin/patients`, { credentials: 'include', headers: { Accept: 'application/json' } }),
        ]);
        const users = await usersRes.json().catch(() => []);
        const patients = await patientsRes.json().catch(() => []);

        if (cancelled) return;
        const doctors = Array.isArray(users) ? users.filter(u => (u.role || '').toLowerCase() === 'doctor').length : 0;
        const usersCount = Array.isArray(users) ? users.length : 0;
        const patientsCount = Array.isArray(patients) ? patients.length : 0;
        setStats({ users: usersCount, doctors, patients: patientsCount });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [laravelUrl]);

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-8">
      {/* Hero header matching other admin pages */}
      <Card className="border-0 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 ring-1 ring-emerald-100/60 shadow-xl px-6 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <UsersIcon size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Admin console</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Overview</h1>
              <p className="text-xs text-emerald-400 mt-1">
                Quick access to user and patient administration.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <StatPill label="Users" value={loading ? '—' : stats.users} />
            <StatPill label="Doctors" value={loading ? '—' : stats.doctors} />
            <StatPill label="Patients" value={loading ? '—' : stats.patients} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <ShieldCheck size={16} /> Manage users
          </Link>
          <Link
            to="/admin/patients"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <UserPlus size={16} /> Manage patients
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-800 shadow hover:bg-gray-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            <Settings size={16} /> Admin settings
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
