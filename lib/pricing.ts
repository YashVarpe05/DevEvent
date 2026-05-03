export interface LineItemForPricing {
	ticketTypeId: string;
	quantity: number;
	unitPrice: number;
}

export type OrganizerPlan = "free" | "pro";

export interface PricingBreakdown {
	currency: string;
	subtotal: number;
	platformFeeRate: number;
	platformFeeFixed: number;
	platformFeeAmount: number;
	processorFeeEstimate: number;
	discountAmount: number;
	totalBuyerPayable: number;
	organizerNetEstimate: number;
}

const defaultConfig = {
	freeRate: Number(process.env.PLATFORM_FEE_RATE_FREE ?? "0.05"),
	proRate: Number(process.env.PLATFORM_FEE_RATE_PRO ?? "0.02"),
	freeFixed: Number(process.env.PLATFORM_FEE_FIXED_FREE_MINOR ?? "50"),
	proFixed: Number(process.env.PLATFORM_FEE_FIXED_PRO_MINOR ?? "0"),
	processorRate: Number(process.env.PROCESSOR_FEE_ESTIMATE_RATE ?? "0.029"),
	processorFixed: Number(
		process.env.PROCESSOR_FEE_ESTIMATE_FIXED_MINOR ?? "30",
	),
};

function roundMinorUnits(value: number): number {
	return Math.round(value);
}

function getPlatformFeeRule(plan: OrganizerPlan) {
	if (plan === "pro") {
		return {
			rate: defaultConfig.proRate,
			fixed: defaultConfig.proFixed,
		};
	}

	return {
		rate: defaultConfig.freeRate,
		fixed: defaultConfig.freeFixed,
	};
}

export function calculatePricing(params: {
	lineItems: LineItemForPricing[];
	currency: string;
	organizerPlan?: OrganizerPlan;
	eventId?: string;
	discount?: {
		type: "percentage" | "fixed";
		value: number; // For percentage, e.g. 10 = 10%. For fixed, e.g. 500 = $5.00
	};
}): PricingBreakdown {
	const { lineItems, currency, organizerPlan = "free", discount } = params;

	if (!lineItems.length) {
		throw new Error("At least one line item is required for pricing");
	}

	const subtotal = lineItems.reduce((acc, item) => {
		if (item.quantity <= 0) {
			throw new Error("Invalid line item quantity");
		}
		if (item.unitPrice < 0) {
			throw new Error("Invalid line item unitPrice");
		}
		return acc + item.quantity * item.unitPrice;
	}, 0);

	let discountAmount = 0;
	if (discount) {
		if (discount.type === "percentage") {
			discountAmount = roundMinorUnits(subtotal * (discount.value / 100));
		} else {
			discountAmount = discount.value;
		}
	}
	discountAmount = Math.min(discountAmount, subtotal);

	const discountedSubtotal = Math.max(0, subtotal - discountAmount);

	const platformRule = getPlatformFeeRule(organizerPlan);
	const variableFee = roundMinorUnits(discountedSubtotal * platformRule.rate);
	
	// If the order is completely free after discount, we waive the fixed fee as well.
	const platformFeeAmount = discountedSubtotal > 0 
		? Math.max(0, variableFee + platformRule.fixed)
		: 0;

	const totalBuyerPayable = discountedSubtotal + platformFeeAmount;

	const processorFeeEstimate = totalBuyerPayable > 0
		? roundMinorUnits(totalBuyerPayable * defaultConfig.processorRate) + defaultConfig.processorFixed
		: 0;
		
	const organizerNetEstimate = Math.max(0, discountedSubtotal - processorFeeEstimate);

	return {
		currency: currency.toLowerCase(),
		subtotal,
		platformFeeRate: platformRule.rate,
		platformFeeFixed: platformRule.fixed,
		platformFeeAmount,
		processorFeeEstimate,
		discountAmount,
		totalBuyerPayable,
		organizerNetEstimate,
	};
}

export interface PricingItem {
	ticketType: {
		_id: { toString(): string };
		price: number;
	};
	quantity: number;
}

// Backward-compatible wrapper for existing calls.
export function calculateOrderPricing(
	items: PricingItem[], 
	discount?: { type: "percentage" | "fixed", value: number }
) {
	return calculatePricing({
		lineItems: items.map((item) => ({
			ticketTypeId: item.ticketType._id.toString(),
			quantity: item.quantity,
			unitPrice: item.ticketType.price,
		})),
		currency: "usd",
		organizerPlan: "free",
		discount,
	});
}
