/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/
import input from '@inquirer/input';
import qr from 'qr-image';
import fs from 'fs';


const answer = await input({ message: 'Enter URl' });

console.log(answer);


//var qr = require('qr-image');
 




//var qr_svg = qr.image(answer, { type: 'png' });
//qr_svg.pipe(require('fs').createWriteStream('i_love_qr.png'));
 
//var svg_string = qr.imageSync('I love QR!', { type: 'spng' });

const qr_svg = qr.image(answer, { type: 'png' });
qr_svg.pipe(fs.createWriteStream('qr_code.png'));

fs.writeFile('user_input_from_Hany.txt', answer, (err) => {
    if (err) throw err;
    console.log('User input has been saved to user_input.txt');
});
  