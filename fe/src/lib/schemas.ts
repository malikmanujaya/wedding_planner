import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createWeddingSchema = z.object({
  title: z.string().min(2, "Title is required"),
  weddingDate: z.string().optional(),
  venue: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  notes: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  dueDate: z.string().optional().or(z.literal("")),
  assigneeUserId: z.string().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type CreateWeddingValues = z.infer<typeof createWeddingSchema>;
export type TaskFormValues = z.infer<typeof taskSchema>;
