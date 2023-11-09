import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  constructor() {}

  public canon(x: number = 0, y: number = 0, angle = 210): void {
    confetti({
      angle: angle,
      spread: 80,
      particleCount: 100,
      origin: { y: y, x: x },
    });
  }
}
