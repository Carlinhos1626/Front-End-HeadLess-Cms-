import { formatInTimeZone } from 'date-fns-tz';

const dateFormat = (date) => {
  if (!date) {
    return "Data não disponível"; // Fallback para datas indefinidas ou inválidas
  }

  try {
    return formatInTimeZone(new Date(date), "America/New_York", "dd MMM yyyy");
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida"; // Fallback para valores de data inválidos
  }
};

export default dateFormat;
