import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface TibiaCoinPrice {
	price: string;
	quantity: number;
	priceNumeric: number;
	total: number;
}

@Injectable({
	providedIn: 'root',
})
export class TibiaCoinPriceService {
	private apiUrl = 'http://www.tibiacacau.com.br/api/tibia-coins/price';

	constructor(private http: HttpClient) {}

	getPrice(quantity: number): Observable<TibiaCoinPrice | null> {
		return this.http
			.get<TibiaCoinPrice>(`${this.apiUrl}?quantity=${quantity}`)
			.pipe(
				map((response) => {
					// Fallback: se priceNumeric não vier, fazer parse do campo price
					if (response && (!response.priceNumeric || response.priceNumeric === 0) && response.price) {
						// Remove "R$", troca vírgula por ponto e remove pontos de milhar
						const priceStr = response.price
							.replace('R$', '')
							.replace(/\./g, '') // Remove separadores de milhar
							.replace(',', '.') // Troca vírgula decimal por ponto
							.trim();
						response.priceNumeric = parseFloat(priceStr);
					}
					return response;
				}),
				catchError((error) => {
					console.error(
						'Erro ao buscar preço dos Tibia Coins:',
						error
					);
					return of(null);
				})
			);
	}

	calculateTotalPrice(tcAmount: number): Observable<number | null> {
		return this.getPrice(tcAmount).pipe(
			map((response) => (response ? response.total : null))
		);
	}
}
