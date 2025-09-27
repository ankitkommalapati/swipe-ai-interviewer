# Swipe AI Interviewer

An AI-powered interview assistant built with React and TypeScript that provides a seamless interview experience for both candidates and interviewers.

## Features

### For Candidates (Interviewee Tab)
- **Resume Upload**: Upload PDF or DOCX resumes with automatic information extraction
- **Profile Completion**: AI chatbot collects missing information (name, email, phone)
- **Timed Interview**: 6 questions with different difficulty levels (2 Easy, 2 Medium, 2 Hard)
- **Real-time Feedback**: AI evaluates answers and provides immediate feedback
- **Progress Tracking**: Visual progress indicators and question timers
- **Session Persistence**: Resume interrupted interviews with "Welcome Back" modal

### For Interviewers (Dashboard Tab)
- **Candidate Management**: View all candidates with scores and status
- **Detailed Analytics**: Complete interview history, scores, and AI summaries
- **Search & Filter**: Find candidates by name, email, or interview status
- **Performance Metrics**: Score-based sorting and rating system
- **Export Ready**: Detailed candidate profiles for hiring decisions

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Ant Design
- **File Processing**: PDF-parse, Mammoth (for DOCX)
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Routing**: React Router
- **Persistence**: Local Storage via Redux Persist

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swipe-ai-interviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### For Candidates

1. **Upload Resume**: Upload your PDF or DOCX resume
2. **Complete Profile**: Fill in any missing information prompted by the AI
3. **Start Interview**: Begin the timed interview with 6 questions
4. **Answer Questions**: Provide detailed answers within the time limit
5. **Review Results**: View your final score and AI-generated summary

### For Interviewers

1. **Access Dashboard**: Switch to the Interviewer tab
2. **View Candidates**: See all candidates sorted by performance
3. **Filter & Search**: Use the search bar and status filters
4. **View Details**: Click "View Details" to see complete interview history
5. **Make Decisions**: Use scores and summaries for hiring decisions

## Interview Format

The interview consists of 6 questions with the following structure:

- **Easy Questions (2)**: 20 seconds each
  - Basic React/JavaScript concepts
  - Fundamental programming knowledge

- **Medium Questions (2)**: 60 seconds each
  - Practical development scenarios
  - Problem-solving approaches

- **Hard Questions (2)**: 120 seconds each
  - System design challenges
  - Complex technical scenarios

## AI Evaluation

The AI evaluates answers based on:
- Technical accuracy
- Completeness of response
- Relevance to the question
- Practical understanding
- Problem-solving approach

Scores range from 1-10 with detailed feedback for each answer.

## Data Persistence

All interview data is automatically saved to local storage, including:
- Candidate profiles and resumes
- Interview progress and answers
- AI evaluations and summaries
- Session state and timers

This ensures no data loss if the browser is closed or refreshed during an interview.

## Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Set Environment Variables**: Add your OpenAI API key in Vercel dashboard
3. **Deploy**: Automatic deployment on every push to main branch

### Netlify

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `build`
3. **Environment Variables**: Add your OpenAI API key
4. **Deploy**: Automatic deployment on every push

## API Configuration

The application uses OpenAI's GPT-3.5-turbo model for:
- Question generation
- Answer evaluation
- Summary creation

### Cost Considerations

- Typical interview session: ~$0.10-0.20
- Question generation: ~$0.02
- Answer evaluation: ~$0.01-0.03 per question
- Summary generation: ~$0.02

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## Roadmap

- [ ] Video interview support
- [ ] Multiple interview templates
- [ ] Advanced analytics dashboard
- [ ] Candidate comparison tools
- [ ] Integration with HR systems
- [ ] Mobile app development

---

Built with ❤️ for modern hiring processes