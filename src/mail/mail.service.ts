// mail/mail.service.ts

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Customer Email
  async sendOrderConfirmation(email: string, orderId: number, total: number) {
    await this.transporter.sendMail({
      from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Order Confirmed ',
      html: `
        <h2>Order Confirmed</h2>
        <p>Your order #${orderId} has been confirmed.</p>
        <p>Total Amount: $${total}</p>
        <p>Your order is now being processed and will be shipped soon.</p>
      `,
    });
  }

  //  Merchant Email
  async sendMerchantNotification(
    merchantEmail: string,
    orderId: number,
    total: number,
  ) {
    await this.transporter.sendMail({
      from: `"E-Commerce System" <${process.env.EMAIL_USER}>`,
      to: merchantEmail,
      subject: 'New Order Received ',
      html: `
        <h2>New Order Placed</h2>
        <p>Order ID: #${orderId}</p>
        <p>Total Value: $${total}</p>
        <p>Please prepare the order for shipping.</p>
      `,
    });
  }
}