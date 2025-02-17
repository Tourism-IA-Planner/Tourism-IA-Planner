# Tourism-IA-Planner 🌍

[Live Demo](https://www.touristai.online/) | [API Documentation](https://www.touristai.online/docs)

An AI-powered web application for generating personalized tourist itineraries in Morocco. This platform leverages artificial intelligence to create optimized travel plans based on user preferences, budget constraints, and interests.

![Tourism-IA-Planner Banner](https://images.unsplash.com/photo-1539020140153-e479b8c22e70)

## 🌟 Features

- **AI-Powered Itinerary Generation**
  - Personalized travel plans based on user preferences
  - Smart budget optimization
  - Automatic route planning and scheduling
  - Real-time cost predictions

- **Interactive User Interface**
  - Intuitive travel planning dashboard
  - Real-time chat assistance
  - Interactive maps of destinations
  - Visual itinerary representation

- **Smart Recommendations**
  - Personalized activity suggestions
  - Accommodation recommendations
  - Transportation options
  - Local attractions and experiences

- **User Management**
  - Secure authentication (Email & Google OAuth)
  - Profile customization
  - Favorite itineraries saving
  - Travel history tracking

## 🛠️ Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (animations)
- React Router (navigation)
- Recharts (data visualization)
- Axios (API requests)

### Backend
- FastAPI (Python)
- PostgreSQL (database)
- SQLAlchemy (ORM)
- OpenAI API (AI integration)
- JWT Authentication
- Alembic (database migrations)

### DevOps & Deployment
- Docker
- Vercel (Frontend hosting)
- Render (Backend hosting)
- GitHub Actions (CI/CD)
- PostgreSQL (Production database)

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- OpenAI API key

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Tourism-IA-Planner.git
   cd Tourism-IA-Planner
   ```

2. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configurations
   
   # Run database migrations
   alembic upgrade head
   
   # Start the backend server
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. The application will be available at:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`

## 💡 Usage

1. **Create an Account**
   - Sign up using email or Google account
   - Complete your profile with travel preferences

2. **Plan Your Trip**
   - Select cities to visit
   - Set your budget and travel dates
   - Choose preferred activities and accommodations

3. **Generate Itinerary**
   - Get AI-generated travel plans
   - Review and customize suggestions
   - Save favorite itineraries

4. **Travel Management**
   - Access saved itineraries
   - Chat with AI assistant
   - Get real-time updates and recommendations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Ouaail El Aouad** - Team Lead & Frontend Lead
- **Imad Echriki** - Frontend Development
- **El Mehdi El Adnani** - Backend Development
- **Moad Dahbi** - DevOps Engineer
- **Souhail Chaiybrass** - AI Integration

## 📬 Contact

For any queries or support, please reach out to:
- Email: [contact@touristai.online](mailto:contact@touristai.online)
- Website: [https://www.touristai.online](https://www.touristai.online)

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Moroccan Tourism Office for destination data
- All the members of our development team for their dedication and hard work
