# ReWear — Circular Fashion Marketplace 🌿👗
> **CSE470 Software Engineering Project**  
> *A circular-fashion platform for university students and conscious curators to buy, sell, swap with credits, or rent pre-owned clothing.*

---

## 🎨 Brand Design System & Color Palette

ReWear uses an intentional sustainable luxury palette:
- **Deep Plum (`#542747`)**: Primary brand identity, dark navigation headers, elevation accents.
- **Burnt Orange (`#A94F2C`)**: Primary Call-to-Action (CTA) buttons, highlight badges, active toggles.
- **Soft Tangerine (`#E58B51`)**: Secondary accents, swap indicators, alert badges, icon highlights.
- **Peach Blush (`#E9C7B7`)**: Soft backgrounds, subtle borders, chip badges, container outlines.
- **Warm Cream (`#FFF5EB`)**: Main application canvas background and modal surfaces.
- **Espresso (`#38302F`)**: High-contrast body typography, dark cards, and deep accents.

---

## 🏛️ Architecture & CSE470 MVC Compliance

- **No MERN Violation**: We do **not** use the MERN stack (MongoDB + Express is prohibited).
- **Backend Architecture**: **NestJS (TypeScript)** structured in modular **MVC (Model-View-Controller)** pattern:
  - **Controllers**: Handle HTTP routes, request validation DTOs, and response formatting.
  - **Services**: Encapsulate business logic (compatibility scoring, availability calculations, escrow locks).
  - **Entities/Models**: Represent domain data models ready for PostgreSQL persistence.
- **Frontend Architecture**: **React.js** powered by Vite and styled with Tailwind CSS using custom color tokens.
- **Database**: **PostgreSQL** (Relational model for strict transactional consistency across swaps, rentals, and payments).

---

## 👥 4-Member Team Ownership (20 Total Features)

| Member | Domain & Ownership | 5 Substantive Features | AI Feature Integration |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Seller Management & AI Listing Intelligence** | 1. Multi-Mode Product & Inventory Management (Sell/Swap/Rent)<br>2. Clothing Condition & Defect Transparency Disclosure<br>3. Smart Resale Price Advisor<br>4. Seller Performance Analytics Dashboard<br>5. AI Listing Copilot | **AI Listing Copilot**: Computer vision + LLM drafts tags, titles, category, and condition estimates from photos. |
| **Member 2** | **Buyer Experience & Fashion Discovery** | 6. Advanced Multi-Filter Marketplace Search<br>7. AI Visual & Natural-Language Search<br>8. Personalized Fashion Discovery Feed<br>9. Smart Wishlist & Price/Availability Alerts<br>10. Outfit Builder & Digital Lookbook | **AI Visual & Semantic Search**: Natural-language search (*"black oversized jacket under ৳2000"*) + image moodboard embeddings. |
| **Member 3 (You)** | **Transactions, Swapping & Rental Management** | 11. Unified Checkout & Payment Processing (SSLCommerz / bKash)<br>12. AI-Powered Swap Matchmaker<br>13. Rental Booking & Deposit Management (Calendar locks & late fees)<br>14. Delivery, Pickup & Return Courier Tracking<br>15. Transaction Protection & Dispute Resolution | **AI Swap Matchmaker**: Closet compatibility scoring, value balancing, automated negotiation messages & escrow state machine. |
| **Member 4** | **Trust, Sustainability & Community** | 16. AI Circular Fashion Coach<br>17. Verified Reviews, Reputation & Trust Center<br>18. Sustainability Impact Calculator (Water, CO₂, textile waste)<br>19. Digital Wardrobe & Cost-per-Wear Tracker<br>20. Community Swap Events & Circularity Challenges | **AI Circular Fashion Coach**: DIY garment repair, stain removal guidance, upcycling ideas with fabric safety caveats. |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Git installed

### 1. Frontend Setup (React.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Backend Setup (NestJS MVC)
```bash
cd backend
npm install
npm run start:dev
```
Backend API will be accessible at [http://localhost:5000/api/v1](http://localhost:5000/api/v1).

---

## 🌿 Team Git Workflow
Read [docs/GIT_WORKFLOW_GUIDE.md](docs/GIT_WORKFLOW_GUIDE.md) for branch naming conventions, PR guidelines, and merge instructions.
