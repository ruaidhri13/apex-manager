# 🏎️ ApexManager - High-Performance Race Track Booking System

> A full-stack SaaS solution for managing commercial race track facilities, handling real-time booking concurrency, exclusive resource locking, and dynamic pricing.

![Project Banner](https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop)
*(Optional: Replace this line with a GIF of your 3D Carousel & Booking Flow)*

## 🚀 The Engineering Challenge
Booking systems are easy until you add **concurrency** and **exclusive resources**. 
ApexManager solves the "Double Booking" problem where multiple users compete for limited track time. It enforces complex business rules:
1.  **Exclusivity Locks:** Prevents public walk-ins during Private Events.
2.  **Capacity Math:** Real-time calculation of remaining kart slots for public sessions.
3.  **Sacred Time Constraints:** Enforces "Public Only" hours where high-value private bookings are automatically rejected.

## 🛠️ Tech Stack
* **Backend:** Java 21, Spring Boot 3.4, Hibernate/JPA
* **Database:** PostgreSQL (Relational Schema with constraints)
* **Frontend:** React.js + Vite (Custom 3D CSS Carousel)
* **DevOps:** Docker (Containerization)

## ✨ Key Features
* **3D Showroom UI:** Custom CSS-only 3D carousel for track selection.
* **Visual Booking Engine:** "Starting Grid" visualizer that maps driver count to grid positions.
* **Smart Validation:** Backend Service Layer prevents overlapping schedules and capacity overflows.
* **Dynamic Pricing:** Admin dashboard to adjust per-person rates and walk-in fees in real-time.

## 📸 Screenshots
*(Upload screenshots of your Dashboard, the Dark Mode Grid, and the Settings page here)*

## ⚡ Getting Started
### Prerequisites
* Java 21
* Node.js
* PostgreSQL

### Installation
1.  Clone the repo
    ```sh
    git clone [https://github.com/ruaidhri13/apex-manager.git](https://github.com/ruaidhri13/apex-manager.git)
    ```
2.  Start the Backend
    ```sh
    ./mvnw spring-boot:run
    ```
3.  Start the Frontend
    ```sh
    cd ui && npm run dev
    ```
