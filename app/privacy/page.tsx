import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how AnantaGo collects, uses, and protects information when you visit and use our website.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            AnantaGo
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            This Privacy Policy explains how AnantaGo collects, uses, stores,
            and protects information when you visit or use our website.
          </p>

          <p className="mt-5 text-sm text-gray-500">
            Last updated: August 25, 2026
          </p>
        </header>

        {/* Content */}
        <article className="mt-14 space-y-12 text-[16px] leading-8 text-gray-700">
          {/* 1 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              1. About This Privacy Policy
            </h2>

            <p className="mt-4">
              AnantaGo is a technology publishing website covering artificial
              intelligence, technology, apps, cybersecurity, how-to guides,
              and technology explainers.
            </p>

            <p className="mt-4">
              This Privacy Policy describes the types of information that may
              be collected when you visit AnantaGo, how that information may be
              used, and the choices available to you.
            </p>

            <p className="mt-4">
              By accessing or using AnantaGo, you acknowledge the practices
              described in this Privacy Policy.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              2. Information We May Collect
            </h2>

            <p className="mt-4">
              We may collect certain information automatically when you visit
              or interact with AnantaGo. This may include:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>IP address and general location information.</li>
              <li>Browser type and operating system.</li>
              <li>Device type and technical information.</li>
              <li>Pages and articles you visit.</li>
              <li>Time spent on pages and general interaction information.</li>
              <li>Referring websites or pages.</li>
              <li>Other technical information provided by your browser.</li>
            </ul>

            <p className="mt-5">
              If you contact us directly, we may receive information that you
              voluntarily provide, such as your name, email address, and the
              contents of your message.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              3. How We Use Information
            </h2>

            <p className="mt-4">
              Information collected through AnantaGo may be used for purposes
              including:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Operating and maintaining the website.</li>
              <li>Improving website performance and user experience.</li>
              <li>
                Understanding which articles and topics are useful to readers.
              </li>
              <li>Analyzing website traffic and content performance.</li>
              <li>Responding to messages and requests.</li>
              <li>
                Detecting spam, abuse, fraud, or potential security issues.
              </li>
              <li>Improving our content and website features.</li>
              <li>Complying with applicable legal requirements.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              4. Cookies and Similar Technologies
            </h2>

            <p className="mt-4">
              AnantaGo may use cookies and similar technologies to improve the
              website experience, remember preferences, understand website
              usage, and measure content performance.
            </p>

            <p className="mt-4">
              Cookies are small files that may be stored on your device by a
              website. You can generally control or disable cookies through
              your browser settings.
            </p>

            <p className="mt-4">
              Disabling certain cookies may affect how some website features
              function.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              5. Analytics
            </h2>

            <p className="mt-4">
              We may use analytics services to understand how visitors use
              AnantaGo and how our content performs.
            </p>

            <p className="mt-4">
              Analytics providers may collect information such as pages
              visited, device information, approximate location, browser
              information, referral sources, and general interaction data.
            </p>

            <p className="mt-4">
              We use this information to understand our audience, improve
              content, identify technical issues, and improve the overall
              website experience.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              6. Advertising
            </h2>

            <p className="mt-4">
              AnantaGo may display advertisements provided by third-party
              advertising networks, including Google AdSense and other
              advertising partners.
            </p>

            <p className="mt-4">
              Advertising partners may use cookies, device information, or
              similar technologies to deliver, measure, or personalize
              advertisements where permitted by applicable law.
            </p>

            <p className="mt-4">
              Third-party advertising services operate under their own privacy
              policies and terms. We recommend reviewing the privacy policies
              of the advertising providers used on the website.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              7. Third-Party Services
            </h2>

            <p className="mt-4">
              AnantaGo may use third-party services to operate, analyze,
              secure, or improve the website. These services may process
              certain technical or usage information according to their own
              privacy policies.
            </p>

            <p className="mt-4">
              Third-party services may include analytics providers, hosting
              providers, security services, advertising networks, and other
              technology providers.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              8. Links to Other Websites
            </h2>

            <p className="mt-4">
              Our articles may contain links to external websites, services,
              applications, or other online resources.
            </p>

            <p className="mt-4">
              AnantaGo does not control the privacy practices, security, or
              content of third-party websites. Visiting an external website is
              subject to that website&apos;s own privacy policy and terms.
            </p>

            <p className="mt-4">
              We encourage you to review the privacy policies of websites you
              visit through links on AnantaGo.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              9. Data Security
            </h2>

            <p className="mt-4">
              We take reasonable measures to protect information associated
              with AnantaGo from unauthorized access, misuse, alteration, or
              disclosure.
            </p>

            <p className="mt-4">
              However, no method of transmitting or storing information over
              the internet can be guaranteed to be completely secure.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              10. Children&apos;s Privacy
            </h2>

            <p className="mt-4">
              AnantaGo is a general-audience technology website and is not
              intended to knowingly collect personal information from children.
            </p>

            <p className="mt-4">
              If you believe that a child has provided personal information to
              us, please contact us so that we can review the situation and
              take appropriate action where necessary.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              11. Your Privacy Choices
            </h2>

            <p className="mt-4">
              Depending on your browser, device, and location, you may have
              options to manage cookies, advertising preferences, and certain
              privacy settings.
            </p>

            <p className="mt-4">
              You can also control certain cookies through your browser
              settings. Some third-party services may provide additional
              privacy or advertising controls.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              12. Changes to This Privacy Policy
            </h2>

            <p className="mt-4">
              We may update this Privacy Policy from time to time to reflect
              changes to AnantaGo, our services, technology, or applicable
              legal requirements.
            </p>

            <p className="mt-4">
              When changes are made, the updated version will be published on
              this page and the &quot;Last updated&quot; date will be revised.
            </p>
          </section>

          {/* 13 */}
          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              13. Contact Us
            </h2>

            <p className="mt-4">
              If you have questions, concerns, or requests regarding this
              Privacy Policy or the way AnantaGo handles information, you can
              contact us at:
            </p>

            <p className="mt-5">
              <a
                href="mailto:dhanushvarmajampana@gmail.com"
                className="font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
              >
                dhanushvarmajampana@gmail.com
              </a>
            </p>
          </section>

          {/* Final Note */}
          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <p className="text-sm leading-7 text-gray-600">
              This Privacy Policy describes the current privacy practices of
              AnantaGo. It may be updated as the website, technology,
              advertising services, or applicable requirements change.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}