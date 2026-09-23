import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as react from 'react';
import react__default, { ComponentType, SVGProps, ReactNode, PropsWithChildren, HTMLAttributes, ButtonHTMLAttributes, WheelEventHandler, ReactElement, Dispatch, SetStateAction, InputHTMLAttributes, ElementType, ComponentPropsWithoutRef, ComponentProps, MouseEvent as MouseEvent$1, JSX, KeyboardEvent as KeyboardEvent$1, RefObject, ForwardRefExoticComponent, RefAttributes } from 'react';
import * as class_variance_authority_dist_types from 'class-variance-authority/dist/types';
import * as class_variance_authority from 'class-variance-authority';
import { VariantProps } from 'class-variance-authority';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Icon, GlobePointer, SatelliteDish, Flag6, InputSearch, Page2, Gift, DubLinksIcon, LifeRing, Typescript, Twitter } from './icons/index.mjs';
export { Africa, Amazon, AndroidLogo, Anthropic, Apple, AppleLogo, ArrowBoldUp, ArrowRight, ArrowTrendUp, ArrowTurnLeft, ArrowTurnRight2, ArrowUpRight, ArrowUpRight2, ArrowsOppositeDirectionX, ArrowsOppositeDirectionY, Asia, AtSign, BadgeCheck, BadgeCheck2, Beehiiv, Bell, Bing, Blog, Bolt, Book2, Book2Small, BookOpen, Books2, BoxArchive, BracketsCurly, Briefcase, Brush, BulletList, Calculator, Calendar6, CalendarDays, CalendarIcon, CalendarRefresh, CardAmex, CardDiscover, CardMastercard, CardVisa, Cards, CaretUp, ChartActivity2, ChartArea2, ChartLine, ChatGPT, Check, Check2, CheckboxIcon, ChevronLeft, ChevronRight, ChevronUp, CircleArrowRight, CircleCheck, CircleDollar, CircleDollar3, CircleDollarOut, CircleDotted, CircleHalfDottedCheck, CircleHalfDottedClock, CircleInfo, CirclePercentage, CirclePlay, CircleQuestion, CircleUser, CircleWarning, CircleXmark, Circles, Circles3, Cloud, CloudUpload, Code, ColorPalette2, ConnectedDots, ConnectedDots4, Connections3, Copy, CreditCard, Crosshairs3, Crown, CrownSmall, Cube, CubeSettings, CurrencyDollar, CursorRays, DatabaseKey, Desktop, DiamondTurnRight, Directions, Discount, Dots, Download, DubAnalyticsIcon, DubApiIcon, DubCraftedShield, DubPartnersIcon, DubProduct, DubProductIcon, Duplicate, Earth, EarthPosition, Envelope, EnvelopeAlert, EnvelopeArrowRight, EnvelopeBan, EnvelopeCheck, EnvelopeOpen, Europe, ExpandingArrow, Eye, EyeSlash, FaceSmile, Facebook, Feather, Figma, FileContent, FilePen, FileSend, FileZip2, Filter2, FilterBars, Flag, Flag2, FlagWavy, Flask, FlaskSmall, Folder, Folder5, FolderBookmark, FolderLock, FolderPlus, FolderShield, GamingConsole, Gauge6, Gear, Gear2, Gear3, Gem, GitHubEnhanced, Github, Globe, Globe2, GlobeSearch, Go, Google, GoogleEnhanced, GreekTemple, GridIcon, GridLayoutRows, GridPlus, GripDotsVertical, Heading1, Heading2, Headset, Heart, HexadecagonStar, History, Hyperlink, IOSAppStore, Icosahedron, ImageIcon, Incognito, InfinityIcon, InputField, InputPassword, InputPasswordPointer, Instagram, InvoiceDollar, Key, LayoutSidebar, License, LinesY, Link4, LinkBroken, LinkedIn, LoadingCircle, LoadingDots, LoadingSpinner, LocationPin, Lock, LockSmall, Magic, Magnifier, MapPosition, MarkdownIcon, MarketingTarget, MatrixLines, MediaPause, MediaPlay, Megaphone, Menu3, MessageSmile, Microphone, Minus, MobilePhone, MoneyBill, MoneyBill2, MoneyBills2, Msg, Msgs, MsgsDotted, Nodes4, NorthAmerica, Note, NucleoPhoto, Oceania, OfficeBuilding, OpenAI, PLAN_FEATURE_ICONS, Paintbrush, Palette2, PaperPlane, Paypal, Pen2, PenWriting, PercentageArrowDown, Photo, Php, Plug2, Plus, Plus2, Post, ProductHunt, Pyramid, Python, QRCode, Receipt2, Reddit, ReferredVia, Refresh2, Robot, Ruby, ScanText, Scribble, ShieldAlert, ShieldCheck, ShieldKeyhole, ShieldSlash, ShieldUser, Shop, Shuffle, Sitemap, Slack, SlackColorful, Sliders, SortAlphaAscending, SortAlphaDescending, SortOrder, SouthAmerica, Sparkle3, Spotify, SquareChart, SquareCheck, SquareLayoutGrid5, SquareLayoutGrid6, SquareUserSparkle2, SquareXmark, Stablecoin, StackY3, Star, Stars2, StripeIcon, StripeLink, Success, Suitcase, TV, TableIcon, TableRows2, Tablet, Tag, Tags, TextBold, TextItalic, TextStrike, Tick, TikTok, Timer2, Toggle2, Toggles, Trash, TriangleWarning, Trophy, UiCard, Unsplash, User, UserArrowLeft, UserArrowRight, UserCheck, UserClock, UserCrown, UserDelete, UserFocus, UserMinus, UserPlus, UserSearch, UserXmark, Users, Users2, Users6, UsersSettings, Veriff, VerifiedBadge, Versions2, Views, Watch, Webhook, Window, WindowSearch, WindowSettings, Workflow, Xmark, YouTube, withFillVariant } from './icons/index.mjs';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { DayPickerSingleProps, DayPickerRangeProps, Matcher } from 'react-day-picker';
export { Matcher } from 'react-day-picker';
import { Locale } from 'date-fns';
import { FilterOperator } from '@dub/utils';
import { LucideIcon } from 'lucide-react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Drawer, ContentProps } from 'vaul';
import { PaginationState as PaginationState$1, Table as Table$1, ColumnDef, ColumnPinningState, Cell, ColumnResizeMode, VisibilityState, Row, RowSelectionState } from '@tanstack/react-table';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Editor, useEditor, EditorContentProps } from '@tiptap/react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useRouter, ReadonlyURLSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import * as _tanstack_table_core from '@tanstack/table-core';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Link from 'next/link';
import { motion, Variants, MotionNodeOptions } from 'motion/react';
import { ImageProps } from 'next/image';

declare const Accordion: react.ForwardRefExoticComponent<(AccordionPrimitive.AccordionSingleProps | AccordionPrimitive.AccordionMultipleProps) & react.RefAttributes<HTMLDivElement>>;
declare const AccordionItem: react.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionItemProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const AccordionTrigger: react.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionTriggerProps & react.RefAttributes<HTMLButtonElement>, "ref"> & {
    variant?: "chevron" | "plus";
} & react.RefAttributes<HTMLButtonElement>>;
declare const AccordionContent: react.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionContentProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
interface ActivityRingProps {
    /** Value for the positive/trustworthy side */
    positiveValue: number;
    /** Value for the negative/removed side */
    negativeValue: number;
    /** Size of the ring in pixels (default: 40) */
    size?: number;
    /** Icon to show when positive leads */
    positiveIcon?: IconComponent;
    /** Icon to show when negative leads */
    negativeIcon?: IconComponent;
    /** Icon to show when neutral (tie) */
    neutralIcon?: IconComponent;
    className?: string;
}
declare function ActivityRing({ positiveValue, negativeValue, size, positiveIcon: PositiveIcon, negativeIcon: NegativeIcon, neutralIcon: NeutralIcon, className, }: ActivityRingProps): react.JSX.Element;

declare const Alert: react.ForwardRefExoticComponent<react.HTMLAttributes<HTMLDivElement> & VariantProps<(props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string> & react.RefAttributes<HTMLDivElement>>;
declare const AlertTitle: react.ForwardRefExoticComponent<react.HTMLAttributes<HTMLHeadingElement> & react.RefAttributes<HTMLParagraphElement>>;
declare const AlertDescription: react.ForwardRefExoticComponent<react.HTMLAttributes<HTMLParagraphElement> & react.RefAttributes<HTMLParagraphElement>>;

declare function AnimatedEmptyState({ title, description, cardContent, cardCount, addButton, pillContent, learnMoreHref, learnMoreTarget, learnMoreClassName, learnMoreText, className, cardClassName, cardContainerClassName, }: {
    title: string;
    description: ReactNode;
    cardContent: ReactNode | ((index: number) => ReactNode);
    cardCount?: number;
    addButton?: ReactNode;
    pillContent?: string;
    learnMoreHref?: string;
    learnMoreTarget?: string;
    learnMoreClassName?: string;
    learnMoreText?: string;
    className?: string;
    cardClassName?: string;
    cardContainerClassName?: string;
}): react.JSX.Element;

declare function Avatar({ imageUrl, identifier, className, }: {
    imageUrl?: string | null;
    identifier: string;
    className?: string;
}): react.JSX.Element;

declare const badgeVariants: (props?: ({
    variant?: "black" | "blue" | "gray" | "green" | "red" | "violet" | "neutral" | "default" | "sky" | "amber" | "blueGradient" | "rainbow" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
interface BadgeProps$1 extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
}
declare function Badge({ className, variant, ...props }: BadgeProps$1): react.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "outline" | "success" | "primary" | "secondary" | "danger" | "danger-outline" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    text?: ReactNode | string;
    textWrapperClassName?: string;
    shortcutClassName?: string;
    loading?: boolean;
    icon?: ReactNode;
    shortcut?: string;
    right?: ReactNode;
    disabledTooltip?: string | ReactNode;
}
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

declare const cardListVariants: (props?: ({
    variant?: "compact" | "loose" | null | undefined;
    loading?: boolean | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
type CardListProps = PropsWithChildren<{
    loading?: boolean;
    className?: string;
}> & VariantProps<typeof cardListVariants>;
declare function CardList$1({ variant, loading, className, children, }: CardListProps): react.JSX.Element;

declare function CardListCard({ outerClassName, innerClassName, children, onClick, onAuxClick, hoverStateEnabled, banner, }: PropsWithChildren<{
    outerClassName?: string;
    innerClassName?: string;
    onClick?: (e: React.MouseEvent) => void;
    onAuxClick?: (e: React.MouseEvent) => void;
    hoverStateEnabled?: boolean;
    banner?: React.ReactNode;
}>): react.JSX.Element;

declare const CardList: typeof CardList$1 & {
    Card: typeof CardListCard & {
        Context: react.Context<{
            hovered: boolean;
        }>;
    };
    Context: react.Context<{
        variant: class_variance_authority.VariantProps<(props?: ({
            variant?: "compact" | "loose" | null | undefined;
            loading?: boolean | null | undefined;
        } & class_variance_authority_dist_types.ClassProp) | undefined) => string>["variant"];
        loading: boolean;
    }>;
};

interface CardSelectorOption {
    key: string;
    label: string;
    description: string;
    icon?: ReactNode;
}
interface CardSelectorProps {
    options: CardSelectorOption[];
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    gridCols?: "1" | "2" | "3";
    name?: string;
    disabled?: boolean;
    animated?: boolean;
}
declare function CardSelector({ options, value, onChange, className, gridCols, name, disabled, animated, }: CardSelectorProps): react.JSX.Element;

declare const AUTOPLAY_DEFAULT_DELAY = 2000;
type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type AutoplayOptions = Parameters<typeof Autoplay>[0];
type CarouselProps = {
    opts?: CarouselOptions;
    plugins?: CarouselPlugin;
    orientation?: "horizontal" | "vertical";
    autoplay?: boolean | AutoplayOptions;
    setApi?: (api: CarouselApi) => void;
};
type CarouselContextProps = {
    carouselRef: ReturnType<typeof useEmblaCarousel>[0];
    api: ReturnType<typeof useEmblaCarousel>[1];
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
} & CarouselProps;
declare function useCarousel(): CarouselContextProps;
declare function useCarouselActiveIndex(): number;
declare const Carousel: react.ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & CarouselProps & react.RefAttributes<HTMLDivElement>>;
declare const CarouselContent: react.ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & react.RefAttributes<HTMLDivElement>>;
declare const CarouselItem: react.ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & react.RefAttributes<HTMLDivElement>>;
declare const CarouselPrevious: react.ForwardRefExoticComponent<{
    className?: string;
} & react.RefAttributes<HTMLButtonElement>>;
declare const CarouselNext: react.ForwardRefExoticComponent<{
    className?: string;
} & react.RefAttributes<HTMLButtonElement>>;

declare const CarouselNavBarVariants: (props?: ({
    variant?: "simple" | "floating" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
declare const CarouselNavBar: ({ variant, className, }: VariantProps<typeof CarouselNavBarVariants> & {
    className?: string;
}) => react.JSX.Element;

declare const CarouselThumbnails: ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => react.JSX.Element;
declare const CarouselThumbnail: react.ForwardRefExoticComponent<{
    index: number;
    className?: string | ((d: {
        active: boolean;
    }) => string);
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & react.RefAttributes<HTMLDivElement>>;

declare const Checkbox: react.ForwardRefExoticComponent<Omit<CheckboxPrimitive.CheckboxProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

type PopoverProps = PropsWithChildren<{
    content: ReactNode | string;
    align?: "center" | "start" | "end";
    side?: "bottom" | "top" | "left" | "right";
    openPopover: boolean;
    setOpenPopover: (open: boolean) => void;
    mobileOnly?: boolean;
    forceDropdown?: boolean;
    popoverContentClassName?: string;
    onOpenAutoFocus?: PopoverPrimitive.PopoverContentProps["onOpenAutoFocus"];
    onCloseAutoFocus?: PopoverPrimitive.PopoverContentProps["onCloseAutoFocus"];
    collisionBoundary?: Element | Element[];
    sticky?: "partial" | "always";
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onWheel?: WheelEventHandler;
    sideOffset?: number;
    anchor?: ReactNode;
}>;
declare function Popover({ children, content, align, side, openPopover, setOpenPopover, mobileOnly, forceDropdown, popoverContentClassName, onOpenAutoFocus, onCloseAutoFocus, collisionBoundary, sticky, onEscapeKeyDown, onWheel, sideOffset, anchor, }: PopoverProps): react.JSX.Element;

type ComboboxOption<TMeta = any> = {
    label: string | ReactNode;
    value: string;
    icon?: Icon | ReactNode;
    disabledTooltip?: ReactNode;
    meta?: TMeta;
    separatorAfter?: boolean;
    first?: boolean;
};
type ComboboxProps<TMultiple extends boolean | undefined, TMeta extends any> = PropsWithChildren<{
    multiple?: TMultiple;
    selected: TMultiple extends true ? ComboboxOption<TMeta>[] : ComboboxOption<TMeta> | null;
    setSelected?: TMultiple extends true ? (options: ComboboxOption<TMeta>[]) => void : (option: ComboboxOption<TMeta> | null) => void;
    onSelect?: (option: ComboboxOption<TMeta>) => void;
    maxSelected?: number;
    options?: ComboboxOption<TMeta>[];
    trigger?: ReactNode;
    icon?: Icon | ReactNode;
    placeholder?: ReactNode;
    searchPlaceholder?: string;
    emptyState?: ReactNode;
    createLabel?: (search: string) => ReactNode;
    createIcon?: Icon;
    onCreate?: (search: string) => Promise<boolean>;
    buttonProps?: ButtonProps;
    labelProps?: {
        className?: string;
    };
    iconProps?: {
        className?: string;
    };
    popoverProps?: {
        contentClassName?: string;
    };
    shortcutHint?: string;
    caret?: boolean | ReactNode;
    side?: PopoverProps["side"];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSearchChange?: (search: string) => void;
    shouldFilter?: boolean;
    inputRight?: ReactNode;
    inputClassName?: string;
    optionRight?: (option: ComboboxOption) => ReactNode;
    optionClassName?: string;
    optionDescription?: (option: ComboboxOption<TMeta>) => ReactNode;
    matchTriggerWidth?: boolean;
    hideSearch?: boolean;
    forceDropdown?: boolean;
}>;
declare function Combobox({ multiple, selected: selectedProp, setSelected, onSelect, maxSelected, options, trigger, icon: Icon, placeholder, searchPlaceholder, emptyState, createLabel, createIcon: CreateIcon, onCreate, buttonProps, labelProps, iconProps, popoverProps, shortcutHint, caret, side, open, onOpenChange, onSearchChange, shouldFilter, inputRight, inputClassName, optionRight, optionClassName, optionDescription, matchTriggerWidth, hideSearch, forceDropdown, children, }: ComboboxProps<boolean | undefined, any>): react.JSX.Element;

type OmitKeys<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};
type KeysToOmit = "showWeekNumber" | "captionLayout" | "mode";
type SingleProps = OmitKeys<DayPickerSingleProps, KeysToOmit>;
type RangeProps = OmitKeys<DayPickerRangeProps, KeysToOmit>;
type CalendarProps$1 = ({
    mode: "single";
} & SingleProps) | ({
    mode?: undefined;
} & SingleProps) | ({
    mode: "range";
} & RangeProps);
declare function Calendar({ mode, weekStartsOn, numberOfMonths, showYearNavigation, disableNavigation, locale, className, classNames, ...props }: CalendarProps$1 & {
    showYearNavigation?: boolean;
}): react.JSX.Element;

type CalendarProps = {
    fromYear?: number;
    toYear?: number;
    fromMonth?: Date;
    toMonth?: Date;
    fromDay?: Date;
    toDay?: Date;
    fromDate?: Date;
    toDate?: Date;
    locale?: Locale;
};
interface PickerProps extends CalendarProps {
    className?: string;
    disabled?: boolean;
    disabledDays?: Matcher | Matcher[] | undefined;
    required?: boolean;
    showTimePicker?: boolean;
    placeholder?: string;
    showYearNavigation?: boolean;
    disableNavigation?: boolean;
    hasError?: boolean;
    id?: string;
    align?: PopoverProps["align"];
    "aria-invalid"?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-required"?: boolean;
}
type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
};
interface Preset {
    id: string;
    label: string;
    requiresUpgrade?: boolean;
    tooltipContent?: ReactNode;
    shortcut?: string;
}
interface DateRangePreset extends Preset {
    dateRange: DateRange;
}

type DatePickerTriggerRenderProps = {
    displayValue: string | null;
    placeholder: string;
    open: boolean;
    disabled?: boolean;
    invalid?: boolean;
};
type DatePickerProps = {
    value?: Date | null;
    defaultValue?: Date | null;
    onChange?: (date: Date | undefined) => void;
    /** Custom trigger element. Receives displayValue, placeholder, open, and disabled. Must return a single React element (e.g. <button>) so the popover can attach open behavior. */
    trigger?: (props: DatePickerTriggerRenderProps) => ReactElement;
    invalid?: boolean;
} & PickerProps;
declare function DatePicker({ value, defaultValue, onChange, trigger: customTrigger, disabled, disableNavigation, disabledDays, showYearNavigation, locale, placeholder, hasError, invalid, align, className, ...props }: DatePickerProps): react.JSX.Element;

type RangeDatePickerProps = {
    presets?: DateRangePreset[];
    presetId?: DateRangePreset["id"];
    defaultValue?: DateRange;
    value?: DateRange;
    onChange?: (dateRange?: DateRange, preset?: DateRangePreset) => void;
} & PickerProps;
declare function DateRangePicker({ presets, ...props }: RangeDatePickerProps): react.JSX.Element;

declare const DatePickerContext: react.Context<{
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}>;

declare function DotsPattern({ dotSize, gapSize, patternOffset, className, }: {
    dotSize?: number;
    gapSize?: number;
    patternOffset?: [number, number];
    className?: string;
}): react.JSX.Element;

declare function DubStatusBadge({ className }: {
    className?: string;
}): react.JSX.Element;

type EmptyStateProps = PropsWithChildren<{
    icon: React.ElementType;
    title: string;
    description?: ReactNode;
    learnMore?: string;
}>;
declare function EmptyState({ icon: Icon, title, description, learnMore, children, }: EmptyStateProps): react.JSX.Element;

type AcceptedFileFormats = "any" | "images" | "csv" | "documents" | "programResourceImages" | "programResourceFiles";
declare const imageUploadVariants: (props?: ({
    variant?: "default" | "plain" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
type FileUploadReadFileProps = {
    /**
     * Whether to automatically read the file and return the result as `src` to onChange
     */
    readFile?: false;
    onChange?: (data: {
        file: File;
    }) => void;
} | {
    /**
     * Whether to automatically read the file and return the result as `src` to onChange
     */
    readFile: true;
    onChange?: (data: {
        file: File;
        src: string;
    }) => void;
};
type FileUploadProps = FileUploadReadFileProps & {
    id?: string;
    accept: AcceptedFileFormats;
    className?: string;
    iconClassName?: string;
    previewClassName?: string;
    icon?: Icon;
    /**
     * Custom preview component to display instead of the default
     */
    customPreview?: ReactNode;
    /**
     * Preview shown when imageSrc is empty (for example a default avatar)
     */
    placeholder?: ReactNode;
    /**
     * Image to display (generally for image uploads)
     */
    imageSrc?: string | null;
    /**
     * Whether to display a loading spinner
     */
    loading?: boolean;
    /**
     * Whether to allow clicking on the area to upload
     */
    clickToUpload?: boolean;
    /**
     * Whether to show instruction overlay when hovered
     */
    showHoverOverlay?: boolean;
    /**
     * Content to display below the upload icon (null to only display the icon)
     */
    content?: ReactNode | null;
    /**
     * Desired resolution to suggest and optionally resize to
     */
    targetResolution?: {
        width: number;
        height: number;
    };
    /**
     * A maximum file size (in megabytes) to check upon file selection. Default is 5MB.
     */
    maxFileSizeMB?: number;
    /**
     * Accessibility label for screen readers
     */
    accessibilityLabel?: string;
    disabled?: boolean;
} & VariantProps<typeof imageUploadVariants>;
declare function FileUpload({ id, readFile, onChange, variant, className, iconClassName, previewClassName, icon: Icon, customPreview, placeholder, accept, imageSrc, loading, clickToUpload, showHoverOverlay, content, maxFileSizeMB, targetResolution, accessibilityLabel, disabled, }: FileUploadProps): react.JSX.Element;

type FilterIcon = LucideIcon | ReactNode | ComponentType<SVGProps<SVGSVGElement>>;

type Filter$1 = {
    key: string;
    icon: FilterIcon;
    label: string;
    labelPlural?: string;
    options: FilterOption[] | null;
    /** When set to `range`, `FilterSelect` renders min/max controls instead of option list. */
    type?: "default" | "range";
    /** Format a bound in storage units (e.g. cents) for display. */
    formatRangeBound?: (n: number) => string;
    /** Parse typed input into storage units. Return NaN if invalid. */
    parseRangeInput?: (raw: string) => number;
    /**
     * For `type: "range"`: divide stored values by this for the number input (e.g. `100` when storage is cents).
     * Defaults to `1` (storage shown as-is).
     */
    rangeDisplayScale?: number;
    /**
     * `step` on the min/max number inputs. Defaults to `1` when `rangeDisplayScale` is 1, else `0.01`.
     */
    rangeNumberStep?: number;
    /** Full pill label for active range token (used by `Filter.List`). */
    formatRangePillLabel?: (token: string) => string;
    hideInFilterDropdown?: boolean;
    shouldFilter?: boolean;
    separatorAfter?: boolean;
    multiple?: boolean;
    hideMultipleIcons?: boolean;
    singleSelect?: boolean;
    hideOperator?: boolean;
    getOptionIcon?: (value: FilterOption["value"], props: {
        key: Filter$1["key"];
        option?: FilterOption;
    }) => FilterIcon | null;
    getOptionLabel?: (value: FilterOption["value"], props: {
        key: Filter$1["key"];
        option?: FilterOption;
    }) => string | null;
    getOptionPermalink?: (value: FilterOption["value"]) => string | null;
};
type FilterOption = {
    value: any;
    label: string;
    right?: ReactNode;
    icon?: FilterIcon;
    hideDuringSearch?: boolean;
    disabled?: boolean;
    data?: Record<string, any>;
    permalink?: string;
};
type ActiveFilter = {
    key: Filter$1["key"];
    values: FilterOption["value"][];
    operator: FilterOperator;
};
type LegacyActiveFilterSingular = {
    key: Filter$1["key"];
    value: FilterOption["value"];
};
type LegacyActiveFilterPlural = {
    key: Filter$1["key"];
    values: FilterOption["value"][];
};
type ActiveFilterInput = ActiveFilter | LegacyActiveFilterSingular | LegacyActiveFilterPlural;
/**
 * Normalize active filter to the new format with operator support
 * Handles backward compatibility with legacy formats:
 * - { key, value } → { key, values: [value], operator: 'IS' }
 * - { key, values } → { key, values, operator: 'IS' or 'IS_ONE_OF' }
 * - { key, values, operator } → unchanged (already correct)
 */
declare function normalizeActiveFilter(filter: ActiveFilterInput): ActiveFilter;
declare function parseRangeToken(token: string | undefined | null): {
    min?: number;
    max?: number;
};
declare function encodeRangeToken(min?: number | null, max?: number | null): string;

type FilterListProps = {
    filters: Filter$1[];
    activeFilters?: ActiveFilterInput[];
    onRemove: (key: string, value: FilterOption["value"]) => void;
    onRemoveFilter?: (key: string) => void;
    onRemoveAll: () => void;
    onSelect?: (key: string, value: FilterOption["value"] | FilterOption["value"][]) => void;
    onToggleOperator?: (key: string) => void;
    isAdvancedFilter?: boolean;
    className?: string;
};
declare function FilterList({ filters, activeFilters, onRemove, onRemoveFilter, onRemoveAll, onSelect, onToggleOperator, isAdvancedFilter, className, }: FilterListProps): react.JSX.Element;

type FilterSelectProps = {
    filters: Filter$1[];
    onSelect: (key: string, value: FilterOption["value"] | FilterOption["value"][]) => void;
    onRemove: (key: string, value: FilterOption["value"]) => void;
    /** Clears an entire filter (e.g. numeric range with two URL params). */
    onRemoveFilter?: (key: string) => void;
    onOpenFilter?: (key: string) => void;
    onSearchChange?: (search: string) => void;
    onSelectedFilterChange?: (key: string | null) => void;
    activeFilters?: ActiveFilterInput[];
    askAI?: boolean;
    isAdvancedFilter?: boolean;
    children?: ReactNode;
    emptyState?: ReactNode | Record<string, ReactNode>;
    className?: string;
};
declare function FilterSelect({ filters, onSelect, onRemove, onRemoveFilter, onOpenFilter, onSearchChange, onSelectedFilterChange, activeFilters, askAI, isAdvancedFilter, children, emptyState, className, }: FilterSelectProps): react.JSX.Element;

type FilterSidebarProps = {
    filters: Filter$1[];
    activeFilters?: ActiveFilterInput[];
    onSelect: (key: string, value: FilterOption["value"]) => void;
    onRemove: (key: string, value: FilterOption["value"]) => void;
    className?: string;
    optionClassName?: string;
    defaultOpen?: string[];
};
declare function FilterSidebar({ filters, activeFilters, onSelect, onRemove, className, optionClassName, defaultOpen, }: FilterSidebarProps): react.JSX.Element;

type FilterOptionRowProps = {
    filter: Filter$1;
    option: FilterOption;
    checked: boolean;
    onToggle: () => void;
    className?: string;
};
declare function FilterOptionRow({ filter, option, checked, onToggle, className, }: FilterOptionRowProps): react.JSX.Element;

declare const Filter: {
    Select: typeof FilterSelect;
    List: typeof FilterList;
    Sidebar: typeof FilterSidebar;
};

declare function Form({ title, description, inputAttrs, helpText, buttonText, disabledTooltip, handleSubmit, }: {
    title: string;
    description: string;
    inputAttrs: InputHTMLAttributes<HTMLInputElement>;
    helpText?: string | ReactNode;
    buttonText?: string;
    disabledTooltip?: string | ReactNode;
    handleSubmit: (data: any) => Promise<any>;
}): react.JSX.Element;

declare function Grid({ cellSize, strokeWidth, patternOffset, className, }: {
    cellSize?: number;
    strokeWidth?: number;
    patternOffset?: [number, number];
    className?: string;
}): react.JSX.Element;

interface InputProps extends react__default.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}
declare const Input: react__default.ForwardRefExoticComponent<InputProps & react__default.RefAttributes<HTMLInputElement>>;

declare const Label: react.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & react.RefAttributes<HTMLLabelElement>, "ref"> & VariantProps<(props?: class_variance_authority_dist_types.ClassProp | undefined) => string> & react.RefAttributes<HTMLLabelElement>>;

declare const menuItemVariants: (props?: ({
    variant?: "default" | "danger" | null | undefined;
    disabled?: boolean | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
type MenuItemProps<T extends ElementType> = PropsWithChildren<ComponentPropsWithoutRef<T>> & {
    as?: T;
} & {
    variant?: "default" | "danger";
    icon?: Icon | ReactNode;
    shortcut?: string;
    loading?: boolean;
    disabledTooltip?: string | ReactNode;
};
declare function MenuItem<T extends ElementType>({ as, variant, children, icon: Icon, shortcut, className, loading, disabledTooltip, ...rest }: MenuItemProps<T>): react.JSX.Element;

declare const defaultPadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
type MiniAreaChartProps = {
    data: {
        date: Date;
        value: number;
    }[];
    curve?: boolean;
    color?: string;
    padding?: Partial<typeof defaultPadding>;
};
declare function MiniAreaChart(props: MiniAreaChartProps): react.JSX.Element;

declare function Modal({ children, className, showModal, setShowModal, onClose, desktopOnly, preventDefaultClose, drawerRootProps }: {
    children: React.ReactNode;
    className?: string;
    showModal?: boolean;
    setShowModal?: Dispatch<SetStateAction<boolean>>;
    onClose?: () => void;
    desktopOnly?: boolean;
    preventDefaultClose?: boolean;
    drawerRootProps?: ComponentProps<typeof Drawer.Root>;
}): react.JSX.Element;

interface MultiValueInputRef {
    /** Commits any pending input, updates parent, and returns the full list. */
    commitPendingInput: () => string[];
}
interface MultiValueInputProps {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    id?: string;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    /** Optional normalizer for each value when adding (e.g. trim + lowercase). */
    normalize?: (value: string) => string;
    /** Optional max number of values (no limit if omitted). */
    maxValues?: number;
}
declare const MultiValueInput: react__default.ForwardRefExoticComponent<MultiValueInputProps & react__default.RefAttributes<MultiValueInputRef>>;

type NumberStepperProps = {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    className?: string;
    id?: string;
    formatValue?: (value: number) => ReactNode;
    decrementAriaLabel?: string;
    incrementAriaLabel?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">;
declare function NumberStepper({ value, onChange, min, max, step, disabled, className, id, formatValue, decrementAriaLabel, incrementAriaLabel, ...rest }: NumberStepperProps): react.JSX.Element;

declare function PaginationControls({ pagination, setPagination, totalCount, unit, className, children, showTotalCount, }: PropsWithChildren<{
    pagination: PaginationState$1;
    setPagination: (pagination: PaginationState$1) => void;
    totalCount?: number;
    unit?: string | ((plural: boolean) => string);
    className?: string;
    showTotalCount?: boolean;
}>): react.JSX.Element;

declare function ProgressCircle({ progress: progressProp, strokeWidth, className, }: {
    progress: number;
    strokeWidth?: number;
    className?: string;
}): react.JSX.Element;

type Side = "left" | "right" | "top" | "bottom";
declare function ProgressiveBlur({ strength, steps, side, className, style, ...rest }: react__default.HTMLAttributes<HTMLDivElement> & {
    /** The strongest blur strength. */
    strength?: number;
    /** The number of steps for the blur. More steps is more detailed but computationally expensive. */
    steps?: number;
    /** The percentage of blur at the weakest point. */
    falloffPercentage?: number;
    /** Which side will have the strongest blur. */
    side?: Side;
}): react__default.JSX.Element;

declare const RadioGroup: react.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupProps & react.RefAttributes<HTMLDivElement>, "ref"> & react.RefAttributes<HTMLDivElement>>;
declare const RadioGroupItem: react.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupItemProps & react.RefAttributes<HTMLButtonElement>, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const PROSE_STYLES: {
    readonly default: "prose-p:my-2 prose-ul:my-2 prose-ol:my-2";
    readonly condensed: "prose-p:my-0 prose-ul:my-2 prose-ol:my-2";
    readonly chat: "prose-p:my-0 prose-ul:my-2 prose-ol:my-2 [&_p+p]:mt-2";
    readonly relaxed: "";
};
declare const FEATURES: readonly ["images", "variables", "links", "headings", "bold", "italic", "strike"];
declare const DEFAULT_RICH_TEXT_FEATURES: readonly ["images", "variables", "links", "headings", "bold", "italic", "strike"];
declare const OPTIONAL_FEATURES: readonly ["imageControls"];
type RichTextFeature = (typeof FEATURES)[number] | (typeof OPTIONAL_FEATURES)[number];
type RichTextProviderProps = PropsWithChildren<{
    placeholder?: string;
    initialValue?: any;
    features?: RichTextFeature[];
    markdown?: boolean;
    style?: keyof typeof PROSE_STYLES;
    onChange?: (editor: Editor) => void;
    uploadImage?: (file: File) => Promise<string | null>;
    variables?: string[];
    editable?: boolean;
    autoFocus?: boolean;
    editorProps?: Parameters<typeof useEditor>[0]["editorProps"];
    editorClassName?: string;
}>;
declare const RichTextContext: react.Context<(Pick<RichTextProviderProps, "variables" | "editable" | "features" | "markdown"> & {
    editor: Editor | null;
    isUploading: boolean;
    handleImageUpload: ((file: File, currentEditor: Editor, pos: number) => Promise<void>) | null;
}) | null>;
type RichTextAreaProviderRef = {
    setContent: (content: any) => void;
};
declare const RichTextProvider: react.ForwardRefExoticComponent<{
    placeholder?: string;
    initialValue?: any;
    features?: RichTextFeature[];
    markdown?: boolean;
    style?: keyof typeof PROSE_STYLES;
    onChange?: (editor: Editor) => void;
    uploadImage?: (file: File) => Promise<string | null>;
    variables?: string[];
    editable?: boolean;
    autoFocus?: boolean;
    editorProps?: Parameters<typeof useEditor>[0]["editorProps"];
    editorClassName?: string;
} & {
    children?: react.ReactNode | undefined;
} & react.RefAttributes<RichTextAreaProviderRef>>;
declare function useRichTextContext(): Pick<RichTextProviderProps, "variables" | "editable" | "features" | "markdown"> & {
    editor: Editor | null;
    isUploading: boolean;
    handleImageUpload: ((file: File, currentEditor: Editor, pos: number) => Promise<void>) | null;
};

declare function RichTextToolbar({ toolsStart, toolsEnd, className, }: {
    toolsStart?: ReactNode;
    toolsEnd?: ReactNode;
    className?: string;
}): react.JSX.Element;
type RichTextToolbarButtonProps = {
    icon: Icon;
    label?: string;
    isActive?: boolean;
    onClick?: () => void;
    disabled?: boolean;
};
declare const RichTextToolbarButton: react.ForwardRefExoticComponent<RichTextToolbarButtonProps & react.RefAttributes<HTMLButtonElement>>;

declare function RichTextArea({ className, ...rest }: Omit<EditorContentProps, "editor">): react.JSX.Element;

declare function ScrollContainer({ children, className, }: PropsWithChildren<{
    className?: string;
}>): react.JSX.Element;

declare function SheetRoot({ children, contentProps, nested, ...rest }: {
    contentProps?: ContentProps;
    nested?: boolean;
} & ComponentProps<typeof Drawer.Root>): react.JSX.Element;
declare function Title({ className, ...rest }: ComponentProps<typeof Drawer.Title>): react.JSX.Element;
declare function Description(props: ComponentProps<typeof Drawer.Description>): react.JSX.Element;
declare function Close(props: ComponentProps<typeof Drawer.Close>): react.JSX.Element;
declare const Sheet: typeof SheetRoot & {
    Title: typeof Title;
    Description: typeof Description;
    Close: typeof Close;
};

declare function ShimmerDots({ dotSize, cellSize, speed, color, className, }: {
    dotSize?: number;
    cellSize?: number;
    speed?: number;
    color?: [number, number, number];
    className?: string;
}): react.JSX.Element;

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    marks?: number[];
    className?: string;
    hint?: ReactNode;
    disabled?: boolean;
}
declare function Slider({ value, onChange, min, max, step, marks, className, hint, disabled, }: SliderProps): react.JSX.Element;

interface SmartDateTimePickerProps {
    value: Date | null | undefined;
    onChange: (date: Date | null) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
    autoFocus?: boolean;
}
declare function SmartDateTimePicker({ value, onChange, label, placeholder, className, required, autoFocus, }: SmartDateTimePickerProps): react.JSX.Element;

declare const statusBadgeVariants: (props?: ({
    variant?: "neutral" | "error" | "success" | "new" | "pending" | "warning" | null | undefined;
    size?: "sm" | "md" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
    icon?: Icon | null;
    tooltip?: string | React.ReactNode;
}
declare function StatusBadge({ className, variant, size, icon, tooltip, children, ...props }: BadgeProps): react.JSX.Element;

declare function Switch({ fn, id, trackDimensions, thumbDimensions, thumbTranslate, thumbIcon, checked, loading, disabled, disabledTooltip, }: {
    fn?: Dispatch<SetStateAction<boolean>> | ((checked: boolean) => void);
    id?: string;
    trackDimensions?: string;
    thumbDimensions?: string;
    thumbTranslate?: string;
    thumbIcon?: ReactNode;
    checked?: boolean;
    loading?: boolean;
    disabled?: boolean;
    disabledTooltip?: string | ReactNode;
}): react.JSX.Element;

declare function EditColumnsButton({ table }: {
    table: Table$1<any>;
}): react.JSX.Element;

type BaseTableProps<T> = {
    columns: ColumnDef<T, any>[];
    data: T[];
    loading?: boolean;
    error?: string;
    emptyState?: ReactNode;
    resourceName?: (plural: boolean) => string;
    defaultColumn?: Partial<ColumnDef<T, any>>;
    columnPinning?: ColumnPinningState;
    cellRight?: (cell: Cell<T, any>) => ReactNode;
    sortableColumns?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (props: {
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) => void;
    enableColumnResizing?: boolean;
    columnResizeMode?: ColumnResizeMode;
    columnVisibility?: VisibilityState;
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;
    getRowId?: (row: T) => string;
    onRowSelectionChange?: (rows: Row<T>[]) => void;
    selectedRows?: RowSelectionState;
    selectionControls?: (table: Table$1<T>) => ReactNode;
    onRowClick?: (row: Row<T>, e: MouseEvent$1) => void;
    onRowAuxClick?: (row: Row<T>, e: MouseEvent$1) => void;
    rowProps?: HTMLAttributes<HTMLTableRowElement> | ((row: Row<T>) => HTMLAttributes<HTMLTableRowElement>);
    className?: string;
    containerClassName?: string;
    scrollWrapperClassName?: string;
    emptyWrapperClassName?: string;
    thClassName?: string | ((columnId: string) => string);
    tdClassName?: string | ((columnId: string, row: Row<T>) => string);
};
type UseTableProps<T> = BaseTableProps<T> & ({
    pagination?: PaginationState$1;
    onPaginationChange?: Dispatch<SetStateAction<PaginationState$1>>;
    rowCount: number;
} | {
    pagination?: never;
    onPaginationChange?: never;
    rowCount?: never;
});
type TableProps<T> = BaseTableProps<T> & PropsWithChildren<{
    table: Table$1<T>;
}> & ({
    pagination?: PaginationState$1;
    paginationAllRowsHref?: string;
    rowCount: number;
} | {
    pagination?: never;
    paginationAllRowsHref?: never;
    rowCount?: never;
});

declare function useTable<T extends any>(props: UseTableProps<T>): TableProps<T> & {
    table: Table$1<T>;
};
declare function Table<T>({ data, loading, error, emptyState, cellRight, sortBy, sortOrder, onSortChange, sortableColumns, className, containerClassName, scrollWrapperClassName, emptyWrapperClassName, thClassName, tdClassName, table, pagination, paginationAllRowsHref, // to show all rows link in the pagination
resourceName, onRowClick, onRowAuxClick, onRowSelectionChange, selectionControls, rowProps, rowCount, children, enableColumnResizing, }: TableProps<T>): JSX.Element;

declare function useTablePagination({ pageSize, page, onPageChange, }: {
    pageSize: number;
    page: number;
    onPageChange?: (page: number) => void;
}): {
    pagination: PaginationState$1;
    setPagination: react.Dispatch<react.SetStateAction<PaginationState$1>>;
};

declare function TooltipProvider({ children }: {
    children: ReactNode;
}): react.JSX.Element;
interface TooltipProps extends Omit<TooltipPrimitive.TooltipContentProps, "content"> {
    content: ReactNode | string | ((props: {
        setOpen: (open: boolean) => void;
    }) => ReactNode);
    contentClassName?: string;
    disabled?: boolean;
    disableHoverableContent?: TooltipPrimitive.TooltipProps["disableHoverableContent"];
    delayDuration?: TooltipPrimitive.TooltipProps["delayDuration"];
}
declare function Tooltip({ children, content, contentClassName, disabled, side, disableHoverableContent, delayDuration, ...rest }: TooltipProps): react.JSX.Element;
declare function TooltipContent({ title, cta, href, target, onClick, }: {
    title: string;
    cta?: string;
    href?: string;
    target?: string;
    onClick?: () => void;
}): react.JSX.Element;
declare function InfoTooltip(props: Omit<TooltipProps, "children">): react.JSX.Element;
declare function BadgeTooltip({ children, content, ...props }: TooltipProps): react.JSX.Element;
declare function ButtonTooltip({ children, tooltipProps, ...props }: {
    children: ReactNode;
    tooltipProps: TooltipProps;
} & ButtonProps): react.JSX.Element;
declare function DynamicTooltipWrapper({ children, tooltipProps, }: {
    children: ReactNode;
    tooltipProps?: TooltipProps;
}): string | number | bigint | boolean | react.JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
declare function ScrollableTooltipContent({ children, maxHeight, className, }: {
    children: ReactNode;
    maxHeight?: string;
    className?: string;
}): react.JSX.Element;

type TimestampTooltipProps = {
    timestamp: Date | string | number | null | undefined;
    rows?: ("local" | "utc" | "unix")[];
    interactive?: boolean;
    prefix?: string;
    className?: string;
} & Omit<TooltipProps, "content">;
declare function TimestampTooltip({ timestamp, rows, interactive, prefix, ...tooltipProps }: TimestampTooltipProps): string | number | bigint | boolean | react.JSX.Element | Iterable<react.ReactNode> | Promise<string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<react.ReactNode> | null | undefined> | null | undefined;

interface ToggleOption {
    value: string;
    label: string | React.ReactNode;
    badge?: React.ReactNode;
    href?: string;
}
declare function ToggleGroup({ options, selected, selectAction, layout, className, optionClassName, indicatorClassName, style, }: {
    options: ToggleOption[];
    selected: string | null;
    selectAction?: (option: string) => void;
    layout?: boolean;
    className?: string;
    optionClassName?: string;
    indicatorClassName?: string;
    style?: React.CSSProperties;
}): react.JSX.Element;

type TruncatedListState = {
    total: number;
    visible: number;
    hidden: number;
};
type TruncatedListProps<T extends ElementType> = PropsWithChildren<ComponentPropsWithoutRef<T>> & {
    as?: T;
    overflowIndicator: (state: TruncatedListState) => ReactNode;
    className?: string;
    itemProps?: {
        className?: string;
    };
};
declare const TruncatedList: react.MemoExoticComponent<(<T extends ElementType>({ as, overflowIndicator, className, itemProps, children, ...rest }: TruncatedListProps<T>) => react.JSX.Element)>;

declare const UTM_PARAMETERS: readonly [{
    readonly key: "utm_source";
    readonly icon: typeof GlobePointer;
    readonly label: "Source";
    readonly placeholder: "google";
    readonly description: "Where the traffic is coming from";
}, {
    readonly key: "utm_medium";
    readonly icon: typeof SatelliteDish;
    readonly label: "Medium";
    readonly placeholder: "cpc";
    readonly description: "How the traffic is coming";
}, {
    readonly key: "utm_campaign";
    readonly icon: typeof Flag6;
    readonly label: "Campaign";
    readonly placeholder: "summer sale";
    readonly description: "The name of the campaign";
}, {
    readonly key: "utm_term";
    readonly icon: typeof InputSearch;
    readonly label: "Term";
    readonly placeholder: "running shoes";
    readonly description: "The term of the campaign";
}, {
    readonly key: "utm_content";
    readonly icon: typeof Page2;
    readonly label: "Content";
    readonly placeholder: "logo link";
    readonly description: "The content of the campaign";
}, {
    readonly key: "ref";
    readonly icon: typeof Gift;
    readonly label: "Referral";
    readonly placeholder: "yoursite.com";
    readonly description: "The referral of the campaign";
}];
declare function UTMBuilder({ values, onChange, disabled, autoFocus, disabledTooltip, className, }: {
    values: Record<(typeof UTM_PARAMETERS)[number]["key"], string | null | undefined>;
    onChange: (key: (typeof UTM_PARAMETERS)[number]["key"], value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    disabledTooltip?: string | ReactNode;
    className?: string;
}): react.JSX.Element;

declare const useClickHandlers: (url: string | undefined, router: ReturnType<typeof useRouter>) => {
    onClick: (e: React.MouseEvent<Element, MouseEvent>) => void;
    onAuxClick: (e: React.MouseEvent<Element, MouseEvent>) => void;
    role: string;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent<Element>) => false | void;
} | {
    onClick?: undefined;
    onAuxClick?: undefined;
    role?: undefined;
    tabIndex?: undefined;
    onKeyDown?: undefined;
};

type SingleTableConfig = {
    all: string[];
    defaultVisible: string[];
};
type MultiTableConfig<T extends string> = Record<T, SingleTableConfig>;
declare function useColumnVisibility<T extends SingleTableConfig>(storageKey: string, config: T): {
    columnVisibility: VisibilityState;
    setColumnVisibility: (visibility: VisibilityState) => void;
};
declare function useColumnVisibility<T extends string>(storageKey: string, config: MultiTableConfig<T>): {
    columnVisibility: Record<T, VisibilityState>;
    setColumnVisibility: (tab: T, visibility: VisibilityState) => void;
};

declare function useCookies<T>(key: string, initialValue: T, opts?: Cookies.CookieAttributes): [T, (value: T) => void];

declare const useCopyToClipboard: (timeout?: number) => [boolean, (value: string | ClipboardItem, options?: {
    onSuccess?: () => void;
    throwOnError?: boolean;
}) => Promise<void>];

declare function useCurrentAnchor(): string | undefined;

declare function useCurrentProduct(): {
    product: "links" | "program" | null;
};

declare function useCurrentSubdomain(): {
    subdomain: "partners" | "app" | "admin" | null;
};

declare function useEnterSubmit(formRef?: React.RefObject<HTMLFormElement | null>): {
    handleKeyDown: (event: KeyboardEvent$1<HTMLTextAreaElement>) => void;
};

declare function useInViewport(elementRef: RefObject<Element | null>, options?: {
    root?: RefObject<Element | null>;
    defaultValue?: boolean;
}): boolean;

/**
 * Determines whether an <input> or <textarea> element is currently focused.
 */
declare function useInputFocused(): boolean;

interface Args extends IntersectionObserverInit {
    freezeOnceVisible?: boolean;
}
declare function useIntersectionObserver(elementRef: RefObject<Element | null>, { threshold, root, rootMargin, freezeOnceVisible, }?: Args): IntersectionObserverEntry | undefined;

type KeyboardShortcutListener = {
    id: string;
    key: string | string[];
    enabled?: boolean;
    priority?: number;
    modal?: boolean;
    sheet?: boolean;
};
declare const KeyboardShortcutContext: react.Context<{
    listeners: KeyboardShortcutListener[];
    setListeners: Dispatch<SetStateAction<KeyboardShortcutListener[]>>;
}>;
declare function KeyboardShortcutProvider({ children, }: {
    children: React.ReactNode;
}): react.JSX.Element;
declare function useKeyboardShortcut(key: KeyboardShortcutListener["key"], callback: (e: KeyboardEvent) => void, options?: Pick<KeyboardShortcutListener, "enabled" | "priority" | "modal" | "sheet">): void;

declare function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void];

declare function useMediaQuery(): {
    device: "mobile" | "tablet" | "desktop" | null;
    width: number | undefined;
    height: number | undefined;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
};

declare function useOptimisticUpdate<T>(url: string, toastCopy?: {
    loading: string;
    success: string;
    error: string;
}): {
    data: T | undefined;
    isLoading: boolean;
    update: (fn: (data: T) => Promise<T>, optimisticData: T) => Promise<(string & {
        unwrap: () => Promise<T | undefined>;
    }) | (number & {
        unwrap: () => Promise<T | undefined>;
    }) | {
        unwrap: () => Promise<T | undefined>;
    }>;
};

type PaginationState = {
    pageIndex: number;
    pageSize: number;
};
declare function usePagination(pageSize?: number): {
    pagination: _tanstack_table_core.PaginationState;
    setPagination: react.Dispatch<react.SetStateAction<_tanstack_table_core.PaginationState>>;
};

declare function useRemoveGAParams(): void;

/**
 * Use a ResizeObserver to react to changes in an element's size
 *
 * More about ResizeObserver: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 */
declare function useResizeObserver(elementRef: RefObject<Element | null>): ResizeObserverEntry | undefined;

/** Scroll container for app dashboard main column (`MainNav`); not `window`. */
declare const DUB_DASHBOARD_MAIN_SCROLL_ID = "dub-dashboard-main-scroll";
/** Call after URL updates (e.g. in `useLayoutEffect`) to restore nested scroll. */
declare function consumePendingDashboardScrollTop(): number | null;
declare function useRouterStuff(): {
    pathname: string;
    router: AppRouterInstance;
    searchParams: ReadonlyURLSearchParams;
    searchParamsObj: {
        [k: string]: string;
    };
    queryParams: ({ set, del, replace, scroll, getNewPath, arrayDelimiter, }: {
        set?: Record<string, string | string[]>;
        del?: string | string[];
        replace?: boolean;
        scroll?: boolean;
        getNewPath?: boolean;
        arrayDelimiter?: string;
    }) => string | undefined;
    getQueryString: (kv?: Record<string, any>, opts?: {
        include?: string[];
        exclude?: string[];
    }) => string;
};

declare function useScroll(threshold: number, { container }?: {
    container?: RefObject<HTMLElement | null>;
}): boolean;

declare function useScrollProgress(ref: RefObject<HTMLElement | null>, { direction }?: {
    direction?: "vertical" | "horizontal";
}): {
    scrollProgress: number;
    updateScrollProgress: () => void;
};

declare function useToastWithUndo(): ({ id, message, undo, duration, }: {
    id: number | string;
    message: string;
    undo: () => void;
    duration?: number;
}) => string | number;

declare function Background(): react.JSX.Element;

declare function Footer({ staticDomain, className, }: {
    staticDomain?: string;
    className?: string;
}): react.JSX.Element;

declare function MaxWidthWrapper({ className, children, }: {
    className?: string;
    children: ReactNode;
}): react.JSX.Element;

type NavItemChild = {
    title: string;
    description?: string;
    href: string;
    icon: ElementType;
    iconClassName?: string;
};
type NavItemChildren = (NavItemChild | {
    label: string;
    items: NavItemChild[];
})[];
declare const FEATURES_LIST: ({
    id: string;
    title: string;
    description: string;
    icon: typeof DubLinksIcon;
    href: string;
} | {
    title: string;
    description: string;
    icon: react.ComponentClass<react.SVGProps<SVGSVGElement> & {
        variant?: "outline" | "fill";
    }, any> | react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        variant?: "outline" | "fill";
    }>;
    href: string;
    id?: undefined;
})[];
declare const SDKS: {
    icon: typeof Typescript;
    iconClassName: string;
    title: string;
    href: string;
}[];
declare const SOLUTIONS: NavItemChildren;
declare const RESOURCES: ({
    icon: typeof LifeRing;
    title: string;
    description: string;
    href: string;
} | {
    icon: react.ComponentClass<react.SVGProps<SVGSVGElement> & {
        variant?: "outline" | "fill";
    }, any> | react.FunctionComponent<react.SVGProps<SVGSVGElement> & {
        variant?: "outline" | "fill";
    }>;
    title: string;
    description: string;
    href: string;
})[];
declare const COMPARE_PAGES: {
    name: string;
    slug: string;
}[];
declare const LEGAL_PAGES: {
    name: string;
    slug: string;
}[];
declare const SOCIAL_LINKS: {
    name: string;
    icon: typeof Twitter;
    href: string;
}[];

declare function ResourcesContent({ domain }: {
    domain: string;
}): react.JSX.Element;

declare function SolutionsContent({ domain }: {
    domain: string;
}): react.JSX.Element;

type NavTheme = "light" | "dark";
declare const NavContext: react.Context<{
    theme: NavTheme;
}>;
type NavItem = {
    name: string;
    href?: string;
    segments?: string[];
    content?: ComponentType<{
        domain: string;
    }>;
    childItems?: NavItemChildren;
    target?: string;
    external?: boolean;
};
declare const navItems: ({
    name: string;
    content: typeof SolutionsContent;
    childItems: NavItemChildren;
    segments: string[];
    href?: undefined;
} | {
    name: string;
    content: typeof ResourcesContent;
    childItems: ({
        icon: typeof LifeRing;
        title: string;
        description: string;
        href: string;
    } | {
        icon: react.ComponentClass<SVGProps<SVGSVGElement> & {
            variant?: "outline" | "fill";
        }, any> | react.FunctionComponent<SVGProps<SVGSVGElement> & {
            variant?: "outline" | "fill";
        }>;
        title: string;
        description: string;
        href: string;
    })[];
    segments: string[];
    href?: undefined;
} | {
    name: string;
    href: string;
    segments: string[];
    content?: undefined;
    childItems?: undefined;
})[];
declare function Nav({ theme, staticDomain, maxWidthWrapperClassName, navItems: items, logo, }: {
    theme?: NavTheme;
    staticDomain?: string;
    maxWidthWrapperClassName?: string;
    navItems?: NavItem[];
    logo?: ReactNode;
}): react.JSX.Element;

declare function NavMobile({ theme, staticDomain, navItems: items, }: {
    theme?: NavTheme;
    staticDomain?: string;
    navItems?: NavItem[];
}): react.JSX.Element;
declare function AuthButton({ variant, className, ...rest }: Pick<ButtonProps, "variant"> & ComponentProps<typeof Link>): react.JSX.Element;

type AnimatedSizeContainerProps = PropsWithChildren<{
    width?: boolean;
    height?: boolean;
}> & Omit<ComponentPropsWithoutRef<typeof motion.div>, "animate" | "children">;
/**
 * A container with animated width and height (each optional) based on children dimensions
 */
declare const AnimatedSizeContainer: ForwardRefExoticComponent<AnimatedSizeContainerProps & RefAttributes<HTMLDivElement>>;

declare const BlurImage: react.MemoExoticComponent<(props: ImageProps) => react.JSX.Element>;

declare const ClientOnly: ({ children, fallback, fadeInDuration, className, }: {
    children: ReactNode;
    fallback?: ReactNode;
    fadeInDuration?: number;
    className?: string;
}) => react.JSX.Element;

declare const copyButtonVariants: (props?: ({
    variant?: "neutral" | "default" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
declare function CopyButton({ variant, value, className, icon, successMessage, }: {
    value: string;
    className?: string;
    icon?: LucideIcon;
    successMessage?: string;
} & VariantProps<typeof copyButtonVariants>): react.JSX.Element;

declare function CopyText({ value, children, className, successMessage, }: {
    value: string;
    children: ReactNode;
    className?: string;
    successMessage?: string;
}): react.JSX.Element;

interface MenuIconProps {
    icon: ReactNode;
    text: string;
}
declare function IconMenu({ icon, text }: MenuIconProps): react.JSX.Element;

declare const InlineSnippet: ({ children }: {
    children: string;
}) => react.JSX.Element;

declare function LinkLogo({ apexDomain, className, imageProps, }: {
    apexDomain?: string | null;
    className?: string;
    imageProps?: Partial<ImageProps>;
}): react.JSX.Element;

declare function LinkPreview({ defaultUrl }: {
    defaultUrl?: string;
}): react.JSX.Element;
declare function LinkPreviewPlaceholder({ defaultUrl, }: {
    defaultUrl?: string;
}): react.JSX.Element;

declare const FRAMER_MOTION_LIST_ITEM_VARIANTS: Variants;
declare const STAGGER_CHILD_VARIANTS: Variants;
declare const TAB_ITEM_ANIMATION_SETTINGS: MotionNodeOptions;

declare const PopupContext: react.Context<{
    hidePopup: () => void;
}>;
declare function Popup({ children, hiddenCookieId, }: {
    children: ReactNode;
    hiddenCookieId: string;
}): react.JSX.Element;

declare function ProgressBar({ value, max, className, }: {
    value?: number;
    max?: number;
    className?: string;
}): react.JSX.Element;

declare const tabSelectButtonVariants: (props?: ({
    variant?: "default" | "accent" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
declare function TabSelect<T extends string>({ variant, options, selected, onSelect, className, }: VariantProps<typeof tabSelectButtonVariants> & {
    options: {
        id: T;
        label: ReactNode;
        href?: string;
        target?: string;
    }[];
    selected: string | null;
    onSelect?: Dispatch<SetStateAction<T>> | ((id: T) => void);
    className?: string;
}): react.JSX.Element;

declare function AdvancedLinkFeaturesTooltip(): react.JSX.Element;

declare function CompositeLogo({ className }: {
    className?: string;
}): react.JSX.Element;

declare function Logo({ className }: {
    className?: string;
}): react.JSX.Element;

/**
 * The Dub logo with a custom context menu for copying/navigation,
 * for use in the top site nav
 */
declare function NavWordmark({ variant, isInApp, className, }: {
    variant?: "full" | "symbol";
    isInApp?: boolean;
    className?: string;
}): react.JSX.Element;

declare function Wordmark({ className }: {
    className?: string;
}): react.JSX.Element;

export { AUTOPLAY_DEFAULT_DELAY, Accordion, AccordionContent, AccordionItem, AccordionTrigger, type ActiveFilterInput, ActivityRing, AdvancedLinkFeaturesTooltip, Alert, AlertDescription, AlertTitle, AnimatedEmptyState, AnimatedSizeContainer, AuthButton, Avatar, Background, Badge, BadgeTooltip, BlurImage, Button, type ButtonProps, ButtonTooltip, COMPARE_PAGES, Calendar, CardList, CardSelector, type CardSelectorOption, type CardSelectorProps, Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNavBar, CarouselNext, CarouselPrevious, CarouselThumbnail, CarouselThumbnails, Checkbox, ClientOnly, Combobox, type ComboboxOption, type ComboboxProps, CompositeLogo, CopyButton, CopyText, DEFAULT_RICH_TEXT_FEATURES, DUB_DASHBOARD_MAIN_SCROLL_ID, DatePicker, DatePickerContext, type DatePickerProps, type DatePickerTriggerRenderProps, DateRangePicker, DotsPattern, DubLinksIcon, DubStatusBadge, DynamicTooltipWrapper, EditColumnsButton, EmptyState, type EmptyStateProps, FEATURES_LIST, FRAMER_MOTION_LIST_ITEM_VARIANTS, FileUpload, type FileUploadProps, Filter, type Filter$1 as FilterConfig, type FilterOption, FilterOptionRow, Flag6, Footer, Form, Gift, GlobePointer, Grid, Icon, IconMenu, InfoTooltip, InlineSnippet, Input, type InputProps, InputSearch, KeyboardShortcutContext, KeyboardShortcutProvider, LEGAL_PAGES, Label, LifeRing, LinkLogo, LinkPreview, LinkPreviewPlaceholder, Logo, MaxWidthWrapper, MenuItem, MiniAreaChart, type MiniAreaChartProps, Modal, MultiValueInput, type MultiValueInputProps, type MultiValueInputRef, Nav, NavContext, type NavItem, type NavItemChild, type NavItemChildren, NavMobile, type NavTheme, NavWordmark, NumberStepper, type NumberStepperProps, PROSE_STYLES, Page2, PaginationControls, type PaginationState, Popover, type PopoverProps, Popup, PopupContext, ProgressBar, ProgressCircle, ProgressiveBlur, RESOURCES, RadioGroup, RadioGroupItem, RichTextArea, type RichTextAreaProviderRef, RichTextContext, type RichTextFeature, RichTextProvider, RichTextToolbar, RichTextToolbarButton, SDKS, SOCIAL_LINKS, SOLUTIONS, STAGGER_CHILD_VARIANTS, SatelliteDish, ScrollContainer, ScrollableTooltipContent, Sheet, ShimmerDots, Slider, SmartDateTimePicker, StatusBadge, Switch, TAB_ITEM_ANIMATION_SETTINGS, TabSelect, Table, TimestampTooltip, type TimestampTooltipProps, ToggleGroup, Tooltip, TooltipContent, type TooltipProps, TooltipProvider, TruncatedList, Twitter, Typescript, UTMBuilder, UTM_PARAMETERS, Wordmark, badgeVariants, buttonVariants, consumePendingDashboardScrollTop, encodeRangeToken, menuItemVariants, navItems, normalizeActiveFilter, parseRangeToken, statusBadgeVariants, useCarousel, useCarouselActiveIndex, useClickHandlers, useColumnVisibility, useCookies, useCopyToClipboard, useCurrentAnchor, useCurrentProduct, useCurrentSubdomain, useEnterSubmit, useInViewport, useInputFocused, useIntersectionObserver, useKeyboardShortcut, useLocalStorage, useMediaQuery, useOptimisticUpdate, usePagination, useRemoveGAParams, useResizeObserver, useRichTextContext, useRouterStuff, useScroll, useScrollProgress, useTable, useTablePagination, useToastWithUndo };
