import { resend } from "./resend";
import { throttle } from "./rate-limit";

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend with rate limit throttle.
 * Use this instead of calling resend.emails.send() directly.
 */
export async function sendEmail(params: SendEmailParams) {
  await throttle();
  return resend.emails.send(params);
}
