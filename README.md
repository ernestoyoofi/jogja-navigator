# Jogja Navigator

**Jogja Navigator** is an AI-Powered Travel Map & Checklist application designed to help tourists explore Yogyakarta effortlessly. By chatting with an AI agent, users receive personalized travel recommendations based on their budget, time, and preferences, complete with an interactive map and checklist.

## Features

- **AI Chat Navigator**: Conversational interface to discover destinations.
- **Interactive Map**: Visualize recommended locations on a map.
- **Roadmap Checklist**: Track your travel plan with a to-do list for each location.
- **Real-time Context**: Recommendations based on current time and location.

## Tech Stack

- **Frontend/Backend**: Next.js 16
- **Database**: MongoDB
- **AI**: Google Gemini Flash 2.5
- **Maps**: MapLibre GL / OpenStreetMap

## Getting Started

### Prerequisites

- Node.js & Bun (Recommended)
- MongoDB Connection
- Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tkjseyegan/jogja-navigator.git
    cd jogja-navigator
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    # or
    npm install
    ```

### Environment Configuration

1.  Copy the example environment file:
    ```bash
    cp .example.env .env
    ```

2.  Update `.env` with your credentials:

    ```env
    # App Secrets
    SEISHIRO_PASSKEY="<your_passkey>"
    APP_JWT_SECRET="<your_jwt_secret>"

    # Database
    MONGODB_URI="mongodb://username:password@host:port/database"

    # Google OAuth (For Login)
    GOOGLE_CLIENT_ID="<your_client_id>"
    GOOGLE_CLIENT_SECRET="<your_client_secret>"
    GOOGLE_REDIRECT_URI="http://localhost:3511/api/auth"

    # AI Configuration
    MODEL_AI_AGENT="gemini-2.5-flash"
    MODEL_RESEARCH="gemini-2.5-flash"
    GEMINI_APIKEY="<your_gemini_api_key>"
    ```

### Running the Application

**Development Mode:**
```bash
bun dev
# Server running at http://localhost:3511
```

**Production Build:**
```bash
bun build
bun start
```

## License

This project is private and proprietary.
