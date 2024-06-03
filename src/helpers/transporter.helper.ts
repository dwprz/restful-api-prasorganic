import { google } from "googleapis";
import createTransporter from "../apps/transporter.app";

export class TransporterHelper {
  static async getOauth2AccessToken(
    OAUTH2_CLIENT_ID: string,
    OAUTH2_CLIENT_SECRET: string,
    OAUTH2_REFRESH_TOKEN: string
  ) {
    const Oauth2 = google.auth.OAuth2;

    const oauth2Client = new Oauth2({
      clientId: OAUTH2_CLIENT_ID,
      clientSecret: OAUTH2_CLIENT_SECRET,
      redirectUri: "https://developers.google.com/oauthplayground",
    });

    oauth2Client.setCredentials({
      refresh_token: OAUTH2_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();
    return accessToken;
  }

  static async sendMail(
    GMAIL_MASTER: string,
    email: string,
    subject: string,
    template: string
  ) {
    const transporter = await createTransporter();

    await transporter.sendMail({
      from: {
        name: "prasorganic",
        address: GMAIL_MASTER,
      },
      to: email,
      subject: subject,
      html: template,
    });
  }
}
