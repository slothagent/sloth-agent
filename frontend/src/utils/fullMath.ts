/**
 * Contains 512-bit math functions
 * Facilitates multiplication and division that can have overflow of an intermediate value without any loss of precision
 */
export class FullMath {
    /**
     * Calculates floor(a×b÷denominator) with full precision
     * @param a The multiplicand
     * @param b The multiplier
     * @param denominator The divisor
     * @returns The result
     * @throws If result overflows or denominator == 0
     */
    public static mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
        if (denominator <= 0n) {
            throw new Error("FullMath: DIVISION_BY_ZERO");
        }

        // First handle the case where the result won't overflow 256 bits
        const product = a * b;
        if (product / a === b) {
            // No overflow occurred in multiplication
            return product / denominator;
        }

        // At this point, we know the raw multiplication overflowed
        // We need to implement the more complex logic similar to the Solidity version
        
        // Calculate the high and low bits of the product using modular arithmetic
        const MAX_UINT256 = 2n ** 256n - 1n;
        const prod0 = a * b; // Low bits
        const mm = (a * b) % (MAX_UINT256 + 1n);
        let prod1 = (mm - prod0 - (mm < prod0 ? 1n : 0n)) & MAX_UINT256; // High bits

        if (prod1 === 0n) {
            return prod0 / denominator;
        }

        if (denominator <= prod1) {
            throw new Error("FullMath: OVERFLOW");
        }

        // Handle the more complex case where we need to use the full 512-bit computation
        const remainder = (a * b) % denominator;
        prod1 = prod1 - (remainder > prod0 ? 1n : 0n);
        const prod0Adjusted = prod0 - remainder;

        // Find the highest power of 2 divisor of denominator
        let twos = denominator & (-denominator);
        const denominatorAdjusted = denominator / twos;

        const prod0Final = prod0Adjusted / twos;
        const twosCompliment = (-twos / twos) + 1n;
        const prod0Combined = prod0Final | (prod1 * twosCompliment);

        // Compute the inverse using Newton's method
        let inv = (3n * denominatorAdjusted) ^ 2n;
        inv = inv * (2n - denominatorAdjusted * inv);
        inv = inv * (2n - denominatorAdjusted * inv);
        inv = inv * (2n - denominatorAdjusted * inv);
        inv = inv * (2n - denominatorAdjusted * inv);
        inv = inv * (2n - denominatorAdjusted * inv);
        inv = inv * (2n - denominatorAdjusted * inv);

        const result = prod0Combined * inv;
        return result;
    }

    /**
     * Calculates ceil(a×b÷denominator) with full precision
     * @param a The multiplicand
     * @param b The multiplier
     * @param denominator The divisor
     * @returns The result
     * @throws If result overflows or denominator == 0
     */
    public static mulDivRoundingUp(a: bigint, b: bigint, denominator: bigint): bigint {
        const result = FullMath.mulDiv(a, b, denominator);
        if ((a * b) % denominator > 0n) {
            if (result + 1n <= result) {
                throw new Error("FullMath: OVERFLOW");
            }
            return result + 1n;
        }
        return result;
    }
} 