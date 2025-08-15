# NithShop Frontend

React-based frontend for the NithShop Property Management System.

## Features

- **Admin Dashboard**: Complete property management interface
- **Occupant Dashboard**: Property access and document management
- **Authentication**: Secure login for both admin and occupant users
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Updates**: Live data synchronization with backend

## Technology Stack

- React 18
- React Router DOM
- Tailwind CSS
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   └── occupant/       # Occupant-specific components
├── contexts/           # React contexts
├── services/           # API services
└── App.js             # Main application component
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Backend Integration

This frontend connects to the NithShop backend API. Ensure the backend server is running on the configured port before starting the frontend.
