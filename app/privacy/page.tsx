export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-10">

          <h1 className="text-4xl font-extrabold">
            Privacy Policy
          </h1>

          <p className="mt-3 text-blue-100 max-w-3xl">
            Your privacy matters to us. This Privacy Policy explains how
            AnantaGo collects, uses, and protects your information when
            you visit our website.
          </p>

        </div>

        {/* Content */}

        <div className="p-8 md:p-10">

          <p className="text-gray-700 leading-8">
            Welcome to <strong>AnantaGo</strong>. We are committed to
            protecting your personal information and maintaining your
            trust. By using our website, you agree to the practices
            described in this Privacy Policy.
          </p>

          {/* Information We Collect */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Information We Collect
            </h2>

            <p className="text-gray-700 leading-8">
              We may collect information that you voluntarily provide,
              including:
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2 text-gray-700">

              <li>Name</li>

              <li>Email address</li>

              <li>Messages sent through our Contact page</li>

              <li>Anonymous analytics data such as browser type and pages visited</li>

            </ul>

          </section>

          {/* How We Use Your Information */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              How We Use Your Information
            </h2>

            <p className="text-gray-700 leading-8">
              We use your information to:
            </p>

            <ul className="list-disc ml-6 mt-4 space-y-2 text-gray-700">

              <li>Respond to inquiries and support requests</li>

              <li>Improve website performance and user experience</li>

              <li>Recommend products that may interest you</li>

              <li>Analyze website traffic and usage trends</li>

              <li>Maintain website security and prevent abuse</li>

            </ul>

          </section>
                    {/* Affiliate Disclosure */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Affiliate Disclosure
            </h2>

            <p className="text-gray-700 leading-8">
              AnantaGo participates in affiliate programs including
              Amazon, Flipkart, and other trusted partners. When you
              purchase a product through our affiliate links, we may
              earn a small commission at no additional cost to you.
            </p>

            <p className="text-gray-700 leading-8 mt-3">
              These commissions help us maintain the website and
              continue providing useful product recommendations,
              deals, and shopping guides.
            </p>

          </section>


          {/* Cookies */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Cookies
            </h2>

            <p className="text-gray-700 leading-8">
              AnantaGo may use cookies and similar technologies to
              improve your browsing experience, analyze website
              traffic, remember preferences, and provide relevant
              content.
            </p>

          </section>


          {/* Third Party Links */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Third-Party Links
            </h2>

            <p className="text-gray-700 leading-8">
              Our website may contain links to third-party websites
              such as Amazon, Flipkart, and other partner platforms.
              We are not responsible for the privacy practices,
              security, or content of external websites.
            </p>

          </section>


          {/* Data Security */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Data Security
            </h2>

            <p className="text-gray-700 leading-8">
              We take reasonable measures to protect your information.
              However, no method of internet transmission or electronic
              storage is completely secure, and we cannot guarantee
              absolute security.
            </p>

          </section>


          {/* Contact */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Contact Us
            </h2>

            <p className="text-gray-700 leading-8">
              If you have any questions, concerns, or suggestions
              regarding this Privacy Policy, please contact us through
              our Contact page.
            </p>

          </section>


          <div className="mt-10 pt-6 border-t">

            <p className="text-sm text-gray-500">
              Last updated: July 2026
            </p>

          </div>


        </div>

      </div>

    </main>
  );
}