import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import { appointmentsApi } from '@/api/appointments';
import { useUser } from '@/UserContext.jsx';
import { Users as UsersIcon, Search as SearchIcon, SlidersHorizontal, X, Activity as ActivityIcon, TrendingUp, TrendingDown, Stethoscope } from 'lucide-react';

const TreatmentRecommendationDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [insulinFilter, setInsulinFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const { user } = useUser();
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const laravelUrl = import.meta.env.VITE_LARAVEL_URL || 'http://localhost:8000';
        const params = new URLSearchParams({
          ...(user?.role === 'doctor' ? { doctor_id: user.id } : {}),
        });
        const url = `${laravelUrl}/api/patients${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await fetch(url, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        setPatients(data);
        setFiltered(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPatients();
  }, [user]);

  // Load appointments to detect upcoming per patient
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = { perPage: 200, page: 1, ...(user?.role === 'doctor' ? { doctor_id: user.id } : {}) };
        const { data } = await appointmentsApi.list(params);
        if (!cancelled) setAppts(Array.isArray(data) ? data : []);
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      patients.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const insulin = (p.insulin_regimen_type || '').trim().toLowerCase();
        const gender = (p.gender || '').trim().toLowerCase();
        const matchesSearch = name.includes(q);
        const matchesInsulin = insulinFilter === 'All' || insulin === insulinFilter.toLowerCase();
        const matchesGender = genderFilter === 'All' || gender === genderFilter.toLowerCase();
        return matchesSearch && matchesInsulin && matchesGender;
      })
    );
  }, [search, insulinFilter, genderFilter, patients]);

  const insulinTypes = Array.from(new Set(patients.map((p) => p.insulin_regimen_type).filter(Boolean)));
  const genders = Array.from(new Set(patients.map((p) => p.gender).filter(Boolean)));
  const clearFilters = () => {
    setSearch('');
    setInsulinFilter('All');
    setGenderFilter('All');
  };

  const totalPatients = patients.length;
  const filteredCount = filtered.length;
  const avgHbChange = filteredCount
    ? (filtered.reduce((sum, p) => sum + (Number(p.reduction_a) || 0), 0) / filteredCount).toFixed(1)
    : '—';
  const avgFvgChange = filteredCount
    ? (filtered.reduce((sum, p) => sum + (Number(p.fvg_delta_1_2) || 0), 0) / filteredCount).toFixed(1)
    : '—';
  const regimenCounts = patients.reduce((acc, p) => {
    const key = p.insulin_regimen_type ? p.insulin_regimen_type.toString() : 'Unspecified';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topRegimens = Object.entries(regimenCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const readyForReview = filtered.filter((p) => (Number(p.reduction_a) || 0) > 1 || (Number(p.fvg_delta_1_2) || 0) > 2).length;
  const highDistressPatients = filtered
    .filter((p) => (Number(p.dds_trend_1_3) || 0) > 1.5)
    .sort((a, b) => (Number(b.dds_trend_1_3) || 0) - (Number(a.dds_trend_1_3) || 0))
    .slice(0, 5);
  const lowEgfrPatients = filtered
    .filter((p) => (Number(p.egfr) || Infinity) < 60)
    .sort((a, b) => (Number(a.egfr) || Infinity) - (Number(b.egfr) || Infinity))
    .slice(0, 5);

  const avgDdsNum = filteredCount
    ? filtered.reduce((sum, p) => sum + (Number(p.dds_trend_1_3) || 0), 0) / filteredCount
    : null;
  const avgDds = avgDdsNum !== null ? avgDdsNum.toFixed(2) : '—';
  const risingCount = filtered.filter((p) => (Number(p.dds_trend_1_3) || 0) > 1).length;
  const risingPct = filteredCount ? Math.round((risingCount / filteredCount) * 100) : null;
  const noRegimenCount = patients.filter((p) => !p.insulin_regimen_type).length;

  // Pending follow-up (no upcoming appt in 14d)
  const todayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const addDays = (str, n) => {
    const [y,m,d] = str.split('-').map(Number);
    const dt = new Date(y, m-1, d);
    dt.setDate(dt.getDate() + n);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth()+1).padStart(2,'0');
    const dd = String(dt.getDate()).padStart(2,'0');
    return `${yy}-${mm}-${dd}`;
  };
  const today = todayLocal();
  const to14 = addDays(today, 14);
  const hasUpcoming = (pid) => appts.some(a => a.patient_id === pid && a.date > today && a.date <= to14);
  const pendingFollowupList = filtered.filter((p) => !hasUpcoming(p.id));
  const pendingFollowupCount = pendingFollowupList.length;
  const pendingFollowupTop = pendingFollowupList.slice(0, 3);

  // Recommendation adoption (proxy): improving signals
  const isImproving = (p) => (Number(p.reduction_a) || 0) > 0.5 || (Number(p.fvg_delta_1_2) || 0) < 0 || (Number(p.dds_trend_1_3) || 0) < 0;
  const adopted = filtered.filter(isImproving).length;
  const suggested = filteredCount;
  const adoptionRate = suggested ? Math.round((adopted / suggested) * 100) : null;

  // HbA1c targets and therapy response
  const latestHba1c = (p) => {
    const vals = [p.hba1c_3rd_visit, p.hba1c_2nd_visit, p.hba1c_1st_visit].map((v) => Number(v)).filter((v) => Number.isFinite(v));
    return vals.length ? vals[0] : null; // prefer 3rd, then 2nd, then 1st
  };
  const atTarget = filtered.filter((p) => {
    const v = latestHba1c(p);
    return v !== null && v <= 7.0;
  });
  const atTargetPct = filteredCount ? Math.round((atTarget.length / filteredCount) * 100) : null;

  const bucketOf = (p) => {
    const ra = Number(p.reduction_a) || 0;
    const fvg = Number(p.fvg_delta_1_2) || 0;
    if (ra > 1.0 || fvg < -1.0) return 'Improving';
    if (ra < 0 || fvg > 1.0) return 'Worsening';
    return 'Stable';
  };
  const responseBuckets = filtered.reduce((acc, p) => { const b = bucketOf(p); acc[b] = (acc[b]||0)+1; return acc; }, { Improving: 0, Stable: 0, Worsening: 0 });
  const worseningList = filtered.filter((p) => bucketOf(p) === 'Worsening').slice(0, 4);

  const [reportPatients, setReportPatients] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage || {}).filter((key) => key.startsWith('report-'));
    const mapped = keys
      .map((key) => key.replace('report-', ''))
      .map((id) => {
        const patient = patients.find((p) => String(p.id) === id);
        return patient
          ? { id: patient.id, name: patient.name, updated: patient.updated_at }
          : { id, name: `Patient ${id}`, updated: null };
      })
      .sort((a, b) => new Date(b.updated || 0) - new Date(a.updated || 0));
    setReportPatients(mapped);
  }, [patients]);

  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, insulinFilter, genderFilter]);

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const startIndex = (currentPage - 1) * pageSize;
  const visiblePatients = filtered.slice(startIndex, startIndex + pageSize);

  const Metric = ({ label, value, tone }) => {
    const palette = {
      indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
      emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      purple: 'bg-purple-50 text-purple-700 border border-purple-100',
      blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    };
    const classes = palette[tone] || 'bg-slate-50 text-slate-700 border border-slate-100';
    return (
      <div className={`rounded-lg px-3 py-2 text-sm ${classes}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-current">{value}</p>
      </div>
    );
  };

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-10">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
        <Card className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Treatment Intelligence</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Treatment Recommendations Hub</h1>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm text-slate-600 leading-relaxed">
              Surface the right interventions faster by filtering cohorts, tracking therapy response, and exploring regimen-specific insights.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:w-64">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-md px-5 py-4 flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Filters</h3>
            <button
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              onClick={clearFilters}
            >
              <SlidersHorizontal size={14} /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              value={insulinFilter}
              onChange={(e) => setInsulinFilter(e.target.value)}
            >
              <option value="All">All insulin types</option>
              {insulinTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All genders</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {(insulinFilter !== 'All' || genderFilter !== 'All' || search.trim() !== '') && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {insulinFilter !== 'All' && (
                <button onClick={() => setInsulinFilter('All')} className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 px-2.5 py-0.5 text-xs border border-teal-100">
                  Insulin: {insulinFilter} <X size={12} />
                </button>
              )}
              {genderFilter !== 'All' && (
                <button onClick={() => setGenderFilter('All')} className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs border border-amber-100">
                  Gender: {genderFilter} <X size={12} />
                </button>
              )}
              {search.trim() !== '' && (
                <button onClick={() => setSearch('')} className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs border border-slate-200">
                  Query: {search} <X size={12} />
                </button>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Treatment Outcomes */}
        <Card className="rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-green-100 ring-1 ring-emerald-100/60 shadow-md px-5 py-5 space-y-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Treatment outcomes</h3>
            <span className="text-[11px] text-slate-400">Last 90 days</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-white/80 border border-emerald-100 px-3 py-2 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500">Improving</p>
              <p className="text-lg font-semibold text-emerald-700">{responseBuckets.Improving}</p>
            </div>
            <div className="rounded-lg bg-white/80 border border-amber-100 px-3 py-2 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-500">Stable</p>
              <p className="text-lg font-semibold text-amber-700">{responseBuckets.Stable}</p>
            </div>
            <div className="rounded-lg bg-white/80 border border-rose-100 px-3 py-2 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-rose-500">Worsening</p>
              <p className="text-lg font-semibold text-rose-700">{responseBuckets.Worsening}</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Top performers</p>
            {filtered.filter((p) => bucketOf(p) === 'Improving').length > 0 ? (
              <ul className="space-y-2">
                {filtered.filter((p) => bucketOf(p) === 'Improving').slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-lg bg-white border border-emerald-200 px-3 py-2 shadow-sm">
                    <span className="text-sm text-slate-700">{p.name}</span>
                    <span className="text-[11px] rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100">HbA1c ↓{(p.reduction_a ?? 0).toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-slate-400">No improving patients yet.</span>
            )}
          </div>
        </Card>

        {/* Clinical Targets */}
        <Card className="rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-green-100 ring-1 ring-emerald-100/60 shadow-md px-5 py-5 space-y-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Clinical targets</h3>
            <span className="text-[11px] text-slate-400">{filteredCount} patients</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-white/80 border border-emerald-100 px-3 py-2 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500">HbA1c &lt;7%</p>
              <p className="text-lg font-semibold text-emerald-700">{atTarget.length}</p>
              <p className="text-[10px] text-emerald-500 mt-1">{atTargetPct}% at goal</p>
            </div>
            <div className="rounded-lg bg-white/80 border border-blue-100 px-3 py-2 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-blue-500">Weight mgmt</p>
              <p className="text-lg font-semibold text-blue-700">{filtered.filter(p => (Number(p.bmi1) || 0) < 25).length}</p>
              <p className="text-[10px] text-blue-500 mt-1">{filteredCount > 0 ? Math.round((filtered.filter(p => (Number(p.bmi1) || 0) < 25).length / filteredCount) * 100) : 0}% healthy BMI</p>
            </div>
            <div className="rounded-lg bg-white/80 border border-indigo-100 px-3 py-2 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-500">Kidney health</p>
              <p className="text-lg font-semibold text-indigo-700">{filtered.filter(p => (Number(p.egfr) || 0) >= 60).length}</p>
              <p className="text-[10px] text-indigo-500 mt-1">{filteredCount > 0 ? Math.round((filtered.filter(p => (Number(p.egfr) || 0) >= 60).length / filteredCount) * 100) : 0}% eGFR ≥60</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Best controlled patients</p>
            {filtered.filter(p => latestHba1c(p) > 0).length > 0 ? (
              <ul className="space-y-2">
                {filtered
                  .filter(p => latestHba1c(p) > 0)
                  .sort((a, b) => (latestHba1c(a) || Infinity) - (latestHba1c(b) || Infinity))
                  .slice(0, 6)
                  .map((p) => {
                    const hba1c = latestHba1c(p);
                    const isAtGoal = hba1c <= 7.0;
                    return (
                      <li key={p.id} className={`flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm border ${isAtGoal ? 'border-emerald-200' : 'border-blue-200'}`}>
                        <span className="text-sm text-slate-700">{p.name}</span>
                        <span className={`text-[11px] rounded-full px-2 py-0.5 border ${isAtGoal ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                          {hba1c?.toFixed(1)}%{isAtGoal ? ' ✓' : ''}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <span className="text-xs text-slate-400">No patient data available.</span>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-green-100 ring-1 ring-emerald-100/60 shadow-md px-5 py-5 space-y-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Pending actions</h3>
            <span className="text-[11px] text-slate-400">{reportPatients.length + pendingFollowupCount} items</span>
          </div>
          <div className="grid gap-4 text-xs">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 mb-3">Recommendations awaiting review</p>
              {reportPatients.length === 0 ? (
                <span className="text-xs text-slate-400">No pending recommendations.</span>
              ) : (
                <ul className="space-y-2.5">
                  {reportPatients.slice(0, 3).map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg bg-white border-2 border-purple-200 px-3.5 py-2.5 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-purple-700">{p.name}</p>
                        <p className="text-xs text-purple-400 mt-0.5">AI recommendation generated</p>
                      </div>
                      <Link to={`/treatment-recommendation/${p.id}`} className="text-xs font-semibold text-purple-500 hover:text-purple-600">
                        Review
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {reportPatients.length > 3 && (
                <p className="text-xs text-slate-400 mt-2">+{reportPatients.length - 3} more pending</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 mb-3">Follow-ups needed</p>
              {pendingFollowupTop.length === 0 ? (
                <span className="text-xs text-slate-400">All patients have upcoming appointments.</span>
              ) : (
                <ul className="space-y-2.5">
                  {pendingFollowupTop.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg bg-white border-2 border-amber-200 px-3.5 py-2.5 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-amber-700">{p.name}</p>
                        <p className="text-xs text-amber-400 mt-0.5">No appointment in next 14 days</p>
                      </div>
                      <Link to={`/appointments`} className="text-xs font-semibold text-amber-500 hover:text-amber-600">
                        Schedule
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visiblePatients.map((p) => (
          <Link key={p.id} to={`/treatment-recommendation/${p.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2">
            <Card
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-300 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{p.age} y/o · {p.gender}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <Metric label="HbA1c Δ" value={`${(p.reduction_a ?? 0).toFixed(1)}%`} tone="emerald" />
                <Metric label="FVG Δ" value={p.fvg_delta_1_2 ?? '—'} tone="blue" />
                <Metric label="DDS Δ" value={p.dds_trend_1_3 ?? '—'} tone="purple" />
                <Metric label="eGFR" value={`${p.egfr ?? '—'} mL/min`} tone="blue" />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>Updated {new Date(p.updated_at).toLocaleDateString()}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Results per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              {[12, 16, 24].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded-full text-xs disabled:opacity-40"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border border-slate-200 rounded-full text-xs ${pageNum === currentPage ? 'bg-indigo-500 text-white border-indigo-500' : 'hover:bg-slate-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-200 rounded-full text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentRecommendationDashboard;

function AtRiskList({ patients, appts }) {
  const todayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const addDays = (str, n) => {
    const [y,m,d] = str.split('-').map(Number);
    const dt = new Date(y, m-1, d);
    dt.setDate(dt.getDate() + n);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth()+1).padStart(2,'0');
    const dd = String(dt.getDate()).padStart(2,'0');
    return `${yy}-${mm}-${dd}`;
  };

  const today = todayLocal();
  const to14 = addDays(today, 14);
  const hasUpcoming = (pid) => appts.some(a => a.patient_id === pid && a.date > today && a.date <= to14);
  const rising = (p) => (Number(p.dds_trend_1_3) || 0) > 1;

  const candidates = patients.filter(p => rising(p) && !hasUpcoming(p.id)).slice(0, 5);

  if (candidates.length === 0) {
    return <span className="text-[11px] text-rose-400">No at‑risk follow‑ups detected.</span>;
  }

  return (
    <ul className="space-y-2">
      {candidates.map((p) => (
        <li key={p.id} className="flex items-center justify-between rounded-lg bg-white/80 border border-rose-100 px-3 py-2 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-rose-700">{p.name}</p>
            <p className="text-[11px] text-rose-400">DDS Δ {p.dds_trend_1_3 ?? '—'} • no appointment in next 14d</p>
          </div>
          <Link to={`/appointments`} className="text-[11px] font-semibold text-rose-500 hover:text-rose-600">
            Schedule
          </Link>
        </li>
      ))}
    </ul>
  );
}
