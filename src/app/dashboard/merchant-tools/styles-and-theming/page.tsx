import { Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";

export default function StylesAndThemingPage() {
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
              label: "Styles & theming",
            },
          ]}
        />

        <div className="flex-1 flex flex-col gap-6 px-0 py-6">
          <div className="flex flex-col gap-4 px-6">
            <div className="bg-card border border-border flex flex-col gap-6 px-0 py-6 rounded-xl">
              <div className="flex flex-col gap-2 px-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Styles & Theming
                </h2>
                <p className="text-base text-muted-foreground">
                  Customize the appearance of MNEE PAY components to match your
                  brand and design system.
                </p>
              </div>

              <div className="flex flex-col gap-4 px-6">
                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    CSS Variables
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Override default styles using CSS custom properties.
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block whitespace-pre">
                    {`:root {
  --mnee-primary: #d97706;
  --mnee-background: #ffffff;
  --mnee-border-radius: 8px;
}`}
                  </code>
                </div>

                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Theme Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Pass theme options directly to the MNEE PAY component.
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block whitespace-pre">
                    {`<MNEEPayButton
  theme={{
    primaryColor: '#d97706',
    fontSize: '14px',
    borderRadius: '8px'
  }}
/>`}
                  </code>
                </div>

                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Custom CSS Classes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Apply your own CSS classes to MNEE PAY components for complete
                    styling control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
