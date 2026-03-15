import qr from 'qr-image';
import fs from 'fs';
import { Jimp, loadFont } from 'jimp';
import { SANS_64_WHITE, SANS_64_BLACK, SANS_32_BLACK, SANS_32_WHITE } from 'jimp/fonts';

// READ CONFIGURATION
const answers = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Helper to replace template variables
function renderTemplate(template, data) {
  let result = template;
  // Handle sections ({{#key}}...{{/key}})
  const sectionRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
  result = result.replace(sectionRegex, (match, key, content) => {
    if (key === 'links' && Array.isArray(data.links)) {
      return data.links.map(link => {
        return content.replace(/{{url}}/g, link.url).replace(/{{label}}/g, link.label);
      }).join('\n');
    }
    return data[key] ? content : '';
  });
  // Handle simple variables
  for (const key in data) {
    if (typeof data[key] === 'string' || typeof data[key] === 'number') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    }
  }
  return result;
}

// Helper to convert hex string to Jimp color number
function hexToJimpColor(hex) {
  return parseInt(hex.replace('#', '') + 'ff', 16);
}

async function startGeneration() {
  console.log("\n📋 Ops Director: Initializing AUTOMATED Elite Production...");

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
  if (answers.portfolioUrl) links.push({ url: answers.portfolioUrl, label: '🎨 View Portfolio' });
  if (answers.cvUrl) links.push({ url: answers.cvUrl, label: '📄 View CV' });
  if (answers.productionAppUrl) links.push({ url: answers.productionAppUrl, label: '🚀 Live Production App' });
  if (answers.githubUrl) links.push({ url: answers.githubUrl, label: '💻 GitHub Profile' });
  if (answers.linkedinUrl) links.push({ url: answers.linkedinUrl, label: '🔗 LinkedIn' });

  const templatePath = `./templates/${answers.designStyle}.html`;
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  
  const templateData = {
    ...answers,
    links,
    bloom: answers.visualEffect === 'bloom',
    particles: answers.visualEffect === 'particles'
  };

  const htmlContent = renderTemplate(templateSource, templateData);
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

      // Load fonts using Jimp 1.6.0 method
      const font = await loadFont(answers.cardTheme === 'glass' ? SANS_64_WHITE : SANS_64_BLACK);
      const smallFont = await loadFont(answers.cardTheme === 'glass' ? SANS_32_WHITE : SANS_32_BLACK);

      if (answers.cardLayout === 'vertical') {
          // Vertical Layout: QR at bottom, Info at top
          card.print({ font: font, x: 80, y: 80, text: answers.fullName });
          card.print({ font: smallFont, x: 80, y: 160, text: answers.jobTitle.toUpperCase() });
          card.print({ font: smallFont, x: 80, y: 240, text: `TEL: ${answers.phone}` });
          card.print({ font: smallFont, x: 80, y: 290, text: `MAIL: ${answers.email}` });
          
          qrImage.resize({ w: 200, h: 200 }); // Smaller QR for vertical bottom
          card.composite(qrImage, 425, 350); 
      } else if (answers.cardLayout === 'qr-only') {
          // QR-Only: Large QR in center, Name at bottom
          qrImage.resize({ w: 400, h: 400 });
          card.composite(qrImage, 325, 60);
          card.print({ font: font, x: 80, y: 500, text: answers.fullName, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER });
      } else {
          // Standard Layout (or default)
          card.print({ font: font, x: 80, y: 150, text: answers.fullName });
          card.print({ font: smallFont, x: 80, y: 230, text: answers.jobTitle.toUpperCase() });
          card.print({ font: smallFont, x: 80, y: 320, text: `TEL: ${answers.phone}` });
          card.print({ font: smallFont, x: 80, y: 370, text: `MAIL: ${answers.email}` });
          card.composite(qrImage, 680, 150);
      }

      await card.write('final_card_with_qr.png');
      console.log("✅ Ops Director: Unique Business Card finalized.");

    } catch (err) {
      console.error("❌ Lead Developer: Error in Dynamic Card Engine:", err);
    }

    console.log("\n------------------------------------------------");
    console.log("🎉 SUCCESS! Your Elite Digital Suite is ready.");
    console.log("------------------------------------------------");
  });
}

startGeneration();
