import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { patientsApi } from '@/api/patients';

const TherapyEffectivenessForm = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const pathlineChartRef = useRef(null);
  const pathlineChartInstanceRef = useRef(null);
  const [effectiveness, setEffectiveness] = useState(null);
  const [modelProbability, setModelProbability] = useState(null);
  const [forecastHba1c, setForecastHba1c] = useState([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    patientsApi.getById(id).then(setPatient).catch(err => console.error('Error:', err));
  }, [id]);

  useEffect(() => {
    if (patient) {
      const fastApiUrl = import.meta.env.VITE_FASTAPI_URL || 'http://127.0.0.1:5000';
      const toNumber = (val) => {
        const num = Number(val);
        return isNaN(num) || val === null || val === undefined ? null : num;
      };

      // Validate minimum required fields for meaningful prediction
      const requiredFields = [
        // Core visit metrics (for model + effectiveness)
        { name: 'HbA1c (Visit 1)', value: patient.hba1c_1st_visit },
        { name: 'HbA1c (Visit 2)', value: patient.hba1c_2nd_visit },
        { name: 'HbA1c (Visit 3)', value: patient.hba1c_3rd_visit },
        { name: 'FVG (Visit 1)', value: patient.fvg_1 },
        { name: 'FVG (Visit 2)', value: patient.fvg_2 },
        { name: 'FVG (Visit 3)', value: patient.fvg_3 },
        { name: 'DDS (Visit 1)', value: patient.dds_1 },
        { name: 'DDS (Visit 3)', value: patient.dds_3 },
        // Demographics
        { name: 'Age', value: patient.age },
        { name: 'Gender', value: patient.gender },
        { name: 'Insulin Regimen', value: patient.insulin_regimen_type },
        // Effectiveness calculation components (weighted)
        { name: 'BMI (Visit 1)', value: patient.bmi1 },
        { name: 'BMI (Visit 3)', value: patient.bmi3 },
        { name: 'Systolic BP', value: patient.sbp },
        { name: 'Diastolic BP', value: patient.dbp },
        { name: 'eGFR (Visit 1)', value: patient.egfr1 || patient.egfr },
        { name: 'eGFR (Visit 3)', value: patient.egfr3 || patient.egfr },
        { name: 'UACR (Visit 1)', value: patient.uacr1 },
        { name: 'UACR (Visit 3)', value: patient.uacr3 },
      ];

      const missingFields = requiredFields.filter(f => 
        f.value === null || f.value === undefined || f.value === ''
      );

      if (missingFields.length > 0) {
        setSummary(`⚠️ Cannot generate therapy analysis. Missing required fields: ${missingFields.map(f => f.name).join(', ')}. Please complete patient data first.`);
        return;
      }

      const payload = {
        insulin_regimen: String(patient.insulin_regimen_type || 'Unknown'),
        hba1c1: toNumber(patient.hba1c_1st_visit),
        hba1c2: toNumber(patient.hba1c_2nd_visit),
        hba1c3: toNumber(patient.hba1c_3rd_visit),
        hba1c_delta_1_2: toNumber(patient.reduction_a),
        gap_initial_visit: toNumber(patient.gap_from_initial_visit),
        gap_first_clinical: toNumber(patient.gap_from_first_clinical_visit),
        egfr: toNumber(patient.egfr),
        reduction_percent: toNumber(patient.reduction_a),
        fvg1: toNumber(patient.fvg_1),
        fvg2: toNumber(patient.fvg_2),
        fvg3: toNumber(patient.fvg_3),
        fvg_delta_1_2: toNumber(patient.fvg_delta_1_2),
        dds1: toNumber(patient.dds_1),
        dds3: toNumber(patient.dds_3),
        dds_trend_1_3: toNumber(patient.dds_trend_1_3),
        // Required therapy model fields
        age: toNumber(patient.age),
        sex: String(patient.gender || 'Unknown'),
        ethnicity: String(patient.ethnicity || 'Unknown'),
        height_cm: toNumber(patient.height_cm),
        weight1: toNumber(patient.weight1 || patient.weight_kg),
        weight2: toNumber(patient.weight2 || patient.weight_kg),
        weight3: toNumber(patient.weight3 || patient.weight_kg),
        bmi1: toNumber(patient.bmi1),
        bmi3: toNumber(patient.bmi3),
        sbp: toNumber(patient.sbp),
        dbp: toNumber(patient.dbp),
        egfr1: toNumber(patient.egfr1 || patient.egfr),
        egfr3: toNumber(patient.egfr3 || patient.egfr),
        uacr1: toNumber(patient.uacr1),
        uacr3: toNumber(patient.uacr3),
        gap_1_2_days: toNumber(patient.gap_1_2_days),
        gap_2_3_days: toNumber(patient.gap_2_3_days),
      };

      fetch(`${fastApiUrl}/predict-therapy-pathline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          setEffectiveness(data.effectiveness);
          setModelProbability(data.model_probability);
          setForecastHba1c(data.forecast_hba1c || []);
          setSummary(data.summary);
        })
        .catch((err) => console.error('Prediction error:', err));
    }
  }, [patient]);

  useEffect(() => {
    if (patient && chartRef.current) {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();

      const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: [
            formatDate(patient.first_visit_date),
            formatDate(patient.second_visit_date),
            formatDate(patient.third_visit_date)
          ],
          datasets: [
            {
              label: 'HbA1c (%)',
              data: [patient.hba1c_1st_visit, patient.hba1c_2nd_visit, patient.hba1c_3rd_visit],
              borderColor: '#6366f1',
              backgroundColor: (ctx) => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(99,102,241,0.3)');
                gradient.addColorStop(1, 'rgba(99,102,241,0)');
                return gradient;
              },
              tension: 0.4,
              fill: true,
            },
            {
              label: 'FVG',
              data: [patient.fvg_1, patient.fvg_2, patient.fvg_3],
              borderColor: '#10b981',
              backgroundColor: (ctx) => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(16,185,129,0.3)');
                gradient.addColorStop(1, 'rgba(16,185,129,0)');
                return gradient;
              },
              tension: 0.4,
              fill: true,
            },
            {
              label: 'DDS Score',
              data: [patient.dds_1, (patient.dds_1 + patient.dds_3) / 2, patient.dds_3],
              borderColor: '#a855f7',
              backgroundColor: 'rgba(216,180,254,0.2)',
              tension: 0.4,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: {
            y: { beginAtZero: false, title: { display: true, text: 'HbA1c & FVG' }, position: 'left' },
            y1: { beginAtZero: true, title: { display: true, text: 'DDS' }, position: 'right', grid: { drawOnChartArea: false } },
          },
        },
      });
    }
  }, [patient]);

  useEffect(() => {
    if (patient && forecastHba1c.length > 0 && pathlineChartRef.current) {
      if (pathlineChartInstanceRef.current) {
        pathlineChartInstanceRef.current.destroy();
      }
      
      // Build data matching script's plot: HbA1c, FPG, and HbA1c forecast
      const hba1cActual = [patient.hba1c_1st_visit, patient.hba1c_2nd_visit, patient.hba1c_3rd_visit];
      const fpgActual = [patient.fvg_1, patient.fvg_2, patient.fvg_3]; // FPG mapped to FVG
      const forecastValid = forecastHba1c.filter(v => v !== null);
      
      // Format dates for labels
      const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      };
      
      // Calculate forecast dates (90 days apart from third visit)
      const getForecastDate = (baseDate, monthsAhead) => {
        if (!baseDate) return 'N/A';
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() + monthsAhead);
        return formatDate(date);
      };
      
      const labels = [
        formatDate(patient.first_visit_date),
        formatDate(patient.second_visit_date),
        formatDate(patient.third_visit_date),
        getForecastDate(patient.third_visit_date, 3),
        getForecastDate(patient.third_visit_date, 6)
      ];
      
      pathlineChartInstanceRef.current = new Chart(pathlineChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'HbA1c',
              data: [...hba1cActual, null, null],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.1)',
              fill: false,
              tension: 0.4,
              pointRadius: 6,
              pointBackgroundColor: '#3b82f6',
            },
            {
              label: 'FVG',
              data: [...fpgActual, null, null],
              borderColor: '#f97316',
              backgroundColor: 'rgba(249,115,22,0.1)',
              fill: false,
              tension: 0.4,
              pointRadius: 6,
              pointBackgroundColor: '#f97316',
              borderDash: [5, 5],
            },
            {
              // Confidence band upper bound (draw first for proper layering)
              label: '',
              data: [null, null, null, ...forecastValid.map(v => v + 0.5)],
              borderColor: 'transparent',
              backgroundColor: 'rgba(147,197,253,0.4)',
              fill: '+1', // Fill to next dataset (lower bound)
              pointRadius: 0,
              tension: 0.3,
              order: 2,
            },
            {
              // Confidence band lower bound
              label: '',
              data: [null, null, null, ...forecastValid.map(v => v - 0.5)],
              borderColor: 'transparent',
              backgroundColor: 'transparent',
              fill: false,
              pointRadius: 0,
              tension: 0.3,
              order: 3,
            },
            {
              label: 'HbA1c forecast',
              data: [null, null, null, ...forecastValid], // NOT connected to V3
              borderColor: '#10b981',
              borderDash: [5, 5],
              backgroundColor: 'rgba(16,185,129,0.2)',
              fill: false,
              tension: 0,
              pointRadius: 6,
              pointStyle: 'crossRot',
              pointBackgroundColor: '#10b981',
              borderWidth: 2,
              order: 1, // Draw on top
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                filter: (item) => item.text !== '' && item.text !== undefined, // hide empty legend items
              },
            },
            title: {
              display: true,
              text: `Patient ${patient.name} — Glycemic Trend and Forecast`,
              font: { size: 14, weight: 'bold' },
            },
          },
          scales: {
            y: { 
              title: { display: true, text: 'Value' },
              beginAtZero: false,
            },
            x: {
              title: { display: true, text: 'Visit Date' },
            },
          },
        },
      });
    }
  }, [patient, forecastHba1c]);

  if (!patient) return <div className="p-6 text-center">Loading patient data...</div>;

  const hba1cLevel = patient.hba1c_1st_visit;
  const adherenceGap = patient.gap_from_initial_visit;
  const ddsTrend = patient.dds_trend_1_3;
  const complicationRisk = hba1cLevel > 8 ? 'High' : hba1cLevel > 7 ? 'Moderate' : 'Low';
  const hypoRisk = adherenceGap > 120 ? 'High' : adherenceGap > 60 ? 'Moderate' : 'Low';
  const medAdherenceRisk = ddsTrend > 1.5 ? 'High' : ddsTrend > 0.5 ? 'Moderate' : 'Low';
  const riskValueMap = { Low: 20, Moderate: 50, High: 80 };
  const complicationRiskValue = riskValueMap[complicationRisk];
  const hypoRiskValue = riskValueMap[hypoRisk];
  const adherenceRiskValue = riskValueMap[medAdherenceRisk];

  const parseMarkdown = (text) =>
    text
      .replace(/^### (.*$)/gim, '<h3 class="text-md font-bold mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const fmtDelta = (val, decimals = 1, unit = '') => {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
    const n = Number(val);
    const sign = n >= 0 ? '+' : '';
    return `${sign}${n.toFixed(decimals)}${unit}`;
  };

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-10">
      <div className="grid gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-white via-indigo-50 to-purple-100 ring-1 ring-indigo-100/70 shadow-xl px-6 sm:px-8 py-8 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <span className="text-xl">💊</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-400">Therapy intelligence</p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{patient.name}</h1>
                <p className="text-sm text-slate-600 mt-1">Therapy Effectiveness Review</p>
                <p className="text-xs text-indigo-400 mt-1">{patient.age} y/o · {patient.gender}</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-500">
              <div className="rounded-xl bg-white/80 border border-white/60 px-4 py-3 shadow-sm">
                <p className="uppercase tracking-[0.2em] text-[11px] text-slate-400">Insulin regimen</p>
                <p className="text-sm font-semibold text-slate-800">{patient.insulin_regimen_type || 'Not specified'}</p>
              </div>
              <div className="rounded-xl bg-white/80 border border-white/60 px-4 py-3 shadow-sm">
                <p className="uppercase tracking-[0.2em] text-[11px] text-slate-400">Effectiveness</p>
                <p className="text-sm font-semibold text-slate-800">{effectiveness ? `${effectiveness.label} (${(effectiveness.score * 100).toFixed(0)}%)` : 'Loading…'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ComparisonMetric 
              label="HbA1c" 
              v1={patient.hba1c_1st_visit} 
              v3={patient.hba1c_3rd_visit} 
              unit="%" 
              tone="indigo"
              decimals={2}
              date1={patient.first_visit_date}
              date3={patient.third_visit_date}
            />

            <ComparisonMetric 
              label="FVG" 
              v1={patient.fvg_1} 
              v3={patient.fvg_3} 
              unit="" 
              tone="emerald"
              decimals={1}
              date1={patient.first_visit_date}
              date3={patient.third_visit_date}
            />

            <ComparisonMetric 
              label="DDS" 
              v1={patient.dds_1} 
              v3={patient.dds_3} 
              unit="" 
              tone="purple"
              decimals={2}
              date1={patient.first_visit_date}
              date3={patient.third_visit_date}
            />

            <ComparisonMetric 
              label="BMI" 
              v1={patient.bmi1} 
              v3={patient.bmi3} 
              unit="" 
              tone="blue"
              decimals={1}
              date1={patient.first_visit_date}
              date3={patient.third_visit_date}
            />

            <SummaryMetric label="SBP" value={typeof patient.sbp === 'number' ? `${patient.sbp.toFixed(0)} mmHg` : '—'} tone="indigo" />
            <SummaryMetric label="DBP" value={typeof patient.dbp === 'number' ? `${patient.dbp.toFixed(0)} mmHg` : '—'} tone="indigo" />

            <ComparisonMetric 
              label="eGFR" 
              v1={patient.egfr1 ?? patient.egfr} 
              v3={patient.egfr3 ?? patient.egfr} 
              unit="mL/min" 
              tone="sky"
              decimals={0}
              date1={patient.first_visit_date}
              date3={patient.third_visit_date}
            />

            <ComparisonMetric 
              label="UACR" 
              v1={patient.uacr1} 
              v3={patient.uacr3} 
              unit="mg/g" 
              tone="rose"
              decimals={1}
              date1={patient.first_visit_date}
              date3={patient.third_visit_date}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs text-slate-600">
            <RiskChip label="Complication" value={complicationRisk} />
            <RiskChip label="Hypoglycemia" value={hypoRisk} />
            <RiskChip label="Adherence" value={medAdherenceRisk} />
          </div>

          {forecastHba1c.length > 0 && (
            <div className="rounded-2xl bg-white/80 border border-white/70 px-4 sm:px-6 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">HbA1c Trend & Forecast</h3>
              <div className="flex justify-center">
                <canvas ref={pathlineChartRef} className="max-h-[280px] w-full max-w-[900px]"></canvas>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white shadow-md ring-1 ring-black/5 px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Therapy summary</h3>
            <span className="text-xs text-slate-400">Powered by LLM insights</span>
          </div>

          {summary ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <InsightStat title="Model probability" value={modelProbability ? `${(modelProbability * 100).toFixed(1)}%` : '—'} tone="emerald" />
                <InsightStat title="Effectiveness score" value={effectiveness ? `${(effectiveness.score * 100).toFixed(0)}%` : '—'} tone="indigo" />
                <InsightStat title="Status" value={effectiveness?.label || '—'} tone={effectiveness?.label === 'Effective' ? 'emerald' : 'rose'} />
              </div>

              <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 px-4 py-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-2">Clinical Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <InsightStat title="HbA1c (1→3)" value={`${typeof patient.hba1c_1st_visit === 'number' ? patient.hba1c_1st_visit.toFixed(2) : '—'} → ${typeof patient.hba1c_3rd_visit === 'number' ? patient.hba1c_3rd_visit.toFixed(2) : '—'}`} tone="indigo" />
                <InsightStat title="FVG (1→3)" value={`${patient.fvg_1 ?? '—'} → ${patient.fvg_3 ?? '—'}`} tone="emerald" />
                <InsightStat title="DDS (1→3)" value={`${patient.dds_1 ?? '—'} → ${patient.dds_3 ?? '—'}`} tone="purple" />
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">Recommended actions</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Validate insulin regimen fit versus glycemic response trajectory.',
                    'Increase behavioural support to reduce DDS-related adherence risk.',
                    'Schedule follow-up analytics review in 4 weeks.',
                  ].map((action, idx) => (
                    <ActionChip key={idx} text={action} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-4 text-xs text-slate-500">
              Generating treatment insight…
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl bg-white shadow-md ring-1 ring-black/5 px-6 py-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700">Visit snapshots</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <VisitCard 
              visit="Visit 1" 
              date={patient.first_visit_date} 
              hba1c={patient.hba1c_1st_visit} 
              fvg={patient.fvg_1} 
              dds={patient.dds_1}
              bmi={patient.bmi1}
              egfr={patient.egfr1 ?? patient.egfr}
              uacr={patient.uacr1}
            />
            <VisitCard 
              visit="Visit 2" 
              date={patient.second_visit_date} 
              hba1c={patient.hba1c_2nd_visit} 
              fvg={patient.fvg_2} 
              dds={(patient.dds_1 + patient.dds_3) / 2}
              bmi={(patient.bmi1 + patient.bmi3) / 2}
              egfr={patient.egfr}
              uacr={(patient.uacr1 + patient.uacr3) / 2}
            />
            <VisitCard 
              visit="Visit 3" 
              date={patient.third_visit_date} 
              hba1c={patient.hba1c_3rd_visit} 
              fvg={patient.fvg_3} 
              dds={patient.dds_3}
              bmi={patient.bmi3}
              egfr={patient.egfr3 ?? patient.egfr}
              uacr={patient.uacr3}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-md ring-1 ring-black/5 px-6 py-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Therapy metric trends</h3>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Therapy intelligence is AI-assisted. Apply clinical judgment before adjusting care plans.
      </p>
    </div>
  );
};

const ComparisonMetric = ({ label, v1, v3, unit, tone = 'indigo', decimals = 1, date1, date3 }) => {
  const toneMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  
  const formatValue = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '—';
    return `${val.toFixed(decimals)}${unit}`;
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const calculateDelta = () => {
    if (typeof v1 !== 'number' || typeof v3 !== 'number' || isNaN(v1) || isNaN(v3)) return null;
    const delta = v3 - v1;
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(decimals)}${unit}`;
  };
  
  const delta = calculateDelta();
  const isImprovement = delta && parseFloat(delta) < 0; // For most metrics, decrease is good
  
  return (
    <div className={`rounded-2xl border ${toneMap[tone] || toneMap.indigo} px-4 py-3 shadow-sm`}> 
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-xs text-slate-500">V1: {formatValue(v1)}</p>
            {date1 && <p className="text-[10px] text-slate-400">{formatDate(date1)}</p>}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-lg font-semibold text-inherit">V3: {formatValue(v3)}</p>
            {date3 && <p className="text-[10px] text-slate-400">{formatDate(date3)}</p>}
          </div>
        </div>
        {delta && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isImprovement ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            {delta}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryMetric = ({ label, value, tone = 'indigo', sub }) => {
  const toneMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-2xl border ${toneMap[tone] || toneMap.indigo} px-4 py-3 shadow-sm`}> 
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-inherit">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
};

const RiskChip = ({ label, value }) => {
  const palette = {
    High: 'bg-rose-50 text-rose-600 border border-rose-100',
    Moderate: 'bg-amber-50 text-amber-600 border border-amber-100',
    Low: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  };
  return (
    <div className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center justify-between ${palette[value] || 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
      <span className="uppercase tracking-[0.2em] text-[10px] mr-2 text-slate-400">{label}</span>
      <span>{value}</span>
    </div>
  );
};

const InsightStat = ({ title, value, tone = 'indigo' }) => {
  const toneMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-xl border ${toneMap[tone] || toneMap.indigo} px-4 py-3 text-center shadow-sm`}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm font-semibold text-inherit">{value}</p>
    </div>
  );
};

const ActionChip = ({ text }) => (
  <span className="inline-flex items-start text-left text-xs leading-snug px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm max-w-[260px]">
    {text}
  </span>
);

const VisitCard = ({ visit, date, hba1c, fvg, dds, bmi, egfr, uacr }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-5 flex flex-col space-y-2 text-center hover:shadow-lg transition">
      <div className="mb-2">
        <p className="text-xs uppercase tracking-wider text-slate-400">{visit}</p>
        <h5 className="font-bold text-indigo-600 mt-1">{formatDate(date)}</h5>
      </div>
      <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-md">
        <span className="text-xs font-medium text-gray-600">HbA1c</span>
        <span className="text-indigo-700 font-bold text-sm">{typeof hba1c === 'number' ? hba1c.toFixed(1) + '%' : '—'}</span>
      </div>
      <div className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-md">
        <span className="text-xs font-medium text-gray-600">FVG</span>
        <span className="text-emerald-700 font-bold text-sm">{typeof fvg === 'number' ? fvg.toFixed(1) : '—'}</span>
      </div>
      <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-md">
        <span className="text-xs font-medium text-gray-600">DDS</span>
        <span className="text-purple-700 font-bold text-sm">{typeof dds === 'number' ? dds.toFixed(2) : '—'}</span>
      </div>
      <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
        <span className="text-xs font-medium text-gray-600">BMI</span>
        <span className="text-blue-700 font-bold text-sm">{typeof bmi === 'number' ? bmi.toFixed(1) : '—'}</span>
      </div>
      <div className="flex items-center justify-between bg-sky-50 px-3 py-2 rounded-md">
        <span className="text-xs font-medium text-gray-600">eGFR</span>
        <span className="text-sky-700 font-bold text-sm">{typeof egfr === 'number' ? egfr.toFixed(0) : '—'}</span>
      </div>
      <div className="flex items-center justify-between bg-rose-50 px-3 py-2 rounded-md">
        <span className="text-xs font-medium text-gray-600">UACR</span>
        <span className="text-rose-700 font-bold text-sm">{typeof uacr === 'number' ? uacr.toFixed(1) : '—'}</span>
      </div>
    </div>
  );
};

export default TherapyEffectivenessForm;
