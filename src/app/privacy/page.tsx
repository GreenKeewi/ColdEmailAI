export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Privacy Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Introduction</h2>
        <p>
          ColdEmail.AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your information when you use
          our Service.
        </p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Information You Provide</h3>
        <ul>
          <li>Account information (name, email address)</li>
          <li>Payment information (processed by Clerk)</li>
          <li>Lead data (emails, names, companies you upload)</li>
          <li>Campaign content (emails you create or generate)</li>
          <li>Settings and preferences</li>
        </ul>

        <h3>2.2 OAuth Tokens</h3>
        <p>
          When you connect your Gmail account, we store OAuth refresh tokens to send emails on your
          behalf. These tokens are encrypted using AES-256-GCM encryption and are never logged or
          shared with third parties.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and maintain our Service</li>
          <li>Send emails on your behalf</li>
          <li>Generate personalized email content using AI</li>
          <li>Track email engagement and provide analytics</li>
          <li>Process payments and manage subscriptions</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We implement security measures including:</p>
        <ul>
          <li>Encryption of sensitive data (OAuth tokens)</li>
          <li>Secure HTTPS connections</li>
          <li>Access controls and authentication</li>
        </ul>

        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Export your data</li>
        </ul>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at: privacy@coldemail.ai
        </p>
      </div>
    </div>
  );
}
