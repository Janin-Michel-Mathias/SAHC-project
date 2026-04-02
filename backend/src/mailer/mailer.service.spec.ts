/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import nodemailer from 'nodemailer';
import { MailerService } from '../mailer/mailer.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('MailerService', () => {
  let service: MailerService;
  let sendMailMock: jest.Mock;

  const createTransportMock = nodemailer.createTransport as jest.Mock;

  beforeEach(async () => {
    process.env.MAILING_USER = 'mailer@test.com';
    process.env.MAILING_PASSWORD = 'secret-password';

    sendMailMock = jest.fn().mockResolvedValue(undefined);
    createTransportMock.mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates the transporter with the configured SMTP settings', () => {
    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'mailer@test.com',
        pass: 'secret-password',
      },
    });
  });

  it('sends a confirmation email with the expected subject', async () => {
    const bookingDate = new Date('2024-04-02T00:00:00.000Z');

    await service.sendConfirmationEmail(
      'user@test.com',
      bookingDate,
      'A-12',
      true,
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"No Reply" <mailer@test.com>',
        to: 'user@test.com',
        subject: 'Validation de votre réservation de parking',
      }),
    );

    expect(sendMailMock.mock.calls[0][0].html).toContain('02/04/2024');
    expect(sendMailMock.mock.calls[0][0].html).toContain('A-12');
    expect(sendMailMock.mock.calls[0][0].html).toContain('Oui');
  });
});
