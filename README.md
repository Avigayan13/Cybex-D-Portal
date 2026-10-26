# 🌐 CYBEX D • SRM AP — CSE Section D Portal

<div align="center">

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://cybex-d-portal.vercel.app/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic%20UI-E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Modern%20Design-1572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Schemas-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 📖 Overview

**CYBEX D** is an institutional web portal engineered specifically for the 58 students of **B.Tech CSE (Cyber Security) - Section D, Semester IV** at **SRM University AP**.

Built with a **dark-mode liquid-glass aesthetic**, interactive mathematical & computing doodle particles, real-time timetable countdowns, slide-wise mid-term surveys, anonymous grievance redressal, and direct Class Representative administrative tools.

---

## ✨ Key Features

- ⏰ **Real-Time Interactive Timetable & Countdown**: Live period countdowns and campus room routing (S 312, V 602, V 403, V 306).
- 📝 **Slide-Wise Mandatory Term Survey**: Slide-by-slide 1–5 ratings and improvement feedback with 1-submission-per-student lock.
- 🛡️ **Confidential Grievance Box**: Direct anonymous feedback submission for academic, classroom, and lab issues.
- 📚 **Study Materials & Classroom Doubts**: Syllabi, PPTs, study resources, and peer doubt discussions.
- 🔑 **Secure Authentication**: Institutional OTP verification for @srmap.edu.in, roll number mapping, and zero password collection.
- ⚡ **CR Admin Command Center**: Live announcements, grievance management, timetable control, and survey analytics.

---

## 🛠️ Languages & Tech Stack

<div align="center">

| Category | Technologies & Tools |
| :--- | :--- |
| **Languages** | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![SQL](https://img.shields.io/badge/SQL-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) |
| **Frontend Framework** | ![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **Styling & Animation** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) `Liquid-Glass UI` `Interactive Doodles` |
| **Backend & APIs** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) `Serverless Functions` |
| **Database & Auth** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) `PostgreSQL` `SRM AP OTP Verification` |
| **Hosting & Cloud** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) `Edge CDN` |

</div>

---

## 🚀 Setup & Local Run

```bash
# 1. Clone repository
git clone https://github.com/Avigayan13/Cybex-D-Portal.git
cd Cybex-D-Portal

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```
---

## ☁️ Deploying on Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Add your Environment Variables (JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, etc.) in the Vercel dashboard.
3. Click **Deploy**!

---

## 👨‍💻 Author & Maintainer

**Avigayan Jana**  
*Class Representative (CR) — CSE Section D*  
🏛️ **SRM University AP**  
🐙 GitHub: [@Avigayan13](https://github.com/Avigayan13)

---

<div align="center">
<sub>Crafted with ☕ and 0% sleep for the students of CSE Section D • SRM University AP</sub>
</div>


---

## 🛠️ Local development & configuration

Use this checklist to run CYBEX D locally without exposing project credentials.

1. Install a current LTS version of [Node.js](https://nodejs.org/) (npm is included).
2. Clone the repository and install packages:

   ```bash
   git clone https://github.com/Avigayan13/Cybex-D-Portal.git
   cd Cybex-D-Portal
   npm install
   ```

3. Copy `.env.example` to a local `.env` file and fill in only the values required for your own development environment. Keep the variable names exactly as shown in `.env.example`.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local address printed by Vite in your browser.

> **Security note:** Never commit `.env` files, service keys, OTP secrets, or production credentials. `.env.example` is the safe place to document required variable names without including real values.

### Troubleshooting

| Problem | What to check |
| --- | --- |
| `npm install` fails | Confirm that Node.js is installed, then try again from the project folder. |
| The app reports missing configuration | Check that `.env` exists locally and that its variable names match `.env.example`. |
| Port already in use | Stop the other local development server or follow Vite's prompt to use another port. |

This guide is intended to help contributors reproduce the local setup while keeping the production portal and its credentials protected.
