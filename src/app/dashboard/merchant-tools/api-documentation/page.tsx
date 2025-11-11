import { Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";

export default function APIDocumentationPage() {
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
              label: "API documentation",
            },
          ]}
        />

        <div className="flex-1 flex flex-col gap-6 px-0 py-6">
          <div className="flex flex-col gap-4 px-6">
            <div className="bg-card border border-border flex flex-col gap-6 px-0 py-6 rounded-xl">
              <div className="flex flex-col gap-2 px-6">
                <h2 className="text-lg font-semibold text-foreground">
                  API Documentation
                </h2>
                <p className="text-base text-muted-foreground">
                  Complete reference for the MNEE PAY API endpoints and integration
                  methods.
                </p>
              </div>

              <div className="flex flex-col gap-4 px-6">
                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Authentication
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    All API requests require authentication using your API key.
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Create Payment
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    POST /api/v1/payments
                  </p>
                  <code className="text-xs bg-muted p-2 rounded block whitespace-pre">
                    {`{
  "amount": 10.00,
  "currency": "USD",
  "description": "Product purchase"
}`}
                  </code>
                </div>

                <div className="border border-border rounded-md p-4">
                  <h3 className="text-sm font-medium text-card-foreground mb-2">
                    Webhooks
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure webhook endpoints to receive real-time payment status
                    updates.
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
