
# CSC3916 Assignment 5 - Younes Yassine

This HW is a full‑stack MERN SPA built with MongoDB, Express, React, and Node.js. It features JWT‑protected endpoints, server‑side aggregation of movie ratings, and live deployment on Render.

## Features
- **User Authentication:** Signup and signin with JWT.
- **Top‑Rated Movies:** `GET /movies?reviews=true` returns movies sorted by their average rating.
- **Movie Detail:** `GET /movies/:id?reviews=true` shows poster, metadata, reviews, and average rating.
- **Review Management:** Create (`POST /reviews`), list (`GET /reviews`), and delete (`DELETE /reviews/:id`) reviews.
- **Deployment:** Backend and frontend hosted on Render with CORS enabled.

## Installation & Setup
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CSC3916_Assignment5.git
   cd CSC3916_Assignment5

Frontend: https://csc3916-assignment5-frontend.onrender.com
Backend: https://csc3916-assignment5-m17w.onrender.com
