# System Architecture

## Overview
Life_Saver AI is a comprehensive healthcare forecasting and resource management system. It leverages advanced AI models to predict disease outbreaks and optimize hospital resources, providing actionable insights to hospitals, pharmacies, and the public.

## High-Level Architecture
The system follows a microservices-inspired architecture with three main components:

1.  **Frontend (Client)**: A React-based Single Page Application (SPA) for user interaction.
2.  **Backend (API)**: A Node.js/Express server handling business logic, authentication, and data persistence.
3.  **AI Service (Intelligence)**: A Python-based service hosting machine learning models for forecasting and a RAG (Retrieval-Augmented Generation) system for the chatbot.

```mermaid
graph TD
    User[User (Public/Hospital/Pharmacy)] -->|HTTPS| Frontend[Frontend (React)]
    Frontend -->|REST API| Backend[Backend (Node.js/Express)]
    Backend -->|JSON| AI_Service[AI Service (Python/Flask)]
    AI_Service -->|Queries| Qdrant[Qdrant (Vector DB)]
    AI_Service -->|Loads| Models[ML Models (Joblib)]
    Backend -->|Reads/Writes| Database[(Database)]
```

## Component Details

### 1. Frontend
*   **Tech Stack**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React.
*   **Key Features**:
    *   **Dashboards**: Role-based dashboards for Public, Hospital, Pharmacy, and Admin users.
    *   **Visualization**: Interactive charts for disease trends and resource usage.
    *   **Chatbot**: AI-powered assistant for health queries.
    *   **Authentication**: Secure login and signup with role-based access control.
    *   **Theming**: Global dark/light mode support.

### 2. Backend
*   **Tech Stack**: Node.js, Express.
*   **Key Responsibilities**:
    *   **Authentication**: JWT-based user authentication and role management.
    *   **API Gateway**: Routes requests to the AI service and manages data flow.
    *   **Data Management**: Handles user profiles, hospital data, and alerts.
    *   **Real-time Updates**: (Planned) Socket.io for live collaboration/alerts.

### 3. AI Service
*   **Tech Stack**: Python, Flask, Scikit-learn, Pandas, Qdrant (Vector DB).
*   **Key Capabilities**:
    *   **Forecasting**:
        *   **Ensemble Model**: Combines Random Forest and Gradient Boosting for robust predictions.
        *   **Multi-Target**: Predicts Admissions, ICU usage, and Oxygen demand.
        *   **Advanced Models**: Experimental support for Chronos, MOIRAI, Lag-Llama, and TimeSFM.
    *   **RAG System**:
        *   Uses Qdrant for semantic search over medical documents.
        *   Provides context-aware answers via the Chatbot.
    *   **Data Pipeline**: Scripts for data ingestion, synthetic data generation, and model training.

## Data Flow

1.  **User Action**: A user logs in and views the dashboard.
2.  **Frontend Request**: The frontend requests forecast data from the Backend API.
3.  **Backend Processing**: The backend validates the request and forwards it to the AI Service.
4.  **AI Inference**: The AI Service loads the trained models (`.joblib` files), generates predictions based on current data, and returns the results.
5.  **Response**: The backend formats the data and sends it back to the frontend for visualization.

## Directory Structure
*   `frontend/`: React application source code.
*   `backend/`: Node.js server and API routes.
*   `ai-model/`: Python scripts for training, inference, and the AI API service.
    *   `qdrant_data/`: Vector database storage.
    *   `*.joblib`: Serialized machine learning models.

## Security
*   **Authentication**: JWT (JSON Web Tokens) for stateless authentication.
*   **Role-Based Access Control (RBAC)**: Restricts access to sensitive dashboards and settings based on user roles (Public, Hospital, Pharmacy, Admin).
*   **Environment Variables**: Sensitive configuration stored in `.env` files (not committed).
