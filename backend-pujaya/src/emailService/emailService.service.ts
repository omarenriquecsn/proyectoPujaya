import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  private async readTemplate(templateName: string): Promise<string> {
    try {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'emailService',
        'templates',
        templateName,
      );
      const distPath = path.join(
        process.cwd(),
        'dist',
        'src',
        'emailService',
        'templates',
        templateName,
      );

      if (fs.existsSync(srcPath)) {
        return fs.readFileSync(srcPath, 'utf8');
      } else if (fs.existsSync(distPath)) {
        return fs.readFileSync(distPath, 'utf8');
      } else {
        throw new Error(
          `Template ${templateName} not found in either src or dist directories`,
        );
      }
    } catch (error) {
      console.error(`Error reading template ${templateName}:`, error);
      throw new InternalServerErrorException('Could not read email template');
    }
  }

  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    return Object.entries(variables).reduce((html, [key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      return html.replace(regex, String(value));
    }, template);
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      const template = await this.readTemplate('welcome.html');
      const html = this.replaceTemplateVariables(template, {
        userName: name,
        websiteUrl: process.env.WEBSITE_URL || '',
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'Welcome to PujaYa!',
        html,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new InternalServerErrorException('Could not send the email');
    }
  }

  async sendUpdateNotification(
    to: string,
    name: string,
    updatedFields: Record<string, any>,
  ) {
    try {
      const template = await this.readTemplate('profile-update.html');
      const fields = Object.entries(updatedFields).map(
        ([key, value]) => `<li><b>${key}:</b> ${value}</li>`,
      );

      const html = this.replaceTemplateVariables(template, {
        userName: name,
        updatedFields: fields.join(''),
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'Your Pujaya Profile Has Been Updated',
        html,
      });
    } catch (error) {
      console.error('Error sending update notification:', error);
      throw new InternalServerErrorException(
        'Could not send the update notification email',
      );
    }
  }

  async sendAccountDeactivation(to: string, name: string) {
    try {
      const template = await this.readTemplate('account-deactivation.html');
      const html = this.replaceTemplateVariables(template, {
        userName: name,
        reactivationUrl: `${process.env.WEBSITE_URL}/reactivate-account`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@pujaya.com',
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'Your PujaYa Account Has Been Deactivated',
        html,
      });
    } catch (error) {
      console.error('Error sending account deactivation email:', error);
      throw new InternalServerErrorException(
        'Could not send the account deactivation email',
      );
    }
  }

  async sendAuctionCreatedEmail(
    to: string,
    auctionTitle: string,
    name: string,
    startingPrice: number,
    endDate: Date,
  ) {
    try {
      const template = await this.readTemplate('auction-created.html');

      // Generate social share URLs
      const encodedTitle = encodeURIComponent(auctionTitle);
      const auctionUrl = `${process.env.WEBSITE_URL}/auctions/${encodedTitle}`;
      const shareText = encodeURIComponent(
        `Check out my auction "${auctionTitle}" on PujaYa!`,
      );

      const html = this.replaceTemplateVariables(template, {
        userName: name,
        auctionTitle,
        auctionUrl,
        startingPrice,
        endDate: endDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'Your Auction Is Now Live on PujaYa!',
        html,
      });
    } catch (error) {
      console.error('Error sending auction creation email:', error);
      throw new InternalServerErrorException(
        'Could not send the auction creation email',
      );
    }
  }

  async sendAuctionUpdatedNotification(
    to: string,
    name: string,
    auctionTitle: string,
    updatedFields?: Record<string, any>,
  ) {
    try {
      const template = await this.readTemplate('auction-update.html');

      // Format updated fields in HTML
      const formattedFields = updatedFields
        ? Object.entries(updatedFields)
            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
            .join('')
        : '<p>General auction details have been updated.</p>';

      const html = this.replaceTemplateVariables(template, {
        userName: name,
        auctionTitle,
        updatedFields: formattedFields,
        auctionUrl: `${process.env.WEBSITE_URL}/auctions/${auctionTitle}`,
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'Your Auction Has Been Updated on PujaYa',
        html,
      });
    } catch (error) {
      console.error('Error sending auction update notification:', error);
      throw new InternalServerErrorException(
        'Could not send the auction update notification email',
      );
    }
  }
  async sendAuctionDeletedNotification(
    to: string,
    auctionTitle: string,
    name: string,
  ) {
    await this.transporter.sendMail({
      from: '"Pujaya" <no-reply@pujaya.com>',
      to,
      subject: 'Your Auction Has Been Deleted on Pujaya!',
      html: `
        <h2>Hello ${name},</h2>
        <p>Your auction "${auctionTitle}" has been deleted successfully on Pujaya!.</p>
        <p>Thank you for participating in our auction platform!</p>
      `,
    });
  }

  async sendBidNotification(
    to: string,
    ownerName: string,
    auctionTitle: string,
    bidderName: string,
    amount: number,
  ) {
    try {
      const template = await this.readTemplate('bid-notification.html');
      const html = this.replaceTemplateVariables(template, {
        userName: ownerName,
        auctionTitle,
        bidAmount: amount,
        bidDateTime: new Date().toLocaleString('en-US'),
        bidderName,
        auctionUrl: `${process.env.WEBSITE_URL}/auctions/${auctionTitle}`,
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'New Bid on Your Auction!',
        html,
      });
    } catch (error) {
      console.error('Error sending bid notification:', error);
      throw new InternalServerErrorException(
        'Could not send the bid notification email',
      );
    }
  }

  async sendProfileUpdateNotification(
    to: string,
    name: string,
    updatedFields: Record<string, any>,
  ) {
    try {
      const template = await this.readTemplate('profile-update.html');

      // Format updated fields in HTML
      const formattedFields = Object.entries(updatedFields)
        .map(([key, value]) => {
          // Handle sensitive information
          const displayValue = key.toLowerCase().includes('password')
            ? '********'
            : value;
          return `<p><strong>${key}:</strong> ${displayValue}</p>`;
        })
        .join('');

      const html = this.replaceTemplateVariables(template, {
        userName: name,
        updatedFields: formattedFields,
        profileUrl: `${process.env.WEBSITE_URL}/profile`,
        year: new Date().getFullYear(),
      });

      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'Your PujaYa Profile Has Been Updated',
        html,
      });
    } catch (error) {
      console.error('Error sending profile update notification:', error);
      throw new InternalServerErrorException(
        'Could not send the profile update notification email',
      );
    }
  }

  async sendAuctionEndedNotification(
    to: string,
    name: string,
    auctionTitle: string,
  ) {
    try {
      const template = await this.readTemplate('auction-ended.html');
      const html = this.replaceTemplateVariables(template, {
        userName: name,
        auctionTitle,
        auctionUrl: `${process.env.WEBSITE_URL}/auctions/${auctionTitle}`,
        year: new Date().getFullYear(),
      });
      await this.transporter.sendMail({
        from: '"Pujaya" <no-reply@pujaya.com>',
        to,
        subject: 'Auction Ended on PujaYa',
        html,
      });
    } catch (error) {
      console.error('Error sending auction ended notification:', error);
      throw new InternalServerErrorException(
        'Could not send the auction ended email',
      );
    }
  }
}
