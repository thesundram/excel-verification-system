# Verification System 🚀

A modern, comprehensive, and premium web-based platform for batch verification. It allows users to upload Excel data, scan QR codes, perform manual entries, and track verification progress in real-time. Built with a stunning glassmorphism UI, this tool ensures rapid, accurate, and seamless workflow verification.

---

## ✨ Key Features

### 1. **Data Initialization (Upload)**
- **Drag & Drop Upload:** Easily upload Excel files (.xlsx, .xls).
- **Real-Time Data Parsing:** Instantly parses and stores Excel data securely in the browser's memory.
- **Premium Data Preview:** View uploaded data in a fully responsive, searchable, and scrollable table with custom premium scrollbars.

### 2. **Authentication (Verification)**
- **Split-Screen Workflow:** Left side displays the searchable Excel matrix; right side houses the scanner.
- **QR Code Scanning:** Live camera feed to scan and verify delimited, JSON, or alphanumeric QR codes.
- **Smart Manual Fast Entry:** Fallback manual entry with **Soft Matching**. (e.g., typing `1` automatically matches `01` or `001` in the Excel sheet).
- **Instant Visual Feedback:** Recognized rows are highlighted in an emerald-green premium glow with success sounds/toasts.

### 3. **Project Overview (Dashboard)**
- **Live Metrics:** Track Total Items, Verified, and Pending rows via interactive, glowing metric cards.
- **Searchable Recent Activity:** A dedicated, scrollable activity feed that records all manual and QR scans. Search by Batch No., S.No, or scan type.
- **Data Export:** Download the fully updated verification list as a CSV file to save your progress.

---

## 🎨 Design & UX 

- **Premium Aesthetics:** Built using modern UI trends including **Glassmorphism**, smooth gradients, hover-scale micro-animations, and glowing elements.
- **Fully Responsive:** Beautifully adapts to laptops, tablets, and mobile screens. Elements gracefully stack and shrink without compromising the premium feel.
- **System Monitoring:** A live animated clock and system engine monitoring indicator in the header.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (with custom CSS variables for scrollbars & animations)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Handling**: `xlsx` library for robust Excel parsing
- **State Management**: React Context API (In-memory, clears on session end for security)

---

## ⚙️ How It Works (Data Flow)

1. **Upload:** Excel File `->` Parsed by `xlsx` `->` Stored in Global Context.
2. **Verify:** QR Scanned / Manually Entered `->` Batch No & S.No Matching (ignores leading zeroes) `->` Row Marked Verified.
3. **Monitor:** Dashboard reads Context `->` Calculates Metrics `->` Updates Activity Feed.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and a package manager (pnpm/npm/yarn) installed.

### Installation & Running

```bash
# 1. Clone the repository
git clone <your-repo-url>

# 2. Install dependencies (Using pnpm is recommended)
pnpm install

# 3. Start the development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Future Enhancements
- [ ] Database integration for permanent historical records.
- [ ] User authentication and session persistence.
- [ ] Multi-language support.
- [ ] Advanced Barcode Support (Code128, EAN-13).

---

## 🛡️ Security & Privacy
- **Client-Side Only:** No data is transmitted to external servers. Your Excel data remains 100% locally in your browser and is cleared when the tab is closed.

---

## 👨‍💻 Author & Support

Designed & Developed by **Sundram Pandey**  
**Uttam Innovative Solution Pvt. Ltd.**

For support, inquiries, or customized features, please contact Uttam Innovative Solution Pvt. Ltd.

---
*Version: 1.0.0 | Last Updated: March 2026*
