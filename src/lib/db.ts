import { sql } from "@vercel/postgres";

// Fallback in-memory storage for resilience
let localRegistrants: any[] = [];
let localConfig: any = {
  hero_title: "Transición Estratégica a la Nueva versión de ISO 9001:2026",
  hero_subtitle: "Los borradores de la nueva versión ya están sobre la mesa. Contexto, Liderazgo y Evidencia no son \"extras\": son el nuevo estándar.",
  company_name: "Vinci Consultores",
  primary_color: "#00A86B",
  event_date: "2026-05-30T12:00:00Z",
  logo_url: "",
  presenter_1_url: "",
  presenter_2_url: "",
  presenter_3_url: "",
};

let dbInitialized = false;
let initializing: Promise<void> | null = null;
let dbUnavailable = false;

export async function initDb() {
  if (dbInitialized || dbUnavailable) return;
  if (initializing) return initializing;

  initializing = (async () => {
    try {
      const url = process.env.POSTGRES_URL;
      if (!url || url.includes("YOUR_POSTGRES_URL")) {
        dbUnavailable = true;
        return;
      }
      
      const sqlWithTimeout = async (query: any, timeoutMs: number = 3000) => {
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("DB_TIMEOUT")), timeoutMs)
        );
        return Promise.race([query, timeout]) as any;
      };

      // Table initialization (Parallel & Fast)
      try {
        await Promise.all([
          sqlWithTimeout(sql`
            CREATE TABLE IF NOT EXISTS registrants (
              id SERIAL PRIMARY KEY,
              fullname TEXT NOT NULL,
              email TEXT NOT NULL,
              company TEXT,
              position TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `),
          sqlWithTimeout(sql`
            CREATE TABLE IF NOT EXISTS config (
              key TEXT PRIMARY KEY,
              value JSONB NOT NULL
            )
          `)
        ]);
        
        // Configuration check/seed
        const result = await sqlWithTimeout(sql`SELECT count(*) FROM config`, 2000);
        if (result && result.rows && parseInt(result.rows[0].count) === 0) {
          for (const [key, value] of Object.entries(localConfig)) {
            await sql`INSERT INTO config (key, value) VALUES (${key}, ${JSON.stringify(value)})`.catch(() => {});
          }
        }
      } catch (err) {
        console.warn("Table init/check failed, but continuing:", err instanceof Error ? err.message : String(err));
      }

      dbInitialized = true;
    } catch (error) {
      console.error("Database init error:", error);
      dbUnavailable = true;
    } finally {
      initializing = null;
    }
  })();

  return initializing;
}

export async function getRegistrants() {
  try {
    if (!process.env.POSTGRES_URL || dbUnavailable) return localRegistrants;
    
    const query = sql`SELECT * FROM registrants ORDER BY created_at DESC LIMIT 500`;
    const { rows } = await query as any;
    return rows;
  } catch (error) {
    return localRegistrants;
  }
}

export async function addRegistrant(data: { fullName: string; email: string; company?: string; position?: string }) {
  const { fullName, email, company, position } = data;
  
  const registrant = { 
    fullname: fullName, 
    email, 
    company, 
    position, 
    created_at: new Date() 
  };

  // 1. Local save
  localRegistrants.push(registrant);

  // 2. Async DB save
  if (process.env.POSTGRES_URL && !dbUnavailable) {
    if (!dbInitialized && !initializing) {
      initDb().catch(() => {});
    }

    try {
      // Small race to avoid hanging the lambda if DB is sluggish
      const dbWrite = sql`
        INSERT INTO registrants (fullname, email, company, position)
        VALUES (${fullName}, ${email}, ${company || null}, ${position || null})
      `;
      const timeout = new Promise((_, r) => setTimeout(() => r(new Error("DB_WRITE_TIMEOUT")), 3000));
      
      await Promise.race([dbWrite, timeout]);
    } catch (err) {
      console.warn("DB Background write failed:", err instanceof Error ? err.message : String(err));
    }
  }
}

export async function getConfig() {
  try {
    if (!process.env.POSTGRES_URL || dbUnavailable) return localConfig;
    
    const configQuery = sql`SELECT key, value FROM config`;
    const { rows } = await configQuery as any;
    
    const config = { ...localConfig };
    rows.forEach((row: any) => {
      config[row.key] = row.value;
    });
    config.db_connected = true;
    return config;
  } catch (error) {
    return { ...localConfig, db_connected: false };
  }
}

export async function updateConfig(newConfig: any) {
  Object.assign(localConfig, newConfig);
  
  try {
    if (!process.env.POSTGRES_URL || dbUnavailable) return;
    
    // Non-blocking batch update
    const updates = Object.entries(newConfig).map(([key, value]) => {
      return sql`
        INSERT INTO config (key, value)
        VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}
      `;
    });
    
    Promise.all(updates).catch(err => console.error("Config update sync fail:", err));
  } catch (error) {
    console.error("Config update error:", error);
  }
}
