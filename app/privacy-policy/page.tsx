import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the AnantaGo Privacy Policy to understand how we collect, use and protect information when you use our website.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            AnantaGo
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your privacy matters to us. This Privacy Policy explains how
            AnantaGo handles information when you visit and use our website.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Last updated: August 24, 2026
          </p>
        </div>

        {/* Content */}
        <div className="mt-14 space-y-12 text-[16px] leading-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              1. Introduction
            </h2>

            <p className="mt-4">
              AnantaGo ("we", "us", or "our") operates the AnantaGo website.
              This Privacy Policy explains what information may be collected
              when you visit our website, how that information may be used and
              the choices available to you.
            </p>

            <p className="mt-4">
              By using AnantaGo, you acknowledge the practices described in
              this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              2. Information we collect
            </h2>

            <p className="mt-4">
              We may collect information automatically when you visit the
              website. This may include information such as your IP address,
              browser type, device information, pages visited, approximate
              location and information about how you interact with the
              website.
            </p>

            <p className="mt-4">
              If you contact us directly, we may also receive information that
              you choose to provide, such as your name, email address and the
              contents of your message.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              3. How we use information
            </h2>

            <p className="mt-4">
              Information may be used to operate, maintain and improve
              AnantaGo and to understand how visitors use our website.
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Improve website performance and user experience.</li>
              <li>Understand which content is useful to readers.</li>
              <li>Respond to questions and messages.</li>
              <li>Detect and prevent abuse, spam or security issues.</li>
              <li>Analyze website traffic and performance.</li>
              <li>Maintain and improve our content and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              4. Cookies and similar technologies
            </h2>

            <p className="mt-4">
              AnantaGo may use cookies and similar technologies to remember
              preferences, understand website usage and improve the overall
              experience.
            </p>

            <p className="mt-4">
              Third-party services used on the website may also use cookies or
              similar technologies in accordance with their own privacy
              policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              5. Analytics
            </h2>

            <p className="mt-4">
              We may use analytics services to understand website traffic,
              visitor behavior and content performance. These services may
              collect information such as pages visited, approximate location,
              device type and referral information.
            </p>

            <p className="mt-4">
              Analytics information helps us understand how readers use
              AnantaGo and improve the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              6. Advertising
            </h2>

            <p className="mt-4">
              AnantaGo may display advertisements provided by third-party
              advertising services, including Google AdSense or other
              advertising partners.
            </p>

            <p className="mt-4">
              Advertising partners may use cookies or similar technologies to
              provide, personalize or measure advertisements. Their use of
              information is governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              7. Third-party links
            </h2>

            <p className="mt-4">
              Our articles may contain links to websites or services operated
              by third parties. AnantaGo is not responsible for the privacy
              practices, content or security of external websites.
            </p>

            <p className="mt-4">
              We recommend reviewing the privacy policy of any third-party
              website you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              8. Data security
            </h2>

            <p className="mt-4">
              We take reasonable measures to protect information associated
              with the website. However, no method of transmission or storage
              over the internet can be guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              9. Children's privacy
            </h2>

            <p className="mt-4">
              AnantaGo is not intended to knowingly collect personal
              information from children. If you believe that a child has
              provided personal information to us, please contact us so that
              appropriate action can be taken.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              10. Your choices
            </h2>

            <p className="mt-4">
              Depending on your browser, device and location, you may be able
              to control cookies, advertising preferences and certain
              analytics settings through your browser or available privacy
              controls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              11. Changes to this Privacy Policy
            </h2>

            <p className="mt-4">
              We may update this Privacy Policy from time to time to reflect
              changes to our website, services or legal requirements. Any
              updates will be published on this page with a revised "Last
              updated" date.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              12. Contact us
            </h2>

            <p className="mt-4">
              If you have questions about this Privacy Policy or how AnantaGo
              handles information, you can contact us at:
            </p>

            <p className="mt-5">
              <a
                href="mailto:contact@anatago.com"
                className="font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
              >
                contact@anatago.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}