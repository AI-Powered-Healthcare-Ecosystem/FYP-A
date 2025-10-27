import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import CreateAppointmentModal from './CreateAppointmentModal';

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
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Calendar</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayData, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dayData.day, dayData.isCurrentMonth)}
            className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-sm
              ${!dayData.isCurrentMonth ? 'text-gray-300' : ''}
              ${dayData.isToday ? 'bg-blue-100 text-blue-600 font-medium' : ''}
              ${dayData.isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
          >
            {dayData.day}
          </button>
        ))}
      </div>
    </div>
  );
};

// Stats widget component
const StatsWidget = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace('text-', 'text-')}`} />
      </div>
    </div>
  </div>
);

export default function Appointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for appointments
  useEffect(() => {
    const mockAppointments = [
      {
        id: 1,
        patientName: 'John Doe',
        date: '2025-10-28',
        time: '09:30',
        status: 'Scheduled',
        notes: 'Regular checkup',
        type: 'Checkup',
        duration: '30 min'
      },
      {
        id: 2,
        patientName: 'Jane Smith',
        date: '2025-10-29',
        time: '14:15',
        status: 'Scheduled',
        notes: 'Follow-up appointment',
        type: 'Follow-up',
        duration: '45 min'
      },
      {
        id: 3,
        patientName: 'Robert Johnson',
        date: new Date().toISOString().split('T')[0], // Today's date
        time: '11:00',
        status: 'Scheduled',
        notes: 'Annual physical',
        type: 'Physical',
        duration: '60 min'
      },
      {
        id: 4,
        patientName: 'Emily Davis',
        date: '2025-10-30',
        time: '10:00',
        status: 'Scheduled',
        notes: 'Vaccination',
        type: 'Vaccination',
        duration: '20 min'
      },
      {
        id: 5,
        patientName: 'Michael Brown',
        date: '2025-10-31',
        time: '15:45',
        status: 'Scheduled',
        notes: 'Consultation',
        type: 'Consultation',
        duration: '30 min'
      },
      {
        id: 6,
        patientName: 'Sarah Wilson',
        date: new Date().toISOString().split('T')[0], // Today's date
        time: '16:30',
        status: 'Scheduled',
        notes: 'Dental checkup',
        type: 'Dental',
        duration: '45 min'
      }
    ];

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const filteredAppointments = mockAppointments.filter(apt => 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setAppointments(filteredAppointments);
      setTodayAppointments(filteredAppointments.filter(apt => apt.date === today));
      setUpcomingAppointments(
        filteredAppointments
          .filter(apt => apt.date > today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      );
      setIsLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);

  const handleCreateAppointment = (newAppointment) => {
    setAppointments(prev => [newAppointment, ...prev]);
  };

  if (isLoading) return <div className="p-6">Loading appointments...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500">Manage and schedule patient appointments</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search appointments..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsWidget 
              title="Total Appointments" 
              value={appointments.length} 
              icon={Calendar} 
              color="text-blue-500" 
            />
            <StatsWidget 
              title="Today" 
              value={todayAppointments.length} 
              icon={Clock} 
              color="text-green-500" 
            />
            <StatsWidget 
              title="Upcoming" 
              value={upcomingAppointments.length} 
              icon={User} 
              color="text-purple-500" 
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{appointment.patientName}</h4>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {appointment.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                        <p className="text-sm text-gray-500">{appointment.notes}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CalendarWidget />
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 4).map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">{appointment.patientName}</h4>
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{appointment.time} • {appointment.duration}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No upcoming appointments
                </div>
              )}
              {upcomingAppointments.length > 4 && (
                <div className="px-6 py-4 text-center border-t border-gray-200">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
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
