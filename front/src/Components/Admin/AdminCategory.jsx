import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminCategory = () => {
  const [activeTab, setActiveTab] = useState("menu");

  // Menu Category States
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuCategoryName, setMenuCategoryName] = useState("");
  const [menuEditId, setMenuEditId] = useState(null);

  // Packers Category States
  const [packersCategories, setPackersCategories] = useState([]);
  const [packersCategoryName, setPackersCategoryName] = useState("");
  const [packersEditId, setPackersEditId] = useState(null);

  // ✅ Fetch Menu Categories
  const fetchMenuCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7013/api/admin/menuCategory/getmenucategory"
      );
      setMenuCategories(res.data.categories);
      console.log(res, "categoriessssssssssssssssssssssssssssssss");
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Fetch Packers Categories
  const fetchPackersCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7013/api/admin/getcategory"
      );
      setPackersCategories(res.data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMenuCategories();
    fetchPackersCategories();
  }, []);

  // ✅ Add / Update Menu Category
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      if (menuEditId) {
        await axios.put(
          `http://localhost:7013/api/admin/menuCategory/updatemenucategory/${menuEditId}`,
          {
            menuCategory: menuCategoryName,
          }
        );
        setMenuEditId(null);
      } else {
        await axios.post(
          "http://localhost:7013/api/admin/menuCategory/addmenucategory",
          {
            menuCategory: menuCategoryName,
          }
        );
      }
      setMenuCategoryName("");
      fetchMenuCategories();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Delete Menu Category
  const handleMenuDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:7013/api/admin/menuCategory/deletemenucategory/${id}`
      );
      fetchMenuCategories();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Edit Menu Category
  const handleMenuEdit = (category) => {
    setMenuCategoryName(category.menuCategory);
    setMenuEditId(category._id);
  };

  // ✅ Add / Update Packers Category
  const handlePackersSubmit = async (e) => {
    e.preventDefault();
    try {
      if (packersEditId) {
        await axios.put(
          `http://localhost:7013/api/admin/updatecategory/${packersEditId}`,
          {
            CategoryName: packersCategoryName,
          }
        );
        setPackersEditId(null);
      } else {
        await axios.post("http://localhost:7013/api/admin/addcategory", {
          CategoryName: packersCategoryName,
        });
      }
      setPackersCategoryName("");
      fetchPackersCategories();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Delete Packers Category
  const handlePackersDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:7013/api/admin/deletecategory/${id}`
      );
      fetchPackersCategories();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Edit Packers Category
  const handlePackersEdit = (category) => {
    setPackersCategoryName(category.CategoryName);
    setPackersEditId(category._id);
  };

  return (
    <div className="mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="text-center mb-4" style={{ color: "orangered" }}>
            Manage Categories
          </h2>

          {/* Tabs Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "menu" ? "active" : ""}`}
                onClick={() => setActiveTab("menu")}
                style={{
                  color: activeTab === "menu" ? "orangered" : "#6c757d",
                  borderBottomColor:
                    activeTab === "menu" ? "orangered" : "transparent",
                }}
              >
                Menu Category
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "packers" ? "active" : ""
                }`}
                onClick={() => setActiveTab("packers")}
                style={{
                  color: activeTab === "packers" ? "orangered" : "#6c757d",
                  borderBottomColor:
                    activeTab === "packers" ? "orangered" : "transparent",
                }}
              >
                Packers Category
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          {activeTab === "menu" ? (
            <div>
              {/* Menu Category Form */}
              <form onSubmit={handleMenuSubmit} className="d-flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter menu category name"
                  value={menuCategoryName}
                  onChange={(e) => setMenuCategoryName(e.target.value)}
                  className="form-control"
                  required
                />
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ backgroundColor: "orangered" }}
                >
                  {menuEditId ? "Update" : "Add"}
                </button>
              </form>

              {/* Menu Category Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Menu Category Name</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuCategories.length > 0 ? (
                      menuCategories.map((cat, index) => (
                        <tr key={cat._id}>
                          <td>{index + 1}</td>
                          <td>{cat.menuCategory}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleMenuEdit(cat)}
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleMenuDelete(cat._id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No menu categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              {/* Packers Category Form */}
              <form
                onSubmit={handlePackersSubmit}
                className="d-flex gap-2 mb-4"
              >
                <input
                  type="text"
                  placeholder="Enter packers category name"
                  value={packersCategoryName}
                  onChange={(e) => setPackersCategoryName(e.target.value)}
                  className="form-control"
                  required
                />
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ backgroundColor: "orangered" }}
                >
                  {packersEditId ? "Update" : "Add"}
                </button>
              </form>

              {/* Packers Category Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Packers Category Name</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packersCategories.length > 0 ? (
                      packersCategories.map((cat, index) => (
                        <tr key={cat._id}>
                          <td>{index + 1}</td>
                          <td>{cat.CategoryName}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handlePackersEdit(cat)}
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handlePackersDelete(cat._id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No packers categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategory;
