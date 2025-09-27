const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  const envContent = `# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file. Please add your OpenAI API key.');
} else {
  console.log('✅ .env file already exists.');
}

// Create .env.example file
const envExampleContent = `# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
`;

fs.writeFileSync(envExamplePath, envExampleContent);
console.log('✅ Created .env.example file.');

console.log('\n🚀 Setup complete! Next steps:');
console.log('1. Add your OpenAI API key to the .env file');
console.log('2. Run: npm start');
console.log('3. Open http://localhost:3000');
