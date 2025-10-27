import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Card from '@/components/Card.jsx';

const AdminEditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'doctor' });
  const laravelUrl = import.meta.env.VITE_LARAVEL_URL || 'http://localhost:8000';

  useEffect(() => {
    (async () => {
      const res = await fetch(`${laravelUrl}/api/admin/users/${id}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setForm({ name: data.name || '', email: data.email || '', role: (data.role || 'doctor') });
      }
    })();
  }, [id, laravelUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${laravelUrl}/api/admin/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update user');
      alert('User updated');
      navigate('/admin/users');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="p-6 text-slate-500">Loading user...</div>;
  }

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-8">
      <Card className="border-0 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 ring-1 ring-emerald-100/60 shadow-xl px-6 sm:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Admin console</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Edit User</h1>
          </div>
          <Link to="/admin/users" className="text-sm text-emerald-600 font-semibold">Back to users</Link>
        </div>
      </Card>

      <Card className="rounded-2xl bg-white shadow-md ring-1 ring-emerald-100/70 px-6 py-6">
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Name</span>
            <input name="name" value={form.name} onChange={handleChange} className="rounded-lg border border-slate-200 px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="rounded-lg border border-slate-200 px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Role</span>
            <select name="role" value={form.role} onChange={handleChange} className="rounded-lg border border-slate-200 px-3 py-2">
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </label>
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200 bg-emerald-500/90 text-white hover:bg-emerald-500">{saving ? 'Saving...' : 'Save'}</button>
            <Link to="/admin/users" className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminEditUser;
