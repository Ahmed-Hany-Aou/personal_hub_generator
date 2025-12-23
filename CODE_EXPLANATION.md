# Project Explanation & Code Walkthrough

## 🛠️ Technologies Used

1.  **Node.js**: The "engine" that runs our JavaScript code outside of a browser. It allows us to read/write files and use powerful libraries.
2.  **Inquirer.js**: This is the library that makes the terminal ask you questions (like "What is your name?"). It handles the interaction.
3.  **QR-Image**: A specialized library that takes text (your URL) and converts it into a QR code image (PNG).
4.  **Jimp (JavaScript Image Manipulation Program)**: Think of this as "Photoshop for code". We used it to load your business card image, resize the QR code, and "stamp" (composite) the QR code onto your card at a specific spot.
5.  **HTML5 & CSS3**: Used to build the `index.html` landing page. We used modern CSS variables (`:root`) to make the dark theme easy to manage.
6.  **vCard (VCF)**: This isn't a library, but a **standard file format**. Phones act differently with just links, but when you give them a `.vcf` file, they know exactly how to "Save Contact".

## 👨‍💻 Code Walkthrough (`generate_card.js`)

Here is what is happening inside the script, step-by-step:

### 1. Imports & Setup
```javascript
import inquirer from 'inquirer'; // For asking questions
import qr from 'qr-image';       // For making the QR code
import fs from 'fs';             // For writing files to your hard drive
import { Jimp } from 'jimp';     // For editing your Business Card image
```
We load the tools we need. We use a specific import for `Jimp` to handle version compatibility.

### 2. The Questions List
We create a big array called `questions`. Each object `{ ... }` represents one prompt.
-   `type: 'input'`: Standard text box.
-   `type: 'confirm'`: A Yes/No question (used for the Overlay option).
-   `type: 'list'`: A multiple-choice menu (used for choosing the Position).

### 3. Collecting Answers
```javascript
inquirer.prompt(questions).then(async (answers) => { ... })
```
This starts the questionnaire. The `then` block only runs **after** you have answered everything. All your inputs are stored in the `answers` variable (e.g., `answers.fullName`).

### 4. Generating the Files
Inside the `.then()` block, we do three main things:

#### A. The vCard (`contact.vcf`)
We create a long string variable `vCardContent`. We append lines like `FN:${answers.fullName}` and `TEL...`. If you provided a Portfolio URL, we add that line too. Finally, `fs.writeFileSync` saves it to your disk.

#### B. The Landing Page (`index.html`)
We use a **Template Literal** (the backticks \`\`). This lets us write standard HTML but "inject" your variables using `${...}`.
*   *Logic*: We use lines like `${answers.cvUrl ? '<a ...>' : ''}`. This acts like a switch: "If the user gave a CV URL, add the button; otherwise, add nothing."

#### C. The QR Code & Overlay
*   First, `qr.image(...)` creates the raw QR code and saves it as `qr_code.png`.
*   **The Magic Part (Overlay)**:
    If you provided a `bussniees card.png` and said "Yes" (`answers.addOverlay`), we use `Jimp`:
    1.  `Jimp.read('bussniees card.png')`: Loads your design.
    2.  `qrImage.resize(...)`: Shrinks the QR code to fit.
    3.  `switch (answers.qrPosition)`: Calculates the exact `x` and `y` coordinates based on whether you chose "Bottom Right", "Center", etc.
    4.  `cardDesign.composite(...)`: Stamps the QR on top.
    5.  `cardDesign.write(...)`: Saves the final result as `final_card_with_qr.png`.
