const fs = require('fs');
let text = fs.readFileSync('public/_headers', 'utf8');
text = text.replace("script-src 'self'", "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com");
text = text.replace("frame-src 'self' blob:", "frame-src 'self' blob: https://challenges.cloudflare.com");
fs.writeFileSync('public/_headers', text);
