# Bulk Upload Attendees API Documentation

## Overview

The bulk upload endpoint allows administrators to register multiple attendees for an event in a single API call. This is useful for importing attendee lists from spreadsheets or other systems.

## Endpoint

```
POST /attendees/bulk-upload
```

## Authentication

- Requires JWT authentication
- Requires admin role

## Request Body

```json
{
  "eventId": 1,
  "skipDuplicates": true,
  "attendees": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "organization": "ABC Company"
    },
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1234567891",
      "organization": "XYZ Corp"
    }
  ]
}
```

### Parameters

- `eventId` (number, required): The ID of the event to register attendees for
- `skipDuplicates` (boolean, optional): If true, duplicate emails will be skipped instead of causing errors. Default: false
- `attendees` (array, required): Array of attendee objects to register

### Attendee Object Properties

- `firstName` (string, required): First name of the attendee
- `lastName` (string, required): Last name of the attendee
- `email` (string, required): Email address (must be unique per event)
- `phone` (string, optional): Phone number
- `organization` (string, optional): Organization name

## Response

```json
{
  "success": {
    "count": 2,
    "attendees": [
      {
        "id": 123,
        "badgeId": "B12345",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "organization": "ABC Company",
        "eventId": 1,
        "checkedIn": false,
        "checkInTime": null,
        "entrance": null,
        "createdAt": "2025-06-19T10:00:00.000Z",
        "updatedAt": "2025-06-19T10:00:00.000Z"
      }
    ]
  },
  "errors": {
    "count": 0,
    "details": []
  },
  "summary": {
    "totalProcessed": 2,
    "successfulRegistrations": 2,
    "failedRegistrations": 0,
    "duplicatesSkipped": 0
  }
}
```

### Response Fields

- `success.count`: Number of successfully registered attendees
- `success.attendees`: Array of successfully registered attendee objects
- `errors.count`: Number of failed registrations
- `errors.details`: Array of error details for failed registrations
- `summary`: Summary statistics of the bulk upload operation

### Error Details Format

When there are errors, the `errors.details` array contains objects with:

```json
{
  "index": 1,
  "attendee": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com"
  },
  "error": "Email is already registered for this event"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Bulk upload failed"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Event with ID 1 not found"
}
```

## Usage Examples

### Basic Bulk Upload

```bash
curl -X POST http://localhost:3000/attendees/bulk-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "attendees": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "organization": "ABC Company"
      }
    ]
  }'
```

### Bulk Upload with Skip Duplicates

```bash
curl -X POST http://localhost:3000/attendees/bulk-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": 1,
    "skipDuplicates": true,
    "attendees": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com"
      }
    ]
  }'
```

## Features

- **Batch Processing**: Register multiple attendees in a single request
- **Duplicate Handling**: Option to skip or error on duplicate emails
- **Attendee Limit Enforcement**: Respects event attendee limits
- **Badge ID Generation**: Automatically generates unique badge IDs for each attendee
- **Event Counter Updates**: Updates event registration counts
- **Detailed Error Reporting**: Provides specific error information for each failed registration
- **Admin Only**: Restricted to admin users for security

## Best Practices

1. Process attendees in reasonable batch sizes (recommended: 100-500 attendees per request)
2. Use `skipDuplicates: true` when uploading from multiple sources
3. Validate email formats before sending requests
4. Handle partial success scenarios by checking the response summary
5. Implement retry logic for failed individual registrations if needed
