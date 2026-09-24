import z from 'zod';

export const signUpSchema = z
  .object({
    name: z.string().min(1, 'Informe o seu nome'),
    email: z.email('Informe um e-mail válido'),
    password: z.string().min(8, 'Pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a sua senha'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    error: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
