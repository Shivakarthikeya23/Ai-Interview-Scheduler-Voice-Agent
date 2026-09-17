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

## 📦 Local Setup

### Prerequisites

- **Node.js 20+** and npm
- **[Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)** (`npm install -g supabase`) — used to provision the database schema
- Accounts (all have free tiers): [Supabase](https://supabase.com), [OpenRouter](https://openrouter.ai), [Vapi](https://vapi.ai), and a [Google Cloud](https://console.cloud.google.com) project for OAuth

### 1. Clone and install

```bash
git clone <repository-url>
cd ai-interview-scheduler-voice-agent
npm install
```

### 2. Create a Supabase project and provision the schema

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Log in and link this repo to it:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
   (`<your-project-ref>` is the short ID in your project's dashboard URL.)
3. Push the schema — this creates every table (`Interviews`, `Users`, `Responses`), row-level security policy, and the `get_public_interview` RPC function used by the candidate-facing pages, all in one step:
   ```bash
   supabase db push
   ```
4. Under **Project Settings → API**, copy the **Project URL** and **`anon` `public` key** — you'll need these for `.env.local` below.

### 3. Configure Google sign-in

The app only supports Google OAuth via Supabase Auth. This has two halves that both need to be set up correctly — **getting this wrong is the single most common reason login breaks**, so follow both steps:

**a) Create a Google OAuth client**
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Application type: **Web application**).
2. Add this **Authorized redirect URI** (replace with your own project ref):
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the generated **Client ID** and **Client Secret**.

**b) Enable it in Supabase, and set the correct Site URL**
1. In your Supabase dashboard → **Authentication → Providers → Google**: enable it and paste the Client ID/Secret from above.
2. In **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` for local development.
   - **Redirect URLs**: add `http://localhost:3000/**` (and, separately, your production domain's equivalent — e.g. `https://your-app.vercel.app/**` — if you're also using this same Supabase project for a deployed instance).

   ⚠️ **This is the setting most likely to silently break login.** If it points at the wrong domain (a stale preview deployment, `localhost` in production, or vice versa), Google sign-in will appear to work but redirect you to a broken or wrong URL afterward, with no error in your own app's code. If you're managing this via `supabase/config.toml` and `supabase config push` instead of the dashboard, the same applies to the `[auth]` block's `site_url` and `additional_redirect_urls`.

### 4. Get your other API keys

- **OpenRouter**: create a key at [openrouter.ai/keys](https://openrouter.ai/keys). The free-tier models referenced in `app/api/ai-model/route.jsx` and `app/api/ai-feedback/route.jsx` occasionally get deprecated or rate-limited upstream by OpenRouter — if question/feedback generation starts failing, check [openrouter.ai/models](https://openrouter.ai/models?max_price=0) for currently available `:free` models and swap them in.
- **Vapi**: use your **public** API key from [Vapi Dashboard](https://dashboard.vapi.ai) → Settings → API Keys. In the Vapi dashboard, ensure **OpenAI** (and optionally **Deepgram**) are configured under Provider Credentials so the inline assistant can run.

### 5. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_public_key
```

If you set any of these via a script or CLI (rather than typing them directly into a dashboard), double-check the stored value has no leading/trailing whitespace or encoding artifacts (e.g. a UTF-8 BOM) — a single stray byte at the start of a key is enough to make the browser reject every request that uses it, with no useful error message pointing at the cause.

### 6. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| Blank page / console error `Missing Supabase environment variables` | `.env.local` is missing or one of the two Supabase values is empty |
| Signing in with Google redirects to a broken or wrong URL, or bounces back to the sign-in page | Supabase Auth's **Site URL** / **Redirect URLs** don't match the URL you're actually running on — see step 3b |
| "Failed to generate questions/feedback" | The configured OpenRouter model may be deprecated or rate-limited — check `services/Constants.jsx` / the API routes and try a different `:free` model from [openrouter.ai/models](https://openrouter.ai/models?max_price=0) |
| Voice call never connects, or errors immediately | Your browser denied microphone access, or the Vapi dashboard doesn't have an OpenAI provider credential configured |

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
├── supabase/                     # Database schema (migrations) and project config
└── public/                       # Static assets
```

## 🔧 Database Schema

Managed entirely through `supabase/migrations/` (see [Local Setup](#-local-setup) above to provision it) — don't create these tables by hand, the migrations are the source of truth:

- **`Interviews`** — interview configurations created by recruiters (job details, duration, type, generated questions)
- **`Users`** — recruiter profile rows, created on first sign-in
- **`Responses`** — candidate feedback and transcripts, one row per completed interview

`Interviews` and `Users` have no anonymous access at all; a candidate reads their specific interview through the `get_public_interview(interviewId)` function instead (see `supabase/migrations/20260903000000_lock_down_interviews_and_users_rls.sql`), so a link is only useful to someone who already has it.

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
2. Set the same four variables from [step 5 of Local Setup](#5-set-up-environment-variables) in the Vercel dashboard (Project Settings → Environment Variables), for **Production** and **Preview** — type them in directly rather than piping them in from a script; a value corrupted by a stray character (e.g. a shell/encoding artifact) fails silently and can be very hard to trace back
3. In Supabase Auth's URL Configuration (or `supabase/config.toml`), set the **Site URL** and **Redirect URLs** to your actual Vercel production domain, not a specific preview deployment URL — those get garbage-collected and a stale one there will break every login
4. Deploy automatically on push to main branch

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
