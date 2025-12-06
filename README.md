# 🏎️ ApexManager - High-Performance Race Track Booking System

> A full-stack SaaS solution for managing commercial race track facilities, handling real-time booking concurrency, exclusive resource locking, and dynamic pricing.

<img width="2816" height="1536" alt="Track_A" src="https://github.com/user-attachments/assets/87509ed4-74e2-4e3e-ba05-c00e00021ca9" />

# 🚀 The Engineering Challenge
Booking systems are easy until you add **concurrency** and **exclusive resources**. 
ApexManager solves the "Double Booking" problem where multiple users compete for limited track time. It enforces complex business rules:
1.  **Exclusivity Locks:** Prevents public walk-ins during Private Events.
2.  **Capacity Math:** Real-time calculation of remaining kart slots for public sessions.
3.  **Sacred Time Constraints:** Enforces "Public Only" hours where high-value private bookings are automatically rejected.

## 🛠️ Tech Stack
* **Backend:** Java 21, Spring Boot 3.4, Hibernate/JPA
* **Database:** PostgreSQL (Relational Schema with constraints)
* **Frontend:** React.js + Vite (Custom 3D CSS Carousel)
* **DevOps:** Docker (Containerisation)

## ✨ Key Features
* **3D Showroom UI:** Custom CSS-only 3D carousel for track selection.
* **Visual Booking Engine:** "Starting Grid" visualizer that maps driver count to grid positions.
* **Smart Validation:** Backend Service Layer prevents overlapping schedules and capacity overflows.
* **Dynamic Pricing:** Admin dashboard to adjust per-person rates and walk-in fees in real-time.

## 📸 Screenshots
<img width="1672" height="873" alt="Screenshot 2025-12-06 at 05 40 17" src="https://github.com/user-attachments/assets/79cc4d35-c3d3-4700-a6d5-4824cb0ed790" />

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
