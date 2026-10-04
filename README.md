# SecureField — NCB Drug Test Companion

> **Digital companion for field narcotics testing · Narcotics Control Bureau, Ministry of Home Affairs**

SecureField is a purpose-built field testing application engineered for law enforcement officers and forensic personnel conducting on-site chemical presumptive drug testing. It standardizes protocol compliance, step-by-step reagent testing workflows, photographic evidence capture, tamper-evident batch testing, instant verifiable PDF test certificates, and cryptographically verifiable QR records.

---

## 🚀 Key Features

- **Field Operator Authentication**: Secure operator credentialing and identity session management.
- **Guided Reagent Testing Protocol**: Multi-step visual validation with expected colorimetric reactions for common narcotics (e.g., Marquis, Scott, Duquenois-Levine).
- **Photo Evidence & Geolocation**: In-field photographic capture with timestamp and GPS coordinates.
- **Batch Testing Workflow**: High-throughput multi-sample processing with batch summary analytics.
- **Tamper-Evident PDF Reports**: Instant client-side generation of court-admissible presumptive test reports via `jsPDF`.
- **Verifiable QR Verification**: Embedded high-density QR code on certificates allowing rapid digital verification in the field.
- **Searchable Test Logs & Records**: Local encrypted audit trail and searchable logs of all conducted field tests.
- **Offline-Ready Progressive Web Architecture**: Engineered to operate reliably in low- or zero-connectivity field environments.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Vanilla CSS & Tailwind CSS v4
- **Document Generation**: `jspdf`, `html2canvas`
- **Verification**: `qrcode`
- **Linter & Performance**: `oxlint`

---

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/SecureField.git

# Navigate into project directory
cd SecureField

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

Proprietary / Government Use — Narcotics Control Bureau, Ministry of Home Affairs. All rights reserved.
