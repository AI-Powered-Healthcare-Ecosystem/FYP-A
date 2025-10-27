import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Search, ChevronLeft, ChevronRight, Users as UsersIcon } from 'lucide-react';
import CreateAppointmentModal from './CreateAppointmentModal';
import Card from '@/components/Card.jsx';
import { useUser } from '@/UserContext.jsx';
import { appointmentsApi } from '@/api/appointments';

// Calendar component for the appointments view
const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = [];
  const monthDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const prevMonthDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false
    });
  }

  // Current month days
  const today = new Date();
  for (let i = 1; i <= monthDays; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: date.toDateString() === selectedDate.toDateString()
    });
  }

  // Next month days
  const remainingDays = 42 - days.length; // 6 rows x 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false
    });
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day, isCurrentMonth) => {
    if (isCurrentMonth) {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-sky-50 to-cyan-50 shadow-md ring-1 ring-sky-100/70 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Calendar</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-slate-700">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wide text-slate-400 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayData, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dayData.day, dayData.isCurrentMonth)}
            className={`h-9 w-9 mx-auto rounded-full flex items-center justify-center text-[13px] transition
              ${!dayData.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
              ${dayData.isToday ? 'ring-2 ring-sky-300 bg-sky-50 text-sky-700 font-semibold' : ''}
              ${dayData.isSelected ? 'bg-sky-600 text-white shadow-sm' : 'hover:bg-slate-100'}`}
          >
            {dayData.day}
          </button>
        ))}
      </div>
    </div>
  );
};

// Stats widget component (gradient tones match icon color)
const toneFromColor = (color) => {
  if (!color) return { bg: 'from-white via-slate-50 to-slate-100', ring: 'ring-slate-100/70', icon: '' };
  if (color.includes('blue')) return { bg: 'from-white via-sky-50 to-blue-50', ring: 'ring-sky-100/70', icon: 'text-blue-600' };
  if (color.includes('green') || color.includes('emerald')) return { bg: 'from-white via-emerald-50 to-green-50', ring: 'ring-emerald-100/70', icon: 'text-emerald-600' };
  if (color.includes('purple') || color.includes('violet')) return { bg: 'from-white via-violet-50 to-fuchsia-50', ring: 'ring-violet-100/70', icon: 'text-violet-600' };
  if (color.includes('orange')) return { bg: 'from-white via-orange-50 to-amber-50', ring: 'ring-amber-100/70', icon: 'text-orange-600' };
  return { bg: 'from-white via-slate-50 to-slate-100', ring: 'ring-slate-100/70', icon: '' };
};

const StatsWidget = ({ title, value, icon: Icon, color }) => {
  const tone = toneFromColor(color);
  return (
    <div className={`rounded-2xl shadow-md ring-1 p-4 bg-gradient-to-br ${tone.bg} ${tone.ring}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{title}</p>
          <p className="text-2xl font-semibold mt-1 text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white/80 ring-1 ring-white/60`}> 
          <Icon className={`h-6 w-6 ${tone.icon || color}`} />
        </div>
      </div>
    </div>
  );
};

export default function Appointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]); // derived from patients' visit dates
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();

  const getTodayLocalStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`; // local YYYY-MM-DD
  };

  // Load appointments for this doctor
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        const params = {
          perPage: 100,
          page: 1,
          search: searchQuery || undefined,
          ...(user?.role === 'doctor' ? { doctor_id: user.id } : {}),
        };
        const { data } = await appointmentsApi.list(params);
        if (cancelled) return;

        // normalize fields for UI
        const rows = (data || []).map(a => ({
          ...a,
          patientName: a.patientName ?? a.patient_name ?? 'Patient',
          duration: a.duration ?? (a.duration_minutes ? `${a.duration_minutes} min` : undefined),
        }));

        const today = getTodayLocalStr();
        const upcoming = rows
          .filter(a => a.date && a.date > today)
          .sort((a,b)=> String(a.date).localeCompare(String(b.date)));
        const todayList = rows.filter(a => a.date === today);
        setAppointments(rows);
        setUpcomingAppointments(upcoming);
        setTodayAppointments(todayList);
      } catch (e) {
        if (!cancelled) setError('Unable to load appointments');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, searchQuery]);

  const handleCreateAppointment = (newAppointment) => {
    setAppointments((prev) => {
      const next = [newAppointment, ...prev];
      const today = getTodayLocalStr();
      const todays = next.filter(a => a.date === today);
      const upcoming = next
        .filter(a => a.date && a.date > today)
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
      setTodayAppointments(todays);
      setUpcomingAppointments(upcoming);
      return next;
    });
  };

  if (isLoading) return <div className="p-6">Loading appointments...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-6">
      <div className="space-y-4">
        <Card className="rounded-3xl shadow-xl ring-1 ring-emerald-100/60 p-6 sm:p-8 lg:p-10 space-y-6 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 min-h-[140px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <UsersIcon size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Doctor Workspace</p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Appointments</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search appointments by patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-400"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center h-10 px-3 rounded-md border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Plus size={16} className="mr-2" /> Create Appointment
              </button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatsWidget title="Total Appointments" value={appointments.length} icon={Calendar} color="text-blue-500" />
          <StatsWidget title="Today" value={todayAppointments.length} icon={Clock} color="text-green-500" />
          <StatsWidget title="Upcoming" value={upcomingAppointments.length} icon={User} color="text-purple-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">

          <div className="rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-emerald-100 shadow-md ring-1 ring-emerald-100/70 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">Today's Appointments</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center ring-1 ring-emerald-200/60">
                        <User className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-900">{appointment.patientName || appointment.patient_name || 'Patient'}</h4>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60">
                            {appointment.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{appointment.type}</p>
                        <p className="text-sm text-slate-500">{appointment.notes}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CalendarWidget />
          
          <div className="rounded-2xl bg-gradient-to-br from-white via-sky-50 to-sky-100 shadow-md ring-1 ring-sky-100/70 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">Upcoming Appointments</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 4).map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-slate-50">
                    <div className="flex">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center ring-1 ring-sky-200/60">
                        <Calendar className="h-5 w-5 text-sky-600" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-semibold text-slate-900">{appointment.patientName || appointment.patient_name || 'Patient'}</h4>
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800 ring-1 ring-sky-200/60">
                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{appointment.time} • {appointment.duration || (appointment.duration_minutes ? `${appointment.duration_minutes} min` : '')}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500">
                  No upcoming appointments
                </div>
              )}
              {upcomingAppointments.length > 4 && (
                <div className="px-6 py-4 text-center border-t border-gray-200">
                  <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-500">
                    View all ({upcomingAppointments.length - 4} more)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateAppointment}
      />
    </div>
  );
}
