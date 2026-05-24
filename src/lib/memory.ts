export interface Memory {
  userName: string;
  relationshipLevel: number; // 0 to 100
  memories: { id: string; date: Date; topic: string; emotionalWeight: number }[];
  preferences: Record<string, any>;
  totalMessages: number;
}

const STORAGE_KEY = 'zoya_memory_v1';

export const MemoryEngine = {
  load(): Memory {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          memories: parsed.memories.map((m: any) => ({ ...m, date: new Date(m.date) }))
        };
      } catch (e) {
        console.error("Memory corruption", e);
      }
    }
    return {
      userName: 'User',
      relationshipLevel: 10,
      memories: [],
      preferences: {},
      totalMessages: 0
    };
  },

  save(memory: Memory) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  },

  addMemory(topic: string, weight: number) {
    const memory = this.load();
    const newMemory = {
      id: Math.random().toString(36).substring(7),
      date: new Date(),
      topic,
      emotionalWeight: weight
    };
    memory.memories.push(newMemory);
    memory.relationshipLevel = Math.min(100, memory.relationshipLevel + (weight / 5));
    this.save(memory);
  },

  incrementMessages() {
    const memory = this.load();
    memory.totalMessages += 1;
    this.save(memory);
  },

  setUserName(name: string) {
    const memory = this.load();
    memory.userName = name;
    this.save(memory);
  }
};
