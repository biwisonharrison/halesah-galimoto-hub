export const metadata = { title: "Safety guide · Halesah Galimoto Hub" };

const SECTIONS = [
  {
    title: "Before you meet",
    tips: [
      "Keep the first conversation on Halesah Galimoto Hub chat or WhatsApp. Avoid moving to unknown apps immediately.",
      "Ask for the registration book (logbook) details and check that the chassis and engine number match the car in photos.",
      "Prefer sellers with a Verified Seller or Registered Dealer badge. It means we've checked their phone and ID.",
    ],
  },
  {
    title: "Where to meet",
    tips: [
      "Meet in a public, well lit place, such as a fuel station, mall car park, or police station forecourt.",
      "Bring a friend or family member, especially for cars of higher value.",
      "Never meet at an unfamiliar private address for a first viewing.",
    ],
  },
  {
    title: "Inspecting the car",
    tips: [
      "Check the registration book (logbook) matches the seller's ID and the car's chassis number.",
      "Take it for a test drive on both tarmac and a rough patch of road if possible.",
      "Consider paying a trusted mechanic a small fee to inspect the car before you commit.",
      "Use the Car Lookup tool to check known common faults for that exact model and year.",
    ],
  },
  {
    title: "Paying safely",
    tips: [
      "Never send a deposit before you've seen the car in person.",
      "Use traceable payment methods (mobile money, bank transfer) rather than large cash sums where possible.",
      "Only transfer ownership at the Road Traffic office once payment has fully cleared.",
    ],
  },
  {
    title: "Spotting a scam",
    tips: [
      "A price far below similar listings is the biggest warning sign. Check the price context shown on every listing.",
      "Sellers who refuse to meet in person or take a video call are a red flag.",
      "Report any listing that feels wrong. Our team reviews reports within 24 hours.",
    ],
  },
];

export default function SafetyGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Buying and selling safely</h1>
      <p className="mt-2 text-gray-600">
        Car sales in Malawi have traditionally happened through Facebook groups and WhatsApp forwards with no
        verification. Here&apos;s how to protect yourself on and off Halesah Galimoto Hub.
      </p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-gray-700">
              {section.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
