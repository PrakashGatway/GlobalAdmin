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
  cilDollar,
  cilCalendar,
} from '@coreui/icons';
import CourseForm from './CourseForm';
import apiService from '../../services/apiService';

const courseService = {
  getCourses: async (params) => {
    try {
      const response = await apiService.get('/courses', { params });
      return response;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch courses';
    }
  },

  getCourseById: async (id) => {
    try {
      const response = await apiService.get(`/courses/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch course';
    }
  },

  createCourse: async (data) => {
    try {
      const response = await apiService.post('/courses', data);
      return response;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create course';
    }
  },

  updateCourse: async (id, data) => {
    try {
      const response = await apiService.put(`/courses/${id}`, data);
      return response;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update course';
    }
  },

  deleteCourse: async (id) => {
    try {
      const response = await apiService.delete(`/courses/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete course';
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

  getScholarships: async () => {
    try {
      const response = await apiService.get('/scholarships?limit=1000');
      return response;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch scholarships';
    }
  },
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [scholarships, setScholarships] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    university: '',
    subject: '',
    level: '',
    studyMode: '',
    currency: '',
    status: '',
    minFee: '',
    maxFee: '',
    duration: '',
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
      const [uniRes, subRes] = await Promise.all([
        courseService.getUniversities(),
        courseService.getSubjects()
        // courseService.getScholarships(),
      ]);

      setUniversities(uniRes.result || []);
      if (subRes.success) setSubjects(subRes.data || []);
      // if (schRes.success) setScholarships(schRes.result || []);
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  const fetchCourses = useCallback(async () => {
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
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const res = await courseService.getCourses(params);
      if (res.success) {
        setCourses(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
      university: '',
      subject: '',
      level: '',
      studyMode: '',
      currency: '',
      status: '',
      minFee: '',
      maxFee: '',
      duration: '',
      sort: '-createdAt',
      page: 1,
      limit: 10,
    });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const res = await courseService.deleteCourse(deletingId);
      if (res.success) {
        setSuccess('Course deleted successfully!');
        setShowDeleteModal(false);
        setDeletingId(null);
        fetchCourses();
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
      if (editingCourse) {
        res = await courseService.updateCourse(editingCourse._id, data);
        if (res.success) setSuccess('Course updated successfully!');
      } else {
        res = await courseService.createCourse(data);
        if (res.success) setSuccess('Course created successfully!');
      }
      if (res.success) {
        setShowModal(false);
        setEditingCourse(null);
        fetchCourses();
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

  // Available options for filters
  const levelOptions = ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma', 'Certificate'];
  const studyModeOptions = ['Full-time', 'Part-time', 'Online', 'Hybrid'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'BDT'];
  const statusOptions = ['Active', 'Inactive'];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: '-name', label: 'Name Z-A' },
    { value: 'tuitionFee', label: 'Fee Low to High' },
    { value: '-tuitionFee', label: 'Fee High to Low' },
  ];

  return (
    <CRow>
      <CCol xs={12}>
        {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
        {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Courses</h5>
              <small className="text-muted">Total: {total} courses</small>
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
                  setEditingCourse(null);
                  setShowModal(true);
                }}
              >
                <CIcon icon={cilPlus} className="me-2" /> Add Course
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
                      placeholder="Search courses..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </CInputGroup>
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
                  <CFormLabel>Study Mode</CFormLabel>
                  <CFormSelect
                    value={filters.studyMode}
                    onChange={(e) => handleFilterChange('studyMode', e.target.value)}
                  >
                    <option value="">All Modes</option>
                    {studyModeOptions.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
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
                  <CFormLabel>Currency</CFormLabel>
                  <CFormSelect
                    value={filters.currency}
                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                  >
                    <option value="">All Currencies</option>
                    {currencyOptions.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Duration</CFormLabel>
                  <CFormInput
                    placeholder="e.g., 3 years"
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                  />
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
                <div className="mt-2">Loading courses...</div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilMagnifyingGlass} size="xxl" className="text-muted mb-3" />
                <h5>No courses found</h5>
                <p className="text-muted">
                  {activeFilterCount > 0
                    ? 'Try changing your filters or clear them to see all courses.'
                    : 'No courses available. Create your first course.'}
                </p>
              </div>
            ) : (
              <>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>University</CTableHeaderCell>
                      <CTableHeaderCell>Subject</CTableHeaderCell>
                      <CTableHeaderCell>Level</CTableHeaderCell>
                      <CTableHeaderCell>Mode</CTableHeaderCell>
                      <CTableHeaderCell>Duration</CTableHeaderCell>
                      <CTableHeaderCell>Fee</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {courses.map((course) => (
                      <CTableRow key={course._id}>
                        <CTableDataCell className="fw-semibold">
                          <div>{course.name}</div>
                          <small className="text-muted">{course.shortName}</small>
                        </CTableDataCell>
                        <CTableDataCell>{course.university?.name || '-'}</CTableDataCell>
                        <CTableDataCell>{course.subject?.name || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="info">{course.level}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{course.studyMode}</CTableDataCell>
                        <CTableDataCell>{course.duration}</CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{course.currency} {course.tuitionFee?.toLocaleString()}</strong>
                          </div>
                          {course.applicationFee > 0 && (
                            <small className="text-muted">
                              App fee: {course.currency} {course.applicationFee}
                            </small>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={course.status === 'Active' ? 'success' : 'secondary'}>
                            {course.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              size="sm"
                              color="warning"
                              variant="ghost"
                              onClick={() => handleEdit(course)}
                              title="Edit"
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              size="sm"
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDeleteClick(course._id)}
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
            setEditingCourse(null);
            setError('');
          }}
          size="xl"
          scrollable
        >
          <CModalHeader>
            <CModalTitle>
              {editingCourse ? `Edit Course: ${editingCourse.name}` : 'Add New Course'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
            <CourseForm
              course={editingCourse}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowModal(false);
                setEditingCourse(null);
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
            <p>Are you sure you want to delete this course?</p>
            <p className="text-muted">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete Course
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  );
};

export default Courses;