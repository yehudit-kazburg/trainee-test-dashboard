# Trainee Test Dashboard 📊

A comprehensive Angular-based dashboard for managing and monitoring trainee test results with advanced data visualization and analysis capabilities.

## 🌟 Features

### 📋 Data Management
- **Test Results Tracking**: Complete management of trainee test scores and performance data
- **Dynamic Data Loading**: All data is loaded from a centralized JSON API mock service
- **Real-time Updates**: Instant UI updates when data changes
- **Advanced Filtering**: Smart search with multiple criteria (ID, grade ranges, dates, free text)
- **Single Row Selection**: Intuitive row-click selection for better user experience

### 👥 Trainee Management  
- **Add/Edit Trainees**: Full CRUD operations with comprehensive form validation
- **Personal Information**: Name, email, registration date, address details
- **Academic Records**: Subject-wise test results with grade tracking
- **ID Protection**: Read-only ID field in edit mode to prevent accidental changes

### 📊 Analysis & Monitoring
- **Interactive Charts**: Drag-and-drop chart management with multiple visualization types
- **Grade Distribution**: Visual breakdown of performance levels (Excellent/Good/Poor)
- **Performance Trends**: Track improvement/decline patterns over time
- **Subject Analysis**: Compare performance across different subjects
- **Statistical Insights**: Average grades, standard deviation, pass/fail rates

### 🔍 Advanced Search & Filtering
- **Multi-criteria Search**: Filter by student IDs, subjects, grade ranges, and dates
- **Smart Text Search**: Flexible text matching across all fields
- **Real-time Results**: Instant filtering as you type
- **Saved State**: Remembers your filter preferences across sessions

## 🛠️ Technology Stack

- **Framework**: Angular 16+ with Standalone Components
- **UI Library**: Angular Material Design
- **Styling**: SCSS with responsive design
- **Data Management**: RxJS observables with centralized state management
- **Charts**: Interactive data visualization components
- **Drag & Drop**: Angular CDK for chart management
- **Mock API**: JSON-based data simulation with full CRUD operations

## 📁 Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── add-trainee-dialog/
│   │   │   └── trainee-form/
│   │   ├── pages/               # Main application pages
│   │   │   ├── data-page/       # Data management interface
│   │   │   ├── analysis-page/   # Charts and analytics
│   │   │   └── monitor-page/    # Performance monitoring
│   │   ├── services/            # Business logic and API
│   │   │   ├── data.service.ts
│   │   │   ├── mock-api.service.ts
│   │   │   └── state-management.service.ts
│   │   ├── models/              # TypeScript interfaces
│   │   ├── shared/              # Shared components and utilities
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   └── assets/
│   │       └── data/
│   │           └── demo-data.json  # Sample data
│   └── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Angular CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yehudit-kazburg/trainee-test-dashboard.git
   cd trainee-test-dashboard/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Build for Production
```bash
ng build --prod
```

## 📖 Usage Guide

### 🏠 Data Page
The main interface for managing test results:

- **View Results**: Browse all test results in a paginated table
- **Select Records**: Click any row to select and view details
- **Filter Data**: Use the search bar with advanced filtering options
- **Add New**: Click "Add Trainee" to create new records
- **Edit**: Select a row and click "Edit" to modify existing data
- **Delete**: Select a row and click "Delete" to remove records

### 📈 Analysis Page
Interactive data visualization:

- **Drag & Drop Charts**: Organize charts by dragging between visible and hidden sections
- **Filter Data**: Use multi-select filters for IDs and subjects
- **Performance Trends**: View student progress over time
- **Grade Distribution**: See breakdown of performance levels
- **Subject Analysis**: Compare results across different subjects

### 👁️ Monitor Page
Performance monitoring dashboard:

- **Overview Cards**: Quick stats on total students, passed, and failed
- **Performance Table**: Detailed view of each student's progress
- **Trend Analysis**: Track improvement patterns
- **Filter Options**: Search by name, ID, or status

## 🎛️ Configuration

### Data Source
The application uses a mock API that loads data from `src/assets/data/demo-data.json`. You can modify this file to change the sample data or implement a real backend API by updating the services.

### Customization
- **Themes**: Modify SCSS variables for custom styling
- **Data Fields**: Update TypeScript interfaces in `models/data.models.ts`
- **API Endpoints**: Configure real API endpoints in the services
- **Chart Types**: Add new visualization types in the analysis components

## 🔧 Key Features Explained

### Smart Data Management
- **Single Source of Truth**: All data flows through the Mock API service
- **Reactive Updates**: UI automatically updates when data changes
- **State Management**: Centralized state handling with observables
- **Error Handling**: Comprehensive error handling with user feedback

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Intuitive Navigation**: Clear navigation between different sections
- **Visual Feedback**: Loading states, animations, and status indicators
- **Accessibility**: ARIA labels and keyboard navigation support

### Performance
- **Lazy Loading**: Components loaded on demand
- **Efficient Filtering**: Client-side filtering with minimal impact
- **Memory Management**: Proper subscription cleanup and memory management
- **Optimized Rendering**: Change detection optimization

## 🧪 Testing

Run unit tests:
```bash
ng test
```

Run end-to-end tests:
```bash
ng e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Sample Data Structure

The application uses the following data structure:

```json
{
  "subjects": ["Mathematics", "English", "Computer Science", "Physics", "Chemistry", "Biology", "History", "Geography"],
  "trainees": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@email.com",
      "registrationDate": "2024-01-15T00:00:00.000Z",
      "address": "123 Main St",
      "city": "Tel Aviv",
      "country": "Israel",
      "zip": "12345"
    }
  ],
  "testResults": [
    {
      "id": 101,
      "traineeId": 1,
      "traineeName": "John Smith",
      "subject": "Mathematics",
      "grade": 85,
      "testDate": "2024-03-01T00:00:00.000Z"
    }
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   ng serve --port 4201
   ```

2. **Dependencies issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build errors**
   ```bash
   ng build --configuration=development
   ```

## 📧 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the existing documentation
- Review the sample data structure

## 🏆 Acknowledgments

- Angular team for the amazing framework
- Angular Material for the UI components
- RxJS for reactive programming patterns

---

**Made with ❤️ for effective trainee management and data analysis**