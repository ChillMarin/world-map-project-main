import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'world-map-project';
  hoveredCountryName: string | null = null;
  countryInfo: any | null = null;

  constructor(private http: HttpClient) {}

  @ViewChild('worldMap', { static: false }) worldMap!: ElementRef<SVGSVGElement>;

  ngAfterViewInit() {
    this.addEventListenersToPaths();
  }

  addEventListenersToPaths() {
    const svgElement = this.worldMap.nativeElement;
    const pathElements = svgElement.querySelectorAll('path');
    pathElements.forEach((path) => {
      const pathId = path.getAttribute('id');

      // Omitir si no tiene un id válido
      if (!pathId || pathId === 'null') {
        return;
      }

      path.addEventListener('mouseover', (event) => this.onMouseOver(event));
      path.addEventListener('mouseout', (event) => this.onMouseOut(event));
      path.addEventListener('click', (event) => this.onClick(event));
    });
  }

  onMouseOver(event: MouseEvent) {
    const target = event.target as SVGPathElement;
    const pathId = target.getAttribute('id');

    // Petición a la API del World Bank con el ID (ISO2)
    this.http.get<any[]>(`https://api.worldbank.org/V2/country/${pathId}?format=json`)
      .subscribe(
        (response) => {
          if (response.length > 1 && response[1].length > 0) {
            const countryName = response[1][0].name;
            this.hoveredCountryName = countryName;
          } else {
            this.hoveredCountryName = null;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.hoveredCountryName = null;
        }
      );
  }

  onMouseOut(event: MouseEvent) {
    this.hoveredCountryName = null;
  }

  onClick(event: MouseEvent) {
    const target = event.target as SVGPathElement;
    const pathId = target.getAttribute('id');

    if (!pathId || pathId === 'null') {
      console.log('Path ID is null, skipping API call.');
      return;
    }

    console.log(pathId + ' clicked');

    this.http.get<any[]>(`https://api.worldbank.org/V2/country/${pathId}?format=json`)
      .subscribe(
        (response) => {
          if (response.length > 1 && response[1].length > 0) {
            this.countryInfo = response[1][0];
          } else {
            this.countryInfo = null;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }
}
