// Advanced Performance Optimizer for Streaming Platform
export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface ServerHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: number;
  successRate: number;
  errorCount: number;
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  serverHealth: ServerHealth[];
}

class PerformanceOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; hits: number }>();
  private serverHealth = new Map<string, ServerHealth>();
  private requestQueue = new Map<string, Promise<any>>();
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    serverHealth: []
  };

  private cacheConfig: CacheConfig = {
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
    strategy: 'lru'
  };

  private rateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    burstLimit: 20
  };

  // Advanced LRU Cache Implementation
  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count for LRU
    cached.hits++;
    cached.timestamp = now;
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].hits - b[1].hits); // Sort by hit count
      const [oldestKey] = entries[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 1
    });
  }

  // Request Deduplication
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.requestQueue.has(key)) {
      console.log('🔄 Deduplicating request:', key);
      return this.requestQueue.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // Rate Limiting
  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const limit = this.rateLimitMap.get(identifier);

    if (!limit || now > limit.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.rateLimitConfig.windowMs
      });
      return true;
    }

    if (limit.count >= this.rateLimitConfig.maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Server Health Monitoring
  private async checkServerHealth(serverId: string, baseUrl: string): Promise<ServerHealth> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/health`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'STREAMERZ/2.0',
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const health: ServerHealth = {
        id: serverId,
        name: serverId,
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: Date.now(),
        successRate: this.calculateSuccessRate(serverId, response.ok),
        errorCount: response.ok ? 0 : 1
      };

      this.serverHealth.set(serverId, health);
      return health;

    } catch (error) {
      const health: ServerHealth = {
        id: serverId,
        name: serverId,
        status: 'down',
        responseTime: Date.now() - startTime,
        lastChecked: Date.now(),
        successRate: this.calculateSuccessRate(serverId, false),
        errorCount: 1
      };

      this.serverHealth.set(serverId, health);
      return health;
    }
  }

  private calculateSuccessRate(serverId: string, success: boolean): number {
    const current = this.serverHealth.get(serverId);
    if (!current) return success ? 100 : 0;

    const totalRequests = current.successRate * 100 + (success ? 0 : 1);
    const successfulRequests = current.successRate * 100 + (success ? 1 : 0);
    
    return Math.min(100, (successfulRequests / totalRequests) * 100);
  }

  // Optimized Fetch with All Performance Features
  async optimizedFetch<T>(
    endpoint: string,
    params: Record<string, any> = {},
    options: {
      cache?: boolean;
      deduplicate?: boolean;
      rateLimit?: string;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const {
      cache = true,
      deduplicate = true,
      rateLimit,
      timeout = 10000,
      retries = 3
    } = options;

    const cacheKey = this.getCacheKey(endpoint, params);
    const requestKey = `${endpoint}_${JSON.stringify(params)}`;

    // Check cache first
    if (cache) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        this.metrics.cacheHitRate = (this.metrics.cacheHitRate + 1) / 2;
        console.log('🎯 Cache hit for:', endpoint);
        return cachedData;
      }
    }

    // Check rate limit
    if (rateLimit && !this.checkRateLimit(rateLimit)) {
      throw new Error('Rate limit exceeded');
    }

    // Deduplicate requests
    if (deduplicate) {
      return this.deduplicateRequest(requestKey, () => this.performFetch());
    }

    return this.performFetch();

    async function performFetch(): Promise<T> {
      const startTime = Date.now();
      this.metrics.totalRequests++;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const response = await fetch(endpoint, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'STREAMERZ/2.0',
              'Cache-Control': 'no-cache'
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          const responseTime = Date.now() - startTime;

          // Update metrics
          this.metrics.successfulRequests++;
          this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime + responseTime) / 2;

          // Cache successful response
          if (cache) {
            this.setCache(cacheKey, data);
          }

          console.log(`✅ Success: ${endpoint} (${responseTime}ms)`);
          return data;

        } catch (error: any) {
          console.error(`❌ Attempt ${attempt + 1}/${retries + 1} failed:`, error.message);
          
          if (attempt === retries) {
            this.metrics.failedRequests++;
            throw error;
          }

          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      throw new Error('All retry attempts failed');
    }
  }

  // Batch Requests
  async batchRequests<T>(
    requests: Array<{ endpoint: string; params: Record<string, any> }>,
    options: { maxConcurrent?: number } = {}
  ): Promise<T[]> {
    const { maxConcurrent = 5 } = options;
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += maxConcurrent) {
      const batch = requests.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(req => 
        this.optimizedFetch<T>(req.endpoint, req.params)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter(Boolean));
    }

    return results;
  }

  // Get Performance Metrics
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      serverHealth: Array.from(this.serverHealth.values())
    };
  }

  // Clear Cache
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  // Health Check All Servers
  async healthCheckAll(servers: Array<{ id: string; baseUrl: string }>): Promise<void> {
    const healthChecks = servers.map(server => 
      this.checkServerHealth(server.id, server.baseUrl)
    );

    await Promise.allSettled(healthChecks);
    console.log('🏥 Health check completed for all servers');
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
