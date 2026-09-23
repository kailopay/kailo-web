declare const log: ({ message, type, mention, }: {
    message: string;
    type: "alerts" | "cron" | "errors" | "links" | "payouts";
    mention?: boolean;
}) => Promise<Response | undefined>;

export { log };
