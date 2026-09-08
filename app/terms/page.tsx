import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Read the Terms of Use for AnantaGo, covering website usage, content, links, intellectual property and user responsibilities.",
};

export default function TermsPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            AnantaGo
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Terms of Use
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            These terms explain the rules and conditions for using the
            AnantaGo website.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Last updated: August 24, 2026
          </p>
        </div>

        {/* Content */}
        <div className="mt-14 space-y-12 text-[16px] leading-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              1. Acceptance of these terms
            </h2>

            <p className="mt-4">
              By accessing or using AnantaGo, you agree to comply with these
              Terms of Use and all applicable laws and regulations. If you do
              not agree with these terms, please do not use the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              2. About AnantaGo
            </h2>

            <p className="mt-4">
              AnantaGo is a technology publishing website that provides
              articles, guides, explanations, news, opinions and other
              technology-related content.
            </p>

            <p className="mt-4">
              Our content is intended for general informational and
              educational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              3. Use of the website
            </h2>

            <p className="mt-4">
              You agree to use AnantaGo only for lawful purposes and in a way
              that does not interfere with the operation or security of the
              website.
            </p>

            <p className="mt-4">You must not:</p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                Attempt to gain unauthorized access to the website or its
                systems.
              </li>
              <li>
                Use the website to distribute malicious software or harmful
                content.
              </li>
              <li>
                Attempt to disrupt, overload or interfere with the website.
              </li>
              <li>
                Copy or reproduce substantial portions of our content without
                permission.
              </li>
              <li>
                Use automated methods to access the website in a way that
                causes unreasonable load or disruption.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              4. Content and information
            </h2>

            <p className="mt-4">
              We make reasonable efforts to provide useful and accurate
              information. However, technology changes quickly and information
              may become outdated or contain errors.
            </p>

            <p className="mt-4">
              Content published on AnantaGo should not be considered a
              guarantee that a particular product, service, application,
              technology or method will work in every situation.
            </p>

            <p className="mt-4">
              You should independently verify important information before
              making decisions based on content published on this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              5. How-to guides
            </h2>

            <p className="mt-4">
              AnantaGo may publish step-by-step guides covering software,
              devices, applications, websites and other technology.
            </p>

            <p className="mt-4">
              Following any guide is done at your own discretion and risk.
              We are not responsible for data loss, device damage, account
              issues or other consequences resulting from actions taken based
              on a guide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              6. Intellectual property
            </h2>

            <p className="mt-4">
              Unless otherwise stated, the original content published on
              AnantaGo, including articles, text, graphics, branding and
              website design, belongs to AnantaGo or its respective licensors.
            </p>

            <p className="mt-4">
              You may read, share and link to our content for personal and
              informational purposes, provided that appropriate attribution is
              maintained and the original content is not presented as your
              own.
            </p>

            <p className="mt-4">
              Reproducing, republishing or commercially distributing substantial
              portions of AnantaGo content without permission is not permitted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              7. Third-party websites and services
            </h2>

            <p className="mt-4">
              AnantaGo may link to third-party websites, applications,
              products or services.
            </p>

            <p className="mt-4">
              These external websites are operated independently from AnantaGo.
              We do not control their content, availability, policies or
              practices and are not responsible for any loss or damage
              resulting from your use of third-party websites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              8. Advertising
            </h2>

            <p className="mt-4">
              AnantaGo may display advertisements from third-party advertising
              providers. Advertisements may be selected or personalized based
              on information collected by advertising providers according to
              their own policies.
            </p>

            <p className="mt-4">
              The presence of an advertisement does not necessarily mean that
              AnantaGo endorses the advertised product or service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              9. Disclaimer
            </h2>

            <p className="mt-4">
              The AnantaGo website and its content are provided for general
              informational purposes. We do not guarantee that the website or
              its content will always be complete, accurate, current,
              uninterrupted or error-free.
            </p>

            <p className="mt-4">
              To the maximum extent permitted by applicable law, AnantaGo is
              not responsible for losses or damages arising from reliance on
              information published on the website or from the use or
              inability to use the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              10. Changes to these terms
            </h2>

            <p className="mt-4">
              We may update these Terms of Use from time to time. Changes will
              become effective when the updated terms are published on this
              page.
            </p>

            <p className="mt-4">
              Your continued use of AnantaGo after changes are published means
              that you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              11. Contact
            </h2>

            <p className="mt-4">
              If you have questions about these Terms of Use, please contact
              AnantaGo at:
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

          <section className="border-t border-gray-200 pt-10">
            <p className="text-sm leading-6 text-gray-500">
              These Terms of Use are provided for general website use and do
              not constitute legal advice.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}