# ColdEmail.AI API Documentation

## Authentication

All API routes (except webhooks) require Clerk authentication. Include the session token in requests.

### Headers
```
Authorization: Bearer <clerk_session_token>
Content-Type: application/json
```

---

## Endpoints

### Authentication

#### GET `/api/auth/user`
Get current user information.

**Response:**
```json
{
  "id": "uuid",
  "clerkId": "user_xxx",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "plan": "free",
  "subscriptionStatus": "active"
}
```

---

### Campaigns

#### GET `/api/campaigns`
List all campaigns for the current user.

**Query Parameters:**
- `status` (optional): Filter by status (draft, active, completed, etc.)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "name": "Q4 Outreach",
      "status": "active",
      "totalLeads": 50,
      "sentCount": 25,
      "openedCount": 10,
      "repliedCount": 3,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

#### POST `/api/campaigns`
Create a new campaign.

**Request Body:**
```json
{
  "name": "Campaign Name",
  "tone": "professional",
  "leads": [
    {
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp",
      "title": "CEO"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Campaign Name",
  "status": "draft",
  "totalLeads": 1
}
```

#### GET `/api/campaigns/:id`
Get campaign details.

**Response:**
```json
{
  "id": "uuid",
  "name": "Campaign Name",
  "status": "active",
  "tone": "professional",
  "totalLeads": 50,
  "sentCount": 25,
  "openedCount": 10,
  "clickedCount": 5,
  "repliedCount": 3,
  "leads": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp",
      "status": "sent"
    }
  ]
}
```

#### PUT `/api/campaigns/:id`
Update campaign.

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "paused"
}
```

#### DELETE `/api/campaigns/:id`
Delete campaign.

---

### Campaign Actions

#### POST `/api/campaigns/:id/preview`
Generate AI preview for a campaign.

**Request Body:**
```json
{
  "leadId": "uuid",
  "tone": "professional"
}
```

**Response:**
```json
{
  "subjects": [
    "Quick question about Acme Corp's growth",
    "Helping Acme Corp scale faster",
    "Thought this might interest you, John"
  ],
  "body": "Hi John,\n\nI noticed Acme Corp...",
  "followUps": [
    {
      "sequence": 1,
      "body": "Hi John,\n\nJust following up..."
    }
  ]
}
```

#### POST `/api/campaigns/:id/schedule`
Schedule campaign for sending.

**Request Body:**
```json
{
  "scheduledAt": "2024-01-15T10:00:00Z",
  "dailyLimit": 50
}
```

#### POST `/api/campaigns/:id/test`
Send test email to verify setup.

**Request Body:**
```json
{
  "testEmail": "test@example.com",
  "leadId": "uuid"
}
```

---

### Email Sending

#### POST `/api/send`
Worker endpoint to send individual email (internal use).

**Request Body:**
```json
{
  "messageId": "uuid",
  "leadId": "uuid",
  "campaignId": "uuid"
}
```

---

### Webhooks

#### POST `/api/webhooks/sendgrid`
Receive SendGrid events.

**Request Body:** SendGrid Event Webhook format

**Events Handled:**
- delivered
- open
- click
- bounce
- spam_report

---

### Billing

#### GET `/api/billing`
Get user's subscription and billing info.

**Response:**
```json
{
  "plan": "pro",
  "status": "active",
  "nextBillingDate": "2024-02-01",
  "cancelAtPeriodEnd": false
}
```

#### POST `/api/billing/upgrade`
Upgrade to Pro plan (handled by Clerk).

---

### Usage

#### GET `/api/usage`
Get current month's usage.

**Response:**
```json
{
  "plan": "free",
  "emailsGenerated": 15,
  "emailsSent": 15,
  "limit": 25,
  "remaining": 10,
  "resetDate": "2024-02-01"
}
```

---

### Settings

#### GET `/api/settings`
Get user settings.

**Response:**
```json
{
  "gmailConnected": true,
  "gmailEmail": "user@gmail.com",
  "sendgridEnabled": false,
  "aiProvider": "openai",
  "defaultTone": "professional",
  "dailySendLimit": 50,
  "followUpCadence": 3
}
```

#### PUT `/api/settings`
Update user settings.

**Request Body:**
```json
{
  "defaultTone": "casual",
  "dailySendLimit": 100
}
```

---

### Gmail OAuth

#### GET `/api/auth/gmail`
Initiate Gmail OAuth flow.

**Response:** Redirects to Google OAuth consent screen.

#### GET `/api/auth/gmail/callback`
OAuth callback endpoint.

**Query Parameters:**
- `code`: Authorization code from Google

#### POST `/api/auth/gmail/disconnect`
Disconnect Gmail account.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `QUOTA_EXCEEDED`: Usage limit reached
- `VALIDATION_ERROR`: Invalid input
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- **Free Plan:** 25 AI-generated emails per month
- **Pro Plan:** Unlimited (fair use: 10,000/month)
- **API Requests:** 100 requests per minute per user

---

## Webhooks

### SendGrid Event Webhook

Configure SendGrid to POST events to:
```
https://your-app.vercel.app/api/webhooks/sendgrid
```

Verify webhook signature for security.

---

## Testing

Use provided test endpoints in development:

```bash
# Get user info
curl -H "Authorization: Bearer <token>" \
  https://localhost:3000/api/auth/user

# Create test campaign
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","tone":"professional","leads":[]}' \
  https://localhost:3000/api/campaigns
```
