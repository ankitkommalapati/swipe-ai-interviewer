import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
          
          // Load the PDF document
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          // Extract text from all pages
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Combine all text items from the page
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            
            fullText += pageText + '\n';
          }
          
          resolve(fullText.trim());
        } catch (error) {
          console.error('Error parsing PDF:', error);
          // Provide more specific error messages
          if (error instanceof Error) {
            if (error.message.includes('Invalid PDF')) {
              reject(new Error('Invalid PDF file. Please ensure the file is a valid PDF document.'));
            } else if (error.message.includes('password')) {
              reject(new Error('This PDF is password protected. Please use an unprotected PDF file.'));
            } else {
              reject(new Error(`Failed to parse PDF: ${error.message}`));
            }
          } else {
            reject(new Error('Failed to parse PDF file. Please ensure the file is not corrupted.'));
          }
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
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

    // Extract email - improved regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatches = text.match(emailRegex);
    if (emailMatches && emailMatches.length > 0) {
      resumeData.email = emailMatches[0];
    }

    // Extract phone number - improved regex patterns
    const phoneRegexes = [
      /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g
    ];

    for (const regex of phoneRegexes) {
      const phoneMatches = text.match(regex);
      if (phoneMatches && phoneMatches.length > 0) {
        let phone = phoneMatches[0].trim();
        // Clean up phone number formatting
        phone = phone.replace(/^\+?1\s?/, ''); // Remove leading +1 or 1
        phone = phone.replace(/\D/g, ''); // Remove all non-digits
        if (phone.length === 10) {
          resumeData.phone = phone; // Keep as plain 10 digits: 9885081606
        } else {
          resumeData.phone = phoneMatches[0].trim(); // Keep original if not 10 digits
        }
        break;
      }
    }

    // Extract name - improved logic
    const lines = text.split(/\n|,|;|\./).map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for name patterns in first 15 lines
    for (const line of lines.slice(0, 15)) {
      if (this.isNameLine(line)) {
        resumeData.name = line;
        break;
      }
    }

    // If no name found with strict rules, try looser patterns
    if (!resumeData.name) {
      for (const line of lines.slice(0, 10)) {
        if (line.length > 2 && line.length < 50 && /^[A-Za-z\s]+$/.test(line) && line.split(' ').length >= 2) {
          resumeData.name = line;
          break;
        }
      }
    }

    return resumeData;
  }

  private static isNameLine(line: string): boolean {
    // Skip lines that contain email, phone, or common resume headers
    const skipPatterns = [
      /@/, // Contains email
      /phone|tel|mobile|cell|fax/i,
      /resume|cv|curriculum/i,
      /experience|education|skills|summary|objective/i,
      /linkedin|github|portfolio|website/i,
      /address|street|city|state|zip/i,
      /^\d/, // Starts with number
      /[^\w\s-]/, // Contains special characters except hyphens
    ];

    for (const pattern of skipPatterns) {
      if (pattern.test(line)) {
        return false;
      }
    }

    // Check if line looks like a name (2-4 words, mostly letters)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      // Check if most words start with capital letters (name pattern)
      const capitalizedWords = words.filter(word => 
        word.length > 1 && 
        /^[A-Z][a-z]+$/.test(word)
      );
      
      // At least 2 words should be capitalized, or all words if 2 total
      return capitalizedWords.length >= Math.min(2, words.length);
    }

    return false;
  }
}
