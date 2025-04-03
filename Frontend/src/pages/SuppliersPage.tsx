import { useEffect, useState } from "react";
import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  IconButton,
  Collapse,
  Chip,
  Slide,
  TextField
} from "@mui/material";
import {
  getsuppliers,
  createSuppliers,
  updateSuppliers,
  deleteSupplier,
  getEggTypesBySupplier,
  createEggType,
  updateEggType,
  deleteEggType,
} from "../api/api";
import { KeyboardArrowDown, KeyboardArrowUp, Add, Edit, Close } from "@mui/icons-material";

interface Product {
  id: number;
  name: string;
  description?: string;
  supplierId: number;
  createdAt: string;
  updatedAt: string;
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

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
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
    try {
      const data: Supplier[] = await getsuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
    }
  };

  const fetchProducts = async (supplierId: number) => {
    try {
      const products = await getEggTypesBySupplier(supplierId);
      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === supplierId ? { ...supplier, products } : supplier
        )
      );
    } catch (error) {
      console.error("Error obteniendo productos:", error);
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

  // Formulario de proveedor
  const handleOpenSupplierForm = (supplier?: Supplier) => {
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
    try {
      const payload = {
        name: supplierForm.name,
        email: supplierForm.email,
        address: supplierForm.address,
        phone_number: supplierForm.phone_number,
      };

      if (selectedSupplier) {
        await updateSuppliers(selectedSupplier.id, payload);
      } else {
        await createSuppliers(payload);
      }

      await fetchSuppliers();
      setActiveForm(null);
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
    }
  };

  // Formulario de producto
  const handleOpenProductForm = (supplier: Supplier, product?: Product) => {
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

    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        supplierId: selectedSupplier.id,
      };

      if (selectedProduct) {
        await updateEggType(selectedProduct.id, payload);
      } else {
        await createEggType(payload);
      }

      await fetchProducts(selectedSupplier.id);
      setActiveForm(null);
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  // Eliminar elementos
  const handleDeleteSupplier = async (id: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este proveedor?")) {
      try {
        await deleteSupplier(id);
        setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
      } catch (error) {
        console.error("Error al eliminar proveedor:", error);
      }
    }
  };

  const handleDeleteProduct = async (productId: number, supplierId: number) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      try {
        await deleteEggType(productId);
        await fetchProducts(supplierId);
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
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
            />
            <TextField
              label="Correo Electrónico"
              fullWidth
              value={supplierForm.email}
              onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
              margin="normal"
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
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(supplier.id)}
                    >
                      {expandedRows.includes(supplier.id) ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{supplier.name}</TableCell>
                  {!isMobile && (
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {supplier.email && <Chip label={supplier.email} size="small" />}
                        {supplier.phone_number && <Chip label={supplier.phone_number} size="small" />}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenSupplierForm(supplier)}
                      >
                        {isMobile ? <Edit fontSize="small" /> : "Editar"}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                      >
                        {isMobile ? <Close fontSize="small" /> : "Eliminar"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>

                {/* Fila expandible con productos */}
                <TableRow>
                  <TableCell style={{ padding: 0 }} colSpan={4}>
                    <Collapse in={expandedRows.includes(supplier.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenProductForm(supplier)}
                            startIcon={<Add />}                          >
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
                        {supplier.products?.map((product) => (
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
                                  onClick={() => handleOpenProductForm(supplier, product)}
                                  startIcon={<Edit />}
                                  sx={{ mr: 1 }}
                                >
                                  {!isMobile && "Editar"}
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteProduct(product.id, supplier.id)}
                                  startIcon={<Close />}
                                >
                                  {!isMobile && "Eliminar"}
                                </Button>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardLayout>
  );
};

export default SuppliersPage;