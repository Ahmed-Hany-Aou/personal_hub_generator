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
    name: 'websiteUrl',
    message: 'Link to your Personal Website (if different):',
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

  // 1. Generate vCard Content
  // vCard 3.0 allows multiple URL properties. We add them if they exist.
  let vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${answers.fullName}
TITLE:${answers.jobTitle}
TEL;TYPE=CELL:${answers.phone}
EMAIL:${answers.email}`;

  if (answers.portfolioUrl) vCardContent += `\nURL;TYPE=PORTFOLIO:${answers.portfolioUrl}`;
  if (answers.websiteUrl) vCardContent += `\nURL;TYPE=WEBSITE:${answers.websiteUrl}`;

  vCardContent += `\nEND:VCARD`;

  fs.writeFileSync('contact.vcf', vCardContent);
  console.log("✅ contact.vcf created.");

  // 2. Generate HTML Landing Page
  // Using a clean, modern, dark-themed CSS directly in the file
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
            background-color: var(--accent);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: bold;
            color: white;
            border: 4px solid var(--card-bg);
            box-shadow: 0 0 0 4px var(--accent);
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
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>

    <div class="container">
        <!-- Initials as Avatar -->
        <div class="avatar">
            ${answers.fullName.split(' ').map(n => n[0]).join('')}
        </div>

        <h1>${answers.fullName}</h1>
        <p class="title">${answers.jobTitle}</p>

        <!-- Main Content -->
        
        ${answers.portfolioUrl ? `<a href="${answers.portfolioUrl}" class="btn" target="_blank">🎨 View Portfolio</a>` : ''}
        ${answers.websiteUrl ? `<a href="${answers.websiteUrl}" class="btn" target="_blank">🌐 Personal Website</a>` : ''}
        ${answers.githubUrl ? `<a href="${answers.githubUrl}" class="btn" target="_blank">💻 GitHub Profile</a>` : ''}
        ${answers.linkedinUrl ? `<a href="${answers.linkedinUrl}" class="btn" target="_blank">🔗 LinkedIn</a>` : ''}
        
        <hr style="border-color: #444; margin: 25px 0;">

        <a href="contact.vcf" class="btn primary">📞 Save Contact Info</a>
        <a href="tel:${answers.phone}" class="btn">Call Me</a>

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
