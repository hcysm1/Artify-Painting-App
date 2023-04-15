import { writable } from "svelte/store";

export const selectedShape = writable("rectangle");
export const selectedStroke = writable("pen");
export const shape = writable(false);
export const stroke = writable(true);
export const isErasing = writable(false);
