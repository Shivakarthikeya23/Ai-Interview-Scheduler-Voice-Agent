# AI Interview Scheduler Voice Agent

A modern, AI-powered interview platform that revolutionizes the recruitment process with intelligent voice-enabled interviews, real-time assessment, and comprehensive candidate evaluation.

## 🚀 Features

### Core Functionality
- **AI-Powered Interviews**: Generate personalized interview questions based on job descriptions and candidate profiles
- **Voice-Enabled Interviews**: Conduct interviews using advanced voice AI technology with real-time conversation
- **Real-time Assessment**: Get instant feedback and scoring on candidate responses with detailed analytics
- **Multi-Interview Types**: Support for Technical, Behavioral, Experience, Problem-Solving, System Design, and Leadership interviews
- **Comprehensive Analytics**: Detailed performance metrics and candidate evaluation reports

### User Experience
- **Seamless Authentication**: Google OAuth integration for secure user access
- **Intuitive Dashboard**: Clean, modern interface for managing interviews and viewing analytics
- **Interview Creation Wizard**: Step-by-step process to create customized interviews
- **Candidate Portal**: Easy-to-use interface for candidates to join interviews
- **Real-time Feedback**: Instant AI-generated feedback and recommendations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.0** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### Backend & Services
- **Supabase** - Database and authentication
- **OpenAI/OpenRouter** - AI-powered question generation and feedback
- **Vapi AI** - Voice AI integration for interviews

### Development Tools
- **TypeScript/JavaScript** - Programming language
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-scheduler-voice-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   NEXT_PUBLIC_VAPI_API_KEY=your_vapi_public_key
   ```
   For **NEXT_PUBLIC_VAPI_API_KEY**: use your **public** API key from [Vapi Dashboard](https://dashboard.vapi.ai) → Settings → API Keys. The AI voice interview requires this. In the Vapi dashboard, ensure **OpenAI** (and optionally **Deepgram**) are configured under Provider Credentials so the inline assistant can run.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
project/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main application routes
│   │   ├── dashboard/            # Dashboard and interview management
│   │   ├── all-interview/        # Interview listing
│   │   ├── analytics/            # Analytics and reporting
│   │   ├── feedback/             # Interview feedback
│   │   └── settings/             # User settings
│   ├── interview/                # Interview execution
│   │   └── [interviewId]/        # Dynamic interview routes
│   ├── api/                      # API routes
│   │   ├── ai-feedback/          # AI feedback generation
│   │   └── ai-model/             # AI model integration
│   └── auth/                     # Authentication pages
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   └── Logo.jsx                  # Application logo
├── context/                      # React context providers
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── services/                     # External service integrations
└── public/                       # Static assets
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication with Google OAuth
3. Create the following database tables:
   - `Interviews` - Store interview configurations
   - `Candidates` - Store candidate information
   - `Responses` - Store interview responses and feedback

### AI Model Configuration
The application uses OpenRouter API for AI-powered features:
- Question generation based on job descriptions
- Real-time feedback and assessment
- Candidate evaluation and recommendations

## 🚀 Usage

### For Recruiters
1. **Sign in** using Google OAuth
2. **Create an interview** by specifying:
   - Job position and description
   - Interview duration
   - Interview types (Technical, Behavioral, etc.)
3. **Generate questions** using AI or add custom questions
4. **Share interview link** with candidates
5. **Review results** and AI-generated feedback

### For Candidates
1. **Access interview link** provided by recruiter
2. **Enter personal information** (name, email)
3. **Join voice interview** with AI interviewer
4. **Complete interview** with real-time guidance
5. **Receive feedback** and assessment

## 📊 Features in Detail

### AI-Powered Question Generation
- Automatically generates relevant questions based on job description
- Supports multiple interview types and difficulty levels
- Questions are tailored to interview duration and role requirements

### Voice AI Integration
- Real-time voice conversation with AI interviewer
- Natural language processing for candidate responses
- Adaptive questioning based on candidate performance

### Analytics Dashboard
- Interview statistics and metrics
- Candidate performance tracking
- Hiring recommendations and insights

### Feedback System
- Comprehensive AI-generated feedback
- Performance ratings across multiple dimensions
- Actionable improvement suggestions

## 🔒 Security

- **Authentication**: Secure Google OAuth integration
- **Data Protection**: Encrypted data transmission
- **Privacy**: Candidate data protection and GDPR compliance
- **Session Management**: Secure session handling with Supabase

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common issues

## 🔮 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Integration with popular ATS platforms
- [ ] Mobile application
- [ ] Advanced AI models for better assessment
- [ ] Team collaboration features
- [ ] Custom branding options

---

**Built with ❤️ using Next.js, Supabase, and AI technologies**
