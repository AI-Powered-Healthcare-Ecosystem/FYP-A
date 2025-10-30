import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/Card.jsx';
import { ClipboardPlus } from 'lucide-react';

const UpdatePatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const laravelUrl = import.meta.env.VITE_LARAVEL_URL || 'http://localhost:8000';
    fetch(`${laravelUrl}/api/patients/${id}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data ?? json; // Unwrap Laravel Resource
        setFormData({
          name: data?.name || '',
          age: data?.age || '',
          gender: data?.gender || '',
          ethnicity: data?.ethnicity || '',
          height_cm: data?.height_cm || '',
          weight_kg: data?.weight_kg || '',
          weight1: data?.weight1 || '',
          weight2: data?.weight2 || '',
          weight3: data?.weight3 || '',
          bmi1: data?.bmi1 || '',
          bmi3: data?.bmi3 || '',
          physical_activity: data?.physical_activity || '',
          insulinType: data?.insulin_regimen_type || '',
          medicalHistory: data?.medicalHistory ?? data?.medical_history ?? '',
          medications: data?.medications || '',
          remarks: data?.remarks || '',
          fvg: data?.fvg || '',
          fvg_1: data?.fvg_1 || '',
          fvg_2: data?.fvg_2 || '',
          fvg_3: data?.fvg_3 || '',
          hba1c1: data?.hba1c_1st_visit || '',
          hba1c2: data?.hba1c_2nd_visit || '',
          hba1c3: data?.hba1c_3rd_visit || '',
          sbp: data?.sbp || '',
          dbp: data?.dbp || '',
          egfr: data?.egfr || '',
          egfr1: data?.egfr1 || '',
          egfr3: data?.egfr3 || '',
          uacr1: data?.uacr1 || '',
          uacr3: data?.uacr3 || '',
          dds_1: data?.dds_1 || '',
          dds_3: data?.dds_3 || '',
          first_visit_date: data?.first_visit_date || '',
          second_visit_date: data?.second_visit_date || '',
          third_visit_date: data?.third_visit_date || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching patient:', err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      height_cm: parseFloat(formData.height_cm) || null,
      weight_kg: parseFloat(formData.weight_kg) || null,
      weight1: parseFloat(formData.weight1) || null,
      weight2: parseFloat(formData.weight2) || null,
      weight3: parseFloat(formData.weight3) || null,
      bmi1: parseFloat(formData.bmi1) || null,
      bmi3: parseFloat(formData.bmi3) || null,
    };

    try {
      const laravelUrl = import.meta.env.VITE_LARAVEL_URL || 'http://localhost:8000';
      const res = await fetch(`${laravelUrl}/api/patients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(enrichedData),
      });

      if (!res.ok) {
        let errText = await res.text();
        try { console.error('Update error payload:', JSON.parse(errText)); } catch { console.error('Update error payload (text):', errText); }
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      await res.json();
      alert('Patient updated!');
      navigate(`/patient/${id}`);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update patient.');
    }
  };

  if (loading || !formData) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-10">
      <Card className="border-0 rounded-3xl bg-gradient-to-br from-white via-indigo-50 to-indigo-100 ring-1 ring-indigo-100/70 shadow-xl px-6 sm:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <ClipboardPlus size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400">Patient record</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Update Patient</h1>
            <p className="text-xs text-indigo-400 mt-1">Modify demographics, history, and clinical indicators.</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="rounded-2xl bg-white shadow-md ring-1 ring-indigo-100/70 px-6 py-6 space-y-6">
          <SectionHeader icon="🧍‍♂️" title="Basic information" subtitle="Key lifestyle inputs" />
          <div className="grid md:grid-cols-2 gap-4">
            <Select label="Ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} options={["Asian", "Caucasian", "African", "Hispanic", "Other"]} />
            <Select label="Insulin regimen type" name="insulinType" value={formData.insulinType} onChange={handleChange} options={["BB","PTDS","PBD"]} />
            <Input label="Weight (kg)" name="weight_kg" type="number" step="0.1" value={formData.weight_kg} onChange={handleChange} placeholder="68.5" />
            <Select label="Physical activity" name="physical_activity" value={formData.physical_activity} onChange={handleChange} options={['1–2 times per week','3–4 times per week','5–6 times per week','Daily']} />
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
              <Input name="weight1" label="Weight (Visit 1)" type="number" step="0.1" value={formData.weight1} onChange={handleChange} placeholder="kg" />
              <Input name="weight2" label="Weight (Visit 2)" type="number" step="0.1" value={formData.weight2} onChange={handleChange} placeholder="kg" />
              <Input name="weight3" label="Weight (Visit 3)" type="number" step="0.1" value={formData.weight3} onChange={handleChange} placeholder="kg" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="bmi1" label="BMI (Visit 1)" type="number" step="0.1" value={formData.bmi1} onChange={handleChange} placeholder="kg/m²" />
              <Input name="bmi3" label="BMI (Visit 3)" type="number" step="0.1" value={formData.bmi3} onChange={handleChange} placeholder="kg/m²" />
            </div>
          </Fieldset>

          <Fieldset title="Blood pressure & renal function">
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="sbp" label="Systolic BP" type="number" value={formData.sbp} onChange={handleChange} placeholder="mmHg" />
              <Input name="dbp" label="Diastolic BP" type="number" value={formData.dbp} onChange={handleChange} placeholder="mmHg" />
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
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 bg-white/80 text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-full border border-indigo-200 bg-indigo-600/90 text-white hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

const labelClass = 'text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2 block';
const controlBaseClass = 'w-full rounded-xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white transition';

const Input = ({ label, name, value, onChange, placeholder, type = 'text', className = '', disabled = false }) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${controlBaseClass} ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
    />
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder, className = '' }) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows="3"
      className={`${controlBaseClass} min-h-[120px]`}
    />
  </div>
);

const Select = ({ label, name, value, onChange, options = [], placeholder = '', className = '', disabled = false }) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${controlBaseClass} ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
    >
      <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
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

export default UpdatePatient;
