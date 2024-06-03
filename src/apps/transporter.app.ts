import nodemailer from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import { TransporterHelper } from "../helpers/transporter.helper";
import { EnvHelper } from "../helpers/env.helper";

const createTransporter = async () => {
  const GMAIL_MASTER = process.env.GMAIL_MASTER;
  const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID;
  const OAUTH2_CLIENT_SECRET = process.env.OAUTH2_CLIENT_SECRET;
  const OAUTH2_REFRESH_TOKEN = process.env.OAUTH2_REFRESH_TOKEN;

  EnvHelper.validate({
    GMAIL_MASTER,
    OAUTH2_CLIENT_ID,
    OAUTH2_CLIENT_SECRET,
    OAUTH2_REFRESH_TOKEN,
  });

  const accessToken = await TransporterHelper.getOauth2AccessToken(
    OAUTH2_CLIENT_ID!,
    OAUTH2_CLIENT_SECRET!,
    OAUTH2_REFRESH_TOKEN!
  );

  const SMTPTransportOpt: SMTPTransport.Options = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: GMAIL_MASTER,
      clientId: OAUTH2_CLIENT_ID,
      clientSecret: OAUTH2_CLIENT_SECRET,
      refreshToken: OAUTH2_REFRESH_TOKEN,
      accessToken: accessToken as string,
    },
  };

  const transporter = nodemailer.createTransport(SMTPTransportOpt);

  return transporter;
};

export default createTransporter;
