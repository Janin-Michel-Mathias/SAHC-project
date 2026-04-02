/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

type QueuedMail = {
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class MailerService {
  private transporter!: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly mailQueue: QueuedMail[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILING_USER,
        pass: process.env.MAILING_PASSWORD,
      },
    });
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      throw new Error('Transporter is not initialized yet.');
    }

    await this.transporter.sendMail({
      from: `"No Reply" <${process.env.MAILING_USER}>`,
      to,
      subject,
      html,
    });
  }

  private enqueueMail(to: string, subject: string, html: string) {
    this.mailQueue.push({ to, subject, html });
    void this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessingQueue) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.mailQueue.length > 0) {
        const queuedMail = this.mailQueue.shift();

        if (!queuedMail) {
          continue;
        }

        await this.sendMail(queuedMail.to, queuedMail.subject, queuedMail.html);
      }
    } finally {
      this.isProcessingQueue = false;

      if (this.mailQueue.length > 0) {
        void this.processQueue();
      }
    }
  }

  sendConfirmationEmail(
    to: string,
    bookingDate: Date,
    parkingSpot: string,
    isElectric: boolean,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #2c3e50;">Réservation confirmée</h2>
        <p>Votre réservation de parking a bien été confirmée.</p>

        <table style="border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 6px 10px;"><strong>Date :</strong></td>
            <td style="padding: 6px 10px;">${new Date(bookingDate).toLocaleDateString('fr-FR')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px;"><strong>Emplacement :</strong></td>
            <td style="padding: 6px 10px;">${parkingSpot}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px;"><strong>Place électrique :</strong></td>
            <td style="padding: 6px 10px;">${isElectric ? 'Oui' : 'Non'}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">Merci pour votre réservation.</p>
      </div>
    `;

    this.enqueueMail(to, 'Validation de votre réservation de parking', html);
  }

  sendCancellationEmail(
    to: string,
    bookingDate: Date,
    parkingSpot: string,
    isElectric: boolean,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #c0392b;">Réservation annulée</h2>
        <p>Votre réservation de parking a été annulée.</p>

        <table style="border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 6px 10px;"><strong>Date :</strong></td>
            <td style="padding: 6px 10px;">${new Date(bookingDate).toLocaleDateString('fr-FR')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px;"><strong>Emplacement :</strong></td>
            <td style="padding: 6px 10px;">${parkingSpot}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px;"><strong>Place électrique :</strong></td>
            <td style="padding: 6px 10px;">${isElectric ? 'Oui' : 'Non'}</td>
          </tr>
        </table>
      </div>
    `;

    this.enqueueMail(to, 'Annulation de votre réservation de parking', html);
  }
}
