# BIOTECTIVE System Architecture Diagram
## AI-Powered Healthcare Ecosystem - Diabetes Care Management Platform

**Actual Implementation** | Deployed on Azure Cloud Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         CLOUD LAYER                                              │
│                        Azure Web Services (Southeast Asia Region)                               │
│                   Azure MySQL Database | Azure Container Apps | Azure ACR                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              HOSTED ON AZURE WEB APP INSTANCES                                   │
│                                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                    USER LAYER                                            │   │
│  │                                   (User Roles)                                           │   │
│  │                                                                                           │   │
│  │  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐                     │   │
│  │  │              │         │              │         │              │                     │   │
│  │  │    Admin     │         │    Doctor    │         │   Patient    │                     │   │
│  │  │              │         │              │         │              │                     │   │
│  │  └──────────────┘         └──────────────┘         └──────────────┘                     │   │
│  │                                                                                           │   │
│  │                              Interacts with                                              │   │
│  │                                    ↓                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    APPLICATION LAYER (Login Interface)                            │   │   │
│  │  │                                                                                    │   │   │
│  │  │  • Doctor Portal      • Patient Portal      • Admin Dashboard                     │   │   │
│  │  │  • NFC & RFID Scanner (for check-in/out)                                          │   │   │
│  │  └──────────────────────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                   │
│                                    Web Socket Connection                                         │
│                                            ↕                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                          APPLICATION LAYER (Frontend)                                    │   │
│  │                         HTML, Bootstrap, React.js                                        │   │
│  │                                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                         React.js SPA (Vite 6.3.5)                                   │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Core Technologies:                                                                 │ │   │
│  │  │  • React 19.0.0                    • Chart.js 4.4.9 (Visualizations)               │ │   │
│  │  │  • React Router 7.5.2               • Plotly.js 3.0.1 (Advanced Charts)            │ │   │
│  │  │  • Material-UI 7.1.0                • Axios 1.9.0 (HTTP Client)                    │ │   │
│  │  │  • TailwindCSS 3.4.17               • Lucide React 0.509.0 (Icons)                 │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Feature Modules:                                                                   │ │   │
│  │  │  • Authentication         • Patient Management      • Risk Prediction              │ │   │
│  │  │  • Therapy Effectiveness  • Treatment Recommendation • Chatbot                      │ │   │
│  │  │  • Messages & Notifications • Appointments          • Admin Dashboard              │ │   │
│  │  │  • Settings               • Dashboard Views                                         │ │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                         Interface Components                                        │ │   │
│  │  │                                                                                      │ │   │
│  │  │  • HTML5                                                                            │ │   │
│  │  │  • Bootstrap CSS (via TailwindCSS)                                                  │ │   │
│  │  │  • Responsive Design                                                                │ │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                   │
│                                    HTTPS / REST API                                              │
│                                            ↕                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                      APPLICATION LAYER (Laravel Backend)                                 │   │
│  │                                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                              API LAYER                                              │ │   │
│  │  │                                                                                      │ │   │
│  │  │  ┌──────────────────────────────────────────────────────────────────────────────┐  │ │   │
│  │  │  │                      Laravel 12 (PHP 8.2)                                     │  │ │   │
│  │  │  │                                                                               │  │ │   │
│  │  │  │  HTTP Request/Response:                                                       │  │ │   │
│  │  │  │                                                                               │  │ │   │
│  │  │  │  ┌────────────────────────────────────────────────────────────────────────┐  │  │ │   │
│  │  │  │  │                    REST API Endpoints                                   │  │  │ │   │
│  │  │  │  │                      Web Routes                                         │  │  │ │   │
│  │  │  │  │                                                                         │  │  │ │   │
│  │  │  │  │  Authentication:                                                        │  │  │ │   │
│  │  │  │  │  • POST /api/register          • POST /api/login                       │  │  │ │   │
│  │  │  │  │  • GET /api/auth/check                                                 │  │  │ │   │
│  │  │  │  │                                                                         │  │  │ │   │
│  │  │  │  │  Patient Management:                                                   │  │  │ │   │
│  │  │  │  │  • GET/POST/PUT /api/patients                                          │  │  │ │   │
│  │  │  │  │  • POST /api/patients/{id}/risk                                        │  │  │ │   │
│  │  │  │  │  • POST /api/patients/{id}/apply-prediction-hba1c3                     │  │  │ │   │
│  │  │  │  │                                                                         │  │  │ │   │
│  │  │  │  │  Messaging & Notifications:                                            │  │  │ │   │
│  │  │  │  │  • GET /api/messages/conversations                                     │  │  │ │   │
│  │  │  │  │  • POST /api/messages                                                  │  │  │ │   │
│  │  │  │  │  • GET /api/notifications                                              │  │  │ │   │
│  │  │  │  │                                                                         │  │  │ │   │
│  │  │  │  │  Appointments:                                                         │  │  │ │   │
│  │  │  │  │  • GET/POST/PUT/DELETE /api/appointments                               │  │  │ │   │
│  │  │  │  │                                                                         │  │  │ │   │
│  │  │  │  │  Admin:                                                                │  │  │ │   │
│  │  │  │  │  • GET/PUT/DELETE /api/admin/users                                     │  │  │ │   │
│  │  │  │  │  • PATCH /api/admin/patients/{id}/assign-doctor                        │  │  │ │   │
│  │  │  │  │                                                                         │  │  │ │   │
│  │  │  │  │  Chatbot:                                                              │  │  │ │   │
│  │  │  │  │  • POST /api/chatbot/message                                           │  │  │ │   │
│  │  │  │  └────────────────────────────────────────────────────────────────────────┘  │  │ │   │
│  │  │  └──────────────────────────────────────────────────────────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                          MIDDLEWARE LAYER                                           │ │   │
│  │  │                                                                                      │ │   │
│  │  │  ┌────────────────────┐         ┌────────────────────┐                             │ │   │
│  │  │  │   Langflow         │         │  Laravel Sanctum   │                             │ │   │
│  │  │  │   Integration      │         │                    │                             │ │   │
│  │  │  │                    │         │  Session/Cookie    │                             │ │   │
│  │  │  │  Spatie Laravel    │         │  Authentication    │                             │ │   │
│  │  │  │  Permission        │         │                    │                             │ │   │
│  │  │  │                    │         │  Custom User       │                             │ │   │
│  │  │  │  Custom User       │         │  Action Logging    │                             │ │   │
│  │  │  │  Action Logging    │         │                    │                             │ │   │
│  │  │  └────────────────────┘         └────────────────────┘                             │ │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                        BUSINESS LOGIC LAYER                                         │ │   │
│  │  │                                                                                      │ │   │
│  │  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                 │ │   │
│  │  │  │ Patient          │  │ User             │  │ Notification     │                 │ │   │
│  │  │  │ Management       │  │ Management       │  │ Module           │                 │ │   │
│  │  │  │ Module           │  │ Module           │  │                  │                 │ │   │
│  │  │  └──────────────────┘  └──────────────────┘  └──────────────────┘                 │ │   │
│  │  │                                                                                      │ │   │
│  │  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                 │ │   │
│  │  │  │ Messaging        │  │ Appointment      │  │ Authentication   │                 │ │   │
│  │  │  │ Module           │  │ Scheduling       │  │ Module           │                 │ │   │
│  │  │  │                  │  │ Module           │  │                  │                 │ │   │
│  │  │  └──────────────────┘  └──────────────────┘  └──────────────────┘                 │ │   │
│  │  │                                                                                      │ │   │
│  │  │  ┌────────────────────────────────────────────────────────────────────────────┐    │ │   │
│  │  │  │                      AI Chatbot Module                                      │    │ │   │
│  │  │  │                   (via Langflow Integration)                                │    │ │   │
│  │  │  └────────────────────────────────────────────────────────────────────────────┘    │ │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                   │
│                                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                    FASTAPI ML SERVICE (Azure Web App - Python 3.11)                      │   │
│  │                                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                         FastAPI 0.115.12 (Uvicorn)                                  │ │   │
│  │  │                                                                                      │ │   │
│  │  │  ML Endpoints:                                                                      │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Risk Prediction:                                                                   │ │   │
│  │  │  • POST /predict                  • POST /predict-bulk                             │ │   │
│  │  │  • POST /risk-dashboard                                                            │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Therapy Effectiveness:                                                             │ │   │
│  │  │  • POST /predict-therapy-pathline                                                   │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Treatment Recommendation (RAG via Langflow):                                       │ │   │
│  │  │  • POST /treatment-recommendation                                                   │ │   │
│  │  │  • POST /treatment-chat                                                             │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Patient Chatbot (via Langflow):                                                    │ │   │
│  │  │  • POST /chatbot-patient-query                                                      │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Health Check:                                                                      │ │   │
│  │  │  • GET /health                                                                      │ │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                           ML Models & Libraries                                     │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Core ML:                                                                           │ │   │
│  │  │  • scikit-learn 1.6.1          • pandas 2.2.3                                      │ │   │
│  │  │  • numpy 2.2.4                 • joblib 1.4.2                                      │ │   │
│  │  │  • xgboost 3.0.0               • scipy 1.15.2                                      │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Deep Learning:                                                                     │ │   │
│  │  │  • torch 2.7.0                 • transformers 4.51.3                               │ │   │
│  │  │  • sentence-transformers 4.1.0                                                      │ │   │
│  │  │                                                                                      │ │   │
│  │  │  LLM Integration:                                                                   │ │   │
│  │  │  • groq 0.25.0                 • openai 1.82.1                                     │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Vector DB:                                                                         │ │   │
│  │  │  • pinecone 6.0.2                                                                   │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Database:                                                                          │ │   │
│  │  │  • mysql-connector-python 9.1.0                                                     │ │   │
│  │  │                                                                                      │ │   │
│  │  │  Serialized Models:                                                                 │ │   │
│  │  │  • lasso_model.pkl (Risk Prediction - Lasso Regression)                            │ │   │
│  │  │  • therapy_effectiveness_model.pkl (Random Forest Classifier)                      │ │   │
│  │  │  • ridge_best_model_1.pkl (Alternative Risk Model)                                 │ │   │
│  │  └────────────────────────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE LAYER                                                │
│                        (Azure Database for MySQL - Flexible Server)                             │
│                                      SSL-Enabled                                                 │
│                                                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                │
│  │                │  │                │  │                │  │                │                │
│  │     Users      │  │    Patients    │  │    Messages    │  │  Appointments  │                │
│  │                │  │                │  │                │  │                │                │
│  │  • id          │  │  • id          │  │  • id          │  │  • id          │                │
│  │  • name        │  │  • user_id     │  │  • patient_id  │  │  • patient_id  │                │
│  │  • email       │  │  • assigned_   │  │  • doctor_id   │  │  • doctor_id   │                │
│  │  • password    │  │    doctor_id   │  │  • sender_type │  │  • date        │                │
│  │  • role        │  │  • name        │  │  • body        │  │  • time        │                │
│  │                │  │  • clinical    │  │  • read_at     │  │  • type        │                │
│  │                │  │    data        │  │                │  │  • status      │                │
│  │                │  │  • HbA1c       │  │                │  │                │                │
│  │                │  │  • risk scores │  │                │  │                │                │
│  │                │  │                │  │                │  │                │                │
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘                │
│                                                                                                   │
│  ┌────────────────┐  ┌────────────────┐                                                         │
│  │                │  │                │                                                         │
│  │ User           │  │  Prediction    │                                                         │
│  │ Notifications  │  │  Cache         │                                                         │
│  │                │  │  (SQLite)      │                                                         │
│  │  • id          │  │                │                                                         │
│  │  • user_id     │  │  • patient_id  │                                                         │
│  │  • type        │  │  • features    │                                                         │
│  │  • data        │  │  • prediction  │                                                         │
│  │  • read_at     │  │  • timestamp   │                                                         │
│  │                │  │                │                                                         │
│  └────────────────┘  └────────────────┘                                                         │
│                                                                                                   │
│                                          CRUD Routes                                             │
│                                  (via Laravel Eloquent ORM)                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    INTEGRATION LAYER                                             │
│                                                                                                   │
│  ┌────────────────────────────────────────────┐  ┌────────────────────────────────────────┐    │
│  │                                            │  │                                        │    │
│  │  Groq API                                  │  │  OpenAI API                            │    │
│  │                                            │  │                                        │    │
│  │  • LLM Inference                           │  │  • Embeddings                          │    │
│  │  • Model: llama-3.3-70b-versatile          │  │  • Model: text-embedding-3-small       │    │
│  │  • Used for:                               │  │  • Vector Dimension: 1536              │    │
│  │    - Treatment Recommendations             │  │  • Used for:                           │    │
│  │    - Patient Chatbot                       │  │    - RAG Query Embeddings              │    │
│  │    - Therapy Effectiveness Insights        │  │    - Medical Literature Indexing       │    │
│  │                                            │  │                                        │    │
│  └────────────────────────────────────────────┘  └────────────────────────────────────────┘    │
│                                                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                                         │    │
│  │  Langflow (Azure Container Apps)                                                       │    │
│  │                                                                                         │    │
│  │  • RAG Workflow Orchestration                                                          │    │
│  │  • Vector Store: Pinecone                                                              │    │
│  │  • Embeddings: OpenAI text-embedding-3-small                                           │    │
│  │  • LLM: Groq (llama-3.3-70b-versatile)                                                 │    │
│  │  • Medical Literature Knowledge Base                                                   │    │
│  │                                                                                         │    │
│  │  Endpoints:                                                                            │    │
│  │  • Treatment Recommendation                                                            │    │
│  │  • Patient Chatbot                                                                     │    │
│  │                                                                                         │    │
│  │  URL: host-langflow.delightfulflower-50ef0bcd.westus2.azurecontainerapps.io           │    │
│  │                                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              ↓
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  EXTERNAL VECTOR DATABASE                                        │
│                                                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│  │                              Pinecone Vector DB                                         │     │
│  │                                                                                         │     │
│  │  • Medical Literature Embeddings (1536-dimensional vectors)                            │     │
│  │  • Diabetes Management Protocols                                                       │     │
│  │  • Insulin Therapy Best Practices                                                      │     │
│  │  • Lifestyle Intervention Research                                                     │     │
│  │  • Medical Textbooks and Guidelines                                                    │     │
│  │                                                                                         │     │
│  │  Accessed via: Langflow RAG Workflow                                                   │     │
│  └────────────────────────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Architecture Components

### 1. **Frontend Layer (React SPA)**
- **Framework**: React 19.0.0 with Vite 6.3.5
- **UI Libraries**: Material-UI 7.1.0, TailwindCSS 3.4.17
- **Visualization**: Chart.js 4.4.9, Plotly.js 3.0.1
- **Routing**: React Router 7.5.2
- **HTTP Client**: Axios 1.9.0
- **Deployment**: Built and served from Laravel's `public/` directory

### 2. **Backend Layer (Laravel 12)**
- **Framework**: Laravel 12 (PHP 8.2)
- **Authentication**: Session-based with Laravel Sanctum
- **Database ORM**: Eloquent
- **API**: RESTful endpoints for all features
- **Deployment**: Azure Web App (Southeast Asia)

### 3. **ML Service Layer (FastAPI)**
- **Framework**: FastAPI 0.115.12 (Python 3.11)
- **Server**: Uvicorn 0.34.2
- **ML Libraries**: scikit-learn, pandas, numpy, torch, transformers
- **Models**:
  - Risk Prediction: Lasso Regression (`lasso_model.pkl`)
  - Therapy Effectiveness: Random Forest Classifier (`therapy_effectiveness_model.pkl`)
- **Deployment**: Azure Web App (Docker container via ACR)

### 4. **RAG Layer (Langflow)**
- **Platform**: Langflow on Azure Container Apps
- **Vector Store**: Pinecone (1536-dim embeddings)
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: Groq llama-3.3-70b-versatile
- **Use Cases**:
  - Treatment Recommendation
  - Patient Chatbot

### 5. **Database Layer**
- **Primary DB**: Azure Database for MySQL (Flexible Server)
- **Tables**: users, patients, messages, appointments, user_notifications
- **Cache**: SQLite (FastAPI local cache for predictions)
- **SSL**: Enabled with DigiCertGlobalRootCA certificate

### 6. **Integration Layer**
- **Groq API**: LLM inference for insights and recommendations
- **OpenAI API**: Embeddings for RAG
- **Pinecone**: Vector database for medical literature
- **Langflow**: RAG workflow orchestration platform

### 7. **User Roles**
- **Admin**: User management, patient assignment to doctors, system oversight
- **Doctor**: Patient management, risk predictions, therapy analysis, treatment plans
- **Patient**: View health data, chat with AI assistant, message doctor, view appointments

---

## Data Flow Examples

### Risk Prediction Flow
1. Doctor selects patient → Frontend sends patient data to FastAPI `/predict`
2. FastAPI loads `lasso_model.pkl` → Performs inference
3. Result cached in MySQL `patients.last_risk_score`
4. Frontend displays risk gauge with category label

### Treatment Recommendation Flow
1. Doctor requests treatment plan → Frontend sends patient context to FastAPI `/treatment-recommendation`
2. FastAPI forwards to Langflow API with patient data + question
3. Langflow:
   - Embeds query using OpenAI
   - Retrieves relevant medical literature from Pinecone
   - Generates structured report using Groq LLM
4. FastAPI returns markdown report → Frontend renders

### Patient Chatbot Flow
1. Patient asks question → Frontend sends to FastAPI `/chatbot-patient-query`
2. FastAPI forwards to Langflow with patient metrics + query
3. Langflow performs RAG retrieval and generation
4. Response formatted for patient-friendly display → Frontend shows in chat UI

---

## Deployment URLs

- **Laravel + React**: `https://104384876laravel-cwh4axg4d4h5f0ha.southeastasia-01.azurewebsites.net`
- **FastAPI**: `https://104384876fastapicontainer-hsa7h5c6febrdpgj.southeastasia-01.azurewebsites.net`
- **Langflow**: `https://host-langflow.delightfulflower-50ef0bcd.westus2.azurecontainerapps.io`

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.0.0 | UI framework |
| | Vite | 6.3.5 | Build tool |
| | TailwindCSS | 3.4.17 | Styling |
| | Material-UI | 7.1.0 | Components |
| | Chart.js | 4.4.9 | Visualizations |
| **Backend** | Laravel | 12.0 | Web framework |
| | PHP | 8.2 | Runtime |
| | MySQL | 8.0 | Database |
| **ML Service** | FastAPI | 0.115.12 | API framework |
| | Python | 3.11 | Runtime |
| | scikit-learn | 1.6.1 | ML models |
| | PyTorch | 2.7.0 | Deep learning |
| **RAG** | Langflow | Latest | RAG orchestration |
| | Pinecone | 6.0.2 | Vector DB |
| | OpenAI | 1.82.1 | Embeddings |
| | Groq | 0.25.0 | LLM inference |
| **Infrastructure** | Azure Web App | - | Hosting |
| | Azure MySQL | 8.0.21 | Database |
| | Azure Container Apps | - | Langflow hosting |
| | Azure ACR | - | Container registry |

---

## Notes
- All services deployed on Azure (Southeast Asia region)
- SSL/TLS enabled for all connections
- Session-based authentication with Laravel Sanctum
- CORS configured for cross-origin requests
- Real-time features via WebSockets (Laravel Reverb)
- CI/CD via GitHub Actions
