import nodemailer from 'nodemailer';
import ejs from 'ejs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

//* custom transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

//* Email template helper func.
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templetePath = path.join(
    process.cwd(),
    'auth',
    'src',
    'utils',
    'email-template',
    `${templateName}.ejs`
  );

  return ejs.renderFile(templetePath, data);
};

//? Send mail using nodemailer service
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderEmailTemplate(templateName, data); //* get the email template

    await transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.log('Error sending email', error);
    return false;
  }
};
