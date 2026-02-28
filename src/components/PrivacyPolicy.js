import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg">
        <h2>Data Collection</h2>
        <p>
          The Helen Hamlyn Centre for Design Data Platform does not collect, store, or process any personal data from users. 
          This website is a static information resource that displays research data without requiring 
          user registration or personal information.
        </p>

        <h2>Technical Information</h2>
        <p>
          This website uses:
        </p>
        <ul>
          <li>Tailwind CSS from CDN for styling (may set technical cookies)</li>
          <li>Vercel hosting platform for content delivery</li>
          <li>No tracking, analytics, or advertising cookies</li>
        </ul>

        <h2>Contact</h2>
        <p>
          If you have questions about this privacy policy, please contact us through 
          the project's official channels.
        </p>

        <p className="text-sm text-gray-600 mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;