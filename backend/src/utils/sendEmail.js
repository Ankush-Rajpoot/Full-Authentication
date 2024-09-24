import nodemailer from 'nodemailer';
import path from 'path'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (options) => {
  // Create a transporter using Gmail or any other service
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  // Email options
  const mailOptions = {
    from: 'LegalYouToday <noreply@legalyoutoday.com>',
    to: options.email, // Receiver's email address
    subject: options.subject, // Subject line
    text: options.message, // Plain text body (for non-HTML email clients)
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #6200ea; text-align: center;">Welcome to LegalYouToday!</h1>
          <p style="font-size: 16px;">Hi ${options.name},</p>
          <p style="font-size: 16px;">We are thrilled to have you with us on this empowering journey.</p>
          <p style="font-size: 16px;">At LegalYouToday, <strong style="color: #6200ea;">"Justice Begins with Knowing Your Rights."</strong></p>
          <p style="font-size: 16px;">Our goal is to bring <strong style="color: #6200ea;">"Legal Awareness to Every Doorstep"</strong> and help you navigate the legal world with clarity and confidence.</p>
          <p style="font-size: 16px;">Feel free to explore our platform and take the first step toward understanding your legal rights.</p>
          <br/>
          <p style="font-size: 16px;">Warm regards,<br/>The LegalYouToday Team</p>
          <br/>
          <img src="cid:LYTemail" alt="LegalYouToday" style="width:100%; max-width:500px; border-radius: 8px;">
        </div>
      </div>
    `, // HTML version of the email
    attachments: [
      {
        filename: 'LYTemail.jpg',
        path: path.resolve(__dirname, '../assets/LYTemail.jpg'), // Path to the image file
        cid: 'LYTemail' // Same as in the 'img' src in the HTML above
      }
    ],
    headers: {
      'Reply-To': 'noreply@legalyoutoday.com', // Ensures no replies
    },
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
