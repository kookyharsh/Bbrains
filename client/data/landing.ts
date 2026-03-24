import { Star, Wallet, Store, Brain } from "lucide-react";

export const landingData = {
  navbar: {
    brand: "BBrains",
    links: [
      { text: "Features", url: "/features" },
      { text: "Contact Us", url: "#contact" }
    ],
    cta: {
      text: "Login",
      url: "/auth/login"
    }
  },
  hero: {
    title: {
      part1: "The Modern LMS for",
      part2: "Forward-Thinking",
      highlight: "Colleges"
    },
    subtitle: "Transform student engagement with our gamified learning platform. Earn XP, manage a digital wallet, and trade in the campus market.",
    primaryCta: { text: "Get Started Free", url: "#contact" },
    floatingCard: {
      title: "Earn Rewards!",
      subtitle: "+50 XP • Claim Daily Rewards",
      buttonText: "Claim XP"
    }
  },
  about: {
    titleTag: "About The Product",
    heading: "Experience the future of team collaboration with our unified, intelligent platform today.",
    paragraphs: [
      {
        dropcap: "B",
        text: "Brains centralizes your entire workflow into one intuitive interface, eliminating the need for disjointed tools. By harnessing the power of real-time data and smart automation, we empower your team to focus on high-impact innovation."
      },
      {
        text: "Designed with scalability in mind, our infrastructure adapts seamlessly to your growing needs, ensuring performance never falters. Join a community of forward-thinking organizations that have redefined productivity and achieved unparalleled success with our comprehensive solution."
      }
    ]
  },
  gamification: {
    title: "Gamify Your Campus",
    features: [
      {
        icon: Star,
        iconBg: "bg-hand-yellow",
        iconColor: "text-hand-pencil",
        title: "XP System",
        description: "Engage and level up",
        content: "Students earn Experience Points (XP) for completing courses, participating in discussions, and hitting academic milestones.",
        cardStyle: "bg-white -rotate-1",
        cardDecoration: "tape"
      },
      {
        icon: Wallet,
        iconBg: "bg-hand-blue",
        iconColor: "text-white",
        title: "Digital Wallet",
        description: "Manage campus currency",
        content: "Every student gets a digital wallet. Transform academic achievements into campus currency to spend on real rewards.",
        cardStyle: "rotate-1",
        cardDecoration: "tack",
        cardVariant: "yellow"
      },
      {
        icon: Store,
        iconBg: "bg-hand-red",
        iconColor: "text-white",
        title: "Campus Market",
        description: "Redeem for rewards",
        content: "Spend wallet balance in the marketplace. Unlock premium campus parking, dining hall credits, and exclusive merch.",
        cardStyle: "-rotate-1",
        cardDecoration: "tape"
      }
    ]
  },
  ctaSection: {
    titleLine1: "Ready to transform your",
    titleLine2: "learning experience?",
    subtitle: "Join thousands of students and educators already using bBrains to learn smarter and achieve more.",
    placeholder: "Enter your email...",
    buttonText: "Contact Us"
  },
  footer: {
    brand: {
      name: "BBrains Inc.",
      description: "Empowering students to learn smarter."
    },
    sections: [
      {
        title: "Product",
        links: [
          { text: "Features", url: "/features" },
          { text: "Changelog", url: "#" },
        ]
      },
      {
        title: "Company",
        links: [
          { text: "About", url: "#about" },
          { text: "Contact", url: "#contact" },
        ]
      },
      {
        title: "Resources",
        links: [
          { text: "Documentation", url: "#" },
          { text: "Help Center", url: "#" },
          { text: "API Reference", url: "#" },
          { text: "Community", url: "#" },
        ]
      }
    ],
    legal: {
      builtWith: "Built with ♥ to learn better.",
      copyright: "© 2026 bBrains."
    }
  }
};
