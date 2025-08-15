# Admin Account Setup

## Overview

NithShop system does not create default admin accounts automatically. You need to create the first admin account manually using the API endpoint.

## Creating Your First Admin Account

**✅ SECURE**: The admin creation system is now properly protected with a multi-layered security approach.

### Step 1: Get Your System Token

The system token is automatically generated when the server starts and stored in your `.env` file:

```bash
cat .env | grep SYSTEM_TOKEN
```

### Method 1: Using cURL

```bash
curl -X POST http://localhost:4000/api/admin/admins \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nithshop.com",
    "password": "your_secure_password",
    "name": "System Administrator",
    "role": "Super Admin",
    "systemToken": "YOUR_SYSTEM_TOKEN_FROM_ENV"
  }'
```

### Method 2: Using Postman

- **URL**: `POST http://localhost:4000/api/admin/admins`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "email": "admin@nithshop.com",
  "password": "your_secure_password",
  "name": "System Administrator",
  "role": "Super Admin",
  "systemToken": "YOUR_SYSTEM_TOKEN_FROM_ENV"
}
```

### Method 3: Using JavaScript/Fetch

```javascript
fetch("http://localhost:4000/api/admin/admins", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@nithshop.com",
    password: "your_secure_password",
    name: "System Administrator",
    role: "Super Admin",
    systemToken: "YOUR_SYSTEM_TOKEN_FROM_ENV",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## Important Notes

✅ **Security Implemented**: The admin creation endpoint is now properly protected:

1. **First Admin Creation**: Requires system token from `.env` file
2. **Subsequent Admin Creation**: Requires existing admin authentication
3. **System Token**: Automatically generated and stored securely
4. **No Default Credentials**: System starts with no admin accounts

⚠️ **Production Recommendations**:

1. Store system token in secure environment variables
2. Implement IP whitelisting for admin creation
3. Use HTTPS in production
4. Regularly rotate system tokens

## Security Flow

### First Admin Creation

1. **System Token Required**: Must provide valid `systemToken` from `.env`
2. **One-Time Use**: System token only works for the first admin
3. **Secure Generation**: Token is automatically generated on server start

### Subsequent Admin Creation

1. **Authentication Required**: Must be logged in as existing admin
2. **Role Verification**: Only Super Admins can create new admin accounts
3. **Session Validation**: JWT token validation required

## Admin Roles

- **Super Admin**: Full system access, can create other admins
- **Admin**: Standard administrative access, cannot create other admins

## Login After Creation

Once you create an admin account, you can login at:

- **Frontend**: http://localhost:3000/admin/login
- **API**: `POST http://localhost:4000/api/auth/admin/login`

## Testing the System

### Test Admin Creation (First Admin)

```bash
curl -X POST http://localhost:4000/api/admin/admins \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nithshop.com",
    "password": "your_secure_password",
    "name": "System Administrator",
    "role": "Super Admin",
    "systemToken": "YOUR_SYSTEM_TOKEN_FROM_ENV"
  }'
```

### Test Admin Creation (Subsequent Admins)

```bash
# This should fail without authentication
curl -X POST http://localhost:4000/api/admin/admins \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test Admin",
    "role": "Admin"
  }'
```

## Troubleshooting

- Ensure the backend server is running on port 4000
- Check that the database is connected and tables are synchronized
- Verify the email format is valid
- Password must be at least 6 characters long
- **System token is required for first admin creation only**
- **Authentication required for subsequent admin creation**
