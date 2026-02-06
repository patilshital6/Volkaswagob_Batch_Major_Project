# University Campus Portal - Developer Documentation

A high-performance, minimalist boilerplate built with React, Vite, and Tailwind CSS.

---

## Quick Start

1.  **Install Dependencies**: `npm install`
2.  **Run Dev Server**: `npm run dev`
3.  **Open Browser**: Visit `http://localhost:5173`

---

## Codebase Architecture

The project follows a modular structure to ensure isolated development environments for multiple contributors.

```text
src/
├── components/          # UI Components
│   ├── common/          # Global elements (Header, Sidebar, Footer)
│   └── layout/          # Structural parts (AppLayout, PageHeader)
├── context/             # Authentication & Global State
│   └── AuthContext.jsx  # Role-based identity management
├── pages/               # Feature-specific pages
│   ├── Login.jsx        # Unified login gateway
│   ├── Home.jsx         # Student perspective
│   ├── FacultyHome.jsx  # Teacher perspective
│   └── ... (modules)
├── routes/              # Routing configuration
│   └── AppRoutes.jsx    # Protected paths & role checks
├── App.jsx              # Context Provider & Router Root
└── index.css            # Tailwind V4 entry and custom scrollbars
```

---

## Auth & Role Integration

The system includes a placeholder **Authentication System** to support future Student and Faculty portals.

### 1. Unified Login (Login.jsx)
A centralized login page that allows toggling between Student and Faculty roles. The login logic currently resides in `AuthContext.jsx` as a mock implementation.

### 2. Protected Routes
The application uses a `ProtectedRoute` wrapper in `AppRoutes.jsx`. If a user is not authenticated, they are automatically redirected to the `/login` page.

### 3. Role-Based Views
- **Student View**: When logged in as a student, the index route (`/`) loads `Home.jsx`.
- **Faculty View**: When logged in as faculty, the index route (`/`) loads `FacultyHome.jsx`.
- **Context Access**: Use the `useAuth()` hook to access `user.name`, `user.role`, and the `logout` function anywhere in the app.

---

## Guide: Populating Components and Content

To maintain the high-end, minimalist aesthetic established in the shell, follow these patterns when populating your pages.

### 1. Data Cards
Use white backgrounds with subtle slate borders and rounded corners. Avoid heavy shadows.

```jsx
<div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assignments</p>
  <p className="text-2xl font-bold text-slate-900">12</p>
</div>
```

### 2. Information Tables
Keep tables clean with horizontal dividers and plenty of whitespace.

```jsx
<div className="overflow-x-auto">
  <table className="w-full text-left">
    <thead>
      <tr className="border-b border-slate-100">
        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event</th>
        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50 text-sm">
      <tr>
        <td className="py-4 text-slate-600">Jan 22, 2026</td>
        <td className="py-4 font-bold text-slate-900">Semester Kickoff</td>
        <td className="py-4 text-indigo-600 font-bold">Upcoming</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 3. Interaction Buttons
Stick to solid indigo for primary actions and ghost slate styles for secondary actions.

```jsx
{/* Primary Action */}
<button className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">
  Confirm Selection
</button>

{/* Secondary Action */}
<button className="px-5 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all">
  View Details
</button>
```

---

## Detailed Component Breakdown

### 1. Global Shell (AppLayout.jsx)
The `AppLayout` is the parent wrapper. It orchestrates the positioning of the Header, Sidebar, and Footer. 
- **Header**: Fixed at the top (`z-50`). Shows user initials and handles sign-out.
- **Sidebar**: A pop-up overlay (`z-40`) controlled by the hamburger menu.

### 2. Header and Sidebar Navigation
- **Header**: Responds to `AuthContext`. It displays the current user's initials and provides a logout action.
- **Sidebar Items**: Defined in `Sidebar.jsx`.

### 3. Footer (Global Sitemap)
Positioned at the absolute bottom. Outside the main scroll container to ensure it stays below all page content.

---

## Step-by-Step Guide: Building and Integrating Modules

Follow these steps to add a new feature:

### 1. Create the Page component
Create a new file in `src/pages/`. Use `<PageHeader />` for consistency.

### 2. Register the Route
Add the route to `src/routes/AppRoutes.jsx`. Wrap it in the `AppLayout` route group to inherit the shell.

### 3. Update Sidebar Navigation
Add the item to the `sidebarItems` array in `Sidebar.jsx`.

---

## Collaboration Guidelines

1.  **Minimalism**: Avoid shadows or rounded corners beyond `rounded-xl`.
2.  **Indigo/Slate Palette**: Use `indigo-600` for primary actions and `slate-900` for structure. 
3.  **Role Awareness**: When building components, consider if they should look different for students vs. faculty. Access roles via `useAuth()`.
4.  **No Direct CSS**: Use Tailwind classes for all styling.

---

## Design System Reference

- **Header/Footer/Sidebar BG**: `bg-slate-900` / `bg-white`
- **Primary Accent**: `indigo-600`
- **Standard Border**: `border-slate-100`
- **Custom Scrollbar**: Pre-configured in `index.css`.
