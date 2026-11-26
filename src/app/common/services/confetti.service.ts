import confetti from 'canvas-confetti';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  public canon(x: number = 0, y: number = 0, angle = 210): void {
    confetti({
      angle: angle,
      spread: 80,
      particleCount: 100,
      origin: {y: y, x: x},
    });
  }
}
