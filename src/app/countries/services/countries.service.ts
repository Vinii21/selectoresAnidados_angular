import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country, Region, SmallCountry } from '../interfaces/Country.interface';
import { Observable, of, tap, map, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseURL: string = 'https://restcountries.com/v3.1'

  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Ocenia];

  constructor(
    private http: HttpClient
  ) { }

  get regions():Region[] {
    /* Con esto evitamos que se pueda modificar el arreglo original */
    return [...this._regions]
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if(!region) return  of([]);

    const url = `${this.baseURL}/region/${region}?fields=cca3,name,borders`

    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => {
          return countries.map(country => ({
            name: country.name.common,
            cca3: country.cca3,
            borders: country.borders ?? []
          }))
        }),
        /* tap(res => console.log({res})) */
      )
  }

  getCountryAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseURL}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>(url)
      .pipe(
        map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
  }

  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);

    const contriesRequests: Observable<SmallCountry>[] = [];

    borders.forEach(code=>{
      const request = this.getCountryAlphaCode(code);
      contriesRequests.push(request);
    });

    return combineLatest( contriesRequests);

  }

}
