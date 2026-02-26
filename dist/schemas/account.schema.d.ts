import { z } from 'zod';
export declare const accountSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["checking", "savings", "credit_card", "cash", "investment", "other"]>;
        balance: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other";
        name: string;
        currency?: string | undefined;
        balance?: number | undefined;
        description?: string | undefined;
    }, {
        type: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other";
        name: string;
        currency?: string | undefined;
        balance?: number | undefined;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other";
        name: string;
        currency?: string | undefined;
        balance?: number | undefined;
        description?: string | undefined;
    };
}, {
    body: {
        type: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other";
        name: string;
        currency?: string | undefined;
        balance?: number | undefined;
        description?: string | undefined;
    };
}>;
export declare const updateAccountSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["checking", "savings", "credit_card", "cash", "investment", "other"]>>;
        balance: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        is_active: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type?: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other" | undefined;
        currency?: string | undefined;
        name?: string | undefined;
        balance?: number | undefined;
        description?: string | null | undefined;
        is_active?: boolean | undefined;
    }, {
        type?: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other" | undefined;
        currency?: string | undefined;
        name?: string | undefined;
        balance?: number | undefined;
        description?: string | null | undefined;
        is_active?: boolean | undefined;
    }>, {
        type?: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other" | undefined;
        currency?: string | undefined;
        name?: string | undefined;
        balance?: number | undefined;
        description?: string | null | undefined;
        is_active?: boolean | undefined;
    }, {
        type?: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other" | undefined;
        currency?: string | undefined;
        name?: string | undefined;
        balance?: number | undefined;
        description?: string | null | undefined;
        is_active?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type?: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other" | undefined;
        currency?: string | undefined;
        name?: string | undefined;
        balance?: number | undefined;
        description?: string | null | undefined;
        is_active?: boolean | undefined;
    };
}, {
    body: {
        type?: "checking" | "savings" | "credit_card" | "cash" | "investment" | "other" | undefined;
        currency?: string | undefined;
        name?: string | undefined;
        balance?: number | undefined;
        description?: string | null | undefined;
        is_active?: boolean | undefined;
    };
}>;
//# sourceMappingURL=account.schema.d.ts.map