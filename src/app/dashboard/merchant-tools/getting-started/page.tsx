import { Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";

export default function GettingStartedPage() {
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
              label: "Getting started",
            },
          ]}
        />

        <div className="flex-1 flex flex-col gap-6 px-0 py-6">
          <div className="flex flex-col gap-4 px-6">
            <div className="bg-card border border-border flex flex-col gap-6 px-0 py-6 rounded-xl">
              <div className="flex flex-col gap-2 px-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Getting started with Merchant Tools
                </h2>
                <p className="text-base text-muted-foreground">
                  Learn how to integrate MNEE PAY into your website or application
                  to accept cryptocurrency payments.
                </p>
              </div>

              <div className="flex flex-col gap-4 px-6">
                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Step 1: Create Your Module
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the Modules section and click "Create module" to set
                    up your first payment integration.
                  </p>
                </div>

                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Step 2: Configure Your Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your payment flow, select supported cryptocurrencies,
                    and configure your webhook endpoints.
                  </p>
                </div>

                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Step 3: Integrate the Code
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Copy the provided code snippet and add it to your React
                    application to start accepting payments.
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
