import { useEffect, useState } from "react";
import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useTheme, useMediaQuery } from "@mui/material";
import {  Typography,  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  Paper,  Button,  Box,  IconButton,  Collapse, Chip,  Slide,  TextField,  Alert,  CircularProgress} from "@mui/material";
import {  KeyboardArrowDown,   KeyboardArrowUp,   Add,   Edit,   Close,   Phone,   Email,  LocationOn,  Delete} from "@mui/icons-material";
import { supplierApi, eggTypeApi } from "../api/api";

interface Product {
  id: number;
  name: string;
  description?: string;
  supplierId: number;
  createdAt: string;
  updatedAt: string;
}
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

interface Supplier {
  id: number;
  name: string;
  email?: string;
  address?: string;
  phone_number?: string;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

interface FormError {
  field: string;
  message: string;
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError[]>([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados para formularios en línea
  const [activeForm, setActiveForm] = useState<'supplier' | 'product' | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    email: "",
    address: "",
    phone_number: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await supplierApi.getAll();
    setSuppliers(response.data); // Extrae .data de la respuesta
  } catch (err) {
    console.error("Error obteniendo proveedores:", err);
    setError("Error al cargar los proveedores. Por favor, inténtelo de nuevo.");
  } finally {
    setLoading(false);
  }
};

  const fetchProducts = async (supplierId: number) => {
  try {
    const response = await eggTypeApi.getBySupplier(supplierId);
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === supplierId ? { ...supplier, products: response.data } : supplier
      )
    );
  } catch (err) {
    console.error("Error obteniendo productos:", err);
    setError(`Error al cargar los productos del proveedor #${supplierId}`);
  }
};

  const toggleRow = (supplierId: number) => {
    if (expandedRows.includes(supplierId)) {
      setExpandedRows(expandedRows.filter((id) => id !== supplierId));
      setActiveForm(null);
    } else {
      fetchProducts(supplierId);
      setExpandedRows([...expandedRows, supplierId]);
    }
  };

  // Form validation
  const validateSupplierForm = () => {
    const errors: FormError[] = [];
    if (!supplierForm.name.trim()) {
      errors.push({ field: 'name', message: 'El nombre es obligatorio' });
    }
    
    if (supplierForm.email && !/\S+@\S+\.\S+/.test(supplierForm.email)) {
      errors.push({ field: 'email', message: 'El correo electrónico no es válido' });
    }
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  const validateProductForm = () => {
    const errors: FormError[] = [];
    if (!productForm.name.trim()) {
      errors.push({ field: 'name', message: 'El nombre del producto es obligatorio' });
    }
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  // Formulario de proveedor
  const handleOpenSupplierForm = (supplier?: Supplier) => {
    setFormErrors([]);
    setActiveForm('supplier');
    if (supplier) {
      setSelectedSupplier(supplier);
      setSupplierForm({
        name: supplier.name,
        email: supplier.email || "",
        address: supplier.address || "",
        phone_number: supplier.phone_number || "",
      });
    } else {
      setSelectedSupplier(null);
      setSupplierForm({ name: "", email: "", address: "", phone_number: "" });
    }
  };

  const handleSupplierSubmit = async () => {
    if (!validateSupplierForm()) return;
    
    try {
      const payload = {
        name: supplierForm.name.trim(),
        email: supplierForm.email.trim(),
        address: supplierForm.address.trim(),
        phone_number: supplierForm.phone_number.trim(),
      };

      if (selectedSupplier) {
        await supplierApi.update(selectedSupplier.id, payload);
      } else {
        await supplierApi.create(payload);
      }

      await fetchSuppliers();
      setActiveForm(null);
    } catch (err: unknown) {
      console.error("Error al guardar proveedor:", err);
      const error = err as ApiError;
      setError(error.response?.data?.error || "Error al guardar el proveedor");
    }
  };

  // Formulario de producto
  const handleOpenProductForm = (supplier: Supplier, product?: Product) => {
    setFormErrors([]);
    setSelectedSupplier(supplier);
    setActiveForm('product');
    if (product) {
      setSelectedProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
      });
    } else {
      setSelectedProduct(null);
      setProductForm({ name: "", description: "" });
    }
  };

  const handleProductSubmit = async () => {
    if (!selectedSupplier) return;
    if (!validateProductForm()) return;

    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        supplierId: selectedSupplier.id,
      };

      if (selectedProduct) {
        await eggTypeApi.update(selectedProduct.id, payload);
      } else {
        await eggTypeApi.create(payload);
      }

      await fetchProducts(selectedSupplier.id);
      setActiveForm(null);
    } catch (err: unknown) {
      console.error("Error al guardar producto:", err);
      const error = err as ApiError;
      setError(error.response?.data?.error || "Error al guardar el producto");
    }
  };

  // Eliminar elementos
  const handleDeleteSupplier = async (id: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este proveedor?")) {
      try {
        await supplierApi.delete(id);
        setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
      } catch (err: unknown) {
        console.error("Error al eliminar proveedor:", err);
        const error = err as ApiError;
        setError(error.response?.data?.error || "Error al eliminar el proveedor");
      }
    }
  };

  const handleDeleteProduct = async (productId: number, supplierId: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      try {
        await eggTypeApi.delete(productId);
        await fetchProducts(supplierId);
      } catch (err: unknown) {
        console.error("Error al eliminar producto:", err);
        const error = err as ApiError;
        setError(error.response?.data?.error || "Error al eliminar el producto");
      }
    }
  };

  // Helpers
  const getFieldError = (field: string) => {
    return formErrors.find(error => error.field === field)?.message;
  };

  // Estilos comunes
  const formContainerStyles = {
    p: 2,
    mt: 2,
    mb: 2,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 1,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1]
  };

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Catálogo de Proveedores
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Formulario de proveedor flotante */}
      {activeForm === 'supplier' && (
        <Slide direction="up" in={activeForm === 'supplier'} mountOnEnter unmountOnExit>
          <Box sx={formContainerStyles}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {selectedSupplier ? "Editar Proveedor" : "Agregar Proveedor"}
              </Typography>
              <IconButton onClick={() => setActiveForm(null)}>
                <Close />
              </IconButton>
            </Box>
            <TextField
              label="Nombre"
              fullWidth
              value={supplierForm.name}
              onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
              margin="normal"
              required
              error={!!getFieldError('name')}
              helperText={getFieldError('name')}
            />
            <TextField
              label="Correo Electrónico"
              fullWidth
              value={supplierForm.email}
              onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
              margin="normal"
              error={!!getFieldError('email')}
              helperText={getFieldError('email')}
            />
            <TextField
              label="Dirección"
              fullWidth
              value={supplierForm.address}
              onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
              margin="normal"
            />
            <TextField
              label="Teléfono"
              fullWidth
              value={supplierForm.phone_number}
              onChange={(e) => setSupplierForm({...supplierForm, phone_number: e.target.value})}
              margin="normal"
            />
            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
              <Button variant="outlined" onClick={() => setActiveForm(null)}>
                Cancelar
              </Button>
              <Button variant="contained" color="primary" onClick={handleSupplierSubmit}>
                {selectedSupplier ? "Actualizar" : "Guardar"}
              </Button>
            </Box>
          </Box>
        </Slide>
      )}

      {activeForm !== 'supplier' && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenSupplierForm()}
          sx={{ mb: 2 }}
          startIcon={<Add />}
        >
          Agregar Proveedor
        </Button>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : suppliers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No hay proveedores registrados. Comience agregando uno nuevo.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Nombre</TableCell>
                {!isMobile && <TableCell>Contacto</TableCell>}
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <React.Fragment key={`supplier-${supplier.id}`}>
                  {/* Fila del proveedor */}
                  <TableRow 
                    hover
                    sx={{
                      '&:hover': { backgroundColor: theme.palette.action.hover },
                      cursor: 'pointer',
                      backgroundColor: expandedRows.includes(supplier.id) 
                        ? theme.palette.action.selected 
                        : 'inherit'
                    }}
                    onClick={() => toggleRow(supplier.id)}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(supplier.id);
                        }}
                      >
                        {expandedRows.includes(supplier.id) ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={expandedRows.includes(supplier.id) ? 'bold' : 'normal'}>
                        {supplier.name}
                      </Typography>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {supplier.email && (
                            <Chip 
                              icon={<Email fontSize="small" />} 
                              label={supplier.email} 
                              size="small" 
                              variant="outlined"
                              sx={{ maxWidth: '100%', overflow: 'hidden' }}
                            />
                          )}
                          {supplier.phone_number && (
                            <Chip 
                              icon={<Phone fontSize="small" />} 
                              label={supplier.phone_number} 
                              size="small"
                              variant="outlined" 
                            />
                          )}
                          {supplier.address && (
                            <Chip 
                              icon={<LocationOn fontSize="small" />} 
                              label={supplier.address} 
                              size="small"
                              variant="outlined"
                              sx={{ maxWidth: '100%', overflow: 'hidden' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                    )}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenSupplierForm(supplier)}
                          startIcon={<Edit fontSize="small" />}
                        >
                          {isMobile ? "" : "Editar"}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          startIcon={<Delete fontSize="small" />}
                        >
                          {isMobile ? "" : "Eliminar"}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Fila expandible con productos */}
                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={4}>
                      <Collapse in={expandedRows.includes(supplier.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Productos de {supplier.name}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOpenProductForm(supplier)}
                              startIcon={<Add />}
                            >
                              Agregar Producto
                            </Button>
                          </Box>

                          {/* Formulario de producto en línea */}
                          {activeForm === 'product' && expandedRows.includes(supplier.id) && (
                            <Slide direction="up" in={activeForm === 'product'} mountOnEnter unmountOnExit>
                              <Box sx={formContainerStyles}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                  <Typography variant="subtitle1">
                                    {selectedProduct ? "Editar Producto" : "Nuevo Producto"}
                                  </Typography>
                                  <IconButton onClick={() => setActiveForm(null)} size="small">
                                    <Close />
                                  </IconButton>
                                </Box>
                                <TextField
                                  label="Nombre"
                                  fullWidth
                                  value={productForm.name}
                                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                  margin="normal"
                                  required
                                  error={!!getFieldError('name')}
                                  helperText={getFieldError('name')}
                                />
                                <TextField
                                  label="Descripción"
                                  fullWidth
                                  multiline
                                  rows={3}
                                  value={productForm.description}
                                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                  margin="normal"
                                />
                                <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                  <Button variant="outlined" onClick={() => setActiveForm(null)}>
                                    Cancelar
                                  </Button>
                                  <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={handleProductSubmit}
                                  >
                                    {selectedProduct ? "Actualizar" : "Guardar"}
                                  </Button>
                                </Box>
                              </Box>
                            </Slide>
                          )}

                          {/* Lista de productos */}
                          {supplier.products && supplier.products.length > 0 ? (
                            supplier.products.map((product) => (
                              <Paper key={product.id} sx={{ p: 2, mb: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="medium">{product.name}</Typography>
                                    {product.description && (
                                      <Typography variant="body2" color="text.secondary">
                                        {product.description}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleOpenProductForm(supplier, product)}
                                      startIcon={<Edit />}
                                      sx={{ mr: 1 }}
                                    >
                                      {!isMobile && "Editar"}
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleDeleteProduct(product.id, supplier.id)}
                                      startIcon={<Delete />}
                                    >
                                      {!isMobile && "Eliminar"}
                                    </Button>
                                  </Box>
                                </Box>
                              </Paper>
                            ))
                          ) : (
                            <Typography color="text.secondary" textAlign="center" py={2}>
                              No hay productos registrados para este proveedor.
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardLayout>
  );
};

export default SuppliersPage;