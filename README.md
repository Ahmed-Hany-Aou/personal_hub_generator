# Personal Hub Generator (Digital Business Card)

A Node.js tool that generates a complete digital business card suite: a mobile-friendly Landing Page, a vCard for contact saving, a QR Code, and a printable Business Card with the QR code overlaid on your custom design.

## 🚀 Technologies Used

-   **Node.js**: The JavaScript runtime environment executing the script.
-   **Inquirer.js**: Used for the interactive command-line interface to collect your details.
-   **QR-Image**: A library to generate the QR code PNG file.
-   **Jimp**: An image processing library used to composite (overlay) the generated QR code onto your custom business card image.
-   **HTML5 & CSS3**: Used for generating the responsive, dark-themed landing page (`index.html`).
-   **vCard (VCF)**: The standard file format used for the downloadable contact file (`contact.vcf`).

## 📋 Prerequisites

-   Node.js installed on your machine.
-   A profile picture named `profile_pic.png` in the project folder.
-   (Optional) A business card design named `bussniees card.png` if you want to use the overlay feature.

## 🛠️ Installation

1.  Clone or download this repository.
2.  Open a terminal in the project folder.
3.  Install dependencies:
    ```bash
    npm install
    ```

## 🏃 usage

1.  Run the generator script:
    ```bash
    node generate_card.js
    ```
2.  **Answer the Prompts**:
    -   Enter your Name, Job Title, Phone, Email.
    -   Provide links for your Portfolio, Live App, CV (Google Drive/PDF), GitHub, and LinkedIn.
    -   **Base URL**: Enter the URL where you plan to host these files (e.g., `https://yourname.github.io/card/`).
3.  **Overlay Option**:
    -   If prompted, choose `Y` to overlay the QR code on your `bussniees card.png`.
    -   Select the position (e.g., Bottom Right).

## 📂 Output Files

The script generates the following files in the project directory:

-   **`index.html`**: Your personal landing page. Host this online.
-   **`contact.vcf`**: A contact file visitors can download to save your number and links.
-   **`qr_code.png`**: A standalone QR code pointing to your landing page.
-   **`final_card_with_qr.png`**: (If selected) Your custom business card image with the QR code printed on it.

## 🌐 How to Host (GitHub Pages Example)

1.  Create a folder (e.g., `card`) in your GitHub Pages repository.
2.  Upload `index.html`, `contact.vcf`, and `profile_pic.png` to that folder.
3.  The **Base URL** you enter in the script should be the path to this folder (e.g., `https://your-user.github.io/card/`).

## 👨‍💻 Logic Overview

The `generate_card.js` script works in 4 steps:
1.  **Collects Data**: Prompts you for all necessary information.
2.  **Generates vCard**: Creates a text file formatted as a vCard 3.0.
3.  **Generates HTML**: Injects your data into a responsive HTML template.
4.  **Generates QR & Overlay**: Creates the QR code and optionally uses `jimp` to stamp it onto your business card image.
