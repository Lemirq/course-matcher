# UofT Course Matcher

A web application that helps University of Toronto students find classmates with similar course schedules by matching their academic calendars. Built for UofT students to connect with peers who share courses and potentially coordinate study groups, projects, or social activities.

## ✨ Features

- **Calendar Upload**: Upload your course schedule from Acorn as an ICS file or paste the contents directly
- **Smart Matching**: Find students who share courses with you based on their uploaded schedules
- **Detailed Overlaps**: View specific time overlaps for shared courses, including locations and meeting times
- **Student Directory**: Browse all registered students with search functionality
- **Privacy Focused**: Only matches students who have uploaded their schedules
- **Rate Limited**: Built-in rate limiting to prevent abuse

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project
- Access to UofT Acorn (for calendar downloads)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd course-matcher
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**

   The app expects these Supabase tables:
   - `students` - Student information (id, name, email, year)
   - `calendars` - Raw ICS calendar data
   - `student_courses` - Courses each student is taking
   - `events` - Individual calendar events parsed from ICS files

5. **Run the development server**

   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** with your browser

## 📖 How to Use

### 1. Upload Your Calendar

1. Go to [acorn.utoronto.ca](https://acorn.utoronto.ca)
2. Navigate to "Timetable & Exams"
3. Click "Download Calendar Export" to download your `.ics` file
4. Return to Course Matcher and either:
   - Upload the ICS file directly, or
   - Open the file and paste its contents into the text area
5. Fill in your details (name, UofT email, year of study)
6. Click "Upload calendar"

### 2. Find Matches

1. After uploading, click "Find matches" or visit the [Matches page](/matches)
2. Enter your email address
3. Click "Search" to see students with overlapping courses
4. Click on any student to view detailed schedule overlaps

### 3. Browse Students

Visit the [Students page](/students) to see all registered students and search by name or email.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [Radix UI](https://www.radix-ui.com) primitives
- **Database**: [Supabase](https://supabase.com)
- **Calendar Parsing**: [node-ical](https://github.com/mozilla-comm/ical.js)
- **Icons**: [Lucide React](https://lucide.dev)

## 📁 Project Structure

```
course-matcher/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── upload/        # Calendar upload endpoint
│   │   ├── matches/       # Match finding endpoint
│   │   ├── match-detail/  # Detailed match info endpoint
│   │   └── students/      # Students listing endpoint
│   ├── lib/               # Utility libraries
│   │   ├── ics.ts         # ICS calendar parsing
│   │   ├── supabase.ts    # Database client
│   │   └── rateLimit.ts   # Rate limiting logic
│   ├── matches/           # Match finding page
│   ├── students/          # Students directory page
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   └── ui/               # Radix UI components
└── public/               # Static assets
```

## 🔧 API Endpoints

- `POST /api/upload` - Upload and parse calendar data
- `GET /api/matches?email=...` - Find students with matching courses
- `GET /api/match-detail?meEmail=...&otherId=...` - Get detailed schedule overlaps
- `GET /api/students?q=...` - List students (with optional search)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is private and intended for University of Toronto students only.

## ⚠️ Limitations

- **No Updates**: Currently, you cannot update your calendar after uploading (vote for this feature in the app!)
- **UofT Only**: Designed specifically for University of Toronto students
- **Privacy**: All data is stored and processed for matching purposes only
- **Rate Limited**: Uploads are rate-limited to prevent abuse

## 🐛 Known Issues

- Calendar parsing may not work perfectly for all ICS file formats
- Some complex recurring events might not be handled correctly
- Time zone handling assumes Eastern Time (EST/EDT)

## 📞 Support

For issues or questions:

1. Check the [guide page](/guide) in the app for usage instructions
2. Open an issue in the repository
3. Contact the development team

---

Built with ❤️ for the UofT community
