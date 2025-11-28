# Expense Analysis - Frontend-Only Application

[![Build and Deploy](https://github.com/[username]/[repository]/actions/workflows/deploy.yml/badge.svg)](https://github.com/[username]/[repository]/actions/workflows/deploy.yml)

> **100% Client-Side** • Privacy-First • No Backend Required • Auto-Deployed via GitHub Actions

## 🎉 What's New?

This application now runs **entirely in your browser** without requiring any backend server! All data processing, analytics, and storage happens locally on your device.

## ✨ Features

### 📊 Analytics Dashboard
- **Total Income & Expenses**: Comprehensive overview of your finances
- **Savings Rate**: Track how much you're saving
- **Category Breakdown**: Visualize spending by category
- **Payment Methods**: Analyze which payment methods you use
- **Monthly & Weekly Trends**: See spending patterns over time
- **Budget Tracking**: Monitor budgets with visual progress bars
- **Top Expenses**: Identify your largest transactions
- **Recurring Expenses**: Automatically detect repeating costs

### 📖 Passbook
- View all transactions in a detailed list
- **Advanced Filtering**:
  - By type (Income/Expense)
  - By category
  - By payment method
  - By date range
  - By search term
- **Sorting**: Sort by date, amount, or category
- **Pagination**: Easy navigation through large datasets

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile
- **Drag & Drop Upload**: Easy file upload interface
- **Data Persistence**: Your data is saved automatically
- **Privacy First**: Data never leaves your browser

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- A modern web browser

### Installation

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at http://localhost:5173

### Using the Application

1. **Upload Your Data**
   - Drag and drop your expense backup ZIP file
   - Or click to browse and select the file

2. **View Analytics**
   - Dashboard automatically displays after upload
   - See comprehensive charts and statistics

3. **Browse Transactions**
   - Click "Passbook" tab to view all transactions
   - Use filters to find specific transactions

4. **Data Management**
   - Your data is automatically saved to browser storage
   - Click "Clear Data" to remove all stored information

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 🌐 Deployment

### Automatic Deployment (GitHub Actions)

This repository includes automatic deployment to GitHub Pages:

1. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: **GitHub Actions**
   
2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Your site will be live at**: 
   - `https://[username].github.io/[repository-name]/`

See [GITHUB_PAGES_SETUP.md](../GITHUB_PAGES_SETUP.md) for detailed setup instructions.

### Manual Deployment Options

#### Netlify
```bash
npm run build
# Drag and drop dist folder to Netlify dashboard
```

#### Vercel
```bash
npm run build
vercel --prod
```

#### AWS S3
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name/
```

## 🛠 Technology Stack

- **React 19.2**: UI framework
- **Vite**: Build tool and dev server
- **JSZip**: ZIP file processing
- **PapaParse**: CSV parsing
- **Recharts**: Data visualization
- **Lucide React**: Icons

## 🔒 Privacy & Security

- ✅ **100% Local Processing**: All data stays in your browser
- ✅ **No Server Required**: No backend, no database
- ✅ **No Analytics Tracking**: No third-party trackers
- ✅ **No Data Transmission**: Your data never leaves your device
- ✅ **localStorage**: Data persists between sessions

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.jsx  # Analytics dashboard
│   │   ├── Passbook.jsx   # Transaction list
│   │   └── UploadZone.jsx # File upload
│   ├── context/          # State management
│   │   └── DataContext.jsx
│   ├── services/         # Business logic
│   │   ├── dataParser.js      # ZIP/CSV parsing
│   │   └── analyticsService.js # Analytics calculations
│   ├── App.jsx           # Main app
│   └── main.jsx          # Entry point
├── package.json
├── vite.config.js
├── ARCHITECTURE.md       # Detailed architecture docs
└── README.md            # This file
```

## 🎯 Key Benefits

| Benefit | Description |
|---------|-------------|
| **Privacy** | Your financial data never leaves your browser |
| **Speed** | Instant calculations, no API latency |
| **Cost** | Free hosting on static platforms |
| **Offline** | Works without internet after initial load |
| **Simple** | No server setup or maintenance |

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Detailed technical architecture
- **[../MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)**: Migration from backend to frontend-only

## ⚠️ Limitations

- **Storage**: ~5-10MB localStorage limit (browser-dependent)
- **Single Device**: Data is local to your browser/device
- **No Sync**: No automatic cross-device synchronization
- **Browser Data**: Clearing browser data removes stored information

## 🔮 Future Enhancements

Possible additions while maintaining frontend-only architecture:
- [ ] Export data to CSV/JSON
- [ ] Import from multiple file formats
- [ ] IndexedDB for larger storage capacity
- [ ] Progressive Web App (PWA)
- [ ] Service Worker for offline support
- [ ] Data encryption in localStorage
- [ ] Multiple profile support

## 🐛 Troubleshooting

### Application not starting?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Data not loading?
1. Check browser console for errors
2. Verify ZIP file format
3. Clear browser cache and localStorage
4. Try re-uploading the file

### Charts not displaying?
1. Ensure all packages are installed
2. Check that data exists
3. Verify browser compatibility

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 💡 Tips

- **Keep Backup Files**: Store your backup ZIP files safely
- **Regular Exports**: Periodically back up your browser data
- **Use HTTPS**: Always access via HTTPS when deployed
- **Modern Browser**: Use the latest browser version for best experience

---

**Status**: ✅ Production Ready  
**Backend Required**: ❌ No  
**Privacy Level**: 🔒 100% Local

Made with ❤️ using React + Vite
