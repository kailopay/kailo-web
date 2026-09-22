export async function auth() {
  return {
    user: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Ada Lovelace",
      email: "ada@acmepayments.demo",
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
