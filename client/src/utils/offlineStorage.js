const STORAGE_KEY = "pending-expenses";

export const getPendingExpenses = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const savePendingExpense = (expense) => {
    const pending = getPendingExpenses();
    pending.push({ ...expense, createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
};

export const clearPendingExpenses = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getPendingCount = () => getPendingExpenses().length;
