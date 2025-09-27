import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  text: string;
}

export class ResumeParser {
  static async parseFile(file: File): Promise<ResumeData> {
    const fileType = file.type;
    let text = '';

    try {
      if (fileType === 'application/pdf') {
        text = await this.parsePDF(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.parseDOCX(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
      }

      return this.extractInfo(text);
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume. Please ensure the file is not corrupted.');
    }
  }

  private static async parsePDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const data = await pdfParse(arrayBuffer);
          resolve(data.text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private static async parseDOCX(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private static extractInfo(text: string): ResumeData {
    const resumeData: ResumeData = { text };

    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      resumeData.email = emailMatch[0];
    }

    // Extract phone number
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      resumeData.phone = phoneMatch[0].trim();
    }

    // Extract name (first line that looks like a name)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    for (const line of lines.slice(0, 10)) { // Check first 10 lines
      if (this.isNameLine(line)) {
        resumeData.name = line;
        break;
      }
    }

    return resumeData;
  }

  private static isNameLine(line: string): boolean {
    // Skip lines that contain email, phone, or common resume headers
    const skipPatterns = [
      /@/, // Contains email
      /phone|tel|mobile|cell/i,
      /resume|cv|curriculum/i,
      /experience|education|skills/i,
      /linkedin|github|portfolio/i,
    ];

    for (const pattern of skipPatterns) {
      if (pattern.test(line)) {
        return false;
      }
    }

    // Check if line looks like a name (2-4 words, mostly letters, title case)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      return words.every(word => 
        word.length > 1 && 
        /^[A-Z][a-z]+$/.test(word)
      );
    }

    return false;
  }
}
