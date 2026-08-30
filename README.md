  # Mofin

  **The smartest way to track your mobile money in Kenya.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)
</div>

<br />

Mofin reads your M-Pesa, Airtel Money, and Equitel messages to track every shilling you spend or receive. No manual entry. Works offline. Completely private.

This repository contains the landing page and marketing website for the Mofin Android application, built with React, Vite, and Tailwind CSS.

## 🌟 Features

*   **100% Offline Support**: Core functionality works without an internet connection.
*   **Algorithmically Categorized**: Smart categorization of your spending (Grocery, Transport, Income, etc.).
*   **Bank-Level Security**: Your data remains private and secure.
*   **Modern Design**: Clean, responsive, and intuitive user interface tailored for Kenyan mobile users.
*   **Budgeting & Reports**: Set budgets and generate PDF/CSV expense reports.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Mofin-Project/Mofin-web.git
    cd Mofin-web
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    *   Copy the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    *   Open `.env.local` and add your required keys (e.g., `GEMINI_API_KEY` for algorithmic features).

4.  Start the development server:
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## 🛠️ Tech Stack

*   **Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animations**: [Framer Motion](https://motion.dev/)

## 📱 Screenshots

The `src/assets` directory contains various screenshots of the Mofin app in action, including the dashboard, budget tracking, transaction filtering, and more. These are used throughout the landing page to showcase the app's capabilities.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
