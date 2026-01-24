/**
 * Core type definitions for Situation Monitor
 *
 * Expanded for comprehensive US politics, legal, immigration, and macro tracking
 */

// News categories - expanded for US-centric political intelligence
export type NewsCategory =
	| 'politics'      // General politics
	| 'uspolitics'    // US-specific political news
	| 'legal'         // Court cases, legal developments
	| 'immigration'   // ICE, border, immigration enforcement
	| 'tech'
	| 'finance'
	| 'gov'           // Government agencies
	| 'ai'
	| 'intel'         // Think tanks, intelligence analysis
	| 'macro';        // Macroeconomic indicators

// News item from RSS feeds
export interface NewsItem {
	id: string;
	title: string;
	link: string;
	source: string;
	category: NewsCategory;
	pubDate: Date;
	description?: string;
	// Analysis metadata
	keywords?: string[];
	regions?: string[];
	sentiment?: 'positive' | 'negative' | 'neutral';
	severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Market data
export interface MarketData {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	high?: number;
	low?: number;
	volume?: number;
	lastUpdated: Date;
	sparkline?: number[];
}

// Crypto data
export interface CryptoData {
	id: string;
	symbol: string;
	name: string;
	price: number;
	change24h: number;
	marketCap: number;
	volume24h: number;
	lastUpdated: Date;
	sparkline?: number[];
}

// Commodity data
export interface CommodityData {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	unit: string;
	lastUpdated: Date;
	sparkline?: number[];
}

// Sector performance for heatmap
export interface SectorPerformance {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
}

// Government contract
export interface GovContract {
	id: string;
	agency: string;
	vendor: string;
	value: number;
	description: string;
	awardDate: Date;
	type: 'contract' | 'grant' | 'modification';
	link?: string;
}

// Layoff announcement
export interface Layoff {
	id: string;
	company: string;
	count: number;
	location?: string;
	sector: string;
	date: Date;
	source: string;
	link?: string;
}

// Polymarket prediction
export interface Prediction {
	id: string;
	question: string;
	probability: number;
	volume: number;
	category: string;
	endDate?: Date;
	lastUpdated: Date;
}

// Correlation between news items
export interface Correlation {
	id: string;
	topic: string;
	items: NewsItem[];
	severity: 'low' | 'medium' | 'high' | 'critical';
	confidence: number;
	detectedAt: Date;
}

// Narrative tracking
export interface Narrative {
	id: string;
	topic: string;
	stage: 'emerging' | 'developing' | 'mainstream' | 'declining';
	mentions: number;
	sources: string[];
	firstSeen: Date;
	lastSeen: Date;
	trajectory: 'rising' | 'stable' | 'falling';
	items: NewsItem[]; // Related news items driving this narrative
}

// Main character (entity prominence)
export interface MainCharacter {
	name: string;
	mentions: number;
	sources: string[];
	sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
	recentHeadlines: string[];
	lastMentioned: Date;
}

// World leader news item
export interface LeaderNews {
	source: string;
	title: string;
	link: string;
	pubDate: string;
}

// World leader
export interface WorldLeader {
	id: string;
	name: string;
	title: string;
	country: string;
	flag: string;
	keywords: string[];
	since: string;
	party: string;
	focus?: string[];
	news?: LeaderNews[];
}

// Intel source
export interface IntelSource {
	name: string;
	url: string;
	type: 'think-tank' | 'defense' | 'regional' | 'osint' | 'govt' | 'cyber';
	topics: string[];
	region?: string;
}

// Alert
export interface Alert {
	id: string;
	type: 'breaking' | 'warning' | 'info';
	title: string;
	message: string;
	source?: string;
	timestamp: Date;
	dismissed: boolean;
}

// Panel configuration
export interface PanelConfig {
	id: string;
	name: string;
	enabled: boolean;
	order: number;
	refreshInterval?: number;
}

// App settings
export interface AppSettings {
	theme: 'dark' | 'light';
	refreshInterval: number;
	autoRefreshEnabled: boolean;
	enableNotifications: boolean;
	enableSounds: boolean;
	panels: PanelConfig[];
	feedCategories: NewsCategory[];
}

// Service health status
export interface ServiceStatus {
	name: string;
	healthy: boolean;
	lastCheck: Date;
	errorCount: number;
	lastError?: string;
}

// Refresh stage for multi-stage loading
export type RefreshStage = 'critical' | 'secondary' | 'tertiary';

export interface RefreshState {
	isRefreshing: boolean;
	currentStage: RefreshStage | null;
	lastRefresh: Date | null;
	errors: string[];
}

// ============================================
// US POLITICS & LEGISLATIVE TRACKING
// ============================================

// Congressional chamber
export type CongressChamber = 'house' | 'senate' | 'joint';

// Bill status
export type BillStatus =
	| 'introduced'
	| 'in_committee'
	| 'passed_house'
	| 'passed_senate'
	| 'passed_both'
	| 'sent_to_president'
	| 'signed'
	| 'vetoed'
	| 'veto_overridden'
	| 'became_law';

// Legislative bill tracking
export interface LegislativeBill {
	id: string;
	number: string; // e.g., "H.R. 1234" or "S. 567"
	title: string;
	shortTitle?: string;
	chamber: CongressChamber;
	status: BillStatus;
	sponsor: string;
	cosponsors: number;
	introducedDate: Date;
	lastActionDate: Date;
	lastAction: string;
	subjects: string[];
	summary?: string;
	link: string;
}

// Congressional vote
export interface CongressionalVote {
	id: string;
	chamber: CongressChamber;
	voteNumber: number;
	question: string;
	result: 'passed' | 'failed' | 'agreed_to' | 'rejected';
	date: Date;
	yeas: number;
	nays: number;
	present: number;
	notVoting: number;
	billId?: string;
	link: string;
}

// Political figure for tracking
export interface PoliticalFigure {
	id: string;
	name: string;
	role: string;
	party?: 'D' | 'R' | 'I' | 'other';
	state?: string;
	chamber?: CongressChamber;
	imageUrl?: string;
	twitterHandle?: string;
	recentNews: NewsItem[];
	mentions: number;
	lastMentioned: Date;
}

// Executive order
export interface ExecutiveOrder {
	id: string;
	number: string; // e.g., "EO 14110"
	title: string;
	president: string;
	signedDate: Date;
	federalRegisterNumber?: string;
	summary?: string;
	subjects: string[];
	link: string;
	status: 'active' | 'revoked' | 'superseded';
}

// ============================================
// COURT CASES & LEGAL TRACKING
// ============================================

// Court level
export type CourtLevel = 'supreme' | 'appellate' | 'district' | 'state_supreme' | 'other';

// Case status
export type CaseStatus =
	| 'pending'
	| 'argued'
	| 'decided'
	| 'remanded'
	| 'dismissed'
	| 'settled'
	| 'cert_granted'
	| 'cert_denied';

// Court case
export interface CourtCase {
	id: string;
	name: string; // e.g., "Trump v. United States"
	docketNumber: string;
	court: string;
	courtLevel: CourtLevel;
	status: CaseStatus;
	filedDate?: Date;
	arguedDate?: Date;
	decidedDate?: Date;
	summary?: string;
	issues: string[];
	parties: {
		petitioner?: string;
		respondent?: string;
		plaintiff?: string;
		defendant?: string;
	};
	significance: 'landmark' | 'major' | 'notable' | 'routine';
	link: string;
	recentDevelopments?: string[];
}

// SCOTUS term
export interface SCOTUSTerm {
	term: string; // e.g., "2024"
	casesGranted: number;
	casesDecided: number;
	casesArgued: number;
	casesPending: number;
}

// ============================================
// IMMIGRATION & ENFORCEMENT
// ============================================

// Immigration enforcement action type
export type EnforcementActionType =
	| 'arrest'
	| 'deportation'
	| 'raid'
	| 'detention'
	| 'border_encounter'
	| 'policy_change';

// Immigration enforcement action
export interface EnforcementAction {
	id: string;
	type: EnforcementActionType;
	title: string;
	description?: string;
	location?: string;
	state?: string;
	date: Date;
	source: string;
	link: string;
	affectedCount?: number;
	agency: 'ICE' | 'CBP' | 'USCIS' | 'DOJ' | 'other';
}

// Border statistics
export interface BorderStatistics {
	month: string;
	year: number;
	encounters: number;
	apprehensions: number;
	expulsions: number;
	gotaways?: number;
	sector?: string;
	source: string;
	lastUpdated: Date;
}

// Immigration policy
export interface ImmigrationPolicy {
	id: string;
	title: string;
	type: 'executive_action' | 'rule' | 'guidance' | 'court_order';
	status: 'active' | 'enjoined' | 'expired' | 'proposed';
	effectiveDate?: Date;
	summary: string;
	affectedPopulation?: string;
	link: string;
}

// ============================================
// MACROECONOMIC INDICATORS (FRED)
// ============================================

// Indicator category
export type IndicatorCategory =
	| 'rates'
	| 'inflation'
	| 'employment'
	| 'growth'
	| 'money'
	| 'housing'
	| 'consumer'
	| 'trade'
	| 'fiscal'
	| 'fed';

// Release frequency
export type ReleaseFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

// Economic indicator
export interface EconomicIndicator {
	id: string;
	seriesId: string; // FRED series ID (e.g., "FEDFUNDS")
	name: string;
	shortName: string;
	category: IndicatorCategory;
	value: number;
	previousValue?: number;
	change?: number;
	changePercent?: number;
	unit: string;
	frequency: ReleaseFrequency;
	lastUpdated: Date;
	nextRelease?: Date;
	description?: string;
	source: string;
}

// Economic release/announcement
export interface EconomicRelease {
	id: string;
	name: string;
	indicator: string;
	releaseDate: Date;
	releaseTime?: string;
	actualValue?: number;
	forecastValue?: number;
	previousValue?: number;
	importance: 'high' | 'medium' | 'low';
	source: string;
}

// Treasury yield curve point
export interface YieldCurvePoint {
	maturity: string; // e.g., "3M", "2Y", "10Y"
	rate: number;
	change: number;
	date: Date;
}

// Fed balance sheet
export interface FedBalanceSheet {
	date: Date;
	totalAssets: number;
	treasuries: number;
	mbs: number;
	reserves: number;
	weeklyChange: number;
}

// FOMC meeting
export interface FOMCMeeting {
	date: Date;
	type: 'scheduled' | 'unscheduled';
	decision?: 'hike' | 'cut' | 'hold';
	rateChange?: number;
	newRate?: number;
	statement?: string;
	projections?: boolean;
	pressConference: boolean;
}

// ============================================
// ENHANCED ANALYSIS
// ============================================

// Entity type for tracking
export type EntityType =
	| 'person'
	| 'organization'
	| 'country'
	| 'bill'
	| 'case'
	| 'indicator';

// Enhanced entity with Wikipedia context
export interface TrackedEntity {
	id: string;
	name: string;
	type: EntityType;
	aliases?: string[];
	description?: string;
	wikipediaUrl?: string;
	wikipediaSummary?: string;
	mentions: number;
	sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
	recentNews: NewsItem[];
	relatedEntities?: string[];
	lastMentioned: Date;
	firstSeen: Date;
}

// ============================================
// DYNAMIC MAP MARKERS
// ============================================

// Dynamic marker source type
export type DynamicMarkerSource = 'news' | 'gdelt' | 'custom';

// Dynamic marker for news-driven map visualization
export interface DynamicMarker {
	id: string;
	name: string;
	lat: number;
	lon: number;
	type: DynamicMarkerSource;
	severity: 'low' | 'medium' | 'high' | 'critical';
	count: number; // Number of mentions/events
	lastSeen: Date;
	items: NewsItem[]; // Related news for drill-down
}
