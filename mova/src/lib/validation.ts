import { z } from "zod";

export const cartItemsSchema = z.array(z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().nullable().optional(),
  quantity: z.number().int().min(1).max(20),
})).max(50);

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const checkoutSchema = z.object({
  items: cartItemsSchema.min(1, "Your bag is empty."),
  couponCode: z.string().max(40).optional().nullable(),
  paymentMethod: z.enum(["razorpay", "cod"]),
  customer: z.object({
    name: z.string().trim().min(2, "Enter your full name.").max(80),
    email: z.string().trim().email("Enter a valid email address.").max(255),
    phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  }),
  address: z.object({
    line1: z.string().trim().min(4, "Enter your house / street address.").max(160),
    line2: z.string().trim().max(160).optional().default(""),
    landmark: z.string().trim().max(80).optional().default(""),
    city: z.string().trim().min(2, "Enter your city.").max(60),
    state: z.string().refine((s) => INDIAN_STATES.includes(s), "Choose your state."),
    pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  }),
  notes: z.string().max(300).optional().default(""),
});
