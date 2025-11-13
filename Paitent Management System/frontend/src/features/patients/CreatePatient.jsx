import React, { useEffect, useState } from 'react';
import { ClipboardPlus } from 'lucide-react';
import { useUser } from '@/UserContext.jsx';
import Card from '@/components/Card.jsx';

const CreatePatient = () => {
  const { user } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [assignedDoctorId, setAssignedDoctorId] = useState('');

  const makeInitialFormData = () => ({
    name: '',
    age: '',
    gender: '',
    ethnicity: '',
    height_cm: '',
    weight_kg: '',
    weight1: '',
    weight2: '',
    weight3: '',
    bmi1: '',
    bmi3: '',
    physical_activity: '',
    insulinType: '',
    medicalHistory: '',
    medications: '',
    remarks: '',
    fvg: '',
    fvg_1: '',
    fvg_2: '',
    fvg_3: '',
    hba1c1: '',
    hba1c2: '',
    hba1c3: '',
    sbp: '',
    dbp: '',
    egfr: '',
    egfr1: '',
    egfr3: '',
    uacr1: '',
    uacr3: '',
    dds_1: '',
    dds_3: '',
    freq_smbg: '',
    first_visit_date: '',
    second_visit_date: '',
    third_visit_date: '',
  });

  const [formData, setFormData] = useState(makeInitialFormData);
  const [validationErrors, setValidationErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) errors.name = 'Name is required';
        break;
      case 'gender':
        if (!value) errors.gender = 'Gender is required';
        break;
      case 'age':
        if (value && (isNaN(value) || value < 0 || value > 150)) {
          errors.age = 'Age must be between 0 and 150';
        }
        break;
      case 'height_cm':
        if (value && (isNaN(value) || value < 30 || value > 250)) {
          errors.height_cm = 'Height must be between 30 and 250 cm';
        }
        break;
      case 'weight_kg':
      case 'weight1':
      case 'weight2':
      case 'weight3':
        if (value && (isNaN(value) || value < 10 || value > 400)) {
          errors[name] = 'Weight must be between 10 and 400 kg';
        }
        break;
      case 'bmi1':
      case 'bmi3':
        if (value && (isNaN(value) || value < 10 || value > 100)) {
          errors[name] = 'BMI must be between 10 and 100';
        }
        break;
      case 'sbp':
        if (value && (isNaN(value) || value < 50 || value > 300)) {
          errors.sbp = 'Systolic BP must be between 50 and 300 mmHg';
        }
        break;
      case 'dbp':
        if (value && (isNaN(value) || value < 30 || value > 200)) {
          errors.dbp = 'Diastolic BP must be between 30 and 200 mmHg';
        }
        break;
      case 'freq_smbg':
        if (value && (isNaN(value) || value < 0 || value > 1000)) {
          errors.freq_smbg = 'SMBG frequency must be between 0 and 1000';
        }
        break;
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validation
    const fieldErrors = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      ...fieldErrors,
      // Clear error if field is now valid
      ...(Object.keys(fieldErrors).length === 0 ? { [name]: undefined } : {})
    }));
    
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const errors = {};
    
    // Check required fields
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(errors, fieldErrors);
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMessage('Please fix the validation errors below');
      return;
    }
    
    setIsSubmitting(true);

    const enrichedData = {
      ...formData,
      fvg: parseFloat(formData.fvg) || null,
      fvg_1: parseFloat(formData.fvg_1) || null,
      fvg_2: parseFloat(formData.fvg_2) || null,
      fvg_3: parseFloat(formData.fvg_3) || null,
      hba1c1: parseFloat(formData.hba1c1) || null,
      hba1c2: parseFloat(formData.hba1c2) || null,
      hba1c3: parseFloat(formData.hba1c3) || null,
      sbp: parseFloat(formData.sbp) || null,
      dbp: parseFloat(formData.dbp) || null,
      egfr: parseFloat(formData.egfr) || null,
      egfr1: parseFloat(formData.egfr1) || null,
      egfr3: parseFloat(formData.egfr3) || null,
      uacr1: parseFloat(formData.uacr1) || null,
      uacr3: parseFloat(formData.uacr3) || null,
      dds_1: parseFloat(formData.dds_1) || null,
      dds_3: parseFloat(formData.dds_3) || null,
      freq_smbg: parseInt(formData.freq_smbg) || null,
      height_cm: parseFloat(formData.height_cm) || null,
      weight_kg: parseFloat(formData.weight_kg) || null,
      weight1: parseFloat(formData.weight1) || null,
      weight2: parseFloat(formData.weight2) || null,
      weight3: parseFloat(formData.weight3) || null,
      bmi1: parseFloat(formData.bmi1) || null,
      bmi3: parseFloat(formData.bmi3) || null,
      first_visit_date: formData.first_visit_date,
      second_visit_date: formData.second_visit_date,
      third_visit_date: formData.third_visit_date
    };

    // Assignment logic
    if (user?.role === 'doctor') {
      enrichedData.assigned_doctor_id = user.id;
    } else if (user?.role === 'admin' && assignedDoctorId) {
      enrichedData.assigned_doctor_id = Number(assignedDoctorId);
    }

    try {
      const laravelUrl = import.meta.env.VITE_LARAVEL_URL || "http://localhost:8000";
      const res = await fetch(`${laravelUrl}/api/patients`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(enrichedData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        if (res.status === 422) {
          // Laravel validation errors
          setValidationErrors(errorData.errors || {});
          setErrorMessage('Please fix the validation errors below');
          return;
        }
        
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }
      
      const result = await res.json();
      setSuccessMessage('Patient created successfully!');
      
      // Reset form after successful creation
      setTimeout(() => {
        setFormData(makeInitialFormData());
        setAssignedDoctorId('');
        setSuccessMessage('');
      }, 2000);
      
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Failed to create patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load doctors for admin assignment
  useEffect(() => {
    const loadDoctors = async () => {
      if (user?.role !== 'admin') return;
      try {
        const laravelUrl = import.meta.env.VITE_LARAVEL_URL || 'http://localhost:8000';
        const res = await fetch(`${laravelUrl}/api/admin/users`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        setDoctors((data || []).filter(u => u.role === 'doctor'));
      } catch (e) {
        console.error('Failed to load doctors', e);
      }
    };
    loadDoctors();
  }, [user]);

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-10">
      <Card className="border-0 rounded-3xl bg-gradient-to-br from-white via-rose-50 to-rose-100 ring-1 ring-rose-100/70 shadow-xl px-6 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <ClipboardPlus size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Patient onboarding</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create Patient Record</h1>
              <p className="text-xs text-rose-400 mt-1">Capture baseline data to unlock tailored risk and therapy analytics.</p>
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'admin' && (
          <Card className="rounded-2xl bg-white shadow-md ring-1 ring-amber-100/70 px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-400">Assignment</p>
                <h2 className="text-xl font-semibold text-amber-700">Assign to Doctor (optional)</h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Doctor"
                name="assigned_doctor"
                value={assignedDoctorId}
                onChange={(e) => setAssignedDoctorId(e.target.value)}
                options={doctors.map((d) => ({ label: d.name, value: d.id }))}
                placeholder="Unassigned"
              />
            </div>
          </Card>
        )}

        <Card className="rounded-2xl bg-white shadow-md ring-1 ring-indigo-100/70 px-6 py-6 space-y-6">
          <SectionHeader icon="🧍‍♂️" title="Basic information" subtitle="Demographics and lifestyle" />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter patient's full name" error={validationErrors.name} />
            <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Enter age" error={validationErrors.age} />
            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} error={validationErrors.gender} />
            <Select label="Ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} options={["Asian", "Caucasian", "African", "Hispanic", "Other"]} error={validationErrors.ethnicity} />
            <Select label="Insulin regimen type" name="insulinType" value={formData.insulinType} onChange={handleChange} options={["BB", "PTDS", "PBD"]} error={validationErrors.insulinType} />
            <Input label="Height (cm)" name="height_cm" type="number" step="0.1" value={formData.height_cm} onChange={handleChange} placeholder="170.0" error={validationErrors.height_cm} />
            <Input label="Weight (kg)" name="weight_kg" type="number" step="0.1" value={formData.weight_kg} onChange={handleChange} placeholder="68.5" error={validationErrors.weight_kg} />
            <Select label="Physical activity" name="physical_activity" value={formData.physical_activity} onChange={handleChange} options={['1–2 times per week','3–4 times per week','5–6 times per week','Daily']} error={validationErrors.physical_activity} />
          </div>
        </Card>

        <Card className="rounded-2xl bg-white shadow-md ring-1 ring-emerald-100/70 px-6 py-6 space-y-6">
          <SectionHeader icon="📝" title="Medical background" subtitle="Narrative history for context" />
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea label="Medical history" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} placeholder="Enter relevant medical history" />
            <Textarea label="Current medications" name="medications" value={formData.medications} onChange={handleChange} placeholder="List current medications" />
            <Textarea label="Additional remarks" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any additional notes or observations" className="md:col-span-2" />
          </div>
        </Card>

        <Card className="rounded-2xl bg-white shadow-md ring-1 ring-purple-100/70 px-6 py-6 space-y-8">
          <SectionHeader icon="📊" title="Clinical indicators" subtitle="Structured biomarker capture" />

          <Fieldset title="Fasting venous glucose (FVG)">
            <div className="grid md:grid-cols-4 gap-4">
              <Input name="fvg" label="Initial FVG" value={formData.fvg} onChange={handleChange} placeholder="mmol/L" />
              <Input name="fvg_1" label="FVG (1st visit)" value={formData.fvg_1} onChange={handleChange} placeholder="mmol/L" />
              <Input name="fvg_2" label="FVG (2nd visit)" value={formData.fvg_2} onChange={handleChange} placeholder="mmol/L" />
              <Input name="fvg_3" label="FVG (3rd visit)" value={formData.fvg_3} onChange={handleChange} placeholder="mmol/L" />
            </div>
          </Fieldset>

          <Fieldset title="HbA1c measurements">
            <div className="grid md:grid-cols-3 gap-4">
              <Input name="hba1c1" label="HbA1c (1st reading)" value={formData.hba1c1} onChange={handleChange} placeholder="%" />
              <Input name="hba1c2" label="HbA1c (2nd reading)" value={formData.hba1c2} onChange={handleChange} placeholder="%" />
              <Input name="hba1c3" label="HbA1c (3rd reading)" value={formData.hba1c3} onChange={handleChange} placeholder="%" />
            </div>
          </Fieldset>

          <Fieldset title="Body composition per visit">
            <div className="grid md:grid-cols-3 gap-4">
              <Input name="weight1" label="Weight (Visit 1)" type="number" step="0.1" value={formData.weight1} onChange={handleChange} placeholder="kg" error={validationErrors.weight1} />
              <Input name="weight2" label="Weight (Visit 2)" type="number" step="0.1" value={formData.weight2} onChange={handleChange} placeholder="kg" error={validationErrors.weight2} />
              <Input name="weight3" label="Weight (Visit 3)" type="number" step="0.1" value={formData.weight3} onChange={handleChange} placeholder="kg" error={validationErrors.weight3} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="bmi1" label="BMI (Visit 1)" type="number" step="0.1" value={formData.bmi1} onChange={handleChange} placeholder="kg/m²" error={validationErrors.bmi1} />
              <Input name="bmi3" label="BMI (Visit 3)" type="number" step="0.1" value={formData.bmi3} onChange={handleChange} placeholder="kg/m²" error={validationErrors.bmi3} />
            </div>
          </Fieldset>

          <Fieldset title="Blood pressure & renal function">
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="sbp" label="Systolic BP" type="number" value={formData.sbp} onChange={handleChange} placeholder="mmHg" error={validationErrors.sbp} />
              <Input name="dbp" label="Diastolic BP" type="number" value={formData.dbp} onChange={handleChange} placeholder="mmHg" error={validationErrors.dbp} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Input name="egfr" label="eGFR (baseline)" type="number" step="0.1" value={formData.egfr} onChange={handleChange} placeholder="mL/min/1.73m²" />
              <Input name="egfr1" label="eGFR (Visit 1)" type="number" step="0.1" value={formData.egfr1} onChange={handleChange} placeholder="mL/min/1.73m²" />
              <Input name="egfr3" label="eGFR (Visit 3)" type="number" step="0.1" value={formData.egfr3} onChange={handleChange} placeholder="mL/min/1.73m²" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="uacr1" label="UACR (Visit 1)" type="number" step="0.1" value={formData.uacr1} onChange={handleChange} placeholder="mg/g" />
              <Input name="uacr3" label="UACR (Visit 3)" type="number" step="0.1" value={formData.uacr3} onChange={handleChange} placeholder="mg/g" />
            </div>
          </Fieldset>

          <Fieldset title="Diabetes distress scale">
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="dds_1" label="DDS (1st reading)" type="number" step="0.01" value={formData.dds_1} onChange={handleChange} placeholder="Score" />
              <Input name="dds_3" label="DDS (3rd reading)" type="number" step="0.01" value={formData.dds_3} onChange={handleChange} placeholder="Score" />
            </div>
          </Fieldset>

          <Fieldset title="Self-monitoring">
            <div className="grid md:grid-cols-1 gap-4">
              <Input 
                name="freq_smbg" 
                label="Frequency of Blood Glucose Monitoring" 
                type="number" 
                value={formData.freq_smbg} 
                onChange={handleChange} 
                placeholder="checks per month (e.g., 228)" 
                helperText="How many times per month does the patient check their blood sugar? Typical range: 38-749"
                error={validationErrors.freq_smbg}
              />
            </div>
          </Fieldset>

          <Fieldset title="Visit timeline">
            <div className="grid md:grid-cols-3 gap-4">
              <Input name="first_visit_date" label="First visit date" type="date" value={formData.first_visit_date} onChange={handleChange} />
              <Input name="second_visit_date" label="Second visit date" type="date" value={formData.second_visit_date} onChange={handleChange} />
              <Input name="third_visit_date" label="Third visit date" type="date" value={formData.third_visit_date} onChange={handleChange} />
            </div>
          </Fieldset>
        </Card>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setFormData(makeInitialFormData())}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 bg-white/80 text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            Reset form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-full border border-rose-200 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
              isSubmitting 
                ? 'bg-rose-300 cursor-not-allowed' 
                : 'bg-rose-500/90 hover:bg-rose-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create patient record'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const labelClass = 'text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2 block';
const controlBaseClass = 'w-full rounded-xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white transition';

const Input = ({ label, name, value, onChange, placeholder, type = 'text', className = '', error }) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${controlBaseClass} ${error ? 'border-red-300 ring-red-300' : ''}`}
    />
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder, className = '', error }) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows="3"
      className={`${controlBaseClass} min-h-[120px] ${error ? 'border-red-300 ring-red-300' : ''}`}
    />
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, name, value, onChange, options = [], placeholder = '', className = '', error }) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`${controlBaseClass} ${error ? 'border-red-300 ring-red-300' : ''}`}
    >
      <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
      {options.map((opt) => {
        if (typeof opt === 'string') {
          return <option key={opt} value={opt}>{opt}</option>;
        }
        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </select>
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-slate-700">
      <span className="text-lg">{icon}</span>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
    <p className="text-xs text-slate-500">{subtitle}</p>
  </div>
);

const Fieldset = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h3>
    {children}
  </div>
);

const HeroMetric = ({ icon, label, value }) => (
  <div className="rounded-xl bg-white/70 border border-white/60 px-4 py-3 shadow-sm flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
      {icon}
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-rose-300">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  </div>
);

export default CreatePatient;
