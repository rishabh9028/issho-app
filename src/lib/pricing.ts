/**
 * Pricing Utility for Issho
 * 
 * Rules:
 * 1. Host Base: Base hourly rate set by host.
 * 2. Host gets: Base + 5% GST (from guest).
 * 3. Platform from Host: 10% commission on Base + 18% GST (on commission).
 * 4. Platform from Guest: 5% commission on Base (max 500 INR).
 */

export interface PricingBreakdown {
    basePrice: number;
    guestServiceFee: number;
    hostGstAmount: number;
    totalGuestPrice: number;
    platformCommissionFromHost: number;
    platformGstOnCommission: number;
    hostPayoutAmount: number;
    platformNetEarnings: number;
}

export const calculatePricing = (basePrice: number): PricingBreakdown => {
    // 1. Guest Service Fee (5% of base, max 500)
    const guestServiceFee = Math.min(500, basePrice * 0.05);

    // 2. Host GST (5% of base, collected from guest)
    const hostGstAmount = basePrice * 0.05;

    // 3. Total Guest Pays
    const totalGuestPrice = basePrice + guestServiceFee + hostGstAmount;

    // 4. Platform Commission from Host (10% of base)
    const platformCommissionFromHost = basePrice * 0.10;

    // 5. Platform GST on Commission (18% of platform commission)
    const platformGstOnCommission = platformCommissionFromHost * 0.18;

    // 6. Host Payout
    // Host gets (Base + HostGST) - (PlatformCommission + GSTonCommission)
    const hostGross = basePrice + hostGstAmount;
    const platformDeduction = platformCommissionFromHost + platformGstOnCommission;
    const hostPayoutAmount = hostGross - platformDeduction;

    // 7. Platform Net Earnings
    // Platform gets (Guest Fee) + (Host Commission)
    const platformNetEarnings = guestServiceFee + platformCommissionFromHost;

    return {
        basePrice,
        guestServiceFee,
        hostGstAmount,
        totalGuestPrice,
        platformCommissionFromHost,
        platformGstOnCommission,
        hostPayoutAmount,
        platformNetEarnings
    };
};
