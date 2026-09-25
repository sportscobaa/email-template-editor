export interface Plan {
  id: "free" | "pro" | "team";
  name: string;
  price: string;
  period: string;
  tagline: string;
  available: boolean;
  features: string[];
}

/** Everything in the Free plan is what the editor does today. */
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "The full editor. No sign-up, no card, no trial timer.",
    available: true,
    features: [
      "Drag-and-drop editor with all 10 blocks",
      "Unlimited emails and HTML exports",
      "Copy or download HTML, no watermark",
      "Desktop and mobile preview",
      "Save and import templates as JSON",
      "Autosave in your browser",
      "HTML render API",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per month",
    tagline: "For people who send email every week.",
    available: false,
    features: [
      "Everything in Free",
      "Save templates to the cloud",
      "Image upload and hosting",
      "Send test emails",
      "Premium template library",
      "AI template generation",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$39",
    period: "per month",
    tagline: "For agencies and marketing teams.",
    available: false,
    features: ["Everything in Pro", "Shared team workspace", "Brand kit: colors, fonts, logos", "Roles and permissions"],
  },
];

export const PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: "Is it really free?",
    a: "Yes. The editor, every block, preview and HTML export are free with no limits. There is nothing to pay for today.",
  },
  {
    q: "Do I need an account or a credit card?",
    a: "No. Open the editor and start building. Your work is saved in your browser, and you can download it as JSON any time.",
  },
  {
    q: "Can I use the exported HTML in my business?",
    a: "Yes. The HTML you export is yours. Paste it into Mailchimp, Brevo, SendGrid, Gmail or any tool that accepts HTML email.",
  },
  {
    q: "Is there a watermark or a “Made with” footer?",
    a: "No. The exported HTML contains only what you put in the email.",
  },
  {
    q: "What happens when the paid plans launch?",
    a: "Everything in the Free plan stays free. Pro and Team add extras that need servers, such as cloud storage, image hosting and test sends.",
  },
];
