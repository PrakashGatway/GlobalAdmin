import React from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CRow,
  CCol
} from "@coreui/react";

const DocumentDetailModal = ({ visible, onClose, doc }) => {
  if (!doc) return null;

  let parsedExtra = [];

  try {
    parsedExtra =
      typeof doc.extra === "string"
        ? JSON.parse(doc.extra)
        : doc.extra || [];
  } catch (e) {
    parsedExtra = [];
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>{doc.name}</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {/* Basic Info */}
        <CRow className="mb-3">
          <CCol md={6}>
            <strong>Type:</strong>{" "}
            <CBadge color={doc.type === "ooshas" ? "primary" : "secondary"}>
              {doc.type}
            </CBadge>
          </CCol>

          <CCol md={6}>
            <strong>Status:</strong>{" "}
            <CBadge color="info">{doc.status}</CBadge>
          </CCol>
        </CRow>

        <div className="mb-3">
          <strong>Required:</strong>{" "}
          <CBadge color={doc.required === "required" ? "danger" : "secondary"}>
            {doc.required}
          </CBadge>
        </div>

        {/* Description */}
        {doc.description && (
          <div className="mb-3">
            <strong>Description:</strong>
            <div
              dangerouslySetInnerHTML={{ __html: doc.description }}
            />
          </div>
        )}

        {/* File Preview */}
        {doc.docUrl && doc.docType !== "form" && (
          <div className="mb-3">
            <strong>Document:</strong>
            <br />
            <a href={`http://localhost:5000${doc.docUrl}`} target="_blank">
              View File
            </a>
          </div>
        )}

        {/* FORM TYPE */}
        {doc.docType === "form" && (
          <div className="mt-3">
            <strong>Form Fields:</strong>

            {parsedExtra.length === 0 ? (
              <p>No fields</p>
            ) : (
              parsedExtra.map((field, index) => (
                <div key={index} className="border p-3 rounded mb-2">
                  <div><strong>Label:</strong> {field.label}</div>
                  <div><strong>Type:</strong> {field.type}</div>
                  <div>
                    <strong>Required:</strong>{" "}
                    {field.required ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Validation:</strong> {field.validation || "None"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Answer */}
        {doc.answer && (
          <div className="mt-3">
            <strong>User Answer:</strong>
            <p>{doc.answer}</p>
          </div>
        )}

        {/* Reject Reason */}
        {doc.rejectReason && (
          <div className="mt-3 text-danger">
            <strong>Reject Reason:</strong>
            <p>{doc.rejectReason}</p>
          </div>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default DocumentDetailModal;