# BIOTECTIVE System Process Flows

Complete documentation of user journey flows for key features in the BIOTECTIVE diabetes care management platform.

---

## TABLE OF CONTENTS

1. [Patient Profile Flow](#1-patient-profile-flow)
2. [Patient Messaging Flow](#2-patient-messaging-flow)
3. [Patient Chatbot Flow](#3-patient-chatbot-flow)
4. [Doctor Appointment Management Flow](#4-doctor-appointment-management-flow)
5. [Admin User Management Flow](#5-admin-user-management-flow)
6. [Risk Prediction Flow](#6-risk-prediction-flow)
7. [Therapy Effectiveness Analysis Flow](#7-therapy-effectiveness-analysis-flow)
8. [Treatment Recommendation Flow](#8-treatment-recommendation-flow)

---

## 1. PATIENT PROFILE FLOW

### Overview
Patients view their comprehensive health profile including clinical data, risk assessments, and historical records.

### Process Steps

```
1. Patient Login
   → POST /api/login (AuthController)
   → Session created with role='patient'
   → Redirect to Patient Dashboard

2. Access Profile
   → Click "Profile" or "My Health Data"
   → GET /api/patients/by-user/{userId}
   → PatientController->getByUserId()
   → Returns patient record with clinical data

3. Display Profile Data
   → Personal Info: Name, Age, Gender, Height, Weight, BMI
   → Clinical Data: HbA1c, FVG, Blood Pressure, Kidney Function
   → Treatment: Insulin Regimen, Medications, Medical History
   → Risk Assessment: Risk Score, Risk Label, Prediction Date
   → Charts: HbA1c trends, Weight/BMI progress (Chart.js)
```

### Technical Details

**API Endpoint:**
```
GET /api/patients/by-user/{userId}
```

**Database Query:**
```sql
SELECT p.*, u.name as doctor_name
FROM patients p
LEFT JOIN users u ON p.assigned_doctor_id = u.id
WHERE p.user_id = ?
```

**Frontend Component:** `src/features/patients/PatientProfile.jsx`

---

## 2. PATIENT MESSAGING FLOW

### Overview
Secure messaging between patients and their assigned doctor.

### Process Steps

```
1. Access Messages
   → Navigate to "Messages" section
   → GET /api/patients/by-user/{userId} (get assigned doctor)
   → GET /api/messages/thread/{patientId} (load conversation)

2. Load Conversation
   → MessageController->thread($patientId)
   → Query: SELECT * FROM messages WHERE patient_id = ? ORDER BY created_at ASC
   → Display chat interface

3. Send Message
   → Patient types message
   → POST /api/messages
     {
       "patient_id": 123,
       "doctor_id": 456,
       "sender_type": "patient",
       "body": "Message text"
     }
   → MessageController->send()
   → INSERT INTO messages
   → Create notification for doctor

4. Real-time Updates
   → WebSocket via Laravel Reverb (optional)
   → Broadcast message event
   → Doctor UI updates automatically

5. Mark as Read
   → PATCH /api/messages/{id}/read
   → UPDATE messages SET read_at = NOW()
```

### Technical Details

**API Endpoints:**
```
GET  /api/messages/conversations
GET  /api/messages/thread/{patientId}
POST /api/messages
PATCH /api/messages/{id}/read
```

**Database Schema:**
```sql
CREATE TABLE messages (
    id BIGINT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    sender_type ENUM('doctor', 'patient'),
    body TEXT NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP
);
```

**Frontend Component:** `src/features/messages/MessageThread.jsx`

---

## 3. PATIENT CHATBOT FLOW

### Overview
AI-powered chatbot using RAG (Retrieval-Augmented Generation) for personalized diabetes education.

### Process Steps

```
1. Access Chatbot
   → Navigate to "AI Assistant"
   → GET /api/patients/by-user/{userId} (load patient context)
   → Initialize chat interface

2. Patient Asks Question
   → Patient types: "What foods should I avoid?"
   → Optional: Add context in text area
   → Click "Send"

3. Frontend Processing
   → Prepare payload with patient data:
     {
       "patient": {
         "name": "John Doe",
         "hba1c_1st_visit": 8.5,
         "insulin_regimen_type": "Basal-Bolus",
         "medications": "Metformin"
       },
       "query": "What foods should I avoid?",
       "context": "High blood sugar after meals"
     }
   → POST to FastAPI: /chatbot-patient-query

4. FastAPI Processing
   → Receive request
   → Format context for Langflow
   → Call Langflow API with patient data + query

5. Langflow RAG Processing
   → Generate UUID session ID
   → Step 1: Query Embedding
     - OpenAI API: text-embedding-3-small
     - Convert to 1536-dim vector
   
   → Step 2: Vector Search
     - Query Pinecone vector database
     - Retrieve top-5 relevant medical documents
   
   → Step 3: Context Assembly
     - Combine patient data + retrieved docs
   
   → Step 4: LLM Generation
     - Groq API: llama-3.3-70b-versatile
     - Generate personalized response
     - Response grounded in medical literature

6. Response Display
   → FastAPI returns response to frontend
   → Add to message history
   → Render in chat interface (Markdown supported)
   → Enable follow-up questions
```

### Technical Details

**FastAPI Endpoint:**
```python
@app.post("/chatbot-patient-query")
async def chatbot_patient_query(request: dict):
    patient = request.get("patient", {})
    query = request.get("query", "")
    
    # Format patient context
    context = f"""
    Patient: {patient.get('name')}
    HbA1c: {patient.get('hba1c_1st_visit')}%
    Treatment: {patient.get('insulin_regimen_type')}
    
    Question: {query}
    """
    
    # Call Langflow
    response = requests.post(LANGFLOW_URL, json={
        "input_value": context,
        "session_id": str(uuid.uuid4())
    })
    
    return {"response": extract_response(response.json())}
```

**Langflow Workflow:**
1. Input Node → Chat Input
2. Embedding Node → OpenAI (text-embedding-3-small)
3. Vector Store → Pinecone (medical literature)
4. Retrieval Node → Top-K similarity search
5. LLM Node → Groq (llama-3.3-70b-versatile)
6. Output Node → Chat Output

**Frontend Component:** `src/features/chatbot/Chatbot.jsx`

---

## 4. DOCTOR APPOINTMENT MANAGEMENT FLOW

### Overview
Doctors create, view, update, and manage appointments with assigned patients.

### Process Steps

```
1. View Appointments
   → Navigate to "Appointments"
   → GET /api/appointments
   → AppointmentController->index() (filtered by doctor_id)
   → Display list/calendar view

2. Create Appointment
   → Click "New Appointment"
   → Fill form:
     - Patient (dropdown of assigned patients)
     - Date, Time, Duration
     - Type (Consultation/Follow-up/Lab Work)
     - Notes
   → POST /api/appointments
     {
       "patient_id": 123,
       "doctor_id": 456,
       "date": "2025-12-01",
       "time": "14:00",
       "type": "Follow-up",
       "duration_minutes": 30,
       "status": "Scheduled"
     }

3. Backend Processing
   → Validate data
   → Check for scheduling conflicts
   → INSERT INTO appointments
   → Create notification for patient
   → Return success

4. Update Appointment
   → Click "Edit" on appointment
   → Modify fields
   → PUT /api/appointments/{id}
   → Check for new conflicts
   → UPDATE appointments
   → Notify patient of changes

5. Mark Complete
   → Click "Mark Complete"
   → PUT /api/appointments/{id} { "status": "Completed" }
   → Move to "Past Appointments"

6. Cancel Appointment
   → Click "Cancel"
   → Confirmation dialog
   → DELETE /api/appointments/{id}
   → Notify patient of cancellation
   → Remove from list
```

### Technical Details

**API Endpoints:**
```
GET    /api/appointments
GET    /api/appointments/{id}
POST   /api/appointments
PUT    /api/appointments/{id}
DELETE /api/appointments/{id}
```

**Database Schema:**
```sql
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10),
    type VARCHAR(50),
    duration_minutes INT,
    status VARCHAR(30) DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP
);
```

**Frontend Component:** `src/features/appointments/AppointmentList.jsx`

---

## 5. ADMIN USER MANAGEMENT FLOW

### Overview
Administrators manage user accounts and assign patients to doctors.

### Process Steps

```
1. Access User Management
   → Admin logs in (role='admin')
   → Navigate to "User Management"
   → GET /api/admin/users
   → Display user list with filters

2. View User List
   → Table columns: ID, Name, Email, Role, Created Date
   → Filters: By role, Search by name/email
   → Pagination: 25 users per page

3. Create New User
   → Click "Add New User"
   → Fill form:
     - Name, Email, Password
     - Role (Admin/Doctor/Patient)
   → POST /api/admin/users
     {
       "name": "Dr. Jane Smith",
       "email": "jane@hospital.com",
       "password": "SecurePass123!",
       "role": "doctor"
     }
   → UserController->store()
   → Hash password
   → INSERT INTO users
   → If patient: create patient record

4. Update User
   → Click "Edit"
   → Modify: Name, Email, Role
   → PUT /api/admin/users/{id}
   → Handle role change implications
   → UPDATE users

5. Delete User
   → Click "Delete"
   → Confirmation dialog
   → Check dependencies (doctor with patients)
   → DELETE /api/admin/users/{id}
   → Cascade delete related records

6. Assign Patient to Doctor
   → Navigate to "Patient Assignment"
   → GET /api/admin/patients
   → Select patient + Select doctor
   → PATCH /api/admin/patients/{id}/assign-doctor
     { "doctor_id": 456 }
   → UPDATE patients SET assigned_doctor_id = ?
   → Notify patient and doctor

7. Search & Filter
   → Type in search box
   → GET /api/admin/users?search={query}&role={role}
   → Apply filters: WHERE name LIKE '%?%' OR email LIKE '%?%'
   → Return filtered results
```

### Technical Details

**API Endpoints:**
```
GET    /api/admin/users
GET    /api/admin/users/{id}
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
PATCH  /api/admin/patients/{id}/assign-doctor
```

**Authorization:**
```php
// Middleware checks
if (auth()->user()->role !== 'admin') {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

**Frontend Component:** `src/features/admin/UserManagement.jsx`

---

## DATA FLOW SUMMARY

### Patient Profile
```
Frontend → Laravel API → MySQL → Frontend (Display)
```

### Messaging
```
Frontend → Laravel API → MySQL → Notification → WebSocket (optional)
```

### Chatbot
```
Frontend → FastAPI → Langflow → (Pinecone + Groq) → FastAPI → Frontend
```

### Appointments
```
Frontend → Laravel API → MySQL → Notification → Frontend
```

### User Management
```
Admin Frontend → Laravel API → MySQL → Audit Log → Frontend
```

---

## SECURITY CONSIDERATIONS

1. **Authentication**: Session-based with Laravel Sanctum
2. **Authorization**: Role-based access control (Admin/Doctor/Patient)
3. **Data Validation**: All inputs validated on backend
4. **SQL Injection**: Eloquent ORM with parameterized queries
5. **Password Security**: Bcrypt hashing
6. **API Security**: CORS configured, CSRF protection
7. **Audit Logging**: All admin actions logged

---

## NOTIFICATION TYPES

| Type | Recipient | Trigger |
|------|-----------|---------|
| `message.new` | Doctor/Patient | New message sent |
| `appointment.scheduled` | Patient | Appointment created |
| `appointment.updated` | Patient | Appointment modified |
| `appointment.cancelled` | Patient | Appointment deleted |
| `doctor.assigned` | Patient | Doctor assigned |
| `patient.assigned` | Doctor | Patient assigned |

---

## ERROR HANDLING

All flows include error handling:
- Frontend: Try-catch blocks with user-friendly messages
- Backend: Validation errors with 422 status
- Database: Transaction rollback on failure
- External APIs: Timeout handling (90s for Langflow)

---

## 6. RISK PREDICTION FLOW

### Overview
Doctors use ML-powered risk prediction to forecast patient's future HbA1c levels based on clinical data and treatment history.

### Process Steps

```
1. Doctor Selects Patient
   → Navigate to patient's profile
   → Click "Predict Risk" or "Run Risk Assessment"
   → Frontend loads patient clinical data

2. Prepare Prediction Features
   → Frontend extracts patient data:
     - Age, Gender, Ethnicity
     - Height, Weight, BMI
     - HbA1c (Visit 1, 2)
     - FVG (Fasting Venous Glucose)
     - Insulin Regimen Type
     - Gap between visits (days)
     - Reduction percentage
     - Physical activity level
   → Convert to feature array (14 features)

3. Send to FastAPI
   → POST to FastAPI: /risk-dashboard
     {
       "features": [45, 170, 75, 8.5, 7.8, ...],
       "patient_id": 123,
       "patient": { full patient object },
       "model_version": "risk_v1"
     }

4. FastAPI Processing
   → Check MySQL cache first
     - Query: SELECT last_risk_score FROM patients WHERE id = ?
     - If cached and not stale, return immediately
   
   → If no cache or force recalculate:
     - Load Lasso Regression model (lasso_model.pkl)
     - Prepare input: np.array(features).reshape(1, -1)
     - Run prediction: model.predict(input_data)
     - Get predicted HbA1c value (e.g., 7.2%)

5. Risk Classification
   → Apply risk label based on HbA1c value:
     - < 5.7%: "Normal"
     - 5.7-6.5%: "At Risk"
     - 6.5-7.1%: "Moderate Risk"
     - 7.1-8.1%: "Risky"
     - 8.1-9.0%: "Very Risky"
     - > 9.0%: "Critical"

6. Identify Key Risk Factors
   → Analyze patient data for contributing factors:
     - High initial HbA1c (> 8%)
     - Elevated FVG (> 130 mg/dL)
     - Low daily HbA1c reduction rate
     - FVG increase between visits
   → Return top 6 factors

7. Save to Database
   → UPDATE patients SET
       last_risk_score = 7.2,
       last_risk_label = 'Risky',
       risk_model_version = 'risk_v1',
       last_predicted_at = NOW(),
       hba1c_3rd_visit = 7.2,
       reduction_a_2_3 = (hba1c_2nd - predicted)
     WHERE id = 123

8. Return Response
   → FastAPI returns:
     {
       "prediction": 7.2,
       "risk_label": "Risky",
       "key_factors": [
         "High initial HbA1c (8.5%)",
         "Elevated FVG @ V1 (145 mg/dL)"
       ],
       "cached": false,
       "model_version": "risk_v1"
     }

9. Frontend Display
   → Render risk gauge (Chart.js)
     - Color-coded by risk level
     - Needle pointing to predicted value
   → Display risk label with styling
   → Show key contributing factors
   → Show prediction date
   → Enable "Recalculate" button
```

### Technical Details

**FastAPI Endpoint:**
```python
@app.post("/risk-dashboard")
def risk_dashboard(req: DashboardRequest, force: bool = False):
    # Check cache
    if not force and req.patient_id:
        cached_score = latest_get(req.patient_id, model_version)
        if cached_score is not None:
            return {"prediction": cached_score, "cached": True}
    
    # Load model and predict
    model = get_ridge_model()  # Lasso Regression
    input_data = np.array(req.features).reshape(1, -1)
    prediction = float(model.predict(input_data)[0])
    
    # Classify risk
    label = _risk_label(prediction)
    
    # Save to MySQL
    save_latest_to_mysql(req.patient_id, prediction, label, model_version)
    
    return {
        "prediction": prediction,
        "risk_label": label,
        "key_factors": _key_factors_from_patient(req.patient),
        "cached": False
    }
```

**ML Model:**
- **Type**: Lasso Regression
- **File**: `lasso_model.pkl`
- **Input Features**: 14 clinical and demographic features
- **Output**: Predicted HbA1c value (continuous)
- **Training Data**: Historical patient records with 3 visits

**Caching Strategy:**
```sql
-- Cache in MySQL patients table
UPDATE patients SET
    last_risk_score = ?,
    last_risk_label = ?,
    risk_model_version = ?,
    last_predicted_at = NOW()
WHERE id = ?
```

**Frontend Component:** `src/features/patients/RiskPrediction.jsx`

---

### Visual Presentation Guide (Icon-Based Slides)

#### Slide Layout: Risk Prediction Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RISK PREDICTION WORKFLOW                              │
│                   ML-Powered HbA1c Forecasting                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: DOCTOR INITIATES PREDICTION                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                    👨‍⚕️ Doctor                                      │   │
│  │                       ↓                                          │   │
│  │              📋 Patient Profile                                  │   │
│  │                       ↓                                          │   │
│  │            🔘 [Predict Risk Button]                              │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Doctor selects patient and initiates risk prediction"                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: DATA COLLECTION                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📊 Clinical Features (14 inputs)                               │   │
│  │                                                                  │   │
│  │  👤 Demographics        🩺 Clinical Metrics                     │   │
│  │  • Age: 45             • HbA1c V1: 8.5%                        │   │
│  │  • Gender: Male        • HbA1c V2: 7.8%                        │   │
│  │  • Ethnicity           • FVG: 145 mg/dL                        │   │
│  │                        • BMI: 28.5                              │   │
│  │  💉 Treatment          • Insulin: Basal-Bolus                   │   │
│  │  • Regimen Type        ⏱️ Gap: 90 days                          │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "System extracts 14 clinical features from patient record"             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: API COMMUNICATION                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  💻 Frontend  ──────→  🌐 FastAPI                               │   │
│  │                                                                  │   │
│  │  📤 POST /risk-dashboard                                        │   │
│  │  {                                                               │   │
│  │    features: [45, 8.5, 7.8, ...],                              │   │
│  │    patient_id: 123                                              │   │
│  │  }                                                               │   │
│  │                                                                  │   │
│  │  📥 Response                                                     │   │
│  │  {                                                               │   │
│  │    prediction: 7.2,                                             │   │
│  │    risk_label: "Risky"                                          │   │
│  │  }                                                               │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Frontend sends features to FastAPI ML service"                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: ML MODEL PREDICTION                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📥 Input (14)    →    🤖 Lasso Model    →    📊 Output         │   │
│  │                                                                  │   │
│  │  ┌──────────┐         ┌──────────────┐       ┌──────────┐      │   │
│  │  │ Age      │         │              │       │  HbA1c   │      │   │
│  │  │ HbA1c V1 │    →    │   Trained    │   →   │ Forecast │      │   │
│  │  │ HbA1c V2 │         │    Model     │       │          │      │   │
│  │  │ FVG      │         │  lasso_model │       │  7.2%    │      │   │
│  │  │ BMI      │         │    .pkl      │       │          │      │   │
│  │  │ ...      │         │              │       └──────────┘      │   │
│  │  └──────────┘         └──────────────┘                         │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Lasso Regression model predicts future HbA1c value"                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: RISK CLASSIFICATION                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  🟢 Normal          < 5.7%                                      │   │
│  │  🟡 At Risk         5.7% - 6.5%                                 │   │
│  │  🟠 Moderate Risk   6.5% - 7.1%                                 │   │
│  │  🔴 Risky           7.1% - 8.1%  ← 7.2% ⭐                      │   │
│  │  🔴 Very Risky      8.1% - 9.0%                                 │   │
│  │  ⚫ Critical        > 9.0%                                      │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Predicted value classified into risk category"                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: VISUAL DISPLAY                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │              📊 Risk Prediction Result                          │   │
│  │                                                                  │   │
│  │                    ╭─────────╮                                  │   │
│  │              🟢   ╱     🔴    ╲   ⚫                            │   │
│  │                  │      ↑     │                                 │   │
│  │                  │    7.2%    │                                 │   │
│  │                   ╲         ╱                                   │   │
│  │                    ╰───────╯                                    │   │
│  │                                                                  │   │
│  │              🏷️ Risk Level: RISKY                               │   │
│  │              📈 Predicted HbA1c: 7.2%                           │   │
│  │              📅 Date: 2025-11-29                                │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Visual gauge shows predicted risk level"                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: KEY FACTORS IDENTIFIED                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ⚠️ Contributing Risk Factors:                                  │   │
│  │                                                                  │   │
│  │  🔺 High initial HbA1c (8.5%)                                   │   │
│  │     Starting value significantly above target                   │   │
│  │                                                                  │   │
│  │  🔺 Elevated FVG @ Visit 1 (145 mg/dL)                          │   │
│  │     Fasting glucose above normal range                          │   │
│  │                                                                  │   │
│  │  🔺 Low daily HbA1c reduction rate (0.008)                      │   │
│  │     Slower than expected improvement                            │   │
│  │                                                                  │   │
│  │  🔺 FVG increase between visits (+5 mg/dL)                      │   │
│  │     Glucose control worsening                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "System identifies key factors contributing to risk"                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 8: DATABASE CACHING                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  💾 MySQL Database (patients table)                             │   │
│  │                                                                  │   │
│  │  ┌────┬──────┬──────────┬──────────┬─────────────┐             │   │
│  │  │ id │ name │ risk_    │ risk_    │ predicted_  │             │   │
│  │  │    │      │ score    │ label    │ at          │             │   │
│  │  ├────┼──────┼──────────┼──────────┼─────────────┤             │   │
│  │  │123 │John  │ 7.2      │ Risky    │ 2025-11-29  │             │   │
│  │  └────┴──────┴──────────┴──────────┴─────────────┘             │   │
│  │                                                                  │   │
│  │  ✅ Cached for future retrieval                                 │   │
│  │  ⚡ Faster subsequent predictions                               │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Prediction cached in database for future retrieval"                   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Icon Legend:
- 👨‍⚕️ Doctor/User
- 📋 Patient Profile/Data
- 📊 Charts/Analytics
- 🤖 ML Model
- 💾 Database
- 🌐 API/Network
- ⚠️ Warning/Alert
- ✅ Success/Complete
- 📈 Prediction/Forecast
- 🔴🟠🟡🟢 Risk Levels

---

## 7. THERAPY EFFECTIVENESS ANALYSIS FLOW

### Overview
Doctors analyze how effective a patient's insulin therapy has been by comparing clinical metrics across visits.

### Process Steps

```
1. Doctor Initiates Analysis
   → Navigate to patient profile
   → Click "Analyze Therapy Effectiveness"
   → Frontend loads complete patient data

2. Prepare Patient Data
   → Extract multi-visit data:
     - Demographics: Age, Sex, Ethnicity, Height
     - Weight: Visit 1, 2, 3
     - BMI: Visit 1, 3
     - HbA1c: Visit 1, 2, 3
     - FVG/FPG: Visit 1, 2, 3
     - Blood Pressure: SBP, DBP
     - Kidney Function: eGFR (Visit 1, 3), UACR (Visit 1, 3)
     - Diabetes Distress: DDS (Visit 1, 3)
     - Insulin Regimen: Visit 1, 2, 3
     - Time Gaps: Days between visits

3. Send to FastAPI
   → POST to FastAPI: /predict-therapy-pathline
     {
       "age": 45,
       "sex": "Male",
       "ethnicity": "Chinese",
       "insulin_regimen": "Basal-Bolus",
       "hba1c1": 8.5,
       "hba1c2": 7.8,
       "hba1c3": 7.2,
       "fvg1": 145,
       "fvg2": 130,
       "fvg3": 120,
       "bmi1": 28.5,
       "bmi3": 27.2,
       "egfr1": 85,
       "egfr3": 88,
       "uacr1": 25,
       "uacr3": 20,
       "dds1": 3.5,
       "dds3": 2.8,
       "sbp": 130,
       "dbp": 85,
       ...
     }

4. FastAPI Processing - Step 1: Model Prediction
   → Load Random Forest Classifier (therapy_effectiveness_model.pkl)
   → Build DataFrame with all features
   → Handle categorical encoding (Sex, Ethnicity, Regimen)
   → Run prediction: model.predict_proba(df)
   → Get probability of "Effective" class

5. FastAPI Processing - Step 2: Effectiveness Score
   → Calculate improvement ratios for each metric:
     - HbA1c: (hba1c1 - hba1c3) / hba1c1 (want decrease)
     - FPG/FVG: (fvg1 - fvg3) / fvg1 (want decrease)
     - BMI: (bmi1 - bmi3) / bmi1 (want decrease)
     - Blood Pressure: SBP/DBP changes (want decrease)
     - eGFR: (egfr3 - egfr1) / egfr1 (want increase)
     - UACR: (uacr1 - uacr3) / uacr1 (want decrease)
     - DDS: (dds1 - dds3) / dds1 (want decrease)
   
   → Apply weights:
     - HbA1c: 30%
     - FPG: 20%
     - BMI: 10%
     - SBP: 5%
     - DBP: 5%
     - eGFR: 10%
     - UACR: 10%
     - Distress: 10%
   
   → Compute weighted score: Σ(weight × improvement_ratio)
   → Normalize to 0-1 scale
   → Label: "Effective" if score >= 0.5, else "Not Effective"

6. FastAPI Processing - Step 3: HbA1c Forecast
   → Use linear regression on HbA1c trend
   → Fit line through [hba1c1, hba1c2, hba1c3]
   → Forecast next 2 visits (Visit 4, 5)
   → Return predicted values

7. FastAPI Processing - Step 4: LLM Summary
   → Call Groq API (llama-3.3-70b-versatile)
   → Prompt:
     """
     Therapy effectiveness score: 0.72 (Effective).
     HbA1c across visits: 8.5, 7.8, 7.2.
     Forecast HbA1c next visits: 6.8, 6.5.
     Regimen: Basal-Bolus.
     
     Summarize trajectory and give clinical recommendation (<120 words).
     """
   → Generate personalized summary

8. Return Response
   → FastAPI returns:
     {
       "effectiveness": {
         "score": 0.72,
         "label": "Effective",
         "components": {
           "HbA1c": 0.15,
           "FPG": 0.17,
           "BMI": 0.05,
           "eGFR": 0.04,
           "UACR": 0.20,
           "Distress": 0.20
         }
       },
       "model_probability": 0.8234,
       "forecast_hba1c": [6.8, 6.5],
       "summary": "Patient shows excellent glycemic control improvement..."
     }

9. Frontend Display
   → Render effectiveness gauge
   → Show component breakdown (radar chart)
   → Display HbA1c trend line with forecast
   → Show LLM-generated clinical summary
   → Highlight key improvements and concerns
```

### Technical Details

**FastAPI Endpoint:**
```python
@app.post("/predict-therapy-pathline")
def predict_therapy_pathline(data: PatientData):
    # Build DataFrame
    df = pd.DataFrame({
        'Age': [data.age],
        'Sex': [data.sex],
        'Ethnicity': [data.ethnicity],
        'HbA1c1': [data.hba1c1],
        'HbA1c2': [data.hba1c2],
        'HbA1c3': [data.hba1c3],
        # ... all features
    })
    
    # Model prediction
    model = get_therapy_model()
    probability = float(model.predict_proba(df)[0][1])
    
    # Effectiveness calculation
    effectiveness = compute_effectiveness_from_patient(data)
    
    # Forecast
    forecast = _forecast_hba1c_simple([data.hba1c1, data.hba1c2, data.hba1c3])
    
    # LLM summary
    summary = generate_llm_summary(effectiveness, forecast, data.insulin_regimen)
    
    return {
        "effectiveness": effectiveness,
        "model_probability": probability,
        "forecast_hba1c": forecast,
        "summary": summary
    }
```

**ML Model:**
- **Type**: Random Forest Classifier
- **File**: `therapy_effectiveness_model.pkl`
- **Input Features**: 27 features (demographics + multi-visit metrics)
- **Output**: Binary classification (Effective/Not Effective) + probability

**Effectiveness Formula:**
```python
score = (
    0.30 * hba1c_improvement +
    0.20 * fpg_improvement +
    0.10 * bmi_improvement +
    0.05 * sbp_improvement +
    0.05 * dbp_improvement +
    0.10 * egfr_improvement +
    0.10 * uacr_improvement +
    0.10 * distress_improvement
)
normalized_score = (score + 1.0) / 2.0  # Map [-1, 1] to [0, 1]
```

**Frontend Component:** `src/features/patients/TherapyEffectiveness.jsx`

---

### Visual Presentation Guide (Icon-Based Slides)

#### Slide Layout: Therapy Effectiveness Analysis Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│              THERAPY EFFECTIVENESS ANALYSIS WORKFLOW                     │
│           Multi-Visit Clinical Metrics Evaluation with AI                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: DOCTOR INITIATES ANALYSIS                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                    👨‍⚕️ Doctor                                      │   │
│  │                       ↓                                          │   │
│  │              📋 Patient Profile                                  │   │
│  │              💉 Regimen: Basal-Bolus                             │   │
│  │                       ↓                                          │   │
│  │         🔘 [Analyze Therapy Effectiveness]                       │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Doctor requests therapy effectiveness analysis"                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: MULTI-VISIT DATA COLLECTION                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📊 27 Features Across 3 Visits                                 │   │
│  │                                                                  │   │
│  │  Visit 1 📅    Visit 2 📅    Visit 3 📅                         │   │
│  │  HbA1c: 8.5%   7.8%          7.2%    📉                         │   │
│  │  FVG: 145      130           120     📉                         │   │
│  │  BMI: 28.5     28.0          27.2    📉                         │   │
│  │  eGFR: 85      86            88      📈                         │   │
│  │  UACR: 25      23            20      📉                         │   │
│  │  DDS: 3.5      3.0           2.8     📉                         │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "System collects 27 features across 3 clinical visits"                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: ML MODEL PREDICTION                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  💻 Frontend  ──→  🌐 FastAPI  ──→  🤖 Random Forest            │   │
│  │                                                                  │   │
│  │  📥 Input (27)  →  🌲🌲🌲  →  📊 Output                          │   │
│  │  • Demographics    100 Trees    Probability: 0.82               │   │
│  │  • HbA1c 1,2,3                  Label: ✅ Effective              │   │
│  │  • Multi-visit                                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Random Forest model predicts therapy effectiveness"                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: EFFECTIVENESS SCORE CALCULATION                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ⚖️ Weighted Score Calculation:                                  │   │
│  │                                                                  │   │
│  │  📉 HbA1c:  ↓15.3%  × 30%  =  0.046                            │   │
│  │  📉 FPG:    ↓17.2%  × 20%  =  0.034                            │   │
│  │  📉 BMI:    ↓4.6%   × 10%  =  0.005                            │   │
│  │  📈 eGFR:   ↑3.5%   × 10%  =  0.004                            │   │
│  │  📉 UACR:   ↓20.0%  × 10%  =  0.020                            │   │
│  │  📉 DDS:    ↓20.0%  × 10%  =  0.020                            │   │
│  │  📉 BP:     ↓3.5%   × 10%  =  0.004                            │   │
│  │                                                                  │   │
│  │  🎯 Total Score: 0.72 / 1.00                                    │   │
│  │  ✅ Label: EFFECTIVE (≥ 0.5)                                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Weighted effectiveness score computed from improvements"              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: HbA1c FORECAST                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📈 HbA1c Trajectory & Forecast                                 │   │
│  │                                                                  │   │
│  │  9.0% ┤                                                          │   │
│  │  8.5% ┤ ●                                                        │   │
│  │  8.0% ┤   ╲                                                     │   │
│  │  7.5% ┤     ● ╲                                                 │   │
│  │  7.0% ┤       ● ╲                                               │   │
│  │  6.5% ┤         ╲ ○ (Forecast)                                 │   │
│  │  6.0% ┤           ○ (Forecast)                                 │   │
│  │       └──┬───┬───┬───┬───┬──                                   │   │
│  │         V1  V2  V3  V4  V5                                      │   │
│  │                                                                  │   │
│  │  🎯 Forecast: V4 = 6.8%, V5 = 6.5%                             │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Linear forecast predicts continued HbA1c improvement"                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: AI SUMMARY GENERATION                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  💬 Groq LLM (llama-3.3-70b-versatile)                          │   │
│  │                                                                  │   │
│  │  📥 Input:                                                       │   │
│  │  • Score: 0.72 (Effective)                                      │   │
│  │  • HbA1c: 8.5 → 7.8 → 7.2                                      │   │
│  │  • Forecast: 6.8, 6.5                                           │   │
│  │                                                                  │   │
│  │  🤖 Processing...                                                │   │
│  │                                                                  │   │
│  │  📤 Generated Summary:                                           │   │
│  │  "Patient shows excellent glycemic control improvement          │   │
│  │   with consistent HbA1c reduction. Current Basal-Bolus         │   │
│  │   regimen is highly effective. Recommend maintaining            │   │
│  │   current regimen with regular monitoring."                     │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "AI generates personalized clinical summary"                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: RESULTS DISPLAY                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  📊 Therapy Effectiveness Dashboard                             │   │
│  │                                                                  │   │
│  │  🎯 Overall Score: 0.72 / 1.00                                  │   │
│  │  ✅ Status: EFFECTIVE                                            │   │
│  │  🤖 Model Confidence: 82.34%                                     │   │
│  │                                                                  │   │
│  │  📈 Component Breakdown:                                         │   │
│  │     HbA1c (30%) ████████████████                                │   │
│  │     FPG (20%)   ████████████                                    │   │
│  │     UACR (10%)  ██████                                          │   │
│  │     DDS (10%)   ██████                                          │   │
│  │                                                                  │   │
│  │  📈 HbA1c Trend: [Line chart]                                   │   │
│  │  💬 AI Summary: [Clinical recommendation]                       │   │
│  │                                                                  │   │
│  │  ✅ Key Improvements:                                            │   │
│  │  • HbA1c reduced by 15.3%                                       │   │
│  │  • UACR improved by 20%                                         │   │
│  │  • Diabetes distress decreased by 20%                           │   │
│  │  • Weight loss of 4kg achieved                                  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  "Complete effectiveness analysis with AI insights"                     │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Icon Legend:
- 👨‍⚕️ Doctor/User
- 📊 Charts/Data
- 🤖 ML Model (Random Forest)
- 📈 Trends/Forecast
- 💬 AI Summary (Groq LLM)
- ✅ Effective
- ❌ Not Effective
- 📉📈 Metric Changes
- ⚖️ Weighted Calculation
- 🎯 Target Achievement

---

## 8. TREATMENT RECOMMENDATION FLOW

### Overview
Doctors request AI-powered treatment recommendations using RAG (Retrieval-Augmented Generation) based on medical literature.

### Process Steps

```
1. Doctor Requests Recommendation
   → Navigate to patient profile
   → Click "Get Treatment Recommendation"
   → Modal opens with question input

2. Doctor Enters Question
   → Type specific question:
     "What insulin regimen adjustments should I consider for this patient?"
   → Optional: Add additional context
   → Click "Generate Recommendation"

3. Frontend Preparation
   → Gather patient context:
     - Name, Age, Gender
     - Current HbA1c levels (all visits)
     - FVG levels
     - Current insulin regimen
     - Medications
     - Medical history
     - Recent risk prediction
     - Therapy effectiveness score
   
   → Format payload:
     {
       "patient": { full patient object },
       "question": "What insulin regimen adjustments..."
     }

4. Send to FastAPI
   → POST to FastAPI: /treatment-recommendation
   → FastAPI receives request

5. FastAPI Processing
   → Serialize patient data as context string
   → Combine question with patient data:
     """
     What insulin regimen adjustments should I consider?
     
     Patient Data:
     name: John Doe
     age: 45
     hba1c_1st_visit: 8.5
     hba1c_2nd_visit: 7.8
     insulin_regimen_type: Basal-Bolus
     medications: Metformin, Insulin Glargine
     ...
     """
   
   → Generate UUID session ID
   → Call Langflow API

6. Langflow RAG Processing
   → Receive query from FastAPI
   
   → Step 1: Query Embedding
     - OpenAI API: text-embedding-3-small
     - Convert query to 1536-dimensional vector
     - Embedding captures semantic meaning
   
   → Step 2: Vector Search in Pinecone
     - Query: "insulin regimen adjustments basal-bolus HbA1c 8.5"
     - Search medical literature index
     - Retrieve top-5 most relevant documents:
       * "Insulin Intensification Strategies"
       * "Basal-Bolus Therapy Optimization"
       * "HbA1c Target Achievement Guidelines"
       * "Insulin Dose Adjustment Protocols"
       * "Type 2 Diabetes Treatment Algorithms"
   
   → Step 3: Context Assembly
     - Combine patient data
     - Add retrieved medical literature
     - Format structured prompt
   
   → Step 4: LLM Generation
     - Groq API: llama-3.3-70b-versatile
     - System prompt: "You are a clinical decision support AI..."
     - User prompt: [Patient context + Retrieved docs + Question]
     - Generate evidence-based recommendation
     - Response includes:
       * Current regimen assessment
       * Specific adjustment recommendations
       * Rationale based on literature
       * Monitoring parameters
       * Expected outcomes
   
   → Return structured response

7. FastAPI Response Handling
   → Extract response from Langflow output structure
   → Parse nested JSON:
     result["outputs"][0]["outputs"][0]["results"]["message"]["text"]
   → Format as markdown
   → Return to frontend

8. Frontend Display
   → Render recommendation in modal
   → Markdown formatting:
     - Headers for sections
     - Bullet points for recommendations
     - Bold for key terms
     - Code blocks for dosing schedules
   
   → Display sections:
     - Current Assessment
     - Recommended Adjustments
     - Clinical Rationale
     - Monitoring Plan
     - Expected Outcomes
   
   → Action buttons:
     - "Copy to Clipboard"
     - "Add to Patient Notes"
     - "Generate New Recommendation"

9. Doctor Reviews and Acts
   → Review AI-generated recommendation
   → Cross-reference with clinical judgment
   → Implement appropriate changes
   → Document in patient record
```

### Technical Details

**FastAPI Endpoint:**
```python
@app.post("/treatment-recommendation")
async def treatment_recommendation(request: Request):
    body = await request.json()
    patient = body["patient"]
    question = body["question"]
    
    # Format patient context
    patient_data = "\n".join([f"{k}: {v}" for k, v in patient.items()])
    full_input = f"{question}\n\nPatient Data:\n{patient_data}"
    
    # Call Langflow
    langflow_url = "https://host-langflow.delightfulflower-50ef0bcd.westus2.azurecontainerapps.io/api/v1/run/6c9b582f-d64a-44de-add3-b075a051dccc"
    
    payload = {
        "output_type": "chat",
        "input_type": "chat",
        "input_value": full_input,
        "session_id": str(uuid.uuid4())
    }
    
    headers = {"Content-Type": "application/json"}
    if os.getenv("LANGFLOW_API_KEY"):
        headers["x-api-key"] = os.getenv("LANGFLOW_API_KEY")
    
    response = requests.post(langflow_url, json=payload, headers=headers, timeout=90)
    response.raise_for_status()
    
    result = response.json()
    response_text = extract_langflow_response(result)
    
    return {
        "response": response_text,
        "context_used": "Langflow API with trained context"
    }
```

**Langflow Workflow:**
```yaml
1. Input Node (Chat Input)
   - Receives: Patient context + Question

2. Embedding Node (OpenAI)
   - Model: text-embedding-3-small
   - Dimensions: 1536

3. Vector Store (Pinecone)
   - Index: medicalbooks-1536
   - Medical literature embeddings
   - Similarity: Cosine

4. Retrieval Node
   - Top K: 5
   - Search Type: Similarity

5. Prompt Template
   - System: Clinical decision support AI
   - Context: {retrieved_documents}
   - Patient: {patient_data}
   - Question: {user_question}

6. LLM Node (Groq)
   - Model: llama-3.3-70b-versatile
   - Temperature: 0.7
   - Max Tokens: 800

7. Output Node (Chat Output)
   - Format: Markdown
```

**Example Response:**
```markdown
# Treatment Recommendation for John Doe

## Current Assessment
- HbA1c: 8.5% → 7.8% (improving but above target)
- Current regimen: Basal-Bolus (Glargine + Lispro)
- Good adherence, no hypoglycemia reported

## Recommended Adjustments
1. **Increase basal insulin**: Glargine 20U → 24U at bedtime
2. **Optimize bolus timing**: Administer 15 min before meals
3. **Consider GLP-1 RA**: Add semaglutide 0.25mg weekly

## Clinical Rationale
Based on ADA guidelines, patients with HbA1c >7.5% on basal-bolus
therapy benefit from intensification. The gradual improvement suggests
good response to current regimen, warranting modest dose increase.

## Monitoring Plan
- Check fasting glucose daily for 1 week
- Follow-up HbA1c in 3 months
- Monitor for hypoglycemia

## Expected Outcomes
- Target HbA1c: 6.5-7.0% in 3 months
- Improved fasting glucose control
- Maintained quality of life
```

**Frontend Component:** `src/features/patients/TreatmentRecommendation.jsx`

**External Services:**
- **Langflow**: RAG orchestration platform
- **Pinecone**: Vector database (medical literature)
- **OpenAI**: Embeddings (text-embedding-3-small)
- **Groq**: LLM inference (llama-3.3-70b-versatile)

---

### Visual Presentation Guide (Images for Slides)

#### Slide Layout: Treatment Recommendation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│            TREATMENT RECOMMENDATION WORKFLOW                             │
│        RAG-Powered Clinical Decision Support System                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 1: DOCTOR INITIATES RECOMMENDATION REQUEST                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Screenshot: Patient profile with recommendation button]        │   │
│  │                                                                  │   │
│  │  Patient: John Doe, Age 45                                      │   │
│  │  Current HbA1c: 7.8% (improving from 8.5%)                     │   │
│  │  Current Regimen: Basal-Bolus Insulin                          │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────┐            │   │
│  │  │  [Get Treatment Recommendation] ← Click        │            │   │
│  │  └────────────────────────────────────────────────┘            │   │
│  │                                                                  │   │
│  │  Modal opens:                                                   │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │ Enter your question:                                   │    │   │
│  │  │ ┌────────────────────────────────────────────────┐    │    │   │
│  │  │ │ What insulin regimen adjustments should I      │    │    │   │
│  │  │ │ consider for this patient?                     │    │    │   │
│  │  │ └────────────────────────────────────────────────┘    │    │   │
│  │  │                                                        │    │   │
│  │  │ [Generate Recommendation]                              │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "Doctor enters clinical question for AI recommendation"       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 2: PATIENT CONTEXT PREPARATION                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Diagram: Patient data extraction]                               │   │
│  │                                                                  │   │
│  │  System gathers comprehensive patient context:                  │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │ Demographics:                                           │    │   │
│  │  │ • Name: John Doe                                       │    │   │
│  │  │ • Age: 45 years                                        │    │   │
│  │  │ • Gender: Male                                         │    │   │
│  │  │                                                         │    │   │
│  │  │ Clinical Metrics:                                       │    │   │
│  │  │ • HbA1c Visit 1: 8.5%                                 │    │   │
│  │  │ • HbA1c Visit 2: 7.8%                                 │    │   │
│  │  │ • HbA1c Visit 3: 7.2% (predicted)                     │    │   │
│  │  │ • FVG: 145 → 130 → 120 mg/dL                          │    │   │
│  │  │ • BMI: 28.5                                            │    │   │
│  │  │                                                         │    │   │
│  │  │ Treatment History:                                      │    │   │
│  │  │ • Current Regimen: Basal-Bolus Insulin                 │    │   │
│  │  │ • Medications: Metformin, Insulin Glargine             │    │   │
│  │  │ • Medical History: Type 2 Diabetes (5 years)           │    │   │
│  │  │                                                         │    │   │
│  │  │ Recent Assessments:                                     │    │   │
│  │  │ • Risk Score: 7.2% (Risky)                            │    │   │
│  │  │ • Therapy Effectiveness: 0.72 (Effective)              │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "Frontend compiles complete patient context"                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 3: API REQUEST TO FASTAPI                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Screenshot: DevTools showing request]                           │   │
│  │                                                                  │   │
│  │  POST /treatment-recommendation                                 │   │
│  │  {                                                               │   │
│  │    "patient": {                                                 │   │
│  │      "name": "John Doe",                                        │   │
│  │      "age": 45,                                                 │   │
│  │      "hba1c_1st_visit": 8.5,                                   │   │
│  │      "hba1c_2nd_visit": 7.8,                                   │   │
│  │      "insulin_regimen_type": "Basal-Bolus",                    │   │
│  │      "medications": "Metformin, Insulin Glargine",             │   │
│  │      "medical_history": "Type 2 Diabetes",                     │   │
│  │      ...                                                        │   │
│  │    },                                                            │   │
│  │    "question": "What insulin regimen adjustments should I       │   │
│  │                 consider for this patient?"                     │   │
│  │  }                                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "Request sent to FastAPI with patient data + question"        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 4: FASTAPI TO LANGFLOW HANDOFF                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Diagram: FastAPI processing]                                    │   │
│  │                                                                  │   │
│  │  FastAPI combines question + patient data:                      │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │ What insulin regimen adjustments should I consider?    │    │   │
│  │  │                                                         │    │   │
│  │  │ Patient Data:                                           │    │   │
│  │  │ name: John Doe                                         │    │   │
│  │  │ age: 45                                                │    │   │
│  │  │ hba1c_1st_visit: 8.5                                  │    │   │
│  │  │ hba1c_2nd_visit: 7.8                                  │    │   │
│  │  │ insulin_regimen_type: Basal-Bolus                     │    │   │
│  │  │ medications: Metformin, Insulin Glargine              │    │   │
│  │  │ ...                                                    │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                          ↓                                       │   │
│  │  POST to Langflow API:                                          │   │
│  │  https://host-langflow.delightfulflower-50ef0bcd...            │   │
│  │  {                                                               │   │
│  │    "input_value": "[combined text above]",                      │   │
│  │    "session_id": "uuid-12345",                                  │   │
│  │    "output_type": "chat"                                        │   │
│  │  }                                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "FastAPI forwards formatted query to Langflow"                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 5: LANGFLOW RAG PIPELINE - STEP 1: EMBEDDING                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Diagram: OpenAI Embedding Process]                              │   │
│  │                                                                  │   │
│  │  Query Text:                                                     │   │
│  │  "insulin regimen adjustments basal-bolus HbA1c 8.5 to 7.8"    │   │
│  │                                                                  │   │
│  │                          ↓                                       │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │         OpenAI API                                     │    │   │
│  │  │    text-embedding-3-small                              │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                          ↓                                       │   │
│  │  1536-dimensional vector:                                       │   │
│  │  [0.023, -0.145, 0.089, 0.234, -0.067, 0.156, ...]            │   │
│  │                                                                  │   │
│  │  Semantic meaning captured in vector space                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "Query converted to semantic embedding vector"                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 6: LANGFLOW RAG PIPELINE - STEP 2: VECTOR SEARCH                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Diagram: Pinecone Vector Search]                                │   │
│  │                                                                  │   │
│  │  Query Vector → Pinecone Index: "medicalbooks-1536"            │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │        Pinecone Vector Database                        │    │   │
│  │  │                                                         │    │   │
│  │  │  📚 Medical Literature Embeddings                      │    │   │
│  │  │  • Diabetes Management Guidelines                      │    │   │
│  │  │  • Insulin Therapy Protocols                           │    │   │
│  │  │  • HbA1c Target Research                               │    │   │
│  │  │  • Treatment Algorithms                                │    │   │
│  │  │  • Clinical Best Practices                             │    │   │
│  │  │                                                         │    │   │
│  │  │  Cosine Similarity Search → Top 5 Results              │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                          ↓                                       │   │
│  │  Retrieved Documents:                                           │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │ 1. "Insulin Intensification Strategies" (0.92)         │    │   │
│  │  │ 2. "Basal-Bolus Therapy Optimization" (0.89)           │    │   │
│  │  │ 3. "HbA1c Target Achievement Guidelines" (0.87)        │    │   │
│  │  │ 4. "Insulin Dose Adjustment Protocols" (0.85)          │    │   │
│  │  │ 5. "Type 2 Diabetes Treatment Algorithms" (0.83)       │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "Most relevant medical literature retrieved from vector DB"   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 7: LANGFLOW RAG PIPELINE - STEP 3: CONTEXT ASSEMBLY               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Diagram: Prompt Construction]                                   │   │
│  │                                                                  │   │
│  │  Assembled Context for LLM:                                     │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │ System: You are a clinical decision support AI         │    │   │
│  │  │                                                         │    │   │
│  │  │ Patient Context:                                        │    │   │
│  │  │ • 45-year-old male with Type 2 Diabetes                │    │   │
│  │  │ • HbA1c: 8.5% → 7.8% (improving)                       │    │   │
│  │  │ • Current: Basal-Bolus + Metformin                     │    │   │
│  │  │                                                         │    │   │
│  │  │ Retrieved Medical Literature:                           │    │   │
│  │  │ [Document 1: Insulin Intensification...]               │    │   │
│  │  │ [Document 2: Basal-Bolus Optimization...]              │    │   │
│  │  │ [Document 3: HbA1c Guidelines...]                      │    │   │
│  │  │ [Document 4: Dose Adjustment...]                       │    │   │
│  │  │ [Document 5: Treatment Algorithms...]                  │    │   │
│  │  │                                                         │    │   │
│  │  │ Question: What insulin regimen adjustments should      │    │   │
│  │  │           I consider for this patient?                 │    │   │
│  │  │                                                         │    │   │
│  │  │ Instructions: Provide evidence-based recommendation    │    │   │
│  │  │ with specific dosing, rationale, and monitoring plan.  │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "Complete context assembled for LLM generation"               │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 8: LANGFLOW RAG PIPELINE - STEP 4: LLM GENERATION                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Diagram: Groq LLM Processing]                                   │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │         Groq API                                       │    │   │
│  │  │    llama-3.3-70b-versatile                             │    │   │
│  │  │                                                         │    │   │
│  │  │  Temperature: 0.7                                      │    │   │
│  │  │  Max Tokens: 800                                       │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                          ↓                                       │   │
│  │  LLM generates structured recommendation:                       │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │ # Treatment Recommendation for John Doe                │    │   │
│  │  │                                                         │    │   │
│  │  │ ## Current Assessment                                  │    │   │
│  │  │ - HbA1c: 8.5% → 7.8% (improving but above target)     │    │   │
│  │  │ - Current regimen: Basal-Bolus (Glargine + Lispro)    │    │   │
│  │  │ - Good adherence, no hypoglycemia reported            │    │   │
│  │  │                                                         │    │   │
│  │  │ ## Recommended Adjustments                             │    │   │
│  │  │ 1. Increase basal insulin: Glargine 20U → 24U         │    │   │
│  │  │ 2. Optimize bolus timing: 15 min before meals         │    │   │
│  │  │ 3. Consider GLP-1 RA: Semaglutide 0.25mg weekly       │    │   │
│  │  │                                                         │    │   │
│  │  │ ## Clinical Rationale                                  │    │   │
│  │  │ Based on ADA guidelines, patients with HbA1c >7.5%    │    │   │
│  │  │ on basal-bolus therapy benefit from intensification.  │    │   │
│  │  │ The gradual improvement suggests good response...     │    │   │
│  │  │                                                         │    │   │
│  │  │ ## Monitoring Plan                                     │    │   │
│  │  │ - Check fasting glucose daily for 1 week              │    │   │
│  │  │ - Follow-up HbA1c in 3 months                         │    │   │
│  │  │ - Monitor for hypoglycemia                            │    │   │
│  │  │                                                         │    │   │
│  │  │ ## Expected Outcomes                                   │    │   │
│  │  │ - Target HbA1c: 6.5-7.0% in 3 months                  │    │   │
│  │  │ - Improved fasting glucose control                    │    │   │
│  │  │ - Maintained quality of life                          │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "LLM generates evidence-based treatment recommendation"       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  IMAGE 9: RESPONSE DISPLAY IN FRONTEND                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Screenshot: Treatment recommendation modal]                     │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Treatment Recommendation                          [X]    │  │   │
│  │  ├──────────────────────────────────────────────────────────┤  │   │
│  │  │                                                           │  │   │
│  │  │  # Treatment Recommendation for John Doe                 │  │   │
│  │  │                                                           │  │   │
│  │  │  ## Current Assessment                                   │  │   │
│  │  │  • HbA1c: 8.5% → 7.8% (improving but above target)      │  │   │
│  │  │  • Current regimen: Basal-Bolus (Glargine + Lispro)     │  │   │
│  │  │  • Good adherence, no hypoglycemia reported             │  │   │
│  │  │                                                           │  │   │
│  │  │  ## Recommended Adjustments                              │  │   │
│  │  │  1. **Increase basal insulin**: Glargine 20U → 24U      │  │   │
│  │  │  2. **Optimize bolus timing**: 15 min before meals      │  │   │
│  │  │  3. **Consider GLP-1 RA**: Semaglutide 0.25mg weekly    │  │   │
│  │  │                                                           │  │   │
│  │  │  ## Clinical Rationale                                   │  │   │
│  │  │  Based on ADA guidelines, patients with HbA1c >7.5%     │  │   │
│  │  │  on basal-bolus therapy benefit from intensification... │  │   │
│  │  │                                                           │  │   │
│  │  │  [Scrollable content...]                                 │  │   │
│  │  │                                                           │  │   │
│  │  ├──────────────────────────────────────────────────────────┤  │   │
│  │  │  [Copy to Clipboard]  [Add to Notes]  [New Question]    │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Caption: "Doctor reviews AI-generated recommendation with actions"     │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Image Capture Checklist:
- [ ] Screenshot of patient profile with "Get Treatment Recommendation" button
- [ ] Screenshot of question input modal
- [ ] Diagram showing patient context extraction
- [ ] DevTools showing API request to FastAPI
- [ ] Diagram of FastAPI to Langflow handoff
- [ ] Visual of OpenAI embedding process
- [ ] Screenshot/diagram of Pinecone vector search results
- [ ] Diagram showing context assembly for LLM
- [ ] Visual of Groq LLM generation process
- [ ] Screenshot of complete recommendation modal in frontend

---

## ML FEATURES SUMMARY

| Feature | Model Type | Input | Output | Purpose |
|---------|-----------|-------|--------|---------|
| **Risk Prediction** | Lasso Regression | 14 clinical features | HbA1c forecast | Predict future glycemic control |
| **Therapy Effectiveness** | Random Forest | 27 multi-visit features | Effectiveness score + label | Evaluate treatment success |
| **Treatment Recommendation** | RAG (Langflow) | Patient context + Question | Evidence-based recommendation | Clinical decision support |

---

## DATA FLOW SUMMARY (Updated)

### Risk Prediction
```
Frontend → FastAPI → Lasso Model → MySQL Cache → Frontend (Gauge Display)
```

### Therapy Effectiveness
```
Frontend → FastAPI → Random Forest → Effectiveness Calc → Groq LLM → Frontend (Charts + Summary)
```

### Treatment Recommendation
```
Frontend → FastAPI → Langflow → (Pinecone + OpenAI + Groq) → FastAPI → Frontend (Markdown Report)
```
