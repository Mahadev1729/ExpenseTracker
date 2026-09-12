import { useState, useEffect } from "react";
import API from "../../services/api";
import { ShimmerList } from "../shared/Shimmer";
import { getCategoryIcon } from "../../utils/categoryIcons";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
    icon: "📊",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories(true);
  }, []);

  const fetchCategories = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      const response = await API.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ShimmerList items={5} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, formData);
      } else {
        await API.post("/categories", formData);
      }
      fetchCategories();
      setShowForm(false);
      setFormData({ name: "", color: "#3B82F6", icon: "📊" });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await API.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const defaultCategories = categories.filter((cat) => !cat.user_id);
  const customCategories = categories.filter((cat) => cat.user_id);

  return (
    <div className="premium-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
            Category Manager
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage and personalize your expense categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition duration-200"
          style={{
            background: showForm
              ? "var(--bg-card)"
              : "linear-gradient(to right, #c9a227, #e2b84d)",
            color: showForm ? "var(--text-primary)" : "#000",
            border: "1px solid var(--border)",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add Category"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-xl space-y-4"
          style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                placeholder="e.g. Health & Fitness"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-12 h-10 rounded-xl cursor-pointer p-0 border-0 bg-transparent"
                />
                <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                  {formData.color}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Icon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full premium-input px-3.5 py-2.5 text-sm focus:outline-none"
                placeholder="📊"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-semibold transition duration-200"
              style={{ background: "linear-gradient(to right, #c9a227, #e2b84d)", color: "#000" }}
            >
              {editingId ? "Update Category" : "Save Category"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ name: "", color: "#3B82F6", icon: "📊" });
                setEditingId(null);
              }}
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-semibold transition duration-200"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {customCategories.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: "var(--text-heading)" }}>
              Your Custom Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {customCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-3.5 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{getCategoryIcon(category.icon, category.name)}</span>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm truncate block" style={{ color: "var(--text-heading)" }}>
                        {category.name}
                      </span>
                      <div
                        className="w-3.5 h-3.5 rounded-full mt-1"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 rounded-lg text-sm transition hover:scale-110"
                      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 rounded-lg text-sm transition hover:scale-110"
                      style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: "var(--text-heading)" }}>
            Default System Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {defaultCategories.map((category) => (
              <div
                key={category.id}
                className="p-3.5 rounded-xl flex items-center gap-3 opacity-80"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
              >
                <span className="text-2xl shrink-0">{getCategoryIcon(category.icon, category.name)}</span>
                <div className="min-w-0">
                  <span className="font-semibold text-sm truncate block" style={{ color: "var(--text-heading)" }}>
                    {category.name}
                  </span>
                  <div
                    className="w-3.5 h-3.5 rounded-full mt-1"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;
