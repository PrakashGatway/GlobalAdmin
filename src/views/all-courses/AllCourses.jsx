"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import toast from "react-hot-toast";
import TinyEditor from "../page-information/Editor";
import CKEditorComponent from "../page-information/Ckeditor";
import { getApiBaseUrl } from "../../services/apiService";

// Mock data
const MOCK_COURSES = [
  {
    _id: "1",
    title: "MBA in International Business",
    slug: "mba-international-business",
    uniSlug: "aston-university",
    status: "published",
    level: "Postgraduate",
    tutionFees: "£22,500",
    duration: "1 Year",
    updatedAt: "2 hours ago",
  },
  {
    _id: "2",
    title: "BSc Computer Science",
    slug: "bsc-computer-science",
    uniSlug: "university-of-birmingham",
    status: "draft",
    level: "Undergraduate",
    tutionFees: "£19,800",
    duration: "3 Years",
    updatedAt: "1 day ago",
  },
];

export default function CourseManagement() {
  const [view, setView] = useState("list"); // 'list' or 'form'
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [courses, setCourses] = useState([]); // In-memory course list

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      coverImage: "",
      uniSlug: "",
      tutionFees: "",
      shortName: "",
      tags: [],
      status: "draft",
      level: "",
      duration: "",
      mode: "",
      details: [{ key: "", value: "" }],
      simillarCourses: { title: "", description: "" },
      ctaSection: { title: "", description: "" },
      seoInfo: { metaTitle: "", metaDescription: "", metaKeywords: "" },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  });


  const apiUrl = getApiBaseUrl();
  const exactApiUrl = `${apiUrl}/accommodation`;

  const onSubmit = async (data) => {
    try {
      const url = editingId
        ? `${exactApiUrl}/courses/${editingId}`  // Edit endpoint
        : `${exactApiUrl}/courses`;              // Create endpoint

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          // Add auth token if needed:
          // "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? 'update' : 'create'} course`);
      }

      const result = await response.json();
      setView("list");
      reset();
      setEditingId(null);

      toast.success(`Course ${editingId ? 'updated' : 'created'} successfully!`);
      // Optional: Show success toast/notification here

    } catch (error) {
      console.error("Error submitting form:", error);
      // Optional: Show error message to user
      alert(error.message || "Something went wrong!");
    }
  };


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${exactApiUrl}/courses`);
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchCourses();
  }, [])



  const handleEdit = async (id) => {
    try {
      const response = await fetch(`${exactApiUrl}/courses/${id}`);
      const result = await response.json();

      const course = result.data.course;

      setEditingId(course._id);

      reset(course);

      setActiveTab("basic");
      setView("form");
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    reset({
      title: "",
      description: "",
      slug: "",
      coverImage: "",
      uniSlug: "",
      tutionFees: "",
      shortName: "",
      tags: [],
      status: "draft",
      level: "",
      duration: "",
      mode: "",
      details: [{ key: "", value: "" }],
      simillarCourses: {
        title: "",
        description: "",
      },
      ctaSection: {
        title: "",
        description: "",
      },
      seoInfo: {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
      },
    });

    reset();
    setActiveTab("basic");
    setView("form");
  };

  const handleCancel = () => {
    setView("list");
    !reset();
    !setEditingId(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${exactApiUrl}/courses/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete course");
      }
      // Remove the deleted course from the list
      setCourses(courses.filter(course => course._id !== id));
      toast.success("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course.");
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Course Details" },
    { id: "sections", label: "Sections" },
    { id: "seo", label: "SEO" },
  ];

  // ==================== LIST VIEW ====================
  if (view === "list") {
    return (
      <div className="p-4">
        <CCard className="shadow-sm">
          <CCardHeader className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="m-0 fw-semibold text-dark">All Courses</h4>
              <small className="text-medium-emphasis">Manage and organize all university courses</small>
            </div>
            <CButton color="primary" onClick={handleCreateNew} className="px-4">
              <span className="me-2">+</span> Create New Course
            </CButton>
          </CCardHeader>
          <CCardBody className="p-0">
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead className="text-nowrap bg-light">
                <CTableRow>
                  <CTableHeaderCell className="text-center px-4 py-3 fw-semibold">Course Title</CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">University</CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">Level</CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">Status</CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 fw-semibold">Updated</CTableHeaderCell>
                  <CTableHeaderCell className="text-center px-4 py-3 fw-semibold">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {courses.map((course) => (
                  <CTableRow key={course._id} className="border-bottom">
                    <CTableDataCell className="px-4 py-3">
                      <div className="fw-semibold text-dark">{course.title}</div>
                      <small className="text-medium-emphasis d-block">{course.slug}</small>
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3 text-capitalize">
                      {course.uniSlug.replace(/-/g, " ")}
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3">{course.level}</CTableDataCell>
                    <CTableDataCell className="px-4 py-3">
                      <CBadge
                        color={course.status === "published" ? "success" : "warning"}
                        shape="rounded-pill"
                      >
                        {course.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3 text-medium-emphasis">
                      {course.updatedAt}
                    </CTableDataCell>
                    <CTableDataCell className="text-center px-4 py-3">
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(course._id)}
                      >
                        Edit
                      </CButton>
                      <CButton onClick={() => handleDelete(course._id)} color="danger" variant="outline" size="sm">
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </div>
    );
  }

  // ==================== FORM VIEW ====================
  return (
    <div className="p-4">
      <CCard className="shadow-sm">
        <CCardHeader className="bg-white border-bottom px-4 py-3">
          <h4 className="m-0 fw-semibold text-dark">
            {editingId ? "Edit Course" : "Create New Course"}
          </h4>
          <small className="text-medium-emphasis">
            {editingId ? "Update course information" : "Fill in the details to add a new course"}
          </small>
        </CCardHeader>

        {/* Tabs */}
        <div className="px-4 pt-3 border-bottom bg-light-subtle">
          <CNav variant="tabs">
            {tabs.map((tab) => (
              <CNavItem key={tab.id}>
                <CNavLink
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ cursor: "pointer" }}
                >
                  {tab.label}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>
        </div>

        <CCardBody className="p-4">
          <CForm onSubmit={handleSubmit(onSubmit)}>

            {/* BASIC INFO TAB */}
            {activeTab === "basic" && (
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel htmlFor="title" className="fw-semibold">
                    Course Title <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    id="title"
                    placeholder="e.g., MBA in International Business"
                    invalid={!!errors.title}
                    {...register("title", { required: true })}
                  />
                  {errors.title && <div className="invalid-feedback d-block">Title is required</div>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="shortName" className="fw-semibold">Short Name</CFormLabel>
                  <CFormInput
                    id="shortName"
                    placeholder="e.g., MBA IB"
                    {...register("shortName")}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="slug" className="fw-semibold">
                    URL Slug <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    id="slug"
                    placeholder="e.g., mba-international-business"
                    invalid={!!errors.slug}
                    {...register("slug", { required: true })}
                  />
                  {errors.slug && <div className="invalid-feedback d-block">Slug is required</div>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="uniSlug" className="fw-semibold">
                    University Slug <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    id="uniSlug"
                    placeholder="e.g., aston-university"
                    invalid={!!errors.uniSlug}
                    {...register("uniSlug", { required: true })}
                  />
                  {errors.uniSlug && <div className="invalid-feedback d-block">University slug is required</div>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="level" className="fw-semibold">
                    Level <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    id="level"
                    invalid={!!errors.level}
                    {...register("level", { required: true })}
                  >
                    <option value="">Select Level</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Diploma">Diploma</option>
                  </CFormSelect>
                  {errors.level && <div className="invalid-feedback d-block">Level is required</div>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="duration" className="fw-semibold">Duration</CFormLabel>
                  <CFormInput
                    id="duration"
                    placeholder="e.g., 1 Year Full-time"
                    {...register("duration")}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="mode" className="fw-semibold">Mode of Study</CFormLabel>
                  <CFormSelect id="mode" {...register("mode")}>
                    <option value="">Select Mode</option>
                    <option value="Full Time">Full time</option>
                    <option value="Part Time">Part time</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="tutionFees" className="fw-semibold">Tuition Fees</CFormLabel>
                  <CFormInput
                    id="tutionFees"
                    placeholder="e.g., £22,500"
                    {...register("tutionFees")}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="status" className="fw-semibold">
                    Status <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    id="status"
                    invalid={!!errors.status}
                    {...register("status", { required: true })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </CFormSelect>
                </CCol>

                <CCol xs={12}>
                  <CFormLabel htmlFor="coverImage" className="fw-semibold">Cover Image URL</CFormLabel>
                  <CFormInput
                    id="coverImage"
                    placeholder="https://example.com/image.jpg"
                    {...register("coverImage")}
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormLabel htmlFor="description" className="fw-semibold">
                    Description <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormTextarea
                    id="description"
                    rows={5}
                    placeholder="Enter detailed course description..."
                    invalid={!!errors.description}
                    {...register("description", { required: true })}
                  />
                  {errors.description && <div className="invalid-feedback d-block">Description is required</div>}
                </CCol>
              </CRow>
            )}

            {/* DETAILS TAB */}
            {activeTab === "details" && (
              <CRow>
                <CCol xs={12}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Course Details</h5>
                    <CButton color="primary" size="sm" onClick={() => append({ key: "", value: "" })}>
                      + Add Detail
                    </CButton>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="mb-4 p-3 bg-light rounded border">

                        <CFormInput
                          className="mb-3"
                          placeholder="Key (e.g., Start Date)"
                          {...register(`details.${index}.key`, { required: true })}
                        />

                        <CCol md={12}>
                          <input
                            type="hidden"
                            {...register(`details.${index}.value`, { required: true })}
                          />

                          <CCol md={12}>
                            <Controller
                              name={`details.${index}.value`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <CKEditorComponent
                                  value={field.value || ""}
                                  onChange={(value) => {
                                    field.onChange(value);
                                  }}
                                />
                              )}
                            />
                          </CCol>
                        </CCol>


                        <div className="mt-3 text-end">
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            Remove
                          </CButton>
                        </div>

                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-top">
                    <CFormLabel className="fw-semibold">Tags (comma separated)</CFormLabel>
                    <CFormInput
                      placeholder="business, management, international, leadership"
                      {...register("tags")}
                    />
                  </div>
                </CCol>
              </CRow>
            )}

            {/* SECTIONS TAB */}
            {activeTab === "sections" && (
              <CRow className="g-4">
                <CCol xs={12}>
                  <CCard className="border">
                    <CCardBody>
                      <h5 className="mb-3">Similar Courses Section</h5>
                      <CRow className="g-3">
                        <CCol xs={12}>
                          <CFormLabel>Title</CFormLabel>
                          <CFormInput
                            placeholder="Related Programs"
                            {...register("simillarCourses.title")}
                          />
                        </CCol>
                        <CCol xs={12}>
                          <CFormLabel>Description</CFormLabel>
                          <CFormTextarea
                            rows={3}
                            placeholder="Explore similar courses..."
                            {...register("simillarCourses.description")}
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12}>
                  <CCard className="border">
                    <CCardBody>
                      <h5 className="mb-3">Call to Action Section</h5>
                      <CRow className="g-3">
                        <CCol xs={12}>
                          <CFormLabel>Title</CFormLabel>
                          <CFormInput
                            placeholder="Apply Now"
                            {...register("ctaSection.title")}
                          />
                        </CCol>
                        <CCol xs={12}>
                          <CFormLabel>Description</CFormLabel>
                          <CFormTextarea
                            rows={3}
                            placeholder="Start your application today..."
                            {...register("ctaSection.description")}
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            )}

            {/* SEO TAB */}
            {activeTab === "seo" && (
              <CRow className="g-3">
                <CCol xs={12}>
                  <CFormLabel className="fw-semibold">Meta Title</CFormLabel>
                  <CFormInput
                    placeholder="MBA in International Business | Aston University"
                    {...register("seoInfo.metaTitle")}
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormLabel className="fw-semibold">Meta Description</CFormLabel>
                  <CFormTextarea
                    rows={4}
                    placeholder="Brief description for search engines..."
                    {...register("seoInfo.metaDescription")}
                  />
                </CCol>

                <CCol xs={12}>
                  <CFormLabel className="fw-semibold">Meta Keywords</CFormLabel>
                  <CFormInput
                    placeholder="mba, business, international, uk university"
                    {...register("seoInfo.metaKeywords")}
                  />
                </CCol>
              </CRow>
            )}

            {/* Form Actions */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
              <CButton color="secondary" variant="outline" onClick={handleCancel}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Course"}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
}