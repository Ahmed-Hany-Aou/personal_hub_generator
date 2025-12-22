import inquirer from 'inquirer';
import qr from 'qr-image';
import fs from 'fs';

console.log("Welcome to the Personal Hub Generator!");
console.log("Let's build your digital business card.");

const questions = [
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
    message: 'What is your Phone Number (International Format)?',
    default: '+20 123 456 789'
  },
  {
    type: 'input',
    name: 'email',
    message: 'What is your Email Address?'
  },
  {
    type: 'input',
    name: 'portfolioUrl',
    message: 'Link to your Portfolio (e.g. Behance, Dribbble, Custom Site):',
  },
  {
    type: 'input',
    name: 'liveAppUrl',
    message: 'Link to your Live Production App:',
  },
  {
    type: 'input',
    name: 'cvUrl',
    message: 'Link to your CV (Google Drive/PDF):',
  },
  {
    type: 'input',
    name: 'githubUrl',
    message: 'Link to your GitHub:',
  },
  {
    type: 'input',
    name: 'linkedinUrl',
    message: 'Link to your LinkedIn:',
  },
  {
    type: 'input',
    name: 'baseUrl',
    message: 'FINAL STEP: Where will you host this? (Base URL)\n This is the URL the QR code will point to.',
    validate: (input) => input.startsWith('http') ? true : 'Please enter a valid URL starting with http:// or https://'
  }
];

inquirer.prompt(questions).then((answers) => {
  console.log("\nGenerating your files...\n");

  // Format WhatsApp number (remove +, spaces, dashes)
  const whatsAppNumber = answers.phone.replace(/[^0-9]/g, '');

  // 1. Generate vCard Content
  let vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${answers.fullName}
TITLE:${answers.jobTitle}
TEL;TYPE=CELL:${answers.phone}
EMAIL:${answers.email}`;

  if (answers.portfolioUrl) vCardContent += `\nURL;TYPE=PORTFOLIO:${answers.portfolioUrl}`;
  if (answers.liveAppUrl) vCardContent += `\nURL;TYPE=WEBSITE:${answers.liveAppUrl}`;
  if (answers.cvUrl) vCardContent += `\nURL;TYPE=CV:${answers.cvUrl}`;

  vCardContent += `\nEND:VCARD`;

  fs.writeFileSync('contact.vcf', vCardContent);
  console.log("✅ contact.vcf created.");

  // 2. Generate HTML Landing Page
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${answers.fullName} - Digital Card</title>
    <style>
        :root {
            --bg-color: #1a1a1a;
            --card-bg: #2d2d2d;
            --text-primary: #ffffff;
            --text-secondary: #b3b3b3;
            --accent: #3498db;
            --btn-hover: #2980b9;
            --whatsapp-color: #25D366;
            --whatsapp-hover: #128C7E;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: var(--card-bg);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: block;
            object-fit: cover;
            border: 4px solid var(--card-bg);
            box-shadow: 0 0 0 4px var(--accent);
            background-color: var(--card-bg);
        }
        h1 { margin: 10px 0 5px; font-size: 24px; }
        p.title { color: var(--text-secondary); margin: 0 0 30px; font-size: 16px; }
        
        .btn {
            display: block;
            width: 100%;
            padding: 15px 0;
            margin-bottom: 15px;
            background-color: var(--card-bg);
            border: 2px solid var(--accent);
            color: var(--text-primary);
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }
        .btn:hover {
            background-color: var(--accent);
            color: white;
            transform: translateY(-2px);
        }
        .btn.primary {
            background-color: var(--accent);
            color: white;
            border: none;
        }
        .btn.primary:hover {
            background-color: var(--btn-hover);
        }
        .btn.whatsapp {
            background-color: transparent;
            border-color: var(--whatsapp-color);
            color: var(--whatsapp-color);
        }
        .btn.whatsapp:hover {
            background-color: var(--whatsapp-color);
            color: white;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>

    <div class="container">
        <!-- Profile Picture: Expected to be in the same folder -->
        <img src="profile_pic.png" alt="${answers.fullName}" class="avatar">

        <h1>${answers.fullName}</h1>
        <p class="title">${answers.jobTitle}</p>

        <!-- Main Content -->
        
        ${answers.portfolioUrl ? `<a href="${answers.portfolioUrl}" class="btn" target="_blank">🎨 View Portfolio</a>` : ''}
        ${answers.cvUrl ? `<a href="${answers.cvUrl}" class="btn" target="_blank">📄 View CV</a>` : ''}
        ${answers.liveAppUrl ? `<a href="${answers.liveAppUrl}" class="btn" target="_blank">🚀 Live Production App</a>` : ''}
        ${answers.githubUrl ? `<a href="${answers.githubUrl}" class="btn" target="_blank">💻 GitHub Profile</a>` : ''}
        ${answers.linkedinUrl ? `<a href="${answers.linkedinUrl}" class="btn" target="_blank">🔗 LinkedIn</a>` : ''}
        
        <hr style="border-color: #444; margin: 25px 0;">

        <a href="contact.vcf" class="btn primary">📞 Save Contact Info</a>
        <a href="tel:${answers.phone}" class="btn">Call Me</a>
        <a href="https://wa.me/${whatsAppNumber}" class="btn whatsapp" target="_blank">💬 WhatsApp Me</a>

        <div class="footer">
            Generated with Personal Hub Generator
        </div>
    </div>

</body>
</html>
`;

  fs.writeFileSync('index.html', htmlContent);
  console.log("✅ index.html created.");

  // 3. Generate QR Code
  // The QR code simply points to the user's hosting URL
  const qr_svg = qr.image(answers.baseUrl, { type: 'png' });
  qr_svg.pipe(fs.createWriteStream('qr_code.png'));
  console.log(`✅ qr_code.png created (pointing to ${answers.baseUrl})`);

  console.log("\n------------------------------------------------");
  console.log("🎉 SUCCESS! Your Digital Business Card is ready.");
  console.log("------------------------------------------------");
  console.log("Next Steps:");
  console.log("1. Host 'index.html' and 'contact.vcf' at your URL: " + answers.baseUrl);
  console.log("2. Print or show 'qr_code.png' to people.");
});
