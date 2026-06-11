"use client";

import * as React from "react";
import { api } from "./client";

interface ListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Lista desde la API; refetch on demand. `path` null pausa la consulta. */
export function useApiList<T = Record<string, unknown>>(path: string | null): ListState<T> {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    api
      .get<T[]>(path)
      .then((d) => active && (setData(d ?? []), setError(null)))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [path, tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}

interface ItemState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Un registro desde la API. */
export function useApiItem<T = Record<string, unknown>>(path: string | null): ItemState<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    api
      .get<T>(path)
      .then((d) => active && (setData(d), setError(null)))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [path, tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}
