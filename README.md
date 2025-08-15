# NithShop - Management System for Shops, Booths, and Canteens

A comprehensive web-based management system built with React.js, Node.js, Express, and MySQL using Sequelize ORM.

## 🏗️ Project Structure

```
nithshop/
├── server/                 # Backend server
│   ├── controllers/        # Business logic controllers
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── occupantController.js
│   │   ├── documentController.js
│   │   └── notificationController.js
│   ├── models/            # Sequelize models
│   │   ├── index.js       # Database connection & associations
│   │   ├── Property.js
│   │   ├── Occupant.js
│   │   ├── Document.js
│   │   ├── Notification.js
│   │   └── AdminUser.js
│   ├── routes/            # API route definitions
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── occupant.js
│   │   ├── documents.js
│   │   └── notifications.js
│   ├── middleware/        # Authentication & authorization
│   │   └── auth.js
│   ├── uploads/           # File uploads directory
│   ├── index.js           # Main server file
│   ├── package.json
│   └── env.example
├── client/                # Frontend React application
├── package.json           # Root package.json
└── README.md
```

## 🚀 Features

### Admin Features

- **Dashboard**: Overview of properties, occupants, and notifications
- **Property Management**: Add/update shops, booths, and canteens
- **Occupant Management**: Create and manage occupant accounts
- **Document Management**: Upload agreements, allotment letters
- **Notification System**: Send individual and broadcast notifications with PDF attachments
- **Password Management**: Generate and regenerate temporary passwords

### Occupant Features

- **Dashboard**: Property information and recent activities
- **Document Access**: View agreements and allotment letters
- **Receipt Upload**: Upload monthly payment receipts (PDF only)
- **Notifications**: Receive and manage admin notifications
- **Password Change**: Change temporary password on first login

## 🛠️ Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for MySQL
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Frontend (Coming Soon)

- **React.js** - UI library
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nithshop
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Database Setup**

   - Create a MySQL database named `nithshop_db`
   - Copy `server/env.example` to `server/.env`
   - Update database credentials in `.env`

4. **Environment Configuration**

   ```bash
   cd server
   cp env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the application**

   ```bash
   # Development mode (both frontend and backend)
   npm run dev

   # Backend only
   npm run server

   # Frontend only
   npm run client
   ```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/occupant/login` - Occupant login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify token

### Admin Routes

- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/properties/:type` - Get properties by type
- `POST /api/admin/properties` - Add new property
- `PUT /api/admin/properties/:id/occupant` - Update occupant
- `POST /api/admin/properties/:id/regenerate-password` - Regenerate password
- `GET /api/admin/properties/:id` - Get property details

### Document Management

- `POST /api/documents/upload-admin` - Upload admin documents
- `POST /api/documents/upload-receipt` - Upload receipt (occupant)
- `GET /api/documents/property/:id` - Get property documents
- `GET /api/documents/my-documents` - Get occupant documents
- `GET /api/documents/download/:id` - Download document
- `DELETE /api/documents/:id` - Delete document (admin)

### Notifications

- `POST /api/notifications/send-individual` - Send individual notification
- `POST /api/notifications/send-broadcast` - Send broadcast notification
- `POST /api/notifications/send-with-attachment` - Send notification with PDF
- `GET /api/notifications/property/:id` - Get property notifications
- `GET /api/notifications/my-notifications` - Get occupant notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `GET /api/notifications/:id/attachment` - Download attachment

### Occupant Routes

- `GET /api/occupant/dashboard` - Occupant dashboard
- `GET /api/occupant/documents` - Get occupant documents
- `GET /api/occupant/notifications` - Get occupant notifications
- `GET /api/occupant/property` - Get property info
- `GET /api/occupant/receipts` - Get receipt history

## 🔐 Authentication

The system uses JWT tokens for authentication:

- **Admin Login**: Email + Password
- **Occupant Login**: Property Code + Email + Password
- **Token Expiry**: 24 hours (configurable)
- **Password Policy**: Minimum 6 characters
- **First Login**: Occupants must change temporary password

## 📁 File Uploads

- **Supported Format**: PDF only
- **Max File Size**: 10MB (configurable)
- **Upload Paths**:
  - Documents: `./uploads/documents/`
  - Notifications: `./uploads/notifications/`

## 🗄️ Database Schema

### Tables

- **properties** - Shop, booth, and canteen information
- **occupants** - Property occupants and their details
- **documents** - Agreements, allotment letters, and receipts
- **notifications** - System notifications with optional PDF attachments
- **admin_users** - Admin user accounts

### Key Relationships

- Properties have many Occupants (one active at a time)
- Properties have many Documents
- Occupants have many Documents
- Properties have many Notifications
- Occupants can send/receive Notifications

## 🚨 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Express validator for all inputs
- **File Type Validation** - PDF files only
- **Role-based Access Control** - Admin vs Occupant permissions
- **Rate Limiting** - API request throttling
- **CORS Protection** - Cross-origin request handling

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nithshop_db
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Admin Default
ADMIN_EMAIL=admin@nithshop.com
ADMIN_PASSWORD=admin123
```

## 📝 Development

### Code Structure

- **MVC Pattern**: Models, Views (Routes), Controllers
- **Sequelize ORM**: Database operations and relationships
- **Middleware**: Authentication and validation
- **Error Handling**: Centralized error management

### Adding New Features

1. Create/update models in `server/models/`
2. Add business logic in `server/controllers/`
3. Define routes in `server/routes/`
4. Update middleware if needed
5. Test API endpoints

## 🧪 Testing

```bash
# Test database connection
curl http://localhost:5000/api/health

# Test admin login
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nithshop.com","password":"admin123"}'
```

## 📊 Default Data

The system automatically creates:

- Database tables with proper relationships
- Default admin user (admin@nithshop.com / admin123)
- Upload directories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This is the backend implementation. The React frontend is coming soon and will provide a complete user interface for all the features described above.
