# Changelog

All notable changes to MBTracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-12-11

### Added
- **Enhanced CSV Export**: Added 7 new columns for complete technical report data
  - Nama PIC
  - Analisa Kerusakan
  - Part Bermasalah
  - Metode Perbaikan
  - Estimasi Biaya (Rp) with thousand separator formatting
  - Rekomendasi
  - Kesimpulan
  - Total 21 columns (14 basic + 7 technical report)
  
- **Real Data Backup & Export/Import**:
  - Export function now fetches real data from Supabase (tickets, technical reports, profiles, branches, categories)
  - Import function with validation and confirmation dialog
  - File format: `mobeng-backup-YYYY-MM-DD.json`
  - Informational UI explaining backup location and Supabase automatic backups
  
- **Admin Password Reset**:
  - New edge function `admin-reset-password` for admin-initiated password resets
  - Generate password button in Edit User dialog now actually updates password in Supabase Auth
  - Password confirmation dialog with copy-to-clipboard functionality

### Fixed
- **Logout 404 Error**: 
  - Added SPA routing configuration to `vercel.json`
  - Changed logout navigation from `window.location.href` to `window.location.replace`
  - Direct URL access now works correctly

### Changed
- CSV export toast message now shows count of exported items
- Import data button now shows loading state during import
- Export data function now includes detailed metadata

### Technical
- Created edge function: `supabase/functions/admin-reset-password/index.ts`
- Updated `Settings.tsx` with real Supabase integration for backup/export/import
- Added proper CSV escaping for multi-line text fields
- Improved error handling for all export/import operations

## [1.1.0] - 2025-12-10

### Added
- Role-based access control for ticket and report creation
- Viewer role can only view data, cannot create tickets or reports
- CSV export functionality for tickets with date range filter

### Changed
- Made NIK field optional in user management
- Improved user management search and filter functionality

### Fixed
- Company settings now persist using localStorage
- Ticket list rows are now clickable for better UX

## [1.0.0] - 2025-12-09

### Added
- Initial release of MBTracker
- Complete ticket management system
- Technical report creation and management
- Buku Pintar (Vehicle Database) with AI chatbot
- User management with role-based access
- Dashboard with statistics and charts
- Settings page for company profile and master data

### Features
- **Ticket Management**:
  - Create, read, update tickets
  - Status tracking (Open → In Progress → Resolved → Closed)
  - Priority levels (Low, Medium, High, Critical)
  - Category classification
  - File attachments support
  
- **Technical Reports**:
  - Detailed diagnosis and repair documentation
  - Parts and labor cost calculation
  - Photo uploads
  - PDF export
  
- **Buku Pintar**:
  - Vehicle specifications database
  - Oil, transmission, parts, battery, brakes, suspension, tires data
  - AI chatbot powered by Google Gemini
  
- **User Management**:
  - CRUD operations for users
  - Role-based access (Admin, Staff, Tech Support, PSD, Viewer)
  - Email-based password reset
  
- **Dashboard**:
  - Real-time statistics
  - Charts and visualizations
  - Quick actions
  - Recent tickets list

### Technical Stack
- React 18.3.1 + TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17 + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- TanStack Query for data fetching
- React Hook Form + Zod for forms

---

## Release Notes

### Version 1.2.0 Highlights

This release focuses on data management and export capabilities:

1. **Complete CSV Export**: Now includes all technical report analysis data (21 columns total)
2. **Real Backup System**: Actual data export/import with Supabase integration
3. **Admin Password Management**: Functional password reset for user management
4. **Bug Fixes**: Resolved logout 404 error with proper SPA routing

### Upgrade Guide

No breaking changes. Simply pull the latest code and deploy:

```bash
git pull origin main
npm install
npm run build
```

### Migration Notes

- No database migrations required
- New edge function `admin-reset-password` needs to be deployed to Supabase
- Update `vercel.json` is included for SPA routing fix

---

## Future Roadmap

### Planned for v1.3.0
- [ ] Email notifications for ticket status changes
- [ ] WhatsApp integration for customer notifications
- [ ] Advanced reporting with custom date ranges
- [ ] Bulk operations for tickets
- [ ] Mobile app (React Native)

### Planned for v1.4.0
- [ ] Inventory management for spare parts
- [ ] Invoice generation
- [ ] Customer portal
- [ ] Multi-language support
- [ ] Dark mode improvements

### Under Consideration
- Integration with accounting software
- API for third-party integrations
- Advanced analytics and insights
- Automated backup to external storage
- Multi-tenant support

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## Support

For issues and feature requests, please use [GitHub Issues](https://github.com/budagbogor/psd/issues).
