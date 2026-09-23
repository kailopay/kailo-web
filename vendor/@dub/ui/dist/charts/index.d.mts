import * as react from 'react';
import { ReactElement, Dispatch, SetStateAction, FC, PropsWithChildren } from 'react';
import { ScaleTypeToD3Scale } from '@visx/scale';
import { TooltipWithBounds } from '@visx/tooltip';
import { UseTooltipParams } from '@visx/tooltip/lib/hooks/useTooltip';
import { TooltipInPortalProps } from '@visx/tooltip/lib/hooks/useTooltipInPortal';

declare function Areas({ seriesStyles, showLatestValueCircle, }: {
    seriesStyles?: {
        id: string;
        gradientClassName?: string;
        lineClassName?: string;
        areaFill?: string;
        lineStroke?: string;
    }[];
    showLatestValueCircle?: boolean;
}): react.JSX.Element;

declare function Bars({ seriesStyles, radius, }: {
    seriesStyles?: {
        id: string;
        barClassName?: string;
        barFill?: string;
    }[];
    radius?: number;
}): react.JSX.Element;

type Datum = Record<string, any>;
type TimeSeriesDatum<T extends Datum = any> = {
    date: Date;
    values: T;
};
type AccessorFn<T extends Datum, TValue = number> = (datum: TimeSeriesDatum<T>) => TValue;
type Series<T extends Datum = any, TValue = number> = {
    id: string;
    isActive?: boolean;
    valueAccessor: AccessorFn<T, TValue>;
    colorClassName?: string;
};
type Data<T extends Datum> = TimeSeriesDatum<T>[];
type ChartRequiredProps<T extends Datum = any> = {
    data: Data<T>;
    series: Series<T>[];
};
type ChartOptionalProps<T extends Datum = any> = {
    type?: "area" | "bar";
    tooltipContent?: (datum: TimeSeriesDatum<T>) => ReactElement<any> | string;
    tooltipClassName?: string;
    defaultTooltipIndex?: number | null;
    /**
     * Called when the hovered x-value (date) changes, or when hover is cleared.
     * Useful for syncing external UI to the currently hovered datum.
     */
    onHoverDateChange?: (date: Date | null) => void;
    /**
     * Absolute pixel values for margins around the chart area.
     * Default values accommodate axis labels and other expected overflow.
     */
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    /**
     * Decimal percentages for padding above and below highest and lowest y-values
     */
    padding?: {
        top: number;
        bottom: number;
    };
};
type ChartProps<T extends Datum = any> = ChartRequiredProps<T> & ChartOptionalProps<T>;
type ChartContext$1<T extends Datum = any> = Required<Omit<ChartProps<T>, "onHoverDateChange">> & {
    width: number;
    height: number;
    startDate: Date;
    endDate: Date;
    xScale: ScaleTypeToD3Scale<number>["utc"] | ScaleTypeToD3Scale<number>["band"];
    yScale: ScaleTypeToD3Scale<number>["linear"];
    minY: number;
    maxY: number;
    leftAxisMargin?: number;
    setLeftAxisMargin: Dispatch<SetStateAction<number | undefined>>;
    /**
     * Optional callback invoked when the hovered x-value (date) changes.
     */
    onHoverDateChange?: (date: Date | null) => void;
};
type ChartTooltipContext$1<T extends Datum = any> = {
    handleTooltip: (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => void;
    TooltipWrapper: FC<TooltipInPortalProps> | typeof TooltipWithBounds;
    containerRef: (element: SVGElement | HTMLElement | null) => void;
} & UseTooltipParams<TimeSeriesDatum<T>>;

declare const ChartContext: react.Context<ChartContext$1 | null>;
declare function useChartContext<T extends Datum>(): ChartContext$1<T>;
declare const ChartTooltipContext: react.Context<ChartTooltipContext$1 | null>;
declare function useChartTooltipContext<T extends Datum>(): ChartTooltipContext$1<T>;

type FunnelChartProps = {
    steps: {
        id: string;
        label: string;
        value: number;
        additionalValue?: number;
        colorClassName: string;
    }[];
    persistentPercentages?: boolean;
    tooltips?: boolean;
    defaultTooltipStepId?: string;
    chartPadding?: number;
};
declare function FunnelChart(props: FunnelChartProps): react.JSX.Element;

type TimeSeriesChartProps<T extends Datum> = PropsWithChildren<ChartProps<T>>;
declare function TimeSeriesChart<T extends Datum>(props: TimeSeriesChartProps<T>): react.JSX.Element;

type ChartTooltipSyncContextType = {
    tooltipDate?: Date | null;
    setTooltipDate?: Dispatch<SetStateAction<Date | null | undefined>>;
};
declare const ChartTooltipSyncContext: react.Context<ChartTooltipSyncContextType>;
declare function ChartTooltipSync({ children }: PropsWithChildren): react.JSX.Element;

type XAxisProps = {
    /**
     * Maximum number of ticks to generate
     */
    maxTicks?: number;
    /**
     * Whether to render dashed grid lines across the chart area
     */
    showGridLines?: boolean;
    /**
     * Whether to render a line for the axis
     */
    showAxisLine?: boolean;
    /**
     * Whether to highlight the latest tick label when no other area is hovered
     */
    highlightLast?: boolean;
    /**
     * Custom formatting function for tick labels
     */
    tickFormat?: (date: Date) => string;
};
declare function XAxis({ maxTicks: maxTicksProp, showGridLines, highlightLast, showAxisLine, tickFormat, }: XAxisProps): react.JSX.Element;

type YAxisProps = {
    /**
     * Approximate number of ticks to generate (see d3-array's `ticks`)
     */
    numTicks?: number;
    /**
     * Whether to render dashed grid lines across the chart area
     */
    showGridLines?: boolean;
    /**
     * Whether to only generate integer ticks (no decimals)
     */
    integerTicks?: boolean;
    /**
     * Tick values to override dynamic tick generation
     */
    tickValues?: number[];
    /**
     * Custom formatting function for tick labels
     */
    tickFormat?: (value: number) => string;
    /**
     * Amount of space between tick labels and the axis line / chart area
     */
    tickAxisSpacing?: number;
};
declare function YAxis({ numTicks: numTicksProp, showGridLines, integerTicks, tickValues: tickValuesProp, tickFormat, tickAxisSpacing, }: YAxisProps): react.JSX.Element;

export { Areas, Bars, ChartContext, ChartTooltipContext, ChartTooltipSync, ChartTooltipSyncContext, FunnelChart, TimeSeriesChart, XAxis, type XAxisProps, YAxis, type YAxisProps, useChartContext, useChartTooltipContext };
