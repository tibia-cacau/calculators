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
	private readonly REFERENCE_QUANTITY = 50;
	private cachedPrice: number | null = null;
	private cacheTimestamp: number = 0;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

	constructor(private http: HttpClient) {}

	getPrice(quantity: number): Observable<TibiaCoinPrice | null> {
		return this.http
			.get<TibiaCoinPrice>(`${this.apiUrl}?quantity=${quantity}`)
			.pipe(
				map((response) => {
					// Fallback: se priceNumeric não vier, fazer parse do campo price
					if (
						response &&
						(!response.priceNumeric ||
							response.priceNumeric === 0) &&
						response.price
					) {
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

	/**
	 * Busca o preço de 50 TC e usa cache se disponível
	 */
	getReferencePrice(): Observable<number | null> {
		const now = Date.now();

		// Verifica se o cache é válido
		if (
			this.cachedPrice !== null &&
			now - this.cacheTimestamp < this.CACHE_DURATION
		) {
			return of(this.cachedPrice);
		}

		// Busca novo preço de 25 TC
		return this.getPrice(this.REFERENCE_QUANTITY).pipe(
			map((response) => {
				if (response && response.priceNumeric) {
					this.cachedPrice = response.priceNumeric;
					this.cacheTimestamp = now;
					return this.cachedPrice;
				}
				return null;
			})
		);
	}

	/**
	 * Calcula o preço para qualquer quantidade usando regra de três
	 */
	calculatePriceForQuantity(tcAmount: number): Observable<number | null> {
		return this.getReferencePrice().pipe(
			map((referencePrice) => {
				if (referencePrice === null) {
					return null;
				}
				// Regra de três: (tcAmount / 50) * preço_de_50_TC
				return (tcAmount / this.REFERENCE_QUANTITY) * referencePrice;
			})
		);
	}

	calculateTotalPrice(tcAmount: number): Observable<number | null> {
		return this.calculatePriceForQuantity(tcAmount);
	}
}
