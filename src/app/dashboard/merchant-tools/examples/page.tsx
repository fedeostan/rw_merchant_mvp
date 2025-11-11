import { Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";

export default function ExamplesPage() {
  const examples = [
    {
      title: "E-commerce Checkout",
      description: "Complete checkout flow with crypto payment integration",
      tags: ["React", "TypeScript", "Next.js"],
    },
    {
      title: "Donation Widget",
      description: "Embeddable donation widget for non-profit websites",
      tags: ["React", "JavaScript"],
    },
    {
      title: "Subscription Paywall",
      description: "Monthly subscription management with crypto payments",
      tags: ["React", "TypeScript"],
    },
  ];

  return (
    <div className="flex flex-col gap-2.5 h-full pl-0 pr-2 py-2">
      <div className="bg-card flex-1 flex flex-col rounded-xl shadow-sm">
        <Breadcrumb
          items={[
            {
              label: "Merchant tools",
              icon: Wrench,
            },
            {
              label: "Examples",
            },
          ]}
        />

        <div className="flex-1 flex flex-col gap-6 px-0 py-6">
          <div className="flex flex-col gap-4 px-6">
            <div className="bg-card border border-border flex flex-col gap-6 px-0 py-6 rounded-xl">
              <div className="flex flex-col gap-2 px-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Integration Examples
                </h2>
                <p className="text-base text-muted-foreground">
                  Browse through real-world examples and code samples to help you
                  integrate MNEE PAY into your application.
                </p>
              </div>

              <div className="flex flex-col gap-4 px-6">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-md p-4"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-medium text-card-foreground">
                        {example.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {example.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {example.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
