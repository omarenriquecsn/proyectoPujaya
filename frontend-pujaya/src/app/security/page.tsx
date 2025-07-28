export default function SecurityPage() {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Security Policy</h1>
  
        <p className="mb-4">
        At Pujaya, protecting our users&#39; data is a top priority. This policy outlines the technical and organizational measures we take to safeguard your information.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Data Encryption</h2>
        <p>
          All sensitive data is encrypted both in transit (via HTTPS/TLS 1.2+) and at rest using modern encryption standards like AES-256.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Access Control</h2>
        <p>
          Access to user data is strictly limited to authorized personnel and is governed by role-based permissions. Admin actions are audited and logged.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Infrastructure Protection</h2>
        <p>
          Our infrastructure is hosted on secure cloud providers with firewalls, DDoS mitigation, and regular security updates applied automatically.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Vulnerability Management</h2>
        <p>
          We regularly audit dependencies and frameworks for vulnerabilities and apply patches promptly. Security best practices are part of our CI/CD pipeline.
        </p>
  
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Incident Response</h2>
        <p>
          In the event of a security breach, we have a structured incident response plan including investigation, user notification, and recovery protocols.
        </p>
  
        <p className="mt-8 text-sm text-gray-600">Last updated: June 15, 2025</p>
      </div>
    );
  }