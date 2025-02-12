import {
  ChannelTypeEnum,
  ISendMessageSuccessResponse,
  ICheckIntegrationResponse,
  CheckIntegrationResponseEnum,
  IEmailOptions,
  IEmailProvider,
} from '@novu/stateless';
import { Resend } from 'resend';

export class ResendEmailProvider implements IEmailProvider {
  id = 'resend';
  channelType = ChannelTypeEnum.EMAIL as ChannelTypeEnum.EMAIL;
  private resendClient: Resend;

  constructor(
    private config: {
      apiKey: string;
      from: string;
      senderName?: string;
    }
  ) {
    this.resendClient = new Resend(this.config.apiKey);
  }

  async sendMessage(
    options: IEmailOptions
  ): Promise<ISendMessageSuccessResponse> {
    const senderName = options.senderName || this.config?.senderName;
    const fromAddress = options.from || this.config.from;

    const response: any = await this.resendClient.sendEmail({
      from: senderName ? `${senderName} <${fromAddress}>` : fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment?.name,
        content: attachment.file,
      })),
      bcc: options.bcc,
    });

    return {
      id: response.id,
      date: new Date().toISOString(),
    };
  }

  async checkIntegration(
    options: IEmailOptions
  ): Promise<ICheckIntegrationResponse> {
    try {
      await this.resendClient.sendEmail({
        from: options.from || this.config.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        attachments: options.attachments?.map((attachment) => ({
          filename: attachment?.name,
          content: attachment.file,
        })),
        bcc: options.bcc,
      });

      return {
        success: true,
        message: 'Integrated successfully!',
        code: CheckIntegrationResponseEnum.SUCCESS,
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message,
        code: CheckIntegrationResponseEnum.FAILED,
      };
    }
  }
}
