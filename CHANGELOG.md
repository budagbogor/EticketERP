# Changelog

All notable changes to MBTracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-23

### Added
- **Tire Data Management**:
  - Complete tire brand and product management system
  - CRUD operations for tire brands with logo upload
  - CRUD operations for tire products with detailed specifications
  - Import tire data from Excel with validation
  - Export tire data to CSV for backup/analysis
  - Product specifications: size, type, price, rating, warranty, features
  - Load index and speed index support
  - Search and filter by brand, size, type

- **Tire Upgrade Calculator**:
  - Calculate tire upgrade recommendations based on original size
  - Filter recommendations by same rim diameter
  - Display brand recommendations for each tire size
  - Visual comparison of tire sizes
  - Detailed product information (price, rating, warranty)
  - Industry-standard upgrade calculations

- **Wiper Fit Finder**:
  - Wiper size database for various vehicles
  - Search by vehicle make, model, and year
  - Import wiper data from Excel
  - Export wiper data template
  - CRUD operations for wiper specifications
  - Support for driver, passenger, and rear wiper positions

- **Customer Service Role**:
  - New user role with restricted access
  - Access to main menu items only
  - Administrative sections hidden for this role

### Enhanced
- **Buku Pintar (Vehicle Database)**:
  - **Battery Specifications**:
    - Added battery model code field
    - Added battery ampere (Ah) specification
    - Added battery voltage (V) specification
    - Added battery dimensions (P x L x T)
  - **Tire Specifications**:
    - Added tire load index
    - Added tire speed index
  - **Suspension Specifications**:
    - Added part numbers for all 8 suspension components:
      - Shock absorber front
      - Shock absorber rear
      - Rack end
      - Tie rod end
      - Link stabilizer
      - Lower arm
      - Upper arm
      - Upper support (NEW component)
  - **Engine Oil Specifications**:
    - Added quality standard field (API SP, ILSAC GF-6A, etc.)
  - **Recommended Brands**:
    - Added recommended brands for engine oil
    - Added recommended brands for transmission oil
    - Added recommended brands for power steering oil
    - Added recommended brands for brake oil
    - Added recommended brands for radiator coolant
    - Added recommended brands for AC freon
    - Added recommended brands for oil filter
    - Added recommended brands for air filter
    - Added recommended brands for cabin filter
    - Added recommended brands for spark plugs
    - Added recommended brands for brake pads
    - Added recommended brands for tires
    - Added recommended brands for all suspension parts

### Changed
- User role system now includes Customer Service role
- Buku Pintar data entry forms updated with new fields
- Battery display separated: model code, ampere, voltage, dimensions
- Suspension section now displays part numbers for all components
- Import/Export functionality enhanced for Buku Pintar data

### Fixed
- Battery model code now correctly saved and displayed
- All battery data fields now editable in Edit Data menu
- Recommended brands now properly displayed for all fluid types
- Data persistence issues in Buku Pintar resolved

### Technical
- Created migration: `20251222000003_add_battery_specs.sql`
- Created migration: `20251223000001_add_tire_load_speed_index.sql`
- Created migration: `20251223000002_add_suspension_part_numbers.sql`
- Created migration: `20251223000003_add_engine_oil_quality_standard.sql`
- Created migration: `20251223000004_add_battery_model.sql`
- Created migration: `20251222000001_add_fluid_brand_columns.sql`
- Created migration: `20251222000002_add_parts_tire_brands.sql`
- Created migration: `20251217000001_create_tire_tables.sql`
- Created migration: `20251216000000_create_wiper_tables.sql`
- Updated `vehicle_specifications` table with 30+ new columns
- Created `tire_brands` and `tire_products` tables
- Created `wiper_specifications` and `wiper_sizes` tables
- Enhanced type definitions in `src/integrations/supabase/types.ts`

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
