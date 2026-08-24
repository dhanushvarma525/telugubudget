import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About AnantaGo",
  description:
    "Learn more about AnantaGo, a technology publication covering AI, tech, apps, security, how-to guides and digital life.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            About AnantaGo
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Technology, explained simply.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            AnantaGo is an independent technology publication focused on
            making the digital world easier to understand.
          </p>
        </div>

        {/* Content */}
        <div className="mt-14 space-y-12 text-[17px] leading-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              What is AnantaGo?
            </h2>

            <p className="mt-4">
              AnantaGo covers the technology people use every day. From
              artificial intelligence and new technology to useful apps,
              online security and practical how-to guides, our goal is to
              provide information that is clear, useful and easy to follow.
            </p>

            <p className="mt-4">
              Technology can often feel complicated or overwhelming. We
              believe good technology journalism should make things simpler,
              not harder. That is why AnantaGo focuses on straightforward
              explanations, practical information and useful context.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              What we cover
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "AI",
                  description:
                    "Artificial intelligence news, tools, trends and practical uses.",
                },
                {
                  title: "Tech",
                  description:
                    "Technology news, products, platforms and digital trends.",
                },
                {
                  title: "How-To",
                  description:
                    "Step-by-step guides that help you solve everyday technology problems.",
                },
                {
                  title: "Apps",
                  description:
                    "Useful apps, features, updates and practical recommendations.",
                },
                {
                  title: "Security",
                  description:
                    "Online safety, privacy, scams and cybersecurity explained clearly.",
                },
                {
                  title: "Explained",
                  description:
                    "Simple explanations of technology, concepts and digital trends.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-bold text-gray-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              Our approach
            </h2>

            <p className="mt-4">
              We aim to publish useful and understandable articles rather
              than simply producing content for the sake of publishing.
              Articles are written with clarity, practical value and the
              reader's experience in mind.
            </p>

            <p className="mt-4">
              When a topic is complex, we break it down into smaller,
              understandable sections. When a topic requires practical
              instructions, we focus on clear steps that readers can actually
              follow.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              Our goal
            </h2>

            <p className="mt-4">
              Our goal is simple: to become a reliable destination for people
              who want to understand technology without unnecessary
              complexity.
            </p>

            <p className="mt-4">
              Whether you are learning about AI, trying to solve a technology
              problem, looking for a useful app or simply keeping up with the
              digital world, AnantaGo aims to give you information that is
              practical and easy to understand.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              Get in touch
            </h2>

            <p className="mt-4">
              Have a question, suggestion, correction or feedback? We would
              love to hear from you.
            </p>

            <p className="mt-5">
              <a
                href="/contact"
                className="font-semibold text-gray-950 underline underline-offset-4 transition hover:text-gray-600"
              >
                Contact AnantaGo →
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}