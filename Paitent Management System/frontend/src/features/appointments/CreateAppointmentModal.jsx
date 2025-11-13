import { useEffect, useState } from 'react';
import { X, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { appointmentsApi } from '@/api/appointments';
import { patientsApi } from '@/api/patients';
import { useUser } from '@/UserContext.jsx';

export default function CreateAppointmentModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    notes: ''
  });
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useUser();

  // Fetch doctor's patients for dropdown when opened
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        setError('');
        const { data } = await patientsApi.list({ perPage: 100, page: 1, ...(user?.role === 'doctor' ? { doctor_id: user.id } : {}) });
        if (!cancelled) setPatients(data || []);
      } catch (e) {
        if (!cancelled) setError('Failed to load patients');
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, user]);

  // Get current date and time for validation
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  };

  const isToday = (date) => {
    return date === getCurrentDate();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate date selection
    if (name === 'date') {
      const selectedDate = value;
      const currentDate = getCurrentDate();
      
      if (selectedDate < currentDate) {
        setError('Cannot select a date in the past');
        return;
      }
      
      // If selecting today and there's already a time selected, validate it
      if (isToday(selectedDate) && formData.time) {
        const currentTime = getCurrentTime();
        if (formData.time <= currentTime) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            time: '' // Clear time if it's in the past
          }));
          setError('Selected time has passed. Please choose a future time.');
          return;
        }
      }
    }
    
    // Validate time selection
    if (name === 'time') {
      const selectedTime = value;
      
      if (isToday(formData.date)) {
        const currentTime = getCurrentTime();
        if (selectedTime <= currentTime) {
          setError('Cannot select a time in the past');
          return;
        }
      }
    }
    
    setError(''); // Clear any previous errors
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        patient_id: Number(formData.patientId),
        doctor_id: Number(user?.id),
        date: formData.date,
        time: formData.time,
        notes: formData.notes || null,
        type: 'Consultation',
        duration_minutes: 30,
        status: 'Scheduled',
      };
      const created = await appointmentsApi.create(payload);
      const patientName = patients.find(p => p.id === Number(formData.patientId))?.name || 'Patient';
      onCreate({
        id: created?.id,
        patientId: payload.patient_id,
        patientName,
        date: payload.date,
        time: payload.time,
        status: payload.status,
        notes: payload.notes || '',
        type: payload.type,
        duration: `${payload.duration_minutes} min`,
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create appointment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
              Patient
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="mt-1 block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={getCurrentDate()}
                  className="mt-1 block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  min={isToday(formData.date) ? getCurrentTime() : undefined}
                  className="mt-1 block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Any additional notes about the appointment"
            />
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Appointment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
