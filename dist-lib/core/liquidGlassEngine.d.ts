export interface GlassMapParams {
    width: number;
    height: number;
    radius: number;
    bezelWidth: number;
    ior?: number;
    refractionStrength?: number;
}
export interface GeneratedGlassMaps {
    displacementUrl: string;
    maxScale: number;
    width: number;
    height: number;
}
/**
 * Generates a lightweight 2D RG displacement map (sRGB, 128 = neutral) for an arbitrary
 * rounded-rectangle Liquid Glass element.
 */
export declare function generateLiquidGlassMaps(params: GlassMapParams): GeneratedGlassMaps;
export declare function supportsSvgBackdropFilter(): boolean;
