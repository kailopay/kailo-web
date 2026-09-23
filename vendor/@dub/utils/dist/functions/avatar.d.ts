declare const AVATAR_THEMES: readonly [{
    readonly bg: "#DBEAFE";
    readonly fg: "#2B7FFF";
}, {
    readonly bg: "#DFF2FE";
    readonly fg: "#00A6F4";
}, {
    readonly bg: "#DCFCE7";
    readonly fg: "#00C951";
}, {
    readonly bg: "#ECFCCA";
    readonly fg: "#7CCF00";
}, {
    readonly bg: "#D0FAE5";
    readonly fg: "#00BC7D";
}, {
    readonly bg: "#CBFBF1";
    readonly fg: "#00BBA7";
}, {
    readonly bg: "#CEFAFE";
    readonly fg: "#00B8DB";
}, {
    readonly bg: "#E0E7FF";
    readonly fg: "#615FFF";
}, {
    readonly bg: "#EDE9FE";
    readonly fg: "#8E51FF";
}, {
    readonly bg: "#F3E8FF";
    readonly fg: "#AD46FF";
}, {
    readonly bg: "#FAE8FF";
    readonly fg: "#E12AFB";
}, {
    readonly bg: "#FCE7F3";
    readonly fg: "#F6339A";
}, {
    readonly bg: "#FFE2E2";
    readonly fg: "#FB2C36";
}, {
    readonly bg: "#FFE4E6";
    readonly fg: "#FF2056";
}, {
    readonly bg: "#FFEDD4";
    readonly fg: "#FF6900";
}, {
    readonly bg: "#FEF3C6";
    readonly fg: "#FD9A00";
}, {
    readonly bg: "#FEF9C2";
    readonly fg: "#EFB100";
}, {
    readonly bg: "#F5F5F5";
    readonly fg: "#404040";
}, {
    readonly bg: "#FAFAFA";
    readonly fg: "#FAFAFA";
}];
declare function getAvatarTheme(seed?: string | null): (typeof AVATAR_THEMES)[number];

export { getAvatarTheme };
