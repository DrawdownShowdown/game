class AudioManager {
  private volume: number = 0.5;
  private enabled: boolean = true;
  private bankruptcyEnabled: boolean = true;
  private streakRecordEnabled: boolean = true;
  private isLoaded: boolean = false;
  private loadError: boolean = false;
  private loadedFiles: Set<string> = new Set();
  private activePlaybacks: Set<HTMLAudioElement> = new Set();
  private audioPool: Map<string, HTMLAudioElement[]> = new Map();

  constructor() {
    const sounds = {
      bankruptcy: '/bankruptcy.mp3',
      streakRecord: '/streak-record.mp3',
      victory: '/victory.mp3'
    };

    Object.entries(sounds).forEach(([key, path]) => {
      const pool = Array.from({ length: 3 }, () => {
        const audio = new Audio(path);
        audio.addEventListener('canplaythrough', () => {
          this.loadedFiles.add(path);
          this.checkLoaded();
        });
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load audio file ${path}. Audio features may be limited.`);
          this.loadError = true;
          this.checkLoaded();
        });
        audio.load();
        return audio;
      });
      this.audioPool.set(key, pool);
    });
  }

  private checkLoaded(): void {
    if (this.loadedFiles.size === 3 || (this.loadedFiles.size + (this.loadError ? 1 : 0) === 3)) {
      this.isLoaded = true;
    }
  }

  private getFromPool(key: string): HTMLAudioElement | null {
    const pool = this.audioPool.get(key);
    if (!pool) return null;

    const available = pool.find(audio => audio.paused);
    if (available) {
      available.volume = this.volume;
      return available;
    }

    return pool.reduce((closest, current) => {
      if (!closest || current.currentTime > closest.currentTime) {
        return current;
      }
      return closest;
    }, null as HTMLAudioElement | null);
  }

  public ready(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      if (this.isLoaded) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (this.isLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  updateSettings(settings: { 
    volume: number; 
    bankruptcy: boolean; 
    streakRecord: boolean;
  }): void {
    this.volume = settings.volume;
    this.bankruptcyEnabled = settings.bankruptcy;
    this.streakRecordEnabled = settings.streakRecord;

    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.volume;
      });
    });
  }

  private async playSound(key: string): Promise<void> {
    if (!this.enabled || !this.isLoaded) return;

    const audio = this.getFromPool(key);
    if (!audio) return;

    try {
      this.activePlaybacks.add(audio);
      
      if (!audio.paused) {
        audio.currentTime = 0;
      }
      
      if (audio.readyState === 0) {
        console.warn(`Audio file ${key} not loaded yet`);
        return;
      }
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        audio.addEventListener('ended', () => {
          this.activePlaybacks.delete(audio);
        }, { once: true });
      }
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        console.warn('Audio playback failed:', error);
      }
      this.activePlaybacks.delete(audio);
    }
  }

  playBankruptcy(): void {
    if (this.bankruptcyEnabled) {
      this.playSound('bankruptcy');
    }
  }

  playStreakRecord(): void {
    if (this.streakRecordEnabled) {
      this.playSound('streakRecord');
    }
  }

  playVictory(): void {
    this.playSound('victory');
  }

  async disable(): Promise<void> {
    this.enabled = false;
    
    const stopPromises = Array.from(this.activePlaybacks).map(audio => {
      return new Promise<void>(resolve => {
        const handleEnd = () => {
          audio.removeEventListener('ended', handleEnd);
          this.activePlaybacks.delete(audio);
          resolve();
        };
        
        if (audio.paused) {
          handleEnd();
        } else {
          audio.addEventListener('ended', handleEnd);
          audio.pause();
          audio.currentTime = 0;
        }
      });
    });

    await Promise.all(stopPromises);
  }

  enable(): void {
    this.enabled = true;
  }

  dispose(): void {
    this.disable();
    this.audioPool.forEach(pool => {
      pool.forEach(audio => {
        audio.src = '';
        audio.load();
      });
    });
    this.audioPool.clear();
    this.activePlaybacks.clear();
  }
}

export const audioManager = new AudioManager();