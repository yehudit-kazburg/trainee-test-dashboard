import { Injectable } from '@angular/core';

export interface PageState {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class StateManagementService {
  private pageStates = new Map<string, PageState>();

  savePageState(pageName: string, state: PageState): void {
    this.pageStates.set(pageName, { ...state });
  }

  getPageState(pageName: string): PageState | null {
    return this.pageStates.get(pageName) || null;
  }

  clearPageState(pageName: string): void {
    this.pageStates.delete(pageName);
  }

  clearAllStates(): void {
    this.pageStates.clear();
  }
}