const fs = require('fs');
const file = 'src/components/OnboardingModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace("import { Upload, Sparkles, MapPin, X } from 'lucide-react';", "import { Upload, Sparkles, MapPin, X } from 'lucide-react';\nimport { Turnstile } from '@marsidev/react-turnstile';");

// Add token state
content = content.replace("const [location, setLocation] = useState('');", "const [location, setLocation] = useState('');\n  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);");

// Add Turnstile widget before the submit button
const buttonTarget = "<Button className=\"w-full\" size=\"lg\" onClick={() => {";
const widgetCode = `<div className="flex justify-center mb-4">\n              <Turnstile siteKey="0x4AAAAAAFMlzAzHo74-FsaR" onSuccess={(token) => setTurnstileToken(token)} options={{ action: 'onboarding' }} />\n            </div>\n            `;
content = content.replace(buttonTarget, widgetCode + buttonTarget);

// Add token check
content = content.replace("onClick={() => {\n              localStorage.setItem", "onClick={() => {\n              if (!turnstileToken) return alert('Please complete the security check.');\n              // Send token to backend or extension here\n              console.log('Turnstile token:', turnstileToken);\n              localStorage.setItem");

fs.writeFileSync(file, content);
