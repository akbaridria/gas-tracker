import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CovalentClient } from "@covalenthq/client-sdk"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function covalentClient(apiKey: string) {
  return new CovalentClient(apiKey);
}