import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> December 2024
            </p>
            
            <p className="mb-6">
              At Travel Buddy, we respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
              travel booking platform.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Payment information and billing address</li>
              <li>Travel preferences and booking history</li>
              <li>Profile picture and user-generated content</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Website usage patterns and analytics</li>
              <li>Location data (with your permission)</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">How We Use Your Information</h2>
            
            <ul className="list-disc pl-6 mb-6">
              <li>Process bookings and provide travel services</li>
              <li>Send booking confirmations and travel updates</li>
              <li>Improve our website and user experience</li>
              <li>Provide customer support and assistance</li>
              <li>Send promotional offers (with your consent)</li>
              <li>Comply with legal requirements</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Information Sharing</h2>
            
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information only in the following circumstances:
            </p>
            
            <ul className="list-disc pl-6 mb-6">
              <li>With service providers (hotels, tour operators, transportation companies)</li>
              <li>With payment processors for transaction processing</li>
              <li>With legal authorities when required by law</li>
              <li>With your explicit consent</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Data Security</h2>
            
            <p className="mb-6">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
              secure servers, and regular security audits.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Your Rights</h2>
            
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Contact Us</h2>
            
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Email:</strong> asif.talha2002@gmail.com</p>
              <p><strong>Phone:</strong> +92 313 5541485</p>
              <p><strong>Address:</strong> Travel Buddy, Islamabad, Pakistan</p>
            </div>
            
            <p className="mt-8 text-sm text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 