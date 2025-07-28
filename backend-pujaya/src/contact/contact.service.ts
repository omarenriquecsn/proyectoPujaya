import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  async sendMail({
    name,
    email,
    message,
  }: {
    name: string;
    email: string;
    message: string;
  }) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'pujaya.com@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: 'pujaya.com@gmail.com',
        subject: 'New Contact Message',
        text: message,
        html: `<p><b>Name:</b> ${name}</p>
               <p><b>Email:</b> ${email}</p>
               <p><b>Message:</b><br/>${message}</p>`,
      });
    } catch (error) {
      throw new InternalServerErrorException('Could not send the message');
    }
  }
}
