#!/bin/bash
# Delete demo patients P001, P002, P003 from backend API
# Backend: http://localhost:5000  | Auth required

echo "Delete demo patients (run with backend running on port 5000)"

# Replace YOUR_JWT_TOKEN with actual token from localStorage or login
TOKEN="YOUR_JWT_TOKEN_HERE"

curl -X DELETE http://localhost:5000/api/patients/P001 \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json"

curl -X DELETE http://localhost:5000/api/patients/P002 \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json"

curl -X DELETE http://localhost:5000/api/patients/P003 \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json"

echo "Demo patients deleted! Refresh /patients page."
