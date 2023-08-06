import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { Location } from '../models/location.model';
import {MapService} from "../services/map.service";
import {LocalStorageService} from "../services/local-storage.service";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  private markerLayer: L.LayerGroup = L.layerGroup();
  public locations: Location[] = [];

  constructor(private http: HttpClient,
              private mapservice:MapService,
              private localStorageService:LocalStorageService) { }

  ngOnInit(): void {
    this.initMap();
    this.fetchLocations();

  }

  private initMap(): void {
    this.map = L.map('map').setView([37.05612, 29.10999], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    this.markerLayer.addTo(this.map);
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      this.addMarker(center.lat, center.lng);
    });
  }

  private addMarker(lat: number, lng: number): void {
    const marker = L.marker([lat, lng]);
    this.markerLayer.clearLayers();
    this.markerLayer.addLayer(marker);
  }

  private fetchLocations(): void {

    this.mapservice.getLocations().subscribe(
      (data) => {
        this.locations = data;
        this.locations = this.localStorageService.getStoredLocations();
        this.displayLocationsList();

      },
      (error) => {
        console.error('Error fetching locations:', error);
        this.locations = this.localStorageService.getStoredLocations();
        this.displayLocationsList();
      }
    );

  }

  public displayLocationsList(): void {
    const listContainer = document.getElementById('locations-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    this.locations.forEach((location) => {
      const listItem = document.createElement('div');
      listItem.style.borderBottom="2px solid black"
      listItem.style.marginBottom="20px"
      listItem.style.textAlign="left"
      listItem.style.cursor="pointer"
      listItem.textContent = `Lat: ${location.lat}, Lng: ${location.lng}, Date: ${location.datetime}`;
      listItem.addEventListener('click', () => this.onListItemClick(location));

      const deleteButton = document.createElement('button');
      deleteButton.style.background="#e53935"
      deleteButton.style.border="none"
      deleteButton.style.width="50px"
      deleteButton.style.height="30px"
      deleteButton.style.color="white"
      deleteButton.style.cursor="pointer"
      deleteButton.textContent = 'Sil';
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Click olayının haritaya yayılmasını engelliyoruz
        this.deleteLocation(location.id);
      });

      listItem.appendChild(deleteButton);
      listContainer.appendChild(listItem);
    });
  }

  public onListItemClick(location: Location): void {
    this.addMarker(location.lat, location.lng);
    this.map.setView([location.lat, location.lng], 13); // Tıklanan konumu merkeze al ve zoom yap
  }

  public deleteLocation(locationId: number): void {
    this.mapservice.deleteLocationById(locationId).subscribe(
      () => {
        this.locations = this.locations.filter((location) => location.id !== locationId);
        this.displayLocationsList();
        this.localStorageService.deleteLocation(locationId);
      },
      (error) => {
        window.location.reload();
        console.error('Error deleting location:', error);
      }
    );
    this.localStorageService.deleteLocationById(locationId);
  }

  saveLocation(): void {
    const center = this.map.getCenter();
    const location: Location = {
      id: this.locations.length > 0 ? this.locations[this.locations.length - 1].id + 1 : 0,
      lat: center.lat,
      lng: center.lng,
      datetime: new Date().toISOString()
    };


    this.http.post<Location>('http://localhost:8080/api/locations', location).subscribe(
      (savedLocation) => {
        this.locations.push(savedLocation);
        this.displayLocationsList();
        this.localStorageService.saveLocation(savedLocation);
      },
      (error) => {
        console.error('Error saving location:', error);

        this.localStorageService.saveLocation(location);
        this.displayLocationsList();
        window.location.reload();
      }
    );
  }

  downloadLocations(): void {
    const dataStr = JSON.stringify(this.locations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'locations.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
