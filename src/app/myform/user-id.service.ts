import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserIdMockService {
  getUserId() {
    return 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  }
}
