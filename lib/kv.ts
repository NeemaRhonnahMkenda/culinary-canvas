import "server-only";

/* ------------------------------------------------------------------ */
/*  Tiny key-value layer.                                              */
/*  Production: Upstash Redis over REST (no SDK). Works with either    */
/*    UPSTASH_REDIS_REST_URL / _TOKEN or KV_REST_API_URL / _TOKEN.     */
/*  No Redis configured: an in-memory store, fine for local dev, but   */
/*    data resets on restart (the UI shows a notice).                  */
/* ------------------------------------------------------------------ */

type SetOpts = { nx?: boolean; ex?: number };

export interface KV {
  persistent: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, opts?: SetOpts): Promise<boolean>;
  del(key: string): Promise<void>;
  zadd(key: string, score: number, member: string): Promise<void>;
  zrem(key: string, member: string): Promise<void>;
  /** Members, highest score first. */
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  mget(keys: string[]): Promise<(string | null)[]>;
  /** INCR with an expiry set on first use; returns the new count. */
  incr(key: string, ttlSec: number): Promise<number>;
}

function upstash(url: string, token: string): KV {
  async function cmd<T>(...c: (string | number)[]): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(c.map(String)),
      cache: "no-store",
    });
    const j = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
    if (!res.ok || j.error) throw new Error(j.error ?? `Redis HTTP ${res.status}`);
    return j.result as T;
  }
  return {
    persistent: true,
    get: (k) => cmd<string | null>("GET", k),
    async set(k, v, o = {}) {
      const args: (string | number)[] = ["SET", k, v];
      if (o.ex) args.push("EX", o.ex);
      if (o.nx) args.push("NX");
      const r = await cmd<string | boolean | null>(...args);
      return r === "OK" || r === true; // Upstash replies "OK"; some Redis proxies reply true
    },
    async del(k) {
      await cmd("DEL", k);
    },
    async zadd(k, s, m) {
      await cmd("ZADD", k, s, m);
    },
    async zrem(k, m) {
      await cmd("ZREM", k, m);
    },
    zrevrange: (k, a, b) => cmd<string[]>("ZREVRANGE", k, a, b),
    mget: (keys) => (keys.length ? cmd<(string | null)[]>("MGET", ...keys) : Promise.resolve([])),
    incr: (k, ttl) =>
      cmd<number>("EVAL", "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n", 1, k, ttl),
  };
}

function memory(): KV {
  const g = globalThis as unknown as { __ccMem?: { kv: Map<string, { v: string; exp?: number }>; z: Map<string, Map<string, number>> } };
  g.__ccMem ??= { kv: new Map(), z: new Map() };
  const { kv, z } = g.__ccMem;
  const live = (k: string) => {
    const e = kv.get(k);
    if (e && e.exp && e.exp < Date.now()) {
      kv.delete(k);
      return undefined;
    }
    return e;
  };
  return {
    persistent: false,
    async get(k) {
      return live(k)?.v ?? null;
    },
    async set(k, v, o = {}) {
      if (o.nx && live(k)) return false;
      kv.set(k, { v, exp: o.ex ? Date.now() + o.ex * 1000 : undefined });
      return true;
    },
    async del(k) {
      kv.delete(k);
      z.delete(k);
    },
    async zadd(k, s, m) {
      if (!z.has(k)) z.set(k, new Map());
      z.get(k)!.set(m, s);
    },
    async zrem(k, m) {
      z.get(k)?.delete(m);
    },
    async zrevrange(k, a, b) {
      const all = [...(z.get(k)?.entries() ?? [])].sort((x, y) => y[1] - x[1]).map(([m]) => m);
      return all.slice(a, b < 0 ? undefined : b + 1);
    },
    async mget(keys) {
      return keys.map((k) => live(k)?.v ?? null);
    },
    async incr(k, ttl) {
      const n = Number(live(k)?.v ?? 0) + 1;
      kv.set(k, { v: String(n), exp: live(k)?.exp ?? Date.now() + ttl * 1000 });
      return n;
    },
  };
}

let instance: KV | null = null;
export function kv(): KV {
  if (instance) return instance;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  instance = url && token ? upstash(url.replace(/\/+$/, ""), token) : memory();
  return instance;
}
