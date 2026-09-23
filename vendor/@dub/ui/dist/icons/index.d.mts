import { LucideIcon } from 'lucide-react';
import * as react from 'react';
import { SVGProps, ComponentType, JSX } from 'react';

declare function ArrowUpRight2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Copy({ className }: {
    className?: string;
}): react.JSX.Element;

declare function CrownSmall(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function DubAnalyticsIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function DubApiIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function DubCraftedShield(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function DubLinksIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function DubPartnersIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare const icons: {
    links: {
        icon: typeof DubLinksIcon;
        className: string;
    };
    analytics: {
        icon: typeof DubAnalyticsIcon;
        className: string;
    };
    partners: {
        icon: typeof DubPartnersIcon;
        className: string;
    };
    api: {
        icon: typeof DubApiIcon;
        className: string;
    };
};
type DubProduct = keyof typeof icons;
declare function DubProductIcon({ product, className, iconClassName, }: {
    product: keyof typeof icons;
    className?: string;
    iconClassName?: string;
}): react.JSX.Element;

declare function ExpandingArrow({ className }: {
    className?: string;
}): react.JSX.Element;

declare function FilePen(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FileSend(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function IOSAppStore({ className }: {
    className?: string;
}): react.JSX.Element;

declare function LockSmall(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Magic({ className }: {
    className: string;
}): react.JSX.Element;

declare function MarkdownIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MatrixLines(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Photo({ className }: {
    className?: string;
}): react.JSX.Element;

declare function SortOrder({ order, className, }: {
    order: "asc" | "desc" | null;
    className?: string;
}): react.JSX.Element;

declare function Success({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Tick({ className }: {
    className: string;
}): react.JSX.Element;

declare function UserClock(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function VerifiedBadge(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function LoadingCircle({ className }: {
    className?: string;
}): react.JSX.Element;

declare function LoadingDots(): react.JSX.Element;

declare function LoadingSpinner({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Anthropic({ className, ...props }: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Beehiiv(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Bing({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Facebook({ className, fill, }: {
    className?: string;
    fill?: string;
}): react.JSX.Element;

declare function Github({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Google({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Instagram(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function LinkedIn({ className }: {
    className?: string;
}): react.JSX.Element;

declare function OpenAI({ className, ...props }: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ProductHunt({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Reddit({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Slack(props: SVGProps<SVGSVGElement>): react.JSX.Element;

/** Official multi-color Slack octothorp. Use `Slack` for the monochrome `currentColor` glyph. */
declare function SlackColorful(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TikTok(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Twitter({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Unsplash({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Veriff({ className, ...props }: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function YouTube({ className }: {
    className?: string;
}): react.JSX.Element;

declare function CardAmex(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CardDiscover(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CardMastercard(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CardVisa(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Paypal({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Stablecoin({ className }: {
    className?: string;
}): react.JSX.Element;

declare function StripeIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function StripeLink({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Go(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Php(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Python(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Ruby(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Typescript(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Africa(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Asia(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Europe(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function NorthAmerica(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Oceania(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SouthAmerica(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Amazon({ className }: {
    className?: string;
}): react.JSX.Element;

declare function ChatGPT({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Figma({ className }: {
    className?: string;
}): react.JSX.Element;

declare function GitHubEnhanced({ className }: {
    className?: string;
}): react.JSX.Element;

declare function GoogleEnhanced({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Spotify({ className }: {
    className?: string;
}): react.JSX.Element;

type VariantIcon = ComponentType<SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}>;
declare function withFillVariant(Icon: VariantIcon): VariantIcon;

declare function AndroidLogo(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Apple(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function AppleLogo(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ArrowBoldUp(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ArrowRight(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ArrowTrendUp(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ArrowTurnLeft(props: SVGProps<SVGSVGElement>): JSX.Element;

declare function ArrowTurnRight2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ArrowUpRight(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ArrowsOppositeDirectionX(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ArrowsOppositeDirectionY(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function AtSign(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function BadgeCheck(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function BadgeCheck2({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Bell(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Blog(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Bolt({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function BookOpen(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Book2({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Book2Small(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Books2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function BoxArchive(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function BracketsCurly(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Briefcase({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Brush(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function BulletList({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Calculator(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CalendarIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CalendarDays(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CalendarRefresh(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Calendar6(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Cards(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CaretUp({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function ChartActivity2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ChartArea2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ChartLine(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Check(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Check2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CheckboxIcon({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function ChevronLeft(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ChevronRight(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ChevronUp(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleArrowRight(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleCheck({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function CircleDollar(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleDollarOut(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleDollar3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleDotted(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleHalfDottedCheck(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleHalfDottedClock(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleInfo(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CirclePercentage(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CirclePlay({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function CircleQuestion(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleUser(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CircleWarning({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function CircleXmark(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Circles(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Circles3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Cloud(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CloudUpload(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Code(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ColorPalette2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ConnectedDots({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function ConnectedDots4(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Connections3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CreditCard(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Crosshairs3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Crown(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Cube(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CubeSettings({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function CurrencyDollar(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function CursorRays(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function DatabaseKey(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Desktop(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function DiamondTurnRight({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Directions(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Discount(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Dots(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Download(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Duplicate(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Earth(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function EarthPosition(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Envelope({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function EnvelopeAlert(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function EnvelopeArrowRight(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function EnvelopeBan(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function EnvelopeCheck(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function EnvelopeOpen(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Eye(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function EyeSlash(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FaceSmile(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Feather({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function FileContent(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FileZip2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FilterBars(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Filter2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Flag({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function FlagWavy(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Flag2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Flag6(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Flask(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FlaskSmall(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Folder(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FolderBookmark(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FolderLock(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FolderPlus(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function FolderShield(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Folder5(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GamingConsole(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Gauge6(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Gear(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Gear2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Gear3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Gem(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Gift({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Globe(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GlobePointer(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GlobeSearch(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Globe2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GreekTemple(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GridIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GridLayoutRows(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GridPlus(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function GripDotsVertical(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Heading1(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Heading2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Headset(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Heart({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function HexadecagonStar(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function History(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Hyperlink(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Icosahedron(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ImageIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Incognito(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function InfinityIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function InputField(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function InputPassword(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function InputPasswordPointer(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function InputSearch(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function InvoiceDollar({ strokeWidth, ...props }: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Key(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function LayoutSidebar(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function License(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function LifeRing({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function LinesY(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function LinkBroken(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Link4(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function LocationPin(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Lock({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Magnifier(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MapPosition(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MarketingTarget(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MediaPause(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MediaPlay(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Megaphone(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Menu3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MessageSmile(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Microphone({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Minus(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MobilePhone(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MoneyBill(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MoneyBill2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function MoneyBills2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Msg(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Msgs({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function MsgsDotted(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Nodes4(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Note(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function OfficeBuilding(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Page2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Paintbrush(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Palette2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function PaperPlane(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function PenWriting(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Pen2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function PercentageArrowDown(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function NucleoPhoto(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Plug2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Plus(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Plus2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Post(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Pyramid(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function QRCode(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Receipt2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ReferredVia(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Refresh2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Robot(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SatelliteDish(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ScanText(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Scribble(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ShieldAlert(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ShieldCheck({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function ShieldKeyhole(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ShieldSlash(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function ShieldUser(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Shop(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Shuffle(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Sitemap(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Sliders(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SortAlphaAscending(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SortAlphaDescending(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Sparkle3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SquareChart(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SquareCheck(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SquareLayoutGrid5(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SquareLayoutGrid6(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SquareUserSparkle2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function SquareXmark(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function StackY3(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Star({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Stars2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Suitcase(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TableIcon(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TableRows2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Tablet(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Tag(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Tags(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TextBold(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TextItalic(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TextStrike(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Timer2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Toggle2({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Toggles(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Trash(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TriangleWarning({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function Trophy(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function TV(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UiCard(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function User(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserArrowLeft(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserArrowRight(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserCheck(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserCrown(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserDelete(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserFocus(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserMinus(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserPlus(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserSearch(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function UserXmark(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Users({ variant, ...props }: SVGProps<SVGSVGElement> & {
    variant?: "outline" | "fill";
}): react.JSX.Element;

declare function UsersSettings(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Users2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Users6(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Versions2(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Views(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Watch(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Webhook(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Window(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function WindowSearch(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function WindowSettings(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Workflow(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare function Xmark(props: SVGProps<SVGSVGElement>): react.JSX.Element;

declare const PLAN_FEATURE_ICONS: {
    clicks: typeof CursorRays;
    links: typeof Hyperlink;
    retention: typeof Calendar6;
    sales: typeof InvoiceDollar;
    domains: typeof Globe;
    users: typeof Users2;
    analytics: typeof ChartLine;
    conversions: typeof Receipt2;
    ai: typeof Sparkle3;
    api: typeof Plug2;
    advanced: typeof Gear3;
    folders: typeof Folder;
    dotlink: typeof Gift;
    deeplinks: typeof MarketingTarget;
    events: typeof Bolt;
    webhooks: typeof Webhook;
    roles: typeof UsersSettings;
    slack: typeof Slack;
    tests: typeof Flask;
    email: typeof PaperPlane;
    messages: typeof Msgs;
    sso: typeof ShieldKeyhole;
    logs: typeof Versions2;
    success: typeof UserCrown;
    sla: typeof License;
    volume: typeof CirclePercentage;
    clickpayouts: typeof CursorRays;
    payouts: typeof MoneyBills2;
    basicrewards: typeof Gift;
    flexiblerewards: typeof Shuffle;
    bounties: typeof Trophy;
    ailandingpage: typeof Sparkle3;
    customerinsights: typeof UserFocus;
    partners: typeof ConnectedDots4;
    partnergroups: typeof Users6;
    partnerreferrals: typeof Nodes4;
    embeddedreferrals: typeof SquareLayoutGrid5;
};

type Icon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export { Africa, Amazon, AndroidLogo, Anthropic, Apple, AppleLogo, ArrowBoldUp, ArrowRight, ArrowTrendUp, ArrowTurnLeft, ArrowTurnRight2, ArrowUpRight, ArrowUpRight2, ArrowsOppositeDirectionX, ArrowsOppositeDirectionY, Asia, AtSign, BadgeCheck, BadgeCheck2, Beehiiv, Bell, Bing, Blog, Bolt, Book2, Book2Small, BookOpen, Books2, BoxArchive, BracketsCurly, Briefcase, Brush, BulletList, Calculator, Calendar6, CalendarDays, CalendarIcon, CalendarRefresh, CardAmex, CardDiscover, CardMastercard, CardVisa, Cards, CaretUp, ChartActivity2, ChartArea2, ChartLine, ChatGPT, Check, Check2, CheckboxIcon, ChevronLeft, ChevronRight, ChevronUp, CircleArrowRight, CircleCheck, CircleDollar, CircleDollar3, CircleDollarOut, CircleDotted, CircleHalfDottedCheck, CircleHalfDottedClock, CircleInfo, CirclePercentage, CirclePlay, CircleQuestion, CircleUser, CircleWarning, CircleXmark, Circles, Circles3, Cloud, CloudUpload, Code, ColorPalette2, ConnectedDots, ConnectedDots4, Connections3, Copy, CreditCard, Crosshairs3, Crown, CrownSmall, Cube, CubeSettings, CurrencyDollar, CursorRays, DatabaseKey, Desktop, DiamondTurnRight, Directions, Discount, Dots, Download, DubAnalyticsIcon, DubApiIcon, DubCraftedShield, DubLinksIcon, DubPartnersIcon, type DubProduct, DubProductIcon, Duplicate, Earth, EarthPosition, Envelope, EnvelopeAlert, EnvelopeArrowRight, EnvelopeBan, EnvelopeCheck, EnvelopeOpen, Europe, ExpandingArrow, Eye, EyeSlash, FaceSmile, Facebook, Feather, Figma, FileContent, FilePen, FileSend, FileZip2, Filter2, FilterBars, Flag, Flag2, Flag6, FlagWavy, Flask, FlaskSmall, Folder, Folder5, FolderBookmark, FolderLock, FolderPlus, FolderShield, GamingConsole, Gauge6, Gear, Gear2, Gear3, Gem, Gift, GitHubEnhanced, Github, Globe, Globe2, GlobePointer, GlobeSearch, Go, Google, GoogleEnhanced, GreekTemple, GridIcon, GridLayoutRows, GridPlus, GripDotsVertical, Heading1, Heading2, Headset, Heart, HexadecagonStar, History, Hyperlink, IOSAppStore, type Icon, Icosahedron, ImageIcon, Incognito, InfinityIcon, InputField, InputPassword, InputPasswordPointer, InputSearch, Instagram, InvoiceDollar, Key, LayoutSidebar, License, LifeRing, LinesY, Link4, LinkBroken, LinkedIn, LoadingCircle, LoadingDots, LoadingSpinner, LocationPin, Lock, LockSmall, Magic, Magnifier, MapPosition, MarkdownIcon, MarketingTarget, MatrixLines, MediaPause, MediaPlay, Megaphone, Menu3, MessageSmile, Microphone, Minus, MobilePhone, MoneyBill, MoneyBill2, MoneyBills2, Msg, Msgs, MsgsDotted, Nodes4, NorthAmerica, Note, NucleoPhoto, Oceania, OfficeBuilding, OpenAI, PLAN_FEATURE_ICONS, Page2, Paintbrush, Palette2, PaperPlane, Paypal, Pen2, PenWriting, PercentageArrowDown, Photo, Php, Plug2, Plus, Plus2, Post, ProductHunt, Pyramid, Python, QRCode, Receipt2, Reddit, ReferredVia, Refresh2, Robot, Ruby, SatelliteDish, ScanText, Scribble, ShieldAlert, ShieldCheck, ShieldKeyhole, ShieldSlash, ShieldUser, Shop, Shuffle, Sitemap, Slack, SlackColorful, Sliders, SortAlphaAscending, SortAlphaDescending, SortOrder, SouthAmerica, Sparkle3, Spotify, SquareChart, SquareCheck, SquareLayoutGrid5, SquareLayoutGrid6, SquareUserSparkle2, SquareXmark, Stablecoin, StackY3, Star, Stars2, StripeIcon, StripeLink, Success, Suitcase, TV, TableIcon, TableRows2, Tablet, Tag, Tags, TextBold, TextItalic, TextStrike, Tick, TikTok, Timer2, Toggle2, Toggles, Trash, TriangleWarning, Trophy, Twitter, Typescript, UiCard, Unsplash, User, UserArrowLeft, UserArrowRight, UserCheck, UserClock, UserCrown, UserDelete, UserFocus, UserMinus, UserPlus, UserSearch, UserXmark, Users, Users2, Users6, UsersSettings, Veriff, VerifiedBadge, Versions2, Views, Watch, Webhook, Window, WindowSearch, WindowSettings, Workflow, Xmark, YouTube, withFillVariant };
