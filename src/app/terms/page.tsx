export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Terms of Service</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using ColdEmail.AI ("Service"), you accept and agree to be bound by the terms
          and provision of this agreement.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use the Service for personal or commercial outreach purposes.
          This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose without attribution</li>
          <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
        </ul>

        <h2>3. Email Sending Compliance</h2>
        <p>
          You agree to use the Service in compliance with all applicable email marketing laws, including
          but not limited to CAN-SPAM Act, GDPR, and CASL. You are solely responsible for:
        </p>
        <ul>
          <li>Obtaining proper consent before sending emails</li>
          <li>Including accurate sender information</li>
          <li>Providing clear unsubscribe mechanisms</li>
          <li>Honoring opt-out requests promptly</li>
        </ul>

        <h2>4. Account Terms</h2>
        <ul>
          <li>You must be 18 years or older to use this Service</li>
          <li>You must provide accurate and complete information when creating an account</li>
          <li>You are responsible for maintaining the security of your account and password</li>
          <li>You are responsible for all activities that occur under your account</li>
        </ul>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Send spam or unsolicited commercial email</li>
          <li>Harass, abuse, or harm another person</li>
          <li>Impersonate any person or entity</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Upload or transmit viruses or malicious code</li>
          <li>Collect or track personal information of others without consent</li>
        </ul>

        <h2>6. Free and Pro Plans</h2>
        <ul>
          <li>Free Plan: Limited to 25 AI-generated emails per month</li>
          <li>Pro Plan: $12/month, unlimited emails subject to fair use (10,000/month)</li>
          <li>We reserve the right to modify pricing with 30 days notice</li>
          <li>Subscriptions auto-renew unless cancelled</li>
          <li>Refunds are provided on a case-by-case basis</li>
        </ul>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at: support@coldemail.ai
        </p>
      </div>
    </div>
  );
}
