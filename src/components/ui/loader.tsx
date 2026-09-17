"use client";

import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";

type LoaderProps = {
  size?: number;
  color?: string;
  stroke?: number;
};

export function Loader({ size = 20, color = "white", stroke = 2.5 }: LoaderProps) {
  return <Ring size={size} stroke={stroke} speed={2} color={color} bgOpacity={0} />;
}
