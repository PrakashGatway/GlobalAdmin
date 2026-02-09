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
    cilDollar,
    cilCalendar,
    cilEducation,
    cilCheckCircle,
    cilXCircle,
} from '@coreui/icons';
import ScholarshipForm from './ScholarshipForm';
import apiService from '../../services/apiService';

const scholarshipService = {
    getScholarships: async (params) => {
        try {
            const response = await apiService.get('/scholarships', { params });
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch scholarships';
        }
    },

    getScholarshipById: async (id) => {
        try {
            const response = await apiService.get(`/scholarships/${id}`);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch scholarship';
        }
    },

    createScholarship: async (data) => {
        try {
            const response = await apiService.post('/scholarships', data);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to create scholarship';
        }
    },

    updateScholarship: async (id, data) => {
        try {
            const response = await apiService.put(`/scholarships/${id}`, data);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update scholarship';
        }
    },

    deleteScholarship: async (id) => {
        try {
            const response = await apiService.delete(`/scholarships/${id}`);
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete scholarship';
        }
    },

    // For filters
    getCountries: async () => {
        try {
            const response = await apiService.get('/countries?limit=1000');
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch countries';
        }
    },

    getUniversities: async () => {
        try {
            const response = await apiService.get('/universities?limit=1000');
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch universities';
        }
    },

    getSubjects: async () => {
        try {
            const response = await apiService.get('/subjects?limit=1000');
            return response;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch subjects';
        }
    },
}

const Scholarships = () => {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingScholarship, setEditingScholarship] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [countries, setCountries] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        country: '',
        university: '',
        subject: '',
        level: '',
        fundingType: '',
        status: '',
        isPublished: '',
        sort: '-createdAt',
        page: 1,
        limit: 10,
    });

    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch options for dropdowns
    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [countriesRes, uniRes, subRes] = await Promise.all([
                scholarshipService.getCountries(),
                scholarshipService.getUniversities(),
                scholarshipService.getSubjects()
            ]);

            if (countriesRes.success) setCountries(countriesRes.data || []);
            if (uniRes.success) setUniversities(uniRes.result || []);
            if (subRes.success) setSubjects(subRes.data || []);
        } catch (err) {
            console.error('Error fetching options:', err);
        }
    };

    const fetchScholarships = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                ...filters,
                page: filters.page,
                limit: filters.limit,
                sort: filters.sort,
            };

            // Remove empty filter values
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            // Convert isPublished to boolean if provided
            if (params.isPublished !== undefined && params.isPublished !== '') {
                params.isPublished = params.isPublished === 'true';
            }

            const res = await scholarshipService.getScholarships(params);
            if (res.success) {
                setScholarships(res.data || []);
                setTotal(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch scholarships');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchScholarships();
    }, [fetchScholarships]);

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
            country: '',
            university: '',
            subject: '',
            level: '',
            fundingType: '',
            status: '',
            isPublished: '',
            sort: '-createdAt',
            page: 1,
            limit: 10,
        });
    };

    const handleEdit = (scholarship) => {
        setEditingScholarship(scholarship);
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            const res = await scholarshipService.deleteScholarship(deletingId);
            if (res.success) {
                setSuccess('Scholarship deleted successfully!');
                setShowDeleteModal(false);
                setDeletingId(null);
                fetchScholarships();
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
            if (editingScholarship) {
                res = await scholarshipService.updateScholarship(editingScholarship._id, data);
                if (res.success) setSuccess('Scholarship updated successfully!');
            } else {
                res = await scholarshipService.createScholarship(data);
                if (res.success) setSuccess('Scholarship created successfully!');
            }
            if (res.success) {
                setShowModal(false);
                setEditingScholarship(null);
                fetchScholarships();
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
        filters[key] !== null &&
        filters[key] !== undefined
    ).length;

    // Available options for filters
    const levelOptions = ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma', 'Certificate'];
    const fundingTypeOptions = ['Fee waiver/discount', 'Stipend', 'Loan', 'Full tuition', 'Partial tuition'];
    const statusOptions = ['Active', 'Inactive'];
    const publishedOptions = [
        { value: '', label: 'All' },
        { value: 'true', label: 'Published' },
        { value: 'false', label: 'Draft' },
    ];
    const sortOptions = [
        { value: '-createdAt', label: 'Newest First' },
        { value: 'createdAt', label: 'Oldest First' },
        { value: 'title', label: 'Title A-Z' },
        { value: '-title', label: 'Title Z-A' },
        { value: 'amount', label: 'Amount Low to High' },
        { value: '-amount', label: 'Amount High to Low' },
    ];

    // Format amount display
    const formatAmount = (amount, fundingType) => {
        if (!amount) return '-';
        if (fundingType === 'Full tuition') return 'Full Tuition';
        if (fundingType === 'Partial tuition') return 'Partial Tuition';
        return amount;
    };

    return (
        <CRow>
            <CCol xs={12}>
                {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
                {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

                <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0">Scholarships</h5>
                            <small className="text-muted">Total: {total} scholarships</small>
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
                                    setEditingScholarship(null);
                                    setShowModal(true);
                                }}
                            >
                                <CIcon icon={cilPlus} className="me-2" /> Add Scholarship
                            </CButton>
                        </div>
                    </CCardHeader>

                    {/* Filters Section */}
                    {showFilters && (
                        <CCardBody className="border-bottom">
                            <CRow className="g-3">
                                <CCol md={3}>
                                    <CFormLabel>Search</CFormLabel>
                                    <CInputGroup>
                                        <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                                        <CFormInput
                                            placeholder="Search scholarships..."
                                            value={filters.search}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                        />
                                    </CInputGroup>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Country</CFormLabel>
                                    <CFormSelect
                                        value={filters.country}
                                        onChange={(e) => handleFilterChange('country', e.target.value)}
                                    >
                                        <option value="">All Countries</option>
                                        {countries.map((country) => (
                                            <option key={country._id} value={country._id}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>University</CFormLabel>
                                    <CFormSelect
                                        value={filters.university}
                                        onChange={(e) => handleFilterChange('university', e.target.value)}
                                    >
                                        <option value="">All Universities</option>
                                        {universities.map((uni) => (
                                            <option key={uni._id} value={uni._id}>
                                                {uni.name}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Subject</CFormLabel>
                                    <CFormSelect
                                        value={filters.subject}
                                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map((sub) => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Level</CFormLabel>
                                    <CFormSelect
                                        value={filters.level}
                                        onChange={(e) => handleFilterChange('level', e.target.value)}
                                    >
                                        <option value="">All Levels</option>
                                        {levelOptions.map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Funding Type</CFormLabel>
                                    <CFormSelect
                                        value={filters.fundingType}
                                        onChange={(e) => handleFilterChange('fundingType', e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        {fundingTypeOptions.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Status</CFormLabel>
                                    <CFormSelect
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>

                                <CCol md={3}>
                                    <CFormLabel>Published Status</CFormLabel>
                                    <CFormSelect
                                        value={filters.isPublished}
                                        onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                                    >
                                        {publishedOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
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
                                <div className="mt-2">Loading scholarships...</div>
                            </div>
                        ) : scholarships.length === 0 ? (
                            <div className="text-center py-5">
                                <CIcon icon={cilMagnifyingGlass} size="xxl" className="text-muted mb-3" />
                                <h5>No scholarships found</h5>
                                <p className="text-muted">
                                    {activeFilterCount > 0
                                        ? 'Try changing your filters or clear them to see all scholarships.'
                                        : 'No scholarships available. Create your first scholarship.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <CTable>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Title</CTableHeaderCell>
                                            <CTableHeaderCell>University</CTableHeaderCell>
                                            <CTableHeaderCell>Country</CTableHeaderCell>
                                            <CTableHeaderCell>Level</CTableHeaderCell>
                                            <CTableHeaderCell>Funding Type</CTableHeaderCell>
                                            <CTableHeaderCell>Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Published</CTableHeaderCell>
                                            <CTableHeaderCell>Deadline</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {scholarships.map((scholarship) => (
                                            <CTableRow key={scholarship._id}>
                                                <CTableDataCell className="fw-semibold">
                                                    <small>{scholarship.title}</small>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {scholarship.university?.name || '-'}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex align-items-center gap-1">
                                                        {scholarship.country?.name || '-'}
                                                    </div>
                                                </CTableDataCell>
                                                {/* <CTableDataCell>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <CIcon icon={cilEducation} />
                                                        {scholarship.subject?.name || '-'}
                                                    </div>
                                                </CTableDataCell> */}
                                                <CTableDataCell>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {Array.isArray(scholarship.level) ? (
                                                            scholarship.level.map((lvl, index) => (
                                                                <CBadge key={index} color="info" className="mb-1">
                                                                    {lvl}
                                                                </CBadge>
                                                            ))
                                                        ) : (
                                                            <CBadge color="info">{scholarship.level}</CBadge>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color="primary">
                                                        {scholarship.fundingType || '-'}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {scholarship.fundingType === 'Stipend' ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <CIcon icon={cilDollar} className="text-success" />
                                                            <strong>{formatAmount(scholarship.amount, scholarship.fundingType)}</strong>
                                                        </div>
                                                    ) : (
                                                        formatAmount(scholarship.amount, scholarship.fundingType)
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CBadge color={scholarship.status === 'Active' ? 'success' : 'secondary'}>
                                                        {scholarship.status}
                                                    </CBadge>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {scholarship.isPublished ? (
                                                        <CBadge color="success">
                                                            <CIcon icon={cilCheckCircle} className="me-1" /> Published
                                                        </CBadge>
                                                    ) : (
                                                        <CBadge color="warning">
                                                            <CIcon icon={cilXCircle} className="me-1" /> Draft
                                                        </CBadge>
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {scholarship.deadline ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <CIcon icon={cilCalendar} />
                                                            {scholarship.deadline}
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="d-flex gap-1">
                                                        <CButton
                                                            size="sm"
                                                            color="warning"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(scholarship)}
                                                            title="Edit"
                                                        >
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                        <CButton
                                                            size="sm"
                                                            color="danger"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteClick(scholarship._id)}
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
                        setEditingScholarship(null);
                        setError('');
                    }}
                    fullscreen
                    scrollable
                >
                    <CModalHeader>
                        <CModalTitle>
                            {editingScholarship ? `Edit Scholarship: ${editingScholarship.title}` : 'Add New Scholarship'}
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody  className="p-4">
                        <ScholarshipForm
                            scholarship={editingScholarship}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setShowModal(false);
                                setEditingScholarship(null);
                            }}
                            error={error}
                            submitting={loading}
                            countries={countries}
                            universities={universities}
                            subjects={subjects}
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
                        <p>Are you sure you want to delete this scholarship?</p>
                        <p className="text-muted">
                            This action cannot be undone. All associated data will be permanently removed.
                        </p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </CButton>
                        <CButton color="danger" onClick={handleDelete}>
                            Delete Scholarship
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow>
    );
};

export default Scholarships;