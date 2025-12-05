/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: fundamentalscreeningresults
 * Interface for FundamentalScreeningResults
 */
export interface FundamentalScreeningResults {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  stockName?: string;
  /** @wixFieldType text */
  tickerSymbol?: string;
  /** @wixFieldType number */
  marketCap?: number;
  /** @wixFieldType number */
  peRatio?: number;
  /** @wixFieldType number */
  roe?: number;
  /** @wixFieldType number */
  debtToEquity?: number;
  /** @wixFieldType number */
  currentPrice?: number;
  /** @wixFieldType date */
  dataDate?: Date | string;
  /** @wixFieldType text */
  industry?: string;
}
