# payment_tracker_backend

# Rent and Payment Tracker Backend

A beginner-friendly Node.js backend for managing tenants, units, rent agreements, payments, receipts, and admin email notifications.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Nodemailer
- node-cron
- express-validator

## Project Structure

```text
src/
  app.js
  server.js
  config/
    db.js
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  validators/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update the values.

3. Start MongoDB locally or use a MongoDB Atlas connection string.

4. Run the app in development mode:

```bash
npm run dev
```

5. Test the health route:

```bash
GET /api/v1/health
```

## API Endpoints

### Tenants

- `POST /api/v1/tenants`
- `GET /api/v1/tenants`
- `GET /api/v1/tenants/:id`
- `PUT /api/v1/tenants/:id`
- `DELETE /api/v1/tenants/:id`

### Units

- `POST /api/v1/units`
- `GET /api/v1/units`
- `GET /api/v1/units/:id`
- `PUT /api/v1/units/:id`
- `DELETE /api/v1/units/:id`

### Agreements

- `POST /api/v1/agreements`
- `GET /api/v1/agreements`
- `GET /api/v1/agreements/:id`
- `PUT /api/v1/agreements/:id`
- `DELETE /api/v1/agreements/:id`

### Payments

- `POST /api/v1/payments`
- `GET /api/v1/payments`
- `GET /api/v1/payments/agreement/:agreementId`

## Example Request Bodies

### Create Tenant

```json
{
  "fullName": "Ada Obi",
  "phone": "+2348012345678",
  "email": "ada@example.com",
  "alternateName": "Ada N.",
  "notes": "Prefers email reminders"
}
```

### Create Unit

```json
{
  "name": "Block A - Room 4",
  "category": "1 Bedroom",
  "description": "Ground floor unit with prepaid meter",
  "rentAmount": 250000,
  "status": "available"
}
```

### Create Agreement

```json
{
  "tenant": "TENANT_ID_HERE",
  "unit": "UNIT_ID_HERE",
  "paymentType": "yearly",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "amountDue": 250000,
  "status": "active",
  "reminderSettings": {
    "enabled": true,
    "daysBeforeDue": 5
  }
}
```

### Record Payment

```json
{
  "agreement": "AGREEMENT_ID_HERE",
  "amount": 100000,
  "paymentDate": "2026-04-19",
  "paymentMethod": "bank-transfer",
  "note": "First installment"
}
```

## Notes

- Receipt emails are sent to `ADMIN_EMAIL`.
- If SMTP settings are missing, Nodemailer falls back to a local JSON transport so the app still works for development.
- The reminder cron job is a simple stub for now and runs every day at `08:00`.
- Responses use the format below:

```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {}
}
```
