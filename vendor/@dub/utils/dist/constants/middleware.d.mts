declare const DEFAULT_REDIRECTS: {
    home: string;
    dub: string;
    signin: string;
    login: string;
    register: string;
    signup: string;
    app: string;
    dashboard: string;
    links: string;
    settings: string;
    welcome: string;
    discord: string;
};
declare const DUB_HEADERS: {
    "x-powered-by": string;
};
declare const REDIRECTION_QUERY_PARAM = "redir_url";

export { DEFAULT_REDIRECTS, DUB_HEADERS, REDIRECTION_QUERY_PARAM };
