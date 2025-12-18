export interface TireSize {
    width: number;
    aspectRatio: number;
    rimDiameter: number;
}

export interface TireRecommendation {
    size: string;
    width: number;
    aspectRatio: number;
    rimDiameter: number;
    overallDiameter: number;
    diameterDiff: number;
    type: string;
    typeId: string;
    pros: string[];
    cons: string[];
    safetyLevel: 'safe' | 'moderate' | 'caution';
}

export interface DrivingCondition {
    id: string;
    label: string;
    icon: string;
}

export const drivingConditions: DrivingCondition[] = [
    { id: 'city', label: 'Kota', icon: '🏙️' },
    { id: 'highway', label: 'Jalan Tol', icon: '🛣️' },
    { id: 'offroad', label: 'Off-road Ringan', icon: '🏔️' },
    { id: 'rain', label: 'Cuaca Hujan Sering', icon: '🌧️' },
    { id: 'sporty', label: 'Performa Sporty', icon: '🏎️' },
];

export const tireTypes = {
    'all-season': {
        name: 'All-Season',
        description: 'Cocok untuk berbagai kondisi cuaca',
        conditions: ['city', 'highway', 'rain'],
    },
    'performance': {
        name: 'Performance Summer',
        description: 'Grip maksimal untuk berkendara sporty',
        conditions: ['sporty', 'highway'],
    },
    'touring': {
        name: 'Touring Comfort',
        description: 'Kenyamanan tinggi untuk perjalanan jauh',
        conditions: ['city', 'highway'],
    },
    'all-terrain': {
        name: 'All-Terrain',
        description: 'Siap untuk jalan off-road ringan',
        conditions: ['offroad', 'city'],
    },
    'rain': {
        name: 'Wet Performance',
        description: 'Optimal untuk kondisi hujan',
        conditions: ['rain', 'city', 'highway'],
    },
};

export function parseTireSize(sizeString: string): TireSize | null {
    const regex = /^(\d{3})\/(\d{2})R(\d{2})$/i;
    const match = sizeString.trim().toUpperCase().match(regex);

    if (!match) return null;

    return {
        width: parseInt(match[1]),
        aspectRatio: parseInt(match[2]),
        rimDiameter: parseInt(match[3]),
    };
}

export function formatTireSize(tire: TireSize): string {
    return `${tire.width}/${tire.aspectRatio}R${tire.rimDiameter}`;
}

export function calculateOverallDiameter(tire: TireSize): number {
    const rimDiameterMm = tire.rimDiameter * 25.4;
    const sidewallHeight = tire.width * (tire.aspectRatio / 100);
    return rimDiameterMm + (2 * sidewallHeight);
}

export function calculateDiameterDifference(original: number, newDiameter: number): number {
    return ((newDiameter - original) / original) * 100;
}

function determineTireType(conditions: string[]): { type: string; typeId: string } {
    if (conditions.includes('sporty')) {
        return { type: 'Performance Summer', typeId: 'performance' };
    }
    if (conditions.includes('offroad')) {
        return { type: 'All-Terrain', typeId: 'all-terrain' };
    }
    if (conditions.includes('rain')) {
        return { type: 'Wet Performance', typeId: 'rain' };
    }
    if (conditions.includes('highway')) {
        return { type: 'Touring Comfort', typeId: 'touring' };
    }
    return { type: 'All-Season', typeId: 'all-season' };
}

function getSafetyLevel(diameterDiff: number): 'safe' | 'moderate' | 'caution' {
    const absDiff = Math.abs(diameterDiff);
    if (absDiff <= 1.0) return 'safe';      // Stricter for same-rim upgrades
    if (absDiff <= 2.0) return 'moderate';  // Within acceptable range
    return 'caution';
}

function getProsCons(
    original: TireSize,
    recommendation: TireSize,
    typeId: string,
    diameterDiff: number
): { pros: string[]; cons: string[] } {
    const pros: string[] = [];
    const cons: string[] = [];

    const widthDiff = recommendation.width - original.width;
    const aspectDiff = recommendation.aspectRatio - original.aspectRatio;
    const rimDiff = recommendation.rimDiameter - original.rimDiameter;

    if (widthDiff > 0) {
        pros.push(`Grip lebih luas (+${widthDiff}mm)`);
        cons.push('Konsumsi BBM sedikit naik');
    }

    // Rim size doesn't change in same-rim upgrades
    // Removed rim-related pros/cons

    if (aspectDiff < 0) {
        pros.push('Handling lebih responsif');
        cons.push('Penyerapan guncangan berkurang');
    }

    if (typeId === 'performance') {
        pros.push('Performa pengereman optimal');
        cons.push('Tidak ideal untuk cuaca hujan');
    }

    if (typeId === 'all-terrain') {
        pros.push('Traksi bagus di berbagai medan');
        cons.push('Road noise lebih tinggi');
    }

    if (typeId === 'rain') {
        pros.push('Aquaplaning resistance tinggi');
        pros.push('Keamanan saat hujan maksimal');
    }

    if (Math.abs(diameterDiff) <= 1) {
        pros.push('Speedometer tetap akurat');
    }

    return { pros: pros.slice(0, 3), cons: cons.slice(0, 2) };
}

/**
 * Generate tire upgrade recommendations using industry-standard formulas.
 * Only generates same-rim upgrades to maintain compatibility with existing wheels.
 * 
 * Formula References:
 * - Overall Diameter: OD = (2 × Width × AspectRatio / 2540) + RimDiameter (inches)
 * - Safe diameter tolerance: ±3% (industry standard)
 * - Speedometer accuracy: ±1% for minimal impact
 * 
 * Sources:
 * - https://www.tiresize.com/calculator/
 * - https://www.calculator.net/tire-size-calculator.html
 * - Indonesian standards: https://dunlop.co.id (±1-3% diameter tolerance)
 */
export function generateRecommendations(
    originalSize: TireSize,
    conditions: string[]
): TireRecommendation[] {
    const originalDiameter = calculateOverallDiameter(originalSize);
    const { type, typeId } = determineTireType(conditions);

    // Same-rim upgrade patterns only (no plus-sizing)
    const upgrades: TireSize[] = [
        // Pattern 1: Wider tire, same aspect ratio
        {
            width: originalSize.width + 10,
            aspectRatio: originalSize.aspectRatio,
            rimDiameter: originalSize.rimDiameter
        },
        // Pattern 2: Wider tire, lower profile (compensate for width increase)
        {
            width: originalSize.width + 10,
            aspectRatio: originalSize.aspectRatio - 5,
            rimDiameter: originalSize.rimDiameter
        },
        // Pattern 3: Slightly wider, same profile
        {
            width: originalSize.width + 5,
            aspectRatio: originalSize.aspectRatio,
            rimDiameter: originalSize.rimDiameter
        },
        // Pattern 4: Much wider, compensated profile
        {
            width: originalSize.width + 20,
            aspectRatio: originalSize.aspectRatio - 5,
            rimDiameter: originalSize.rimDiameter
        },
        // Pattern 5: Moderate width increase, profile reduction
        {
            width: originalSize.width + 15,
            aspectRatio: originalSize.aspectRatio - 5,
            rimDiameter: originalSize.rimDiameter
        },
        // Pattern 6: Conservative upgrade
        {
            width: originalSize.width + 5,
            aspectRatio: originalSize.aspectRatio - 5,
            rimDiameter: originalSize.rimDiameter
        },
    ];

    const recommendations: TireRecommendation[] = [];

    for (const upgrade of upgrades) {
        // Validate reasonable ranges
        if (upgrade.width < 155 || upgrade.width > 335) continue;
        if (upgrade.aspectRatio < 25 || upgrade.aspectRatio > 80) continue;
        if (upgrade.rimDiameter < 14 || upgrade.rimDiameter > 22) continue;

        const newDiameter = calculateOverallDiameter(upgrade);
        const diameterDiff = calculateDiameterDifference(originalDiameter, newDiameter);

        // Industry standard: ±3% diameter tolerance for same-rim upgrades
        if (Math.abs(diameterDiff) <= 3.0) {
            const { pros, cons } = getProsCons(originalSize, upgrade, typeId, diameterDiff);

            recommendations.push({
                size: formatTireSize(upgrade),
                width: upgrade.width,
                aspectRatio: upgrade.aspectRatio,
                rimDiameter: upgrade.rimDiameter,
                overallDiameter: newDiameter,
                diameterDiff: Math.round(diameterDiff * 100) / 100,
                type,
                typeId,
                pros,
                cons,
                safetyLevel: getSafetyLevel(diameterDiff),
            });
        }
    }

    // Sort by safety level and diameter difference
    return recommendations
        .sort((a, b) => {
            const safetyOrder = { safe: 0, moderate: 1, caution: 2 };
            if (safetyOrder[a.safetyLevel] !== safetyOrder[b.safetyLevel]) {
                return safetyOrder[a.safetyLevel] - safetyOrder[b.safetyLevel];
            }
            return Math.abs(a.diameterDiff) - Math.abs(b.diameterDiff);
        })
        .slice(0, 6);
}

export function getSpeedometerImpact(diameterDiff: number): string {
    const speedError = Math.abs(diameterDiff);
    if (speedError < 0.5) return 'Tidak ada dampak';
    if (speedError < 1) return 'Minimal (~1 km/jam di 100 km/jam)';
    if (speedError < 2) return `~${Math.round(speedError)} km/jam di 100 km/jam`;
    return `~${Math.round(speedError * 1.5)} km/jam di 100 km/jam`;
}
