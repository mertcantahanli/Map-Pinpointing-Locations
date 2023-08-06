import { Injectable } from '@angular/core';
import { Location } from '../models/location.model';
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly storageKey = 'locations';

  constructor() { }

  getLocations(): Location[] {
    const locationsStr = localStorage.getItem(this.storageKey);
    return locationsStr ? JSON.parse(locationsStr) : [];
  }
  getStoredLocations(): Location[] {
    return this.getLocations();
  }
  saveLocation(location: Location): void {
    const locations = this.getLocations();
    locations.push(location);
    localStorage.setItem(this.storageKey, JSON.stringify(locations));
  }

  deleteLocation(locationId: number): void {
    const locations = this.getLocations();
    const updatedLocations = locations.filter((location) => location.id !== locationId);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedLocations));
  }
  deleteLocationById(locationId: number): void {
    const locations = this.getLocations();
    const updatedLocations = locations.filter((location) => location.id !== locationId);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedLocations));
  }
}
