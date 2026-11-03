import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import api from '../services/api';
import { fetchProducts } from '../store/slices/productsSlice';
import { useAppDispatch } from '../hooks/redux';
import { formatPrice } from '../utils/currency';
import { getProductImage, getProductImages } from '../utils/productImages';

const AdminProducts = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading } = useAppSelector((state) => state.products);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports & Outdoors',
    'Toys & Games',
    'Beauty & Personal Care',
    'Food & Beverages',
    'Health & Fitness',
    'Automotive',
  ];

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
    dispatch(fetchProducts({ limit: 100 }));
  }, [user, navigate, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);

      // Append all selected files
      selectedFiles.forEach((file) => {
        submitData.append('images', file);
      });

      if (editingProduct) {
        await api.put(`/products/${editingProduct}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Product updated successfully!');
      } else {
        await api.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Product created successfully!');
      }
      resetForm();
      dispatch(fetchProducts({ limit: 100 }));
    } catch (error: any) {
      alert(error.response?.data?.message || `Error ${editingProduct ? 'updating' : 'creating'} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
    });
    setSelectedFiles([]);
    setCustomCategory(false);
    // Revoke all preview URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCustomCategory(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
    });
    // Load existing images as previews
    const existingImages = getProductImages(product);
    setImagePreviews(existingImages);
    setSelectedFiles([]); // Clear new file selections
    setCustomCategory(!categories.includes(product.category));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (product: any) => {
    setEditingProduct(null); // Not editing, creating a new product
    setFormData({
      name: `${product.name} (Copy)`,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
    });
    // Load existing images as previews (they won't be uploaded, just shown for reference)
    const existingImages = getProductImages(product);
    setImagePreviews(existingImages);
    setSelectedFiles([]); // Clear new file selections - user needs to re-upload images
    setCustomCategory(!categories.includes(product.category));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Product deleted successfully!');
      dispatch(fetchProducts({ limit: 100 }));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting product');
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin - Products</h1>
          <button
            onClick={showForm ? resetForm : handleAddNew}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            {showForm ? 'Cancel' : '+ Add New Product'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Category *</label>
                <div className="flex gap-2">
                  {!customCategory ? (
                    <>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCategory(true);
                          setFormData({ ...formData, category: '' });
                        }}
                        className="px-4 py-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Custom
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Enter custom category"
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCategory(false);
                          setFormData({ ...formData, category: '' });
                        }}
                        className="px-4 py-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Select
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Multiple Images Upload */}
              <div>
                <label className="block mb-2 font-semibold">Product Images *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can select multiple images (max 10). {editingProduct ? 'Leave empty to keep existing images.' : ''}
                </p>
                {!editingProduct && imagePreviews.length > 0 && selectedFiles.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    Note: Images from duplicated product are shown for reference. Please upload new images.
                  </p>
                )}
              </div>

              {/* Image Previews */}
              {(imagePreviews.length > 0 || selectedFiles.length > 0) && (
                <div>
                  <label className="block mb-2 font-semibold">Image Previews:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : editingProduct
                    ? 'Update Product'
                    : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingProduct ? 'Cancel' : 'Clear'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No products found. Add your first product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product) || ''}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span>📦</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 font-semibold text-primary-600">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4">{product.stock}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(product)}
                            className="text-green-600 hover:text-green-700 font-semibold text-sm"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 font-semibold text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
