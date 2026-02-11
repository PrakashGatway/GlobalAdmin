import React, { useState, useEffect, useCallback } from 'react';
import {
    CRow,
    CCol,
    CCard,
    CCardHeader,
    CCardBody,
    CCardFooter,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CButton,
    CBadge,
    CInputGroup,
    CInputGroupText,
    CFormInput,
    CFormSelect,
    CFormCheck,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CAlert,
    CPagination,
    CPaginationItem,
    CFormLabel,
    CSpinner,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilPlus,
    cilPencil,
    cilTrash,
    cilMagnifyingGlass,
    cilFilter,
    cilFilterX,
    cilChevronBottom,
    cilChevronTop,
    cilOptions,
    cilSortAscending,
    cilTag,
    cilList,
} from '@coreui/icons';
import CourseCategoryForm from './CategoriesFrom';
import apiService from '../../services/apiService';

export const courseCategoryService = {
    getCategories: async (params) => {
        try {
            const response = await apiService.get('/courses/categories', { params });
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch categories';
        }
    },

    getCategoryById: async (id) => {
        try {
            const response = await apiService.get(`/courses/categories/${id}`);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch category';
        }
    },

    createCategory: async (data) => {
        try {
            const response = await apiService.post('/courses/categories', data);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to create category';
        }
    },

    updateCategory: async (id, data) => {
        try {
            const response = await apiService.put(`/courses/categories/${id}`, data);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update category';
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await apiService.delete(`/courses/categories/${id}`);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete category';
        }
    }
};


const CourseCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        parent: '',
        status: '',
        sort: 'order',
        page: 1,
        limit: 10,
    });

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);


    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                ...filters,
                page: filters.page,
                limit: filters.limit,
            };

            // Add specific filter parameters based on your controller
            if (filters.search) params.name = filters.search;
            if (filters.parent === 'null') {
                params.parent = null;
            } else if (filters.parent) {
                params.parent = filters.parent;
            }
            if (filters.status !== '') params.isActive = filters.status === 'active';

            const res = await courseCategoryService.getCategories(params);
            if (res.success) {
                setCategories(res.data || []);
                setTotal(res.total || 0);
                setTotalPages(Math.ceil(res.total / filters.limit) || 1);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1, // Reset to first page when filters change
        }));
    };

    const handleSearchChange = (value) => {
        handleFilterChange('search', value);
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setFilters(prev => ({ ...prev, page }));
    };

    const handleLimitChange = (limit) => {
        setFilters(prev => ({ ...prev, limit: parseInt(limit), page: 1 }));
    };

    const handleSortChange = (sort) => {
        handleFilterChange('sort', sort);
    };

    const clearAllFilters = () => {
        setFilters({
            search: '',
            parent: '',
            status: '',
            sort: 'order',
            page: 1,
            limit: 10,
        });
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            const res = await courseCategoryService.deleteCategory(deletingId);
            if (res.success) {
                setSuccess('Category deleted successfully!');
                setShowDeleteModal(false);
                setDeletingId(null);
                fetchCategories();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.message || 'Delete failed');
            setShowDeleteModal(false);
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            let res;
            if (editingCategory) {
                res = await courseCategoryService.updateCategory(editingCategory._id, data);
                if (res.success) setSuccess('Category updated successfully!');
            } else {
                res = await courseCategoryService.createCategory(data);
                if (res.success) setSuccess('Category created successfully!');
            }
            if (res.success) {
                setShowModal(false);
                setEditingCategory(null);
                fetchCategories();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.message || 'Operation failed');
        }
    };

    // Calculate active filter count
    const activeFilterCount = Object.keys(filters).filter(key =>
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'sort' &&
        filters[key] !== '' &&
        filters[key] !== null
    ).length;

    // Sort options
    const sortOptions = [
        { value: 'name', label: 'Name A-Z' },
        { value: '-name', label: 'Name Z-A' },
        { value: '-createdAt', label: 'Newest First' },
        { value: 'createdAt', label: 'Oldest First' },
    ];

    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
                {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

                <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0">Course Categories</h5>
                            <small className="text-muted">Total: {total} categories</small>
                        </div>
                        <div className="d-flex gap-2">
                            <CDropdown>
                                <CDropdownToggle color="secondary" variant="outline">
                                    <CIcon icon={cilOptions} className="me-2" />
                                    Sort
                                </CDropdownToggle>
                                <CDropdownMenu>
                                    {sortOptions.map((option) => (
                                        <CDropdownItem
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value)}
                                            active={filters.sort === option.value}
                                        >
                                            {option.label}
                                        </CDropdownItem>
                                    ))}
                                </CDropdownMenu>
                            </CDropdown>
                            <CButton
                                color="secondary"
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <CIcon icon={cilFilter} className="me-2" />
                                Filters {activeFilterCount > 0 && <CBadge color="danger" className="ms-1">{activeFilterCount}</CBadge>}
                                <CIcon icon={showFilters ? cilChevronTop : cilChevronBottom} className="ms-2" />
                            </CButton>
                            <CButton
                                color="primary"
                                onClick={() => {
                                    setEditingCategory(null);
                                    setShowModal(true);
                                }}
                            >
                                <CIcon icon={cilPlus} className="me-2" /> Add Category
                            </CButton>
                        </div>
                    </CCardHeader>

                    {/* Filters Section */}
                    {showFilters && (
                        <CCardBody className="border-bottom">
                            <CRow className="g-3">
                                <CCol md={4}>
                                    <CFormLabel>Search</CFormLabel>
                                    <CInputGroup>
                                        <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                                        <CFormInput
                                            placeholder="Search by name..."
                                            value={filters.search}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                        />
                                    </CInputGroup>
                                </CCol>

                                <CCol md={4}>
                                    <CFormLabel>Status</CFormLabel>
                                    <CFormSelect
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </CFormSelect>
                                </CCol>

                                <CCol md={12} className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <CFormSelect
                                            style={{ width: '100px' }}
                                            value={filters.limit}
                                            onChange={(e) => handleLimitChange(e.target.value)}
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                        </CFormSelect>
                                        <span className="text-muted">per page</span>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <CButton color="danger" variant="outline" onClick={clearAllFilters}>
                                            <CIcon icon={cilFilterX} className="me-2" />
                                            Clear Filters
                                        </CButton>
                                    </div>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    )}

                    <CCardBody>
                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner />
                                <div className="mt-2">Loading categories...</div>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-5">
                                <CIcon icon={cilList} size="xxl" className="text-muted mb-3" />
                                <h5>No categories found</h5>
                                <p className="text-muted">
                                    {activeFilterCount > 0
                                        ? 'Try changing your filters or clear them to see all categories.'
                                        : 'No categories available. Create your first category.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <CTable >
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>#</CTableHeaderCell>
                                            <CTableHeaderCell>Name</CTableHeaderCell>
                                            <CTableHeaderCell>Slug</CTableHeaderCell>
                                            <CTableHeaderCell>Parent</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Icon</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {categories.map((cat, index) => (
                                            <CTableRow key={cat._id}>
                                                <CTableDataCell>
                                                    {(filters.page - 1) * filters.limit + index + 1}
                                                </CTableDataCell>
                                                <CTableDataCell className="fw-semibold">
                                                    <div>
                                                        {cat.name}
                                                    </div>
                                                    <small className="text-muted">{cat.description?.substring(0, 50)}...</small>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <code>{cat.slug}</code>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {cat.parent ? getParentName(cat.parent) : (
                                                        <CBadge color="primary">Root</CBadge>
                                                    )}
                                                </CTableDataCell>
                                               
                                                <CTableDataCell>
                                                    <CBadge color={cat.isActive ? 'success' : 'secondary'}>
                                                        {cat.isActive ? 'Active' : 'Inactive'}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {cat.icon ? (
                                                        cat.icon.includes('http') ? (
                                                            <img
                                                                src={cat.icon}
                                                                alt="Icon"
                                                                style={{ width: '24px', height: '24px' }}
                                                            />
                                                        ) : (
                                                            <i className={cat.icon} style={{ color: cat.color || '#3c8dbc', fontSize: '20px' }}></i>
                                                        )
                                                    ) : '-'}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex gap-1">
                                                        <CButton
                                                            size="sm"
                                                            color="warning"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(cat)}
                                                            title="Edit"
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                        <CButton
                                                            size="sm"
                                                            color="danger"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteClick(cat._id)}
                                                            title="Delete"
                                                        >
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <CCardFooter className="d-flex justify-content-between align-items-center">
                                        <div className="text-muted">
                                            Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                                            {Math.min(filters.page * filters.limit, total)} of {total} entries
                                        </div>
                                        <CPagination>
                                            <CPaginationItem
                                                disabled={filters.page <= 1}
                                                onClick={() => handlePageChange(filters.page - 1)}
                                                style={{ cursor: filters.page > 1 ? 'pointer' : 'not-allowed' }}
                                            >
                                                Previous
                                            </CPaginationItem>

                                            {/* Show limited page numbers */}
                                            {(() => {
                                                const pages = [];
                                                const maxVisible = 5;
                                                let startPage = Math.max(1, filters.page - Math.floor(maxVisible / 2));
                                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                                if (endPage - startPage + 1 < maxVisible) {
                                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                                }

                                                if (startPage > 1) {
                                                    pages.push(
                                                        <CPaginationItem
                                                            key={1}
                                                            onClick={() => handlePageChange(1)}
                                                        >
                                                            1
                                                        </CPaginationItem>
                                                    );
                                                    if (startPage > 2) {
                                                        pages.push(<CPaginationItem key="dots1" disabled>...</CPaginationItem>);
                                                    }
                                                }

                                                for (let i = startPage; i <= endPage; i++) {
                                                    pages.push(
                                                        <CPaginationItem
                                                            key={i}
                                                            active={filters.page === i}
                                                            onClick={() => handlePageChange(i)}
                                                        >
                                                            {i}
                                                        </CPaginationItem>
                                                    );
                                                }

                                                if (endPage < totalPages) {
                                                    if (endPage < totalPages - 1) {
                                                        pages.push(<CPaginationItem key="dots2" disabled>...</CPaginationItem>);
                                                    }
                                                    pages.push(
                                                        <CPaginationItem
                                                            key={totalPages}
                                                            onClick={() => handlePageChange(totalPages)}
                                                        >
                                                            {totalPages}
                                                        </CPaginationItem>
                                                    );
                                                }

                                                return pages;
                                            })()}

                                            <CPaginationItem
                                                disabled={filters.page >= totalPages}
                                                onClick={() => handlePageChange(filters.page + 1)}
                                                style={{ cursor: filters.page < totalPages ? 'pointer' : 'not-allowed' }}
                                            >
                                                Next
                                            </CPaginationItem>
                                        </CPagination>
                                    </CCardFooter>
                                )}
                            </>
                        )}
                    </CCardBody>
                </CCard>

                {/* Add/Edit Modal */}
                <CModal
                    visible={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setEditingCategory(null);
                        setError('');
                    }}
                    size="lg"
                    scrollable
                >
                    <CModalHeader>
                        <CModalTitle>
                            {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody className="p-4">
                        <CourseCategoryForm
                            category={editingCategory}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setShowModal(false);
                                setEditingCategory(null);
                            }}
                            error={error}
                            submitting={loading}
                        />
                    </CModalBody>
                </CModal>

                {/* Delete Confirmation Modal */}
                <CModal
                    visible={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                >
                    <CModalHeader>
                        <CModalTitle>Confirm Deletion</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>Are you sure you want to delete this category?</p>
                        <p className="text-muted">
                            This action cannot be undone. If this is a parent category, its children might become orphaned.
                        </p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </CButton>
                        <CButton color="danger" onClick={handleDelete}>
                            Delete Category
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow>
    );
};

export default CourseCategories;