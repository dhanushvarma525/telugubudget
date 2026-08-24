import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact AnantaGo",
  description:
    "Contact AnantaGo for questions, feedback, suggestions, corrections and other inquiries.",
};

export default function ContactPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Contact AnantaGo
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            We'd love to hear from you.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Have a question, suggestion, correction or feedback? Get in touch
            with the AnantaGo team.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {/* General Inquiries */}
          <section className="rounded-2xl border border-gray-200 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg">
              ✉
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              General inquiries
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              For general questions about AnantaGo, our articles or the
              website, you can contact us directly by email.
            </p>

            <a
              href="mailto:dhanushvarmajampana@gmail.com"
              className="mt-5 inline-block break-all font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
            >
              dhanushvarmajampana@gmail.com
            </a>
          </section>

          {/* Corrections */}
          <section className="rounded-2xl border border-gray-200 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg">
              ✓
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              Corrections & feedback
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Found an error in one of our articles? Let us know. We value
              accurate information and appreciate readers who point out
              mistakes or provide useful feedback.
            </p>

            <a
              href="mailto:dhanushvarmajampana@gmail.com"
              className="mt-5 inline-block font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
            >
              Send feedback →
            </a>
          </section>

          {/* Article Suggestions */}
          <section className="rounded-2xl border border-gray-200 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg">
              💡
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              Article suggestions
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Have a technology topic you would like us to cover? Send us
              your idea and tell us what you would like to learn about.
            </p>

            <a
              href="mailto:dhanushvarmajampana@gmail.com"
              className="mt-5 inline-block font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
            >
              Suggest a topic →
            </a>
          </section>

          {/* Other Inquiries */}
          <section className="rounded-2xl border border-gray-200 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg">
              ◼
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-950">
              Other inquiries
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              For other website-related inquiries, partnerships or
              collaboration requests, please contact us by email with the
              relevant details.
            </p>

            <a
              href="mailto:dhanushvarmajampana@gmail.com"
              className="mt-5 inline-block font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
            >
              Contact us →
            </a>
          </section>
        </div>

        {/* Before Contacting */}
        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-950">
            Before contacting us
          </h2>

          <p className="mt-4 text-[16px] leading-7 text-gray-600">
            Please include enough information about your question or request
            so we can understand what you need. If you are contacting us about
            a specific article, including the article title or page URL can
            help us respond more efficiently.
          </p>

          <p className="mt-5 text-[16px] leading-7 text-gray-600">
            Email us directly at{" "}
            <a
              href="mailto:dhanushvarmajampana@gmail.com"
              className="font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
            >
              dhanushvarmajampana@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}