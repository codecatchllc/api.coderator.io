import nodemailer from 'nodemailer';
import config from './config';

export async function sendEmail(to: string, subject: string, html: string) {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log("testAccount: ", testAccount);

  const transporter = nodemailer.createTransport({
    host: config.NODEMAILER_HOST,
    port: config.NODEMAILER_PORT,
    secure: config.NODEMAILER_SECURE, // true for 465, false for other ports
    auth: {
      user: config.NODEMAILER_USER,
      pass: config.NODEMAILER_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"CodeCatch LLC" <${config.CODECATCH_EMAIL}>`,
    to,
    subject,
    html,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
