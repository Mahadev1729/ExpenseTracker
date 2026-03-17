import { useState, useEffect } from "react";
import API from "../services/api";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
    icon: "📊"
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
      icon: category.icon
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
  

  const defaultCategories = categories.filter(cat => !cat.user_id);
  const customCategories = categories.filter(cat => cat.user_id);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Category Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="📊"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
            >
              {editingId ? "Update" : "Add"} Category
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ name: "", color: "#3B82F6", icon: "📊" });
                setEditingId(null);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {customCategories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <span className="font-medium text-gray-800">{category.name}</span>
                      <div
                        className="w-4 h-4 rounded-full mt-1"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
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
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Default Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 p-4 rounded-lg flex items-center gap-3 opacity-75">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <span className="font-medium text-gray-800">{category.name}</span>
                  <div
                    className="w-4 h-4 rounded-full mt-1"
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
