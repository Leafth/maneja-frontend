import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Informe seu nome")
      .min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail")
      .pipe(z.email("Informe um e-mail válido")),
    password: z
      .string()
      .min(1, "Crie uma senha")
      .min(PASSWORD_MIN_LENGTH, `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`),
    passwordConfirmation: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    error: "As senhas não coincidem",
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;