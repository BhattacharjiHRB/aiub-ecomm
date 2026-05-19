// mail/mail.service.ts

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { Order } from 'src/db/entities/order.entity';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    @InjectRepository(User)
    private readonly useRepo: Repository<User>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOrderConfirmation(
    order: Order,
  ): Promise<{ message: string; status?: number }> {
    try {
      if (!order.user?.email) {
        throw new Error('Order user email is not available');
      }

      const email = order.user.email;

      // Build order items details
      const itemsHtml = order.items
        .map(
          (item) =>
            `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.price.toString()).toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}</td>
          </tr>`,
        )
        .join('');

      await this.transporter.sendMail({
        from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmed #${order.id}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmed</h2>
          <p>Hi ${order.user.name || 'Valued Customer'},</p>
          <p>Thank you for your order! Your order #<strong>${order.id}</strong> has been confirmed.</p>
          
          <h3>Order Details:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin: 20px 0;">
            <p style="font-size: 18px;"><strong>Total Amount: $${parseFloat(order.totalPrice.toString()).toFixed(2)}</strong></p>
          </div>

          <p>Your order is now being processed and will be shipped soon. You will receive a tracking number via email once your order ships.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If you have any questions, please contact our support team at ${process.env.SUPPORT_EMAIL}
          </p>
        </div>
      `,
      });

      return {
        message: `Email sent to ${email} successfully!`,
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      console.error(
        `Failed to send order confirmation email for order #${order.id}:`,
        err,
      );

      return {
        message: `Failed to send confirmation email: ${err.message}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async sendMerchantNotification(
    order: Order,
    userRepo: User,
  ): Promise<{ message: string; status: number }> {
    try {
      // Validate order and merchant email
      if (!order.user?.email) {
        throw new Error('Order user email is not available');
      }

      const merchantEmail = await this.useRepo.findOne({
        where: {
          email: order.user.email,
        },
      });

      // Build order items details for merchant
      const itemsHtml = order.items
        .map(
          (item) =>
            `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.price.toString()).toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}</td>
          </tr>`,
        )
        .join('');

      await this.transporter.sendMail({
        from: `"E-Commerce System" <${process.env.EMAIL_USER}>`,
        to: merchantEmail,
        subject: `New Order Received #${order.id}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">
            New Order Placed
          </h2>

          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #3498db;">
            <p style="margin: 8px 0;"><strong>Order ID:</strong> #${order.id}</p>
            <p style="margin: 8px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 8px 0;"><strong>Order Status:</strong> ${order.status.toUpperCase()}</p>
            <p style="margin: 8px 0;"><strong>Customer Email:</strong> ${order.user.email}</p>
          </div>

          <h3 style="color: #2c3e50; margin-top: 25px;">Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #3498db; color: white;">
                <th style="padding: 12px; text-align: left;">Product</th>
                <th style="padding: 12px; text-align: center;">Quantity</th>
                <th style="padding: 12px; text-align: right;">Unit Price</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="font-size: 18px; margin: 0;">
              <strong>Order Total: $${parseFloat(order.totalPrice.toString()).toFixed(2)}</strong>
            </p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 4px;">
            <p style="margin: 0; color: #856404;">
              <strong>Action Required:</strong> Please prepare the order for shipping and update the status once dispatched.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; margin: 10px 0;">
            This is an automated notification from the E-Commerce System.
          </p>
          <p style="color: #666; font-size: 12px; margin: 10px 0;">
            Login to your merchant dashboard to manage this order: <a href="${process.env.MERCHANT_DASHBOARD_URL}" style="color: #3498db; text-decoration: none;">${process.env.MERCHANT_DASHBOARD_URL}</a>
          </p>
        </div>
      `,
      });

      return {
        message: `Merchant notification sent to ${merchantEmail} successfully!`,
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      console.error(
        `Failed to send merchant notification for order #${order.id}:`,
        err,
      );

      return {
        message: `Failed to send merchant notification: ${err.message}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
