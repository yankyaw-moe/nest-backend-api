import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailVerificationMail({
    email,
    url,
  }: {
    email: string;
    url: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email address',
        html: `
          <h1>Welcome to the app!</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${url}">Verify email</a>
        `,
      });
    } catch (error) {
      console.log('error ', error);
      throw error;
    }
  }
}
