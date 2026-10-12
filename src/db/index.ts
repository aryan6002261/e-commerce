import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { starterProducts } from "@/lib/starter-products";

type RecordItem = Record<string, any>;

interface MorrowStore {
  products: RecordItem[];
  users: RecordItem[];
  orders: RecordItem[];
  orderItems: RecordItem[];
  nextId: { product: number; user: number; order: number; orderItem: number };
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __morrowStore?: MorrowStore;
};

const databaseUrl = process.env.DATABASE_URL;

export const pool: Pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  (databaseUrl
    ? new Pool({
        connectionString: databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      })
    : (new Proxy({}, {
        get: () => async () => ({ rows: [] }),
      }) as unknown as Pool));

globalForDb.__arenaNextJsPostgresqlPool = pool;

const store: MorrowStore =
  globalForDb.__morrowStore ??
  {
    products: starterProducts.map((p, idx) => ({ id: idx + 1, ...p, createdAt: new Date() })),
    users: [],
    orders: [],
    orderItems: [],
    nextId: { product: 100, user: 1, order: 1, orderItem: 1 },
  };

globalForDb.__morrowStore = store;

function getTable(table: any): { name: string; list: RecordItem[] } {
  const name = String(table?.[Symbol.for("drizzle:Name")] || table?._?.name || table?.name || "");
  if (name.includes("product")) return { name: "products", list: store.products };
  if (name.includes("user")) return { name: "users", list: store.users };
  if (name.includes("order_item") || name.includes("items")) return { name: "orderItems", list: store.orderItems };
  if (name.includes("order")) return { name: "orders", list: store.orders };
  return { name: "unknown", list: [] };
}

function parseCondition(cond: any) {
  if (!cond) return null;
  const chunks = cond.queryChunks || [];
  let colName: string | null = null;
  let val: any = undefined;
  let isNe = false;
  let isIn = false;

  for (const chunk of chunks) {
    if (chunk && chunk.name && typeof chunk.name === "string") {
      colName = chunk.name;
    }
    if (chunk && chunk.value !== undefined && chunk.constructor?.name === "Param") {
      val = chunk.value;
    }
    if (Array.isArray(chunk)) {
      val = chunk.map((p: any) => (p && p.value !== undefined ? p.value : p));
      isIn = true;
    }
    if (chunk && chunk.value && Array.isArray(chunk.value)) {
      const str = chunk.value.join("");
      if (str.includes("!=") || str.includes("<>")) isNe = true;
      if (str.includes("in") || str.includes("IN")) isIn = true;
    }
  }

  return { colName, val, isNe, isIn };
}

function matchesCondition(item: RecordItem, cond: any): boolean {
  const parsed = parseCondition(cond);
  if (!parsed || !parsed.colName) return true;
  const { colName, val, isNe, isIn } = parsed;
  const itemVal = item[colName];

  if (isIn && Array.isArray(val)) {
    return val.includes(itemVal);
  }
  if (isNe) {
    return itemVal !== val;
  }
  return itemVal === val;
}

function project(item: RecordItem, fields?: Record<string, any>): RecordItem {
  if (!fields || Object.keys(fields).length === 0) return { ...item };
  const res: RecordItem = {};
  for (const k of Object.keys(fields)) {
    res[k] = item[k];
  }
  return res;
}

class MockQueryBuilder implements PromiseLike<any[]> {
  private targetTable: any = null;
  private conditions: any[] = [];
  private orderChunks: any[] = [];
  private limitCount?: number;
  private selectedFields?: Record<string, any>;

  constructor(fields?: Record<string, any>) {
    this.selectedFields = fields;
  }

  from(table: any) {
    this.targetTable = table;
    return this;
  }

  where(cond: any) {
    if (cond) this.conditions.push(cond);
    return this;
  }

  orderBy(...orders: any[]) {
    this.orderChunks.push(...orders);
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  for(_mode: string) {
    return this;
  }

  private execute(): any[] {
    const { list } = getTable(this.targetTable);
    let result = list.filter((item) => this.conditions.every((c) => matchesCondition(item, c)));

    for (const orderChunk of this.orderChunks) {
      const chunks = orderChunk?.queryChunks || [];
      let colName = "id";
      let isDesc = false;
      for (const chunk of chunks) {
        if (chunk && chunk.name) colName = chunk.name;
        if (chunk && chunk.value && Array.isArray(chunk.value)) {
          if (chunk.value.join("").toLowerCase().includes("desc")) isDesc = true;
        }
      }
      result.sort((a, b) => {
        const valA = a[colName];
        const valB = b[colName];
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    if (this.limitCount !== undefined) {
      result = result.slice(0, this.limitCount);
    }

    return result.map((item) => project(item, this.selectedFields));
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

class MockInsertBuilder implements PromiseLike<any[]> {
  private targetTable: any;
  private rawValues: any[] = [];
  private returningFields?: Record<string, any>;
  private conflictTarget?: string;

  constructor(table: any) {
    this.targetTable = table;
  }

  values(val: any | any[]) {
    this.rawValues = Array.isArray(val) ? val : [val];
    return this;
  }

  onConflictDoNothing(opts?: any) {
    if (opts?.target?.name) {
      this.conflictTarget = opts.target.name;
    }
    return this;
  }

  returning(fields?: Record<string, any>) {
    this.returningFields = fields || {};
    return this;
  }

  private execute(): any[] {
    const { name, list } = getTable(this.targetTable);
    const inserted: any[] = [];

    for (const row of this.rawValues) {
      if (this.conflictTarget && row[this.conflictTarget] !== undefined) {
        const exists = list.some((item) => item[this.conflictTarget!] === row[this.conflictTarget!]);
        if (exists) continue;
      }

      let idKey = "product" as keyof MorrowStore["nextId"];
      if (name === "users") idKey = "user";
      else if (name === "orders") idKey = "order";
      else if (name === "orderItems") idKey = "orderItem";

      const id = row.id ?? ++store.nextId[idKey];
      const newRecord = {
        id,
        createdAt: new Date(),
        ...row,
      };

      list.push(newRecord);
      inserted.push(project(newRecord, this.returningFields));
    }

    return inserted;
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

class MockUpdateBuilder implements PromiseLike<any[]> {
  private targetTable: any;
  private valuesToSet: Record<string, any> = {};
  private conditions: any[] = [];

  constructor(table: any) {
    this.targetTable = table;
  }

  set(val: Record<string, any>) {
    this.valuesToSet = val;
    return this;
  }

  where(cond: any) {
    if (cond) this.conditions.push(cond);
    return this;
  }

  private execute(): any[] {
    const { list } = getTable(this.targetTable);
    const updated: any[] = [];

    for (const item of list) {
      if (this.conditions.every((c) => matchesCondition(item, c))) {
        for (const [k, v] of Object.entries(this.valuesToSet)) {
          if (v && typeof v === "object" && v.queryChunks) {
            let decrement = 1;
            for (const chunk of v.queryChunks) {
              if (chunk && chunk.value !== undefined && chunk.constructor?.name === "Param") {
                decrement = Number(chunk.value);
              }
            }
            if (typeof item[k] === "number") {
              item[k] = Math.max(0, item[k] - decrement);
            }
          } else {
            item[k] = v;
          }
        }
        updated.push({ ...item });
      }
    }

    return updated;
  }

  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: any[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

const mockDb = {
  select(fields?: any) {
    return new MockQueryBuilder(fields);
  },
  insert(table: any) {
    return new MockInsertBuilder(table);
  },
  update(table: any) {
    return new MockUpdateBuilder(table);
  },
  async transaction(fn: (tx: any) => Promise<any>) {
    return fn(mockDb);
  },
  async execute() {
    return { rows: [] };
  },
};

let realDb: ReturnType<typeof drizzle> | null = null;
if (databaseUrl) {
  try {
    realDb = drizzle(pool);
  } catch {
    console.warn("[AI Studio] Database connection failed — using in-memory mock");
  }
}

export const db: ReturnType<typeof drizzle> = (realDb ?? mockDb) as unknown as ReturnType<typeof drizzle>;
