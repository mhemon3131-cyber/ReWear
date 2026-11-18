# ReWear Team Git Workflow & Branching Guide (CSE470)

This repository is shared across all 4 team members. Follow this guide strictly to prevent merge conflicts and ensure clean academic sprint tracking.

---

## 1. Branch Strategy

- **`main`**: Production & presentation-ready stable releases.
- **`develop`**: Primary integration branch where completed features are merged after review.
- **`feature/<member>-<feature-slug>`**: Individual feature branches worked on by each member.

### Branch Names per Member

#### Member 1 (Seller Management & AI Listing Intelligence):
- `feature/m1-listing-copilot`
- `feature/m1-inventory-management`
- `feature/m1-defect-disclosure`
- `feature/m1-resale-price-advisor`
- `feature/m1-seller-analytics`

#### Member 2 (Buyer Experience & Fashion Discovery):
- `feature/m2-advanced-search-filters`
- `feature/m2-visual-semantic-search`
- `feature/m2-personalized-feed`
- `feature/m2-smart-wishlist-alerts`
- `feature/m2-outfit-lookbook`

#### Member 3 (Transactions, Swapping & Rental Management - YOU):
- `feature/m3-unified-checkout-payments`
- `feature/m3-ai-swap-matchmaker`
- `feature/m3-rental-booking-deposits`
- `feature/m3-delivery-return-tracking`
- `feature/m3-dispute-resolution`

#### Member 4 (Trust, Sustainability & Community):
- `feature/m4-ai-circular-coach`
- `feature/m4-verified-reviews-trust`
- `feature/m4-sustainability-calculator`
- `feature/m4-digital-wardrobe-cost-tracker`
- `feature/m4-community-swap-events`

---

## 2. Daily Workflow for Team Members

### Step 1: Clone the Repository (One-time)
```bash
git clone https://github.com/<your-username>/rewear-circular-fashion.git
cd rewear-circular-fashion
```

### Step 2: Ensure You Have the Latest Code
Before starting any new work:
```bash
git checkout main
git pull origin main
```

### Step 3: Create Your Feature Branch
```bash
# Example for Member 1 starting the Listing Copilot:
git checkout -b feature/m1-listing-copilot

# Example for Member 3 (You) starting AI Swap Matchmaker:
git checkout -b feature/m3-ai-swap-matchmaker
```

### Step 4: Work and Commit Regularly
Use descriptive commit messages:
```bash
git add .
git commit -m "feat(transactions): add swap compatibility algorithm and escrow status"
```

### Step 5: Push Your Branch to GitHub
```bash
git push -u origin feature/m3-ai-swap-matchmaker
```

### Step 6: Create a Pull Request (PR) on GitHub
1. Go to your GitHub repository in your browser.
2. You will see a banner: **"Compare & pull request"**. Click it.
3. Set the base branch to `main` (or `develop`).
4. Title the PR clearly: `[Member 3] Feature: AI Swap Matchmaker`.
5. Request review from at least one teammate.
6. Once verified, click **Merge pull request** -> **Confirm merge**.

---

## 3. Resolving Merge Conflicts (If Any Occur)
If GitHub says your branch has conflicts:
```bash
git checkout feature/your-branch-name
git fetch origin
git merge origin/main
```
Open the conflicted files, choose the correct lines, save, and then:
```bash
git add .
git commit -m "fix: resolve merge conflicts with main"
git push origin feature/your-branch-name
```
