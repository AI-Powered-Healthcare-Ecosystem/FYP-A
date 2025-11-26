import React, { useState } from "react";
import Card from '../../components/Card.jsx';
import { Activity, Heart, Zap, TrendingUp, Info, BookOpen, Target } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("diabetes");
  const [selectedMetric, setSelectedMetric] = useState(null);

  const getMetricDetails = (metric) => {
    switch (metric) {
      case 'hba1c':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-3">HbA1c (Hemoglobin A1c) - Glycemic Control Indicator</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Clinical Relevance</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Reflects average blood glucose over 2-3 months</li>
                    <li>• Gold standard for diabetes diagnosis and monitoring</li>
                    <li>• Strong predictor of diabetic complications</li>
                    <li>• Each 1% reduction decreases microvascular risk by 37%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">AI Model Integration</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Risk Prediction:</strong> Calculates 10-year complication probability</li>
                    <li>• <strong>Treatment Response:</strong> Predicts therapy effectiveness</li>
                    <li>• <strong>Forecasting:</strong> Projects future HbA1c trends (3-6 months)</li>
                    <li>• <strong>Personalization:</strong> Adjusts targets based on patient factors</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">Model Output Interpretation</h4>
              <p className="text-sm text-blue-700">The AI uses HbA1c as the primary feature for diabetes risk stratification, combining it with visit patterns to predict optimal insulin regimens and lifestyle interventions. Higher HbA1c values exponentially increase predicted complication risks in our neural network models.</p>
            </div>
          </div>
        );
      case 'bp':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">Blood Pressure - Cardiovascular Risk Marker</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Clinical Relevance</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Leading modifiable risk factor for heart disease</li>
                    <li>• Systolic BP &gt;140 doubles cardiovascular risk</li>
                    <li>• Critical for diabetic patients (target &lt;130/80)</li>
                    <li>• Affects kidney function and retinopathy progression</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">AI Model Integration</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Cardiovascular Risk:</strong> Framingham equation integration</li>
                    <li>• <strong>Medication Optimization:</strong> Predicts ACE inhibitor response</li>
                    <li>• <strong>Complication Prevention:</strong> Identifies high-risk patients</li>
                    <li>• <strong>Lifestyle Impact:</strong> Models exercise and diet effects</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <h4 className="font-semibold text-purple-800 mb-2">Model Output Interpretation</h4>
              <p className="text-sm text-purple-700">Blood pressure readings feed into our cardiovascular risk assessment algorithms, which combine with diabetes status to provide personalized risk scores. The model weighs systolic BP more heavily in diabetic patients due to increased vulnerability.</p>
            </div>
          </div>
        );
      case 'cholesterol':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-3">LDL Cholesterol - Atherosclerotic Risk Factor</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Clinical Relevance</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Primary driver of atherosclerotic plaque formation</li>
                    <li>• Diabetic patients have 2-4x higher cardiovascular risk</li>
                    <li>• Target &lt;100 mg/dL for diabetes, &lt;70 for high risk</li>
                    <li>• Statins reduce cardiovascular events by 25-35%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">AI Model Integration</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Risk Stratification:</strong> ASCVD risk calculator enhancement</li>
                    <li>• <strong>Statin Response:</strong> Predicts LDL reduction potential</li>
                    <li>• <strong>Event Prediction:</strong> Models heart attack/stroke probability</li>
                    <li>• <strong>Target Optimization:</strong> Personalizes LDL goals</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <h4 className="font-semibold text-red-800 mb-2">Model Output Interpretation</h4>
              <p className="text-sm text-red-700">LDL cholesterol is a key input for our cardiovascular risk prediction models. The AI adjusts risk calculations based on diabetes duration and HbA1c control, as poor glycemic control amplifies the atherogenic effects of elevated LDL.</p>
            </div>
          </div>
        );
      case 'bmi':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-3">BMI (Body Mass Index) - Metabolic Health Indicator</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Clinical Relevance</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Strong predictor of insulin resistance</li>
                    <li>• BMI &gt;30 increases diabetes risk 7-fold</li>
                    <li>• Affects medication dosing and effectiveness</li>
                    <li>• 5-10% weight loss improves glycemic control</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">AI Model Integration</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <strong>Insulin Sensitivity:</strong> Predicts insulin requirements</li>
                    <li>• <strong>Weight Trajectory:</strong> Models weight change patterns</li>
                    <li>• <strong>Intervention Response:</strong> Predicts lifestyle program success</li>
                    <li>• <strong>Complication Risk:</strong> Adjusts risk scores for obesity</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <h4 className="font-semibold text-green-800 mb-2">Model Output Interpretation</h4>
              <p className="text-sm text-green-700">BMI serves as a crucial feature in our insulin dosing algorithms and lifestyle intervention models. The AI uses BMI trends to predict treatment response and adjust recommendations for diet, exercise, and medication intensification.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-6 md:px-10 lg:px-14 py-10 space-y-8 text-slate-900 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <Card className="border-0 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 ring-1 ring-blue-100/70 shadow-xl px-6 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-500 shadow">
              <BookOpen size={28} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Evidence-based insights</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Health Information Hub</h1>
              <p className="text-sm text-blue-500">
                Comprehensive health metrics with AI model insights and clinical relevance explanations.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 text-xs text-slate-500 shadow-sm">
              <span className="text-blue-400"><Target size={16} /></span>
              <span className="font-semibold uppercase tracking-[0.2em] text-blue-300">Clinical targets</span>
              <span className="text-sm font-semibold text-slate-800">Evidence-based</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Metrics Definitions */}
      <Card className="rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-white shadow-xl ring-1 ring-purple-100/60 px-8 py-8 space-y-8">
        {/* Glycemic Control Metrics */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="p-3 bg-blue-100 rounded-2xl shadow-sm">
              <Activity size={28} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-600">Glycemic Control Metrics</h3>
              <p className="text-sm text-blue-500">Blood glucose monitoring and diabetes management parameters</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl bg-blue-50/50 shadow-sm px-6 py-5 border border-blue-100">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">HbA1c (Hemoglobin A1c)</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Average blood glucose over 2-3 months</p>
                <p><strong>Normal Range:</strong> &lt;5.7%</p>
                <p><strong>Diabetes Target:</strong> &lt;7.0% (most adults)</p>
                <p><strong>Model Usage:</strong> Primary predictor for diabetic complications, treatment response, and glycemic control assessment</p>
              </div>
            </Card>

            <Card className="rounded-2xl bg-blue-50/50 shadow-sm px-6 py-5 border border-blue-100">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">FVG (Fasting Venous Glucose)</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Blood glucose after 8+ hours fasting</p>
                <p><strong>Normal Range:</strong> 70-99 mg/dL</p>
                <p><strong>Diabetes Threshold:</strong> ≥126 mg/dL</p>
                <p><strong>Model Usage:</strong> Diabetes diagnosis, insulin sensitivity assessment, and daily glucose pattern analysis</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Cardiovascular Metrics */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
            <div className="p-3 bg-red-100 rounded-2xl shadow-sm">
              <Heart size={28} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-red-600">Cardiovascular Metrics</h3>
              <p className="text-sm text-red-500">Heart health and circulation assessment parameters</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl bg-red-50/50 shadow-sm px-6 py-5 border border-red-100">
              <h4 className="text-lg font-semibold text-red-800 mb-3">Blood Pressure (SBP/DBP)</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Systolic/Diastolic blood pressure</p>
                <p><strong>Normal Range:</strong> &lt;120/80 mmHg</p>
                <p><strong>Diabetes Target:</strong> &lt;130/80 mmHg</p>
                <p><strong>Model Usage:</strong> Cardiovascular risk stratification, medication optimization, and complication prevention</p>
              </div>
            </Card>

            <Card className="rounded-2xl bg-red-50/50 shadow-sm px-6 py-5 border border-red-100">
              <h4 className="text-lg font-semibold text-red-800 mb-3">Physical Activity Level</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Weekly exercise frequency and intensity</p>
                <p><strong>Target:</strong> 150+ minutes moderate activity/week</p>
                <p><strong>Categories:</strong> Sedentary, Light, Moderate, Vigorous</p>
                <p><strong>Model Usage:</strong> Lifestyle intervention planning, insulin sensitivity prediction, and outcome forecasting</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Renal Function Metrics */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
            <div className="p-3 bg-purple-100 rounded-2xl shadow-sm">
              <Zap size={28} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-purple-600">Renal Function Metrics</h3>
              <p className="text-sm text-purple-500">Kidney health and function assessment parameters</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl bg-purple-50/50 shadow-sm px-6 py-5 border border-purple-100">
              <h4 className="text-lg font-semibold text-purple-800 mb-3">eGFR (Estimated Glomerular Filtration Rate)</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Kidney function measurement</p>
                <p><strong>Normal Range:</strong> ≥60 mL/min/1.73m²</p>
                <p><strong>Kidney Disease:</strong> &lt;60 mL/min/1.73m²</p>
                <p><strong>Model Usage:</strong> Diabetic nephropathy detection, medication dosing adjustments, and progression monitoring</p>
              </div>
            </Card>

            <Card className="rounded-2xl bg-purple-50/50 shadow-sm px-6 py-5 border border-purple-100">
              <h4 className="text-lg font-semibold text-purple-800 mb-3">UACR (Urine Albumin-to-Creatinine Ratio)</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Protein leakage in urine</p>
                <p><strong>Normal Range:</strong> &lt;30 mg/g</p>
                <p><strong>Microalbuminuria:</strong> 30-299 mg/g</p>
                <p><strong>Model Usage:</strong> Early kidney damage detection, cardiovascular risk assessment, and treatment intensification</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Anthropometric & Lifestyle Metrics */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <div className="p-3 bg-green-100 rounded-2xl shadow-sm">
              <TrendingUp size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-green-600">Anthropometric & Lifestyle Metrics</h3>
              <p className="text-sm text-green-500">Body measurements and lifestyle behavior parameters</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-2xl bg-green-50/50 shadow-sm px-6 py-5 border border-green-100">
              <h4 className="text-lg font-semibold text-green-800 mb-3">BMI (Body Mass Index)</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Weight(kg)/Height(m)²</p>
                <p><strong>Normal:</strong> 18.5-24.9</p>
                <p><strong>Overweight:</strong> 25.0-29.9</p>
                <p><strong>Model Usage:</strong> Insulin resistance prediction, dosing calculations, and intervention planning</p>
              </div>
            </Card>

            <Card className="rounded-2xl bg-green-50/50 shadow-sm px-6 py-5 border border-green-100">
              <h4 className="text-lg font-semibold text-green-800 mb-3">DDS (Diabetes Distress Scale)</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Psychological burden of diabetes</p>
                <p><strong>Scale:</strong> 1-6 (low to high distress)</p>
                <p><strong>Threshold:</strong> ≥3.0 indicates significant distress</p>
                <p><strong>Model Usage:</strong> Treatment adherence prediction, intervention personalization, and outcome optimization</p>
              </div>
            </Card>

            <Card className="rounded-2xl bg-green-50/50 shadow-sm px-6 py-5 border border-green-100">
              <h4 className="text-lg font-semibold text-green-800 mb-3">SMBG Frequency</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Definition:</strong> Self-monitoring blood glucose frequency</p>
                <p><strong>Range:</strong> 0-10+ times per day</p>
                <p><strong>Recommended:</strong> 4+ times/day for insulin users</p>
                <p><strong>Model Usage:</strong> Engagement assessment, glycemic variability prediction, and education targeting</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Treatment Metrics */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
            <div className="p-3 bg-orange-100 rounded-2xl shadow-sm">
              <Target size={28} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-orange-600">Treatment & Medication Metrics</h3>
              <p className="text-sm text-orange-500">Therapeutic interventions and medication management parameters</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl bg-orange-50/50 shadow-sm px-6 py-5 border border-orange-100">
              <h4 className="text-lg font-semibold text-orange-800 mb-3">Insulin Regimen Type</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>BB (Basal-Bolus):</strong> Long-acting + rapid-acting insulin</p>
                <p><strong>PTDS (Premixed Twice Daily Split):</strong> Mixed insulin twice daily</p>
                <p><strong>PBD (Premixed Before Dinner):</strong> Mixed insulin before evening meal</p>
                <p><strong>Model Usage:</strong> Treatment optimization, hypoglycemia risk assessment, and regimen complexity scoring</p>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex justify-start space-x-3">
        <button
          onClick={() => setActiveTab("diabetes")}
          className={`${
            activeTab === "diabetes" 
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg" 
              : "bg-white text-blue-600 hover:bg-blue-50"
          } px-6 py-3 rounded-2xl border border-blue-200 font-medium transition-all duration-200 hover:shadow-md`}
        >
          Diabetes
        </button>
        <button
          onClick={() => setActiveTab("hypertension")}
          className={`${
            activeTab === "hypertension" 
              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg" 
              : "bg-white text-red-600 hover:bg-red-50"
          } px-6 py-3 rounded-2xl border border-red-200 font-medium transition-all duration-200 hover:shadow-md`}
        >
          Hypertension
        </button>
        <button
          onClick={() => setActiveTab("cardiovascular")}
          className={`${
            activeTab === "cardiovascular" 
              ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg" 
              : "bg-white text-purple-600 hover:bg-purple-50"
          } px-6 py-3 rounded-2xl border border-purple-200 font-medium transition-all duration-200 hover:shadow-md`}
        >
          Cardiovascular
        </button>
        <button
          onClick={() => setActiveTab("healthyLifestyle")}
          className={`${
            activeTab === "healthyLifestyle" 
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg" 
              : "bg-white text-green-600 hover:bg-green-50"
          } px-6 py-3 rounded-2xl border border-green-200 font-medium transition-all duration-200 hover:shadow-md`}
        >
          Healthy Lifestyle
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "diabetes" && (
        <div className="space-y-8">
          {/* Diabetes Overview */}
          <Card className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 ring-1 ring-blue-100/60 shadow-xl px-8 py-8">
            <div className="flex items-center space-x-8">
            {/* Image Section */}
            <div className="flex-shrink-0 w-1/3">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/5935/5935562.png"
                alt="Diabetes Illustration"
                className="rounded-lg"
              />
            </div>

            {/* Diabetes Overview Text */}
            <div className="w-2/3">
              <h2 className="text-2xl font-semibold mb-4 text-blue-500"><b>Diabetes</b></h2>
              <p>
                Diabetes is a chronic condition that affects how your body turns food into energy. It occurs when your body doesn't make enough insulin or can't use it as well as it should, causing too much sugar to remain in your bloodstream.
              </p>

              {/* Diabetes Stages Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-blue-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-500"><b>Type 1 Diabetes</b></h3>
                  <p>An autoimmune reaction that stops your body from making insulin.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-500"><b>Type 2 Diabetes</b></h3>
                  <p>Your body doesn’t use insulin well and can’t keep blood sugar at normal levels.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-500"><b>Gestational Diabetes</b></h3>
                  <p>Develops in pregnant women who have never had diabetes.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-500"><b>Prediabetes</b></h3>
                  <p>Blood sugar levels are higher than normal but not high enough for a type 2 diagnosis.</p>
                </div>
              </div>
            </div>
          </div>
          </Card>

          {/* Key Diabetes Metrics */}
          <Card className="rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 ring-1 ring-blue-100/60 shadow-xl px-8 py-8">
            <h2 className="text-2xl font-semibold mb-6 text-blue-600"><b>Key Diabetes Monitoring Metrics</b></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="rounded-2xl bg-white/80 shadow-sm px-6 py-5 border border-blue-100">
                <h3 className="font-bold text-blue-600 mb-3">HbA1c Levels</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Normal:</span><span className="font-semibold text-green-600">&lt;5.7%</span></div>
                  <div className="flex justify-between"><span>Prediabetes:</span><span className="font-semibold text-yellow-600">5.7-6.4%</span></div>
                  <div className="flex justify-between"><span>Diabetes:</span><span className="font-semibold text-red-600">≥6.5%</span></div>
                  <div className="flex justify-between"><span>Target (most adults):</span><span className="font-semibold text-blue-600">&lt;7.0%</span></div>
                </div>
              </Card>
              
              <Card className="rounded-2xl bg-white/80 shadow-sm px-6 py-5 border border-blue-100">
                <h3 className="font-bold text-blue-600 mb-3">Blood Glucose (mg/dL)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Fasting Normal:</span><span className="font-semibold text-green-600">70-99</span></div>
                  <div className="flex justify-between"><span>Fasting Prediabetes:</span><span className="font-semibold text-yellow-600">100-125</span></div>
                  <div className="flex justify-between"><span>Fasting Diabetes:</span><span className="font-semibold text-red-600">≥126</span></div>
                  <div className="flex justify-between"><span>2hr Post-meal Target:</span><span className="font-semibold text-blue-600">&lt;180</span></div>
                </div>
              </Card>
              
              <Card className="rounded-2xl bg-white/80 shadow-sm px-6 py-5 border border-blue-100">
                <h3 className="font-bold text-blue-600 mb-3">Additional Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>eGFR (kidney):</span><span className="font-semibold text-blue-600">≥60 mL/min</span></div>
                  <div className="flex justify-between"><span>UACR (protein):</span><span className="font-semibold text-blue-600">&lt;30 mg/g</span></div>
                  <div className="flex justify-between"><span>Blood Pressure:</span><span className="font-semibold text-blue-600">&lt;130/80</span></div>
                  <div className="flex justify-between"><span>LDL Cholesterol:</span><span className="font-semibold text-blue-600">&lt;100 mg/dL</span></div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Managing Diabetes */}
          <Card className="rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-white ring-1 ring-blue-100/60 shadow-xl px-8 py-8 space-y-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6"><b>Managing Diabetes</b></h2>
            <div className="space-y-6">

              {/* Monitoring Blood Sugar */}
              <Card className="rounded-2xl bg-white/80 shadow-sm px-6 py-6 border border-blue-100">
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.freepik.com/256/2750/2750349.png?semt=ais_hybrid" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Monitoring Blood Sugar</b></h3>
                    <p>Regular blood sugar monitoring is essential for diabetes management. Your healthcare provider will recommend how often to check your levels.
                      <ul className="list-disc pl-6">
                        <li>Use a blood glucose meter or continuous glucose monitor (CGM)</li>
                        <li>Keep a log of your readings to share with your healthcare team</li>
                        <li>Learn to recognize patterns and how different foods affect your levels</li>
                        <li>Understand your target blood sugar ranges for different times of day</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Medication & Insulin */}
              <Card className="rounded-2xl bg-white/80 shadow-sm px-6 py-6 border border-blue-100">
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/8730/8730553.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Medication & Insulin</b></h3>
                    <p>Depending on your type of diabetes, you may need medication or insulin therapy:
                      <ul className="list-disc pl-6">
                        <li>Type 1 Diabetes: Requires insulin therapy for life, delivered via injections or an insulin pump</li>
                        <li>Type 2 Diabetes: May be managed with oral medications, injectable medications, insulin, or a combination</li>
                        <li>Work closely with your healthcare provider to find the right medication regimen</li>
                        <li>Never adjust your medication without consulting your healthcare team</li>
                      </ul>
                      </p>
                  </div>
                </div>
              </Card>

              {/* Diet & Nutrition */}
              <Card className="rounded-2xl bg-white/80 shadow-sm px-6 py-6 border border-blue-100">
                <div className="flex items-center space-x-4">
                  <img src="https://www.madison-health.com/content/uploads/2023/04/nutrition-support-madison-health-icon.svg" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Diet & Nutrition</b></h3>
                    <p>A healthy diet is crucial for managing diabetes:
                      <ul className="list-disc pl-6">
                        <li>Focus on a consistent carbohydrate intake and portion control</li>
                        <li>Choose complex carbohydrates with high fiber content</li>
                        <li>Include lean proteins and healthy fats in your meals</li>
                        <li>Limit refined sugars, processed foods, and excessive salt</li>
                        <li>Consider working with a registered dietitian to create a personalized meal plan</li>
                        <li>Learn to count carbohydrates to better manage blood sugar levels</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Physical Activity */}
              <Card className="rounded-2xl bg-white/80 shadow-sm px-6 py-6 border border-blue-100">
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/11264/11264367.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Physical Activity</b></h3>
                    <p>Regular physical activity helps improve insulin sensitivity and manage blood sugar:
                      <ul className="list-disc pl-6">
                        <li>Aim for at least 150 minutes of moderate-intensity exercise per week</li>
                        <li>Include both aerobic exercise and strength training</li>
                        <li>Start slowly and gradually increase intensity if you're new to exercise</li>
                        <li>Check your blood sugar before, during, and after exercise</li>
                        <li>Carry a fast-acting carbohydrate source during exercise in case of low blood sugar</li>
                        <li>Stay hydrated during physical activity</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "hypertension" && (
        <div className="space-y-6">
          {/* Hypertension Section */}
          <section className="flex items-center bg-white p-6 rounded-lg shadow-md space-x-6">
            <div className="flex-shrink-0 w-1/3">
              <img
                src="https://static.vecteezy.com/system/resources/previews/038/864/528/non_2x/blood-pressure-icon-vector.jpg"
                alt="Hypertension Illustration"
                className="rounded-lg"
              />
            </div>
            <div className="w-2/3">
              <h2 className="text-2xl font-semibold mb-4 text-purple-500"><b>Hypertension</b></h2>
              <p>
                Hypertension, or high blood pressure, is a common condition where the long-term force of blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-purple-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-purple-500"><b>Primary Hypertension</b></h3>
                  <p>Develops gradually over many years with no identifiable cause.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-purple-500"><b>Secondary Hypertension</b></h3>
                  <p>Caused by an underlying condition and appears suddenly.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-purple-500"><b>Blood Pressure Categories</b></h3>
                  <p>Normal: Less than 120/80 mm Hg, Elevated: 120-129/80 mm Hg, Stage 1: 130-139/80-89 mm Hg, Stage 2: 140+/90+ mm Hg</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-purple-500"><b>Risk Factors</b></h3>
                  <p>Age, family history, obesity, sedentary lifestyle, tobacco use, high sodium diet, excessive alcohol, stress, and chronic conditions.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Managing Hypertension */}
          <section className="space-y-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-purple-500"><b>Managing Hypertension</b></h2>
            <div className="space-y-4">

              {/* Dietery Approached */}   
              <div className="p-6 bg-white-50 rounded-lg shadow-md">          
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/17864/17864601.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Dietery Approached</b></h3>
                    <p>The DASH (Dietary Approaches to Stop Hypertension) diet is specifically designed to help lower blood pressure:
                      <ul className="list-disc pl-6">
                        <li>Reduce sodium intake to less than 2,300mg per day (ideally 1,500mg)</li>
                        <li>Eat plenty of fruits, vegetables, and whole grains</li>
                        <li>Choose low-fat dairy products, lean meats, and plant proteins</li>
                        <li>Limit foods high in saturated fats and cholesterol</li>
                        <li>Incorporate foods rich in potassium, calcium, and magnesium</li>
                        <li>Reduce intake of sweets, added sugars, and sugar-sweetened beverages</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              {/* Medication Management */}
              <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/2947/2947762.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Medication Management</b></h3>
                    <p>Many people with hypertension need medication to control their blood pressure:
                      <ul className="list-disc pl-6">
                        <li>Diuretics: Help your kidneys remove excess sodium and water</li>
                        <li>ACE inhibitors: Relax blood vessels by blocking formation of a natural chemical</li>
                        <li>Angiotensin II receptor blockers (ARBs): Block action of a hormone that narrows blood vessels</li>
                        <li>Calcium channel blockers: Prevent calcium from entering heart and blood vessel cells</li>
                        <li>Beta blockers: Reduce workload on your heart and open blood vessels</li>
                        <li>Take medications exactly as prescribed and don't stop without consulting your doctor</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              {/* Lifestyle Modification */}
              <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/3664/3664392.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Lifestyle Modification</b></h3>
                    <p>Lifestyle changes can significantly impact blood pressure levels:
                      <ul className="list-disc pl-6">
                        <li>Regular exercise: Aim for 150 minutes of moderate activity weekly</li>
                        <li>Weight management: Even small weight loss can help reduce blood pressure</li>
                        <li>Limit alcohol: No more than one drink daily for women and two for men</li>
                        <li>Quit smoking: Tobacco immediately raises blood pressure and damages vessels</li>
                        <li>Manage stress: Practice relaxation techniques like meditation or deep breathing</li>
                        <li>Limit caffeine: Check if caffeine raises your blood pressure</li>
                        <li>Monitor at home: Regular home monitoring helps track progress</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

                {/* Regular Monitoring */}
                <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                  <div className="flex items-center space-x-4">
                    <img src="https://cdn-icons-png.freepik.com/512/11457/11457856.png" alt="Icon" className="w-20 h-20"/>
                    <div>
                      <h3 className="text-lg font-medium"><b>Regular Monitoring</b></h3>
                      <p>Regular monitoring is essential for managing hypertension:
                        <ul className="list-disc pl-6">
                          <li>Measure your blood pressure at the same time each day</li>
                          <li>Use a properly calibrated and validated device</li>
                          <li>Sit correctly: feet flat, back supported, arm at heart level</li>
                          <li>Take multiple readings and record the results</li>
                          <li>Share your readings with your healthcare provider</li>
                          <li>Attend all scheduled medical appointments</li>
                          <li>Know your target blood pressure goals</li>
                        </ul>
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "cardiovascular" && (
        <div className="space-y-6">
          {/* Cardiovascular Disease Section */}
          <section className="flex items-center bg-white p-6 rounded-lg shadow-md space-x-6">
            <div className="flex-shrink-0 w-1/3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/18228/18228365.png"
                alt="Cardiovascular Illustration"
                className="rounded-lg"
              />
            </div>
            <div className="w-2/3">
              <h2 className="text-2xl font-semibold mb-4 text-red-500"><b>Cardiovascular Disease</b></h2>
              <p>
                Cardiovascular disease (CVD) refers to a group of disorders affecting the heart and blood vessels. These conditions are often related to atherosclerosis, where plaque builds up in the walls of arteries, making it harder for blood to flow through.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-red-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-red-500"><b>Coronary Artery Disease</b></h3>
                  <p>Narrowing of the coronary arteries that supply blood to the heart muscle.</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-red-500"><b>Heart Failure</b></h3>
                  <p>When the heart can’t pump blood as well as it should to meet the body’s needs.</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-red-500"><b>Stroke</b></h3>
                  <p>Occurs when blood supply to part of the brain is interrupted or reduced.</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-red-500"><b>Arrhythmias</b></h3>
                  <p>Abnormal heart rhythms that can affect how well the heart works.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Managing Cardiovascular Disease*/}
          <section className="space-y-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-red-500"><b>Managing Cardiovascular Disease</b></h2>
            <div className="space-y-4">

              {/* Heart Healthy Diet */}   
              <div className="p-6 bg-white-50 rounded-lg shadow-md">          
                <div className="flex items-center space-x-4">
                  <img src="https://cdn.iconscout.com/icon/free/png-256/free-healthy-diet-icon-download-in-svg-png-gif-file-formats--nutrition-ketogenic-pack-healthcare-medical-icons-5076264.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Heart Healthy Diet</b></h3>
                    <p>A heart-healthy diet can significantly reduce your risk of cardiovascular disease:
                      <ul className="list-disc pl-6">
                        <li>Emphasize fruits, vegetables, whole grains, and lean proteins</li>
                        <li>Choose healthy fats like olive oil, avocados, nuts, and fatty fish</li>
                        <li>Limit saturated fats, trans fats, and cholesterol</li>
                        <li>Reduce sodium intake to less than 2,300mg daily</li>
                        <li>Minimize added sugars and refined carbohydrates</li>
                        <li>Consider the Mediterranean or DASH diet approaches</li>
                        <li>Stay hydrated with water rather than sugary beverages</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              {/* Physical Activity */}
              <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.freepik.com/512/7865/7865982.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Physical Activity</b></h3>
                    <p>Regular physical activity strengthens your heart and improves circulation:
                      <ul className="list-disc pl-6">
                        <li>Aim for at least 150 minutes of moderate-intensity aerobic activity weekly</li>
                        <li>Include muscle-strengthening activities at least twice a week</li>
                        <li>Start slowly and gradually increase intensity if you've been inactive</li>
                        <li>Choose activities you enjoy to help maintain consistency</li>
                        <li>Break up exercise into smaller sessions throughout the day if needed</li>
                        <li>Consider cardiac rehabilitation if you've had a heart attack or procedure</li>
                        <li>Always consult your doctor before starting a new exercise program</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              {/* Medication & Treatment */}
              <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.freepik.com/512/3724/3724938.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Medication & Treatment</b></h3>
                    <p>Medications and medical procedures may be necessary to manage cardiovascular disease:
                      <ul className="list-disc pl-6">
                        <li><b>Statins</b>: Lower cholesterol levels</li>
                        <li><b>Antiplatelet agents</b>: Prevent blood clots</li>
                        <li><b>Beta-blockers</b>: Reduce heart rate and blood pressure</li>
                        <li><b>ACE inhibitors</b>: Relax blood vessels and lower blood pressure</li>
                        <li><b>Procedures</b>: Angioplasty, stent placement, bypass surgery</li>
                        <li>Take all medications exactly as prescribed</li>
                        <li>Report any side effects to your healthcare provider</li>
                        <li>Never stop taking medications without consulting your doctor</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

                {/* Risk Factor Management */}
                <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                  <div className="flex items-center space-x-4">
                    <img src="https://cdn-icons-png.freepik.com/512/10240/10240365.png" alt="Icon" className="w-20 h-20"/>
                    <div>
                      <h3 className="text-lg font-medium"><b>Risk Factor Management</b></h3>
                      <p>Managing risk factors is crucial for preventing and controlling cardiovascular disease:
                          <ul className="list-disc pl-6">
                            <li><b>Quit smoking:</b> Smoking damages blood vessels and increases risk</li>
                            <li><b>Manage stress:</b> Chronic stress contributes to heart disease</li>
                            <li><b>Control diabetes:</b> High blood sugar damages blood vessels</li>
                            <li><b>Maintain healthy weight:</b> Obesity increases strain on the heart</li>
                            <li><b>Limit alcohol:</b> Excessive drinking raises blood pressure</li>
                            <li><b>Get adequate sleep:</b> Poor sleep is linked to heart disease</li>
                            <li><b>Regular check-ups:</b> Monitor cholesterol, blood pressure, and other risk factors</li>
                          </ul>
                        </p>
                    </div>
                  </div>
                </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "healthyLifestyle" && (
        <div className="space-y-6">
          {/* Healthy Lifestyle Section */}
          <section className="flex items-center bg-white p-6 rounded-lg shadow-md space-x-6">
            <div className="flex-shrink-0 w-1/3">
              <img
                src="https://cdn-icons-png.freepik.com/512/4480/4480052.png"
                alt="Healthy Lifestyle Illustration"
                className="rounded-lg"
              />
            </div>
            <div className="w-2/3">
              <h2 className="text-2xl font-semibold mb-4 text-green-500"><b>Healthy Lifestyle</b></h2>
              <p>
                Adopting a healthy lifestyle is one of the most effective ways to prevent chronic diseases and improve overall well-being. Small, consistent changes can lead to significant health benefits over time.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-green-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-green-500"><b>Balanced Nutrition</b></h3>
                  <p>Eating a variety of nutrient-dense foods provides the energy and nutrients your body needs.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-green-500"><b>Regular Physical Activity</b></h3>
                  <p>Exercise improves cardiovascular health, strengthens muscles, and enhances mental well-being.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-green-500"><b>Stress Management</b></h3>
                  <p>Effective stress management techniques help prevent chronic stress and its negative health effects.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-green-500"><b>Adequate Sleep</b></h3>
                  <p>Quality sleep is essential for physical recovery, cognitive function, and emotional regulation.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Healthy Lifestyle Recommendation */}
          <section className="space-y-6 mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-500"><b>Healthy Lifestyle Recommendation</b></h2>
            <div className="space-y-4">

              {/* Nutrition Guidelines */}   
              <div className="p-6 bg-white-50 rounded-lg shadow-md">          
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/17864/17864601.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Nutrition Guidelines</b></h3>
                    <p>A balanced diet provides the nutrients your body needs while helping maintain a healthy weight:
                      <ul className="list-disc pl-6">
                        <li><b>Fruits and vegetables:</b> Aim for at least 5 servings daily</li>
                        <li><b>Whole grains:</b> Choose whole grains over refined grains</li>
                        <li><b>Lean proteins:</b> Include fish, poultry, beans, nuts, and lean meats</li>
                        <li><b>Healthy fats:</b> Incorporate sources like olive oil, avocados, and nuts</li>
                        <li><b>Dairy or alternatives:</b> Choose low-fat or plant-based options</li>
                        <li><b>Hydration:</b> Drink plenty of water throughout the day</li>
                        <li><b>Limit:</b> Processed foods, added sugars, excessive salt, and unhealthy fats</li>
                        <li><b>Portion control:</b> Be mindful of portion sizes to maintain energy balance</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              {/* Physical Activity */}
              <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/2947/2947762.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Physical Activity</b></h3>
                    <p>Regular physical activity offers numerous health benefits:
                      <ul className="list-disc pl-6">
                        <li><b>Aerobic activity:</b> 150-300 minutes of moderate activity or 75-150 minutes of vigorous activity weekly</li>
                        <li><b>Strength training:</b> At least 2 days per week working all major muscle groups</li>
                        <li><b>Flexibility:</b> Incorporate stretching exercises several times weekly</li>
                        <li><b>Balance:</b> Include balance exercises, especially for older adults</li>
                        <li><b>Reduce sitting time:</b> Break up long periods of sitting with short activity breaks</li>
                        <li><b>Start small:</b> If inactive, begin with short sessions and gradually increase</li>
                        <li><b>Find enjoyable activities:</b> Choose activities you like to increase adherence</li>
                        <li><b>Make it social:</b> Exercise with friends or join group activities for motivation</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stress Management */}
              <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                <div className="flex items-center space-x-4">
                  <img src="https://cdn-icons-png.flaticon.com/512/3664/3664392.png" alt="Icon" className="w-20 h-20"/>
                  <div>
                    <h3 className="text-lg font-medium"><b>Stress Management</b></h3>
                    <p>Effective stress management techniques help prevent chronic stress and its negative health effects:
                      <ul className="list-disc pl-6">
                        <li><b>Mindfulness meditation:</b> Practice being present and aware without judgment</li>
                        <li><b>Deep breathing:</b> Use deep, diaphragmatic breathing to activate relaxation</li>
                        <li><b>Physical activity:</b> Regular exercise helps reduce stress hormones</li>
                        <li><b>Adequate sleep:</b> Prioritize good sleep habits for stress resilience</li>
                        <li><b>Social connections:</b> Maintain supportive relationships</li>
                        <li><b>Time management:</b> Set realistic goals and priorities</li>
                        <li><b>Limit stressors:</b> Identify sources of stress and reduce when possible</li>
                        <li><b>Relaxation techniques:</b> Try progressive muscle relaxation, yoga, or tai chi</li>
                        <li><b>Seek help:</b> Consider professional support when needed</li>
                      </ul>
                    </p>
                  </div>
                </div>
              </div>

                {/* Sleep Hygiene */}
                <div className="p-6 bg-white-50 rounded-lg shadow-md">  
                  <div className="flex items-center space-x-4">
                    <img src="https://cdn-icons-png.freepik.com/512/11457/11457856.png" alt="Icon" className="w-20 h-20"/>
                    <div>
                      <h3 className="text-lg font-medium"><b>Sleep Hygiene</b></h3>
                      <p>Quality sleep is essential for physical recovery, cognitive function, and emotional regulation:
                        <ul className="list-disc pl-6">
                          <li><b>Consistent schedule:</b> Go to bed and wake up at the same time daily</li>
                          <li><b>Create a restful environment:</b> Keep your bedroom dark, quiet, and cool</li>
                          <li><b>Limit screen time:</b> Avoid electronic devices 1-2 hours before bedtime</li>
                          <li><b>Watch diet:</b> Avoid large meals, caffeine, and alcohol close to bedtime</li>
                          <li><b>Physical activity:</b> Regular exercise promotes better sleep</li>
                          <li><b>Relaxation routine:</b> Develop a pre-sleep routine to signal your body</li>
                          <li><b>Manage worries:</b> Write down concerns before bed to clear your mind</li>
                          <li><b>Limit naps:</b> Keep daytime naps short (20-30 minutes) and before 3 PM</li>
                          <li><b>Comfortable bedding:</b> Invest in a supportive mattress and pillows</li>
                        </ul>
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default Dashboard;