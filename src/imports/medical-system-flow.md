1️⃣ AUTHENTICATION FLOW
🔐 A. Login Page

Komponen:

Logo sistem

Email input

Password input

Show/Hide password

Remember me

Login button

“Forgot password?”

Error alert (invalid login)

Info: “5 attempts = account locked”

🔐 B. Register Page (Admin Only)

Full name

Email

Role dropdown (Admin / Doctor / Nurse)

Password

Confirm password

Create account button

🔐 C. Account Locked Page

Warning icon

“Account locked due to suspicious activity”

Contact admin button

2️⃣ DASHBOARD (ROLE BASED)

Setelah login → beda tampilan berdasarkan role.

👨‍⚕️ DOCTOR DASHBOARD
Komponen:

Sidebar:

Dashboard

Patients

Add Medical Record

Audit Log

Profile

Logout

Main panel:

Total patients

Recent records

Last login info

Security status badge (Secure / Warning)

👩‍⚕️ NURSE DASHBOARD

Sidebar:

Dashboard

Patients

Input Vital Sign

Profile

Logout

Main:

Assigned patients

Recent activity

👨‍💼 ADMIN DASHBOARD

Sidebar:

Dashboard

User Management

Patient Records

Audit Logs

System Monitoring

Security Events

Logout

Main:

Total users

Active sessions

Failed login today

System health indicator

3️⃣ PATIENT MANAGEMENT
📋 A. Patient List Page

Table:

Patient ID

Name

Date of birth

Last visit

View button

Edit button (Doctor only)

Search bar
Filter by date
Add patient button

📄 B. Patient Detail Page

Sections:

🔹 Patient Information

Name

DOB

Gender

Blood type

Contact info

🔹 Medical History

Table:

Date

Diagnosis

Doctor

Blockchain status (Verified ✔)

🔹 Add Record Button (Doctor only)
4️⃣ ADD / EDIT MEDICAL RECORD PAGE

Form:

Diagnosis (textarea)

Symptoms

Prescription

Upload lab result (PDF)

Save button

After save:

Notification: “Record hashed to blockchain”

Show hash ID

Timestamp

Blockchain verification badge

5️⃣ AUDIT LOG PAGE (ADMIN)

Table:

Timestamp

User

Action

IP Address

Blockchain hash

Status (Valid / Tampered)

Filter:

By user

By date

By action type

6️⃣ SECURITY EVENTS PAGE

Card-based UI:

Failed login attempts

Suspicious IP

Account lock events

Rate limit triggered

Each event:

Timestamp

User

IP

Action taken

7️⃣ SYSTEM MONITORING PAGE

Grafana-style layout:

Panels:

CPU usage

Memory usage

API response time

Failed login graph

DB query time

Container status

8️⃣ PROFILE PAGE

Name

Email

Role

Last login

Change password

Enable 2FA toggle

9️⃣ ERROR PAGES
403 Forbidden

“Access Denied”

Back to dashboard button

500 Internal Server Error

Error ID

Contact support

🔟 BLOCKCHAIN VERIFICATION PAGE

Input:

Record ID

Output:

DB hash

Blockchain hash

Status:

✔ Integrity verified

❌ Data tampered

🎨 DESIGN STYLE SUGGESTION

Untuk kesan “secure medical system”:

Warna utama: Navy / Dark Blue

Accent: Teal / Green

Security indicator:

Hijau = Secure

Kuning = Warning

Merah = Critical

Font clean & profesional.