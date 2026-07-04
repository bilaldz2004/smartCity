import React from "react";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">1. Introduction</h2>
          <p className="text-gray-600">
            UrbanFix is committed to protecting your privacy. This policy explains how we collect,
            use, and safeguard your information when you use our platform.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">2. Data We Collect</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Name and email when you create an account</li>
            <li>Reports you submit (descriptions, images)</li>
            <li>Location data to identify reported issues</li>
            <li>Usage data to improve our services</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">3. How We Use Your Data</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>To process and manage your reports</li>
            <li>To communicate updates about your reports</li>
            <li>To improve platform performance and user experience</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">4. Data Sharing</h2>
          <p className="text-gray-600">
            We do not sell your personal data. Information may be shared with relevant city
            authorities to resolve reported issues.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">5. Data Security</h2>
          <p className="text-gray-600">
            We implement reasonable security measures to protect your information from
            unauthorized access or disclosure.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">6. Your Rights</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>You can request access to your data</li>
            <li>You can request deletion of your account</li>
            <li>You can contact us for any privacy concerns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">7. Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy, please contact us through the
            Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}