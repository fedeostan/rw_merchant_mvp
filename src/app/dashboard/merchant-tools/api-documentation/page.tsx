import { Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PropsTable } from "@/components/docs/PropsTable";
import { InterfaceBlock } from "@/components/docs/InterfaceBlock";
import { DocSection } from "@/components/docs/DocSection";
import { DocNavigation } from "@/components/docs/DocNavigation";
import { CodeBlock } from "@/components/docs/CodeBlock";

export default function APIDocumentationPage() {
  // Core Props Data
  const corePropsData = [
    {
      prop: "checkoutType",
      type: "'paywall' | 'ecommerce' | 'donation'",
      required: true,
      description: "Type of checkout experience",
    },
    {
      prop: "payment",
      type: "PaymentDetails",
      required: true,
      description: "Payment configuration object",
    },
    {
      prop: "theme",
      type: "'light' | 'dark' | 'auto'",
      required: false,
      description: "Theme mode (default: 'light')",
    },
    {
      prop: "styling",
      type: "StyleConfig",
      required: false,
      description: "Custom styling options",
    },
    {
      prop: "metadata",
      type: "CheckoutMetadata",
      required: false,
      description:
        "Custom data to link payments to your products (returned in PaymentResult)",
    },
  ];

  // Button Configuration Data
  const buttonConfigData = [
    {
      prop: "buttonConfig",
      type: "ButtonConfig",
      description: "Customize the checkout button",
    },
    {
      prop: "triggerMode",
      type: "'button' | 'manual'",
      description: "How to trigger the modal",
    },
    {
      prop: "open",
      type: "boolean",
      description: "Controlled modal state",
    },
    {
      prop: "onOpenChange",
      type: "(open: boolean) => void",
      description: "Modal state change handler",
    },
  ];

  // Callbacks Data
  const callbacksData = [
    {
      prop: "onSuccess",
      type: "(result: PaymentResult, formData?: Record<string, any>) => void",
      description: "Called on successful payment",
    },
    {
      prop: "onCancel",
      type: "() => void",
      description: "Called when checkout is cancelled",
    },
    {
      prop: "onError",
      type: "(error: Error) => void",
      description: "Called on payment error",
    },
    {
      prop: "onFieldChange",
      type: "(fieldId: string, value: any) => void",
      description: "Called when a field value changes",
    },
    {
      prop: "onWalletConnect",
      type: "(address: string, provider: WalletProvider) => void",
      description: "Called when wallet connects",
    },
  ];

  // FloatingCartButton Props
  const floatingCartButtonData = [
    {
      prop: "onClick",
      type: "() => void",
      description: "Called when button is clicked",
    },
    {
      prop: "position",
      type: "'top-right' | 'top-left' | etc.",
      description: "Position on screen",
    },
  ];

  // CartView Props
  const cartViewData = [
    {
      prop: "onContinueShopping",
      type: "() => void",
      description: "Close cart view",
    },
    {
      prop: "onProceedToCheckout",
      type: "() => void",
      description: "Open checkout modal",
    },
    {
      prop: "collectEmail",
      type: "boolean",
      description: "Show email form",
    },
    {
      prop: "collectShipping",
      type: "boolean",
      description: "Show shipping form",
    },
  ];

  // CartCheckoutModal Props
  const cartCheckoutModalData = [
    {
      prop: "open",
      type: "boolean",
      description: "Modal open state",
    },
    {
      prop: "onOpenChange",
      type: "(open: boolean) => void",
      description: "State change handler",
    },
    {
      prop: "payTo",
      type: "string",
      description: "Recipient wallet address",
    },
    {
      prop: "onSuccess",
      type: "(result, checkoutData) => void",
      description: "Success callback with cart items",
    },
  ];

  // PaymentDetails Interface
  const paymentDetailsCode = `interface PaymentDetails {
  amount: string | number;
  currency: Stablecoin; // 'USDC' | 'USDT' | 'DAI' | etc.
  mneeDepositAddress: string; // Recipient wallet address
  networkId?: number;
  tokenAddress?: string;
}`;

  // CustomField Interface
  const customFieldCode = `interface CustomField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidation;
  dependsOn?: {
    fieldId: string;
    value: any;
  };
}`;

  // MneeProvider Example
  const mneeProviderCode = `import { MneeProvider } from '@mnee/checkout';

// Wrap your app or page with MneeProvider
<MneeProvider>
  <YourApp />
</MneeProvider>`;

  // E-commerce Config Example
  const ecommerceConfigCode = `ecommerceConfig={{
  productName: 'Premium T-Shirt',
  productDescription: 'High-quality cotton',
  productImage: '/product.jpg',
  showQuantitySelector: true,
  shippingCost: 5,
  taxRate: 0.08,
  enableCart: true, // Enables "Add to Cart" instead of direct checkout
}}`;

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

        <div className="flex-1 flex flex-col gap-6 px-0 py-6 overflow-y-auto">
          <div className="flex flex-col gap-4 px-6">
            {/* Hero Section */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground">
                API Reference
              </h1>
              <p className="text-base text-muted-foreground">
                Complete reference for all props and configurations.
              </p>
            </div>

            {/* Core Props Section */}
            <DocSection title="Core Props" id="core-props">
              <PropsTable data={corePropsData} />
            </DocSection>

            {/* PaymentDetails Section */}
            <DocSection title="PaymentDetails" id="payment-details">
              <InterfaceBlock title="" code={paymentDetailsCode} />
            </DocSection>

            {/* Button Configuration Section */}
            <DocSection
              title="Button Configuration"
              id="button-configuration"
            >
              <PropsTable data={buttonConfigData} />
            </DocSection>

            {/* Callbacks Section */}
            <DocSection title="Callbacks" id="callbacks">
              <PropsTable data={callbacksData} />
            </DocSection>

            {/* Custom Fields Section */}
            <DocSection
              title="Custom Fields"
              description="Create dynamic forms with validation:"
              id="custom-fields"
            >
              <InterfaceBlock title="" code={customFieldCode} />
            </DocSection>

            {/* Cart Components Section */}
            <DocSection
              title="Cart Components"
              description="For multi-item checkout experiences, use these cart components:"
              id="cart-components"
            >
              {/* MneeProvider */}
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    MneeProvider
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Required wrapper for cart functionality. Provides cart
                    context to all components.
                  </p>
                </div>
                <CodeBlock code={mneeProviderCode} language="tsx" />
              </div>

              {/* FloatingCartButton */}
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    FloatingCartButton
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Displays a floating cart icon with item count badge.
                  </p>
                </div>
                <PropsTable data={floatingCartButtonData} />
              </div>

              {/* CartView */}
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    CartView
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Displays cart items with quantity controls and collects
                    email/shipping info.
                  </p>
                </div>
                <PropsTable data={cartViewData} />
              </div>

              {/* CartCheckoutModal */}
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    CartCheckoutModal
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Handles payment for all cart items with wallet connection.
                  </p>
                </div>
                <PropsTable data={cartCheckoutModalData} />
              </div>
            </DocSection>

            {/* E-commerce Config Section */}
            <DocSection
              title="E-commerce Config with Cart"
              id="ecommerce-config"
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Enable cart by setting{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    enableCart: true
                  </code>{" "}
                  in ecommerceConfig:
                </p>
              </div>
              <CodeBlock code={ecommerceConfigCode} language="tsx" />
            </DocSection>

            {/* Navigation */}
            <DocNavigation
              previous={{
                label: "Examples",
                href: "/dashboard/merchant-tools/examples",
              }}
              next={{
                label: "Styles & Theming",
                href: "/dashboard/merchant-tools/styles-and-theming",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
