import * as brevo from '@getbrevo/brevo';

class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi | null = null;
  private apiKey: string | undefined;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@miramatch.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'MIRA MATCH';
    this.initialize();
  }

  private initialize() {
    if (!this.apiKey) {
      console.warn('[EmailService] Brevo API key not configured. Email sending will be disabled.');
      this.apiInstance = null;
      return;
    }

    try {
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, this.apiKey);
      this.apiInstance = apiInstance;
      console.log('[EmailService] Brevo API initialized');
    } catch (error) {
      console.error('[EmailService] Failed to initialize Brevo API:', error);
      this.apiInstance = null;
    }
  }

  /**
   * Envoyer un email de vérification avec le code
   */
  async sendVerificationEmail(email: string, code: string, name: string): Promise<boolean> {
    if (!this.apiInstance) {
      console.warn('[EmailService] Brevo API not available. Skipping email send.');
      // En développement, afficher le code dans les logs
      console.log(`\n========================================`);
      console.log(`📧 CODE DE VÉRIFICATION POUR: ${email}`);
      console.log(`CODE: ${code}`);
      console.log(`========================================\n`);
      return true; // Retourner true pour ne pas bloquer le développement
    }

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de votre compte MIRA MATCH</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7ff;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px; background: linear-gradient(135deg, #ff6b9d 0%, #c371f5 100%); border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                      MIRA MATCH
                    </h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                      Plateforme pour Créateurs
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: bold;">
                      Bienvenue ${name} ! 👋
                    </h2>

                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Merci de vous être inscrit sur <strong>MIRA MATCH</strong>. Pour activer votre compte créateur, veuillez utiliser le code de vérification ci-dessous :
                    </p>

                    <!-- Verification Code -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                      <tr>
                        <td align="center" style="padding: 30px; background-color: #f5f7ff; border-radius: 8px;">
                          <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                            Code de vérification
                          </p>
                          <div style="font-size: 36px; font-weight: bold; color: #ff6b9d; letter-spacing: 8px;">
                            ${code}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      Ce code est valide pendant <strong>24 heures</strong>. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.
                    </p>

                    <!-- Divider -->
                    <div style="margin: 30px 0; height: 1px; background-color: #e0e0e0;"></div>

                    <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                      Si vous avez des questions, contactez-nous à support@miramatch.com
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 40px 40px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © 2025 MIRA MATCH. Tous droits réservés.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
Bienvenue sur MIRA MATCH, ${name} !

Votre code de vérification est : ${code}

Ce code est valide pendant 24 heures.

Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.

---
© 2025 MIRA MATCH. Tous droits réservés.
    `;

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = { name: this.senderName, email: this.senderEmail };
      sendSmtpEmail.to = [{ email, name }];
      sendSmtpEmail.subject = `Votre code de vérification MIRA MATCH : ${code}`;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log(`[EmailService] Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Envoyer un email de bienvenue après vérification
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    if (!this.apiInstance) {
      console.warn('[EmailService] Brevo API not available. Skipping welcome email.');
      return true;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur MIRA MATCH</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7ff;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 40px 20px 40px; background: linear-gradient(135deg, #ff6b9d 0%, #c371f5 100%); border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 1px;">
                      🎉 Bienvenue sur MIRA MATCH !
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: bold;">
                      Félicitations ${name} !
                    </h2>

                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Votre compte créateur est maintenant <strong>activé</strong> ! Vous pouvez dès maintenant :
                    </p>

                    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                      <li>Découvrir des projets personnalisés</li>
                      <li>Envoyer des devis aux clients</li>
                      <li>Gérer vos propositions</li>
                      <li>Communiquer avec vos clients</li>
                    </ul>

                    <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      Nous sommes ravis de vous compter parmi nos créateurs ! 💫
                    </p>

                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 0;">
                          <a href="#" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #ff6b9d 0%, #c371f5 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Commencer à explorer
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <div style="margin: 30px 0; height: 1px; background-color: #e0e0e0;"></div>

                    <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                      Besoin d'aide ? Consultez notre guide de démarrage ou contactez-nous à support@miramatch.com
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 40px 40px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © 2025 MIRA MATCH. Tous droits réservés.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
Félicitations ${name} !

Votre compte créateur MIRA MATCH est maintenant activé !

Vous pouvez dès maintenant :
- Découvrir des projets personnalisés
- Envoyer des devis aux clients
- Gérer vos propositions
- Communiquer avec vos clients

Nous sommes ravis de vous compter parmi nos créateurs !

---
© 2025 MIRA MATCH. Tous droits réservés.
    `;

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = { name: this.senderName, email: this.senderEmail };
      sendSmtpEmail.to = [{ email, name }];
      sendSmtpEmail.subject = '🎉 Bienvenue sur MIRA MATCH !';
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log(`[EmailService] Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
