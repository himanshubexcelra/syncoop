export function formatDate(date: Date) {
    const today = new Date(date);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${month}/${day}/${year}`;
  }