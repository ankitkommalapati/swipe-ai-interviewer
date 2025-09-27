import { Question } from '../types';

export interface AIResponse {
  questions?: Question[];
  score?: number;
  summary?: string;
  message?: string;
}

export class AIService {
  private static readonly API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
  private static readonly API_URL = 'https://api.openai.com/v1/chat/completions';

  static async generateQuestions(): Promise<Question[]> {
    const prompt = `
    Generate 6 interview questions for a Full Stack Developer position (React/Node.js).
    Format: 2 Easy, 2 Medium, 2 Hard questions.
    Each question should be practical and relevant to full-stack development.
    
    Return as JSON array with this structure:
    [
      {
        "id": "q1",
        "text": "Question text here",
        "difficulty": "easy|medium|hard",
        "timeLimit": 20|60|120,
        "category": "React|Node.js|Database|System Design|General"
      }
    ]
    `;

    try {
      const response = await this.callOpenAI(prompt);
      const questions = JSON.parse(response);
      
      // Validate and format questions
      return questions.map((q: any, index: number) => ({
        id: `q${index + 1}`,
        text: q.text,
        difficulty: q.difficulty,
        timeLimit: this.getTimeLimit(q.difficulty),
        category: q.category || 'General'
      }));
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      return this.getFallbackQuestions();
    }
  }

  static async evaluateAnswer(question: Question, answer: string): Promise<number> {
    const prompt = `
    Evaluate this interview answer for a Full Stack Developer position.
    
    Question: ${question.text}
    Difficulty: ${question.difficulty}
    Answer: ${answer}
    
    Rate the answer on a scale of 1-10 considering:
    - Technical accuracy
    - Completeness
    - Relevance to the question
    - Practical understanding
    
    Return only the numeric score (1-10).
    `;

    try {
      const response = await this.callOpenAI(prompt);
      const score = parseInt(response.trim());
      return Math.max(1, Math.min(10, score || 5)); // Clamp between 1-10
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return 5; // Default score
    }
  }

  static async generateFinalSummary(answers: Array<{ question: string; answer: string; score: number }>): Promise<string> {
    const prompt = `
    Based on these interview responses, provide a brief summary of the candidate's performance.
    
    Interview Responses:
    ${answers.map((a, i) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}\n   Score: ${a.score}/10`).join('\n\n')}
    
    Provide a concise 2-3 sentence summary highlighting strengths and areas for improvement.
    `;

    try {
      return await this.callOpenAI(prompt);
    } catch (error) {
      console.error('Error generating summary:', error);
      const avgScore = answers.reduce((sum, a) => sum + a.score, 0) / answers.length;
      return `Candidate scored an average of ${avgScore.toFixed(1)}/10. ${avgScore >= 7 ? 'Strong performance with good technical understanding.' : avgScore >= 5 ? 'Average performance with room for improvement.' : 'Below average performance requiring significant development.'}`;
    }
  }

  private static async callOpenAI(prompt: string): Promise<string> {
    if (!this.API_KEY || this.API_KEY === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please add your API key to the .env file.');
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, response.statusText, errorText);
      throw new Error(`OpenAI API error (${response.status}): ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    return data.choices[0].message.content;
  }

  private static getTimeLimit(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 20;
      case 'medium': return 60;
      case 'hard': return 120;
      default: return 60;
    }
  }

  private static getFallbackQuestions(): Question[] {
    return [
      {
        id: 'q1',
        text: 'What is React and what are its main advantages?',
        difficulty: 'easy',
        timeLimit: 20,
        category: 'React'
      },
      {
        id: 'q2',
        text: 'Explain the difference between let, const, and var in JavaScript.',
        difficulty: 'easy',
        timeLimit: 20,
        category: 'General'
      },
      {
        id: 'q3',
        text: 'How would you handle state management in a large React application?',
        difficulty: 'medium',
        timeLimit: 60,
        category: 'React'
      },
      {
        id: 'q4',
        text: 'Describe the difference between SQL and NoSQL databases. When would you use each?',
        difficulty: 'medium',
        timeLimit: 60,
        category: 'Database'
      },
      {
        id: 'q5',
        text: 'How would you design a scalable microservices architecture for an e-commerce platform?',
        difficulty: 'hard',
        timeLimit: 120,
        category: 'System Design'
      },
      {
        id: 'q6',
        text: 'Explain how you would implement authentication and authorization in a Node.js API.',
        difficulty: 'hard',
        timeLimit: 120,
        category: 'Node.js'
      }
    ];
  }
}
