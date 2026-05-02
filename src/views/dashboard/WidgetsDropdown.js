// widgets/WidgetsDropdown.jsx
import React, { useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilBell, cilChartPie, cilPeople, cilDollar } from '@coreui/icons'

const WidgetsDropdown = ({ dashboardData }) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  useEffect(() => {
    document.dispatchEvent(new Event('toggle-chart'))
  }, [])

  const defaultDatasets = (color) => ({
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [
      {
        label: 'My First dataset',
        backgroundColor: 'transparent',
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color,
        data: [65, 59, 84, 84, 51, 55, 40],
        fill: false,
        borderWidth: 2,
      },
    ],
  })

  return (
    <CRow className="g-4">
      <CCol sm={12} lg={3}>
        <CCard className="text-white bg-primary">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="text-value-lg">{dashboardData?.users?.total?.toLocaleString() || 0}</div>
              <div>Total Users</div>
              <div className="mt-2">
                <small className="text-white-50">
                  +{dashboardData?.users?.newUsers?.today || 0} today
                </small>
              </div>
            </div>
            <CIcon icon={cilPeople} size="2xl" className="opacity-75" />
          </CCardBody>
          <div className="c-chart-wrapper mt-3 mx-3" style={{ height: '70px' }}>
            <CChartLine
              {...defaultDatasets('rgba(255,255,255,.55)')}
              data={{
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: '#fff',
                    data: [65, 59, 84, 84, 51, 55, 40],
                    fill: false,
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
                },
              }}
            />
          </div>
        </CCard>
      </CCol>

      <CCol sm={12} lg={3}>
        <CCard className="text-white bg-info">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="text-value-lg">${dashboardData?.revenue?.total?.toLocaleString() || 0}</div>
              <div>Total Revenue</div>
              <div className="mt-2">
                <small className="text-white-50">
                  +${dashboardData?.revenue?.today?.toLocaleString() || 0} today
                </small>
              </div>
            </div>
            <CIcon icon={cilDollar} size="2xl" className="opacity-75" />
          </CCardBody>
          <div className="c-chart-wrapper mt-3 mx-3" style={{ height: '70px' }}>
            <CChartLine
              {...defaultDatasets('rgba(255,255,255,.55)')}
              data={{
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: '#fff',
                    data: [45, 79, 64, 94, 31, 75, 50],
                    fill: false,
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
                },
              }}
            />
          </div>
        </CCard>
      </CCol>

      <CCol sm={12} lg={3}>
        <CCard className="text-white bg-warning">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="text-value-lg">{dashboardData?.applications?.total?.toLocaleString() || 0}</div>
              <div>Applications</div>
              <div className="mt-2">
                <small className="text-white-50">
                  +{dashboardData?.applications?.newApplications?.today || 0} today
                </small>
              </div>
            </div>
            <CIcon icon={cilChartPie} size="2xl" className="opacity-75" />
          </CCardBody>
          <div className="c-chart-wrapper mt-3 mx-3" style={{ height: '70px' }}>
            <CChartLine
              {...defaultDatasets('rgba(255,255,255,.55)')}
              data={{
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: '#fff',
                    data: [35, 49, 74, 64, 31, 65, 30],
                    fill: false,
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
                },
              }}
            />
          </div>
        </CCard>
      </CCol>

      <CCol sm={12} lg={3}>
        <CCard className="text-white bg-danger">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="text-value-lg">{dashboardData?.support?.open?.toLocaleString() || 0}</div>
              <div>Open Tickets</div>
              <div className="mt-2">
                <small className="text-white-50">
                  {dashboardData?.support?.pending || 0} pending
                </small>
              </div>
            </div>
            <CIcon icon={cilBell} size="2xl" className="opacity-75" />
          </CCardBody>
          <div className="c-chart-wrapper mt-3 mx-3" style={{ height: '70px' }}>
            <CChartLine
              {...defaultDatasets('rgba(255,255,255,.55)')}
              data={{
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: '#fff',
                    data: [25, 39, 54, 44, 21, 45, 20],
                    fill: false,
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { display: false },
                  y: { display: false, beginAtZero: true },
                },
              }}
            />
          </div>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default WidgetsDropdown