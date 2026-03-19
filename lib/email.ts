import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.FROM_EMAIL || "onboarding@resend.dev";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  await resend.emails.send({
    from,
    to: email,
    subject: "Réinitialisation de votre mot de passe - LBR Academy",
    html: `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
      <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
        Réinitialiser mon mot de passe
      </a>
      <p style="margin-top:16px;color:#666;">Ce lien expire dans 1 heure.</p>
      <p style="color:#999;font-size:12px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;
  await resend.emails.send({
    from,
    to: email,
    subject: "Vérifiez votre email - LBR Academy",
    html: `
      <h2>Bienvenue sur LBR Academy !</h2>
      <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email :</p>
      <a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
        Vérifier mon email
      </a>
      <p style="color:#999;font-size:12px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
    `,
  });
}

export async function sendContentApprovedEmail(email: string, contentTitle: string) {
  await resend.emails.send({
    from,
    to: email,
    subject: "Contenu approuvé - LBR Academy",
    html: `
      <h2>Votre contenu a été approuvé !</h2>
      <p>Votre contenu <strong>"${contentTitle}"</strong> a été validé et est maintenant publié sur la plateforme.</p>
    `,
  });
}

export async function sendContentRejectedEmail(email: string, contentTitle: string, reason?: string) {
  await resend.emails.send({
    from,
    to: email,
    subject: "Contenu rejeté - LBR Academy",
    html: `
      <h2>Votre contenu a été rejeté</h2>
      <p>Votre contenu <strong>"${contentTitle}"</strong> n'a pas été approuvé.</p>
      ${reason ? `<p><strong>Raison :</strong> ${reason}</p>` : ""}
      <p>Vous pouvez le modifier et le soumettre à nouveau.</p>
    `,
  });
}

export async function sendWelcomeEmail(email: string, username: string) {
  await resend.emails.send({
    from,
    to: email,
    subject: "Bienvenue sur LBR Academy !",
    html: `
      <h2>Bienvenue ${username} !</h2>
      <p>Votre compte a été créé avec succès sur La Bibliothèque des Rois.</p>
      <p>Explorez nos contenus et commencez votre parcours d'apprentissage.</p>
      <a href="${frontendUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
        Accéder à la plateforme
      </a>
    `,
  });
}
