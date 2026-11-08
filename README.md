# Smart Campus Room Booking & Availability Checker

An interactive web application for exploring campus room catalogs, filtering rooms by capacity and equipment requirements, checking reservation availability, and visualizing daily room schedules on an interactive timeline.

Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Vitest**.

---

## Features

- **Fictional Room Catalog:** Browse campus spaces across multiple buildings with configurable capacities, equipment lists, and schedules.
- **Dynamic Catalog Filtering (F1–F5):**
  - **Capacity Matching:** Filter rooms by requested attendee count (`capacity >= attendees`).
  - **Equipment Requirements:** Filter rooms to ensure they contain all selected equipment items.
  - **Automatic Blocked Room Exclusion:** Rooms marked as blocked for maintenance or campus events are excluded by default.
  - **Empty States:** Clear feedback and quick-reset actions when no rooms meet filter criteria.
- **Booking & Availability Engine (AC1–AC6):**
  - Real-time slot validation (00:00–24:00 window, start after current time).
  - Maximum duration enforcement (up to 120 minutes).
  - Collision detection against existing bookings (with support for touching endpoints).
  - Automatic result refreshing when switching selected rooms.
- **Interactive 24-Hour Timeline:** Visual breakdown of daily occupancy and candidate booking intervals.
- **Dual Time Formats:** Seamlessly toggle between 24-hour and 12-hour (AM/PM) time formats.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended; v20+ supported)
- [npm](https://www.npmjs.com/) (v9 or higher)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/KydyrbaiKazbek/SE_Smart_Campus.git
cd SE_Smart_Campus
```

### 2. Install Dependencies

Install all project dependencies:

```bash
npm install
```

---

## Running the Application

### Development Server

Start the local Vite development server with hot module replacement:

```bash
npm run dev
```

Once running, open the URL displayed in your terminal (typically [http://localhost:5173](http://localhost:5173)) in your browser.

### Production Build

Compile TypeScript and build the optimized production assets:

```bash
npm run build
```

### Preview Production Build

Locally preview the built production bundle:

```bash
npm run preview
```

---

## Running Automated Tests

The project includes an automated test suite powered by **Vitest** and **React Testing Library**, covering domain validation rules, catalog filtering, boundary conditions, and UI integration behavior.

### Run All Tests Once

```bash
npm test
```
*(Runs `vitest run` across all test suites in the repository).*

### Run Tests in Watch Mode

```bash
npx vitest
```

### Run a Specific Test Suite

```bash
# Run Task #04 comprehensive test suite (AC1–AC5, F1–F5, UI integration)
npm test -- src/smartCampus.test.tsx

# Run booking validation unit tests
npm test -- src/lib/booking.test.ts

# Run room filtering unit tests
npm test -- src/lib/filter.test.ts
```

### TypeScript Type Checking

Validate all TypeScript types without emitting files:

```bash
npm run typecheck
```

### Linting

Check code quality with ESLint:

```bash
npm run lint
```

---

## Project Structure

```text
SE_Smart_Campus/
├── src/
│   ├── components/               # Modular presentational UI components
│   │   ├── AvailabilityBanner.tsx # Slot availability status & conflict reasons
│   │   ├── BookingForm.tsx        # Time range inputs & format toggle
│   │   ├── Header.tsx             # Application branding & live clock
│   │   ├── NoRoomSelected.tsx     # Empty state placeholder
│   │   ├── RoomCard.tsx           # Individual room card with equipment badges
│   │   ├── RoomFilters.tsx        # Capacity and equipment filter controls
│   │   ├── RoomList.tsx           # Room catalog list container
│   │   ├── TimeInput.tsx          # Controlled time input component
│   │   └── Timeline.tsx           # 24-hour schedule visualization bar
│   ├── data/
│   │   └── sampleData.ts          # Fictional campus room catalog & schedules
│   ├── lib/
│   │   ├── booking.ts             # AC1–AC6 domain validation & availability engine
│   │   ├── booking.test.ts        # Booking engine unit tests
│   │   ├── filter.ts              # F1–F5 room catalog filtering logic
│   │   ├── filter.test.ts         # Filter engine unit tests
│   │   └── timeUtils.ts           # Time parsing and formatting helpers
│   ├── smartCampus.test.tsx       # Comprehensive Task #04 automated test suite
│   ├── App.tsx                    # Top-level state coordinator and orchestrator
│   ├── main.tsx                   # React application root entry point
│   ├── index.css                  # Tailwind CSS directives & global styling
│   └── types.ts                   # Core TypeScript domain models & interfaces
├── package.json                   # Project configuration & npm scripts
├── vite.config.ts                 # Vite & Vitest configuration
├── tailwind.config.js             # Tailwind CSS design system tokens
└── tsconfig.app.json              # TypeScript compilation settings
```

---

## License

This project is created for academic and demonstration purposes as part of the Smart Campus Software Engineering coursework.
