# Excel Verification System

A comprehensive web-based platform for batch verification through real-time QR code scanning and Excel data matching. Upload Excel files, scan QR codes, and track verification progress with an intuitive three-tab interface.

## Features

### 1. **Upload Excel File Tab**
- Drag-and-drop or click-to-upload Excel files (.xlsx, .xls)
- Real-time file validation and parsing
- Data preview showing first 5 rows with all columns
- Row count display and confirmation messaging
- Automatic storage in memory for seamless tab transitions

### 2. **Verification Tab** 
- **Split-screen layout** for optimal workflow:
  - **Left panel**: Excel data table with real-time status indicators
  - **Right panel**: QR code scanner with manual entry fallback
- **QR Code Scanning**: 
  - Live camera feed with overlay guides
  - Supports multiple QR code formats (delimited or JSON)
  - Manual fallback for typing/pasting QR values
  - Displays last scanned data with timestamp
- **Real-time Matching**:
  - Automatically matches QR code Batch No and Container No against Excel data
  - Extracts S.NO from first 2 digits of Container No
  - Highlights matching rows in green with checkmark indicator
  - Success/error feedback for each scan
  - Live progress counter showing scans completed vs. total rows

### 3. **Dashboard Tab**
- **Summary Metrics**:
  - Total rows in uploaded Excel file
  - Count of verified (green) rows
  - Count of remaining (unverified) rows
- **Progress Visualization**:
  - Visual progress bar with percentage completion
  - Color-coded metric cards (blue for total, green for verified, red for remaining)
  - Summary statistics display
- **Export & Actions**:
  - Export verification results as CSV file
  - Reset all data to start new batch
  - Completion celebration message when all items verified

## Data Flow Architecture

```
1. Upload Tab
   └─> Excel File → Parse → Store in Global State

2. Verification Tab
   ├─> Read Excel Data from State
   ├─> Scan QR Code → Parse & Extract Data
   ├─> Match Batch No & S.NO against Excel
   └─> Mark Row as Verified → Update State

3. Dashboard Tab
   └─> Read Verification State → Calculate & Display Metrics
```

## Technical Stack

- **Framework**: Next.js 16 with React 19
- **State Management**: React Context API with custom hooks
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui components
- **Excel Parsing**: xlsx library
- **Icons**: Lucide React
- **Data Persistence**: In-memory state (persists during session)

## Component Structure

```
├── app/
│   ├── page.tsx              # Root page
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Global styles and theme
├── components/
│   ├── app-container.tsx     # Main app with tabs
│   ├── upload-tab.tsx        # File upload interface
│   ├── verification-tab.tsx  # QR scanning and matching
│   ├── qr-scanner.tsx        # QR scanner component
│   └── dashboard-tab.tsx     # Metrics and analytics
└── lib/
    ├── verification-context.tsx  # Global state
    ├── excel-parser.ts          # Excel file parsing
    └── qr-parser.ts            # QR code parsing
```

## QR Code Format Support

The system supports multiple QR code formats:

1. **Delimited Format**: `BATCH123-CONTAINER001` (supports `-`, `|`, `,`, `:`, `;`)
2. **JSON Format**: `{"batch_no": "BATCH123", "container_no": "CONTAINER001"}`
3. **Alternative JSON**: `{"Batch No": "BATCH123", "Container No": "CONTAINER001"}`

### Example Matching
- Excel row: `Batch no: "ABC123"`, `S.NO: "10"`
- QR scan: `ABC123-1001` (or ABC123|1001, ABC123,1001, etc.)
  - Batch No extracted: `ABC123` ✓ Match
  - S.NO extracted: `10` (first 2 digits of `1001`) ✓ Match
  - **Result**: Row highlighted green

## Color Scheme

The system uses a professional color palette:
- **Primary**: Deep blue (brand color) - for primary actions and highlights
- **Success**: Bright green - for verified rows and successful scans
- **Destructive**: Red - for unverified items and errors
- **Neutral**: Grays - for backgrounds and secondary content
- **Backgrounds**: Clean white/light gray for clarity

## Usage Guide

### Getting Started

1. **Upload Your Data**
   - Navigate to the "Upload" tab
   - Drag-drop or click to select your Excel file
   - Confirm data preview and proceed

2. **Begin Verification**
   - Move to the "Verify" tab
   - Click "Start Scanner" to activate camera
   - Scan QR codes from your items
   - Watch rows turn green as matches are found

3. **Track Progress**
   - Check the "Dashboard" tab anytime
   - View completion percentage and metrics
   - Export results when finished

### Keyboard Navigation
- Use Tab key to navigate between components
- Press Enter to submit manual QR entries
- All buttons and interactive elements are accessible

## State Management

### Global State (VerificationContext)

```typescript
{
  uploadedData: ExcelRow[]        // All parsed rows
  verifiedRowIds: Set<string>     // IDs of verified rows
  lastScannedQR: QRData | null    // Most recent QR scan
  getVerificationStats()          // Calculate metrics
  getRowByBatchAndSNO()          // Find matching row
}
```

## Error Handling

- **Invalid Excel file**: User-friendly error message with file type guidance
- **Camera access denied**: Clear explanation with fallback manual entry option
- **No QR match found**: Displays attempted batch/S.NO for troubleshooting
- **Malformed QR data**: Validates format before attempting match

## Performance Optimizations

- **Virtual scrolling**: For large datasets (1000+ rows)
- **Memoization**: useCallback and useMemo for expensive operations
- **Lazy loading**: QR scanner library loads only when tab is active
- **Efficient state updates**: Only affected components re-render

## Accessibility

- Full keyboard navigation support
- ARIA labels for dynamic content
- Screen reader friendly status messages
- High contrast text colors
- Focus indicators for all interactive elements
- Semantic HTML structure

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires camera access for QR scanning (with manual fallback)

## Future Enhancements

- [ ] Batch upload capability
- [ ] User authentication and session persistence
- [ ] Database storage for historical records
- [ ] Advanced filtering and search in verification table
- [ ] Multi-language support
- [ ] Mobile app native QR scanner integration
- [ ] Barcode format support (Code128, EAN-13, etc.)
- [ ] Webhook notifications on completion
- [ ] Custom validation rules

## Development

### Running Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

## Additional Features

- **Real-time Progress Tracking**: Live updates as verification progresses
- **Multi-format QR Support**: Handles various QR code formats automatically
- **Export Functionality**: Download verification results as CSV
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Recovery**: Robust error handling with user-friendly messages
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance Optimized**: Handles large datasets efficiently

## Security Features

- **Client-side Processing**: All data remains in your browser
- **No Data Transmission**: Files are processed locally for privacy
- **Session-based Storage**: Data cleared when browser session ends
- **Input Validation**: Comprehensive validation of all user inputs

## Troubleshooting

### Common Issues

1. **Excel file not uploading**
   - Ensure file format is .xlsx or .xls
   - Check file size (recommended under 10MB)
   - Verify columns "Batch no" and "S.NO" exist

2. **QR scanner not working**
   - Allow camera permissions in browser
   - Ensure adequate lighting for QR codes
   - Use manual entry as fallback option

3. **No matches found**
   - Verify QR code format matches system expectations
   - Check Excel data for exact batch number matches
   - Ensure S.NO extraction logic aligns with container numbers

## License

© **2026** Designed by **Sundram Pandey** - **Uttam Innovative Solution Pvt. Ltd.**

## Support

For support and inquiries, please contact **Uttam Innovative Solution Pvt. Ltd.**

---

**Version**: 1.0.0  
**Last Updated**: January 2026
