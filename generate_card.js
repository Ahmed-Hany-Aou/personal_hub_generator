import inquirer from 'inquirer';
import qr from 'qr-image';
import fs from 'fs';
import { Jimp, loadFont } from 'jimp';
import { SANS_64_WHITE, SANS_64_BLACK, SANS_32_BLACK, SANS_32_WHITE } from 'jimp/fonts';

console.log("\n------------------------------------------------");
console.log("🧙 BMAD ELITE: Personal Hub & Card Generator");
console.log("------------------------------------------------\n");

const questions = [
  {
    type: 'list',
    name: 'designStyle',
    message: 'Select your Elite WEB Design Style:',
    choices: [
      { name: '💎 Elite Glassmorphism', value: 'elite-glass' },
      { name: '🔳 Minimalist Pro', value: 'elite-minimal' }
    ]
  },
  {
    type: 'list',
    name: 'cardTheme',
    message: 'Select your Elite BUSINESS CARD Theme:',
    choices: [
      { name: '🌌 Midnight Glass (Dark & Futuristic)', value: 'glass' },
      { name: '⚪ Professional Clean (White & Bold)', value: 'clean' }
    ]
  },
  {
    type: 'list',
    name: 'accentColor',
    message: 'Select your Elite Accent Color:',
    choices: [
      { name: '🟣 Royal Indigo', value: '#6366f1' },
      { name: '🟡 Prestige Gold', value: '#d4af37' },
      { name: '🟢 Emerald Success', value: '#10b981' },
      { name: '🔴 Ruby Professional', value: '#e11d48' }
    ]
  },
  {
    type: 'input',
    name: 'fullName',
    message: 'What is your Full Name?',
    default: 'Ahmed Hany'
  },
  {
    type: 'input',
    name: 'jobTitle',
    message: 'What is your Job Title?',
    default: 'Software Engineer'
  },
  {
    type: 'input',
    name: 'phone',
    message: 'Phone Number (International):',
    default: '+20 123 456 789'
  },
  {
    type: 'input',
    name: 'email',
    message: 'Email Address:'
  },
  {
    type: 'input',
    name: 'portfolioUrl',
    message: 'Portfolio URL:',
  },
  {
    type: 'input',
    name: 'githubUrl',
    message: 'GitHub URL:',
  },
  {
    type: 'input',
    name: 'linkedinUrl',
    message: 'LinkedIn URL:',
  },
  {
    type: 'input',
    name: 'baseUrl',
    message: 'Base URL (for QR code):',
    validate: (input) => input.startsWith('http') ? true : 'Invalid URL.'
  }
];

// Helper to replace template variables
function renderTemplate(template, data) {
  let result = template;
  for (const key in data) {
    if (typeof data[key] === 'string') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    }
  }
  const linksRegex = /{{#links}}([\s\S]*?){{\/links}}/;
  const match = result.match(linksRegex);
  if (match) {
    const linkTemplate = match[1];
    const renderedLinks = data.links.map(link => {
      return linkTemplate.replace(/{{url}}/g, link.url).replace(/{{label}}/g, link.label);
    }).join('\n');
    result = result.replace(linksRegex, renderedLinks);
  }
  return result;
}

// Helper to convert hex string to Jimp color number
function hexToJimpColor(hex) {
  return parseInt(hex.replace('#', '') + 'ff', 16);
}

inquirer.prompt(questions).then(async (answers) => {
  console.log("\n📋 Ops Director: Initializing Elite Production Workflow...");

  const whatsAppNumber = answers.phone.replace(/[^0-9]/g, '');
  const accentHex = hexToJimpColor(answers.accentColor);
  
  // 1. Generate vCard
  const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${answers.fullName}
TITLE:${answers.jobTitle}
TEL;TYPE=CELL:${answers.phone}
EMAIL:${answers.email}
END:VCARD`;
  fs.writeFileSync('contact.vcf', vCardContent);
  console.log("✅ Ops Director: vCard finalized.");

  // 2. Generate Elite HTML
  console.log(`🎨 Creative Director: Styling your Personal Hub...`);
  const links = [];
  if (answers.portfolioUrl) links.push({ url: answers.portfolioUrl, label: '🎨 Portfolio' });
  if (answers.githubUrl) links.push({ url: answers.githubUrl, label: '💻 GitHub' });
  if (answers.linkedinUrl) links.push({ url: answers.linkedinUrl, label: '🔗 LinkedIn' });

  const templatePath = `./templates/${answers.designStyle}.html`;
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const htmlContent = renderTemplate(templateSource, { ...answers, whatsAppNumber, links });
  fs.writeFileSync('index.html', htmlContent);
  console.log("✅ Creative Director: Elite Home Page created.");

  // 3. Generate QR Code
  const qr_svg = qr.image(answers.baseUrl, { type: 'png' });
  const qrStream = fs.createWriteStream('qr_code.png');
  qr_svg.pipe(qrStream);

  qrStream.on('finish', async () => {
    console.log("✅ Ops Director: QR Code generated.");

    // 4. DYNAMIC CARD ENGINE
    console.log(`⚙️ Lead Developer: Constructing ${answers.cardTheme} Business Card...`);
    
    try {
      const card = new Jimp({ width: 1050, height: 600, color: answers.cardTheme === 'glass' ? 0x0f172aff : 0xffffffff });
      const qrImage = await Jimp.read('qr_code.png');
      qrImage.resize({ w: 300, h: 300 });

      if (answers.cardTheme === 'glass') {
        for (let x = 0; x < 1050; x++) {
          for (let y = 0; y < 10; y++) {
            card.setPixelColor(accentHex, x, y + 580);
          }
        }
      } else {
        for (let x = 0; x < 20; x++) {
          for (let y = 0; y < 600; y++) {
            card.setPixelColor(accentHex, x, y);
          }
        }
      }

      const font = await loadFont(answers.cardTheme === 'glass' ? SANS_64_WHITE : SANS_64_BLACK);
      const smallFont = await loadFont(answers.cardTheme === 'glass' ? SANS_32_WHITE : SANS_32_BLACK);

      card.print({ font: font, x: 80, y: 150, text: answers.fullName });
      card.print({ font: smallFont, x: 80, y: 230, text: answers.jobTitle.toUpperCase() });

      card.composite(qrImage, 680, 150);

      await card.write('final_card_with_qr.png');
      console.log("✅ Ops Director: Unique Business Card finalized.");

    } catch (err) {
      console.error("❌ Lead Developer: Error in Dynamic Card Engine:", err);
    }

    console.log("\n------------------------------------------------");
    console.log("🎉 SUCCESS! Your Elite Digital Suite is ready.");
    console.log("------------------------------------------------");
  });
});
