import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';

export const sendMail = async (
  email: string,
  subject: string,
  templateFilename: string,
  host: string
) => {
  try {
    const account = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    const templateAsString = fs.readFileSync(
      `${__dirname}/${templateFilename}.handlebars`,
      'utf-8'
    );
    const hbs = handlebars.compile(templateAsString);
    const compiledMail = hbs({ host, email });

    const mailOptions = {
      from: process.env.MAIL,
      to: email,
      subject: subject,
      html: compiledMail,
    };

    // send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);

    // eslint-disable-next-line no-console
    console.log(info);
    // eslint-disable-next-line no-console
    console.log('Message sent: %s', info.messageId);
    // eslint-disable-next-line no-console
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return !!info;
  } catch (error) {
    console.error(error);
  }
};
