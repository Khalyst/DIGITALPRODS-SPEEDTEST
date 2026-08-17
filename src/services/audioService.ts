// Web Audio API sound effects for realistic tactile Speedtest feedback

class AudioFeedbackService {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private oscNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.ctx && this.ctx.state !== 'closed') {
      this.stopContinuousTone();
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Ignore audio failure
    }
  }

  public playPingChime() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  public playCompleteFanfare() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + index * 0.08);
        osc.stop(this.ctx.currentTime + index * 0.08 + 0.25);
      });
    } catch {}
  }

  public updateSpeedPitch(speedMbps: number, maxSpeed: number = 1000) {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const normalized = Math.min(Math.max(speedMbps / maxSpeed, 0), 1);
      const targetFreq = 180 + normalized * 700; // 180Hz to 880Hz

      if (!this.oscNode) {
        this.oscNode = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();
        this.oscNode.type = 'sine';
        this.oscNode.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(0.015, this.ctx.currentTime);

        this.oscNode.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        this.oscNode.start();
      } else if (this.gainNode) {
        this.oscNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      }
    } catch {}
  }

  public stopContinuousTone() {
    try {
      if (this.oscNode && this.gainNode && this.ctx) {
        this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.03);
        setTimeout(() => {
          try {
            this.oscNode?.stop();
            this.oscNode?.disconnect();
            this.gainNode?.disconnect();
          } catch {}
          this.oscNode = null;
          this.gainNode = null;
        }, 50);
      }
    } catch {}
  }
}

export const soundEffects = new AudioFeedbackService();
