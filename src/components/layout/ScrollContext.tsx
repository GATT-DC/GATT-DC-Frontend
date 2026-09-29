"use client";

import { createContext, useContext } from "react";

const ScrollIndexContext = createContext(0);

export const ScrollIndexProvider = ScrollIndexContext.Provider;

export function useActiveIndex() {
  return useContext(ScrollIndexContext);
}
