# Frontend-Only Architecture

## Overview

This application has been refactored to run **entirely in the browser** without requiring a backend server. All data processing, analytics calculations, and storage happen on the client-side.

## Architecture Components

### 1. **Data Parsing Service** (`src/services/dataParser.js`)

Handles ZIP file extraction and CSV parsing:
- Uses **JSZip** to extract files from the uploaded ZIP
- Uses **PapaParse** to parse CSV files
- Processes three main data types:
  - Transactions
  - Budgets
  - Payment Reminders
- Synchronizes budget spent amounts with actual transaction data

### 2. **Analytics Service** (`src/services/analyticsService.js`)

Performs all analytics calculations client-side:
- Total income/expense calculations
- Savings rate analysis
- Category breakdowns
- Payment method analysis
- Monthly and weekly trends
- Top expenses tracking
- Recurring expense detection
- Average spending by category
- Budget tracking and status updates

### 3. **Data Context** (`src/context/DataContext.jsx`)

Centralized state management using React Context:
- Manages application state (transactions, budgets, payment reminders)
- Provides data loading and processing functions
- Handles localStorage persistence
- Exposes analytics data to components
- Provides utility functions (getActiveTransactions, clearData, etc.)

### 4. **Components**

#### UploadZone (`src/components/UploadZone.jsx`)
- Drag-and-drop file upload interface
- Processes ZIP files locally using the data parser
- Updates context with parsed data

#### Dashboard (`src/components/Dashboard.jsx`)
- Displays comprehensive analytics and visualizations
- Consumes data from DataContext
- Shows charts for:
  - Income/Expense/Savings trends
  - Category breakdowns
  - Payment methods
  - Budget tracking
  - Recurring expenses
  - Top expenses

#### Passbook (`src/components/Passbook.jsx`)
- Transaction list with advanced filtering
- Client-side filtering by:
  - Transaction type (Income/Expense)
  - Category
  - Payment method
  - Date range
  - Search term
- Client-side sorting by date, amount, or category
- Pagination

## Data Flow

```
1. User uploads ZIP file
   ↓
2. DataParser extracts and parses CSV files
   ↓
3. Data stored in DataContext (React state)
   ↓
4. Data persisted to localStorage
   ↓
5. AnalyticsService calculates metrics
   ↓
6. Components consume data from context
```

## Data Persistence

- **Storage**: Browser's localStorage
- **Keys used**:
  - `expenseTransactions`: All transaction data
  - `expenseBudgets`: All budget data
  - `expensePaymentReminders`: All payment reminder data
  - `theme`: UI theme preference (dark/light)

- **Auto-save**: Data is automatically saved to localStorage whenever it changes
- **Auto-load**: Data is automatically loaded from localStorage on app startup

## Benefits of This Architecture

### 1. **Privacy & Security**
- Data never leaves the user's browser
- No server-side storage or processing
- No network requests after initial page load

### 2. **Performance**
- No API latency
- Instant calculations and updates
- Smooth user experience

### 3. **Cost & Deployment**
- No backend server required
- Can be hosted on static hosting platforms:
  - GitHub Pages
  - Netlify
  - Vercel
  - AWS S3 + CloudFront
  - Any CDN

### 4. **Scalability**
- No server infrastructure to maintain
- No database to manage
- Scales automatically with CDN

### 5. **Offline Capability**
- Works completely offline after initial load
- Can be converted to a Progressive Web App (PWA)

## Technology Stack

### Core Libraries
- **React 19.2.0**: UI framework
- **Vite 7.2.4**: Build tool and dev server

### Data Processing
- **JSZip 3.10.1**: ZIP file extraction
- **PapaParse 5.4.1**: CSV parsing

### UI & Visualization
- **Recharts 3.5.1**: Charts and graphs
- **Lucide React 0.555.0**: Icons

## File Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx
│   │   ├── Passbook.jsx
│   │   └── UploadZone.jsx
│   ├── context/            # State management
│   │   └── DataContext.jsx
│   ├── services/           # Business logic
│   │   ├── dataParser.js
│   │   └── analyticsService.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── package.json
└── vite.config.js
```

## Development

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
cd frontend
npm install
```

### Running Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

The build output will be in the `dist/` folder, which can be deployed to any static hosting service.

## Usage

1. **Upload Data**: Drag and drop or click to upload your expense backup ZIP file
2. **View Dashboard**: Automatically displays analytics after upload
3. **Browse Passbook**: Switch to Passbook tab to see all transactions with filtering
4. **Data Persistence**: Your data is saved in browser storage and persists across sessions
5. **Clear Data**: Click "Clear Data" button to remove all stored data

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires support for:
- ES6+ JavaScript
- Web Storage API (localStorage)
- File API
- Blob API

## Limitations

1. **Storage Limit**: localStorage has a ~5-10MB limit (varies by browser)
2. **Single Device**: Data is stored locally per browser/device
3. **No Sync**: No automatic sync across devices (can manually export/import)
4. **Browser Dependency**: Clearing browser data will remove stored information

## Future Enhancements

Possible additions while maintaining frontend-only architecture:
- Export data to JSON/CSV
- Import from multiple sources
- IndexedDB for larger storage capacity
- Service Worker for offline support
- Progressive Web App (PWA) features
- Data encryption in localStorage
- Multiple profile support

## Migration from Backend

The previous backend (Spring Boot) is no longer required. All functionality has been migrated:

| Backend Feature | Frontend Equivalent |
|----------------|---------------------|
| DataService | dataParser.js |
| AnalyticsService | analyticsService.js |
| H2 Database | localStorage / React Context |
| REST API Controllers | Direct function calls |
| CSV Parsing (OpenCSV) | PapaParse |
| ZIP Processing (Java) | JSZip |

## Security Notes

- All data processing happens client-side
- No authentication required (single-user app)
- Data is stored in plain text in localStorage
- Consider browser security settings for sensitive data
- Use HTTPS when hosting to prevent MITM attacks

