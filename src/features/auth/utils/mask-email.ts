export function maskEmail(email: string | null): string {
  if (!email) {
    return '';
  }

  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  return `${localPart.charAt(0)}*****@${domain}`;
}
