# Upload File Onboarding Company Documents

API Documentation

This API handles upload file on process onboarding upload company document. Need Authorization Header

## API Endpoint

```
POST /upload-file
```

## cURL Example

```bash
curl -X 'POST' \
  'http://127.0.0.1:3000/upload-file' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiY3JlYXRlZEF0IjoiMjAyNS0wNS0wMlQwMDoxNjoxMS4wNzhaIiwiaWF0IjoxNzQ2MTQ0OTcxLCJleHAiOjM0OTIyOTk5NDJ9.3oRxDMNGnQZ6rL7iwfOpIrMF-r7V0cARmbM2HVRwWZU' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@download.png;type=image/png'
```
