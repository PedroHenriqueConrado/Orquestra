/**
 * Formata uma data no formato ISO para um formato legível em pt-BR
 * @param dateString Data no formato ISO
 * @returns String formatada (ex: "01/01/2023 às 14:30")
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('pt-BR', options).replace(',', ' às');
};

export default formatDate; 