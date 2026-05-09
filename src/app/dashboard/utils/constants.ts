export const CATEGORIES = ['Mercado', 'Contas', 'Lazer', 'Saúde', 'Transporte', 'Outros']

export const formatCurrency = (value: number, currency: string) => {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: currency 
  })
}
