import { NextResponse } from "next/server";
import {
  MOCK_ANALYTICS,
  MOCK_API_KEYS,
  MOCK_API_LOGS,
  MOCK_CHECKOUT_SESSIONS,
  MOCK_CUSTOMERS,
  MOCK_HUB_COUNTS,
  MOCK_INTEGRATIONS,
  MOCK_INVOICES,
  MOCK_ORGANIZATION,
  MOCK_PAYMENT_LINKS,
  MOCK_PAYMENT_METHODS,
  MOCK_PAYMENTS,
  MOCK_USER_PROFILE,
  MOCK_VERIFICATION,
  MOCK_WEBHOOKS,
} from "@/lib/dashboard/mock/data";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function findById<T extends { id: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id) ?? null;
}

export function handleMockApi(method: string, path: string, _request: Request) {
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "user") {
    if (method === "GET" || method === "PATCH") {
      return json({ user: MOCK_USER_PROFILE });
    }
  }

  if (segments[0] === "session" && segments[1] === "active-organization") {
    return json({ organizationId: MOCK_ORGANIZATION.id });
  }

  if (segments[0] === "organizations" && segments.length === 1 && method === "GET") {
    return json({ organizations: [MOCK_ORGANIZATION] });
  }

  if (segments[0] !== "organizations" || segments.length < 2) {
    return json({ error: "Not found" }, 404);
  }

  const orgId = segments[1];
  const resource = segments[2];
  const rest = segments.slice(3);

  if (orgId !== MOCK_ORGANIZATION.id) {
    return json({ error: "Forbidden" }, 403);
  }

  if (!resource && method === "GET") {
    return json({ organization: MOCK_ORGANIZATION });
  }

  if (resource === "analytics" && method === "GET") {
    return json(MOCK_ANALYTICS);
  }

  if (resource === "payments") {
    if (rest[0] === "counts" && method === "GET") {
      return json(MOCK_HUB_COUNTS);
    }
    if (rest.length === 1 && method === "GET") {
      const payment = findById(MOCK_PAYMENTS, rest[0]);
      return payment ? json(payment) : json({ error: "Not found" }, 404);
    }
    if (method === "GET") {
      return json({ payments: MOCK_PAYMENTS, total: MOCK_PAYMENTS.length });
    }
    if (method === "POST") {
      return json(MOCK_PAYMENTS[0], 201);
    }
  }

  if (resource === "customers") {
    if (rest.length === 1 && method === "GET") {
      const customer = findById(MOCK_CUSTOMERS, rest[0]);
      return customer
        ? json({ customer, payments: MOCK_PAYMENTS.slice(0, 1) })
        : json({ error: "Not found" }, 404);
    }
    if (method === "GET") {
      return json({ customers: MOCK_CUSTOMERS, total: MOCK_CUSTOMERS.length });
    }
    if (method === "POST") {
      return json(MOCK_CUSTOMERS[0], 201);
    }
  }

  if (resource === "invoices") {
    if (rest[0] === "preview-email" && method === "POST") {
      return json({ html: "<p>Invoice preview</p>", subject: "Invoice from Acme Payments" });
    }
    if (rest.length === 1 && method === "GET") {
      const invoice = findById(MOCK_INVOICES, rest[0]);
      return invoice ? json(invoice) : json({ error: "Not found" }, 404);
    }
    if (method === "GET") {
      return json({ invoices: MOCK_INVOICES, total: MOCK_INVOICES.length });
    }
    if (method === "POST") {
      return json(MOCK_INVOICES[0], 201);
    }
  }

  if (resource === "payment-links") {
    if (rest.length === 1 && method === "GET") {
      const link = findById(MOCK_PAYMENT_LINKS, rest[0]);
      return link ? json(link) : json({ error: "Not found" }, 404);
    }
    if (method === "GET") {
      return json({ payment_links: MOCK_PAYMENT_LINKS, total: MOCK_PAYMENT_LINKS.length });
    }
    if (method === "POST") {
      return json(MOCK_PAYMENT_LINKS[0], 201);
    }
  }

  if (resource === "checkout-sessions") {
    if (rest.length === 1 && method === "GET") {
      const session = findById(MOCK_CHECKOUT_SESSIONS, rest[0]);
      return session ? json(session) : json({ error: "Not found" }, 404);
    }
    if (method === "GET") {
      return json({
        checkout_sessions: MOCK_CHECKOUT_SESSIONS,
        total: MOCK_CHECKOUT_SESSIONS.length,
      });
    }
  }

  if (resource === "api-keys") {
    if (rest.length === 1 && method === "DELETE") {
      return json({ deleted: true });
    }
    if (method === "GET") {
      return json({ api_keys: MOCK_API_KEYS });
    }
    if (method === "POST") {
      return json({
        api_key: {
          ...MOCK_API_KEYS[0],
          key: "pk_test_demo_full_key_only_shown_once",
        },
      }, 201);
    }
  }

  if (resource === "api-logs" && method === "GET") {
    return json({ logs: MOCK_API_LOGS, total: MOCK_API_LOGS.length });
  }

  if (resource === "webhooks") {
    if (rest.length === 1 && method === "GET") {
      const webhook = findById(MOCK_WEBHOOKS, rest[0]);
      return webhook ? json({ webhook, deliveries: [] }) : json({ error: "Not found" }, 404);
    }
    if (method === "GET") {
      return json({ webhooks: MOCK_WEBHOOKS });
    }
    if (method === "POST") {
      return json({
        webhook: MOCK_WEBHOOKS[0],
        secret: "whsec_demo_secret_once",
      }, 201);
    }
  }

  if (resource === "integrations") {
    if (rest[0] === "discord" || rest[0] === "slack") {
      if (rest[1] === "channels" && method === "GET") {
        return json({ channels: [{ id: "ch_1", name: "#payments" }] });
      }
      if (method === "GET") {
        return json({ connected: false, status: "not_connected", settings: null });
      }
      if (method === "POST" || method === "PATCH" || method === "DELETE") {
        return json({ ok: true });
      }
    }
    if (method === "GET") {
      return json({ integrations: MOCK_INTEGRATIONS });
    }
  }

  if (resource === "payment-methods" && method === "GET") {
    return json(MOCK_PAYMENT_METHODS);
  }

  if (resource === "payment-methods" && (method === "POST" || method === "PATCH")) {
    return json(MOCK_PAYMENT_METHODS.payment_methods[0]);
  }

  if (resource === "verification" && method === "GET") {
    return json(MOCK_VERIFICATION);
  }

  if (resource === "environment" && (method === "GET" || method === "PATCH")) {
    return json({ environment: MOCK_ORGANIZATION.environment });
  }

  if (resource === "transactions" && method === "GET") {
    return json({
      transactions: MOCK_PAYMENTS.map((payment) => ({
        id: payment.id,
        type: "payment",
        amount: payment.amount,
        asset_code: payment.settlement_asset.asset_code,
        status: payment.status,
        created_at: payment.created_at,
      })),
      next_cursor: "",
    });
  }

  if (resource === "settlements" && method === "GET") {
    return json({
      settlements: [
        {
          id: "set_demo_001",
          amount: "124.38",
          asset_code: "USDC",
          status: "completed",
          tx_hash: "settlement_tx_demo_001",
          created_at: MOCK_PAYMENTS[0]?.created_at,
        },
      ],
      next_cursor: "",
    });
  }

  if (resource === "members" && method === "GET") {
    return json({
      members: [
        {
          id: "mem_demo_001",
          user_id: MOCK_USER_PROFILE.id,
          role: "owner",
          name: MOCK_USER_PROFILE.name,
          email: MOCK_USER_PROFILE.email,
          image: MOCK_USER_PROFILE.image,
          joined_at: MOCK_USER_PROFILE.createdAt,
        },
      ],
    });
  }

  if (resource === "settlement-wallet" && method === "GET") {
    return json({
      connected: false,
      address: null,
      network: "stellar_testnet",
    });
  }

  if (method === "PATCH" || method === "POST" || method === "DELETE") {
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
}
