import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCheckoutManualPaymentQrValue } from "@/lib/dashboard/checkout/manual-payment-qr";

const destination = "MD4BSDQMD7SLBD24GNJBYODARYEYUWDWVP3QZTDQPHE2TFMYI5CMFUVNBTTDPJMYAERHS";

test("buildCheckoutManualPaymentQrValue returns the payment address only", () => {
  assert.equal(buildCheckoutManualPaymentQrValue({ destination }), destination);
});

test("buildCheckoutManualPaymentQrValue trims whitespace", () => {
  assert.equal(buildCheckoutManualPaymentQrValue({ destination: `  ${destination}  ` }), destination);
});

test("buildCheckoutManualPaymentQrValue returns empty string without destination", () => {
  assert.equal(buildCheckoutManualPaymentQrValue({ destination: "" }), "");
  assert.equal(buildCheckoutManualPaymentQrValue({ destination: "   " }), "");
});
