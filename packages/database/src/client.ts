/**
 * Database Connection Client Interface
 * Sẵn sàng cho Drizzle ORM hoặc Prisma khi kết nối PostgreSQL thực tế
 */
export interface DatabaseConfig {
  connectionString?: string;
  maxConnections?: number;
}

export class DatabaseClient {
  private isConnected = false;

  constructor(private config: DatabaseConfig = {}) {}

  public async connect(): Promise<boolean> {
    // Sẽ tích hợp Drizzle/Prisma client tại đây
    this.isConnected = true;
    return this.isConnected;
  }

  public async healthCheck(): Promise<{ ok: boolean; message: string }> {
    return {
      ok: true,
      message: 'Database layer is operational (Ready for PostgreSQL connection)',
    };
  }

  public get connected(): boolean {
    return this.isConnected;
  }
}

export const db = new DatabaseClient();
