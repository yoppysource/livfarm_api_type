import { UserDoc } from '../models/user';
import pug from 'pug';
import htmlToText from 'html-to-text';
import nodemailer from 'nodemailer';
import InlineCss from 'inline-css';

class EmailService {
  userEmail: string;
  url: string;
  from = `리브팜 <admin@livfarm.com>`;

  constructor(userEmail: string, url: string) {
    this.userEmail = userEmail;
    this.url = url;
  }

  getTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SendGrid is used for production env
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    // https://mailtrap.io/ is used for production env
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template: string, subject: string) {
    //1) Render HTML based on a pug template
    let html = pug.renderFile(`${__dirname}/../../views/email/${template}.pug`, {
      url: this.url,
      subject,
    });

    html = await InlineCss(html, { url: this.url });
    //2) Define email options.
    const mailOptions = {
      from: this.from,
      to: this.userEmail,
      subject,
      html,
      attachments: [
        {
          filename: 'email-header-img.jpg',
          path: './public/img/assets/email-header-img.jpg',
          cid: 'email-header-img',
        },
      ],
      text: htmlToText.htmlToText(html),
    };

    //3)create transport and send email
    await this.getTransport().sendMail(mailOptions);
  }

  async sendEmailConfirmation() {
    await this.send('email-confirmation', '이메일을 인증해주세요');
  }

  async sendPasswordReset() {
    await this.send('password-reset', '비밀번호 초기화');
  }
}

export { EmailService };
