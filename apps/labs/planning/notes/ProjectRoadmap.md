# Flour City Labs: Project Roadmap

This document outlines the strategic evolution of the Flour City Labs platform beyond the MVP quoting system.

## Phase 2: The "Smart Lab" (Geometry & Estimation)
**Objective**: Enhance user engagement by providing immediate technical feedback during the quoting process.

- **Client-Side Slicing Insights**: Integrate basic geometry analysis (e.g., `three.js` or `stl-viewer`) to calculate bounding box dimensions and approximate volume.
- **Price Range Estimates**: Implement logic to provide an instant "Material Cost Estimate" range based on volume calculations, while maintaining the "Final Quote via Technician" requirement for accuracy.
- **Improved File Validation**: Detect potential printability issues (thin walls, non-manifold geometry) before the user even submits for review.

## Phase 3: Lab Ops Dashboard (`/lab`)
**Objective**: Transition from spreadsheet/email management to a centralized internal operations hub.

- **Unified Quote Management**: A secure area for the technician to view all pending requests, download files, and draft quotes.
- **Status Lifecycle Management**: One-click updates for projects (Reviewing → In Production → Quality Check → Shipped).
- **Inventory Management UI**: A dashboard to update the `materials` table (stock levels, colors, hidden status) without entering the Supabase backend.
- **Order Notification Triggers**: Automatic email updates to customers when their status changes (triggered by the dashboard).

## Phase 4: Pipeline Transparency (Order Tracking)
**Objective**: Reduce support overhead and build trust through automated project visibility.

- **"Track My Project"**: A public-facing (but secure) page where customers can enter an email + project ID.
- **Live Pipeline View**: Real-time status display (e.g., "Technician has sliced your file", "On Plate: Lab 1 Printer 4").
- **Visual Validation Display**: Host the "Macro Photos" requested during the quote for the customer to approve/preview before shipment.

## Phase 5: Dynamic Media & Proof (Gallery Evolution)
**Objective**: Automate social proof by showcasing recent high-quality lab outputs.

- **Supabase-Driven Gallery**: Convert the static Gallery into a dynamic feed.
- **Auto-Showcase**: Logic to automatically feature a project in the gallery (with customer permission) once it reaches the "Shipped" status.
- **Advanced Filtering**: Allow users to filter the gallery by material type, layer height, or industry (e.g., Prototypes, Replacement Parts).
