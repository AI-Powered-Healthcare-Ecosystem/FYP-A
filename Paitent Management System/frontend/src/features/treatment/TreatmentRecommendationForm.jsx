import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '@/components/Card.jsx';
import {
  Activity,
  BarChart3,
  Brain,
  CalendarClock,
  ClipboardPlus,
  Droplet,
  HeartPulse,
  Loader2,
  MessageCircle,
  NotebookPen,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
import { useParams } from 'react-router-dom';
import { patientsApi } from '@/api/patients';

const TreatmentRecommendation = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [ragContext, setRagContext] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    patientsApi.getById(id)
      .then(setPatient)
      .catch(err => console.error('Error fetching patient:', err));
  }, [id]);

  const generateReport = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const fastApiUrl = import.meta.env.VITE_FASTAPI_URL || "http://localhost:5000";
      const response = await fetch(`${fastApiUrl}/treatment-recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient,
          question: `
Please analyze the following diabetic patient's data and return a structured treatment report using markdown headers (##) with the following sections:

## Clinical Trend Analysis  
Explain the patient's recent clinical indicators like HbA1c and FVG trends.

## Risk Interpretation  
Interpret any health risks based on eGFR, DDS, and symptom severity.
After the metrics, provide three bullet points in this EXACT format:
- **Complication:** One sentence explaining the score drivers.
- **Kidney:** One sentence explaining the score drivers.
- **Adherence:** One sentence explaining the score drivers.

Explanation: Short paragraph that ties the three together in plain language.

## Medication Plan  
Suggest potential medication changes, highlighting insulin regimen if applicable. Include received context from the RAG response.

## Lifestyle & Diet Advice  
Provide guidance in this EXACT format with three subsections:

### Overall:  
One short paragraph summarizing the patient's situation and key advice. IMPORTANT: Check the patient's 'remarks' field - if it contains information about their current diet or lifestyle habits, explicitly mention what they are currently doing. For example: "The patient currently [describe their habits from remarks]..." Then provide key advice based on this. 

### Lifestyle:  
- **Activity:** Recommendation for physical activity.
- **Sleep:** Recommendation for sleep.
- **Alcohol/Smoking:** Recommendation for alcohol and smoking.
- **Stress:** Recommendation for stress management.

### Diet:  
- **Carbohydrates:** Recommendation for carbohydrate intake.
- **Fiber:** Recommendation for fiber intake.
- **Sodium:** Recommendation for sodium intake.
- **Protein:** Recommendation for protein intake.
- **Hydration:** Recommendation for hydration.

## Outcome Forecast  
Forecast future clinical outcomes if current trends continue.

Respond concisely and medically sound.

Instructions:
- Answer using the patient context, and with reference to the medical books
- Medication Plan should mention specifics only if mentioned in the context (e.g., insulin type like PBD).
- Do not fabricate or generalize outside of context.
- IMPORTANT: Follow the exact formatting shown above, especially for Risk Interpretation bullets and Lifestyle & Diet subsections.
`
        })
      });
      const data = await response.json();
      setAiResponse(data.response);
      setRagContext(data.context || "");
      localStorage.setItem(`report-${id}`, data.response);
    } catch (err) {
      setAiResponse("⚠️ Failed to retrieve AI-generated recommendation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(`report-${id}`);
    if (cached) {
      setAiResponse(cached);
    }
  }, [id]);

  if (!patient) return <div className="p-6 text-center">Loading patient data...</div>;

  const hba1cDrop = (patient.reduction_a ?? 0).toFixed(1);
  const fvgDrop = patient.fvg_delta_1_2 ?? '-';
  const ddsTrend = patient.dds_trend_1_3 ?? '-';
  const egfr = patient.egfr ?? '-';

  const parseMarkdownBold = (text) => {
    if (!text) return '';
    
    // Convert markdown to HTML
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-slate-800 mt-3 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-slate-900 mt-4 mb-3">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Bullet points
      .replace(/^\s*[-*]\s+(.+)$/gim, '<li class="ml-4">$1</li>')
      // Numbered lists
      .replace(/^\s*\d+\.\s+(.+)$/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    
    // Wrap consecutive <li> tags in <ul>
    html = html.replace(/(<li class="ml-4">.*?<\/li>)(?:\s*<br\/>)*(<li class="ml-4">)/g, '$1$2');
    html = html.replace(/(<li class="ml-4">.*?<\/li>)/g, '<ul class="list-disc space-y-1 my-2">$1</ul>');
    html = html.replace(/<\/ul>\s*<ul class="list-disc space-y-1 my-2">/g, '');
    
    return html;
  };

  const hba1cForecastChart = {
    labels: ['Now', '30d', '60d', '90d'],
    datasets: [{
      label: 'Projected HbA1c (%)',
      data: [patient?.hba1c_1st_visit ?? 9.1, 8.8, 8.5, 8.2],
      fill: true,
      borderColor: '#facc15',
      backgroundColor: 'rgba(250,204,21,0.2)',
      tension: 0.4
    }]
  };

  const timelineEvents = [
    { date: patient?.first_visit_date, title: 'Initial Visit', icon: '🩺' },
    { date: patient?.second_visit_date, title: 'Insulin Regimen Start', icon: '💉' },
    { date: patient?.third_visit_date, title: 'HbA1c Peak Detected', icon: '📊' },
    { date: 'In 90 days', title: 'Expected Follow-Up', icon: '⏳' }
  ];

  const sections = !loading && aiResponse
    ? aiResponse.split(/^##\s+/gm).slice(1).map((section, index) => {
        const [title, ...contentLines] = section.trim().split('\n');
        const content = contentLines.join('\n').trim();
        return renderAiSection({ title, content, index, patient, parseMarkdownBold, hba1cForecastChart });
      }).filter(Boolean)
    : null;

  return (
    <>
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 ring-1 ring-indigo-100/70 shadow-xl px-6 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-500">
              <Brain size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-400">Treatment Recommendation</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{patient.name}</h1>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-500/90 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-60"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Generating...' : aiResponse ? 'Regenerate report' : 'Generate report'}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <InfoTile icon={<Activity size={16} />} label="Gender" value={patient.gender} />
          <InfoTile icon={<CalendarClock size={16} />} label="Age" value={`${patient.age} years`} />
          <InfoTile icon={<Users size={16} />} label="Race" value={patient.ethnicity || 'Not specified'} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryTile tone="emerald" icon={<Droplet size={18} />} label="HbA1c Δ" value={`↓ ${(patient.reduction_a ?? 0).toFixed(1)}%`} />
          <SummaryTile tone="cyan" icon={<Activity size={18} />} label="FVG Δ (1→2)" value={`${Number(fvgDrop ?? 0).toFixed(1)}`} />
          <SummaryTile tone="purple" icon={<HeartPulse size={18} />} label="DDS Δ (1→3)" value={`${Number(ddsTrend ?? 0).toFixed(1)}`} />
          <SummaryTile tone="sky" icon={<ShieldCheck size={18} />} label="eGFR" value={`${egfr} mL/min`} />
        </div>
      </div>

      {loading ? (
        <Card className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 shadow-md ring-1 ring-indigo-100/60 px-6 py-12 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-base font-semibold text-indigo-600">Generating treatment report…</p>
          <p className="text-sm text-indigo-400">Please wait while the AI reviews clinical context and guidelines.</p>
        </Card>
      ) : (
        sections
      )}

      {ragContext && (
        <Card className="rounded-2xl bg-white shadow-md ring-1 ring-indigo-100/70 px-6 py-6 text-sm">
          <details className="space-y-3">
            <summary className="cursor-pointer font-semibold text-indigo-500 flex items-center gap-2">
              <NotebookPen size={16} />
              Show AI context (medical references)
            </summary>
            <pre className="whitespace-pre-wrap text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-4">{ragContext}</pre>
          </details>
        </Card>
      )}
    </div>

      {/* Collapsible Chat Window - Rendered via Portal to document.body */}
      {createPortal(
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen ? (
          /* Expanded Chat Window */
          <div className="w-[480px] h-[700px] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white cursor-pointer" onClick={() => setChatOpen(false)}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Medical Assistant</h3>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setChatOpen(false);
                }}
                className="h-7 w-7 rounded-full hover:bg-white/20 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-slate-50/50 to-white">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-2">
                    <div className="h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <MessageCircle size={24} className="text-indigo-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">How can I help?</p>
                    <p className="text-xs text-slate-500 px-4">Ask about treatment, medications, or lifestyle</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div 
                          className="text-xs prose prose-sm max-w-none prose-headings:text-slate-800 prose-strong:text-slate-800" 
                          dangerouslySetInnerHTML={{ __html: parseMarkdownBold(msg.content) }}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-indigo-500" />
                      <span className="text-xs text-slate-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white">
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!chatInput.trim() || chatLoading) return;
                
                const userMessage = chatInput.trim();
                setChatInput("");
                setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
                setChatLoading(true);
                
                try {
                  const fastApiUrl = import.meta.env.VITE_FASTAPI_URL || "http://localhost:5000";
                  const response = await fetch(`${fastApiUrl}/treatment-chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      patient,
                      question: userMessage
                    })
                  });
                  const data = await response.json();
                  setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                } catch (err) {
                  setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
                } finally {
                  setChatLoading(false);
                  setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-2 text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Collapsed Chat Button */
          <button
            onClick={() => setChatOpen(true)}
            className="group relative h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center ring-4 ring-white"
            title="Open Medical Assistant"
          >
            <MessageCircle size={24} />
            {chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold ring-2 ring-white">
                {chatMessages.filter(m => m.role === 'assistant').length}
              </span>
            )}
          </button>
        )}
      </div>,
      document.body
    )}
    </>
  );
};

const InfoTile = ({ icon, label, value }) => (
  <Card className="rounded-2xl bg-gradient-to-br from-white via-indigo-50/70 to-white border border-indigo-100 px-5 py-4 shadow-sm flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500">
      {icon}
    </span>
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  </Card>
);

const SummaryTile = ({ tone = 'emerald', icon, label, value }) => {
  const palette = {
    emerald: {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-emerald-100 text-emerald-600',
      iconWrap: 'bg-emerald-100 text-emerald-600',
    },
    cyan: {
      card: 'bg-gradient-to-br from-cyan-50 via-white to-cyan-50 border-cyan-100 text-cyan-600',
      iconWrap: 'bg-cyan-100 text-cyan-600',
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-50 via-white to-purple-50 border-purple-100 text-purple-600',
      iconWrap: 'bg-purple-100 text-purple-600',
    },
    sky: {
      card: 'bg-gradient-to-br from-sky-50 via-white to-sky-50 border-sky-100 text-sky-600',
      iconWrap: 'bg-sky-100 text-sky-600',
    },
  }[tone];

  return (
    <Card className={`flex items-center justify-between rounded-2xl border px-4 py-4 shadow-sm ${palette.card}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${palette.iconWrap}`}>{icon}</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold leading-tight text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};

const TrendCard = ({ label, values, unit, warn = false }) => {
  const direction = values.length >= 3 ? Math.sign((values[2] ?? 0) - (values[1] ?? 0)) : 0;
  const icon = direction > 0 ? '📈' : direction < 0 ? '📉' : '➖';
  const text = direction > 0 ? 'Increasing' : direction < 0 ? 'Decreasing' : 'Stable';
  const tone = warn ? 'bg-gradient-to-br from-rose-50 via-white to-rose-50 border-rose-100 text-rose-600' : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-emerald-100 text-emerald-600';

  return (
    <Card className={`rounded-2xl px-4 py-4 shadow-sm border ${tone}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-800 mt-2">{values.filter((v) => v != null).map((v) => Number(v).toFixed(1)).join(' → ')} {unit}</p>
      <p className="text-sm font-semibold mt-1">{icon} {text}</p>
    </Card>
  );
};

const RiskBar = ({ label, value, tone, showHeader = true }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const palette = {
    danger: 'from-rose-500 via-rose-400 to-rose-500',
    warning: 'from-amber-400 via-amber-300 to-amber-400',
    safe: 'from-emerald-500 via-emerald-400 to-emerald-500',
  }[tone];

  // Define tooltip content based on label
  const getTooltipContent = () => {
    const lower = label.toLowerCase();
    if (lower.includes('complication')) {
      return {
        title: 'Complication Risk Criteria',
        items: [
          { level: 'Low (20%)', condition: 'HbA1c ≤ 7%' },
          { level: 'Moderate (50%)', condition: 'HbA1c 7-8%' },
          { level: 'High (80%)', condition: 'HbA1c > 8%' }
        ]
      };
    }
    if (lower.includes('kidney')) {
      return {
        title: 'Kidney Function Criteria',
        items: [
          { level: 'Good (20%)', condition: 'eGFR > 90 mL/min' },
          { level: 'Moderate (50%)', condition: 'eGFR 60-90 mL/min' },
          { level: 'High concern (80%)', condition: 'eGFR < 60 mL/min' }
        ]
      };
    }
    if (lower.includes('adherence')) {
      return {
        title: 'Adherence Risk Criteria',
        items: [
          { level: 'Low (20%)', condition: 'DDS trend ≤ 0.5' },
          { level: 'Moderate (50%)', condition: 'DDS trend 0.5-1.5' },
          { level: 'High (80%)', condition: 'DDS trend > 1.5' }
        ]
      };
    }
    return null;
  };

  const tooltipContent = getTooltipContent();

  return (
    <div className="relative space-y-2">
      {showHeader && (
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
          <span className="text-sm font-semibold text-slate-700">{value}%</span>
        </div>
      )}
      <div 
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100 cursor-help relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`h-full bg-gradient-to-r ${palette} transition-all`} style={{ width: `${value}%` }}></div>
      </div>
      
      {/* Custom Tooltip */}
      {showTooltip && tooltipContent && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 pointer-events-none">
          <div className="bg-slate-800 text-white rounded-lg shadow-xl p-3 text-xs">
            <div className="font-semibold text-sm mb-2 text-slate-100">{tooltipContent.title}</div>
            <div className="space-y-1.5">
              {tooltipContent.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <div>
                    <span className="font-medium text-slate-200">{item.level}:</span>
                    <span className="text-slate-300 ml-1">{item.condition}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeroMetric = ({ icon, label, value }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 text-xs text-slate-500 shadow-sm">
    <span className="text-indigo-400">{icon}</span>
    <span className="font-semibold uppercase tracking-[0.2em] text-indigo-300">{label}</span>
    <span className="text-sm font-semibold text-slate-800">{value}</span>
  </div>
);

// Heuristic splitter to separate Overall vs Lifestyle vs Diet from a free-form block
function splitLifestyleContent(text = '') {
  const t = String(text || '').trim();
  const result = { overall: '', lifestyle: '', diet: '' };
  if (!t) return result;

  // 0) Try markdown headings using a line-based extractor for robustness
  const extractByHeading = (label) => {
    const lines = t.split('\n');
    const isStart = (s) => new RegExp(String.raw`^\s*#{2,3}\s*${label}\b`, 'i').test(s);
    const isStop = (s) => /^(?:\s*#{2,3}\s*(?:Overall|Lifestyle|Diet)\b|\s*##\s+)/i.test(s);
    let start = -1;
    for (let i = 0; i < lines.length; i++) {
      if (isStart(lines[i])) { start = i; break; }
    }
    if (start === -1) return '';
    let end = lines.length;
    for (let j = start + 1; j < lines.length; j++) {
      if (isStop(lines[j])) { end = j; break; }
    }
    return lines.slice(start + 1, end).join('\n').trim();
  };
  const mdOverall = extractByHeading('Overall');
  const mdLifestyle = extractByHeading('Lifestyle');
  const mdDiet = extractByHeading('Diet');
  if (mdOverall || mdLifestyle || mdDiet) {
    result.overall = mdOverall;
    result.lifestyle = mdLifestyle;
    result.diet = mdDiet;
    // continue to allow fallback if any of these are empty
  }

  // 0b) Broad regex that handles headings with or without ### and optional colon, capturing until next subheading or next top-level ##
  const capture = (label, nexts) => {
    const re = new RegExp(String.raw`^\s*#{0,3}\s*${label}\s*:?\s*$[\r\n]+([\s\S]*?)(?=^\s*#{0,3}\s*(?:${nexts})\s*:?\s*$|^##\s|\Z)`, 'gmi');
    const m = re.exec(t);
    return m ? m[1].trim() : '';
  };
  if (!result.overall) result.overall = capture('Overall', 'Lifestyle|Diet');
  if (!result.lifestyle) result.lifestyle = capture('Lifestyle', 'Diet|Overall');
  if (!result.diet) result.diet = capture('Diet', 'Lifestyle|Overall');

  // Prefer explicit headers if present
  const headerRegex = /^(Overall(?: Advice)?|Summary|Overview|Lifestyle(?: Advice)?|Diet(?:ary)?(?: Advice)?)\s*:\s*.*$/gim;
  const hasHeaders = headerRegex.test(t);

  if (hasHeaders) {
    const section = (name, nextNames) => {
      const re = new RegExp(`${name}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${nextNames.join('|')})\\s*:|$)`, 'i');
      const m = t.match(re);
      return m ? m[1].trim() : '';
    };
    result.overall = section('(?:Overall(?: Advice)?|Summary|Overview)', ['Lifestyle(?: Advice)?', 'Diet(?:ary)?(?: Advice)?']);
    result.lifestyle = section('Lifestyle(?: Advice)?', ['Diet(?:ary)?(?: Advice)?', '(?:Overall(?: Advice)?|Summary|Overview)']);
    result.diet = section('Diet(?:ary)?(?: Advice)?', ['Lifestyle(?: Advice)?', '(?:Overall(?: Advice)?|Summary|Overview)']);
  } else {
    // Fallback heuristics by paragraphs and keywords
    const paragraphs = t.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    result.overall = paragraphs[0] || t;
    const rest = paragraphs.slice(1).join('\n');
    const lines = rest.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const lifeLines = lines.filter(l => /lifestyle|exercise|activity|walk|sleep|smok|alcohol|stress|routine/i.test(l));
    const dietLines = lines.filter(l => /diet|carb|sugar|food|meal|eat|fiber|salt|sodium|protein/i.test(l));
    result.lifestyle = lifeLines.join('\n');
    result.diet = dietLines.join('\n');
    // Fallbacks: if no keyword matches, distribute remaining lines
    if (!result.lifestyle && lines.length) {
      result.lifestyle = lines.slice(0, Math.ceil(lines.length/2)).join('\n');
    }
    if (!result.diet && lines.length) {
      result.diet = lines.slice(Math.ceil(lines.length/2)).join('\n');
    }
  }

  // Ensure we don't render empties silently; fall back to overall text where possible
  if (!result.lifestyle && !result.diet && !result.overall) {
    result.overall = t;
  }
  return result;
}

const renderAiSection = ({ title, content, index, patient, parseMarkdownBold, hba1cForecastChart }) => {
  const lower = title.toLowerCase();
  // Skip stray sub-sections that should belong to Lifestyle & Diet Advice (allow optional colon)
  if (/^(overall|lifestyle|diet)\s*:?\s*$/i.test(title.trim())) {
    return null;
  }
  const lines = content.split(/\n(?=\d+\.|\*|\-)/g).filter(Boolean);

  if (lower.includes('trend')) {
    return (
      <Card key={index} className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 shadow-md ring-1 ring-emerald-100/70 px-6 py-6 space-y-5">
        <SectionHeader icon={<HeartPulse size={16} />} title="Clinical trend overview" tone="emerald" />
        <div className="grid gap-4 md:grid-cols-3">
          <TrendCard label="HbA1c trend" values={[patient.hba1c_1st_visit, patient.hba1c_2nd_visit, patient.hba1c_3rd_visit]} unit="%" warn={patient.hba1c_3rd_visit > patient.hba1c_2nd_visit} />
          <TrendCard label="FVG trend" values={[patient.fvg_1, patient.fvg_2, patient.fvg_3]} unit="mmol/L" warn={patient.fvg_3 > patient.fvg_2} />
          <TrendCard label="HbA1c Δ / 91d" values={[patient.reduction_a ?? 0]} unit="%" warn={(patient.reduction_a ?? 0) < 0} />
        </div>
      </Card>
    );
  }

  if (lower.includes('risk')) {
    const riskTiles = [
      {
        label: 'Complication risk',
        value: patient.hba1c_1st_visit > 8 ? 80 : patient.hba1c_1st_visit > 7 ? 50 : 20,
        tone: patient.hba1c_1st_visit > 7 ? 'danger' : 'safe',
      },
      {
        label: 'Kidney function',
        value: patient.egfr > 90 ? 20 : patient.egfr > 60 ? 50 : 80,
        tone: patient.egfr > 60 ? 'warning' : 'danger',
      },
      {
        label: 'Adherence risk',
        value: patient.dds_trend_1_3 > 1.5 ? 80 : patient.dds_trend_1_3 > 0.5 ? 50 : 20,
        tone: patient.dds_trend_1_3 > 0.5 ? 'danger' : 'safe',
      },
    ];

    // Parse per-metric notes from LLM content (handles both "Complication:" and "- **Complication:**" formats)
    const noteFor = (key) => {
      // Try bullet format first: - **Key:** text
      let re = new RegExp(`^\\s*-\\s*\\*\\*${key}\\*\\*\\s*:\\s*(.*)$`, 'gim');
      let m = re.exec(content);
      if (m) return m[1].trim();
      // Fallback to plain format: Key: text
      re = new RegExp(`^${key}\\s*:\\s*(.*)$`, 'gim');
      m = re.exec(content);
      return m ? m[1].trim() : '';
    };
    const notes = {
      complication: noteFor('Complication'),
      kidney: noteFor('Kidney'),
      adherence: noteFor('Adherence'),
    };

    return (
      <Card key={index} className="rounded-3xl bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-md ring-1 ring-rose-100/70 px-6 py-6 space-y-5">
        <SectionHeader icon={<ShieldCheck size={16} />} title={title.trim()} tone="rose" />
        <div className="grid gap-3 md:grid-cols-3">
          {riskTiles.map((risk) => (
            <div key={risk.label} className="rounded-2xl border border-rose-100 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">{risk.label}</p>
              <RiskBar label={risk.label} value={risk.value} tone={risk.tone} showHeader={true} />
            </div>
          ))}
        </div>
        {(() => {
          const match = content.split(/Explanation:\s*/i);
          const explanation = match.length > 1 ? match[1].trim() : content;
          return (
            <div className="text-sm text-slate-600 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: parseMarkdownBold(explanation) }} />
          );
        })()}
      </Card>
    );
  }

  if (lower.includes('medication')) {
    return (
      <Card key={index} className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-md ring-1 ring-blue-100/70 px-6 py-6 space-y-4">
        <SectionHeader icon={<ClipboardPlus size={16} />} title={title.trim()} tone="blue" />
        <div className="space-y-3 text-sm text-slate-700">
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-blue-400">💊</span>
              <span dangerouslySetInnerHTML={{ __html: parseMarkdownBold(line.replace(/^\s*[-*]\s*/, '').trim()) }} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (lower.includes('lifestyle')) {
    // Split content into sections
    const sections = content.split(/^###\s+/gm).filter(Boolean);
    const parsedSections = sections.map(section => {
      const [header, ...lines] = section.split('\n');
      const sectionName = header.replace(/:\s*$/, '').trim();
      const sectionContent = lines.join('\n').trim();
      return { name: sectionName, content: sectionContent };
    });

    return (
      <Card key={index} className="rounded-3xl bg-gradient-to-br from-purple-50 via-white to-purple-50 shadow-md ring-1 ring-purple-100/70 px-6 py-6 space-y-5">
        <SectionHeader icon={<Activity size={16} />} title={title.trim()} tone="purple" />
        
        {parsedSections.map((section, idx) => (
          <div key={idx} className="rounded-xl bg-white/80 border border-purple-100 px-5 py-4 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-purple-600 mb-3">{section.name}</h3>
            <div className="space-y-2">
              {section.content.split('\n').filter(Boolean).map((line, lineIdx) => {
                // Check if it's a bullet point with bold label
                const bulletMatch = line.match(/^\s*-\s+\*\*(.+?)\*\*:\s*(.+)$/);
                if (bulletMatch) {
                  return (
                    <div key={lineIdx} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-800">{bulletMatch[1]}:</span>
                        <span className="text-slate-700 ml-1">{bulletMatch[2]}</span>
                      </div>
                    </div>
                  );
                }
                // Regular text with bold formatting
                const formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                return (
                  <p key={lineIdx} className="text-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                );
              }).filter(Boolean)}
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (lower.includes('forecast')) {
    return (
      <Card key={index} className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-md ring-1 ring-amber-100/70 px-6 py-6 space-y-5">
        <SectionHeader icon={<BarChart3 size={16} />} title={title.trim()} tone="amber" />
        <Line data={hba1cForecastChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        <div className="text-sm text-amber-600 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: parseMarkdownBold(content) }} />
      </Card>
    );
  }

  return (
    <Card key={index} className="rounded-3xl bg-white shadow-md ring-1 ring-slate-100/70 px-6 py-6">
      <SectionHeader icon={<NotebookPen size={16} />} title={title.trim()} tone="slate" />
      <div className="text-sm text-slate-600 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: parseMarkdownBold(content) }} />
    </Card>
  );
};

const SectionHeader = ({ icon, title, tone = 'indigo' }) => {
  const palette = {
    emerald: 'text-emerald-400 bg-emerald-100',
    rose: 'text-rose-400 bg-rose-100',
    blue: 'text-blue-400 bg-blue-100',
    purple: 'text-purple-400 bg-purple-100',
    amber: 'text-amber-400 bg-amber-100',
    slate: 'text-slate-400 bg-slate-100',
  }[tone] || 'text-indigo-400 bg-indigo-100';

  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${palette}`}>{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Guided insight</p>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
    </div>
  );
};

export default TreatmentRecommendation;
